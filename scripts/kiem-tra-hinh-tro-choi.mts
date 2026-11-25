/**
 * Kiểm tra toàn bộ hình trò chơi nền Chương I – V:
 * 1. Đủ 45/45 mục C1–C5 đều có hình "Nhắc lại bằng hình" trong HINH_NEN.
 * 2. Liệt kê từng câu Chương IV–V có / không có hình riêng từng câu từ docHinhHinhHocCau().
 * 3. Kiểm tra toạ độ không NaN, nằm trong viewBox, không lộ đáp án khi daTra = false.
 * 4. Kiểm tra các mẫu hình học tổng quát (dây + R, cung n°, quạt n°, tam giác vuông cạnh + góc, tiếp tuyến).
 *
 * Chạy: node scripts/kiem-tra-hinh-tro-choi.mts
 */
import { TRO_CHOI_THEO_MUC } from '../lib/dfle/t9-tro-choi-nen.js';
import { HINH_NEN } from '../lib/dfle/t9-hinh-nen.js';
import { docHinhHinhHocCau } from '../lib/hinhTroChoi.ts';
import { hinhHopLe, kiemTraHinhVaToaDo, type Hinh } from '../lib/hinhToanHoc.ts';

type Loi = { id: string; lyDo: string };
const loi: Loi[] = [];

const chuanHoa = (s: string) =>
  s
    .toLowerCase()
    .replace(/\$/g, '')
    .replace(/−/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

// 1. Đủ 45/45 mục C1–C5 trong HINH_NEN
const c15Keys = Object.keys(TRO_CHOI_THEO_MUC).filter((k) => /^C[1-5]-/.test(k));
const thieu = c15Keys.filter((k) => !(HINH_NEN as Record<string, unknown>)[k]);
console.log(`=== 1. KIỂM TRA HINH_NEN CHƯƠNG I – V (${c15Keys.length - thieu.length}/${c15Keys.length} mục) ===`);
if (thieu.length > 0) {
  for (const k of thieu) loi.push({ id: k, lyDo: 'Thiếu hình nhắc lại trong HINH_NEN.' });
}

// Thu thập danh sách câu hỏi Chương IV–V
type MucCau = { id: string; kuId: string; de: string; dapAn?: string };
const dsCauC45: MucCau[] = [];
for (const kuId of c15Keys.filter((k) => /^C[45]-/.test(k))) {
  const tro = (TRO_CHOI_THEO_MUC as Record<string, any>)[kuId];
  if (Array.isArray(tro.cau)) {
    tro.cau.forEach((c: any, idx: number) => {
      dsCauC45.push({
        id: `${kuId}#Q${idx + 1}`,
        kuId,
        de: String(c[0]),
        dapAn: typeof c[1] === 'boolean' ? undefined : String(c[1]),
      });
    });
  }
  if (Array.isArray(tro.cap)) {
    tro.cap.forEach((c: any, idx: number) => {
      dsCauC45.push({ id: `${kuId}#CAP${idx + 1}`, kuId, de: String(c[0]), dapAn: String(c[1]) });
    });
  }
  if (Array.isArray(tro.muc)) {
    tro.muc.forEach((c: any, idx: number) => {
      dsCauC45.push({ id: `${kuId}#MUC${idx + 1}`, kuId, de: String(c[0]) });
    });
  }
  if (Array.isArray(tro.bai)) {
    tro.bai.forEach((b: any, idx: number) => {
      dsCauC45.push({ id: `${kuId}#BAI${idx + 1}`, kuId, de: String(b.de) });
    });
  }
}

function kiemTraNhanKhongLoDapAn(id: string, de: string, dapAn: string | undefined, hinh: Hinh) {
  const kq = kiemTraHinhVaToaDo(hinh);
  if (!kq.ok) {
    loi.push({ id, lyDo: kq.loi ?? 'Lỗi toạ độ SVG.' });
    return;
  }
  if (!dapAn) return;
  const da = chuanHoa(dapAn).replace(/\s*(cm²|cm|m²|m|dm|mm|°)$/i, '').trim();
  if (!da || da.length < 1) return;
  const stemNorm = chuanHoa(de);

  for (const nhanRaw of kq.nhanTexts) {
    const nhan = chuanHoa(nhanRaw);
    const vePhai = nhan.includes('=') ? nhan.split('=').pop()!.trim() : nhan;
    const vePhaiDon = vePhai.replace(/\s*(cm²|cm|m²|m|dm|mm|°)$/i, '').trim();
    if (vePhaiDon === da) {
      // Ngoại lệ hợp lệ: số đó là dữ kiện đã ghi nguyên văn trong đề với vai trò khác (ví dụ "bán kính 6 cm", "đường kính 8", "góc ở tâm bằng 70°")
      const coTienToDuKien = nhan.includes('=') && stemNorm.includes(da);
      if (!coTienToDuKien) {
        loi.push({ id, lyDo: `Nhãn "${nhanRaw}" trên hình trùng đáp án "${dapAn}" (khi chưa trả lời).` });
      }
    }
  }
}

const coHinhRieng: string[] = [];
const giuHinhChung: string[] = [];

console.log(`\n=== 2. KẾT QUẢ HÌNH RIÊNG TỪNG CÂU CHƯƠNG IV – V (tổng ${dsCauC45.length} câu/cặp) ===`);
for (const item of dsCauC45) {
  const kqChuaTra = docHinhHinhHocCau(item.de, item.kuId, false);
  if (!kqChuaTra) {
    giuHinhChung.push(`${item.id}: "${item.de}" -> Giữ hình chung (${item.kuId})`);
    continue;
  }
  coHinhRieng.push(`${item.id} [${kqChuaTra.loaiMau} / ${kqChuaTra.hinh.loai}]: "${item.de}"`);

  if (!hinhHopLe(kqChuaTra.hinh)) {
    loi.push({ id: item.id, lyDo: 'hinhHopLe() trả về false khi daTra=false.' });
  } else {
    kiemTraNhanKhongLoDapAn(item.id, item.de, item.dapAn, kqChuaTra.hinh);
  }

  const kqDaTra = docHinhHinhHocCau(item.de, item.kuId, true);
  if (!kqDaTra || !hinhHopLe(kqDaTra.hinh)) {
    loi.push({ id: item.id, lyDo: 'hinhHopLe() trả về false khi daTra=true.' });
  } else {
    const toaDoSau = kiemTraHinhVaToaDo(kqDaTra.hinh);
    if (!toaDoSau.ok) loi.push({ id: item.id, lyDo: `Khi daTra=true: ${toaDoSau.loi}` });
  }
}

console.log(`-- Có hình riêng (${coHinhRieng.length} câu):`);
coHinhRieng.forEach((s) => console.log(`  [+] ${s}`));
console.log(`-- Giữ hình chung của mục (${giuHinhChung.length} câu/cặp):`);
giuHinhChung.forEach((s) => console.log(`  [=] ${s}`));

// 3. Kiểm thử bổ sung cho các mẫu tổng quát từ đặc tả
const mauTongQuat: [string, string][] = [
  ['TGV cạnh + góc', 'Tam giác vuông ABC tại A có góc C = 35° và cạnh 8 cm. Tính chiều cao?'],
  ['Đường tròn dây + R', 'Cho đường tròn (O) bán kính R = 5 cm và dây AB dài 8 cm. Khoảng cách từ tâm đến dây?'],
  ['Cung n° bán kính R', 'Tính độ dài cung 60° của đường tròn bán kính R = 6 cm.'],
  ['Hình quạt n° bán kính R', 'Tính diện tích hình quạt tròn 72° bán kính R = 5 cm.'],
  ['Tiếp tuyến từ điểm ngoài', 'Từ điểm M ngoài đường tròn (O) bán kính R = 6, kẻ tiếp tuyến MA với OM = 10. Tính MA.'],
];

console.log(`\n=== 3. KIỂM TRA CÁC MẪU TỔNG QUÁT (${mauTongQuat.length} mẫu) ===`);
for (const [ten, de] of mauTongQuat) {
  const kq = docHinhHinhHocCau(de, '', false);
  if (!kq) {
    loi.push({ id: ten, lyDo: 'Không nhận diện được mẫu tổng quát.' });
    continue;
  }
  const td = kiemTraHinhVaToaDo(kq.hinh);
  if (!td.ok) {
    loi.push({ id: ten, lyDo: td.loi ?? 'Lỗi toạ độ mẫu tổng quát.' });
    continue;
  }
  console.log(`  [OK] ${ten} -> ${kq.hinh.loai} (nhãn: ${td.nhanTexts.join(', ')})`);
}

console.log(`\nTổng kết: ${c15Keys.length - thieu.length}/${c15Keys.length} mục đủ HINH_NEN; ${coHinhRieng.length}/${dsCauC45.length} câu C4–C5 có hình riêng.`);
if (loi.length > 0) {
  console.error(`\nPhát hiện ${loi.length} lỗi:`);
  for (const x of loi) console.error(`- ${x.id}: ${x.lyDo}`);
  process.exit(1);
}
console.log('ĐẠT: Toàn bộ hình trò chơi hợp lệ, toạ độ trong khung, không NaN và không lộ đáp án.');
