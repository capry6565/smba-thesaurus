const fs = require('fs');
const path = require('path');

const TERMS_DIR = path.join(__dirname, '..', 'terms');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'termsRelationships.json');

// Relationship types we want to extract
const RELATIONSHIP_PATTERNS = {
  'narrower': /skos:narrower\s+<https:\/\/usmba\.ai\/([^>]+)>/g,
  'broader': /skos:broader\s+<https:\/\/usmba\.ai\/([^>]+)>/g,
  'related': /skos:related\s+<https:\/\/usmba\.ai\/([^>]+)>/g,
  'isPartOf': /dct:isPartOf\s+<https:\/\/usmba\.ai\/([^>]+)>/g
};

function extractRelationships() {
  const relationships = [];

  // Read all TTL files
  const files = fs.readdirSync(TERMS_DIR).filter(f => f.endsWith('.ttl'));

  files.forEach(file => {
    const filePath = path.join(TERMS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract the term ID from filename
    const sourceTermId = file.replace('.ttl', '');

    // Extract each relationship type
    Object.entries(RELATIONSHIP_PATTERNS).forEach(([relType, pattern]) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const targetTermId = match[1];

        relationships.push({
          from: sourceTermId,
          to: targetTermId,
          type: relType
        });
      }
    });
  });

  // Write to JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(relationships, null, 2), 'utf-8');
  console.log(`Extracted ${relationships.length} relationships to ${OUTPUT_FILE}`);
}

extractRelationships();
