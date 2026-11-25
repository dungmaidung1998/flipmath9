/**
 * ============================================================================
 * THUẬT TOÁN ƯỚC LƯỢNG MỨC NẮM BÀI (BAYESIAN KNOWLEDGE TRACING - BKT)
 * ============================================================================
 * Tệp mã nguồn: code/web/lib/dfle/bkt.js
 * Vai trò: Giúp website ước lượng xác suất một học sinh đã THẬT SỰ HIỂU BÀI hay chưa:
 *   - Không tin ngay một câu làm đúng (vì có thể em đoán mò trúng, xác suất đoán mò G = 0.25).
 *   - Không phạt nặng một câu làm sai (vì có thể em hiểu bài nhưng sơ suất tính nhầm, S = 0.1).
 *   - Sau mỗi câu trả lời, xác suất hiểu bài được cập nhật tăng lên (nếu đúng) hoặc giảm đi (nếu sai).
 *   - Khi xác suất đạt ngưỡng 0.95 (95%), hệ thống công nhận em ĐÃ VỮNG KIẾN THỨC.
 */

import { dangTin, computeMasteryV2 } from './mastery.js';

/**
 * 4 THAM SỐ CƠ BẢN CỦA MÔ HÌNH BKT (Dựa trên nghiên cứu chuẩn của Corbett & Anderson, 1995):
 *   - L0 (0.30 = 30%): Xác suất ban đầu học sinh đã biết bài trước khi bắt đầu làm câu đầu tiên.
 *   - T  (0.10 = 10%): Xác suất học sinh học thêm được kiến thức mới sau mỗi câu hỏi vừa làm.
 *   - G  (0.25 = 25%): Xác suất đoán mò trúng (Guess) khi chưa biết bài (vì câu trắc nghiệm có 4 phương án, 1/4 = 0.25).
 *   - S  (0.10 = 10%): Xác suất sơ suất làm sai (Slip) dù trong đầu em đã hiểu bài (như chép nhầm dấu, tính nhẩm ẩu).
 */
export const BKT_MAC_DINH = Object.freeze({ L0: 0.3, T: 0.1, G: 0.25, S: 0.1 });

/** Mốc ngưỡng công nhận học sinh "Đã vững kiến thức": Đạt xác suất từ 95% (0.95) trở lên */
export const NGUONG_DA_NAM = 0.95;

/** Giới hạn trần an toàn khi ước lượng tham số (không để G hoặc S vượt quá 0.30 để mô hình không bị đảo lộn) */
const TRAN_G = 0.3;
const TRAN_S = 0.3;

/** Hàm kẹp giá trị xác suất không bị chạm sát số 0 hoặc số 1 tuyệt đối để tránh lỗi chia cho 0 trong tính toán */
const kep = (x) => Math.min(1 - 1e-6, Math.max(1e-6, x));

/**
 * Hàm dự đoán xác suất học sinh sẽ trả lời ĐÚNG câu tiếp theo khi đang có xác suất hiểu bài là pL:
 * Công thức: P(Đúng) = [Đã hiểu] x [Không sơ suất] + [Chưa hiểu] x [Đoán mò trúng]
 *                    = pL * (1 - S) + (1 - pL) * G
 */
export function duDoanDung(pL, p = BKT_MAC_DINH) {
  // Dòng 1: Nhân xác suất đã biết với tỉ lệ làm cẩn thận (1 - S), cộng với xác suất chưa biết nhân tỉ lệ đoán may mắn (G)
  return pL * (1 - p.S) + (1 - pL) * p.G;
}

/**
 * [SỐ HIỆU TT-01: CÔNG THỨC XÁC SUẤT HẬU NGHIỆM BAYES (BKT UPDATE)]
 * [SỐ HIỆU TT-02: BƯỚC HỌC TĂNG TIẾN T SAU MỖI CÂU (LEARNING STEP)]
 * ---------------------------------------------------------------------------
 * Ý tưởng sư phạm: Sau khi học sinh trả lời xong 1 câu, máy tính cập nhật mức hiểu bài qua 2 bước:
 * 
 * BƯỚC 1 (Định lý Bayes - TT-01):
 *   - Nếu em ĐÚNG:
 *     pL_sau = [ pL * (1 - S) ] / [ pL * (1 - S) + (1 - pL) * G ]
 *     (Tử số là khả năng đúng do thật sự biết; Mẫu số là toàn bộ khả năng trả lời đúng gồm cả biết và đoán mò).
 *   - Nếu em SAI:
 *     pL_sau = [ pL * S ] / [ pL * S + (1 - pL) * (1 - G) ]
 *     (Tử số là khả năng sơ suất; Mẫu số là toàn bộ khả năng làm sai).
 * 
 * BƯỚC 2 (Cộng thêm phần kiến thức thu hoạch được - TT-02):
 *   - Sau khi đọc lời giải thích của câu hỏi, em học thêm được một lượng kiến thức với xác suất T = 0.1:
 *     pL_mới = pL_sau + (1 - pL_sau) * T
 * 
 * @param {number} pL: Xác suất học sinh hiểu bài TRƯỚC khi làm câu này (ví dụ ban đầu là L0 = 0.3)
 * @param {boolean} dung: Kết quả trả lời (true = làm đúng, false = làm sai)
 * @param {typeof BKT_MAC_DINH} p: Bộ tham số BKT (mặc định L0=0.3, T=0.1, G=0.25, S=0.1)
 * @returns {number} Xác suất hiểu bài MỚI sau khi đã ghi nhận câu trả lời
 */
export function capNhat(pL, dung, p = BKT_MAC_DINH) {
  // [SỐ HIỆU TT-01] Dòng 1: Tính xác suất hiểu bài hậu nghiệm (pL_sau) ngay sau khi nhìn thấy kết quả đúng/sai
  const sau = dung
    // Nếu ĐÚNG: Tăng xác suất nhưng trừ hao khả năng đoán mò G = 0.25
    ? (pL * (1 - p.S)) / (pL * (1 - p.S) + (1 - pL) * p.G)
    // Nếu SAI: Giảm xác suất nhưng không về 0 vì có thể do sơ suất S = 0.1
    : (pL * p.S) / (pL * p.S + (1 - pL) * (1 - p.G));

  // [SỐ HIỆU TT-02] Dòng 2: Cộng thêm phần học được (T = 0.1) vào phần kiến thức còn khuyết (1 - sau)
  return sau + (1 - sau) * p.T;
}

/** Chuẩn bị dữ liệu: Lọc các câu làm bài đáng tin cậy (bỏ bấm bừa) và xếp theo trình tự thời gian */
export function chuanBi(quanSats) {
  // Dòng 1: Lọc qua bộ lọc chống bấm bừa dangTin, rồi sắp xếp theo thời gian nộp bài từ cũ đến mới
  return (quanSats ?? [])
    .filter(dangTin)
    .slice()
    .sort((a, b) => a.ts - b.ts || a.questionId.localeCompare(b.questionId));
}

/**
 * Chạy mô phỏng thuật toán BKT trên toàn bộ chuỗi câu trả lời của 1 học sinh ở 1 bài học
 * @param {any[]} quanSats
 * @param {typeof BKT_MAC_DINH} [p]
 * @returns {{pL:number, daNam:boolean, soCau:number, duDoan:Array<{p:number,y:0|1}>}}
 */
export function chayChuoi(quanSats, p = BKT_MAC_DINH) {
  // Dòng 1: Lấy danh sách các câu hỏi hợp lệ đã xếp thứ tự thời gian
  const ds = chuanBi(quanSats);

  // Dòng 2: Khởi tạo mức hiểu bài bằng giá trị ban đầu L0 (0.30 = 30%)
  let pL = p.L0;

  // Dòng 3: Tạo mảng lưu lại lịch sử dự đoán trước mỗi câu
  const duDoan = [];

  // Dòng 4: Duyệt qua từng câu hỏi học sinh đã làm
  for (const q of ds) {
    // Dòng 5: Ghi lại dự đoán xác suất đúng trước câu này và kết quả thực tế (1: đúng, 0: sai)
    duDoan.push({ p: duDoanDung(pL, p), y: q.isCorrect ? 1 : 0 });

    // Dòng 6: Cập nhật mức hiểu bài mới sau câu này theo TT-01 và TT-02
    pL = capNhat(pL, q.isCorrect, p);
  }

  // Dòng 7: Trả về kết quả: mức hiểu bài hiện tại, cờ xác nhận đã vững (>= 0.95) và số câu đã làm
  return { pL, daNam: pL >= NGUONG_DA_NAM, soCau: ds.length, duDoan };
}

// --------------------------------------------------------------- đo độ tốt

/** Hàm tính độ lệch Log-loss trung bình (dùng trong nghiên cứu để đánh giá độ chính xác của mô hình) */
export function logLoss(cap) {
  if (!cap.length) return null;
  let s = 0;
  for (const { p, y } of cap) s -= y ? Math.log(kep(p)) : Math.log(1 - kep(p));
  return s / cap.length;
}

/** Hàm tính chỉ số AUC (Độ phân biệt câu đúng/sai của mô hình xác suất) */
export function auc(cap) {
  const dung = cap.filter((c) => c.y === 1).length;
  const sai = cap.length - dung;
  if (!dung || !sai) return null;
  const xep = cap.slice().sort((a, b) => a.p - b.p);
  let hang = 0, i = 0, tongHangDung = 0;
  while (i < xep.length) {
    let j = i;
    while (j + 1 < xep.length && xep[j + 1].p === xep[i].p) j++;
    const hangTB = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) if (xep[k].y === 1) tongHangDung += hangTB;
    i = j + 1;
  }
  hang = tongHangDung - (dung * (dung + 1)) / 2;
  return hang / (dung * sai);
}

// --------------------------------------------------------- ước lượng tham số

/** Hàm dò tìm bộ 4 tham số tối ưu (Grid Search) dựa trên dữ liệu thực tế của học sinh */
export function uocLuongThamSo(cacChuoi, luoi = {}) {
  const L0s = luoi.L0 ?? [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
  const Ts = luoi.T ?? [0.02, 0.05, 0.1, 0.15, 0.2, 0.3];
  const Gs = (luoi.G ?? [0.05, 0.1, 0.15, 0.2, 0.25, 0.3]).filter((g) => g <= TRAN_G);
  const Ss = (luoi.S ?? [0.02, 0.05, 0.1, 0.15, 0.2, 0.3]).filter((s) => s <= TRAN_S);
  const chuoi = cacChuoi.map(chuanBi).filter((c) => c.length);
  let tot = null;
  for (const L0 of L0s) for (const T of Ts) for (const G of Gs) for (const S of Ss) {
    const p = { L0, T, G, S };
    let tong = 0, n = 0;
    for (const c of chuoi) {
      let pL = L0;
      for (const q of c) {
        const d = kep(duDoanDung(pL, p));
        tong -= q.isCorrect ? Math.log(d) : Math.log(1 - d);
        n++;
        pL = capNhat(pL, q.isCorrect, p);
      }
    }
    if (n && (!tot || tong / n < tot.logLoss)) tot = { thamSo: p, logLoss: tong / n, soQuanSat: n };
  }
  return tot;
}

// --------------------------------------------------------- so với mastery v2

function mucV2TruocMoiCau(quanSats) {
  const ds = chuanBi(quanSats);
  return ds.map((q, i) => ({ muc: computeMasteryV2(ds.slice(0, i)).level, y: q.isCorrect ? 1 : 0 }));
}

const khoaMuc = (m) => (m === null || m === undefined ? 'chua-du' : String(m));

/** So sánh đối chiếu mô hình BKT với mô hình Xếp cấp độ v2 trên cùng một tập dữ liệu học sinh */
export function soSanhVoiMasteryV2(duLieu, tuyChon = {}) {
  const hs = [...duLieu.keys()].sort();
  const phan = [hs.filter((_, i) => i % 2 === 0), hs.filter((_, i) => i % 2 === 1)];
  const capBkt = [], capV2 = [];
  const thamSoDaDung = [];

  for (let k = 0; k < 2; k++) {
    const huan = phan[k], thu = phan[1 - k];
    const chuoiHuan = huan.flatMap((h) => [...duLieu.get(h).values()]);

    const p = tuyChon.uocLuong === false
      ? BKT_MAC_DINH
      : uocLuongThamSo(chuoiHuan)?.thamSo ?? BKT_MAC_DINH;
    thamSoDaDung.push(p);

    const dem = {};
    for (const c of chuoiHuan) for (const { muc, y } of mucV2TruocMoiCau(c)) {
      const kk = khoaMuc(muc);
      dem[kk] ??= { dung: 1, tong: 2 };
      dem[kk].dung += y; dem[kk].tong += 1;
    }
    const tiLeChung = (() => {
      const t = Object.values(dem).reduce((a, d) => [a[0] + d.dung, a[1] + d.tong], [0, 0]);
      return t[1] ? t[0] / t[1] : 0.5;
    })();

    for (const h of thu) for (const c of duLieu.get(h).values()) {
      capBkt.push(...chayChuoi(c, p).duDoan);
      for (const { muc, y } of mucV2TruocMoiCau(c)) {
        const d = dem[khoaMuc(muc)];
        capV2.push({ p: d ? d.dung / d.tong : tiLeChung, y });
      }
    }
  }

  const bangCheo = {};
  const pChung = tuyChon.uocLuong === false ? BKT_MAC_DINH : thamSoDaDung[0];
  for (const h of hs) for (const c of duLieu.get(h).values()) {
    const b = chayChuoi(c, pChung);
    if (!b.soCau) continue;
    const hang = b.daNam ? 'BKT đã nắm' : 'BKT chưa nắm';
    const cot = khoaMuc(computeMasteryV2(c).level);
    bangCheo[hang] ??= {};
    bangCheo[hang][cot] = (bangCheo[hang][cot] ?? 0) + 1;
  }

  return {
    soHocSinh: hs.length,
    soDuDoan: capBkt.length,
    bkt: { auc: auc(capBkt), logLoss: logLoss(capBkt) },
    masteryV2: { auc: auc(capV2), logLoss: logLoss(capV2) },
    thamSo: thamSoDaDung,
    bangCheo
  };
}
