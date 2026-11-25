// KIỂM TRA "CHỈ THÊM CHÚ THÍCH, KHÔNG ĐỔI CODE"
// Cách dùng (trong thư mục code/web):
//   node scripts/kiem-tra-chi-them-chu-thich.cjs <thư mục sao lưu bản gốc>
//   ví dụ: node scripts/kiem-tra-chi-them-chu-thich.cjs ../_sao-luu-antigravity-chu-thich/web
// Với mỗi file .ts/.tsx/.js/.mjs có trong thư mục sao lưu: biên dịch cả bản gốc và bản hiện tại
// với removeComments = true rồi so sánh. Nếu chỉ thêm/sửa chú thích thì hai kết quả GIỐNG HỆT.
// Thoát mã 1 nếu có file khác code (in tên file và dòng đầu tiên khác).
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const goc = process.argv[2];
if (!goc || !fs.existsSync(goc)) {
  console.error('Thiếu hoặc sai thư mục sao lưu. Ví dụ: node scripts/kiem-tra-chi-them-chu-thich.cjs ../_sao-luu-antigravity-chu-thich/web');
  process.exit(2);
}

function boChuThich(code, file) {
  const out = ts.transpileModule(code, {
    fileName: file,
    compilerOptions: { removeComments: true, target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.Preserve, allowJs: true }
  }).outputText;
  // bỏ dòng trống và khoảng trắng cuối dòng để chỉ so phần code
  return out.split('\n').map((d) => d.replace(/\s+$/, '')).filter((d) => d.trim() !== '');
}

function duyet(dir, ds = []) {
  for (const t of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, t.name);
    if (t.isDirectory()) duyet(p, ds);
    else if (/\.(tsx?|m?js|cjs)$/.test(t.name)) ds.push(p);
  }
  return ds;
}

let loi = 0, dat = 0;
for (const fGoc of duyet(goc)) {
  const rel = path.relative(goc, fGoc);
  const fMoi = path.join(process.cwd(), rel);
  if (!fs.existsSync(fMoi)) { console.log('❌ MẤT FILE: ' + rel); loi++; continue; }
  const a = boChuThich(fs.readFileSync(fGoc, 'utf8'), rel);
  const b = boChuThich(fs.readFileSync(fMoi, 'utf8'), rel);
  const n = Math.max(a.length, b.length);
  let khac = -1;
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) { khac = i; break; }
  if (khac >= 0) {
    loi++;
    console.log('❌ ĐỔI CODE: ' + rel);
    console.log('   gốc : ' + (a[khac] ?? '(hết file)').slice(0, 160));
    console.log('   mới : ' + (b[khac] ?? '(hết file)').slice(0, 160));
  } else dat++;
}
console.log(`\n${dat} file chỉ đổi chú thích · ${loi} file có thay đổi code`);
process.exit(loi ? 1 : 0);
