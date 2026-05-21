const fs = require('fs');
const path = require('path');

const newAvatars = [
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
];

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

  const replaceUrl = (target, replacement) => {
    if (content.includes(target)) {
      content = content.split(target).join(replacement);
      modified = true;
    }
  };

  // Revert marcos.jpg
  replaceUrl("avatar: '/marcos.jpg'", "avatar: '" + newAvatars[0] + "'");
  replaceUrl("src=\"/marcos.jpg\"", "src=\"" + newAvatars[0] + "\"");

  // Revert loremflickr
  replaceUrl("https://loremflickr.com/200/200/fitness,girl?random=1", newAvatars[1]);
  replaceUrl("https://loremflickr.com/200/200/runner,man?random=2", newAvatars[2]);
  replaceUrl("https://loremflickr.com/200/200/fitness,woman?random=3", newAvatars[3]);
  replaceUrl("https://loremflickr.com/200/200/athlete,boy?random=4", newAvatars[4]);

  if (modified) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
