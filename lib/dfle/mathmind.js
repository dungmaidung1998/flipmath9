/**
 * MATHMIND AI — BỘ ĐỀ XUẤT SƯ PHẠM CHO GIÁO VIÊN
 * ===========================================================================
 * Biến dữ liệu tự học của một lớp thành 3 phương án tổ chức tiết học 45 phút,
 * mỗi phương án tự giải thích được. Giáo viên là người quyết định cuối cùng:
 * bộ máy chỉ đề xuất, không tự giao gì cho học sinh.
 *
 *   Dữ liệu học tập → (1) Chẩn đoán lớp → (2) Đề xuất sư phạm
 *                   → Giáo viên chọn / sửa / bỏ → (3) Đo lại sau tiết
 *
 * Ba thuật toán:
 *   1. diagnoseClass()     — nhóm khó khăn theo lỗi gốc chung + điểm nghẽn
 *   2. recommendPlans()    — chấm điểm hoạt động, ghép 3 phương án vừa 45 phút
 *   3. activityExperience()— học từ quyết định của giáo viên và phiếu cuối tiết
 *
 * Tất định: cùng đầu vào luôn cho cùng đầu ra (khoá phụ là id), để kiểm thử
 * được và để giáo viên tin được rằng hệ thống không "đoán ngẫu nhiên".
 */

import { ALL_ERROR_NODES as ERROR_NODES, ALL_CAUSAL_EDGES as CAUSAL_EDGES, ACTIVITIES_T9 } from './do-thi-loi-toan-9.js';
import { buildGroups } from './grouping.js';

/* ========================================================================= */
/* 0. HẰNG SỐ                                                               */
/* ========================================================================= */

/** Khung 45 phút: khởi động + phần chính + phiếu cuối tiết + chốt. */
export const KHUNG_TIET = { khoiDong: 5, chinh: 30, phieuCuoiTiet: 7, chot: 3 };

/** Trọng số mức nặng theo vai trò của lỗi trong đồ thị lỗi gốc. */
const MUC_NANG_THEO_VAI_TRO = { root: 1.2, mediating: 1.0, leaf: 0.9 };

/** Trọng số mức nặng của các nhóm không phải nhóm lỗi. */
const MUC_NANG_NHOM = {
  'hong-nen': 1.2,
  'chua-chuan-bi': 1.1,
  'doan-mo': 0.8,
  'san-sang': 0.6
};

export const TEN_NHOM = {
  'loi': 'Nhóm cùng lỗi gốc',
  'chua-chuan-bi': 'Nhóm chưa chuẩn bị bài',
  'doan-mo': 'Nhóm nghi đoán mò',
  'hong-nen': 'Nhóm hổng kiến thức nền',
  'san-sang': 'Nhóm sẵn sàng mở rộng',
  'on-dinh': 'Nhóm đạt, chưa lộ lỗi'
};

const VAI_TRO = new Map(ERROR_NODES.map((n) => [n.id, n.role]));
const CHA = new Map();
for (const e of CAUSAL_EDGES) CHA.set(e.to, [...(CHA.get(e.to) ?? []), e.from]);

/** Mọi tổ tiên của một mã lỗi trong đồ thị (không gồm chính nó). */
function toTien(code, seen = new Set()) {
  for (const p of CHA.get(code) ?? []) {
    if (!seen.has(p)) { seen.add(p); toTien(p, seen); }
  }
  return seen;
}

const mucNang = (code) => MUC_NANG_THEO_VAI_TRO[VAI_TRO.get(code)] ?? 1.0;
const lamTron = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

/* ========================================================================= */
/* 1. NGÂN HÀNG HOẠT ĐỘNG — BẢN NHÁP CHƯƠNG I                               */
/* ========================================================================= */

/**
 * @typedef {object} Activity
 * @property {string}   id
 * @property {string}   ten
 * @property {string[]} errorCodes   mã lỗi mục tiêu; '*' = dùng được cho mọi lỗi
 * @property {string[]} nhom         loại nhóm phục vụ được (xem TEN_NHOM)
 * @property {string}   hinhThuc     ca-lop | nhom-dong-chat | jigsaw | ca-nhan | tram
 * @property {number}   mucNhanThuc  1–4
 * @property {[number, number]} phut thời lượng tối thiểu – tối đa
 * @property {string}   moTa         giáo viên làm gì, học sinh làm gì
 * @property {string}   hocLieu
 * @property {'nhap'|'da-duyet'} trangThai
 * @property {string}   nguon
 */

const NHAP = 'Bản nháp do trợ lý AI soạn theo từ điển mã lỗi — giáo viên cần duyệt, sửa trước khi dùng';

/** @type {Activity[]} */
const ACTIVITY_BANK_C1 = [
  // ---------------------------------------------------------- dùng chung
  { id: 'HD-CHUNG-01', ten: 'Bắt sâu tìm lỗi', errorCodes: ['*'], nhom: ['loi'],
    hinhThuc: 'ca-lop', mucNhanThuc: 2, phut: [7, 10],
    moTa: 'Chiếu một lời giải sai lấy từ chính bài chuẩn bị của lớp (ẩn tên). Học sinh cá nhân tìm chỗ sai trong 2 phút, cặp đôi thống nhất, một em trình bày, một em phản biện. Giáo viên chỉ chốt sau khi lớp đã tự sửa.',
    hocLieu: 'Ảnh chụp 1–2 lời giải sai điển hình', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-CHUNG-02', ten: 'Phiếu luyện tập phân tầng 3 mức', errorCodes: ['*'], nhom: ['loi', 'on-dinh', 'hong-nen'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 2, phut: [10, 20],
    moTa: 'Mỗi nhóm nhận phiếu đúng tầng của mình: Bồi dưỡng (sửa lỗi), Luyện tập (bài SGK), Thử thách (vận dụng). Em xong tầng mình được làm tiếp tầng trên.',
    hocLieu: 'Bộ phiếu học tập phân tầng của đơn vị kiến thức', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-CHUNG-03', ten: 'Nhắc lại cốt lõi 5 phút', errorCodes: [], nhom: ['chua-chuan-bi'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 1, phut: [5, 8],
    moTa: 'Nhóm chưa xem bài ngồi gần bàn giáo viên, xem đoạn chốt của video (≤ 2 phút) rồi làm 2 câu nhận biết. Đúng cả 2 câu thì nhập vào nhóm luyện tập chung.',
    hocLieu: 'Đoạn chốt của video bài học, 2 câu mức 1', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-CHUNG-04', ten: 'Làm lại có giải thích', errorCodes: [], nhom: ['doan-mo'],
    hinhThuc: 'ca-nhan', mucNhanThuc: 2, phut: [5, 8],
    moTa: 'Học sinh làm lại 3 câu của bài chuẩn bị, mỗi lựa chọn phải viết một dòng "vì sao". Giáo viên đi qua kiểm tra tại chỗ — dữ liệu đoán mò chưa đủ để kết luận em yếu hay không.',
    hocLieu: '3 câu của bài chuẩn bị, in trên giấy', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-CHUNG-05', ten: 'Bậc thang tiên quyết', errorCodes: [], nhom: ['hong-nen'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 1, phut: [8, 12],
    moTa: 'Ba câu tăng dần lấy từ đơn vị kiến thức tiên quyết, rồi một câu nối sang bài hôm nay. Giáo viên hỗ trợ trực tiếp nhóm này trong 5 phút đầu.',
    hocLieu: '3 câu mức 1–2 của đơn vị tiên quyết', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-CHUNG-06', ten: 'Bài toán thực tiễn mở rộng', errorCodes: [], nhom: ['san-sang'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 4, phut: [10, 15],
    moTa: 'Nhóm đã làm chủ giải một bài toán gắn thực tế (nhiệt độ, tài chính gia đình, đo lường), trình bày lời giải trên bảng phụ trong 2 phút cuối.',
    hocLieu: 'Một bài toán mức 4 có dữ kiện thực tế', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-CHUNG-07', ten: 'Trợ giảng nhí', errorCodes: ['*'], nhom: ['san-sang', 'loi'],
    hinhThuc: 'jigsaw', mucNhanThuc: 3, phut: [12, 20],
    moTa: 'Nhóm hỗn hợp 4 em, mỗi nhóm một em đã làm chủ làm nhóm trưởng. Nhóm trưởng không giải hộ: chỉ được hỏi gợi mở và chỉ vào bước sai. Giáo viên phát thẻ "câu hỏi gợi mở" cho nhóm trưởng.',
    hocLieu: 'Thẻ câu hỏi gợi mở, phiếu bài tập chung', trangThai: 'nhap', nguon: NHAP },

  // ---------------------------------------------------------- theo mã lỗi
  { id: 'HD-HT-01', ten: 'Phân loại thẻ số: viết được dạng a/b không?', errorCodes: ['E-HT-01', 'E-TT-02'], nhom: ['loi'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 1, phut: [8, 10],
    moTa: 'Mỗi nhóm nhận 12 thẻ số (−5; 0,75; 3/4; 0; −2 1/3 …), xếp vào hai cột "viết được dạng a/b" và "không viết được", ghi cách viết lên mặt sau thẻ.',
    hocLieu: 'Bộ 12 thẻ số', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-HT-02', ten: 'Gấp trục số: đối xứng qua điểm O', errorCodes: ['E-HT-02', 'E-HT-03', 'E-TT-01'], nhom: ['loi'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 2, phut: [8, 12],
    moTa: 'Học sinh vẽ trục số trên băng giấy, đánh dấu một số dương rồi gấp đôi tại O để tìm số đối. So sánh với số nghịch đảo của cùng số đó để thấy hai khái niệm khác nhau.',
    hocLieu: 'Băng giấy, thước', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-TT-01', ten: 'Xếp hàng nhiệt độ âm', errorCodes: ['E-TT-01', 'E-TT-02'], nhom: ['loi'],
    hinhThuc: 'ca-lop', mucNhanThuc: 2, phut: [7, 10],
    moTa: '6 học sinh cầm 6 thẻ nhiệt độ (−3/4 °C, −1/2 °C, …) đứng xếp theo thứ tự từ lạnh nhất đến ấm nhất. Cả lớp phát hiện chỗ đứng sai và giải thích bằng trục số.',
    hocLieu: '6 thẻ nhiệt độ cỡ lớn', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-CT-01', ten: 'Vì sao 1/2 + 1/3 không bằng 2/5', errorCodes: ['E-CT-01', 'E-CT-02', 'E-NC-03'], nhom: ['loi'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 2, phut: [10, 12],
    moTa: 'Mỗi nhóm tô 1/2 và 1/3 của cùng một hình chữ nhật chia 6 ô, đếm số ô đã tô rồi so với 2/5. Sau đó tự viết quy tắc quy đồng bằng lời của nhóm.',
    hocLieu: 'Phiếu hình chữ nhật 6 ô và 10 ô', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-CT-03', ten: 'Cộng trái dấu bằng bước đi trên trục số', errorCodes: ['E-CT-03'], nhom: ['loi'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 2, phut: [8, 10],
    moTa: 'Mỗi phép cộng là hai lần đi trên trục số: đi trái với số âm, đi phải với số dương. Nhóm ghi điểm dừng rồi đối chiếu với quy tắc "lấy hiệu hai giá trị tuyệt đối".',
    hocLieu: 'Trục số dán trên bàn', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-DN-01', ten: 'Thẻ "dấu trừ là nhân với −1"', errorCodes: ['E-DN-01', 'E-DN-02', 'E-CV-01'], nhom: ['loi'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 2, phut: [8, 12],
    moTa: 'Mỗi số hạng trong ngoặc là một thẻ. Khi bỏ ngoặc có dấu trừ, học sinh lật từng thẻ (đổi dấu) — không thẻ nào được giữ nguyên. Làm ngược lại khi đặt ngoặc.',
    hocLieu: 'Thẻ hai mặt +/−', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-NC-01', ten: 'Chia là nhân với nghịch đảo số chia — thử lại bằng phép nhân', errorCodes: ['E-NC-01', 'E-NC-02'], nhom: ['loi'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 2, phut: [8, 10],
    moTa: 'Nhóm tính 4 phép chia theo hai cách (cách đúng và cách sai thường gặp), rồi nhân kết quả với số chia để xem cách nào quay về số bị chia.',
    hocLieu: 'Phiếu 4 phép chia', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-LT-01', ten: 'Bảng dấu luỹ thừa: chẵn, lẻ và vị trí ngoặc', errorCodes: ['E-LT-01', 'E-LT-02', 'E-LT-03'], nhom: ['loi'],
    hinhThuc: 'ca-lop', mucNhanThuc: 2, phut: [8, 10],
    moTa: 'Cả lớp điền bảng (−2)^n và −2^n với n = 1…4, tìm quy luật dấu. Học sinh tự phát biểu khi nào kết quả âm, khi nào dương.',
    hocLieu: 'Bảng điền chiếu trên màn hình', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-LT-04', ten: 'Viết dài ra rồi đếm', errorCodes: ['E-LT-04', 'E-LT-05', 'E-LT-06'], nhom: ['loi'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 1, phut: [8, 10],
    moTa: 'Mỗi tích luỹ thừa được viết thành tích các thừa số rồi đếm số chữ a. Nhóm tự rút ra phải cộng, trừ hay nhân số mũ cho từng loại phép tính.',
    hocLieu: 'Phiếu 6 biểu thức luỹ thừa', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-TU-01', ten: 'Hai đội, hai thứ tự tính', errorCodes: ['E-TU-01', 'E-TU-02'], nhom: ['loi'],
    hinhThuc: 'ca-lop', mucNhanThuc: 2, phut: [8, 10],
    moTa: 'Cùng một biểu thức, đội A tính từ trái sang phải, đội B tính theo thứ tự ưu tiên. Hai kết quả khác nhau là điểm xuất phát để cả lớp thống nhất quy ước.',
    hocLieu: '3 biểu thức có luỹ thừa, nhân chia, ngoặc', trangThai: 'nhap', nguon: NHAP },
  { id: 'HD-CV-01', ten: 'Cân thăng bằng: thêm bớt hai vế', errorCodes: ['E-CV-01', 'E-CV-02'], nhom: ['loi'],
    hinhThuc: 'nhom-dong-chat', mucNhanThuc: 2, phut: [8, 12],
    moTa: 'Dùng trò chơi cân thăng bằng trên web hoặc hình vẽ cân: mỗi bước chuyển vế phải làm cùng một việc ở cả hai đĩa cân. Phân biệt bớt một số hạng với chia cho một thừa số.',
    hocLieu: 'Trò chơi cân thăng bằng (BalanceGame) hoặc phiếu hình cân', trangThai: 'nhap', nguon: NHAP }
];

/** Ngân hàng hoạt động đầy đủ: Chương I + các chương mở rộng (bản nháp). */
/** Toán 9: giữ các hoạt động dùng chung (HD-CHUNG-*), bỏ hoạt động theo mã lỗi Toán 7. */
export const ACTIVITY_BANK = [...ACTIVITY_BANK_C1.filter((a) => a.id.startsWith('HD-CHUNG-')), ...ACTIVITIES_T9];

/* ========================================================================= */
/* 2. THUẬT TOÁN 1 — CHẨN ĐOÁN LỚP                                         */
/* ========================================================================= */

/**
 * @typedef {object} ClassLearner
 * @property {string}   id
 * @property {string}   name
 * @property {number|null} quiz            điểm chuẩn bị lần đầu (thang 10); null = chưa làm
 * @property {number|null} mastery         mức làm chủ của đơn vị này (0–3); null = chưa đủ dữ liệu
 * @property {number|null} prereqMastery   mức làm chủ đơn vị tiên quyết
 * @property {string[]} errorCodes         mã lỗi mắc ở bài chuẩn bị lần đầu
 * @property {string[]} rules              quy tắc đã kích hoạt ở đơn vị này (R01…R09)
 */

/**
 * Gom học sinh thành nhóm khó khăn có tên.
 *
 * Thứ tự xét cho mỗi em (dừng ở điều kiện đầu tiên khớp):
 *   chưa làm bài / R09  → chưa chuẩn bị
 *   R04                 → nghi đoán mò (dữ liệu chưa đáng tin)
 *   có mã lỗi           → nhóm lỗi gốc chung
 *   tiên quyết = 0      → hổng nền
 *   mastery ≥ 2 hoặc quiz ≥ 8 → sẵn sàng mở rộng
 *   còn lại             → đạt, chưa lộ lỗi
 *
 * Lỗi gốc chung: một mã lỗi được quy về tổ tiên (trong đồ thị lỗi gốc) đang
 * xuất hiện ở lớp nhiều nhất. Nhờ vậy 3 em mắc E-CT-02 và 5 em mắc E-CT-01 vào
 * chung một nhóm "E-CT-01" thay vì tách thành hai nhóm quá nhỏ để dạy riêng.
 *
 * @param {ClassLearner[]} learners
 * @param {{errorInfo?: Record<string, {misconception?: string}>}} [opts]
 */
export function diagnoseClass(learners, opts = {}) {
  const ds = [...learners].sort((a, b) => a.id.localeCompare(b.id));
  const N = ds.length;

  // Đếm số em mắc từng mã (mỗi em đếm một lần một mã)
  const soEm = new Map();
  for (const l of ds) for (const c of new Set(l.errorCodes ?? [])) soEm.set(c, (soEm.get(c) ?? 0) + 1);

  // Quy mỗi mã về đại diện: chính nó hoặc tổ tiên có mặt trong lớp, nhiều em nhất
  const daiDien = (code) => {
    const ung = [code, ...toTien(code)].filter((c) => soEm.has(c));
    ung.sort((a, b) =>
      (soEm.get(b) - soEm.get(a)) ||
      (toTien(a).size - toTien(b).size) ||       // hoà thì ưu tiên mã ở thượng nguồn
      a.localeCompare(b));
    return ung[0] ?? code;
  };

  const nhomMap = new Map();
  const them = (key, kind, l, code = null) => {
    if (!nhomMap.has(key)) nhomMap.set(key, { key, kind, code, members: [], codes: new Set() });
    const g = nhomMap.get(key);
    g.members.push(l);
    for (const c of l.errorCodes ?? []) g.codes.add(c);
  };

  for (const l of ds) {
    const rules = new Set(l.rules ?? []);
    const codes = [...new Set(l.errorCodes ?? [])];
    if (l.quiz === null || l.quiz === undefined || rules.has('R09')) { them('chua-chuan-bi', 'chua-chuan-bi', l); continue; }
    if (rules.has('R04')) { them('doan-mo', 'doan-mo', l); continue; }
    if (codes.length) {
      const reps = [...new Set(codes.map(daiDien))]
        .sort((a, b) => (soEm.get(b) ?? 0) - (soEm.get(a) ?? 0) || a.localeCompare(b));
      them(`loi:${reps[0]}`, 'loi', l, reps[0]);
      continue;
    }
    if (l.prereqMastery === 0) { them('hong-nen', 'hong-nen', l); continue; }
    if ((l.mastery ?? -1) >= 2 || (l.quiz ?? 0) >= 8) { them('san-sang', 'san-sang', l); continue; }
    them('on-dinh', 'on-dinh', l);
  }

  const info = opts.errorInfo ?? {};
  const groups = [...nhomMap.values()].map((g) => {
    const size = g.members.length;
    const nang = g.kind === 'loi' ? mucNang(g.code) : (MUC_NANG_NHOM[g.kind] ?? 0.5);
    const ten = g.kind === 'loi'
      ? `${g.code} — ${info[g.code]?.misconception ?? 'quan niệm sai'}`
      : TEN_NHOM[g.kind];
    return {
      key: g.key,
      kind: g.kind,
      code: g.code,
      ten,
      size,
      share: N ? lamTron(size / N, 3) : 0,
      severity: nang,
      priority: g.kind === 'on-dinh' ? 0 : lamTron((N ? size / N : 0) * nang, 3),
      codes: [...g.codes].sort(),
      studentIds: g.members.map((m) => m.id),
      studentNames: g.members.map((m) => m.name)
    };
  }).sort((a, b) => b.priority - a.priority || b.size - a.size || a.key.localeCompare(b.key));

  return {
    total: N,
    prepared: ds.filter((l) => l.quiz !== null && l.quiz !== undefined).length,
    errorCounts: Object.fromEntries([...soEm.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
    groups
  };
}

/**
 * Điểm nghẽn của lớp trên từng đơn vị kiến thức.
 * nghẽn = tỉ lệ em có dữ liệu mà chưa đạt mức 2 × (1 + số đơn vị phụ thuộc phía sau).
 * Đơn vị nền mà lớp còn hổng được đẩy lên trước vì nó chặn nhiều bài sau.
 *
 * @param {{id:string, prerequisite?:string|null}[]} units
 * @param {{studentId:string, kuId:string, level:number|null}[]} masteryRows
 */
export function classBottlenecks(units, masteryRows) {
  const con = new Map();
  for (const u of units) if (u.prerequisite) con.set(u.prerequisite, [...(con.get(u.prerequisite) ?? []), u.id]);
  const soPhuThuoc = (id, seen = new Set()) => {
    for (const c of con.get(id) ?? []) if (!seen.has(c)) { seen.add(c); soPhuThuoc(c, seen); }
    return seen.size;
  };
  return units.map((u) => {
    const rows = masteryRows.filter((m) => m.kuId === u.id && m.level !== null && m.level !== undefined);
    const chuaDat = rows.filter((m) => m.level < 2).length;
    const tiLe = rows.length ? chuaDat / rows.length : null;
    const dep = soPhuThuoc(u.id);
    return {
      kuId: u.id,
      coDuLieu: rows.length,
      chuaDat,
      tiLeChuaDat: tiLe === null ? null : lamTron(tiLe, 3),
      soPhuThuoc: dep,
      diemNghen: tiLe === null ? null : lamTron(tiLe * (1 + dep), 3)
    };
  }).sort((a, b) => (b.diemNghen ?? -1) - (a.diemNghen ?? -1) || a.kuId.localeCompare(b.kuId));
}

/* ========================================================================= */
/* 3. THUẬT TOÁN 3 — HỌC TỪ GIÁO VIÊN                                       */
/* ========================================================================= */

/**
 * Điểm kinh nghiệm của từng hoạt động, từ lịch sử quyết định và phiếu cuối tiết.
 * Có làm mượt (+2 ở mẫu) để một lần bị bỏ không xoá sổ một hoạt động.
 *
 * @param {{activityIds:string[], action:'chon'|'sua'|'bo', gain?:number|null}[]} history
 * @returns {Record<string, {chon:number, sua:number, bo:number, gainTb:number|null, diem:number}>}
 */
export function activityExperience(history = []) {
  const acc = {};
  for (const h of history) {
    for (const id of new Set(h.activityIds ?? [])) {
      const a = (acc[id] ??= { chon: 0, sua: 0, bo: 0, gains: [] });
      if (h.action === 'chon') a.chon++;
      else if (h.action === 'sua') a.sua++;
      else if (h.action === 'bo') a.bo++;
      if (Number.isFinite(h.gain)) a.gains.push(h.gain);
    }
  }
  const out = {};
  for (const [id, a] of Object.entries(acc)) {
    const n = a.chon + a.sua + a.bo;
    const gainTb = a.gains.length ? a.gains.reduce((s, x) => s + x, 0) / a.gains.length : null;
    const diem = 0.3 * ((a.chon + 0.5 * a.sua - a.bo) / (n + 2)) +
      (gainTb === null ? 0 : 0.2 * Math.max(-1, Math.min(1, gainTb)));
    out[id] = { chon: a.chon, sua: a.sua, bo: a.bo, gainTb: gainTb === null ? null : lamTron(gainTb, 3), diem: lamTron(diem, 3) };
  }
  return out;
}

/* ========================================================================= */
/* 4. THUẬT TOÁN 2 — ĐỀ XUẤT SƯ PHẠM                                        */
/* ========================================================================= */

/**
 * Mức độ một hoạt động khớp một nhóm:
 *   1,0 = đúng lỗi đại diện của nhóm · 0,8 = đúng một lỗi kèm trong nhóm
 *   0,6 = đúng loại nhóm (chưa chuẩn bị, sẵn sàng…) · 0,4 = hoạt động dùng chung
 */
function doKhop(a, g) {
  if (g.kind === 'loi') {
    if (a.errorCodes.includes(g.code)) return 1;
    if (a.errorCodes.some((c) => c !== '*' && g.codes.includes(c))) return 0.8;
    if (a.errorCodes.includes('*') && a.nhom.includes('loi')) return 0.4;
    return 0;
  }
  return a.nhom.includes(g.kind) ? 0.6 : 0;
}

function chonHoatDong(bank, g, exp, { hinhThuc = null, loaiTru = new Set() } = {}) {
  const ung = bank
    .filter((a) => !loaiTru.has(a.id) && (!hinhThuc || hinhThuc.includes(a.hinhThuc)))
    .map((a) => ({ a, khop: doKhop(a, g) }))
    .filter((x) => x.khop > 0)
    .map((x) => ({ ...x, diem: x.khop + (exp[x.a.id]?.diem ?? 0) }))
    .sort((p, q) => q.diem - p.diem || p.a.id.localeCompare(q.a.id));
  return ung[0] ?? null;
}

const phutKhop = (a, muon) => Math.max(a.phut[0], Math.min(a.phut[1], muon));

function lyDoNhom(g, N) {
  if (g.kind === 'loi') return `${g.size}/${N} em mắc ${g.code}${g.codes.length > 1 ? ` (kèm ${g.codes.filter((c) => c !== g.code).join(', ')})` : ''}`;
  if (g.kind === 'chua-chuan-bi') return `${g.size}/${N} em chưa làm bài chuẩn bị hoặc chưa xem bài`;
  if (g.kind === 'doan-mo') return `${g.size}/${N} em làm bài quá nhanh, điểm thấp — chưa đủ tin để kết luận`;
  if (g.kind === 'hong-nen') return `${g.size}/${N} em còn ở mức 0 của đơn vị tiên quyết`;
  if (g.kind === 'san-sang') return `${g.size}/${N} em đã làm chủ, cần nhiệm vụ cao hơn`;
  return `${g.size}/${N} em đạt, chưa lộ lỗi`;
}

function doanKhoiDong(diag, bank) {
  const N = diag.total;
  const ccb = diag.groups.find((g) => g.kind === 'chua-chuan-bi');
  if (ccb && ccb.size / Math.max(1, N) >= 0.15) {
    const a = bank.find((x) => x.id === 'HD-CHUNG-03') ?? null;
    return { phut: KHUNG_TIET.khoiDong, ten: a?.ten ?? 'Nhắc lại cốt lõi', activityId: a?.id ?? null,
      nhom: ccb.key, hocSinh: ccb.studentIds,
      lyDo: `${lyDoNhom(ccb, N)} — xử lý ngay đầu giờ để các em theo kịp phần chính` };
  }
  return { phut: KHUNG_TIET.khoiDong, ten: 'Kiểm tra nhanh 2 câu', activityId: null, nhom: 'ca-lop', hocSinh: [],
    lyDo: 'Phần lớn lớp đã chuẩn bị bài; 2 câu nhanh để xác nhận trước khi vào phần chính' };
}

const doanCuoi = (mucTieu) => [
  { phut: KHUNG_TIET.phieuCuoiTiet, ten: 'Phiếu cuối tiết 3 câu', activityId: null, nhom: 'ca-lop', hocSinh: [],
    lyDo: mucTieu.length ? `Đo lại các lỗi mục tiêu: ${mucTieu.join(', ')}` : 'Đo lại mức nắm bài sau tiết' },
  { phut: KHUNG_TIET.chot, ten: 'Chốt kiến thức, giao bài vận dụng', activityId: null, nhom: 'ca-lop', hocSinh: [],
    lyDo: 'Đóng vòng: bài vận dụng sau giờ học cho điểm post_score' }
];

/**
 * Sinh 3 phương án tổ chức tiết học, xếp hạng theo điểm.
 *
 * @param {ReturnType<typeof diagnoseClass>} diag
 * @param {{bank?: Activity[], experience?: ReturnType<typeof activityExperience>,
 *          learners?: ClassLearner[]}} [opts]
 */
export function recommendPlans(diag, opts = {}) {
  const bank = (opts.bank?.length ? opts.bank : ACTIVITY_BANK);
  const exp = opts.experience ?? {};
  const N = diag.total;
  const vanDe = diag.groups.filter((g) => g.kind !== 'on-dinh' && g.kind !== 'chua-chuan-bi');
  const loi = vanDe.filter((g) => g.kind === 'loi');
  const sanSang = diag.groups.find((g) => g.kind === 'san-sang') ?? null;
  const khoiDong = doanKhoiDong(diag, bank);
  const plans = [];

  /* --- Phương án A: chữa lỗi tập trung cả lớp ------------------------------ */
  {
    const g = loi[0] ?? vanDe[0] ?? null;
    const doan = [khoiDong];
    let diem = 0;
    const mucTieu = [];
    if (g) {
      const c = chonHoatDong(bank, g, exp, { hinhThuc: ['ca-lop'] }) ?? chonHoatDong(bank, g, exp);
      const phut1 = c ? phutKhop(c.a, 12) : 10;
      doan.push({ phut: phut1, ten: c?.a.ten ?? 'Chữa lỗi cả lớp', activityId: c?.a.id ?? null, nhom: 'ca-lop', hocSinh: [],
        lyDo: `${lyDoNhom(g, N)} — nhóm lớn nhất, chữa chung cho cả lớp` });
      diem += g.priority * (c?.khop ?? 0.4) + (c ? exp[c.a.id]?.diem ?? 0 : 0);
      if (g.code) mucTieu.push(g.code);
      const luyen = bank.find((a) => a.id === 'HD-CHUNG-02');
      doan.push({ phut: KHUNG_TIET.chinh - phut1, ten: luyen?.ten ?? 'Luyện tập phân tầng', activityId: luyen?.id ?? null,
        nhom: 'ca-lop', hocSinh: [], lyDo: 'Các nhóm còn lại được phục vụ bằng phiếu phân tầng chung' });
      for (const k of vanDe.slice(1)) diem += k.priority * 0.4;
    } else {
      const luyen = bank.find((a) => a.id === 'HD-CHUNG-02');
      doan.push({ phut: KHUNG_TIET.chinh, ten: luyen?.ten ?? 'Luyện tập phân tầng', activityId: luyen?.id ?? null,
        nhom: 'ca-lop', hocSinh: [], lyDo: 'Chưa lộ nhóm lỗi nổi bật; luyện tập theo tầng' });
    }
    plans.push({ strategy: 'tap-trung', ten: 'Chữa lỗi tập trung cả lớp', doan: [...doan, ...doanCuoi(mucTieu)],
      mucTieuLoi: mucTieu, diem: lamTron(diem, 3),
      tomTat: g ? `Dồn ${doan[1].phut} phút cho cả lớp chữa lỗi phổ biến nhất (${g.size}/${N} em, ${g.code ?? g.ten}), rồi luyện tập phân tầng.` : 'Lớp chưa có lỗi nổi bật; dành thời gian luyện tập phân tầng.' });
  }

  /* --- Phương án B: phân hoá theo nhóm, chạy song song --------------------- */
  {
    const chon = [...loi.slice(0, 3), ...vanDe.filter((g) => g.kind !== 'loi')].slice(0, 3);
    if (sanSang && !chon.includes(sanSang)) chon.push(sanSang);
    const daDung = new Set();
    let diem = 0;
    const mucTieu = [];
    const nhanh = chon.map((g) => {
      const c = chonHoatDong(bank, g, exp, { hinhThuc: ['nhom-dong-chat', 'ca-nhan'], loaiTru: daDung }) ??
        chonHoatDong(bank, g, exp, { loaiTru: daDung });
      if (c && c.a.id !== 'HD-CHUNG-02') daDung.add(c.a.id);
      diem += g.priority * (c?.khop ?? 0);
      if (g.code) mucTieu.push(g.code);
      const p = c ? phutKhop(c.a, KHUNG_TIET.chinh) : KHUNG_TIET.chinh;
      return { nhom: g.key, tenNhom: g.ten, hocSinh: g.studentIds, activityId: c?.a.id ?? null,
        ten: c?.a.ten ?? 'Phiếu phân tầng', phut: p,
        sauDo: p < KHUNG_TIET.chinh ? `${KHUNG_TIET.chinh - p} phút còn lại: phiếu luyện tập phân tầng` : null,
        lyDo: lyDoNhom(g, N) };
    });
    const conLai = N - chon.reduce((s, g) => s + g.size, 0);
    plans.push({ strategy: 'phan-hoa', ten: 'Phân hoá theo nhóm khó khăn', mucTieuLoi: mucTieu,
      doan: [khoiDong,
        { phut: KHUNG_TIET.chinh, ten: 'Làm việc theo nhóm, song song', activityId: null, nhom: 'song-song', hocSinh: [],
          nhanh, lyDo: conLai > 0 ? `${conLai} em còn lại làm phiếu phân tầng chung` : 'Mọi em đều có nhóm' },
        ...doanCuoi(mucTieu)],
      diem: lamTron(diem + nhanh.reduce((s, n) => s + (exp[n.activityId]?.diem ?? 0), 0), 3),
      tomTat: `${nhanh.length} nhóm làm ${nhanh.length} hoạt động khác nhau cùng lúc; giáo viên ngồi với nhóm ưu tiên cao nhất.` });
  }

  /* --- Phương án C: trợ giảng nhí (Jigsaw) hoặc trạm luân phiên ----------- */
  if (sanSang && sanSang.size >= 3 && opts.learners?.length) {
    const tro = bank.find((a) => a.id === 'HD-CHUNG-07');
    const nhomHonHop = buildGroups(opts.learners.map((l) => ({
      id: l.id, name: l.name, mastery: l.mastery ?? 0, quiz: l.quiz, errorCodes: l.errorCodes ?? []
    })), 4);
    const g = loi[0] ?? null;
    let diem = (sanSang.priority * 0.6) + loi.slice(0, 3).reduce((s, k) => s + k.priority * 0.6, 0) + (exp[tro?.id]?.diem ?? 0);
    const mucTieu = loi.slice(0, 3).map((k) => k.code);
    plans.push({ strategy: 'jigsaw', ten: 'Trợ giảng nhí — nhóm hỗn hợp', mucTieuLoi: mucTieu,
      doan: [khoiDong,
        { phut: KHUNG_TIET.chinh, ten: tro?.ten ?? 'Trợ giảng nhí', activityId: tro?.id ?? null, nhom: 'jigsaw', hocSinh: [],
          nhomHonHop: nhomHonHop.map((n) => ({ index: n.index, leaderId: n.leaderId, hocSinh: n.members.map((m) => m.id), loiNoiTroi: n.dominantError })),
          lyDo: `${lyDoNhom(sanSang, N)}; ${g ? lyDoNhom(g, N) : 'lỗi rải rác'} — để em giỏi kèm bạn` },
        ...doanCuoi(mucTieu)],
      diem: lamTron(diem, 3),
      tomTat: `${nhomHonHop.length} nhóm hỗn hợp, mỗi nhóm một em đã làm chủ làm nhóm trưởng.` });
  } else {
    const tram = loi.slice(0, 3);
    const nguon = tram.length ? tram : vanDe.slice(0, 3);
    const daDung = new Set();
    let diem = 0;
    const phutTram = nguon.length ? Math.floor(KHUNG_TIET.chinh / nguon.length) : KHUNG_TIET.chinh;
    const cacTram = nguon.map((g, i) => {
      const c = chonHoatDong(bank, g, exp, { loaiTru: daDung });
      if (c && c.a.id !== 'HD-CHUNG-02') daDung.add(c.a.id);
      diem += g.priority * (c?.khop ?? 0) * 0.8;
      return { tram: i + 1, nhom: g.key, activityId: c?.a.id ?? null, ten: c?.a.ten ?? 'Phiếu phân tầng',
        phut: phutTram, hocSinhBatDau: g.studentIds, lyDo: lyDoNhom(g, N) };
    });
    const mucTieu = nguon.filter((g) => g.code).map((g) => g.code);
    plans.push({ strategy: 'tram', ten: 'Trạm luân phiên', mucTieuLoi: mucTieu,
      doan: [khoiDong,
        { phut: KHUNG_TIET.chinh, ten: 'Trạm luân phiên', activityId: null, nhom: 'tram', hocSinh: [], cacTram,
          lyDo: 'Mỗi em bắt đầu ở trạm đúng lỗi của mình rồi xoay vòng' },
        ...doanCuoi(mucTieu)],
      diem: lamTron(diem, 3),
      tomTat: cacTram.length ? `${cacTram.length} trạm × ${phutTram} phút; mỗi em bắt đầu ở trạm đúng lỗi của mình.` : 'Chưa có dữ liệu để dựng trạm.' });
  }

  return plans
    .map((p) => ({ ...p, tongPhut: p.doan.reduce((s, d) => s + d.phut, 0) }))
    .sort((a, b) => b.diem - a.diem || a.strategy.localeCompare(b.strategy))
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

/* ========================================================================= */
/* 5. ĐO SAU TIẾT                                                           */
/* ========================================================================= */

/**
 * Tỉ lệ còn mắc lỗi mục tiêu trước và sau tiết, trên nhóm được can thiệp.
 * @param {{studentId:string, errorCode:string, before:boolean, after:boolean|null}[]} rows
 *        before = em mắc lỗi ở bài chuẩn bị; after = em còn mắc ở phiếu cuối tiết
 */
export function postLessonGain(rows) {
  const theoLoi = new Map();
  for (const r of rows) {
    if (!r.before || r.after === null || r.after === undefined) continue;
    const a = theoLoi.get(r.errorCode) ?? { n: 0, conMac: 0 };
    a.n++; if (r.after) a.conMac++;
    theoLoi.set(r.errorCode, a);
  }
  return [...theoLoi.entries()].map(([code, a]) => ({
    errorCode: code,
    soEmCanThiep: a.n,
    conMac: a.conMac,
    tiLeConMac: lamTron(a.conMac / a.n, 3),
    deXuatTietSau: a.conMac / a.n >= 0.4
  })).sort((x, y) => y.tiLeConMac - x.tiLeConMac || x.errorCode.localeCompare(y.errorCode));
}

/* ========================================================================= */
/* 6. BẢN ĐỒ LỖI SAI CỦA LỚP                                               */
/* ========================================================================= */

/**
 * Xếp các mã lỗi lớp đang mắc thành cây "lỗi gốc → lỗi kéo theo".
 * Gốc = mã có mặt trong lớp mà không có tổ tiên nào cũng có mặt trong lớp.
 * Mỗi lỗi con treo dưới tổ tiên có mặt gần nhất có nhiều em nhất.
 *
 * @param {Record<string, number>} errorCounts  mã lỗi → số em mắc
 * @param {Record<string, {misconception?: string}>} [info]
 */
export function errorMap(errorCounts, info = {}) {
  const coMat = Object.keys(errorCounts).filter((c) => errorCounts[c] > 0);
  const set = new Set(coMat);
  const chaGanNhat = (code) => {
    // đi lên từng tầng, lấy tổ tiên có mặt gần nhất (nhiều em nhất nếu cùng tầng)
    let tang = CHA.get(code) ?? [];
    const daQua = new Set();
    while (tang.length) {
      const coMatTang = tang.filter((c) => set.has(c));
      if (coMatTang.length) return coMatTang.sort((a, b) => errorCounts[b] - errorCounts[a] || a.localeCompare(b))[0];
      const tiep = [];
      for (const c of tang) if (!daQua.has(c)) { daQua.add(c); tiep.push(...(CHA.get(c) ?? [])); }
      tang = tiep;
    }
    return null;
  };
  const nut = new Map(coMat.map((c) => [c, { code: c, count: errorCounts[c], misconception: info[c]?.misconception ?? null, role: VAI_TRO.get(c) ?? null, children: [] }]));
  const goc = [];
  for (const c of coMat.sort()) {
    const p = chaGanNhat(c);
    if (p && p !== c) nut.get(p).children.push(nut.get(c)); else goc.push(nut.get(c));
  }
  const tong = (n) => n.count + n.children.reduce((s, x) => s + tong(x), 0);
  const sapXep = (arr) => arr.sort((a, b) => tong(b) - tong(a) || a.code.localeCompare(b.code)).map((n) => ({ ...n, total: tong(n), children: sapXep(n.children) }));
  return sapXep(goc);
}

/* ========================================================================= */
/* 7. ĐỀ XUẤT ĐIỀU CHỈNH TIẾT SAU                                           */
/* ========================================================================= */

/**
 * Từ kết quả phiếu cuối tiết, nói giáo viên nên làm gì ở tiết sau.
 * @param {ReturnType<typeof postLessonGain>} gainRows
 * @param {Record<string, {misconception?: string}>} [info]
 */
export function nextLessonAdvice(gainRows, info = {}) {
  if (!gainRows.length) return [];
  return gainRows.map((r) => {
    const ten = info[r.errorCode]?.misconception ?? r.errorCode;
    if (r.deXuatTietSau) {
      return { errorCode: r.errorCode, mucDo: 'can-day-lai', loiKhuyen:
        `${r.conMac}/${r.soEmCanThiep} em vẫn mắc ${r.errorCode} (${ten}). Đưa nhóm này lên đầu tiết sau, đổi sang hoạt động khác với hoạt động vừa dùng.` };
    }
    if (r.conMac > 0) {
      return { errorCode: r.errorCode, mucDo: 'theo-doi', loiKhuyen:
        `${r.conMac}/${r.soEmCanThiep} em còn mắc ${r.errorCode}. Không cần dạy lại cả nhóm; giao vi bài học cho riêng các em này.` };
    }
    return { errorCode: r.errorCode, mucDo: 'da-go', loiKhuyen: `Cả ${r.soEmCanThiep} em đã gỡ được ${r.errorCode}. Có thể chuyển nhóm sang nhiệm vụ cao hơn.` };
  });
}
