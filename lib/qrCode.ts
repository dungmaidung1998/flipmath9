/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Bộ tạo mã QR Code (ISO/IEC 18004, chế độ Byte, mức sửa lỗi M, phiên bản 1..10).
 * Thuần TypeScript, không phụ thuộc thư viện ngoài — dùng cho trình chiếu lớp học,
 * hồ sơ năng lực chương và phiếu trắc nghiệm in có mã QR.
 */

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

/**
 * Hàm `gfMul`: nhận (a, b), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

/**
 * Hàm `rsGenerator`: nhận (ecCount), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function rsGenerator(ecCount: number): number[] {
  let poly = [1];
  for (let i = 0; i < ecCount; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const root = EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], root);
    }
    poly = next;
  }
  return poly;
}

/**
 * Hàm `rsRemainder`: nhận (data, ecCount), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function rsRemainder(data: number[], ecCount: number): number[] {
  const gen = rsGenerator(ecCount);
  const res = new Array(data.length + ecCount).fill(0);
  for (let i = 0; i < data.length; i++) res[i] = data[i];
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

// Bảng thông số EC Level M cho phiên bản 1..10:
// [version, totalDataCodewords, ecPerBlock, g1Blocks, g1Data, g2Blocks, g2Data, alignCenters[]]
type VersionSpec = {
  v: number;
  dataBytes: number;
  ecPerBlock: number;
  g1Blocks: number;
  g1Data: number;
  g2Blocks: number;
  g2Data: number;
  align: number[];
};

const VERSIONS: VersionSpec[] = [
  { v: 1, dataBytes: 16, ecPerBlock: 10, g1Blocks: 1, g1Data: 16, g2Blocks: 0, g2Data: 0, align: [] },
  { v: 2, dataBytes: 28, ecPerBlock: 16, g1Blocks: 1, g1Data: 28, g2Blocks: 0, g2Data: 0, align: [6, 18] },
  { v: 3, dataBytes: 44, ecPerBlock: 26, g1Blocks: 1, g1Data: 44, g2Blocks: 0, g2Data: 0, align: [6, 22] },
  { v: 4, dataBytes: 64, ecPerBlock: 18, g1Blocks: 2, g1Data: 32, g2Blocks: 0, g2Data: 0, align: [6, 26] },
  { v: 5, dataBytes: 86, ecPerBlock: 24, g1Blocks: 2, g1Data: 43, g2Blocks: 0, g2Data: 0, align: [6, 30] },
  { v: 6, dataBytes: 108, ecPerBlock: 16, g1Blocks: 4, g1Data: 27, g2Blocks: 0, g2Data: 0, align: [6, 34] },
  { v: 7, dataBytes: 124, ecPerBlock: 18, g1Blocks: 4, g1Data: 31, g2Blocks: 0, g2Data: 0, align: [6, 22, 38] },
  { v: 8, dataBytes: 154, ecPerBlock: 22, g1Blocks: 2, g1Data: 38, g2Blocks: 2, g2Data: 39, align: [6, 24, 42] },
  { v: 9, dataBytes: 182, ecPerBlock: 22, g1Blocks: 3, g1Data: 36, g2Blocks: 2, g2Data: 37, align: [6, 26, 46] },
  { v: 10, dataBytes: 216, ecPerBlock: 26, g1Blocks: 4, g1Data: 43, g2Blocks: 1, g2Data: 44, align: [6, 28, 50] },
];

/**
 * Hàm `encodeBytesUTF8`: nhận (str), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function encodeBytesUTF8(str: string): number[] {
  return Array.from(new TextEncoder().encode(str));
}

/**
 * Hàm `buildCodewords`: nhận (bytes, spec), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function buildCodewords(bytes: number[], spec: VersionSpec): number[] {
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };

  // Byte mode indicator (0100) + character count (8 bit cho V1..9, 16 bit cho V10+)
  pushBits(0b0100, 4);
  pushBits(bytes.length, spec.v <= 9 ? 8 : 16);
  for (const b of bytes) pushBits(b, 8);

  const maxBits = spec.dataBytes * 8;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const terminator = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < terminator; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    data.push(byte);
  }
  const padBytes = [0xec, 0x11];
  let pi = 0;
  while (data.length < spec.dataBytes) {
    data.push(padBytes[pi % 2]);
    pi++;
  }

  // Tách khối và tính mã sửa lỗi Reed-Solomon
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;
  for (let i = 0; i < spec.g1Blocks; i++) {
    const blk = data.slice(offset, offset + spec.g1Data);
    offset += spec.g1Data;
    dataBlocks.push(blk);
    ecBlocks.push(rsRemainder(blk, spec.ecPerBlock));
  }
  for (let i = 0; i < spec.g2Blocks; i++) {
    const blk = data.slice(offset, offset + spec.g2Data);
    offset += spec.g2Data;
    dataBlocks.push(blk);
    ecBlocks.push(rsRemainder(blk, spec.ecPerBlock));
  }

  const interleaved: number[] = [];
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const maxDataLen = Math.max(spec.g1Data, spec.g2Data);
  for (let i = 0; i < maxDataLen; i++) {
    for (const blk of dataBlocks) {
      if (i < blk.length) interleaved.push(blk[i]);
    }
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (const blk of ecBlocks) interleaved.push(blk[i]);
  }
  return interleaved;
}

/**
 * Hàm `formatBits`: nhận (mask), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function formatBits(mask: number): number {
  // Error correction M = 00
  const data = (0b00 << 3) | (mask & 0b111);
  let rem = data << 10;
  const gen = 0b10100110111;
  for (let i = 14; i >= 10; i--) {
    if ((rem >>> i) & 1) rem ^= gen << (i - 10);
  }
  return ((data << 10) | rem) ^ 0b101010000010010;
}

/**
 * Hàm `versionBits`: nhận (v), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function versionBits(v: number): number {
  let rem = v << 12;
  const gen = 0b1111100100101;
  for (let i = 17; i >= 12; i--) {
    if ((rem >>> i) & 1) rem ^= gen << (i - 12);
  }
  return (v << 12) | rem;
}

/**
 * Hàm `createMatrix`: nhận (spec, codewords), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function createMatrix(spec: VersionSpec, codewords: number[]): boolean[][] {
  const size = 17 + spec.v * 4;
  const grid: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setFixed = (r: number, c: number, val: boolean) => {
    if (r < 0 || r >= size || c < 0 || c >= size) return;
    grid[r][c] = val;
    reserved[r][c] = true;
  };

  const placeFinder = (top: number, left: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = top + dr;
        const c = left + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const val =
          inOuter &&
          (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
        setFixed(r, c, val);
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Alignment patterns
  const centers = spec.align;
  for (const cr of centers) {
    for (const cc of centers) {
      if (
        (cr === 6 && cc === 6) ||
        (cr === 6 && cc === size - 7) ||
        (cr === size - 7 && cc === 6)
      ) {
        continue;
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
          const val = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
          setFixed(cr + dr, cc + dc, val);
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0;
    if (!reserved[6][i]) setFixed(6, i, val);
    if (!reserved[i][6]) setFixed(i, 6, val);
  }

  // Dark module
  setFixed(size - 8, 8, true);

  // Dự trữ vùng Format Information
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) reserved[8][size - 1 - i] = true;
  for (let i = 0; i < 7; i++) reserved[size - 1 - i][8] = true;

  // Version Information (V7+)
  if (spec.v >= 7) {
    const vb = versionBits(spec.v);
    for (let i = 0; i < 18; i++) {
      const bit = ((vb >>> i) & 1) === 1;
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const r = Math.floor(i / 3);
      const c = size - 11 + (i % 3);
      setFixed(r, c, bit);
      setFixed(c, r, bit);
    }
  }

  // Đặt bit dữ liệu theo đường zig-zag
  const bitStream: boolean[] = [];
  for (const cw of codewords) {
    for (let b = 7; b >= 0; b--) bitStream.push(((cw >>> b) & 1) === 1);
  }

  let bitIdx = 0;
  let up = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col--;
    for (let step = 0; step < size; step++) {
      const r = up ? size - 1 - step : step;
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (!reserved[r][c]) {
          grid[r][c] = bitIdx < bitStream.length ? bitStream[bitIdx++] : false;
        }
      }
    }
    up = !up;
  }

  const maskFn = (mask: number, r: number, c: number): boolean => {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    }
  };

  const applyMaskAndFormat = (mask: number): boolean[][] => {
    const m: boolean[][] = Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (__, c) => {
        const base = Boolean(grid[r][c]);
        return reserved[r][c] ? base : maskFn(mask, r, c) ? !base : base;
      })
    );
    const fmt = formatBits(mask);
    for (let i = 0; i < 15; i++) {
      const bit = ((fmt >>> i) & 1) === 1;
      // Quanh finder trên-trái
      if (i < 6) m[8][i] = bit;
      else if (i === 6) m[8][7] = bit;
      else if (i === 7) m[8][8] = bit;
      else if (i === 8) m[7][8] = bit;
      else m[14 - i][8] = bit;
      // Quanh 2 finder còn lại
      if (i < 8) m[size - 1 - i][8] = bit;
      else m[8][size - 15 + i] = bit;
    }
    m[size - 8][8] = true;
    return m;
  };

  const penalty = (m: boolean[][]): number => {
    let score = 0;
    // Quy tắc 1: 5+ ô liên tiếp cùng màu
    for (let r = 0; r < size; r++) {
      let run = 1;
      for (let c = 1; c < size; c++) {
        if (m[r][c] === m[r][c - 1]) run++;
        else {
          if (run >= 5) score += 3 + (run - 5);
          run = 1;
        }
      }
      if (run >= 5) score += 3 + (run - 5);
    }
    for (let c = 0; c < size; c++) {
      let run = 1;
      for (let r = 1; r < size; r++) {
        if (m[r][c] === m[r - 1][c]) run++;
        else {
          if (run >= 5) score += 3 + (run - 5);
          run = 1;
        }
      }
      if (run >= 5) score += 3 + (run - 5);
    }
    // Quy tắc 2: khối 2x2 cùng màu
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const v = m[r][c];
        if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
      }
    }
    // Quy tắc 3: mẫu finder-like 1:1:3:1:1
    const matchPat = (arr: boolean[]) => {
      for (let i = 0; i <= arr.length - 11; i++) {
        const a =
          arr[i] && !arr[i + 1] && arr[i + 2] && arr[i + 3] && arr[i + 4] && !arr[i + 5] && arr[i + 6] &&
          !arr[i + 7] && !arr[i + 8] && !arr[i + 9] && !arr[i + 10];
        const b =
          !arr[i] && !arr[i + 1] && !arr[i + 2] && !arr[i + 3] && arr[i + 4] && !arr[i + 5] && arr[i + 6] &&
          arr[i + 7] && arr[i + 8] && !arr[i + 9] && arr[i + 10];
        if (a || b) score += 40;
      }
    };
    for (let r = 0; r < size; r++) matchPat(m[r]);
    for (let c = 0; c < size; c++) matchPat(m.map((row) => row[c]));
    // Quy tắc 4: tỉ lệ ô đen
    let dark = 0;
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (m[r][c]) dark++;
    const pct = (dark * 100) / (size * size);
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    score += Math.floor(Math.abs(pct - 50) / 5) * 10;
    return score;
  };

  let best = applyMaskAndFormat(0);
  let bestScore = penalty(best);
  for (let k = 1; k < 8; k++) {
    const cand = applyMaskAndFormat(k);
    const sc = penalty(cand);
    if (sc < bestScore) {
      bestScore = sc;
      best = cand;
    }
  }
  return best;
}

/** Sinh ma trận boolean NxN cho chuỗi đầu vào (tối đa ~213 byte UTF-8). */
export function taoMaTranQR(text: string): boolean[][] {
  const bytes = encodeBytesUTF8(text || ' ');
  const spec = VERSIONS.find((v) => {
    const headerBytes = v.v <= 9 ? 2 : 3;
    return bytes.length + headerBytes <= v.dataBytes;
  });
  if (!spec) {
    // Cắt an toàn nếu chuỗi quá dài
    return taoMaTranQR(text.slice(0, 180));
  }
  const codewords = buildCodewords(bytes, spec);
  return createMatrix(spec, codewords);
}
