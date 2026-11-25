const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const web = path.join(__dirname, '..');
const bundled = esbuild.buildSync({
  absWorkingDir: web,
  stdin: {
    resolveDir: web, loader: 'tsx', sourcefile: 'xem-canh-3d.tsx',
    contents: `
      import { renderToStaticMarkup } from 'react-dom/server';
      import { CanhMinhHoa } from './components/canh/CanhMinhHoa';
      import { layDiem } from './components/HanhTrinh/diem';
      export { DANH_SACH, layHanhTrinh } from './lib/hanhTrinh';
      export { ANH_MINH_HOA } from './lib/anhMinhHoa';
      export { layDiem };
      export const render = (id, dem) => renderToStaticMarkup(<CanhMinhHoa id={id}/>, { identifierPrefix: 'preview' + dem });
    `,
  },
  bundle: true, write: false, platform: 'node', format: 'cjs',
  jsx: 'automatic', packages: 'external', loader: { '.css': 'empty' },
}).outputFiles[0].text;

const compiled = { exports: {} };
new Function('module', 'exports', 'require', bundled)(compiled, compiled.exports, require);
const { DANH_SACH, layHanhTrinh, ANH_MINH_HOA, layDiem, render } = compiled.exports;
const sceneAssets = new Map();
const assets = new Map();

function esc(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const qa = process.argv[2];
const thuMucQA = qa && path.resolve(qa);
if (thuMucQA) fs.mkdirSync(thuMucQA, { recursive: true });

const resvg = process.env.FLIPMATH_SVG_RENDERER
  ? require(process.env.FLIPMATH_SVG_RENDERER).Resvg : undefined;
const the = DANH_SACH.map((id, i) => {
  const { duKien, stem } = layHanhTrinh(id);
  const anh = ANH_MINH_HOA[id];
  const tenCanh = anh.anh ?? anh.ve;
  const diem = layDiem(id).slice(0, duKien.length);
  assert.equal(diem.length, duKien.length, id + ' thiếu chấm');
  diem.forEach(([x, y], j) => {
    assert.ok(x > 4 && x < 96 && y > 6 && y < 94, id + ' chấm sát mép');
    for (const [a, b] of diem.slice(0, j)) {
      assert.ok(Math.hypot((x - a) * 7.68, (y - b) * 5.12) >= 64, id + ' chấm quá gần nhau');
    }
  });
  const svg = render(id, i);
  assert.match(svg, /viewBox="0 0 768 512"/);
  for (const [, nhan] of svg.matchAll(/<text\b[^>]*>(.*?)<\/text>/g)) {
    assert.match(nhan, /^[ABO]$/);
    assert.match(stem, new RegExp('\\b' + nhan + '\\b'), id + ' nhãn không xuất hiện trong đề');
  }
  const src = /href="\/fluent\/([^"]+)\.png"/g;
  const items = sceneAssets.get(tenCanh) ?? new Set();
  for (const [, name] of svg.matchAll(src)) {
    if (!assets.has(name)) {
      const bytes = fs.readFileSync(path.join(web, 'public/fluent', name + '.png'));
      assert.equal(bytes.readUInt32BE(16), 256, name);
      assert.equal(bytes.readUInt32BE(20), 256, name);
      assets.set(name, bytes);
    }
    items.add(name);
  }
  assert.ok(items.size, id + ' thiếu tài nguyên Fluent');
  sceneAssets.set(tenCanh, items);

  if (resvg && thuMucQA) {
    const pin = diem.map(([x, y], j) =>
      `<circle cx="${x * 7.68}" cy="${y * 5.12}" r="17" fill="#2747a8" stroke="white" stroke-width="3"/><text x="${x * 7.68}" y="${y * 5.12 + 6}" text-anchor="middle" fill="white" font-size="18" font-family="Arial" font-weight="700">${j+1}</text>`).join('');
    const forRender = svg.replace(src, (_, name) => 'href="data:image/png;base64,' + assets.get(name).toString('base64') + '"').replace('</svg>', pin + '</svg>');
    fs.writeFileSync(path.join(thuMucQA, id + '.png'), new resvg(forRender).render().asPng());
  }

  return `<article id="${id}"><h2>${esc(anh.mo)}</h2><p class="ma">${id} · ${esc(tenCanh)}</p>
    <div class="tranh">${svg.replaceAll('href="/fluent/', 'href="../public/fluent/')}
    ${diem.map(([x,y], j) => `<button class="cham" type="button" style="left:${x}%;top:${y}%" aria-label="${esc(duKien[j])}" title="${esc(duKien[j])}">${j+1}</button>`).join('')}</div>
    <details><summary>Đề và thứ tự dữ kiện</summary><p>${esc(stem)}</p><ol>${duKien.map(dk => '<li>' + esc(dk) + '</li>').join('')}</ol></details></article>`;
});

const css = fs.readFileSync(path.join(web, 'components/canh/canh.css'), 'utf8');
const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>FlipMath9 · Thư viện tranh Fluent Emoji 3D</title><style>${css}
*{box-sizing:border-box}body{margin:0;background:#edf4fc;color:#1d3555;font-family:system-ui,sans-serif}
header{position:sticky;top:0;background:#fff;z-index:2;padding:10px max(16px,calc((100vw - 1350px)/2));box-shadow:0 2px 12px #19395b1a}
h1{font-size:1.35rem;margin:0 0 7px}header nav{display:flex;flex-wrap:wrap;gap:14px;margin-top:7px}
main{max-width:1350px;margin:auto;padding:12px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:12px}
article{min-width:0;background:white;border-radius:12px;padding:9px;box-shadow:0 2px 8px #30406216;scroll-margin-top:115px}
section{scroll-margin-top:115px}h2{font-size:1rem;margin:0 0 4px}.ma{font-size:.75rem;color:#506381;margin:0 0 6px}
.tranh{position:relative;container-type:inline-size;overflow:hidden;border-radius:9px}.cham{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;width:clamp(20px,8cqw,34px);height:clamp(20px,8cqw,34px);padding:0;border:2px solid white;border-radius:50%;background:#2747a8;color:white;font-weight:700;cursor:help;box-shadow:0 2px 7px #0004}
body:has(#tat-cham:checked) .cham{display:none}body:has(#dung:checked) .canh-svg *{animation-play-state:paused!important}
details{margin-top:7px;font-size:.85rem}summary{cursor:pointer}a{color:#2747a8}
</style><header><h1>FlipMath9 · Thư viện tranh Fluent Emoji 3D</h1>
<label><input id="tat-cham" type="checkbox"> Ẩn chấm dữ kiện</label> &nbsp;
<label><input id="dung" type="checkbox"> Dừng chuyển động</label>
<nav aria-label="Chương">${[1,2,3,4,5].map(n => '<a href="#c'+n+'">Chương '+n+'</a>').join('')}</nav></header><main>
${[1,2,3,4,5].map(n => '<section id="c'+n+'"><h2>Chương '+n+'</h2><div class="grid">' + the.filter((_,i) => DANH_SACH[i].startsWith('C'+n+'-')).join('') + '</div></section>').join('')}
</main></html>`;
fs.writeFileSync(path.join(web, '_mau/xem-canh-3d.html'), html);
if (thuMucQA) {
  fs.writeFileSync(path.join(thuMucQA, 'emoji-theo-canh.json'), JSON.stringify(Object.fromEntries(Array.from(sceneAssets, ([ten, files]) => [ten, [...files].sort()])), null, 2));
}
console.log(`${sceneAssets.size} cảnh · ${the.length} câu · ${assets.size} emoji`);

