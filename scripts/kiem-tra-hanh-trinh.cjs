const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Nạp nguồn TypeScript của ứng dụng để kiểm tra đúng dữ liệu đang hiển thị.
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  module._compile(outputText, filename);
};

const { ANH_MINH_HOA } = require('../lib/anhMinhHoa.ts');
const { DANH_SACH, MAU, layHanhTrinh } = require('../lib/hanhTrinh/index.ts');
const { ketQuaGiai } = require('../lib/hanhTrinh/giai.ts');

const eq = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, a + ' ≠ ' + b);
const rad = Math.PI / 180;
const fix = (n, d) => n.toFixed(d).replace('.', ',');
const nghiem = ([a, b, c], [d, e, f]) => {
  // Rút một ẩn từ phương trình đầu và thế vào phương trình sau.
  const y = (f - d * c / a) / (e - d * b / a);
  const x = (c - b * y) / a;
  eq(a * x + b * y, c);
  eq(d * x + e * y, f);
  assert.ok(x > 0 && y > 0);
  return [x, y];
};
const nganSach = (tien, gia) => {
  const so = Math.floor(tien / gia);
  assert.ok(so * gia <= tien && (so + 1) * gia > tien);
  return so;
};

const [giaVo, giaBut] = nghiem([3, 2, 34000], [2, 3, 31000]);
const [giaTao, giaCam] = nghiem([2, 3, 170000], [3, 2, 180000]);
const [dai, rong] = nghiem([2, 2, 34], [1, -1, 7]);
const [dai2, rong2] = nghiem([2, 2, 46], [1, -1, 3 + 2]);
eq(dai2 - 2, rong2 + 3);
const [vA] = nghiem([2, 2, 180], [1, -1, 10]);
const [, v2] = nghiem([1.5, 1.5, 150], [1, -1, 10]);
const ab = 3 * 15 * 12 / (15 + 12);
eq(ab / 15 + ab / 12, 3);
const [u, v] = nghiem([1, 1, 1 / 6], [2, 3, 2 / 5]);
eq(2 / (1 / u) + 3 / (1 / v), 2 / 5);
const tHaiVoi = 2 + 24 / 60;
const tVoiI = (14 + Math.sqrt(14 ** 2 + 4 * 5 * 24)) / 10;
eq(1 / tVoiI + 1 / (tVoiI + 2), 1 / tHaiVoi);
assert.ok(tVoiI > 0);
const xVuon = (Math.sqrt(169) - 3) / 2;
eq(xVuon * (xVuon + 3), 40);
const tanXa = Math.tan(30 * rad);
const thap = 20 / (1 / tanXa - 1);
eq(thap / (thap + 20), tanXa);
eq(giaVo + giaBut, 13000);
eq(giaTao - giaCam, 10000);

const bang = {
  'C1-B1-M1-Q07': () => {
    eq(8000 * 2 + 5000 * 5, 41000);
    return '8 000x + 5 000y = 41 000';
  },
  'C1-B1-M1-Q16': () => {
    const q = layHanhTrinh('C1-B1-M1-Q16');
    const khop = q.phuongAn.filter(pa => {
      const [lon, tre] = pa.match(/\d+/g).map(Number);
      return 50000 * lon + 30000 * tre === 260000;
    });
    assert.deepEqual(khop, ['(4; 2)']);
    return khop[0];
  },
  'C1-B3-M1-Q04': () => '{ 3x + 2y = 34 000; 2x + 3y = 31 000 }',
  'C1-B3-M1-Q05': () => (giaVo / 1000) + ' 000 đồng',
  'C1-B3-M1-Q06': () => '{ x + y = ' + (dai + rong) + '; x − y = ' + (dai - rong) + ' }',
  'C1-B3-M1-Q07': () => dai * rong + ' m²',
  'C1-B3-M1-Q16': () => dai2 * rong2 + ' m²',
  'C1-B3-M1-Q10': () => 'x ∈ ℕ',
  'C1-B3-M1-Q13': () => '{ 2x + 3y = 170 000; 3x + 2y = 180 000 }',
  'C1-B3-M1-Q14': () => (giaTao / 1000) + ' 000 đồng',
  'C1-B3-M1B-Q01': () => 's = v · t',
  'C1-B3-M1B-Q10': () => 120 / 40 + ' giờ',
  'C1-B3-M1B-Q03': () => {
    eq(2 * 50 + 2 * 40, 180);
    return '2x + 2y = 180';
  },
  'C1-B3-M1B-Q05': () => vA + ' km/h',
  'C1-B3-M1B-Q11': () => 150 / 1.5 + ' km/h',
  'C1-B3-M1B-Q13': () => {
    eq(3 * 60 + 2 * 40, 260);
    return '3x + 2y = 260';
  },
  'C1-B3-M1B-Q14': () => v2 + ' km/h',
  'C1-B3-M1B-Q06': () => 'x/15 + x/12 = 3',
  'C1-B3-M1B-Q07': () => ab + ' km',
  'C1-B3-M1C-Q02': () => Math.round(12 / 4 + 12 / 6) + '/12 bể',
  'C1-B3-M1C-Q03': () => fix(4 * 6 / (4 + 6), 1) + ' giờ',
  'C1-B3-M1C-Q08': () => '1/x + 1/(x + 2) = ' + Math.round(12 / tHaiVoi) + '/12',
  'C1-B3-M1C-Q14': () => '{ 1/x + 1/y = 1/6; 2/x + 3/y = 2/5 }',
  'C1-B3-M1C-Q15': () => Math.round(1 / u) + ' giờ',
  'C1-B3-M1C-Q09': () => 2 + '/' + 5 + ' bể',
  'C2-B4-M1-Q08': () => 'x(x + 3) = 40; x = ' + xVuon,
  'C2-B5-M1-Q06': () => 'm ≤ 5',
  'C2-B5-M1-Q08': () => '60 ≤ v ≤ 100',
  'C2-B5-M1-Q15': () => {
    eq(560 + nganSach(600 - 560, 1), 600);
    return '560 + x ≤ 600';
  },
  'C2-B6-M1-Q06': () => { eq(nganSach(50000, 3000), 16); return '3 000x ≤ 50 000'; },
  'C2-B6-M1-Q07': () => nganSach(50000, 3000) + ' cái',
  'C2-B6-M1-Q14': () => { eq(nganSach(400000, 60000), 6); return '60 000x ≤ 400 000'; },
  'C2-B6-M1-Q15': () => nganSach(400000, 60000) + ' vé',
  'C2-B6-M2-Q16': () => nganSach(1200000 - 450000, 25000) + ' chiếc',
  'C3-B10-M1-Q15': () => {
    let canh = 1;
    while (canh ** 3 < 1000) canh++;
    eq(canh ** 3, 1000);
    return canh + ' dm';
  },
  'C4-B12-M1-Q08': () => fix(80 * Math.cos(50 * rad), 0) + ' m',
  'C4-B12-M1-Q16': () => fix(60 * Math.cos(40 * rad) + 1.5, 1) + ' m',
  'C4-B12-M2-Q07': () => fix(30 * Math.tan(65 * rad), 0) + ' m',
  'C4-B12-M2-Q16': () => fix(35 / Math.sqrt(3), 1) + ' m',
  'C4-B12-M2-Q15': () => fix(thap, 1) + ' m',
  'C5-B13-M1-Q16': () => {
    assert.equal(250 <= 300, true);
    assert.equal(350 <= 300, false);
    return 'Nhà An nghe rõ, nhà Bình không';
  },
  'C5-B14-M2-Q05': () => 3 * 360 / 12 + '°',
  'C5-B14-M2-Q13': () => 2 * 360 / 12 + '°',
  'C5-B15-M1-Q07': () => (10 * (360 * 20 / 60) / 60) + 'π/3 cm',
  'C5-B15-M1-Q16': () => 2 * 6 * (4 - 1) / 12 + 'π cm',
  'C5-B14-M2-Q08': () => 360 / 12 + '°',
  'C5-B14-M3-Q16': () => (4 - 1) * 360 / 8 + '°',
  'C5-B15-M1-Q06': () => 'khoảng ' + fix((70 * 10 / 100) * 3.14, 2) + ' m',
  'C5-B15-M1-Q15': () => Math.round(1099 / (0.7 * 3.14)) + ' vòng',
  'C5-B16-M1-Q16': () => 30 + ' cm',
  'C5-B16-M2-Q08': () => 'vuông góc với mặt đường',
  'C5-B15-M2-Q06': () => 30 ** 2 / (360 / 120) + 'π cm²',
  'C5-B15-M2-Q08': () => 8 ** 2 / 4 + 'π m²',
  'C5-B15-M2-Q16': () => fix(30 ** 2 * 3.14 / 6, 0) + ' m²',
  'C5-B15-M3-Q08': () => fix((0.5 + 0.4) * (0.5 - 0.4), 2) + 'π m²',
  'C5-B15-M3-Q14': () => (10 + 2) * (10 - 2) + 'π m²',
  'C5-B16-M2-Q15': () => fix(Math.sqrt(6400.05 ** 2 - 6400 ** 2), 0) + ' km',
};

const dapAn = new Map([1, 2, 3, 4, 5].flatMap(n => require('../lib/dfle/t9-chuong' + n + '.js').QUESTIONS.map(q => [q.id, q.opts])));
assert.equal(Object.values(ANH_MINH_HOA).filter(a => 'anh' in a).length, 82);
assert.equal(Object.values(ANH_MINH_HOA).filter(a => 've' in a).length, 2);
assert.deepEqual([...DANH_SACH].sort(), Object.keys(bang).sort());
assert.deepEqual([...DANH_SACH].sort(), Object.keys(ketQuaGiai).sort());
assert.equal(dapAn.get('C1-B3-M1C-Q14').D, '{ 1/x + 1/y = 1/6; 2x + 3y = 2/5 }');

let dat = 0;
for (const id of DANH_SACH) {
  try {
    const q = layHanhTrinh(id);
    const opts = dapAn.get(id);
    assert.deepEqual(q.phuongAn, [opts.A, opts.B, opts.C, opts.D]);
    assert.equal(new Set(q.phuongAn).size, 4);
    assert.equal(MAU[id].ketQua(), opts.A, 'Kết quả của hành trình');
    assert.equal(bang[id](), opts.A, 'Kết quả kiểm tra độc lập');
    assert.equal(new Set(q.buocGiai.pa).size, 3);
    for (const pt of q.moHinh) {
      assert.ok(pt.congThuc.length > 0);
      assert.equal(new Set([pt.dung, ...pt.sai]).size, 3);
      assert.ok(pt.dungDuKien.length && pt.dungDuKien.every(i => Number.isInteger(i) && i >= 0 && i < q.duKien.length));
    }
    dat++;
    console.log('Đạt ' + id);
  } catch (error) {
    console.error('Lỗi ' + id + ': ' + error.message);
    process.exitCode = 1;
  }
}
console.log(dat + '/' + DANH_SACH.length + ' câu đạt.');

