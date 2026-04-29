const fs = require('fs');
const path = require('path');

// Define color mappings
const mappings = [
  // Dark primary -> #414A37
  {old: /#112E1A/gi, new: '#414A37'},
  {old: /#4F633D/gi, new: '#414A37'},
  {old: /#103713/gi, new: '#414A37'},
  {old: /#112e1a/gi, new: '#414A37'},
  // Accent medium -> #99744A
  {old: /#628B35/gi, new: '#99744A'},
  {old: /#415A3E/gi, new: '#99744A'},
  {old: /#415a3e/gi, new: '#99744A'},
  {old: /#628b35/gi, new: '#99744A'},
  // Light background/beige -> #DBC2A6
  {old: /#FFFDF5/gi, new: '#DBC2A6'},
  {old: /#fffdf5/gi, new: '#DBC2A6'},
  {old: /#E2DBD0/gi, new: '#DBC2A6'},
  {old: /#e2dbd0/gi, new: '#DBC2A6'},
  // Replace any remaining occurrences of old light border colors
  {old: /#E2DBD0\/40/gi, new: '#DBC2A6/40'},
  {old: /#E2DBD0\/30/gi, new: '#DBC2A6/30'},
  {old: /#E2DBD0\/50/gi, new: '#DBC2A6/50'},
];

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      for (const map of mappings) {
        content = content.replace(map.old, map.new);
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  });
}

walk('./src');
