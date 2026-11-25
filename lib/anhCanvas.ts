/**
 * FILE NÀY LÀM GÌ: Xử lý ảnh trên Canvas trình duyệt (xoay, cắt, tăng tương phản, bôi đen vùng họ tên và nén JPEG <= 960 KB).
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Tiện ích xử lý ảnh bài làm trên Canvas phía trình duyệt:
 * xoay 90°, cắt viền %, tăng tương phản, vẽ các vùng đen che họ tên (PII)
 * và nén JPEG <= 960 KB để gửi lên máy chủ an toàn.
 */

export type VungCheCanvas = {
  /** Toạ độ tương đối theo tỉ lệ 0..1 trên khung ảnh sau khi xoay & cắt. */
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CatVienAnh = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/**
 * Hàm `xuLyAnhKttxCanvas`: nhận (file, opts), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function xuLyAnhKttxCanvas(
  file: File,
  opts: {
    rotateDeg: number;
    crop: CatVienAnh;
    highContrast: boolean;
    vungChe: VungCheCanvas[];
    maxBytes?: number;
  }
): Promise<{ dataUrl: string; base64: string; bytes: number }> {
  const maxBytes = opts.maxBytes ?? 960_000;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => {
      URL.revokeObjectURL(url);
      resolve(el);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không đọc được tệp ảnh.'));
    };
    el.src = url;
  });

  const deg = ((opts.rotateDeg % 360) + 360) % 360;
  const swapped = deg === 90 || deg === 270;
  const rw = swapped ? img.height : img.width;
  const rh = swapped ? img.width : img.height;

  const rotCanvas = document.createElement('canvas');
  rotCanvas.width = rw;
  rotCanvas.height = rh;
  const rctx = rotCanvas.getContext('2d');
  if (!rctx) throw new Error('Trình duyệt không hỗ trợ Canvas.');
  rctx.translate(rw / 2, rh / 2);
  rctx.rotate((deg * Math.PI) / 180);
  rctx.drawImage(img, -img.width / 2, -img.height / 2);

  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const sx = Math.round((Math.min(40, Math.max(0, opts.crop.left)) / 100) * rw);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const sy = Math.round((Math.min(40, Math.max(0, opts.crop.top)) / 100) * rh);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const sw = Math.max(80, Math.round(((100 - Math.min(40, opts.crop.left) - Math.min(40, opts.crop.right)) / 100) * rw));
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const sh = Math.max(80, Math.round(((100 - Math.min(40, opts.crop.top) - Math.min(40, opts.crop.bottom)) / 100) * rh));

  const maxSide = 1600;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const scale = Math.min(1, maxSide / Math.max(sw, sh));
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const tw = Math.max(80, Math.round(sw * scale));
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const th = Math.max(80, Math.round(sh * scale));

  const out = document.createElement('canvas');
  out.width = tw;
  out.height = th;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('Không khởi tạo được Canvas.');
  ctx.drawImage(rotCanvas, sx, sy, sw, sh, 0, 0, tw, th);

  if (opts.highContrast) {
    const idata = ctx.getImageData(0, 0, tw, th);
    const d = idata.data;
    const factor = 1.45;
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const boosted = Math.max(0, Math.min(255, factor * (gray - 128) + 128));
      d[i] = boosted;
      d[i + 1] = boosted;
      d[i + 2] = boosted;
    }
    ctx.putImageData(idata, 0, 0);
  }

  // Tô khung đen che họ tên / trường lớp trước khi mã hoá JPEG để gửi AI
  if (opts.vungChe.length) {
    ctx.fillStyle = '#0f172a';
    for (const v of opts.vungChe) {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const x = Math.max(0, Math.min(1, v.x)) * tw;
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const y = Math.max(0, Math.min(1, v.y)) * th;
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const w = Math.max(0, Math.min(1, v.w)) * tw;
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const h = Math.max(0, Math.min(1, v.h)) * th;
      if (w > 2 && h > 2) {
        ctx.fillRect(x, y, w, h);
      }
    }
  }

  let quality = 0.85;
  let dataUrl = out.toDataURL('image/jpeg', quality);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  let bytes = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 0.75);
  while (bytes > maxBytes && quality > 0.35) {
    quality -= 0.12;
    dataUrl = out.toDataURL('image/jpeg', quality);
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    bytes = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 0.75);
  }

  return {
    dataUrl,
    base64: dataUrl.split(',')[1] ?? '',
    bytes,
  };
}
