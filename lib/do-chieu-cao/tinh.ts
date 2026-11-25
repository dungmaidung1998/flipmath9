/**
 * FILE NÀY LÀM GÌ: Hàm toán học thuần Chương IV (đo chiều cao Đà Nẵng 1 điểm/2 điểm, sai số, cảm biến, gợi ý 3 tầng).
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Tính toán hình học và xử lý số liệu cho tính năng "Đo chiều cao Đà Nẵng" (Chương IV).
 * Module thuần TypeScript, không phụ thuộc DOM/React.
 */

export type CachDoChieuCao = 'mot-diem' | 'hai-diem';

export type LoiDoChieuCaoKetQua = {
  maLoi: string;
  moTa: string;
};

const RAD = Math.PI / 180;

/**
 * Hàm `lamTron`: nhận (x, chuSo), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function lamTron(x: number, chuSo = 2): number {
  const f = 10 ** chuSo;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  return Math.round((x + Number.EPSILON) * f) / f;
}

/**
 * Hàm `dinhDangSoVN`: nhận (x, chuSo), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function dinhDangSoVN(x: number | null | undefined, chuSo = 2): string {
  if (x == null || !Number.isFinite(x)) return '—';
  return x.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: chuSo,
  });
}

/** Chuyển chuỗi số người dùng nhập (chấp nhận dấu phẩy thập phân kiểu Việt Nam) thành number. */
export function phanTichSoNhap(raw: string): number | null {
  const clean = String(raw ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/,/g, '.');
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (!clean || !/^[+-]?\d+(?:\.\d+)?$/.test(clean)) return null;
  const val = Number(clean);
  return Number.isFinite(val) ? val : null;
}

/** Cách đo 1 điểm (đứng tới được chân vật): h = d · tan α + m, làm tròn 0,01 m. */
export function chieuCaoMotDiem(d: number, alphaDo: number, m: number): number {
  if (!Number.isFinite(d) || d <= 0) {
    throw new Error('Khoảng cách d phải lớn hơn 0 m.');
  }
  if (!Number.isFinite(alphaDo) || alphaDo <= 0 || alphaDo >= 90) {
    throw new Error('Góc nâng α phải nằm trong khoảng từ 1° đến 89° (không bằng 0° hoặc 90°).');
  }
  if (!Number.isFinite(m) || m < 0) {
    throw new Error('Chiều cao mắt m không được âm.');
  }
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const h = d * Math.tan(alphaDo * RAD) + m;
  return lamTron(h, 2);
}

/**
 * Cách đo 2 điểm (không tới được chân vật):
 * Đứng tại A đo góc α₁, lùi ra xa a mét tới B đo góc α₂ (α₁ > α₂).
 * h = a · tan α₁ · tan α₂ / (tan α₁ − tan α₂) + m, làm tròn 0,01 m.
 */
export function chieuCaoHaiDiem(a: number, alpha1Do: number, alpha2Do: number, m: number): number {
  if (!Number.isFinite(a) || a <= 0) {
    throw new Error('Khoảng lùi a phải lớn hơn 0 m.');
  }
  if (
    !Number.isFinite(alpha1Do) ||
    !Number.isFinite(alpha2Do) ||
    alpha1Do <= 0 ||
    alpha1Do >= 90 ||
    alpha2Do <= 0 ||
    alpha2Do >= 90
  ) {
    throw new Error('Hai góc nâng α₁, α₂ phải lớn hơn 0° và nhỏ hơn 90°.');
  }
  if (alpha1Do <= alpha2Do) {
    throw new Error('Góc ở vị trí gần (α₁) phải lớn hơn góc khi lùi ra xa (α₂).');
  }
  if (!Number.isFinite(m) || m < 0) {
    throw new Error('Chiều cao mắt m không được âm.');
  }
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const t1 = Math.tan(alpha1Do * RAD);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const t2 = Math.tan(alpha2Do * RAD);
  const mau = t1 - t2;
  if (mau <= 1e-6) {
    throw new Error('Hai góc α₁ và α₂ quá gần nhau để tính chính xác.');
  }
  const h = (a * t1 * t2) / mau + m;
  return lamTron(h, 2);
}

/** Khoảng cách ngang từ điểm đứng gần hơn (A) tới chân vật trong cách đo 2 điểm. */
export function khoangCachGanHaiDiem(a: number, alpha1Do: number, alpha2Do: number): number {
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const t1 = Math.tan(alpha1Do * RAD);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const t2 = Math.tan(alpha2Do * RAD);
  if (!(a > 0) || !(alpha1Do > alpha2Do) || t1 <= t2) return 0;
  return lamTron((a * t2) / (t1 - t2), 2);
}

/** Sai số tương đối (%) so với chiều cao thật hThat (> 0), làm tròn 0,1%. */
export function saiSoTuongDoi(hDo: number, hThat: number): number {
  if (!Number.isFinite(hDo) || !Number.isFinite(hThat) || hThat <= 0) {
    throw new Error('Chiều cao thật phải lớn hơn 0 m để tính sai số.');
  }
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  return lamTron((Math.abs(hDo - hThat) / hThat) * 100, 1);
}

/** Trung vị của danh sách mẫu góc trong 1 giây để chống rung tay. */
export function trungViGoc(mau: number[]): number {
  const sach = mau.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!sach.length) return 0;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const giua = Math.floor(sach.length / 2);
  const med = sach.length % 2 === 1 ? sach[giua] : (sach[giua - 1] + sach[giua]) / 2;
  return lamTron(med, 2);
}

/** Biên độ dao động (max - min) để chỉ bật nút Khoá góc khi < 1°. */
export function doDaoDongGoc(mau: number[]): number {
  const sach = mau.filter((x) => Number.isFinite(x));
  if (sach.length < 2) return Infinity;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  return lamTron(Math.max(...sach) - Math.min(...sach), 3);
}

/** Áp dụng độ lệch hiệu chỉnh (đặt về 0°) và giới hạn hợp lý (-89°..89°). */
export function doLechHieuChinh(gocTho: number, doLech: number): number {
  if (!Number.isFinite(gocTho)) return 0;
  const offset = Number.isFinite(doLech) ? doLech : 0;
  const goc = gocTho - offset;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  return lamTron(Math.max(-89, Math.min(89, goc)), 2);
}

/**
 * Quy đổi góc nghiêng từ cảm biến DeviceOrientation (beta, gamma) và góc xoay màn hình
 * về góc nâng α so với phương ngang (máy dựng đứng nhìn thẳng là 0°, ngửa lên là dương).
 */
export function tinhGocNangTuCamBien(
  beta: number | null,
  gamma: number | null,
  screenAngle = 0
): number | null {
  const angle = ((screenAngle % 360) + 360) % 360;
  if (angle === 90 && gamma != null && Number.isFinite(gamma)) {
    return lamTron(-gamma - 90, 2);
  }
  if (angle === 270 && gamma != null && Number.isFinite(gamma)) {
    return lamTron(gamma - 90, 2);
  }
  if (beta == null || !Number.isFinite(beta)) return null;
  if (angle === 180) return lamTron(-beta - 90, 2);
  return lamTron(beta - 90, 2);
}

/** Kiểm tra đáp số học sinh tự tính chấp nhận sai lệch ≤ 2% (tối thiểu 0,05 m). */
export function kiemTraKetQuaHS(hHsNhap: number, hMayTinh: number): boolean {
  if (!Number.isFinite(hHsNhap) || !Number.isFinite(hMayTinh) || hMayTinh <= 0) return false;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const nguong = Math.max(0.05, Math.abs(hMayTinh) * 0.02);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  return Math.abs(hHsNhap - hMayTinh) <= nguong;
}

/** Nhận diện mã lỗi Toán 9 dựa trên đáp số sai của học sinh ở phép đo chiều cao. */
export function nhanDienMaLoiDoChieuCao(params: {
  cachDo: CachDoChieuCao;
  hHsNhap: number;
  hTinh: number;
  d: number;
  a?: number;
  alpha1: number;
  alpha2?: number;
  m: number;
}): LoiDoChieuCaoKetQua | null {
  const { cachDo, hHsNhap, hTinh, d, a = 0, alpha1, alpha2 = 0, m } = params;
  if (!Number.isFinite(hHsNhap) || kiemTraKetQuaHS(hHsNhap, hTinh)) return null;

  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const gan = (x: number) => Number.isFinite(x) && Math.abs(hHsNhap - x) <= Math.max(0.08, Math.abs(x) * 0.03);

  if (m > 0.1 && gan(hTinh - m)) {
    return {
      maLoi: 'E-HTL-05',
      moTa: 'Quên cộng chiều cao mắt người đo m vào phần chiều cao phía trên tầm mắt.',
    };
  }

  if (cachDo === 'mot-diem') {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const tanRadMode = d * Math.tan(alpha1) + m;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (Math.abs(tanRadMode - hTinh) > 0.25 && gan(tanRadMode)) {
      return {
        maLoi: 'E-HTL-03',
        moTa: 'Bấm máy tính ở chế độ Radian (RAD) thay vì chế độ Độ (DEG).',
      };
    }
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const cotVal = d / Math.tan(alpha1 * RAD) + m;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (gan(cotVal) || gan(d / Math.tan(alpha1 * RAD))) {
      return {
        maLoi: 'E-HTL-02',
        moTa: 'Nhầm công thức: lấy d chia cho tan α (hoặc dùng cot α) thay vì d × tan α.',
      };
    }
    const sinVal = d * Math.sin(alpha1 * RAD) + m;
    const cosVal = d * Math.cos(alpha1 * RAD) + m;
    if (gan(sinVal) || gan(cosVal) || gan(d * Math.sin(alpha1 * RAD))) {
      return {
        maLoi: 'E-HTL-01',
        moTa: 'Dùng sin α hoặc cos α thay vì tan α khi chỉ biết cạnh kề góc vuông.',
      };
    }
  } else if (cachDo === 'hai-diem' && a > 0 && alpha2 > 0) {
    const radMode =
      (a * Math.tan(alpha1) * Math.tan(alpha2)) / (Math.tan(alpha1) - Math.tan(alpha2)) + m;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (Number.isFinite(radMode) && Math.abs(radMode - hTinh) > 0.25 && gan(radMode)) {
      return {
        maLoi: 'E-HTL-03',
        moTa: 'Bấm máy tính ở chế độ Radian (RAD) thay vì chế độ Độ (DEG).',
      };
    }
    const cotDiff = a / (1 / Math.tan(alpha2 * RAD) - 1 / Math.tan(alpha1 * RAD));
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const nhamCong = (a * Math.tan(alpha1 * RAD) * Math.tan(alpha2 * RAD)) / (Math.tan(alpha1 * RAD) + Math.tan(alpha2 * RAD)) + m;
    if (gan(nhamCong) || !gan(cotDiff + m)) {
      // Nếu khớp công thức dùng sin/cos thay tan hoặc nhầm cạnh đối/kề ở hai điểm
      const nhamSin = (a * Math.sin(alpha1 * RAD) * Math.sin(alpha2 * RAD)) / Math.max(1e-5, Math.sin(alpha1 * RAD) - Math.sin(alpha2 * RAD)) + m;
      if (gan(nhamSin)) {
        return {
          maLoi: 'E-HTL-01',
          moTa: 'Dùng sin thay vì tan trong công thức đo hai điểm.',
        };
      }
      if (gan(nhamCong)) {
        return {
          maLoi: 'E-HTL-02',
          moTa: 'Nhầm dấu ở mẫu số công thức đo hai điểm (tan α₁ − tan α₂).',
        };
      }
    }
  }

  return {
    maLoi: 'E-TSLG-01',
    moTa: 'Xác định nhầm cạnh đối/cạnh kề hoặc nhầm phép tính khi giải tam giác vuông.',
  };
}

/** Gợi ý 3 tầng khi học sinh tính sai chiều cao h (không đưa đáp số ngay). */
export function goiYDoChieuCaoTheoTang(
  tang: 1 | 2 | 3,
  params: {
    cachDo: CachDoChieuCao;
    d: number;
    a?: number;
    alpha1: number;
    alpha2?: number;
    m: number;
  }
): string {
  const { cachDo, d, a = 0, alpha1, alpha2 = 0, m } = params;
  if (cachDo === 'mot-diem') {
    if (tang === 1) {
      return `Xét tam giác vuông tính từ tầm mắt em: cạnh nằm ngang (${dinhDangSoVN(d)} m) là cạnh kề của góc ${dinhDangSoVN(alpha1)}°, còn phần chiều cao từ tầm mắt lên đỉnh vật là cạnh đối.`;
    }
    if (tang === 2) {
      return `Áp dụng hệ thức cạnh góc vuông: phần trên tầm mắt $= d \\cdot \\tan \\alpha$. Đừng quên cộng thêm chiều cao mắt $m = ${dinhDangSoVN(m)}\\text{ m}$ nhé!`;
    }
    return `Các bước tính (em kiểm tra máy tính đang ở chế độ Độ DEG): Bước 1: tính $${dinhDangSoVN(d)} \\times \\tan(${dinhDangSoVN(alpha1)}^\\circ)$. Bước 2: lấy kết quả vừa tính cộng thêm $${dinhDangSoVN(m)}$ m.`;
  }

  if (tang === 1) {
    return `Gọi khoảng cách từ vị trí gần hơn tới chân vật là $x$, ta có hai tam giác vuông cùng chiều cao phần trên tầm mắt $h_1$: vừa bằng $x \\cdot \\tan ${dinhDangSoVN(alpha1)}^\\circ$, vừa bằng $(x + ${dinhDangSoVN(a)}) \\cdot \\tan ${dinhDangSoVN(alpha2)}^\\circ$.`;
  }
  if (tang === 2) {
    return `Khử $x$ từ hai phương trình trên ta có công thức $h = \\dfrac{a \\cdot \\tan \\alpha_1 \\cdot \\tan \\alpha_2}{\\tan \\alpha_1 - \\tan \\alpha_2} + m$. Nhớ kiểm tra máy tính ở chế độ Độ (DEG).`;
  }
  return `Bước tính: tính riêng $\\tan ${dinhDangSoVN(alpha1)}^\\circ$ và $\\tan ${dinhDangSoVN(alpha2)}^\\circ$, thế vào $\\dfrac{${dinhDangSoVN(a)} \\cdot \\tan \\alpha_1 \\cdot \\tan \\alpha_2}{\\tan \\alpha_1 - \\tan \\alpha_2}$ rồi cộng thêm $m = ${dinhDangSoVN(m)}$ m.`;
}

export type BanGhiDoChieuCao = {
  id: string;
  ten_vat: string;
  cach_do: CachDoChieuCao;
  d: number | null;
  a: number | null;
  alpha1: number;
  alpha2: number | null;
  m: number;
  h_tinh: number;
  h_hs_nhap: number;
  hs_dung: boolean;
  nguon_goc: 'cam-bien' | 'thanh-truot';
  h_that?: number | null;
  tao_luc?: string;
};

/** Tạo đoạn văn tóm tắt trung thực cho báo cáo KHKT phần Đo chiều cao Chương IV. */
export function taoBaoCaoDoChieuCao(params: {
  banGhi: BanGhiDoChieuCao[];
  saiSoTB: number | null;
  saiSoTrungVi: number | null;
  saiSoSD: number | null;
  tiLeHsDung: number | null;
  tbCamBien: number | null;
  tbThanhTruot: number | null;
  tbMotDiem: number | null;
  tbHaiDiem: number | null;
}): string {
  const n = params.banGhi.length;
  if (n === 0) {
    return 'Chưa có lượt đo chiều cao thực tế nào được ghi nhận để tổng hợp số liệu KHKT.';
  }
  const soCoMoc = params.banGhi.filter((r) => r.h_that && r.h_that > 0).length;
  const phan: string[] = [
    `Trong hoạt động trải nghiệm đo chiều cao gắn với Chương IV (Hệ thức lượng trong tam giác vuông), hệ thống ghi nhận ${n} lượt đo hợp lệ (${soCoMoc} lượt đối chiếu với vật mốc đã biết chiều cao thật).`,
  ];
  if (params.saiSoTB != null) {
    phan.push(
      `Sai số tương đối trung bình so với chiều cao thật là ${dinhDangSoVN(params.saiSoTB, 1)}% (trung vị ${dinhDangSoVN(params.saiSoTrungVi, 1)}%${params.saiSoSD != null ? `, độ lệch chuẩn ${dinhDangSoVN(params.saiSoSD, 1)}%` : ''}).`
    );
  }
  if (params.tiLeHsDung != null) {
    phan.push(
      `Tỉ lệ học sinh tự tính đúng chiều cao h (sai lệch công thức ≤ 2%) đạt ${dinhDangSoVN(params.tiLeHsDung, 1)}%.`
    );
  }
  if (params.tbCamBien != null || params.tbThanhTruot != null) {
    phan.push(
      `So sánh theo cách lấy góc: nhóm dùng cảm biến điện thoại có sai số TB ${dinhDangSoVN(params.tbCamBien, 1)}%, nhóm dùng thanh trượt/giác kế tự làm có sai số TB ${dinhDangSoVN(params.tbThanhTruot, 1)}%.`
    );
  }
  if (params.tbMotDiem != null || params.tbHaiDiem != null) {
    phan.push(
      `So sánh cách đo: 1 điểm (tới được chân vật) sai số TB ${dinhDangSoVN(params.tbMotDiem, 1)}%; 2 điểm (đo gián tiếp) sai số TB ${dinhDangSoVN(params.tbHaiDiem, 1)}%.`
    );
  }
  if (n < 10) {
    phan.push(
      `Cảnh báo cỡ mẫu nhỏ (n = ${n} < 10): số liệu mới mang tính mô tả ban đầu, chưa đủ căn cứ để khái quát cho toàn lớp.`
    );
  }
  return phan.join(' ');
}
