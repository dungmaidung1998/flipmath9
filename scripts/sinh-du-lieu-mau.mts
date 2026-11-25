/**
 * SINH BỘ DỮ LIỆU MẪU — LỚP DEMO-9A (40 học sinh giả lập, đã học tới giữa chương III).
 *
 * Chạy:  node --experimental-strip-types scripts/sinh-du-lieu-mau.mts <noi-dung.json> > supabase/44-du-lieu-mau-lop-9.sql
 *   noi-dung.json: câu hỏi, đáp án, phương án nhiễu → mã lỗi, video của chương 1–3 (xuất từ cơ sở dữ liệu có 40a, 40b).
 *
 * Mô phỏng từng em đi qua đúng quy trình của web: soát lỗi cũ → trò chơi nền → video → bài chuẩn bị → tự đánh giá
 * → lên lớp → bài vận dụng; thêm ôn lỗi ngắt quãng, gói lấp nền, ôn thi vào 10, luyện nghe tiếng Anh.
 * Các quy tắc lấy từ CHÍNH mã nguồn web (chọn đề vận dụng, gợi ý thích ứng, điểm thưởng, huy hiệu, soát lỗi),
 * nên dữ liệu đi qua các trang giống như dữ liệu thật. Mức làm chủ cuối cùng do hàm refresh_mastery_v2 trên máy chủ tính.
 *
 * "Hôm nay" của bộ dữ liệu là 11/11/2026, 8 giờ sáng. Tệp SQL tự dời mọi ngày giờ theo ngày chạy.
 * Bộ sinh là tất định (hạt giống cố định): chạy lại ra đúng một tệp.
 */
import fs from 'node:fs';
import { chonLoi, chonCau, chuyenTrangThai, saiLai, type LoiHS, type CauNganHang, type CauPhat } from '../lib/soatLoi.ts';
import { selectAdaptive, diemLoiCu } from '../lib/adaptive.ts';
// @ts-ignore
import { recommend } from '../lib/dfle/rules.js';
// @ts-ignore
import { lessonMinMastery } from '../lib/dfle/mastery.js';
// @ts-ignore
import { tinhXp, xetHuyHieu, capNhatChuoi } from '../lib/dfle/gamification.js';
// @ts-ignore
import { KY_NANG_THEO_MUC, KY_NANG_NEN } from '../lib/dfle/t9-ky-nang-nen.js';
// @ts-ignore
import { TRO_CHOI_THEO_MUC } from '../lib/dfle/t9-tro-choi-nen.js';
// @ts-ignore
import { DANG_ON_THI } from '../lib/dfle/t9-on-thi-10.js';

const ND = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const LOP = 'DEMO9';

// ---------------------------------------------------------------- ngẫu nhiên tất định
let hat = 20261111;
const rnd = () => { hat |= 0; hat = (hat + 0x6d2b79f5) | 0; let t = Math.imul(hat ^ (hat >>> 15), 1 | hat); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const giua = (a: number, b: number) => a + (b - a) * rnd();
const nguyen = (a: number, b: number) => Math.floor(giua(a, b + 1));
const chon1 = <T,>(a: T[]): T => a[Math.floor(rnd() * a.length)];
const xao = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const sig = (x: number) => 1 / (1 + Math.exp(-x));

// ---------------------------------------------------------------- thời gian (giờ Việt Nam)
const VN = 7 * 3600_000, NGAY = 86400_000, PHUT = 60_000;
const D0 = Date.parse('2026-11-11T00:00:00+07:00');
const NOW = D0 + 8 * 3600_000;                       // 8:00 sáng "hôm nay"
const luc = (ngay: number, gio: number, phut = 0) => D0 + ngay * NGAY + gio * 3600_000 + phut * PHUT;
const ngayVN = (ms: number) => new Date(ms + VN).toISOString().slice(0, 10);
const chu = (ms: number) => new Date(ms + VN).toISOString().slice(0, 19).replace('T', ' ');
// Trong tệp SQL: v_goc = 0:00 "hôm nay" (đã dời theo ngày chạy), v_ngay = ngày "hôm nay".
const T = (ms: number) => `(v_goc + make_interval(secs => ${Math.round((ms - D0) / 1000)}))`;
const D = (x: string) => `(v_ngay + ${Math.round((Date.parse(x + 'T00:00:00Z') - Date.parse('2026-11-11T00:00:00Z')) / 86400_000)})`;

// ---------------------------------------------------------------- nội dung
type Ku = { ku: string; bai: string; ten: string; ord: number; pre: string | null; vid: boolean };
type Cau = { id: string; ku: string; lv: number; dap: string; t: number };
const KU: Ku[] = ND.ku;
const CAU: Cau[] = ND.q;
const cauTheoKu = new Map<string, Cau[]>();
for (const q of CAU) (cauTheoKu.get(q.ku) ?? cauTheoKu.set(q.ku, []).get(q.ku)!).push(q);
const capCau = new Map<string, { lv: number; dap: string }>(ND.qall.map((q: any) => [q.id, q]));
const thoiGianCau = new Map(CAU.map((q) => [q.id, q.t]));
const phuongAn = new Map<string, string[]>();
for (const o of ND.opt) (phuongAn.get(o.id) ?? phuongAn.set(o.id, []).get(o.id)!).push(o.k);
const maNhieu = new Map<string, string>(ND.de.map((d: any) => [`${d.id}|${d.k}`, d.ma]));
const nhieuTheoCau = new Map<string, { k: string; ma: string }[]>();
for (const d of ND.de) (nhieuTheoCau.get(d.id) ?? nhieuTheoCau.set(d.id, []).get(d.id)!).push({ k: d.k, ma: d.ma });
const videoKu = new Map<string, { url: string; dur: number }>(ND.vid.map((v: any) => [v.ku, v]));
const viBai = new Set<string>(ND.micro);
// Ngân hàng câu soát lỗi: mọi câu có phương án nhiễu gắn mã lỗi.
const nganHangSoat: CauNganHang[] = (() => {
  const m = new Map<string, Set<string>>();
  for (const d of ND.de) (m.get(d.id) ?? m.set(d.id, new Set()).get(d.id)!).add(d.ma);
  return Array.from(m).filter(([id]) => capCau.has(id)).map(([question_id, s]) => ({ question_id, level: capCau.get(question_id)!.lv, ma: Array.from(s) }));
})();
const maLoiC123 = Array.from(new Set(ND.loi.filter((l: any) => /^C[123]-/.test(l.ku)).map((l: any) => l.ma as string)));

// Bài (lesson) theo thứ tự, mỗi bài một buổi học trên lớp.
const BAI = Array.from(new Set(KU.map((k) => k.bai)));
const kuCuaBai = (b: string) => KU.filter((k) => k.bai === b).map((k) => k.ku);
const NGAY_HOC = [-57, -50, -43, -36, -29, -22, -15, -8, 1, 8];   // B1 … B10 (B9 học ngày mai, B10 chưa mở)
const LICH = BAI.map((b, i) => {
  const hoc = NGAY_HOC[i];
  const mo = i === 0 ? hoc - 4 : NGAY_HOC[i - 1];
  return { bai: b, mo, hoc, han: luc(hoc - 1, 19) };
});
const kuTruoc = new Map(KU.map((k, i) => [k.ku, i ? KU[i - 1].ku : null]));

// ---------------------------------------------------------------- học sinh
type Kieu = 'gioi' | 'kha' | 'tb' | 'yeu' | 'doan' | 'bo';
const TEN: [string, string][] = [
  ['nu', 'Minh Anh'], ['nam', 'Gia Bảo'], ['nu', 'Ngọc Châu'], ['nam', 'Đức Duy'], ['nu', 'Thu Hà'], ['nam', 'Quang Huy'],
  ['nu', 'Khánh Linh'], ['nam', 'Tuấn Kiệt'], ['nu', 'Bảo Ngọc'], ['nam', 'Hoàng Nam'], ['nu', 'Phương Thảo'], ['nam', 'Minh Khôi'],
  ['nu', 'Thanh Trúc'], ['nam', 'Đăng Khoa'], ['nu', 'Hải Yến'], ['nam', 'Văn Long'], ['nu', 'Mai Phương'], ['nam', 'Trọng Nhân'],
  ['nu', 'Thùy Dung'], ['nam', 'Anh Tuấn'], ['nu', 'Kim Ngân'], ['nam', 'Hữu Phước'], ['nu', 'Diệu Linh'], ['nam', 'Thành Đạt'],
  ['nu', 'Ngọc Hân'], ['nam', 'Bá Hiếu'], ['nu', 'Tường Vy'], ['nam', 'Công Danh'], ['nu', 'Quỳnh Như'], ['nam', 'Phúc Thịnh'],
  ['nu', 'Lan Chi'], ['nam', 'Nhật Minh'], ['nu', 'Hồng Nhung'], ['nam', 'Tiến Dũng'], ['nu', 'Yến Nhi'], ['nam', 'Văn Hậu'],
  ['nu', 'Thảo My'], ['nam', 'Quốc Việt'], ['nu', 'Ánh Dương'], ['nam', 'Hoài Nam']
];
const CO_CAU: Kieu[] = [
  ...Array(6).fill('gioi'), ...Array(11).fill('kha'), ...Array(13).fill('tb'), ...Array(6).fill('yeu'), 'doan', 'doan', 'bo', 'bo'
];
// Kỹ năng nền của chương 1–3; một kỹ năng "mất gốc" chung của lớp để bản đồ mất gốc có cảnh báo.
const kyNangC123 = Array.from(new Set(KU.map((k) => KY_NANG_THEO_MUC[k.ku]).filter(Boolean))) as string[];
// Kỹ năng mất gốc chung (bình phương, luỹ thừa: nền của căn bậc hai): GIÁO VIÊN CHƯA GIAO gói lấp nền, để bản đồ
// mất gốc hiện cảnh báo ≥30% và nút giao. Kỹ năng giao sẵn (giá trị tuyệt đối, đã giao 12 ngày trước) cho thấy gói lấp nền có tác dụng.
const KY_NANG_HONG_CHUNG = KY_NANG_THEO_MUC['C3-B7-M1'] as string;
const KY_NANG_DA_GIAO = KY_NANG_THEO_MUC['C3-B7-M2'] as string;

type HS = {
  id: string; ten: string; gioi: string; kieu: Kieu; theta: number; sieng: number; tre: number; boQua: number;
  khuya: number; doan: number; hong: Set<string>; loiQuen: string[]; nghiTu: number | null;
};
const thuTu = xao(CO_CAU.map((k, i) => ({ k, i })));
const HOCSINH: HS[] = TEN.map(([gioi, ten], i) => {
  const kieu = thuTu[i].k;
  const th = { gioi: [1.5, 2.3], kha: [0.6, 1.3], tb: [-0.4, 0.45], yeu: [-0.95, -0.45], doan: [-0.7, -0.2], bo: [-0.3, 0.3] }[kieu];
  const sieng = { gioi: giua(0.88, 1), kha: giua(0.75, 0.95), tb: giua(0.55, 0.85), yeu: giua(0.4, 0.65), doan: giua(0.35, 0.55), bo: giua(0.6, 0.8) }[kieu];
  const hong = new Set<string>();
  const soHong = { gioi: 0, kha: rnd() < 0.3 ? 1 : 0, tb: nguyen(1, 2), yeu: nguyen(3, 4), doan: nguyen(2, 3), bo: 1 }[kieu];
  if (kieu === 'yeu' || kieu === 'doan' || (kieu === 'tb' && rnd() < 0.65)) hong.add(KY_NANG_HONG_CHUNG);
  if ((kieu === 'yeu' && rnd() < 0.6) || (kieu === 'tb' && rnd() < 0.3)) hong.add(KY_NANG_DA_GIAO);
  for (const k of xao(kyNangC123)) { if (hong.size >= soHong) break; hong.add(k); }
  return {
    id: `mau${String(i + 1).padStart(2, '0')}`, ten: `${ten} (mẫu)`, gioi, kieu, theta: giua(th[0], th[1]), sieng,
    tre: { gioi: 0.03, kha: 0.1, tb: 0.25, yeu: 0.4, doan: 0.45, bo: 0.15 }[kieu],
    boQua: { gioi: 0, kha: 0.03, tb: 0.08, yeu: 0.22, doan: 0.25, bo: 0.05 }[kieu],
    khuya: rnd() < 0.2 ? 0.5 : 0.05,
    doan: kieu === 'doan' ? 0.6 : 0,
    hong, loiQuen: xao(maLoiC123).slice(0, 4),
    nghiTu: kieu === 'bo' ? luc(nguyen(-24, -18), 0) : null
  };
});

// ---------------------------------------------------------------- bộ đệm SQL
type Dong = string;
// Dữ liệu chia 3 tệp (SQL Editor của Supabase nhận tệp vừa phải): phần 1 = lớp, lịch, mau01–13; phần 2 = mau14–27; phần 3 = mau28–40.
let phan = 0;
const SO_PHAN = 3;
const phanCua = (i: number) => (i < 13 ? 0 : i < 27 ? 1 : 2);
const BANG: Record<string, { cot: string; dong: Dong[] }>[] = [{}, {}, {}];
const them = (ten: string, cot: string, dong: Dong) => { (BANG[phan][ten] ??= { cot, dong: [] }).dong.push(dong); };
const s = (x: unknown) => x == null ? 'null' : typeof x === 'number' ? String(x) : typeof x === 'boolean' ? String(x) : `'${String(x).replace(/'/g, "''")}'`;
const j = (x: unknown) => x == null ? 'null' : `${s(JSON.stringify(x))}::jsonb`;
const XEM: string[][] = [[], [], []];

// Bảng lớn ghi dạng nén: mỗi dòng là một mảng JSON; chữ lặp lại tra từ điển; giờ ghi bằng số giây kể từ 0:00 "hôm nay".
const TU: string[][] = [[], [], []]; const tuSo = [new Map<string, number>(), new Map<string, number>(), new Map<string, number>()];
const tra = (v: string) => { let i = tuSo[phan].get(v); if (i == null) { i = TU[phan].length; TU[phan].push(v); tuSo[phan].set(v, i); } return i; };
type KieuCot = 'h' | 's' | 'n' | 'k' | 'i' | 'f' | 'b' | 'j' | 'A' | 'L' | 'G';
const SPEC: Record<string, { cot: string; kieu: KieuCot[] }> = {
  learning_events: { cot: 'student_id, ku_id, event_type, ts, duration_active_sec, payload', kieu: ['h', 'k', 'k', 's', 'i', 'j'] },
  quiz_attempts: { cot: 'attempt_id, student_id, ku_id, attempt_no, score, time_on_task_sec, started_at, submitted_at, kind', kieu: ['A', 'h', 'k', 'i', 'f', 'i', 's', 's', 'k'] },
  quiz_answers: { cot: 'attempt_id, question_id, chosen_option, is_correct, error_code, answer_time_sec', kieu: ['A', 'k', 'k', 'b', 'k', 'i'] },
  xp_log: { cot: 'student_id, ly_do, diem, ku_id, created_at', kieu: ['h', 'k', 'i', 'k', 's'] },
  student_error_log: { cot: 'student_id, error_code, tu, den, ly_do, luot_id, ts', kieu: ['h', 'k', 'k', 'k', 'k', 'i', 's'] },   // luot_id: lượt làm bài hoặc lượt soát lỗi
  recommendations: { cot: 'rec_id, student_id, ku_id, trigger_rule, diagnosis, action, recommended_content, created_at, pre_score', kieu: ['G', 'h', 'k', 'k', 'k', 'k', 'k', 's', 'f'] },
  dong_goi_y: { cot: '', kieu: ['G', 'f'] },
  soat_loi_luot: { cot: 'luot_id, student_id, ku_id, ngay, cau, thieu_cau, tao_luc, nop_luc, ket_qua', kieu: ['L', 'h', 'k', 'n', 'j', 'j', 's', 's', 'j'] },
  soat_loi_tra_loi: { cot: 'luot_id, question_id, error_code, chosen_option, is_correct, answer_time_sec', kieu: ['L', 'k', 'k', 'k', 'b', 'i'] },
  student_errors: { cot: 'student_id, error_code, trang_thai, han_on, so_lan_sai, tai_phat, lan_sai_dau, lan_sai_cuoi, ku_goc, chu_ky_tu, cap_nhat', kieu: ['h', 'k', 'k', 'n', 'i', 'i', 's', 's', 'k', 's', 's'] },
  mastery_history: { cot: 'student_id, ku_id, mastery_level, ts', kieu: ['h', 'k', 'i', 's'] },
  hint_requests: { cot: 'student_id, question_id, error_code, tier, created_at', kieu: ['h', 'k', 'k', 'i', 's'] },
  learning_recovery_records: { cot: 'student_id, ku_id, manifest_error, target_ku_id, source_attempt_id, selected_arm, status, pre_score, created_at, updated_at', kieu: ['h', 'k', 'k', 'k', 'A', 'k', 'k', 'f', 's', 's'] }
};
const doiNgay = (x: string) => Math.round((Date.parse(x + 'T00:00:00Z') - Date.parse('2026-11-11T00:00:00Z')) / NGAY);
const doi = (k: KieuCot, x: any) => x == null ? null
  : k === 'h' ? Number(String(x).slice(3)) : k === 's' ? Math.round((x - D0) / 1000) : k === 'n' ? doiNgay(x) : k === 'k' ? tra(String(x))
  : k === 'b' ? (x ? 1 : 0) : k === 'A' ? x - 9_100_000_000 : k === 'L' ? x - 9_200_000_000 : k === 'G' ? x - 9_300_000_000 : x;
const NEN: Record<string, unknown[][]>[] = [{}, {}, {}];
const C = (ten: string, ...v: unknown[]) => { (NEN[phan][ten] ??= []).push(v.map((x, i) => doi(SPEC[ten].kieu[i], x))); };
const bieuThuc = (k: KieuCot, i: number) => ({
  h: `'mau' || lpad(r->>${i}, 2, '0')`, s: `v_goc + make_interval(secs => (r->>${i})::int)`, n: `v_ngay + (r->>${i})::int`, k: `v_tu[(r->>${i})::int + 1]`,
  i: `(r->>${i})::bigint`, f: `(r->>${i})::numeric`, b: `((r->>${i})::int = 1)`, j: `nullif(r->${i}, 'null'::jsonb)`,
  A: `9100000000 + (r->>${i})::bigint`, L: `9200000000 + (r->>${i})::bigint`, G: `9300000000 + (r->>${i})::bigint`
}[k]);

let idLuot = 9_100_000_000, idSoat = 9_200_000_000, idGoiY = 9_300_000_000;
const SU_KIEN = 'learning_events';
const suKien = (hs: string, ku: string | null, loai: string, ms: number, payload: unknown = null, dur: number | null = null) =>
  C(SU_KIEN, hs, ku, loai, ms, dur, payload);

// ---------------------------------------------------------------- trạng thái mô phỏng của từng em
type Luot = { id: number; ku: string; kind: 'chuan-bi' | 'van-dung'; no: number; score: number; tg: number; ms: number;
  tl: { q: string; opt: string | null; dung: boolean; ma: string | null; t: number }[] };
type TT = {
  luot: Luot[]; video: Map<string, number>; mastery: Map<string, number | null>; loi: Map<string, LoiHS>;
  soatDaDung: { cau: CauPhat[]; ms: number }[]; ngaySoat: Set<string>; cuoi: number;
  xp: number; streak: number; ngayCuoi: string | null; huyHieu: string[]; goiY: { id: number; ku: string; pre: number; dong: boolean }[];
  tienBo: number; nen: Map<string, number>; mucNen: Map<string, number>;
};

function mucLamChu(st: TT, ku: string): number | null {
  // Bản sao của refresh_mastery_v2 (để vẽ lịch sử theo thời gian); mức cuối cùng do máy chủ tính lại.
  const ev: { q: string; lv: number; dung: boolean; ms: number }[] = [];
  for (const l of st.luot) if (l.ku === ku) {
    const kyVong = l.tl.reduce((a, x) => a + (thoiGianCau.get(x.q) ?? 0), 0);
    if (l.score < 5 && l.tg < 0.3 * kyVong) continue;
    for (const x of l.tl) ev.push({ q: x.q, lv: capCau.get(x.q)!.lv, dung: x.dung, ms: l.ms });
  }
  const moiNhat = new Map<string, typeof ev[0]>();
  for (const e of ev.sort((a, b) => b.ms - a.ms)) if (!moiNhat.has(e.q)) moiNhat.set(e.q, e);
  const gan = Array.from(moiNhat.values()).sort((a, b) => b.ms - a.ms || a.q.localeCompare(b.q)).slice(0, 12);
  if (gan.length < 3) return null;
  const tl = (a: typeof gan) => a.length ? a.filter((x) => x.dung).length / a.length : 0;
  const vd = gan.filter((x) => x.lv >= 3), tg = gan.filter((x) => x.lv === 4);
  let m = 0;
  if (tl(gan) >= 0.5) m = 1;
  if (tl(gan) >= 0.65 && vd.length >= 2 && tl(vd) >= 0.65) m = 2;
  if (tl(gan) >= 0.8 && tg.length >= 2 && tl(tg) >= 0.65) m = 3;
  return m;
}

const KHO = [0, -1.1, -0.1, 0.8, 1.6];        // độ khó theo cấp độ câu
const khoMuc = (ku: string) => (ku.startsWith('C3-B9') ? 0.35 : ku.startsWith('C1-B3') ? 0.25 : 0);

function xacSuatDung(hs: HS, st: TT, q: Cau, them_: number) {
  const hong = hs.hong.has(KY_NANG_THEO_MUC[q.ku]) ? 0.9 * (st.nen.get(KY_NANG_THEO_MUC[q.ku]) ?? 1) : 0;
  const video = (st.video.get(q.ku) ?? 0) - 0.6;
  return sig(1.4 * (hs.theta + st.tienBo + them_ + 0.5 * video - KHO[q.lv] - khoMuc(q.ku) - hong));
}

function traLoi(hs: HS, st: TT, q: Cau, them_: number, doanMo: boolean) {
  const dung = doanMo ? rnd() < 0.3 : rnd() < xacSuatDung(hs, st, q, them_);
  let opt: string | null = q.dap;
  if (!dung) {
    const sai = (phuongAn.get(q.id) ?? []).filter((k) => k !== q.dap);
    const quen = sai.filter((k) => hs.loiQuen.includes(maNhieu.get(`${q.id}|${k}`) ?? ''));
    opt = rnd() < 0.03 ? null : quen.length && rnd() < 0.7 ? chon1(quen) : sai.length ? chon1(sai) : null;
  }
  const t = doanMo ? nguyen(4, 12) : Math.max(8, Math.round(q.t * giua(0.55, 1.35) * (hs.kieu === 'gioi' ? 0.75 : 1)));
  return { q: q.id, opt, dung: dung && opt === q.dap, ma: !dung && opt ? maNhieu.get(`${q.id}|${opt}`) ?? null : null, t };
}

function ghiLoiBaiLam(hs: HS, st: TT, ma: string[], ku: string, ms: number, idL: number | null) {
  const dem = new Map<string, number>();
  for (const m of ma) dem.set(m, (dem.get(m) ?? 0) + 1);
  for (const [m, n] of dem) {
    const c = st.loi.get(m) ?? null;
    const r = saiLai(c, n);
    const moi: LoiHS = {
      error_code: m, trang_thai: r.trang_thai, han_on: null, so_lan_sai: r.so_lan_sai, tai_phat: r.tai_phat,
      lan_sai_cuoi: new Date(ms).toISOString(), ku_goc: c?.ku_goc ?? ku, chu_ky_tu: r.moChuKy ? new Date(ms).toISOString() : c!.chu_ky_tu
    };
    (moi as any).lan_sai_dau = (c as any)?.lan_sai_dau ?? ms;
    st.loi.set(m, moi);
    if (!c || c.trang_thai !== 'can-sua') C('student_error_log', hs.id, m, c?.trang_thai ?? null, 'can-sua', 'bai-lam', idL, ms);
  }
}

function hoatDong(st: TT, ms: number) { st.cuoi = Math.max(st.cuoi, ms); }

function capNhatXp(hs: HS, st: TT, l: Luot, video: number, boTro: boolean, R06: boolean) {
  const ngay = ngayVN(l.ms);
  const streak = capNhatChuoi(st.ngayCuoi, st.streak, ngay);
  const { xp, chiTiet } = tinhXp({ kind: l.kind, attemptNo: l.no, videoCompletion: video, tuNguyenLamLai: l.kind === 'chuan-bi' && l.no > 1, hoanThanhBoTro: boTro, streakDays: streak });
  for (const c of chiTiet) C('xp_log', hs.id, c.ly_do, c.diem, l.ku, l.ms);
  st.xp += xp; st.streak = streak; st.ngayCuoi = ngay;
  const ms = Array.from(st.mastery.values()).filter((x): x is number => x != null);
  const moi = xetHuyHieu({
    soBaiDaChuanBi: st.luot.filter((x) => x.kind === 'chuan-bi' && x.no === 1).length,
    soLanTuLamLai: st.luot.filter((x) => x.kind === 'chuan-bi' && x.no > 1).length,
    streakDays: streak, masteryCaoNhat: Math.max(0, ...ms), duocDeXuatNhomTruong: R06,
    diemVanDungCaoNhat: Math.max(0, ...st.luot.filter((x) => x.kind === 'van-dung').map((x) => x.score)), daSuaDuocLoiCu: false
  }, st.huyHieu);
  for (const b of moi) { st.huyHieu.push(b); them('student_badges', 'student_id, badge_code, earned_at', `(${s(hs.id)}, ${s(b)}, ${T(l.ms)})`); }
}

function lamBai(hs: HS, st: TT, ku: string, kind: 'chuan-bi' | 'van-dung', ms: number, them_: number) {
  const nganHang = cauTheoKu.get(ku)!;
  let de: Cau[];
  if (kind === 'chuan-bi') de = nganHang.filter((q) => q.lv <= 3);
  else {
    const gan = [...st.luot].sort((a, b) => b.ms - a.ms).slice(0, 40).flatMap((l) => l.tl.map((x) => ({ question_id: x.q, error_code: x.ma, is_correct: x.dung })));
    const maLoi = new Set(gan.filter((a) => !a.is_correct && a.error_code).map((a) => a.error_code!));
    const nhieu = nganHang.flatMap((q) => (nhieuTheoCau.get(q.id) ?? []).filter((d) => maLoi.has(d.ma)).map((d) => ({ question_id: q.id, error_code: d.ma })));
    const diem = diemLoiCu(gan, nhieu);
    for (const k of Array.from(diem.keys())) if (!nganHang.some((q) => q.id === k)) diem.delete(k);
    const bank = nganHang.map((q) => ({ ...q, question_id: q.id, level: q.lv }));
    de = selectAdaptive(bank, st.mastery.get(ku) ?? null, diem).map((q) => nganHang.find((x) => x.id === q.question_id)!);
  }
  const doanMo = rnd() < hs.doan;
  const no = st.luot.filter((l) => l.ku === ku && l.kind === kind).length + 1;
  const tl = de.map((q) => traLoi(hs, st, q, them_ + (no - 1) * 0.35, doanMo));
  const dung = tl.filter((x) => x.dung).length;
  const score = Math.round((dung / tl.length) * 100) / 10;
  const tg = tl.reduce((a, x) => a + x.t, 0) + (doanMo ? 5 : nguyen(20, 90));
  const l: Luot = { id: ++idLuot, ku, kind, no, score, tg, ms: ms + tg * 1000, tl };
  st.luot.push(l);
  C('quiz_attempts', l.id, hs.id, ku, no, score, tg, ms, l.ms, kind);
  for (const x of tl) C('quiz_answers', l.id, x.q, x.opt, x.dung, x.ma, x.t);

  // ba sự kiện máy chủ ghi khi chấm
  const coMa = tl.filter((x) => x.ma).length;
  if (coMa) suKien(hs.id, ku, 'feedback_with_hint', l.ms, { so_cau_sai_co_ma_loi: coMa, attempt_no: no });
  if (kind === 'chuan-bi' && no > 1) suKien(hs.id, ku, 'voluntary_retry', l.ms, { attempt_no: no });
  if (kind === 'van-dung' && no === 1) suKien(hs.id, ku, 'assignment_submit', l.ms, { score });

  // ngữ cảnh bộ quy tắc
  const truocDo = st.cuoi;
  const prepDau = st.luot.find((x) => x.ku === ku && x.kind === 'chuan-bi');
  const prepCuoi = [...st.luot].reverse().find((x) => x.ku === ku && x.kind === 'chuan-bi');
  const vdCuoi = [...st.luot].reverse().find((x) => x.ku === ku && x.kind === 'van-dung');
  let appliedScore: number | null = null;
  if (vdCuoi) { const c = vdCuoi.tl.filter((x) => capCau.get(x.q)!.lv >= 3); if (c.length) appliedScore = 10 * c.filter((x) => x.dung).length / c.length; }
  const dem: Record<string, number> = {};
  for (const x of st.luot.filter((y) => y.ku === ku && y.kind === kind).flatMap((y) => y.tl)) if (x.ma) dem[x.ma] = (dem[x.ma] ?? 0) + 1;
  st.mastery.set(ku, mucLamChu(st, ku));
  C('mastery_history', hs.id, ku, st.mastery.get(ku) ?? null, l.ms);
  const kuInfo = KU.find((k) => k.ku === ku)!;
  const cungBai = kuCuaBai(kuInfo.bai);
  const theoKu: Record<string, number> = {};
  for (const k of cungBai) { const m = st.mastery.get(k); if (m != null) theoKu[k] = m; }
  const ctx = {
    studentId: hs.id, kuId: ku, videoCompletionRate: videoKu.has(ku) ? Math.min(1, st.video.get(ku) ?? 0) : null,
    firstQuizScore: Number(prepCuoi?.score ?? prepDau?.score ?? score), appliedScore, timeOnTaskSec: tg,
    expectedTimeSec: de.reduce((a, q) => a + q.t, 0) || null,
    errorCounts: Object.entries(dem).map(([code, count]) => ({ code, count })),
    prerequisiteMastery: kuInfo.pre ? st.mastery.get(kuInfo.pre) ?? null : null,
    lessonMinMastery: lessonMinMastery(theoKu, cungBai),
    daysInactive: truocDo ? Math.max(0, Math.floor((ms - truocDo) / NGAY)) : 0
  };
  const rec: any = recommend(ctx);

  // đóng vòng lặp thích ứng
  let boTro = false;
  const doiChieu = tl.filter((x) => capCau.get(x.q)!.lv >= 2);
  if (kind === 'van-dung' && doiChieu.length >= 2) {
    const post = Math.round((10 * doiChieu.filter((x) => x.dung).length / doiChieu.length) * 10) / 10;
    const mo = [...st.goiY].reverse().find((g) => g.ku === ku && !g.dong);
    if (mo) {
      mo.dong = true; boTro = true;
      C('dong_goi_y', mo.id, post);
      suKien(hs.id, ku, 't6_dong_vong', l.ms, { rec_id: mo.id, pre_score: mo.pre, post_score: post, so_cau_doi_chieu: doiChieu.length, muc_cau: doiChieu.map((x) => capCau.get(x.q)!.lv) });
    }
  }
  if (rec.triggerRule) {
    const id = ++idGoiY;
    st.goiY.push({ id, ku, pre: score, dong: false });
    const cid = rec.payload?.contentId ?? null;
    C('recommendations', id, hs.id, ku, rec.triggerRule, rec.diagnosis, rec.action, cid, l.ms, score);
    // em mở vi bài học được gợi ý
    if (cid && viBai.has(cid) && rnd() < hs.sieng * 0.7) {
      const mo = l.ms + nguyen(1, 25) * PHUT;
      if (mo < NOW) {
        them('micro_lesson_events', 'student_id, content_id, ku_id, kind, so_cau_dung, so_cau, ts', `(${s(hs.id)}, ${s(cid)}, ${s(ku)}, 'mo', null, null, ${T(mo)})`);
        if (rnd() < 0.75 && mo + 8 * PHUT < NOW) { const n = 3; them('micro_lesson_events', 'student_id, content_id, ku_id, kind, so_cau_dung, so_cau, ts', `(${s(hs.id)}, ${s(cid)}, ${s(ku)}, 'hoan-thanh', ${nguyen(hs.theta > 0 ? 2 : 1, n)}, ${n}, ${T(mo + nguyen(6, 14) * PHUT)})`); }
      }
    }
  }

  // hàng đợi hỗ trợ của giáo viên (chỉ lỗi trong 14 ngày gần đây)
  const quanSat = Array.from(new Set(tl.filter((x) => !x.dung && x.ma).map((x) => x.ma!)));
  if (l.ms > NOW - 14 * NGAY) for (const m of quanSat) C('learning_recovery_records', hs.id, ku, m, ku, l.id, 'teacher_queue', 'detected', score, l.ms, l.ms);
  ghiLoiBaiLam(hs, st, tl.filter((x) => !x.dung && x.ma).map((x) => x.ma!), ku, l.ms, l.id);

  // gợi ý theo tầng: em yêu cầu gợi ý ở câu sai
  for (const x of tl) if (!x.dung && x.ma && rnd() < 0.25 * hs.sieng) C('hint_requests', hs.id, x.q, x.ma, rnd() < 0.7 ? 1 : 2, l.ms + 30_000);

  capNhatXp(hs, st, l, Math.min(1, st.video.get(ku) ?? 0), boTro, (rec.allTriggered ?? []).includes('R06'));
  hoatDong(st, l.ms);
  return l;
}

function soatLoi(hs: HS, st: TT, ku: string | null, ms: number): number {
  const ngay = ngayVN(ms);
  if (st.ngaySoat.has(ngay)) return ms;
  const ds = Array.from(st.loi.values()).filter((l) => l.trang_thai !== 'da-nho');
  const chon = chonLoi(ds, ngay, ku ? kuTruoc.get(ku) ?? null : null, ms);
  if (!chon.length) return ms;
  st.ngaySoat.add(ngay);
  const daDung: Record<string, string[]> = {};
  for (const c of chon) daDung[c.ma.error_code] = st.soatDaDung.filter((x) => x.ms >= Date.parse(c.ma.chu_ky_tu)).flatMap((x) => x.cau.filter((y) => y.error_code === c.ma.error_code).map((y) => y.question_id));
  const tungSai = new Set(st.luot.slice(-200).flatMap((l) => l.tl.filter((x) => !x.dung).map((x) => x.q)));
  const { cau, thieu } = chonCau(chon, nganHangSoat, daDung, tungSai);
  const id = ++idSoat;
  if (!cau.length) {
    C('soat_loi_luot', id, hs.id, ku, ngay, [], thieu.map(tra), ms, ms, { thieuHet: true });
    return ms;
  }
  st.soatDaDung.push({ cau, ms });
  let t = ms;
  const cham = cau.map((c) => {
    const q = capCau.get(c.question_id)!;
    const p = sig(1.2 * (hs.theta + st.tienBo) + (c.loai === 'sua' ? 0.3 : 1.1) - 0.3 * (q.lv - 2));
    const dung = rnd() < p;
    let chonPA: string | null = q.dap;
    if (!dung) { const nh = (nhieuTheoCau.get(c.question_id) ?? []); const cung = nh.filter((d) => d.ma === c.error_code); chonPA = (cung.length && rnd() < 0.75 ? chon1(cung) : chon1(nh.length ? nh : [{ k: 'A', ma: '' }])).k; }
    const tg = nguyen(25, 120); t += tg * 1000;
    return { ...c, chosen: chonPA, dung: dung && chonPA === q.dap, time: tg };
  });
  const theoMa = new Map<string, { loai: any; dung: number; tong: number }>();
  for (const c of cham) { const m = theoMa.get(c.error_code) ?? { loai: c.loai, dung: 0, tong: 0 }; m.tong++; if (c.dung) m.dung++; theoMa.set(c.error_code, m); }
  const kq = Array.from(theoMa).map(([m, x]) => chuyenTrangThai(m, x.loai, x.dung, x.tong, ngayVN(t)));
  const ketQua = {
    ma: kq,   // moTa (mô tả lỗi) do SQL điền từ error_dictionary, cho tệp gọn
    tiLeKhacPhuc: kq.length ? kq.filter((k) => k.danhGia === 'da-khac-phuc').length / kq.length : 1
  };
  // dạng nén; SQL dựng lại đúng cấu trúc web ghi (cau, ket_qua.ma kèm mô tả lỗi, ket_qua.cau)
  C('soat_loi_luot', id, hs.id, ku, ngay, cau.map((c) => [tra(c.question_id), tra(c.error_code), c.loai]), thieu.map(tra), ms, t,
    { m: ketQua.ma.map((k) => [tra(k.error_code), k.loai, k.dung, k.tong, k.danhGia, k.trangThaiMoi, k.hanMoi ? doiNgay(k.hanMoi) : null]), t: ketQua.tiLeKhacPhuc });
  for (const c of cham) C('soat_loi_tra_loi', id, c.question_id, c.error_code, c.chosen, c.dung, c.time);
  for (const k of kq) {
    const c = st.loi.get(k.error_code)!;
    const sai = k.tong - k.dung;
    const tu = c.trang_thai;
    st.loi.set(k.error_code, { ...c, trang_thai: k.trangThaiMoi, han_on: k.hanMoi, ...(sai ? { so_lan_sai: c.so_lan_sai + sai, lan_sai_cuoi: new Date(t).toISOString() } : {}) });
    if (tu !== k.trangThaiMoi) C('student_error_log', hs.id, k.error_code, tu, k.trangThaiMoi, k.loai === 'sua' ? 'soat-loi' : k.loai, id, t);
  }
  const khac = cham.filter((c) => !c.dung && c.chosen).map((c) => maNhieu.get(`${c.question_id}|${c.chosen}`)).filter((m): m is string => !!m && !theoMa.has(m));
  if (khac.length) ghiLoiBaiLam(hs, st, khac, ku ?? (null as any), t, null);
  st.tienBo += 0.01 * kq.filter((k) => k.danhGia === 'da-khac-phuc').length;
  hoatDong(st, t);
  return t + 30_000;
}

function choiNen(hs: HS, st: TT, ku: string, ms: number, lapNen = false): number {
  const g = TRO_CHOI_THEO_MUC[ku];
  if (!g) return ms;
  const kn = KY_NANG_THEO_MUC[ku];
  const n = (Object.values(g).find((v) => Array.isArray(v)) as unknown[] | undefined)?.length ?? 6;
  const hong = hs.hong.has(kn) ? (st.nen.get(kn) ?? 1) : 0;
  const p = sig(1.4 * (hs.theta + 0.9) - 2.8 * hong + (lapNen ? 0.3 : 0));
  const kt = ms + nguyen(150, 360) * 1000;
  let dung: number, tong: number;
  if (g.kieu === 'latThe') { const loi = Math.round((1 - p) * n * giua(1, 2.2)); dung = n; tong = n + loi; }
  else { tong = n; dung = 0; for (let i = 0; i < n; i++) if (rnd() < p) dung++; }
  suKien(hs.id, ku, 'game_finish', kt, { kieu: g.kieu, dung, tong });
  // Gói lấp nền chơi đều thì kỹ năng nền khá lên.
  if (hs.hong.has(kn) && lapNen) st.nen.set(kn, Math.max(0.2, (st.nen.get(kn) ?? 1) - 0.22));
  hoatDong(st, kt);
  return kt + 20_000;
}

function xem(hs: HS, st: TT, ku: string, ms: number): number {
  const v = videoKu.get(ku);
  if (!v) return ms;
  const phu = { gioi: giua(0.9, 1), kha: giua(0.82, 1), tb: giua(0.55, 1), yeu: giua(0.3, 0.9), doan: giua(0.15, 0.5), bo: giua(0.7, 1) }[hs.kieu];
  const den = Math.round(v.dur * Math.min(1, phu));
  XEM[phan].push(JSON.stringify([hs.id, ku, v.url, den, Math.round((ms - D0) / 1000)]));
  st.video.set(ku, Math.max(st.video.get(ku) ?? 0, den / v.dur));
  let t = ms + den * 1000 + nguyen(30, 180) * 1000;
  // Đoạn khó hay bị tua lại (GV-17): khoảng 40–55% thời lượng.
  if (den > v.dur * 0.5 && rnd() < (hs.kieu === 'gioi' ? 0.15 : 0.4)) {
    const tu = Math.round(v.dur * giua(0.4, 0.46)), den2 = tu + nguyen(20, 50);
    suKien(hs.id, ku, 'video_replay', t - 60_000, { tu: den2 + nguyen(5, 15), den: tu });
    t += (den2 - tu) * 1000;
  }
  if (den >= v.dur * 0.98) suKien(hs.id, ku, 'video_complete', t);
  hoatDong(st, t);
  return t;
}

const CAU_HOI_HS: Record<string, string[]> = {
  C1: ['Khi nào hệ phương trình vô nghiệm ạ?', 'Em chưa hiểu khi nào dùng phương pháp thế, khi nào dùng cộng đại số.', 'Bài toán năng suất đặt ẩn thế nào cho dễ ạ?', 'Sao nghiệm của phương trình bậc nhất hai ẩn lại có vô số nghiệm?'],
  C2: ['Nhân hai vế với số âm thì đổi chiều, nhưng chia thì sao ạ?', 'Điều kiện xác định của phương trình chứa ẩn ở mẫu em hay quên.', 'Em chưa hiểu vì sao phải đối chiếu điều kiện cuối bài.', 'Bất đẳng thức cộng hai vế cùng chiều có trừ được không ạ?'],
  C3: ['Căn của a bình phương sao lại là trị tuyệt đối của a?', 'Khi nào được đưa thừa số ra ngoài dấu căn ạ?', 'Trục căn thức ở mẫu có hai số hạng làm thế nào?', 'Căn bậc ba của số âm có được không ạ?', 'Rút gọn xong có cần ghi điều kiện của x không ạ?']
};

function tuDanhGia(hs: HS, ku: string, ms: number, score: number) {
  let muc = score >= 9 ? 4 : score >= 7 ? 3 : score >= 5 ? 2 : 1;
  if (hs.kieu === 'yeu' && rnd() < 0.35) muc = Math.min(4, muc + 1);   // tự tin hơn kết quả
  if (hs.kieu === 'gioi' && rnd() < 0.2) muc = Math.max(1, muc - 1);   // khiêm tốn
  const hoi = rnd() < (score < 7 ? 0.45 : 0.18) ? chon1(CAU_HOI_HS[ku.slice(0, 2)]) : '';
  suKien(hs.id, ku, 'tu_danh_gia', ms, { muc, cau_hoi: hoi });
}

// ---------------------------------------------------------------- lịch hoạt động của từng em
type ViecLam = { ms: number; lam: () => void };

for (const [iHS, hs] of HOCSINH.entries()) {
  if (phanCua(iHS) !== phan || iHS === 0) {
    // Mỗi phần một dải mã riêng: chạy lại một phần (kể cả khi tệp được sinh lại) không đụng mã của phần khác.
    phan = phanCua(iHS);
    idLuot = 9_100_000_000 + phan * 10_000_000; idSoat = 9_200_000_000 + phan * 10_000_000; idGoiY = 9_300_000_000 + phan * 10_000_000;
  }
  const st: TT = { luot: [], video: new Map(), mastery: new Map(), loi: new Map(), soatDaDung: [], ngaySoat: new Set(), cuoi: 0,
    xp: 0, streak: 0, ngayCuoi: null, huyHieu: [], goiY: [], tienBo: 0, nen: new Map(), mucNen: new Map() };
  const viec: ViecLam[] = [];
  const conHoc = (ms: number) => ms < NOW && (hs.nghiTu == null || ms < hs.nghiTu);

  LICH.forEach((lb, iBai) => {
    const dsKu = kuCuaBai(lb.bai);
    // --- chuẩn bị trước giờ
    if (rnd() >= hs.boQua) {
      let bd: number;
      if (rnd() < hs.tre) bd = rnd() < 0.7 ? luc(lb.hoc - 1, nguyen(19, 22), nguyen(5, 50)) : luc(lb.hoc, 6, nguyen(0, 30));
      else {
        const ngay = hs.kieu === 'gioi' && rnd() < 0.6 ? nguyen(lb.mo + 1, lb.hoc - 2) : rnd() < 0.55 ? lb.hoc - 1 : nguyen(Math.min(lb.mo + 1, lb.hoc - 1), lb.hoc - 1);
        const gio = ngay === lb.hoc - 1 ? nguyen(15, 17) : rnd() < hs.khuya ? 22 : nguyen(19, 21);
        bd = luc(ngay, gio, nguyen(0, 50));
      }
      viec.push({ ms: bd, lam: () => {
        let t = bd;
        if (rnd() < 0.15 + 0.8 * hs.sieng) t = soatLoi(hs, st, dsKu[0], t);
        for (const ku of dsKu) {
          if (!conHoc(t)) return;
          t = choiNen(hs, st, ku, t);
          // chơi lại sau khi xem Ôn nhanh nếu sai nhiều
          if (rnd() < 0.3 * hs.sieng && hs.hong.has(KY_NANG_THEO_MUC[ku])) t = choiNen(hs, st, ku, t + 60_000);
          if (!conHoc(t)) return;
          t = xem(hs, st, ku, t);
          if (!conHoc(t)) return;
          const l = lamBai(hs, st, ku, 'chuan-bi', t, 0);
          t = l.ms + 40_000;
          if (t < NOW) tuDanhGia(hs, ku, t, l.score);
          t += nguyen(2, 8) * PHUT;
          // chủ động làm lại khi điểm thấp
          if (l.score < 6.5 && rnd() < hs.sieng - 0.25 && t + 15 * PHUT < NOW) {
            t += nguyen(10, 25) * PHUT;
            const l2 = lamBai(hs, st, ku, 'chuan-bi', t, 0.2);
            t = l2.ms + nguyen(2, 6) * PHUT;
          }
        }
      } });
    }
    // --- bài vận dụng sau giờ học (bài đã học trên lớp)
    if (luc(lb.hoc, 0) < NOW) for (const ku of dsKu) {
      if (rnd() < 1 - (1 - hs.sieng) * 1.3) {
        const ngay = lb.hoc + (rnd() < 0.6 ? 0 : nguyen(1, 3));
        const bd = luc(ngay, rnd() < hs.khuya ? 22 : nguyen(18, 21), nguyen(0, 55));
        viec.push({ ms: bd, lam: () => {
          const l = lamBai(hs, st, ku, 'van-dung', bd, 0.45);
          if (l.score < 5 && rnd() < hs.sieng && l.ms + NGAY < NOW) {
            const bd2 = l.ms + NGAY + nguyen(0, 120) * PHUT;
            if (conHoc(bd2)) lamBai(hs, st, ku, 'van-dung', bd2, 0.6);
          }
        } });
      }
    }
    // --- lớp đã học xong bài → trình độ chung nhích lên
    viec.push({ ms: luc(lb.hoc, 9), lam: () => { st.tienBo += 0.03 * hs.sieng; } });
    void iBai;
  });

  // --- ôn lỗi ở Sổ lỗi (ngày không có bài)
  for (let ngay = -55; ngay <= 0; ngay++) {
    if (rnd() < 0.18 * hs.sieng) { const ms = luc(ngay, nguyen(19, 21), nguyen(0, 55)); viec.push({ ms, lam: () => { if (conHoc(ms)) soatLoi(hs, st, null, ms); } }); }
  }
  // --- gói lấp nền (giáo viên giao ngày -6 cho nhóm mất gốc; em tự làm thêm khi thấy "Việc nên làm")
  if (hs.hong.size) for (let ngay = -30; ngay <= -1; ngay++) {
    const duocGiao = ngay >= -12 && ngay <= -7 && hs.hong.has(KY_NANG_DA_GIAO);
    const pGiao = duocGiao ? 0.5 : 0.05;
    if (rnd() < pGiao * hs.sieng * 1.4) {
      const ms = luc(ngay, nguyen(17, 21), nguyen(0, 55));
      viec.push({ ms, lam: () => {
        if (!conHoc(ms)) return;
        const kn = duocGiao ? KY_NANG_DA_GIAO : chon1(Array.from(hs.hong));
        if (duocGiao) (hs as any).daLapNen = ms;
        const mucs = (KY_NANG_NEN[kn]?.muc ?? []).filter((m: string) => TRO_CHOI_THEO_MUC[m]);
        if (!mucs.length) return;
        const t = choiNen(hs, st, chon1(mucs), ms, true);
        if (duocGiao) choiNen(hs, st, chon1(mucs), t + 3 * PHUT, true);   // xem Ôn nhanh rồi chơi thêm lượt nữa
      } });
    }
  }
  // --- ôn thi vào 10 và luyện nghe tiếng Anh (cuối tuần, chủ yếu nhóm khá giỏi)
  const dangC123 = (DANG_ON_THI as any[]).filter((d) => /^C[123]-/.test(d.ku));
  for (let ngay = -35; ngay <= -1; ngay++) {
    const thu = new Date(luc(ngay, 12)).getUTCDay();
    const cuoiTuan = thu === 6 || thu === 0;
    const pOn = { gioi: 0.55, kha: 0.3, tb: 0.1, yeu: 0.03, doan: 0.02, bo: 0.05 }[hs.kieu] * (cuoiTuan ? 1 : 0.15);
    if (rnd() < pOn && dangC123.length) {
      const ms = luc(ngay, nguyen(8, 20), nguyen(0, 55));
      viec.push({ ms, lam: () => { if (!conHoc(ms)) return; const d = chon1(dangC123); const tong = d.cauHoi?.length ?? 4; let dung = 0; for (let i = 0; i < tong; i++) if (rnd() < sig(1.6 * (hs.theta + st.tienBo) - 0.4)) dung++; suKien(hs.id, d.ku, 'on_thi_10', ms + 8 * PHUT, { che_do: 'dang', cau: d.cau, dung, tong }); hoatDong(st, ms); } });
    }
    const pAnh = { gioi: 0.25, kha: 0.15, tb: 0.06, yeu: 0.02, doan: 0.02, bo: 0.03 }[hs.kieu] * (cuoiTuan ? 1 : 0.3);
    if (rnd() < pAnh) {
      const ms = luc(ngay, nguyen(9, 21), nguyen(0, 55));
      viec.push({ ms, lam: () => { if (!conHoc(ms)) return; const tong = 10; let dung = 0; for (let i = 0; i < tong; i++) if (rnd() < sig(1.3 * hs.theta + 0.8)) dung++; suKien(hs.id, 'C3-B7-M1', 'tieng_anh', ms + 6 * PHUT, { viec: 'luyen-nghe', dung, tong }); hoatDong(st, ms); } });
    }
  }

  viec.sort((a, b) => a.ms - b.ms);
  for (const v of viec) if (conHoc(v.ms)) v.lam();

  // ---- trạng thái cuối
  for (const l of st.loi.values()) C('student_errors', hs.id, l.error_code, l.trang_thai, l.han_on, l.so_lan_sai, l.tai_phat, (l as any).lan_sai_dau, Date.parse(l.lan_sai_cuoi), l.ku_goc, Date.parse(l.chu_ky_tu), Math.min(NOW, st.cuoi || NOW));
  if (st.ngayCuoi) them('student_xp', 'student_id, xp, streak_days, last_active_day, updated_at', `(${s(hs.id)}, ${st.xp}, ${st.streak}, ${D(st.ngayCuoi)}, ${T(st.cuoi)})`);
  (hs as any).st = st;
}

// ---------------------------------------------------------------- giáo viên: lịch, nhật ký tiết dạy, việc giao (phần 1)
phan = 0;
const hsDuocGiao = HOCSINH.filter((h) => h.hong.has(KY_NANG_DA_GIAO) && h.kieu !== 'bo');
const viecGV: string[] = [];
for (const lb of LICH) {
  them('lich_bai', 'class_id, lesson_id, ngay_mo, han_chuan_bi, ngay_hoc', `(${s(LOP)}, ${s(lb.bai)}, ${D(ngayVN(luc(lb.mo, 12)))}, ${T(lb.han)}, ${D(ngayVN(luc(lb.hoc, 12)))})`);
  if (luc(lb.hoc, 0) < NOW) for (const ku of kuCuaBai(lb.bai)) {
    const ngay = ngayVN(luc(lb.hoc, 12));
    viecGV.push(`(${s(LOP)}, ${s(ku)}, greatest(1, least(40, ((${D(ngay)} - date '2026-09-07') / 7) + 1)), ${D(ngay)}, '07:15', true, true, true, ${rnd() < 0.7}, ${nguyen(37, 40)}, 'Dữ liệu mẫu')`);
  }
}
for (const v of viecGV) them('lesson_log', 'class_id, ku_id, tuan, ngay_day, gio_bat_dau, pha_truoc_gio, pha_tren_lop, pha_sau_gio, da_chia_nhom_theo_du_lieu, so_hs_co_mat, ghi_chu', v);
const tenKN = KY_NANG_NEN[KY_NANG_DA_GIAO]?.ten ?? KY_NANG_DA_GIAO;
for (const h of hsDuocGiao) {
  const xong: number | undefined = (h as any).daLapNen;
  them('gv_giao_viec', 'class_id, student_id, loai, loi_nhan, muc_tieu, tao_boi, created_at, da_xem_at, xong_at',
    `(${s(LOP)}, ${s(h.id)}, 'goi-lap-nen', ${s(`Em làm gói lấp nền "${tenKN}" trước buổi học Bài 7 nhé.`)}, array[${s(KY_NANG_DA_GIAO)}], v_gv, ${T(luc(-12, 20, 10))}, ${xong || rnd() < 0.7 ? T(luc(-11, 19, nguyen(0, 50))) : 'null'}, ${xong ? T(xong + 6 * PHUT) : 'null'})`);
}
const treNhieu = HOCSINH.filter((h) => h.kieu === 'yeu' || h.kieu === 'doan').slice(0, 3);
for (const h of treNhieu) them('gv_giao_viec', 'class_id, student_id, loai, loi_nhan, muc_tieu, tao_boi, created_at, da_xem_at, xong_at',
  `(${s(LOP)}, ${s(h.id)}, 'nhac-nho', 'Hạn chuẩn bị Bài 9 là 19:00 tối nay. Em xem video và làm bài chuẩn bị nhé.', '{}'::text[], v_gv, ${T(luc(-1, 20, 30))}, ${rnd() < 0.5 ? T(luc(-1, 21, 40)) : 'null'}, null)`);

// ---------------------------------------------------------------- xuất SQL (3 tệp)
const soHS = { gioi: 0, kha: 0, tb: 0, yeu: 0, doan: 0, bo: 0 } as Record<Kieu, number>;
HOCSINH.forEach((h) => soHS[h.kieu]++);
const thuMuc = process.argv[3] ?? '.';
const NHOM_TEN: [Kieu, string][] = [['gioi', 'Giỏi:'], ['kha', 'Khá:'], ['tb', 'Trung bình:'], ['yeu', 'Yếu:'], ['doan', 'Hay bấm bừa:'], ['bo', 'Bỏ dở 3 tuần nay:']];
const TEN_TEP = ['44a-du-lieu-mau-phan-1.sql', '44b-du-lieu-mau-phan-2.sql', '44c-du-lieu-mau-phan-3.sql'];

for (let ph = 0; ph < SO_PHAN; ph++) {
  const out: string[] = [];
  const p = (x = '') => out.push(x);
  const dsPhan = HOCSINH.filter((_, i) => phanCua(i) === ph);
  const tuMa = dsPhan[0].id, denMa = dsPhan[dsPhan.length - 1].id;
  const mauKiem = CAU.filter((_, i) => i % 13 === 0);
  p(`-- ===========================================================================
-- FlipMath9 · ${TEN_TEP[ph].slice(0, 3)} · BỘ DỮ LIỆU MẪU — LỚP "DEMO-9A" — PHẦN ${ph + 1}/3 (học sinh ${tuMa} → ${denMa})
--
-- ĐÂY LÀ DỮ LIỆU GIẢ LẬP để xem thử các tính năng. KHÔNG dùng làm kết quả nghiên cứu.
--   · Lớp riêng: mã lớp DEMO9, tên hiện "DEMO-9A", nhóm 'DEMO'. Trang xuất dữ liệu nghiên cứu chỉ lấy lớp TN/DC
--     và học sinh đã đồng thuận, nên lớp này không bao giờ lọt vào tệp phân tích.
--   · 40 em mã mau01…mau40, tên có chữ "(mẫu)", trạng thái đồng thuận "chua".
--   · Cơ cấu: ${soHS.gioi} giỏi, ${soHS.kha} khá, ${soHS.tb} trung bình, ${soHS.yeu} yếu, ${soHS.doan} hay bấm bừa, ${soHS.bo} bỏ dở giữa chừng.
${NHOM_TEN.map(([k, ten]) => `--       ${ten.padEnd(20)} ${HOCSINH.filter((h) => h.kieu === k).map((h) => h.id).join(' ')}`).join('\n')}
--   · Mất gốc chung: ${KY_NANG_NEN[KY_NANG_HONG_CHUNG]?.ten} (giáo viên CHƯA giao gói lấp nền → bản đồ mất gốc hiện cảnh báo).
--     Đã giao gói lấp nền "${KY_NANG_NEN[KY_NANG_DA_GIAO]?.ten}" 12 ngày trước cho ${hsDuocGiao.length} em.
--   · Đã học Bài 1 → Bài 8 (chương I, II và nửa đầu chương III). Bài 9 học NGÀY MAI, hạn chuẩn bị 19:00 TỐI NAY
--     (một phần lớp đã chuẩn bị). Bài 10 chưa mở. "Hôm nay" của dữ liệu là ngày chạy tệp, khoảng 8 giờ sáng.
--   · Có: lịch giao bài, bài chuẩn bị + vận dụng, video, trò chơi nền, tự đánh giá, soát lỗi cũ + ôn ngắt quãng,
--     sổ lỗi, gói lấp nền, gợi ý thích ứng, vi bài học, điểm thưởng + huy hiệu, ôn thi vào 10, luyện nghe
--     tiếng Anh, nhật ký tiết dạy, việc giáo viên đã giao, mức làm chủ (máy chủ tính lại ở cuối tệp).
--
-- CÁCH CHẠY: chạy LẦN LƯỢT 44a → 44b → 44c trong SQL Editor của Supabase (sau 40a, 40b, 41, 42, 43).
--   Mỗi tệp: dán cả tệp, bấm Run. Cả tệp là MỘT khối lệnh: lỗi ở đâu thì không ghi gì cả.
--   Chạy lại được: tệp tự xoá dữ liệu mẫu cũ của phần mình rồi nạp lại; ngày giờ tự dời theo ngày chạy.
--   Xoá hẳn lớp mẫu: chạy 45-xoa-du-lieu-mau.sql.
--
-- XEM GÓC NHÌN HỌC SINH: vào trang "Tài khoản học sinh", chọn lớp DEMO-9A, tạo tài khoản cho vài mã,
--   mỗi dòng "mã, mật khẩu tự đặt, tên" — PHẢI ghi đúng tên đang có, bỏ trống tên thì tên bị đổi thành mã. Ví dụ:
${[HOCSINH.find((h) => h.kieu === 'gioi')!, HOCSINH.find((h) => h.kieu === 'tb')!, HOCSINH.find((h) => h.kieu === 'yeu')!].map((h) => `--       ${h.id}, <mật khẩu>, ${h.ten}`).join('\n')}
--
-- Tệp do scripts/sinh-du-lieu-mau.mts sinh ra. Đừng sửa tay; sửa bộ sinh rồi sinh lại.
-- ===========================================================================

do $mau$
declare
  -- "hôm nay" của dữ liệu là 11/11/2026; dời theo ngày chạy thật
  v_lech int := (now() at time zone 'Asia/Ho_Chi_Minh')::date - date '2026-11-11';
  v_goc timestamptz := timestamptz '2026-11-11 00:00:00+07' + make_interval(days => v_lech);
  v_ngay date := date '2026-11-11' + v_lech;
  v_gv uuid;
  v_rang text;
  v_thieu int;
  v_lich_su bigint;
  v_r record;
  n_hs int; n_luot int; n_su_kien int; n_loi int;
  -- học sinh của phần này
  v_ds text[] := array[${dsPhan.map((h) => `'${h.id}'`).join(', ')}];
  -- từ điển chữ lặp lại (dữ liệu bên dưới ghi số thứ tự, bắt đầu từ 0)
  v_tu text[] := array[${TU[ph].map((v) => s(v)).join(',\n    ')}]::text[];
begin
  -- 0. Kiểm tra trước khi nạp
  if to_regclass('public.lich_bai') is null or to_regclass('public.student_errors') is null then
    raise exception E'\n\n>>> Chưa chạy 42-soat-loi-va-on-ngat-quang.sql và 43-lich-giao-bai.sql. Chạy hai tệp đó trước. <<<\n';
  end if;
  select count(*) into v_thieu from questions where question_id in (${mauKiem.map((q) => `'${q.id}'`).join(', ')});
  if v_thieu < ${mauKiem.length} then
    raise exception E'\n\n>>> Thiếu câu hỏi chương 1–3. Chạy 40a-noi-dung-toan-9-tap-1.sql trước. <<<\n';
  end if;`);
  if (ph === 0) p(`
  -- 1. Lớp mẫu (nhóm DEMO), gắn vào giáo viên của lớp thực nghiệm
  if not exists (select 1 from profiles where role = 'giao-vien') then
    raise exception E'\n\n>>> Chưa có tài khoản giáo viên. <<<\n';
  end if;
  select conname into v_rang from pg_constraint
   where conrelid = 'public.classes'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%arm%';
  if v_rang is not null and not exists (select 1 from pg_constraint where conname = v_rang and pg_get_constraintdef(oid) ilike '%DEMO%') then
    execute format('alter table public.classes drop constraint %I', v_rang);
    execute 'alter table public.classes add constraint classes_arm_check check (arm in (''TN'', ''DC'', ''DEMO''))';
  end if;
  select teacher_id into v_gv from classes where arm = 'TN' and teacher_id is not null order by class_id limit 1;
  if v_gv is null then select id into v_gv from profiles where role = 'giao-vien' limit 1; end if;
  insert into classes (class_id, class_code, grade, arm, teacher_id) values ('${LOP}', 'DEMO-9A', 9, 'DEMO', v_gv)
  on conflict (class_id) do update set arm = 'DEMO', grade = 9, teacher_id = coalesce(classes.teacher_id, excluded.teacher_id);
  select teacher_id into v_gv from classes where class_id = '${LOP}';

  -- 2. Học sinh (cả lớp; giữ tài khoản đã tạo)
  insert into students (student_id, class_id, display_name, gender, baseline_math, consent_status) values
${HOCSINH.map((h) => `    (${s(h.id)}, '${LOP}', ${s(h.ten)}, ${s(h.gioi)}, ${Math.max(2, Math.min(10, Math.round((6.3 + 1.5 * h.theta) * 4) / 4))}, 'chua')`).join(',\n')}
  on conflict (student_id) do update set class_id = excluded.class_id, display_name = excluded.display_name,
    gender = excluded.gender, baseline_math = excluded.baseline_math, consent_status = 'chua';
  delete from gv_giao_viec where class_id = '${LOP}';
  delete from lesson_log where class_id = '${LOP}';
  delete from lich_bai where class_id = '${LOP}';`);
  else p(`
  if not exists (select 1 from classes where class_id = '${LOP}') then
    raise exception E'\n\n>>> Chưa có lớp mẫu. Chạy 44a-du-lieu-mau-phan-1.sql trước. <<<\n';
  end if;
  select teacher_id into v_gv from classes where class_id = '${LOP}';`);
  p(`
  -- 3. Xoá dữ liệu mẫu cũ của phần này
  delete from learning_recovery_records where student_id = any(v_ds);
  delete from quiz_answers where attempt_id in (select attempt_id from quiz_attempts where student_id = any(v_ds));
  delete from quiz_attempts where student_id = any(v_ds);
  delete from soat_loi_luot where student_id = any(v_ds);
  delete from student_error_log where student_id = any(v_ds);
  delete from student_errors where student_id = any(v_ds);
  delete from learning_events where student_id = any(v_ds);
  delete from video_seconds where student_id = any(v_ds);
  delete from mastery_history where student_id = any(v_ds);
  delete from mastery_states where student_id = any(v_ds);
  delete from recommendations where student_id = any(v_ds);
  delete from quiz_locks where student_id = any(v_ds);
  delete from xp_log where student_id = any(v_ds);
  delete from student_xp where student_id = any(v_ds);
  delete from student_badges where student_id = any(v_ds);
  delete from hint_requests where student_id = any(v_ds);
  delete from micro_lesson_events where student_id = any(v_ds);

  -- 4. Hoạt động học tập (mỗi dòng một mảng; học sinh ghi bằng số thứ tự, chữ lặp lại tra "tu", giờ = số giây kể từ 0:00 hôm nay)`);
  const thuTuBang = ['lich_bai', 'lesson_log', 'quiz_attempts', 'quiz_answers', 'recommendations', 'dong_goi_y', 'learning_events', 'soat_loi_luot', 'soat_loi_tra_loi',
    'student_errors', 'student_error_log', 'mastery_history', 'xp_log', 'student_xp', 'student_badges', 'hint_requests', 'micro_lesson_events',
    'learning_recovery_records', 'gv_giao_viec'];
  for (const ten of thuTuBang) {
    const b = BANG[ph][ten];
    if (b) for (let i = 0; i < b.dong.length; i += 400) p(`  insert into ${ten} (${b.cot}) values\n${b.dong.slice(i, i + 400).join(',\n')};`);
    const n = NEN[ph][ten];
    if (!n) continue;
    const sp = SPEC[ten];
    for (let i = 0; i < n.length; i += 2500) {
      const du = s(JSON.stringify(n.slice(i, i + 2500)).replace(/\],\[/g, '],\n['));
      if (ten === 'dong_goi_y') p(`  update recommendations g set accepted = true, post_score = (r->>1)::numeric from jsonb_array_elements(${du}::jsonb) r where g.rec_id = 9300000000 + (r->>0)::bigint;`);
      else p(`  insert into ${ten} (${sp.cot})\n  select ${sp.kieu.map(bieuThuc).join(', ')}\n  from jsonb_array_elements(${du}::jsonb) r;`);
    }
  }
  p(`
  -- sự kiện suy ra: bắt đầu làm bài, bắt đầu trò chơi
  insert into learning_events (student_id, ku_id, event_type, ts)
    select student_id, ku_id, 'quiz_start', started_at from quiz_attempts where student_id = any(v_ds);
  insert into learning_events (student_id, ku_id, event_type, ts, payload)
    select student_id, ku_id, 'game_start', ts - make_interval(secs => 150 + 12 * coalesce((payload->>'tong')::int, 6)), jsonb_build_object('kieu', payload->>'kieu')
      from learning_events where student_id = any(v_ds) and event_type = 'game_finish';
  update learning_recovery_records set teacher_pedagogical_prompt = 'Mã lỗi là giả thuyết từ phương án đã chọn. Hãy yêu cầu học sinh giải thích bước làm trước khi quyết định hỗ trợ.'
   where student_id = any(v_ds);
  update mastery_history set evidence = '{"version":"mastery-v2","nguon":"du-lieu-mau"}'::jsonb where student_id = any(v_ds) and evidence is null;

  -- 5. Video đã xem: [học sinh, mục, video, số giây đã xem, lúc mở (giây kể từ 0:00 hôm nay)]
  --    → từng giây đã xem, lần mở video, các đoạn xem có tương tác (mỗi đoạn tối đa 120 giây)
  insert into video_seconds (student_id, ku_id, video_url, second_index, first_seen)
    select x->>0, x->>1, x->>2, g, v_goc + make_interval(secs => (x->>4)::int + g)
      from jsonb_array_elements(${s('[' + XEM[ph].join(',\n') + ']')}::jsonb) x, generate_series(0, (x->>3)::int - 1) g
    on conflict do nothing;
  insert into learning_events (student_id, ku_id, event_type, ts, payload)
    select v.student_id, v.ku_id, 'content_open', v.first_seen, '{"kind":"video"}'::jsonb
      from video_seconds v where v.student_id = any(v_ds) and v.second_index = 0;
  insert into learning_events (student_id, ku_id, event_type, ts, duration_active_sec)
    select v.student_id, v.ku_id, 'video_active', v.first_seen + make_interval(secs => least(n.den, c + 120)), least(120, n.den - c)
      from video_seconds v
      join (select student_id, ku_id, video_url, count(*)::int den from video_seconds where student_id = any(v_ds) group by 1, 2, 3) n
        on n.student_id = v.student_id and n.ku_id = v.ku_id and n.video_url = v.video_url
      cross join lateral generate_series(0, n.den - 1, 120) c
     where v.student_id = any(v_ds) and v.second_index = 0;

  -- 6. Lượt soát lỗi: dựng lại câu đã phát và kết quả từ dạng nén
  update soat_loi_luot l set
    cau = coalesce((select jsonb_agg(jsonb_build_object('question_id', v_tu[(c->>0)::int + 1], 'error_code', v_tu[(c->>1)::int + 1], 'loai', c->>2) order by i)
                      from jsonb_array_elements(l.cau) with ordinality x(c, i)), '[]'::jsonb),
    thieu_cau = coalesce((select jsonb_agg(v_tu[v::text::int + 1] order by i) from jsonb_array_elements(l.thieu_cau) with ordinality x(v, i)), '[]'::jsonb)
   where l.student_id = any(v_ds);
  update soat_loi_luot l set ket_qua = jsonb_build_object(
    'ma', (select jsonb_agg(jsonb_build_object('error_code', v_tu[(m->>0)::int + 1], 'loai', m->>1, 'dung', (m->>2)::int, 'tong', (m->>3)::int,
             'danhGia', m->>4, 'trangThaiMoi', m->>5, 'hanMoi', case when m->>6 is null then null else to_jsonb((v_ngay + (m->>6)::int)::text) end,
             'moTa', coalesce(e.misconception, '')) order by i)
             from jsonb_array_elements(l.ket_qua->'m') with ordinality x(m, i)
             left join error_dictionary e on e.error_code = v_tu[(m->>0)::int + 1]),
    'cau', (select jsonb_agg(jsonb_build_object('question_id', t.question_id, 'dung', t.is_correct, 'dapAn', q.correct_option, 'chon', t.chosen_option) order by c.i)
              from jsonb_array_elements(l.cau) with ordinality c(x, i)
              join soat_loi_tra_loi t on t.luot_id = l.luot_id and t.question_id = c.x->>'question_id'
              join questions q on q.question_id = t.question_id),
    'tiLeKhacPhuc', (l.ket_qua->>'t')::numeric)
   where l.student_id = any(v_ds) and l.ket_qua ? 'm';

  -- 7. Mức làm chủ: máy chủ tính lại từ bằng chứng (đúng hàm web dùng khi chấm bài),
  --    đặt mốc cập nhật về lúc có bằng chứng cuối, bỏ các dòng lịch sử do lần tính lại này sinh ra.
  select coalesce(max(history_id), 0) into v_lich_su from mastery_history;
  for v_r in select distinct student_id, ku_id from quiz_attempts where student_id = any(v_ds) loop
    perform refresh_mastery_v2(v_r.student_id, v_r.ku_id);
  end loop;
  delete from mastery_history where student_id = any(v_ds) and history_id > v_lich_su;
  update mastery_states m set updated_at = x.cuoi
    from (select student_id, ku_id, max(submitted_at) cuoi from quiz_attempts where student_id = any(v_ds) group by 1, 2) x
   where m.student_id = x.student_id and m.ku_id = x.ku_id;
  -- dòng lịch sử cuối phải khớp mức máy chủ vừa tính
  insert into mastery_history (student_id, ku_id, mastery_level, evidence, ts)
  select m.student_id, m.ku_id, m.mastery_level, m.evidence, m.updated_at + interval '1 second' from mastery_states m
   where m.student_id = any(v_ds) and m.mastery_level is distinct from (
     select h.mastery_level from mastery_history h where h.student_id = m.student_id and h.ku_id = m.ku_id order by h.ts desc limit 1);

  -- 8. Tóm tắt
  select count(*) into n_hs from students where class_id = '${LOP}';
  select count(*) into n_luot from quiz_attempts a join students s using (student_id) where s.class_id = '${LOP}';
  select count(*) into n_su_kien from learning_events e join students s using (student_id) where s.class_id = '${LOP}';
  select count(*) into n_loi from student_errors e join students s using (student_id) where s.class_id = '${LOP}';
  raise notice 'Xong phần ${ph + 1}/3. Lớp mẫu DEMO-9A hiện có: % học sinh, % lượt làm bài, % sự kiện học tập, % mục trong sổ lỗi.', n_hs, n_luot, n_su_kien, n_loi;
end $mau$;
`);
  fs.writeFileSync(`${thuMuc}/${TEN_TEP[ph]}`, out.join('\n') + '\n');
}
