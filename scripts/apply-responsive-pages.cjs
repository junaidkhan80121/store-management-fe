const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name.endsWith('.tsx')) files.push(p);
  }
  return files;
}

const pagesDir = path.join('src', 'pages');
const files = walk(pagesDir).filter((f) => fs.readFileSync(f, 'utf8').includes('maxWidth: 1440'));

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  const rel = path.relative(pagesDir, path.dirname(file));
  const depth = rel === '' ? 0 : rel.split(path.sep).length;
  const importPath = '../'.repeat(depth + 1) + 'constants/responsive';
  const importLine = `import { pageContainerSx, pageHeaderSx, pageTitleSx } from '${importPath}';\n`;

  if (!c.includes('constants/responsive')) {
    const lastImport = c.lastIndexOf('\nimport ');
    if (lastImport !== -1) {
      const end = c.indexOf('\n', lastImport + 1);
      c = c.slice(0, end + 1) + importLine + c.slice(end + 1);
    } else {
      c = importLine + c;
    }
  }

  c = c.replace(/<Box sx=\{\{ maxWidth: 1440, mx: 'auto', pt: 2, pb: 4 \}\}>/g, '<Box sx={pageContainerSx}>');
  c = c.replace(
    /<Box sx=\{\{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' \}\}>/g,
    '<Box sx={pageHeaderSx}>'
  );
  c = c.replace(
    /<Box sx=\{\{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' \}\}>/g,
    '<Box sx={pageHeaderSx}>'
  );
  c = c.replace(
    /<Box sx=\{\{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' \}\}>/g,
    '<Box sx={pageHeaderSx}>'
  );
  c = c.replace(/<Typography variant="h4" sx=\{\{ fontWeight: 700 \}\}>/g, '<Typography sx={pageTitleSx}>');
  c = c.replace(/<Typography variant="h4" sx=\{\{ fontWeight: '700' \}\}>/g, '<Typography sx={pageTitleSx}>');

  fs.writeFileSync(file, c);
  console.log('updated', file);
}
