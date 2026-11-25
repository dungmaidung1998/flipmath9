/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * GÓI ZIP VIẾT TAY, KHÔNG DÙNG THƯ VIỆN NGOÀI.
 *
 * Vì sao không dùng thư viện: gói sao lưu là thứ phải chạy được cả vào lúc mọi
 * thứ khác đang hỏng. Thêm một phụ thuộc vào đây là thêm một chỗ có thể vỡ đúng
 * lúc cần nhất, và cũng là thêm một thứ phải giải thích với giám khảo. Định dạng
 * ZIP ở mức "chỉ lưu, không nén" (phương thức 0 — STORE) chỉ gồm ba khối:
 * đầu mỗi tệp, thư mục trung tâm, và khối kết thúc. Toàn bộ nằm dưới 100 dòng.
 *
 * Tệp nén lại thì nhỏ hơn, nhưng dữ liệu nghiên cứu của một khối lớp là vài trăm
 * KB — không đáng đánh đổi.
 *
 * Mọi số nhiều byte trong ZIP đều theo thứ tự little-endian.
 */

/** Bảng CRC-32 (đa thức 0xEDB88320) — tính một lần, dùng lại cho mọi tệp. */
const BANG_CRC = (() => {
  const b = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    b[i] = c >>> 0;
  }
  return b;
})();

/**
 * Hàm `crc32`: nhận (du), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function crc32(du: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < du.length; i++) c = BANG_CRC[(c ^ du[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Giờ và ngày theo định dạng MS-DOS mà ZIP dùng (độ phân giải 2 giây). */
function gioDos(d: Date): { gio: number; ngay: number } {
  return {
    gio: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    ngay: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
  };
}

type Muc = { ten: string; noiDung: string | Uint8Array };

/**
 * Hàm `taoZip`: nhận (dsMuc, luc), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function taoZip(dsMuc: Muc[], luc = new Date()): Uint8Array {
  const { gio, ngay } = gioDos(luc);
  const bo = new TextEncoder();

  const khoi: Uint8Array[] = [];   // các khối dữ liệu tệp
  const tt: Uint8Array[] = [];     // các bản ghi thư mục trung tâm
  let viTri = 0;                   // vị trí byte của tệp đang ghi

  for (const m of dsMuc) {
    const ten = bo.encode(m.ten);
    const du = typeof m.noiDung === 'string' ? bo.encode(m.noiDung) : m.noiDung;
    const ma = crc32(du);

    // ---- đầu tệp: 30 byte cố định + tên
    const dau = new DataView(new ArrayBuffer(30));
    dau.setUint32(0, 0x04034b50, true);   // chữ ký
    dau.setUint16(4, 20, true);           // cần phiên bản 2.0
    dau.setUint16(6, 0x0800, true);       // cờ: tên tệp là UTF-8 (để chữ Việt không lỗi)
    dau.setUint16(8, 0, true);            // phương thức 0 = chỉ lưu
    dau.setUint16(10, gio, true);
    dau.setUint16(12, ngay, true);
    dau.setUint32(14, ma, true);
    dau.setUint32(18, du.length, true);   // cỡ sau nén
    dau.setUint32(22, du.length, true);   // cỡ gốc — bằng nhau vì không nén
    dau.setUint16(26, ten.length, true);
    dau.setUint16(28, 0, true);           // không có trường phụ
    khoi.push(new Uint8Array(dau.buffer), ten, du);

    // ---- bản ghi thư mục trung tâm: 46 byte cố định + tên
    const bg = new DataView(new ArrayBuffer(46));
    bg.setUint32(0, 0x02014b50, true);
    bg.setUint16(4, 20, true);            // phiên bản tạo ra
    bg.setUint16(6, 20, true);            // phiên bản cần để mở
    bg.setUint16(8, 0x0800, true);
    bg.setUint16(10, 0, true);
    bg.setUint16(12, gio, true);
    bg.setUint16(14, ngay, true);
    bg.setUint32(16, ma, true);
    bg.setUint32(20, du.length, true);
    bg.setUint32(24, du.length, true);
    bg.setUint16(28, ten.length, true);
    bg.setUint16(30, 0, true);            // trường phụ
    bg.setUint16(32, 0, true);            // chú thích
    bg.setUint16(34, 0, true);            // số đĩa
    bg.setUint16(36, 0, true);            // thuộc tính nội bộ
    bg.setUint32(38, 0, true);            // thuộc tính ngoài
    bg.setUint32(42, viTri, true);        // vị trí đầu tệp
    tt.push(new Uint8Array(bg.buffer), ten);

    viTri += 30 + ten.length + du.length;
  }

  const coTT = tt.reduce((n, p) => n + p.length, 0);

  // ---- khối kết thúc thư mục trung tâm: 22 byte
  const ket = new DataView(new ArrayBuffer(22));
  ket.setUint32(0, 0x06054b50, true);
  ket.setUint16(4, 0, true);              // đĩa hiện tại
  ket.setUint16(6, 0, true);              // đĩa chứa thư mục trung tâm
  ket.setUint16(8, dsMuc.length, true);   // số tệp trên đĩa này
  ket.setUint16(10, dsMuc.length, true);  // tổng số tệp
  ket.setUint32(12, coTT, true);
  ket.setUint32(16, viTri, true);         // vị trí thư mục trung tâm
  ket.setUint16(20, 0, true);             // không có chú thích

  const phan = [...khoi, ...tt, new Uint8Array(ket.buffer)];
  const tong = phan.reduce((n, p) => n + p.length, 0);
  const ra = new Uint8Array(tong);
  let i = 0;
  for (const p of phan) { ra.set(p, i); i += p.length; }
  return ra;
}
