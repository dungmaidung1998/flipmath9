/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
export type MoHinh = {
  de: string;
  dung: string;
  sai: [string, string];
  congThuc: string;
  dungDuKien: number[];
};

export type DangBai = {
  ten: string;
  an: string;
  donVi: string;
  dieuKien: string;
  duKien: string[];
  moHinh: MoHinh[];
  giai: string;
  ketQua: () => string;
};

export const so = (n: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 10 }).format(n).replaceAll('.', ' ');
export const goc = (n: number) => n * Math.PI / 180;
export const lamTron = (n: number, digits = 0) => n.toFixed(digits).replace('.', ',');
export const he = (a: string, b: string) => '{ ' + a + '; ' + b + ' }';

/**
 * Hàm `haiAn`: nhận (a, b, c, d, e, f), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function haiAn(a: number, b: number, c: number, d: number, e: number, f: number) {
  const det = a * e - b * d;
  if (det === 0) throw new Error('Hệ không có nghiệm duy nhất');
  return [(c * e - b * f) / det, (a * f - c * d) / det] as const;
}

/**
 * Hàm `buoc`: nhận (dung, sai1, sai2, congThuc, dungDuKien), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function buoc(dung: string, sai1: string, sai2: string, congThuc: string, ...dungDuKien: number[]): MoHinh {
  return { de: 'Chọn hệ thức phù hợp với dữ kiện đang sáng.', dung, sai: [sai1, sai2], congThuc, dungDuKien };
}

/**
 * Hàm `bai`: nhận (ten, an, donVi, dieuKien, duKien, moHinh, giai, ketQua), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function bai(ten: string, an: string, donVi: string, dieuKien: string, duKien: string[], moHinh: MoHinh[], giai: string, ketQua: () => string): DangBai {
  return { ten, an, donVi, dieuKien, duKien, moHinh, giai, ketQua };
}

