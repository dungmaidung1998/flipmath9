/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * THỐNG KÊ THỰC NGHIỆM TỰ ĐỘNG CHO BÁO CÁO KHKT (thuần TypeScript, không phụ thuộc thư viện ngoài).
 * Gồm: trung bình, độ lệch chuẩn mẫu (n-1), tứ phân vị (Box Plot), Cohen's d,
 * t-test độc lập (Student two-sample), t-test ghép cặp (paired), và hàm tự kiểm thử.
 */

export type TuPhanVi = {
  n: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  sd: number | null;
};

export type KetQuaSoSanhDocLap = {
  n1: number;
  n2: number;
  mean1: number | null;
  mean2: number | null;
  sd1: number | null;
  sd2: number | null;
  chenhLech: number | null; // mean1 - mean2
  cohenD: number | null;
  mucAnhHuong: string;
  t: number | null;
  df: number | null;
  p: number | null;
  coYNgia05: boolean | null;
};

export type KetQuaGhepCap = {
  n: number;
  meanTruoc: number | null;
  meanSau: number | null;
  sdTruoc: number | null;
  sdSau: number | null;
  chenhLechTB: number | null; // sau - truoc
  sdChenhLech: number | null;
  cohenDz: number | null;
  t: number | null;
  df: number | null;
  p: number | null;
};

/**
 * Hàm `trungBinh`: nhận (xs), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function trungBinh(xs: number[]): number | null {
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/**
 * Hàm `doLechChuan`: nhận (xs), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function doLechChuan(xs: number[]): number | null {
  if (xs.length < 2) return null;
  const m = trungBinh(xs)!;
  const ss = xs.reduce((s, x) => s + (x - m) * (x - m), 0);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  return Math.sqrt(ss / (xs.length - 1));
}

/**
 * Hàm `phanViTuyenTinh`: nhận (sorted, p), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function phanViTuyenTinh(sorted: number[], p: number): number {
  if (sorted.length === 1) return sorted[0];
  const idx = p * (sorted.length - 1);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const lo = Math.floor(idx);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/**
 * Hàm `tuPhanVi`: nhận (xs), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tuPhanVi(xs: number[]): TuPhanVi | null {
  if (!xs.length) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  return {
    n: sorted.length,
    min: sorted[0],
    q1: phanViTuyenTinh(sorted, 0.25),
    median: phanViTuyenTinh(sorted, 0.5),
    q3: phanViTuyenTinh(sorted, 0.75),
    max: sorted[sorted.length - 1],
    mean: trungBinh(sorted)!,
    sd: doLechChuan(sorted),
  };
}

// Lanczos log-gamma
function lnGamma(z: number): number {
  const cof = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953,
  ];
  let y = z;
  let tmp = z + 5.5;
  tmp -= (z + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / z);
}

/**
 * Hàm `betacf`: nhận (a, b, x), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-12;
  const FPMIN = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Hàm beta chính quy I_x(a, b) — dùng tính p-value hai đuôi của phân phối Student-t. */
export function betaChinhQuy(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(a, b, x)) / a;
  }
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/**
 * Hàm `pValueTuT`: nhận (t, df), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function pValueTuT(t: number, df: number): number {
  if (!Number.isFinite(t) || df <= 0) return 1;
  if (t === 0) return 1;
  const x = df / (df + t * t);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  return Math.max(0, Math.min(1, betaChinhQuy(df / 2, 0.5, x)));
}

/**
 * Hàm `phanLoaiCohenD`: nhận (d), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function phanLoaiCohenD(d: number | null): string {
  if (d == null || !Number.isFinite(d)) return 'Chưa đủ dữ liệu';
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const ad = Math.abs(d);
  if (ad < 0.2) return 'Rất nhỏ (< 0,2)';
  if (ad < 0.5) return 'Nhỏ (0,2–0,5)';
  if (ad < 0.8) return 'Trung bình (0,5–0,8)';
  return 'Lớn (≥ 0,8)';
}

/** Cohen's d dùng độ lệch chuẩn gộp (pooled SD) giữa nhóm 1 (TN) và nhóm 2 (ĐC). */
export function cohenD(a: number[], b: number[]): number | null {
  if (a.length < 2 || b.length < 2) return null;
  const m1 = trungBinh(a)!;
  const m2 = trungBinh(b)!;
  const sd1 = doLechChuan(a)!;
  const sd2 = doLechChuan(b)!;
  const df = a.length + b.length - 2;
  const sp2 = ((a.length - 1) * sd1 * sd1 + (b.length - 1) * sd2 * sd2) / df;
  if (sp2 <= 0) return 0;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  return (m1 - m2) / Math.sqrt(sp2);
}

/** Kiểm định t độc lập hai mẫu (two-sample Student's t-test, hai đuôi). */
export function tTestDocLap(a: number[], b: number[]): KetQuaSoSanhDocLap {
  const n1 = a.length;
  const n2 = b.length;
  const mean1 = trungBinh(a);
  const mean2 = trungBinh(b);
  const sd1 = doLechChuan(a);
  const sd2 = doLechChuan(b);
  const chenhLech = mean1 != null && mean2 != null ? mean1 - mean2 : null;

  if (n1 < 2 || n2 < 2 || sd1 == null || sd2 == null) {
    return {
      n1,
      n2,
      mean1,
      mean2,
      sd1,
      sd2,
      chenhLech,
      cohenD: null,
      mucAnhHuong: 'Chưa đủ dữ liệu (cần ≥ 2 HS mỗi nhóm)',
      t: null,
      df: null,
      p: null,
      coYNgia05: null,
    };
  }

  const df = n1 + n2 - 2;
  const sp2 = ((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / df;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const d = sp2 > 0 ? (mean1! - mean2!) / Math.sqrt(sp2) : 0;
  const se = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
  const t = se > 0 ? (mean1! - mean2!) / se : 0;
  const p = se > 0 ? pValueTuT(t, df) : 1;

  return {
    n1,
    n2,
    mean1,
    mean2,
    sd1,
    sd2,
    chenhLech,
    cohenD: d,
    mucAnhHuong: phanLoaiCohenD(d),
    t,
    df,
    p,
    coYNgia05: p < 0.05,
  };
}

/** Kiểm định t ghép cặp (paired t-test) cho cùng một nhóm học sinh trước – sau. */
export function tTestGhepCap(truoc: number[], sau: number[]): KetQuaGhepCap {
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const n = Math.min(truoc.length, sau.length);
  if (n === 0) {
    return {
      n: 0,
      meanTruoc: null,
      meanSau: null,
      sdTruoc: null,
      sdSau: null,
      chenhLechTB: null,
      sdChenhLech: null,
      cohenDz: null,
      t: null,
      df: null,
      p: null,
    };
  }
  const x1 = truoc.slice(0, n);
  const x2 = sau.slice(0, n);
  const diff = x2.map((v, i) => v - x1[i]);
  const meanTruoc = trungBinh(x1);
  const meanSau = trungBinh(x2);
  const sdTruoc = doLechChuan(x1);
  const sdSau = doLechChuan(x2);
  const chenhLechTB = trungBinh(diff);
  const sdChenhLech = doLechChuan(diff);

  if (n < 2 || sdChenhLech == null) {
    return {
      n,
      meanTruoc,
      meanSau,
      sdTruoc,
      sdSau,
      chenhLechTB,
      sdChenhLech: null,
      cohenDz: null,
      t: null,
      df: null,
      p: null,
    };
  }

  const df = n - 1;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const se = sdChenhLech / Math.sqrt(n);
  const t = se > 0 ? chenhLechTB! / se : 0;
  const p = se > 0 ? pValueTuT(t, df) : 1;
  const cohenDz = sdChenhLech > 0 ? chenhLechTB! / sdChenhLech : 0;

  return {
    n,
    meanTruoc,
    meanSau,
    sdTruoc,
    sdSau,
    chenhLechTB,
    sdChenhLech,
    cohenDz,
    t,
    df,
    p,
  };
}

const fmt = (v: number | null, digits = 2) =>
  v == null || !Number.isFinite(v) ? '—' : v.toFixed(digits).replace('.', ',');

/** Tạo đoạn văn học thuật trung thực (không phóng đại) để chép vào báo cáo KHKT. */
export function taoDoanVanBaoCao(params: {
  chuongNhan: string;
  dauVao: KetQuaSoSanhDocLap;
  sauTNvsDC: KetQuaSoSanhDocLap;
  truocSauTN: KetQuaGhepCap;
  truocSauDC: KetQuaGhepCap;
}): string {
  const { chuongNhan, dauVao, sauTNvsDC, truocSauTN } = params;
  const coMauNho =
    sauTNvsDC.n1 < 30 ||
    sauTNvsDC.n2 < 30 ||
    (truocSauTN.n > 0 && truocSauTN.n < 30);

  if (sauTNvsDC.n1 === 0 && sauTNvsDC.n2 === 0 && truocSauTN.n === 0) {
    return `Trong phạm vi ${chuongNhan}, chưa có đủ bài đánh giá đã nộp để tính toán so sánh thống kê giữa nhóm thực nghiệm (TN) và nhóm đối chứng (ĐC).`;
  }

  const doan: string[] = [];
  if (dauVao.n1 >= 2 && dauVao.n2 >= 2) {
    doan.push(
      `Ở bài đánh giá đầu vào (${chuongNhan}), nhóm Thực nghiệm (n = ${dauVao.n1}) đạt điểm trung bình ${fmt(dauVao.mean1)} ± ${fmt(dauVao.sd1)} và nhóm Đối chứng (n = ${dauVao.n2}) đạt ${fmt(dauVao.mean2)} ± ${fmt(dauVao.sd2)} (chênh lệch ${fmt(dauVao.chenhLech)}, t(${dauVao.df}) = ${fmt(dauVao.t)}, p = ${fmt(dauVao.p, 3)}).`
    );
  }

  if (sauTNvsDC.n1 >= 2 && sauTNvsDC.n2 >= 2) {
    const huong = (sauTNvsDC.chenhLech ?? 0) >= 0 ? 'cao hơn' : 'thấp hơn';
    const yNghia =
      sauTNvsDC.p != null && sauTNvsDC.p < 0.05
        ? 'sự khác biệt có ý nghĩa thống kê ở mức α = 0,05'
        : 'sự khác biệt chưa đạt ý nghĩa thống kê ở mức α = 0,05';
    doan.push(
      `Ở bài kiểm tra chương sau tác động, điểm trung bình của nhóm Thực nghiệm (n = ${sauTNvsDC.n1}) là ${fmt(sauTNvsDC.mean1)} ± ${fmt(sauTNvsDC.sd1)}, ${huong} nhóm Đối chứng (n = ${sauTNvsDC.n2}, TB = ${fmt(sauTNvsDC.mean2)} ± ${fmt(sauTNvsDC.sd2)}) là ${fmt(sauTNvsDC.chenhLech != null ? Math.abs(sauTNvsDC.chenhLech) : null)} điểm; phép kiểm định t độc lập cho thấy t(${sauTNvsDC.df}) = ${fmt(sauTNvsDC.t)}, p = ${fmt(sauTNvsDC.p, 3)} (${yNghia}), với chỉ số mức độ ảnh hưởng Cohen's d = ${fmt(sauTNvsDC.cohenD)} (${sauTNvsDC.mucAnhHuong}).`
    );
  }

  if (truocSauTN.n >= 2) {
    doan.push(
      `Xét theo cặp trước–sau trên ${truocSauTN.n} học sinh nhóm Thực nghiệm có đủ cả hai bài đo, điểm trung bình thay đổi từ ${fmt(truocSauTN.meanTruoc)} lên ${fmt(truocSauTN.meanSau)} (chênh lệch ${fmt(truocSauTN.chenhLechTB)}, t(${truocSauTN.df}) = ${fmt(truocSauTN.t)}, p = ${fmt(truocSauTN.p, 3)}).`
    );
  }

  if (coMauNho) {
    doan.push(
      `Lưu ý phương pháp luận: Do cỡ mẫu quan sát hiện tại còn nhỏ (n < 30 ở ít nhất một nhóm so sánh), cần diễn giải thận trọng và xem đây là bằng chứng định hướng sơ bộ trước khi khái quát hoá rộng hơn.`
    );
  }

  return doan.join(' ');
}

/** Hàm tự kiểm thử toán học thống kê với bộ số chuẩn đã biết đáp số. */
export function kiemThuThongKe(): { ok: boolean; chiTiet: string[] } {
  const chiTiet: string[] = [];
  const assertClose = (ten: string, actual: number | null, expected: number, tol = 1e-4) => {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (actual == null || Math.abs(actual - expected) > tol) {
      throw new Error(`Kiểm thử ${ten} thất bại: nhận ${actual}, kỳ vọng ${expected}`);
    }
    chiTiet.push(`${ten}: ${actual.toFixed(5)} (kỳ vọng ${expected.toFixed(5)})`);
  };

  // Bộ mẫu chuẩn: a = [8, 9, 7, 8, 10] (mean=8.4, sd=1.140175), b = [6, 7, 5, 6, 7] (mean=6.2, sd=0.83666)
  // pooled var = (4*1.3 + 4*0.7)/8 = 1.0 -> sp = 1.0 -> Cohen's d = 2.2, SE = sqrt(2/5) = 0.6324555, t = 3.478505, df = 8, p(two-tailed) ≈ 0.008346
  const a = [8, 9, 7, 8, 10];
  const b = [6, 7, 5, 6, 7];
  const ind = tTestDocLap(a, b);
  assertClose('mean1', ind.mean1, 8.4);
  assertClose('mean2', ind.mean2, 6.2);
  assertClose('sd1', ind.sd1, 1.1401754);
  assertClose('sd2', ind.sd2, 0.83666);
  assertClose('cohenD', ind.cohenD, 2.2);
  assertClose('t_doc_lap', ind.t, 3.4785054);
  assertClose('p_doc_lap', ind.p, 0.0083457);

  // Paired test: truoc = [5, 6, 6, 7], sau = [7, 8, 7, 9] -> diff = [2, 2, 1, 2], mean=1.75, sd=0.5, se=0.25, t=7.0, df=3, p≈0.005992
  const paired = tTestGhepCap([5, 6, 6, 7], [7, 8, 7, 9]);
  assertClose('paired_mean', paired.chenhLechTB, 1.75);
  assertClose('paired_t', paired.t, 7.0);
  assertClose('paired_p', paired.p, 0.005992);

  // Quartiles: [1, 2, 3, 4, 5] -> min=1, q1=2, median=3, q3=4, max=5
  const q = tuPhanVi([5, 1, 4, 2, 3])!;
  assertClose('q1', q.q1, 2);
  assertClose('median', q.median, 3);
  assertClose('q3', q.q3, 4);

  return { ok: true, chiTiet };
}
