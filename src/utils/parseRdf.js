import * as $rdf from 'rdflib';

export default function parseRdf(ttlText) {
  const store = $rdf.graph();
  
  try {
    $rdf.parse(ttlText, store, 'http://example.org/', 'text/turtle');
  } catch (error) {
    console.error('RDF parsing error:', error);
    return { triples: [], nodes: [], edges: [] };
  }

  // Предикаты которые НЕ показываем на графе
  const hiddenPredicates = [
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    'http://www.w3.org/2004/02/skos/core#inScheme',
    'http://www.w3.org/2004/02/skos/core#topConceptOf'
  ];

  const triples = store.statements.map(t => ({
    subject: cleanUri(t.subject.value),
    predicate: cleanUri(t.predicate.value),
    object: cleanUri(t.object.value)
  }));

  const nodeMap = new Map();
  const edges = [];

  for (const statement of store.statements) {
    const subjectUri = statement.subject.value;
    const predicateUri = statement.predicate.value;
    const objectValue = statement.object.value;

    // Пропускаем технические предикаты
    if (hiddenPredicates.includes(predicateUri)) {
      continue;
    }

    if (!nodeMap.has(subjectUri)) {
      nodeMap.set(subjectUri, {
        id: subjectUri,
        label: getLabel(subjectUri),
        title: subjectUri,
        shape: 'box',
        color: {
          border: '#2B7CE9',
          background: '#D2E5FF'
        }
      });
    }

    if (statement.object.termType === 'NamedNode') {
      if (!nodeMap.has(objectValue)) {
        nodeMap.set(objectValue, {
          id: objectValue,
          label: getLabel(objectValue),
          title: objectValue,
          shape: 'ellipse',
          color: {
            border: '#FFA500',
            background: '#FFE5B4'
          }
        });
      }

      edges.push({
        from: subjectUri,
        to: objectValue,
        label: cleanUri(predicateUri),
        title: predicateUri,
        arrows: 'to',
        font: { 
          size: 12, 
          align: 'middle',
          color: '#666',
          strokeWidth: 0
        }
      });
    } else {
      if (predicateUri.includes('prefLabel') || predicateUri.includes('label')) {
        const node = nodeMap.get(subjectUri);
        if (node) {
          node.label = objectValue.replace(/@\w+$/, '');
        }
      }
    }
  }

  const nodes = Array.from(nodeMap.values());

  console.log('✅ RDF parsed:', { 
    triples: triples.length, 
    nodes: nodes.length, 
    edges: edges.length 
  });

  return { triples, nodes, edges };
}

function cleanUri(uri) {
  return uri
    .replace('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf:')
    .replace('http://www.w3.org/2004/02/skos/core#', 'skos:')
    .replace('http://purl.org/dc/terms/', 'dct:')
    .replace('http://example.org/', ':')
    .replace('https://usmba.ai/', ':');
}

function getLabel(uri) {
  const parts = uri.split(/[/#:]/);
  return parts[parts.length - 1] || uri;
}