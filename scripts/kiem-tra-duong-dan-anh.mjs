/**
 * FILE NÀY LÀM GÌ: Quét toàn bộ mã nguồn app/, components/, lib/ để kiểm tra các đường dẫn ảnh tĩnh có tồn tại thật trong public/.
 * AI DÙNG: dùng chung (script kiểm thử dòng lệnh)
 * LẤY DỮ LIỆU TỪ: tệp mã nguồn app/, components/, lib/ và thư mục public/
 * GỌI TỚI: node:fs, node:path
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'components', 'lib'];
const PUBLIC_DIR = 'public';
const CHO_PHEP_THIEU = new Set(['/do-chieu-cao/vat-cau-rong.webp']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.next') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx)$/.test(ent.name)) out.push(p);
  }
  return out;
}

const staticMap = new Map();
const dynamicList = [];

const staticRe = /['"`](\/[A-Za-z0-9_\-\/.]+?\.(?:webp|png|jpg|jpeg|svg))['"`]/g;
const dynRe = /`(\/[^`\r\n]*?\$\{[^`\r\n]*?\.(?:webp|png|jpg|jpeg|svg))`/g;

for (const r of ROOTS) {
  for (const f of walk(r)) {
    const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      for (const m of l.matchAll(staticRe)) {
        const url = m[1];
        if (url.includes('${')) continue;
        const arr = staticMap.get(url) ?? [];
        arr.push(`${f.replace(/\\/g, '/')}:${i + 1}`);
        staticMap.set(url, arr);
      }
      for (const m of l.matchAll(dynRe)) {
        dynamicList.push(`${f.replace(/\\/g, '/')}:${i + 1} -> ${m[1]}`);
      }
    }
  }
}

const missingAll = [];
const missingUnexpected = [];
for (const [url, refs] of Array.from(staticMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
  const disk = path.join(PUBLIC_DIR, url.slice(1));
  const ok = fs.existsSync(disk) && fs.statSync(disk).size > 0;
  if (!ok) {
    missingAll.push({ url, refs });
    if (!CHO_PHEP_THIEU.has(url)) missingUnexpected.push({ url, refs });
  }
}

console.log(`Tổng đường dẫn ảnh tĩnh duy nhất: ${staticMap.size}`);
console.log(`Số đường dẫn thiếu / rỗng trong public/: ${missingAll.length}`);
for (const m of missingAll) {
  console.log(`  - ${m.url} (${m.refs.join(', ')})`);
}
console.log(`Danh sách mẫu đường dẫn động (${dynamicList.length}):`);
for (const d of dynamicList) {
  console.log(`  * ${d}`);
}

if (missingUnexpected.length > 0) {
  console.error(`THẤT BẠI: Còn ${missingUnexpected.length} đường dẫn thiếu ngoài danh sách cho phép.`);
  process.exit(1);
}
console.log('ĐẠT: Không còn đường dẫn ảnh tĩnh bị thiếu ngoài /do-chieu-cao/vat-cau-rong.webp.');
