// Kiểm tra toàn bộ cấu trúc hình, toạ độ SVG theo tỉ lệ và quy tắc không lộ đáp án cho C4, C5, Ôn tập và Ôn thi 10.
// Chạy: node scripts/kiem-tra-hinh-cau-hoi.mts
import { hinhHopLe, kiemTraHinhVaToaDo, type Hinh } from '../lib/hinhToanHoc.ts';
import { QUESTIONS as Q_C4 } from '../lib/dfle/t9-chuong4.js';
import { QUESTIONS as Q_C5 } from '../lib/dfle/t9-chuong5.js';
import { ON_TAP } from '../lib/dfle/t9-on-tap.js';
import { DANG_ON_THI } from '../lib/dfle/t9-on-thi-10.js';

const SVG_TYPES = new Set(['tam-giac-vuong', 'duong-tron-day', 'tiep-tuyen', 'hai-duong-tron', 'quat-vanh-khuyen']);

type LoaiLoi = { id: string; nguon: string; lyDo: string };
const loi: LoaiLoi[] = [];

const chuanHoa = (s: string) =>
  s
    .toLowerCase()
    .replace(/\$/g, '')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    .replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    .replace(/\\pi/g, 'π')
    .replace(/\\cdot/g, '·')
    .replace(/\{,\}/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

function kiemTraCau(id: string, nguon: string, stem: string, dapAn: string | undefined, hinh: unknown) {
  if (hinh == null || typeof hinh === 'string') return;
  if (typeof hinh === 'object' && 'anh' in hinh && typeof (hinh as any).anh === 'string') return;
  if (!hinhHopLe(hinh)) {
    loi.push({ id, nguon, lyDo: 'hinhHopLe() trả về false.' });
    return;
  }

  const h = hinh as Hinh;
  if (SVG_TYPES.has(h.loai)) {
    const kq = kiemTraHinhVaToaDo(h);
    if (!kq.ok) {
      loi.push({ id, nguon, lyDo: kq.loi ?? 'Lỗi toạ độ SVG.' });
      return;
    }

    // Chống lộ đáp án: không vẽ câu hỏi vị trí tương đối trừ hình đồng tâm không suy ra vị trí cắt/tiếp xúc
    const st = stem.toLowerCase();
    const laViTri =
      st.includes('vị trí tương đối') ||
      st.includes('vị trí của điểm') ||
      (h.loai === 'hai-duong-tron' && (st.includes('hai đường tròn:') || st.includes('hai đường tròn đó')));
    if (laViTri && h.loai !== 'quat-vanh-khuyen') {
      loi.push({ id, nguon, lyDo: 'Câu hỏi vị trí tương đối không được gắn hình gợi ý lộ quan hệ hình học.' });
    }

    // Chống lộ đáp án bằng nhãn trên hình: nếu nhãn chứa giá trị đáp án (dài >= 2 ký tự) mà đề bài không cho giá trị đó
    if (dapAn) {
      const da = chuanHoa(dapAn).replace(/\s*(cm²|cm|m²|m|dm|mm)$/i, '').trim();
      if (da.length >= 2 && !['a', 'b', 'c', 'd'].includes(da)) {
        const stemNorm = chuanHoa(stem);
        for (const nhanRaw of kq.nhanTexts) {
          const nhan = chuanHoa(nhanRaw);
          const vePhai = nhan.includes('=') ? nhan.split('=').pop()!.trim() : nhan;
          const vePhaiDon = vePhai.replace(/\s*(cm²|cm|m²|m|dm|mm)$/i, '').trim();
          if (vePhaiDon === da && !stemNorm.includes(da)) {
            loi.push({ id, nguon, lyDo: `Nhãn "${nhanRaw}" trên hình trùng đáp án "${dapAn}" nhưng đề không cho sẵn.` });
          }
        }
      }
    }
  }
}

let demC4 = 0;
for (const q of Q_C4 as any[]) {
  if (q.hinh) {
    demC4++;
    kiemTraCau(q.id, 'C4', q.stem, q.opts?.[q.correct], q.hinh);
  }
}

let demC5 = 0;
for (const q of Q_C5 as any[]) {
  if (q.hinh) {
    demC5++;
    kiemTraCau(q.id, 'C5', q.stem, q.opts?.[q.correct], q.hinh);
  }
}

let demOnTap = 0;
for (const [ch, nhom] of Object.entries(ON_TAP as Record<string, any>)) {
  for (const q of nhom.cau ?? []) {
    if (q.hinh) {
      demOnTap++;
      kiemTraCau(q.id, `ON_TAP.${ch}`, q.stem, q.opts?.[q.correct], q.hinh);
    }
  }
}

let demOnThi = 0;
for (const dang of DANG_ON_THI as any[]) {
  for (const b of dang.cauHoi ?? []) {
    if (b.hinh) {
      demOnThi++;
      const dap = b.loai === 'so' ? b.dapAn : b.phuongAn?.[0];
      kiemTraCau(b.id, 'ON_THI_10', b.de, dap, b.hinh);
    }
  }
}

console.log(`Đã kiểm tra hình: C4=${demC4}, C5=${demC5}, ON_TAP=${demOnTap}, ON_THI_10=${demOnThi}`);
if (loi.length > 0) {
  console.error(`Phát hiện ${loi.length} lỗi:`);
  for (const item of loi) console.error(`- [${item.nguon}] ${item.id}: ${item.lyDo}`);
  process.exit(1);
}
console.log('Tất cả hình câu hỏi đều hợp lệ, đúng toạ độ viewBox và không lộ đáp án.');
