const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Primary green replacements
    content = content.replace(/\[#2E8B57\]/g, '[#103713]');
    // Hover green replacements
    content = content.replace(/\[#257046\]/g, '[#628B35]');
    
    // Background replacements
    content = content.replace(/bg-white/g, 'bg-[#FFFDF5]');
    content = content.replace(/bg-slate-50/g, 'bg-[#E2DBD0]');
    content = content.replace(/bg-slate-100/g, 'bg-[#E2DBD0]/60');
    
    // Border replacements
    content = content.replace(/border-slate-200/g, 'border-[#E2DBD0]');
    content = content.replace(/border-slate-100/g, 'border-[#E2DBD0]/50');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
