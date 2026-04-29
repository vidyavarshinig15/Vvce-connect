const fs = require('fs');
const path = require('path');

const mappings = [
  // Dark primary => #414A37
  {old: /#112E1A/gi, new: '#414A37'},
  {old: /#4F633D/gi, new: '#414A37'},
  {old: /#103713/gi, new: '#414A37'},
  // Accent => #99744A
  {old: /#628B35/gi, new: '#99744A'},
  {old: /#415A3E/gi, new: '#99744A'},
  // Light background => #DBC2A6
  {old: /#FFFDF5/gi, new: '#DBC2A6'},
  {old: /#E2DBD0/gi, new: '#DBC2A6'},
];

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
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
