const fs = require('fs');
const path = require('path');

const replacements = {
  'https://images.unsplash.com/photo-1526506114805-4e2058c45b91': 'https://loremflickr.com/200/200/fitness,girl?random=1',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48': 'https://loremflickr.com/200/200/runner,man?random=2',
  'https://images.unsplash.com/photo-1507398941214-a9568d4072b2': 'https://loremflickr.com/200/200/fitness,woman?random=3',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b': 'https://loremflickr.com/200/200/athlete,boy?random=4'
};

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

  Object.keys(replacements).forEach(oldUrl => {
    // Replace the URL with query params
    const regex = new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?[^"\']*', 'g');
    if (regex.test(content)) {
      content = content.replace(regex, replacements[oldUrl]);
      modified = true;
    }
    // Replace without query params
    if (content.includes(oldUrl)) {
      content = content.split(oldUrl).join(replacements[oldUrl]);
      modified = true;
    }
  });

  // Fix /marcos.jpg query params
  const marcosRegex = /\/marcos\.jpg\?[^"']+/g;
  if (marcosRegex.test(content)) {
    content = content.replace(marcosRegex, '/marcos.jpg');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
