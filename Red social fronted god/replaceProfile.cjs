const fs = require('fs');
const path = require('path');
const oldAvatar = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438';
const newAvatar = '/marcos.jpg';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  if (content.includes(oldAvatar)) {
    content = content.split(oldAvatar).join(newAvatar);
    modified = true;
  }
  if (content.includes('>Juan<')) {
    content = content.replace(/>Juan</g, '>Marcos<');
    modified = true;
  }
  if (content.includes('alt="Juan"')) {
    content = content.replace(/alt="Juan"/g, 'alt="Marcos"');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
