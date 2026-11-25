/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Cấu hình hình ảnh cho Vi bài học sửa lỗi (Mục 4):
 * - 21 lỗi hình học Chương IV–V: biểu đồ SVG đối chiếu 2 cột "Sai ✗ / Đúng ✓".
 * - Lỗi đại số Chương I–III (và mọi lỗi khác): cặp ảnh Bin/Na "bối rối → hiểu ra" theo chương (dự phòng ảnh nhân vật có sẵn).
 */

export type ChuongC15 = 'C1' | 'C2' | 'C3' | 'C4' | 'C5';

export type MauVbhHinh =
  | 'doi-ke'
  | 'ti-so-4'
  | 'goc-dac-biet'
  | 'goc-phu'
  | 'canh-huyen-sin-cos'
  | 'canh-goc-vuong-tan'
  | 'goc-nang-ha'
  | 'tong-goc-nhon'
  | 'diem-duong-tron'
  | 'truc-doi-xung'
  | 'nua-day'
  | 'goc-tam-cung'
  | 'cong-cung'
  | 'do-dai-cung'
  | 'dien-tich-quat'
  | 'vanh-khuyen'
  | 'duong-thang-d-r'
  | 'tiep-tuyen-pythagore'
  | 'hai-tiep-tuyen'
  | 'hai-duong-tron-diem'
  | 'hai-duong-tron-truc';

export type CauHinhVbhHinh = {
  ma: string;
  chuong: 'C4' | 'C5';
  mau: MauVbhHinh;
  tieuDe: string;
  saiNhan: string;
  dungNhan: string;
};

const TIEN_TO_CHUONG: Record<string, ChuongC15> = {
  PT2: 'C1',
  HPT: 'C1',
  BTH: 'C1',
  PTT: 'C2',
  PTM: 'C2',
  BDT: 'C2',
  BPT: 'C2',
  CBH: 'C3',
  KC: 'C3',
  BD: 'C3',
  CBB: 'C3',
  TSLG: 'C4',
  HTL: 'C4',
  DTR: 'C5',
  CD: 'C5',
  QH: 'C5',
  TT: 'C5',
  HDT: 'C5',
};

/**
 * Hàm `maChuongTuMaLoi`: nhận (idOrCode, kuId), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function maChuongTuMaLoi(idOrCode?: string | null, kuId?: string | null): ChuongC15 | null {
  if (kuId) {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const m = /^(C[1-5])\b/i.exec(kuId.trim());
    if (m) return m[1].toUpperCase() as ChuongC15;
  }
  if (idOrCode) {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const goc = idOrCode.trim().toUpperCase().replace(/^(VBH-|E-)/, '');
    const nhom = goc.split('-')[0];
    if (TIEN_TO_CHUONG[nhom]) return TIEN_TO_CHUONG[nhom];
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const m = /^(C[1-5])\b/.exec(goc);
    if (m) return m[1] as ChuongC15;
  }
  return null;
}

/**
 * Hàm `anhLoiBinNa`: nhận (ma, kuId), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function anhLoiBinNa(ma: string, kuId?: string | null) {
  const chuong: ChuongC15 = maChuongTuMaLoi(ma, kuId) ?? 'C1';
  const sum = [...ma].reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const nhanVat: 'bin' | 'na' = sum % 2 === 0 ? 'bin' : 'na';
  return {
    chuong,
    nhanVat,
    tenNhanVat: nhanVat === 'bin' ? 'Bin' : 'Na',
    boiRoi: `/chu-de/loi/${nhanVat}-${chuong}-boi-roi.webp`,
    hieuRa: `/chu-de/loi/${nhanVat}-${chuong}-hieu-ra.webp`,
    fallback: `/chu-de/nv/${nhanVat}-${chuong}.webp`,
  };
}

const C = (ma: string, chuong: 'C4' | 'C5', mau: MauVbhHinh, tieuDe: string, saiNhan: string, dungNhan: string): CauHinhVbhHinh => ({
  ma,
  chuong,
  mau,
  tieuDe,
  saiNhan,
  dungNhan,
});

export const HINH_VI_BAI_HOC: Record<string, CauHinhVbhHinh> = {
  'VBH-TSLG-01': C('VBH-TSLG-01', 'C4', 'doi-ke', 'Phân biệt cạnh đối và cạnh kề của góc B', 'Nhầm kề/đối của góc B', 'AB là kề góc B, AC là đối góc B'),
  'VBH-TSLG-02': C('VBH-TSLG-02', 'C4', 'ti-so-4', 'Cạnh huyền luôn nằm ở mẫu của sin, cos', 'Đảo ngược: huyền / đối', 'sin B = đối / huyền < 1'),
  'VBH-TSLG-03': C('VBH-TSLG-03', 'C4', 'goc-dac-biet', 'Tam giác đặc biệt 30°–60° và 45°', 'Lẫn sin 30° với cos 30°', 'sin 30° = 1/2, sin 60° = √3/2'),
  'VBH-TSLG-04': C('VBH-TSLG-04', 'C4', 'goc-phu', 'Hai góc phụ nhau (tổng 90°)', 'Giữ nguyên tên: sin B = sin C', 'Đổi chéo: sin B = cos(90° − B)'),
  'VBH-HTL-01': C('VBH-HTL-01', 'C4', 'canh-huyen-sin-cos', 'Tính cạnh góc vuông từ cạnh huyền', 'Nhầm: b = a · cos B', 'b = a · sin B = a · cos C'),
  'VBH-HTL-02': C('VBH-HTL-02', 'C4', 'canh-goc-vuong-tan', 'Liên hệ hai cạnh góc vuông qua tan/cot', 'Lấy sai: AC = AB · tan C', 'AC = AB · tan B = AB · cot C'),
  'VBH-HTL-03': C('VBH-HTL-03', 'C4', 'goc-nang-ha', 'Góc nâng và góc hạ đo với phương ngang', 'Đo góc với phương thẳng đứng', 'Đo giữa tia nhìn và phương ngang'),
  'VBH-HTL-04': C('VBH-HTL-04', 'C4', 'tong-goc-nhon', 'Tổng hai góc nhọn của tam giác vuông', 'Trừ vào 180° như tam giác thường', 'B + C = 90° ⇒ C = 90° − B'),
  'VBH-DTR-01': C('VBH-DTR-01', 'C5', 'diem-duong-tron', 'So sánh khoảng cách OM với bán kính R', 'So OM với đường kính d', 'So OM với bán kính R = d/2'),
  'VBH-DTR-02': C('VBH-DTR-02', 'C5', 'truc-doi-xung', 'Tâm đối xứng và vô số trục đối xứng', 'Nghĩ chỉ có 2 trục ngang/dọc', 'Mọi đường kính qua O đều là trục'),
  'VBH-CD-01': C('VBH-CD-01', 'C5', 'nua-day', 'Dùng nửa dây AB/2 trong định lí Pythagore', 'Dùng cả dây AB = 8', 'Dùng nửa dây HB = 4: OH² + HB² = R²'),
  'VBH-CD-02': C('VBH-CD-02', 'C5', 'goc-tam-cung', 'Góc ở tâm và số đo cung bị chắn', 'Chia đôi góc ở tâm', 'sđ cung nhỏ = ∠AOB; cung lớn = 360° − ∠AOB'),
  'VBH-CD-03': C('VBH-CD-03', 'C5', 'cong-cung', 'Cộng các cung kề nhau trên đường tròn', 'Nhầm tỉ lệ thẳng sang dây AB', 'Cung lớn hơn căng dây dài hơn; tổng vòng = 360°'),
  'VBH-QH-01': C('VBH-QH-01', 'C5', 'do-dai-cung', 'Độ dài cung tròn: mẫu là 180 (cả R)', 'Quên chia đôi đường kính / mẫu 360', 'l = πRn / 180 (R = d/2)'),
  'VBH-QH-02': C('VBH-QH-02', 'C5', 'dien-tich-quat', 'Diện tích hình quạt tròn', 'Dùng bán kính R thay R² hoặc thiếu :2', 'S = πR²n/360 = l·R/2'),
  'VBH-QH-03': C('VBH-QH-03', 'C5', 'vanh-khuyen', 'Diện tích hình vành khuyên', 'Nhầm: π(R − r)²', 'Đúng: π(R² − r²) = πR² − πr²'),
  'VBH-TT-01': C('VBH-TT-01', 'C5', 'duong-thang-d-r', 'Vị trí tương đối của đường thẳng và (O)', 'Đảo dấu d < R và d > R', 'd < R: 2 điểm; d = R: tiếp xúc; d > R: 0 điểm'),
  'VBH-TT-02': C('VBH-TT-02', 'C5', 'tiep-tuyen-pythagore', 'Tiếp tuyến vuông góc bán kính: OM là huyền', 'Cộng: MA² = OM² + R²', 'Vuông tại A ⇒ MA² = OM² − R²'),
  'VBH-TT-03': C('VBH-TT-03', 'C5', 'hai-tiep-tuyen', 'Tính chất hai tiếp tuyến cắt nhau', 'Nhầm ∠AMO = ∠AMB hoặc ∠AOB = ∠AMB', 'MA = MB, MO phân giác, ∠AMB + ∠AOB = 180°'),
  'VBH-HDT-01': C('VBH-HDT-01', 'C5', 'hai-duong-tron-diem', 'Vị trí hai đường tròn theo số điểm chung', 'Nhầm tiếp xúc ngoài / tiếp xúc trong', '2 điểm: cắt; 1: tiếp xúc (O,O′,A thẳng hàng); 0: rời'),
  'VBH-HDT-02': C('VBH-HDT-02', 'C5', 'hai-duong-tron-truc', 'Khoảng cách hai tâm trên trục R−r và R+r', 'Nhầm R − r với R + r', 'Cắt nhau khi R − r < d < R + r'),
};

/**
 * Hàm `hinhViBaiHocTheoMa`: nhận (idOrCode), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function hinhViBaiHocTheoMa(idOrCode?: string | null): CauHinhVbhHinh | null {
  if (!idOrCode) return null;
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const k = idOrCode.trim().toUpperCase().replace(/^E-/, 'VBH-');
  return HINH_VI_BAI_HOC[k] ?? null;
}
