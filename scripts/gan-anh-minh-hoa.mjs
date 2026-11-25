// Kiểm tra và sinh mã gắn tranh tình huống thực tế từ public/minh-hoa/cau/DANH-SACH-24-11.txt vào lib/anhMinhHoa.ts.
// Chạy từ code/web: node scripts/gan-anh-minh-hoa.mjs [--ghi]
import fs from 'node:fs';
import path from 'node:path';

const WEB_DIR = process.cwd();
const FILE_TS = path.join(WEB_DIR, 'lib', 'anhMinhHoa.ts');
const DIR_CAU = path.join(WEB_DIR, 'public', 'minh-hoa', 'cau');
const DIR_DE = path.join(WEB_DIR, 'public', 'chu-de', 'de');
const FILE_LIST = path.join(DIR_CAU, 'DANH-SACH-24-11.txt');
const ghi = process.argv.includes('--ghi');

const tsSrc = fs.readFileSync(FILE_TS, 'utf8');
const filesCau = new Set(
  fs.existsSync(DIR_CAU)
    ? fs.readdirSync(DIR_CAU).filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f)).map((f) => f.replace(/\.[^.]+$/, ''))
    : []
);
const filesDe = new Set(
  fs.existsSync(DIR_DE)
    ? fs.readdirSync(DIR_DE).filter((f) => /\.(webp|png|jpg|jpeg)$/i.test(f)).map((f) => f.replace(/\.[^.]+$/, ''))
    : []
);

const dungSlugs = new Set();
const thieuFile = [];
for (const m of tsSrc.matchAll(/\bA\(\s*'([^']+)'\s*,\s*'([^']*)'\s*\)/g)) {
  const slug = m[1];
  dungSlugs.add(slug);
  if (!filesCau.has(slug)) thieuFile.push(slug);
}

const daGanCau = new Set();
const khoiBang = tsSrc.match(/export const ANH_MINH_HOA[^=]*=\s*\{([\s\S]*?)\n\};/);
if (khoiBang) {
  for (const m of khoiBang[1].matchAll(/'([A-Z]\d+-[A-Za-z0-9-]+)'\s*:/g)) {
    daGanCau.add(m[1]);
  }
}

const fileChuaDung = [...filesCau].filter((s) => !dungSlugs.has(s));

console.log(`Kiểm tra lib/anhMinhHoa.ts: ${daGanCau.size} câu đã gắn, ${dungSlugs.size} slug dùng qua A(...), ${filesCau.size} file ảnh trong public/minh-hoa/cau/.`);
if (thieuFile.length > 0) {
  console.error('Thiếu file trong public/minh-hoa/cau/ cho slug:', thieuFile.join(', '));
  process.exit(1);
}
if (fileChuaDung.length > 0) {
  console.log('File ảnh hiện có chưa gắn vào anhMinhHoa.ts:', fileChuaDung.join(', '));
}

if (!fs.existsSync(FILE_LIST)) {
  console.log('Chưa có public/minh-hoa/cau/DANH-SACH-24-11.txt (Codex đang vẽ). Không có dòng mới để gắn.');
  process.exit(0);
}

const lines = fs.readFileSync(FILE_LIST, 'utf8').split(/\r?\n/);
const dongMoi = [];
const boQuaChuaCoFile = [];
const daCoTrongDe = [];

for (const raw of lines) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  const parts = line.split('|').map((s) => s.trim());
  if (parts.length < 3) continue;
  const [slugRaw, moTaRaw, maCauRaw] = parts;
  const slug = slugRaw.replace(/\.webp$/i, '').trim();
  const moTa = moTaRaw.replace(/'/g, "\\'");
  const ids = maCauRaw.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);

  if (ids.some((id) => /^\d+[abc]-\d+$/i.test(id))) {
    daCoTrongDe.push({ slug, ids, coFile: filesDe.has(slug) });
    continue;
  }

  if (!filesCau.has(slug)) {
    boQuaChuaCoFile.push({ slug, ids });
    continue;
  }

  const canThem = ids.filter((id) => !daGanCau.has(id));
  if (canThem.length > 0) {
    const snippet = canThem.map((id) => `'${id}': A('${slug}', '${moTa}')`).join(', ');
    dongMoi.push(`  ${snippet},`);
  }
}

if (boQuaChuaCoFile.length) {
  console.log('Bỏ qua các mục chưa có file .webp thật:', boQuaChuaCoFile.map((x) => `${x.slug} (${x.ids.join(',')})`).join('; '));
}
if (daCoTrongDe.length) {
  console.log('Tranh đề Ôn thi 10 (chu-de/de):', daCoTrongDe.map((x) => `${x.slug} [${x.coFile ? 'đã có file' : 'chưa có file'}]`).join('; '));
}

if (dongMoi.length === 0) {
  console.log('Không có dòng mới cần thêm vào lib/anhMinhHoa.ts.');
  process.exit(0);
}

console.log('Các dòng cần thêm vào ANH_MINH_HOA:');
for (const d of dongMoi) console.log(d);

if (ghi) {
  const updated = tsSrc.replace(
    /(export const ANH_MINH_HOA[^=]*=\s*\{[\s\S]*?)(\n\};)/,
    `$1\n  // Bổ sung từ DANH-SACH-24-11.txt\n${dongMoi.join('\n')}$2`
  );
  fs.writeFileSync(FILE_TS, updated, 'utf8');
  console.log(`Đã ghi ${dongMoi.length} dòng mới vào lib/anhMinhHoa.ts.`);
}
