const fs = require('fs');
const path = require('path');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      // Primary dark background and elements
      content = content.replace(/#112E1A/gi, '#414A37');
      content = content.replace(/#4F633D/gi, '#414A37');
      // Light background / beige
      content = content.replace(/#FFFDF5/gi, '#DBC2A6');
      content = content.replace(/#E2DBD0/gi, '#DBC2A6');
      // Secondary muted accent (was soft green)
      content = content.replace(/#415A3E/gi, '#99744A');
      // Hover/active versions (if any with opacity or /40 etc, keep them but replace base colors)
      content = content.replace(/#112E1A\/\d+/gi, '#414A37');
      content = content.replace(/#4F633D\/\d+/gi, '#414A37');
      content = content.replace(/#FFFDF5\/\d+/gi, '#DBC2A6');
      content = content.replace(/#E2DBD0\/\d+/gi, '#DBC2A6');
      content = content.replace(/#415A3E\/\d+/gi, '#99744A');
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

walk('./src');
