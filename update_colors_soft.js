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
    
    // Replace old Phthalo Green with soft dark green
    content = content.replace(/103713/g, '112E1A');
    content = content.replace(/#103713/g, '#112E1A'); // Just in case
    
    // Replace old Maximum Green with soft sage green
    content = content.replace(/628b35/gi, '415A3E');
    content = content.replace(/#628b35/gi, '#415A3E');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
