const fs = require('fs');
const path = require('path');

const mappings = [
  // Primary
  {old: /#414A37/gi, new: '#727657'},
  // Secondary
  {old: /#99744A/gi, new: '#94A185'},
  // Background
  {old: /#DBC2A6/gi, new: '#FAF9F6'},
];

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walk(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      mappings.forEach(map => {
        content = content.replace(map.old, map.new);
      });
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  });
}

walk('./src');
