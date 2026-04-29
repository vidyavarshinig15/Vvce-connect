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
    
    // Replace text-white with text-[#FFFDF5]
    content = content.replace(/text-white/g, 'text-[#FFFDF5]');
    
    // Check if there are other green variants like green-50, green-100, emerald-50
    content = content.replace(/bg-emerald-50/g, 'bg-[#E2DBD0]/40');
    content = content.replace(/text-emerald-700/g, 'text-[#103713]');
    
    // Let's also check for any inline styles if necessary, but tailwind is mostly used

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
