/**
 * PHIẾU HƯỚNG DẪN TỰ HỌC cho từng mục (khác Phiếu học tập trắc nghiệm ở bước 3, tức bài chuẩn bị) Toán 9 — lớp học đảo ngược.
 * Ghép từ nội dung đã duyệt theo chương: mục tiêu (UNITS), vi bài học (VI_BAI_HOC: quy tắc, ví dụ, tự làm),
 * lỗi hay gặp (ERRORS), ngân hàng câu hỏi (QUESTIONS) và trò chơi ôn nền (TRO_CHOI_NEN).
 * Sửa nội dung ở các nguồn đó thì phiếu tự cập nhật; tệp này chỉ sắp xếp thành phiếu.
 *
 * Cấu trúc phiếu (4 phần, theo mô hình đảo ngược):
 *   I.  Ôn kiến thức nền   — trước khi xem video
 *   II. Xem video và ghi chép — có khung Ghi nhớ để em đối chiếu sau khi xem
 *   III. Tự luyện          — 3 câu trắc nghiệm (nhận biết → vận dụng) + 2 bài tự làm
 *   IV. Tự đánh giá        — đánh dấu mục tiêu đã đạt, ghi câu hỏi mang lên lớp
 *   Đáp án để cuối phiếu.
 */
import { UNITS, QUESTIONS, ERRORS, REMEDIATION, VI_BAI_HOC } from './t9-noi-dung.js';
import { TRO_CHOI_THEO_MUC } from './t9-tro-choi-nen.js';
import { VIDEO_T9 } from './t9-video.js';

/** Ba mục chưa có vi bài học riêng: viết khung Ghi nhớ trực tiếp. */
const GHI_NHO_RIENG = {
  'C3-LTC': [{ tieuDe: 'Các phép biến đổi căn thức đã học', quyTac: '√(A²) = |A|. Với A ≥ 0, B ≥ 0: √(AB) = √A·√B. Với A ≥ 0, B > 0: √(A/B) = √A/√B. Với B ≥ 0: √(A²B) = |A|√B. Với A > 0: 1/√A = √A/A. Với mọi số a: ∛(a³) = a.' }],
  'C6-B19-M3': [{ tieuDe: 'Công thức nghiệm thu gọn', quyTac: 'Phương trình ax² + bx + c = 0 (a ≠ 0) có b = 2b′. Tính Δ′ = b′² − ac. Nếu Δ′ > 0: hai nghiệm x1 = (−b′ + √Δ′)/a, x2 = (−b′ − √Δ′)/a. Nếu Δ′ = 0: nghiệm kép x = −b′/a. Nếu Δ′ < 0: phương trình vô nghiệm.' }],
  'C7-B24-M3': [{ tieuDe: 'Tần số tương đối ghép nhóm', quyTac: 'Tần số tương đối của một nhóm = tần số của nhóm : cỡ mẫu, thường viết dưới dạng phần trăm. Tổng các tần số tương đối của mọi nhóm bằng 100%.' }]
};

const TU_LAM_RIENG = {
  'C3-LTC': [
    { de: 'Tính √12 + √27 − √48.', dapAn: '√3', giaiThich: '2√3 + 3√3 − 4√3 = √3.' },
    { de: 'Tính √18 : √2 + ∛(−8).', dapAn: '1', giaiThich: '√9 + (−2) = 3 − 2 = 1.' }
  ],
  'C6-B19-M3': [
    { de: 'Giải phương trình x² − 6x + 5 = 0 bằng công thức nghiệm thu gọn.', dapAn: 'x1 = 5, x2 = 1', giaiThich: 'b′ = −3, Δ′ = 9 − 5 = 4, √Δ′ = 2. x = 3 ± 2.' },
    { de: 'Tính Δ′ của phương trình 2x² + 4x − 1 = 0.', dapAn: '6', giaiThich: 'b′ = 2, Δ′ = 2² − 2·(−1) = 6.' }
  ],
  'C7-B24-M3': [
    { de: 'Nhóm [150; 155) có tần số 8, cỡ mẫu là 40. Tính tần số tương đối của nhóm.', dapAn: '20%', giaiThich: '8 : 40 = 0,2 = 20%.' },
    { de: 'Ba nhóm có tần số tương đối 25%, 40% và x%. Tìm x.', dapAn: '35', giaiThich: 'Tổng bằng 100%: x = 100 − 25 − 40 = 35.' }
  ]
};

/** Xáo trộn cố định theo mã mục: cùng một mục thì phiếu luôn giống nhau (in lại không đổi đáp án). */
function hat(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function tronCoDinh(a, khoa) {
  let s = hat(khoa) || 1;
  const r = () => ((s = Math.imul(s ^ (s >>> 15), 2246822519) >>> 0) % 100000) / 100000;
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
const CHU = 'ABCDEFGH';

/** Đổi gói trò chơi ôn nền thành 3 câu viết trên giấy. Mỗi câu: { de, lua?: string[], dapAn }. */
function onNenTuTroChoi(g, ku) {
  if (!g) return [];
  const k = (i) => ku + ':nen:' + i;
  switch (g.kieu) {
    case 'latThe': case 'noiCot': {
      const cap = g.cap.slice(0, 4);
      const phai = tronCoDinh(cap.map((c) => c[1]), k(0));
      return [{
        de: 'Nối mỗi ý ở cột trái với ý tương ứng ở cột phải.',
        noi: { trai: cap.map((c) => c[0]), phai },
        dapAn: cap.map((c, i) => `${i + 1} – ${CHU[phai.indexOf(c[1])]}`).join('; ')
      }];
    }
    case 'dungSai':
      return g.cau.slice(0, 4).map((c) => ({ de: `Đúng hay sai? ${c[0]}`, dapAn: `${c[1] ? 'Đúng' : 'Sai'}. ${c[2]}` }));
    case 'banBong': case 'leoNui':
      return g.cau.slice(0, 3).map((c, i) => {
        const lua = tronCoDinh(c.slice(1), k(i));
        return { de: c[0], lua, dapAn: `${CHU[lua.indexOf(c[1])]}. ${c[1]}` };
      });
    case 'dienSo':
      return g.cau.slice(0, 3).map((c) => ({ de: c[0], dapAn: `${c[1]}. ${c[2]}` }));
    case 'sapXep': {
      const b = g.bai[0];
      const tron = tronCoDinh(b.buoc, k(0));
      return [{ de: `${b.de} Sắp xếp các bước giải sau theo đúng thứ tự.`, lua: tron, dapAn: b.buoc.map((x) => CHU[tron.indexOf(x)]).join(' → ') }];
    }
    case 'phanLoai': {
      const muc = g.muc.slice(0, 6);
      return [{
        de: `Xếp mỗi ý sau vào đúng nhóm: (1) ${g.gio[0]}; (2) ${g.gio[1]}.`,
        lua: muc.map((m) => m[0]),
        dapAn: muc.map((m, i) => `${CHU[i]} → (${m[1] + 1})`).join('; ')
      }];
    }
    default: return [];
  }
}

export function phieuHocTap(kuId) {
  const u = UNITS.find((x) => x.id === kuId);
  if (!u) return null;
  const vbhIds = Object.entries(REMEDIATION).filter(([id, r]) => r.ku === kuId && VI_BAI_HOC[id]).map(([id]) => id);
  const vbh = vbhIds.map((id) => ({ id, tieuDe: REMEDIATION[id].title, ...VI_BAI_HOC[id] }));
  const ghiNho = vbh.length ? vbh.map((v) => ({ tieuDe: v.tieuDe, quyTac: v.quyTac })) : (GHI_NHO_RIENG[kuId] ?? []);
  const viDu = vbh.flatMap((v) => v.viDu ?? []).slice(0, 2);
  const tuLam = vbh.length ? vbh.flatMap((v) => v.tuLam ?? []).slice(0, 2) : (TU_LAM_RIENG[kuId] ?? []);
  const cauMuc = QUESTIONS.filter((q) => q.ku === kuId);
  const tuLuyen = [1, 2, 3].map((lv) => cauMuc.find((q) => q.level === lv)).filter(Boolean).map((q) => {
    const lua = tronCoDinh(Object.keys(q.opts), q.id);
    return { muc: q.level, de: q.stem, lua: lua.map((k) => q.opts[k]), dapAn: CHU[lua.indexOf(q.correct)] };
  });
  const g = TRO_CHOI_THEO_MUC[kuId];
  const v = VIDEO_T9[kuId];
  return {
    ku: kuId, bai: u.bai, muc: u.muc, ten: u.name,
    mucTieu: u.mucTieu.split(/;\s*/).map((s) => s.trim().replace(/\.$/, '')).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)),
    onNen: { nen: g?.nen ?? null, cau: onNenTuTroChoi(g, kuId) },
    video: v ? { url: v.url, phut: Math.round(v.giay / 60) } : null,
    ghiNho, viDu,
    loiHayGap: ERRORS.filter((e) => e.ku === kuId).map((e) => e.misconception).slice(0, 3),
    tuLuyen, tuLam
  };
}

export const PHIEU_HOC_TAP_KU = UNITS.map((u) => u.id);
