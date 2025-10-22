import * as $rdf from 'rdflib';

export default function parseRdf(ttlText) {
  const store = $rdf.graph();
  
  try {
    $rdf.parse(ttlText, store, 'http://example.org/', 'text/turtle');
  } catch (error) {
    console.error('RDF parsing error:', error);
    return { triples: [], nodes: [], edges: [] };
  }

  // 1. Получаем триплеты для таблицы
  const triples = store.statements.map(t => ({
    subject: cleanUri(t.subject.value),
    predicate: cleanUri(t.predicate.value),
    object: cleanUri(t.object.value)
  }));

  // 2. Строим граф: nodes и edges
  const nodeMap = new Map();
  const edges = [];

  for (const statement of store.statements) {
    const subjectUri = statement.subject.value;
    const predicateUri = statement.predicate.value;
    const objectValue = statement.object.value;

    // Добавляем subject как узел
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

    // Если object это URI (не литерал), добавляем как узел и создаём связь
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

      // Создаём связь (edge)
      edges.push({
        from: subjectUri,
        to: objectValue,
        label: getLabel(predicateUri),
        title: predicateUri,
        arrows: 'to'
      });
    } else {
      // Если object это литерал (текст), можем добавить как отдельный узел для визуализации
      // (опционально, для простых тезаурусов можно пропустить)
      
      // Но для skos:prefLabel и skos:definition можем показать в tooltip
      if (predicateUri.includes('prefLabel') || predicateUri.includes('label')) {
        const node = nodeMap.get(subjectUri);
        if (node) {
          node.label = objectValue.replace(/@\w+$/, ''); // Убираем языковые теги
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

// Вспомогательные функции
function cleanUri(uri) {
  // Убираем префиксы для читаемости
  return uri
    .replace('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf:')
    .replace('http://www.w3.org/2004/02/skos/core#', 'skos:')
    .replace('http://example.org/', ':');
}

function getLabel(uri) {
  // Извлекаем последнюю часть URI как метку
  const parts = uri.split(/[/#:]/);
  return parts[parts.length - 1] || uri;
}