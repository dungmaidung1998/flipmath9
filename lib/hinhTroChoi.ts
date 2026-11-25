/**
 * FILE NÀY LÀM GÌ: Nhận diện đề câu hỏi hình học có số liệu (Chương IV–V) trong trò chơi nền và tạo cấu trúc hình SVG theo đúng tỉ lệ.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: đề câu hỏi truyền vào từ TroChoiNen/HinhNen
 * GỌI TỚI: chỉ import type từ ./hinhToanHoc để tương thích chạy thẳng trên Node 24
 */
import type {
  DuongTronDay,
  HaiDuongTron,
  Hinh,
  QuatVanhKhuyen,
  TamGiacVuong,
  TiepTuyen,
} from './hinhToanHoc';

export type KetQuaHinhTroChoi = {
  hinh: Hinh;
  chu: string;
  loaiMau: string;
};

const RAD = Math.PI / 180;

function docSo(s: string): number {
  return Number(s.replace(/\s/g, '').replace(',', '.'));
}

function dinhDang(n: number): string {
  const r = Math.round(n * 100) / 100;
  return String(r).replace('-', '−').replace('.', ',');
}

function canChinh(v: number): string {
  const r = Math.round(v * 100) / 100;
  const g = Math.round(Math.sqrt(r));
  if (Math.abs(g * g - r) < 1e-9) return String(g);
  return `√${dinhDang(r)}`;
}

/**
 * Đọc đề câu hỏi hình học có số liệu và dựng cấu trúc `Hinh` đúng tỉ lệ.
 * Khi `daTra === false`, đại lượng cần tìm luôn hiển thị "?" để không lộ đáp án.
 */
export function docHinhHinhHocCau(chu: string, kuId = '', daTra = false): KetQuaHinhTroChoi | null {
  if (!chu || typeof chu !== 'string') return null;
  const t = chu.replace(/−/g, '-').replace(/\$/g, '').trim();
  const tl = t.toLowerCase();

  // 1. Tiếp tuyến từ điểm ngoài (OA = R, OM, MA/AM hoặc câu có chữ "tiếp tuyến")
  const mOA = t.match(/\bOA\s*=\s*(\d+(?:[.,]\d+)?)/i);
  const mOM = t.match(/\bOM\s*=\s*(\d+(?:[.,]\d+)?)/i);
  const mMA = t.match(/\b(?:AM|MA|MB)\s*=\s*(\d+(?:[.,]\d+)?)/i);
  if ((mOA && (mOM || mMA)) || (tl.includes('tiếp tuyến') && /\b(?:r|oa|om|ma|am)\s*=/i.test(t))) {
    const mR = mOA ?? t.match(/\b(?:bán kính|R)\s*(?:=|là|bằng)?\s*(\d+(?:[.,]\d+)?)/i);
    const r = mR ? docSo(mR[1]) : undefined;
    const om = mOM ? docSo(mOM[1]) : undefined;
    const ma = mMA ? docSo(mMA[1]) : undefined;
    const mGoc = t.match(/(\d+(?:[.,]\d+)?)\s*°/);
    const goc = mGoc ? docSo(mGoc[1]) : undefined;

    if (r && om && om > r) {
      const kq = Math.sqrt(om * om - r * r);
      const hinh: TiepTuyen = {
        loai: 'tiep-tuyen',
        chuong: 'C5',
        moTa: `Đường tròn tâm O bán kính ${dinhDang(r)}, điểm M ngoài đường tròn với OM = ${dinhDang(om)}`,
        kieu: tl.includes('hai tiếp tuyến') ? 'hai' : 'mot',
        R: r,
        OM: om,
        nhan: {
          R: dinhDang(r),
          OM: dinhDang(om),
          MA: daTra ? dinhDang(kq) : '?',
        },
      };
      return { hinh, chu: `Tam giác OAM vuông tại tiếp điểm A: OA = ${dinhDang(r)}, OM = ${dinhDang(om)}.`, loaiMau: 'tiep-tuyen' };
    }
    if (r && ma && r > 0 && ma > 0) {
      const kq = Math.hypot(r, ma);
      const hinh: TiepTuyen = {
        loai: 'tiep-tuyen',
        chuong: 'C5',
        moTa: `Tiếp tuyến MA = ${dinhDang(ma)}, bán kính OA = ${dinhDang(r)}`,
        kieu: tl.includes('hai tiếp tuyến') ? 'hai' : 'mot',
        R: r,
        MA: ma,
        nhan: {
          R: dinhDang(r),
          MA: dinhDang(ma),
          OM: daTra ? dinhDang(kq) : '?',
        },
      };
      return { hinh, chu: `Tam giác OAM vuông tại tiếp điểm A: OA = ${dinhDang(r)}, AM = ${dinhDang(ma)}.`, loaiMau: 'tiep-tuyen' };
    }
    if (r && goc && goc > 0 && goc < 90) {
      const hinh: TiepTuyen = {
        loai: 'tiep-tuyen',
        chuong: 'C5',
        moTa: `Tiếp tuyến tại A tạo góc ${dinhDang(goc)}°`,
        kieu: tl.includes('hai tiếp tuyến') ? 'hai' : 'mot',
        R: r,
        gocAMO: goc,
        nhan: {
          R: dinhDang(r),
          goc: `${dinhDang(goc)}°`,
          MA: '?',
        },
      };
      return { hinh, chu: `Tiếp tuyến MA vuông góc bán kính OA tại A.`, loaiMau: 'tiep-tuyen' };
    }
  }

  // 2. Đường tròn biết bán kính R và dây cung (hoặc khoảng cách d đến dây)
  if ((tl.includes('đường tròn') || tl.includes('(o;')) && tl.includes('dây')) {
    const mR = t.match(/(?:bán kính\s*(?:R\s*=?\s*)?|R\s*=\s*)(\d+(?:[.,]\d+)?)/i);
    const mDay = t.match(/dây\s*(?:AB|CD|EF|lớn|nhỏ)?\s*(?:dài|=|bằng)?\s*(\d+(?:[.,]\d+)?)/i);
    const mKhoang = t.match(/khoảng cách[^0-9]*(\d+(?:[.,]\d+)?)/i);
    if (mR && (mDay || mKhoang)) {
      const r = docSo(mR[1]);
      if (r > 0) {
        let halfChordAngle = 48;
        let nhanDay = '?';
        let nhanD = '?';
        if (mDay) {
          const day = docSo(mDay[1]);
          if (day > 0 && day <= 2 * r) {
            const cosA = Math.min(0.96, Math.max(0.1, (day / 2) / r));
            halfChordAngle = Math.max(20, Math.min(76, Math.acos(Math.sqrt(1 - cosA * cosA)) / RAD));
            nhanDay = dinhDang(day);
            nhanD = daTra ? dinhDang(Math.sqrt(Math.max(0, r * r - (day / 2) * (day / 2)))) : '?';
          }
        } else if (mKhoang) {
          const d = docSo(mKhoang[1]);
          if (d >= 0 && d < r) {
            halfChordAngle = Math.max(20, Math.min(76, Math.acos(d / r) / RAD));
            nhanD = dinhDang(d);
            nhanDay = daTra ? dinhDang(2 * Math.sqrt(r * r - d * d)) : '?';
          }
        }
        const gA = 270 - halfChordAngle;
        const gB = 270 + halfChordAngle;
        const hinh: DuongTronDay = {
          loai: 'duong-tron-day',
          chuong: 'C5',
          moTa: `Đường tròn tâm O bán kính ${dinhDang(r)} và dây AB`,
          diem: [
            { ten: 'A', goc: gA },
            { ten: 'B', goc: gB },
            { ten: 'H', goc: 270, t: Math.cos(halfChordAngle * RAD), dy: 4 },
          ],
          doan: [
            { tu: 'A', den: 'B', chinh: true, nhan: nhanDay },
            { tu: 'O', den: 'A', nhan: `R = ${dinhDang(r)}` },
            { tu: 'O', den: 'H', netDut: true, nhan: nhanD },
          ],
          vuongTai: [{ dinh: 'H', a: 'O', b: 'B' }],
        };
        return { hinh, chu: `Đường kính/bán kính OH vuông góc dây AB tại trung điểm H.`, loaiMau: 'duong-tron-day' };
      }
    }
  }

  // 3. Cung n° bán kính R hoặc Hình quạt tròn n° bán kính R (mẫu tổng quát)
  const mCungQuat = t.match(/(\d+(?:[.,]\d+)?)\s*°/);
  const mBanKinh = t.match(/(?:bán kính\s*(?:R\s*=?\s*)?|R\s*=\s*)(\d+(?:[.,]\d+)?)/i);
  if (mCungQuat && mBanKinh && (tl.includes('cung') || tl.includes('quạt'))) {
    const goc = docSo(mCungQuat[1]);
    const r = docSo(mBanKinh[1]);
    if (goc > 0 && goc < 360 && r > 0) {
      const laQuat = tl.includes('quạt');
      const hinh: QuatVanhKhuyen = {
        loai: 'quat-vanh-khuyen',
        chuong: 'C5',
        moTa: `${laQuat ? 'Hình quạt' : 'Cung tròn'} ${dinhDang(goc)}°, bán kính R = ${dinhDang(r)}`,
        kieu: laQuat ? 'quat' : 'cung',
        R: r,
        goc,
        nhan: {
          R: `R = ${dinhDang(r)}`,
          goc: `${dinhDang(goc)}°`,
          cung: laQuat ? undefined : '?',
          S: laQuat ? 'S = ?' : undefined,
        },
      };
      return { hinh, chu: `${laQuat ? 'Hình quạt tròn' : 'Cung tròn'} ứng với góc ở tâm ${dinhDang(goc)}°, bán kính ${dinhDang(r)}.`, loaiMau: 'quat-vanh-khuyen' };
    }
  }

  // 4. Tam giác vuông biết 2 cạnh góc vuông hoặc cạnh huyền + 1 cạnh góc vuông
  const m2CanhGV = t.match(/hai cạnh góc vuông\s*(?:là|bằng|:)?\s*(\d+(?:[.,]\d+)?)\s*(?:cm|dm|m|mm)?\s*(?:và|,)\s*(\d+(?:[.,]\d+)?)/i);
  if (m2CanhGV) {
    const a = docSo(m2CanhGV[1]), b = docSo(m2CanhGV[2]);
    if (a > 0 && b > 0) {
      const hinh: TamGiacVuong = {
        loai: 'tam-giac-vuong',
        chuong: 'C4',
        moTa: `Tam giác vuông có hai cạnh góc vuông ${dinhDang(a)} và ${dinhDang(b)}`,
        canh: { tren: dinhDang(a), ngang: dinhDang(b), huyen: daTra ? canChinh(a * a + b * b) : '?' },
        tyLe: { tren: a, ngang: b },
      };
      return { hinh, chu: `Tam giác vuông có hai cạnh góc vuông ${dinhDang(a)} và ${dinhDang(b)}; cạnh huyền cần tìm.`, loaiMau: 'tam-giac-vuong' };
    }
  }

  const mHuyenCanh = t.match(/cạnh huyền\s*(?:là|bằng|:)?\s*(\d+(?:[.,]\d+)?)\s*[,;.]?\s*(?:một\s*)?cạnh(?:\s*góc vuông)?\s*(?:là|bằng|:)?\s*(\d+(?:[.,]\d+)?)/i);
  if (mHuyenCanh) {
    const c = docSo(mHuyenCanh[1]), a = docSo(mHuyenCanh[2]);
    if (c > a && a > 0) {
      const hinh: TamGiacVuong = {
        loai: 'tam-giac-vuong',
        chuong: 'C4',
        moTa: `Tam giác vuông có cạnh huyền ${dinhDang(c)} và một cạnh góc vuông ${dinhDang(a)}`,
        canh: { tren: dinhDang(a), huyen: dinhDang(c), ngang: daTra ? canChinh(c * c - a * a) : '?' },
        tyLe: { tren: a, huyen: c },
      };
      return { hinh, chu: `Tam giác vuông có cạnh huyền ${dinhDang(c)} và một cạnh góc vuông ${dinhDang(a)}.`, loaiMau: 'tam-giac-vuong' };
    }
  }

  // 5. Tam giác vuông biết 1 góc nhọn (kèm cạnh nếu có)
  if (tl.includes('tam giác') && tl.includes('vuông') && mCungQuat) {
    const g = docSo(mCungQuat[1]);
    if (g > 0 && g < 90) {
      const hoiGoc = tl.includes('góc');
      const laGocB = /góc\s*B/i.test(t);
      const mCanhHuyen = t.match(/cạnh huyền\s*(?:là|bằng|=)?\s*(\d+(?:[.,]\d+)?)/i);
      const mCanh = t.match(/cạnh(?:\s*góc vuông)?\s*(?:là|bằng|=)?\s*(\d+(?:[.,]\d+)?)/i);
      const huyenVal = mCanhHuyen ? docSo(mCanhHuyen[1]) : undefined;
      const canhVal = !mCanhHuyen && mCanh ? docSo(mCanh[1]) : undefined;
      const hinh: TamGiacVuong = {
        loai: 'tam-giac-vuong',
        chuong: 'C4',
        moTa: `Tam giác vuông có một góc nhọn ${dinhDang(g)}°`,
        dinh: ['A', 'B', 'C'],
        tyLe: laGocB ? { gocTren: g } : { gocPhai: g },
        canh: huyenVal
          ? { huyen: dinhDang(huyenVal), tren: '?' }
          : canhVal
          ? { ngang: dinhDang(canhVal), tren: '?' }
          : undefined,
        goc: laGocB
          ? { tren: `B = ${dinhDang(g)}°`, phai: hoiGoc ? (daTra ? `${dinhDang(90 - g)}°` : '?') : undefined }
          : { phai: `${dinhDang(g)}°`, tren: hoiGoc ? (daTra ? `${dinhDang(90 - g)}°` : '?') : undefined },
      };
      return { hinh, chu: `Tam giác vuông với một góc nhọn ${dinhDang(g)}°; tổng hai góc nhọn bằng 90°.`, loaiMau: 'tam-giac-vuong' };
    }
  }

  // 6. Đường chéo hình vuông / đường cao tam giác đều (C4-B11-M2)
  const mHinhVuong = t.match(/đường chéo hình vuông cạnh\s*(\d+(?:[.,]\d+)?)/i);
  if (mHinhVuong) {
    const a = docSo(mHinhVuong[1]);
    if (a > 0) {
      const hinh: TamGiacVuong = {
        loai: 'tam-giac-vuong',
        chuong: 'C4',
        moTa: `Đường chéo hình vuông cạnh ${dinhDang(a)}`,
        canh: { tren: dinhDang(a), ngang: dinhDang(a), huyen: daTra ? canChinh(2 * a * a) : '?' },
        tyLe: { tren: a, ngang: a },
      };
      return { hinh, chu: `Hai cạnh hình vuông dài ${dinhDang(a)} tạo thành tam giác vuông cân.`, loaiMau: 'tam-giac-vuong' };
    }
  }

  const mTamGiacDeu = t.match(/đường cao của tam giác đều cạnh\s*(\d+(?:[.,]\d+)?)/i);
  if (mTamGiacDeu) {
    const a = docSo(mTamGiacDeu[1]);
    if (a > 0) {
      const hinh: TamGiacVuong = {
        loai: 'tam-giac-vuong',
        chuong: 'C4',
        moTa: `Nửa tam giác đều cạnh ${dinhDang(a)}`,
        dinh: ['H', 'A', 'B'],
        canh: { huyen: dinhDang(a), ngang: dinhDang(a / 2), tren: daTra ? canChinh((3 * a * a) / 4) : '?' },
        tyLe: { huyen: a, ngang: a / 2 },
      };
      return { hinh, chu: `Đường cao chia tam giác đều cạnh ${dinhDang(a)} thành hai nửa có cạnh đáy ${dinhDang(a / 2)}.`, loaiMau: 'tam-giac-vuong' };
    }
  }

  // 7. Đường tròn: đường kính / bán kính / mở compa / điểm trên (O; R) / chu vi (C5-B13-M1 & C5-B15-M1)
  const mDiemTren = t.match(/điểm\s*([A-Z])\s*nằm trên đường tròn tâm\s*([A-Z])\s*bán kính\s*(\d+(?:[.,]\d+)?)\s*(cm|dm|m|mm)?/i);
  if (mDiemTren) {
    const tenDiem = mDiemTren[1].toUpperCase(), tam = mDiemTren[2].toUpperCase(), r = docSo(mDiemTren[3]), dv = mDiemTren[4] ?? '';
    const suffix = dv ? ` ${dv}` : '';
    const hinh: DuongTronDay = {
      loai: 'duong-tron-day',
      chuong: 'C5',
      tam,
      moTa: `Điểm ${tenDiem} trên (${tam}; ${dinhDang(r)}${suffix})`,
      diem: [{ ten: tenDiem, goc: 32 }, { ten: 'B', goc: 205 }],
      doan: [
        { tu: tam, den: 'B', nhan: `R = ${dinhDang(r)}${suffix}` },
        { tu: tam, den: tenDiem, chinh: true, nhan: daTra ? `${tam}${tenDiem} = ${dinhDang(r)}${suffix}` : `${tam}${tenDiem} = ?` },
      ],
    };
    return { hinh, chu: `Mọi điểm trên đường tròn (${tam}) đều cách tâm ${tam} một khoảng bằng bán kính.`, loaiMau: 'duong-tron' };
  }

  const mChuViR = t.match(/chu vi đường tròn bán kính\s*(\d+(?:[.,]\d+)?)/i);
  if (mChuViR) {
    const r = docSo(mChuViR[1]);
    const hinh: DuongTronDay = {
      loai: 'duong-tron-day',
      chuong: 'C5',
      moTa: `Đường tròn bán kính ${dinhDang(r)}`,
      diem: [{ ten: 'A', goc: 25 }],
      doan: [{ tu: 'O', den: 'A', chinh: true, nhan: `R = ${dinhDang(r)}` }],
      nhanThem: [{ goc: 120, t: 1.24, text: daTra ? `C = ${dinhDang(2 * r)}π` : 'C = ?π' }],
    };
    return { hinh, chu: `Đường tròn bán kính R = ${dinhDang(r)}; cần tính chu vi C = 2πR.`, loaiMau: 'duong-tron' };
  }

  const mChuViD = t.match(/chu vi đường tròn đường kính\s*(\d+(?:[.,]\d+)?)/i);
  if (mChuViD) {
    const d = docSo(mChuViD[1]);
    const hinh: DuongTronDay = {
      loai: 'duong-tron-day',
      chuong: 'C5',
      moTa: `Đường tròn đường kính ${dinhDang(d)}`,
      diem: [{ ten: 'A', goc: 180 }, { ten: 'B', goc: 0 }],
      doan: [{ tu: 'A', den: 'B', chinh: true, nhan: `d = ${dinhDang(d)}` }],
      nhanThem: [{ goc: 110, t: 1.24, text: 'C = ?π' }],
    };
    return { hinh, chu: `Đường tròn đường kính d = ${dinhDang(d)}; cần tính chu vi C = πd.`, loaiMau: 'duong-tron' };
  }

  const mChuViCho = t.match(/chu vi đường tròn là\s*(\d+(?:[.,]\d+)?)\s*π/i);
  if (mChuViCho) {
    const k = docSo(mChuViCho[1]);
    const hinh: DuongTronDay = {
      loai: 'duong-tron-day',
      chuong: 'C5',
      moTa: `Đường tròn chu vi ${dinhDang(k)}π`,
      diem: [{ ten: 'A', goc: 25 }],
      doan: [{ tu: 'O', den: 'A', chinh: true, nhan: daTra ? `R = ${dinhDang(k / 2)}` : 'R = ?' }],
      nhanThem: [{ goc: 115, t: 1.24, text: `C = ${dinhDang(k)}π` }],
    };
    return { hinh, chu: `Biết chu vi C = ${dinhDang(k)}π, tìm bán kính R.`, loaiMau: 'duong-tron' };
  }

  if (tl.includes('đường kính') || tl.includes('bán kính') || tl.includes('compa')) {
    const mDK = t.match(/đường kính\s*(\d+(?:[.,]\d+)?)\s*(cm|dm|m|mm)?/i);
    if (mDK && tl.includes('bán kính')) {
      const d = docSo(mDK[1]), dv = mDK[2] ? ` ${mDK[2]}` : '';
      const hinh: DuongTronDay = {
        loai: 'duong-tron-day',
        chuong: 'C5',
        moTa: `Đường tròn đường kính ${dinhDang(d)}${dv}`,
        diem: [{ ten: 'A', goc: 180 }, { ten: 'B', goc: 0 }, { ten: 'M', goc: 50 }],
        doan: [
          { tu: 'A', den: 'B', nhan: `d = ${dinhDang(d)}${dv}` },
          { tu: 'O', den: 'M', chinh: true, nhan: daTra ? `R = ${dinhDang(d / 2)}${dv}` : 'R = ?' },
        ],
      };
      return { hinh, chu: `Đường kính AB = ${dinhDang(d)}${dv}; tìm bán kính R.`, loaiMau: 'duong-tron' };
    }
    const mBK = t.match(/(?:bán kính|mở compa)\s*(\d+(?:[.,]\d+)?)\s*(cm|dm|m|mm)?/i);
    if (mBK && tl.includes('đường kính')) {
      const r = docSo(mBK[1]), dv = mBK[2] ? ` ${mBK[2]}` : '';
      const hinh: DuongTronDay = {
        loai: 'duong-tron-day',
        chuong: 'C5',
        moTa: `Đường tròn bán kính ${dinhDang(r)}${dv}`,
        diem: [{ ten: 'A', goc: 180 }, { ten: 'B', goc: 0 }, { ten: 'M', goc: 50 }],
        doan: [
          { tu: 'O', den: 'M', nhan: `R = ${dinhDang(r)}${dv}` },
          { tu: 'A', den: 'B', chinh: true, nhan: daTra ? `d = ${dinhDang(2 * r)}${dv}` : 'd = ?' },
        ],
      };
      return { hinh, chu: `Bán kính OM = ${dinhDang(r)}${dv}; tìm đường kính AB.`, loaiMau: 'duong-tron' };
    }
  }

  // 8. Trung điểm đoạn thẳng (C5-B14-M1)
  const mTrungDiem = t.match(/đoạn\s*([A-Z]{2})\s*dài\s*(\d+(?:[.,]\d+)?)\s*(cm|dm|m|mm)?\s*,\s*([A-Z])\s*là trung điểm/i);
  if (mTrungDiem) {
    const p1 = mTrungDiem[1][0], p2 = mTrungDiem[1][1], dai = docSo(mTrungDiem[2]);
    const dv = mTrungDiem[3] ? ` ${mTrungDiem[3]}` : '', mid = mTrungDiem[4];
    const hinh: DuongTronDay = {
      loai: 'duong-tron-day',
      chuong: 'C5',
      anDuongTron: true,
      anTam: true,
      moTa: `Đoạn thẳng ${p1}${p2} dài ${dinhDang(dai)}${dv}, ${mid} là trung điểm`,
      diem: [
        { ten: p1, goc: 180, t: 1.15, dy: 4 },
        { ten: mid, goc: 0, t: 0, dy: 4 },
        { ten: p2, goc: 0, t: 1.15, dy: 4 },
      ],
      doan: [
        { tu: p1, den: mid, chinh: true, nhan: daTra ? `${dinhDang(dai / 2)}${dv}` : '?' },
        { tu: mid, den: p2 },
      ],
      nhanThem: [{ goc: 90, t: 0.45, text: `${p1}${p2} = ${dinhDang(dai)}${dv}` }],
    };
    return { hinh, chu: `${mid} là trung điểm của đoạn ${p1}${p2} dài ${dinhDang(dai)}${dv}.`, loaiMau: 'trung-diem' };
  }

  // 9. Số đo góc cụ thể (C5-B14-M2: Góc 120°, Góc 45°)
  const mLoaiGoc = t.match(/góc\s*(\d+)\s*°\s*là góc gì/i);
  if (mLoaiGoc) {
    const g = docSo(mLoaiGoc[1]);
    if (g > 0 && g < 180) {
      const hinh: DuongTronDay = {
        loai: 'duong-tron-day',
        chuong: 'C5',
        anDuongTron: true,
        moTa: `Góc AOB có số đo ${g}°`,
        diem: [{ ten: 'A', goc: 0, t: 1.05 }, { ten: 'B', goc: g, t: 1.05 }],
        doan: [{ tu: 'O', den: 'A', chinh: true }, { tu: 'O', den: 'B', chinh: true }],
        cung: [{ tuGoc: 0, denGoc: g, toNhe: true, cungGoc: true, nhanGoc: `${g}°`, nhanCung: '?' }],
      };
      return { hinh, chu: `Góc AOB mở ${g}°; xác định loại góc tương ứng.`, loaiMau: 'goc-so-do' };
    }
  }

  // 10. Cung tròn / góc ở tâm / phân số của 360° (C5-B14-M3 & C5-B15-M1)
  const mTru360 = t.match(/360°\s*-\s*(\d+)\s*°/);
  if (mTru360) {
    const g = docSo(mTru360[1]);
    if (g > 0 && g < 360) {
      const hinh: DuongTronDay = {
        loai: 'duong-tron-day',
        chuong: 'C5',
        moTa: `Cung nhỏ ${g}° và cung lớn bù 360°`,
        diem: [{ ten: 'A', goc: 20 }, { ten: 'B', goc: 20 + g }],
        doan: [{ tu: 'O', den: 'A' }, { tu: 'O', den: 'B' }],
        cung: [
          { tuGoc: 20, denGoc: 20 + g, nhanGoc: `${g}°` },
          { tuGoc: 20 + g, denGoc: 20, cungLon: true, toNhe: true, cungGoc: false, nhanCung: daTra ? `${360 - g}°` : '?' },
        ],
      };
      return { hinh, chu: `Cung nhỏ có số đo ${g}°; tìm phần cung lớn còn lại.`, loaiMau: 'cung-bu-360' };
    }
  }

  const mCungLon = t.match(/cung nhỏ\s*[A-Z]{2}\s*bằng\s*(\d+)\s*°\.\s*cung lớn/i);
  if (mCungLon) {
    const g = docSo(mCungLon[1]);
    if (g > 0 && g < 180) {
      const hinh: DuongTronDay = {
        loai: 'duong-tron-day',
        chuong: 'C5',
        moTa: `Cung nhỏ AB = ${g}°, tìm cung lớn AB`,
        diem: [{ ten: 'A', goc: 15 }, { ten: 'B', goc: 15 + g }],
        doan: [{ tu: 'O', den: 'A' }, { tu: 'O', den: 'B' }],
        cung: [
          { tuGoc: 15, denGoc: 15 + g, nhanCung: `${g}°` },
          { tuGoc: 15 + g, denGoc: 15, cungLon: true, toNhe: true, cungGoc: false, nhanCung: daTra ? `${360 - g}°` : '?' },
        ],
      };
      return { hinh, chu: `Cung nhỏ AB = ${g}°; tìm số đo cung lớn AB.`, loaiMau: 'cung-lon' };
    }
  }

  const mGocOTamCung = t.match(/góc ở tâm bằng\s*(\d+)\s*°/i);
  if (mGocOTamCung) {
    const g = docSo(mGocOTamCung[1]);
    if (g > 0 && g < 180) {
      const hinh: QuatVanhKhuyen = {
        loai: 'quat-vanh-khuyen',
        chuong: 'C5',
        moTa: `Góc ở tâm bằng ${g}° chắn cung nhỏ AB`,
        kieu: 'cung',
        R: 1,
        goc: g,
        nhan: { goc: `∠O = ${g}°`, cung: '?' },
      };
      return { hinh, chu: `Góc ở tâm AOB = ${g}°; tìm số đo cung nhỏ AB bị chắn.`, loaiMau: 'goc-o-tam' };
    }
  }

  const mCongGoc = t.match(/(\d+)\s*°\s*\+\s*(\d+)\s*°/);
  if (mCongGoc) {
    const g1 = docSo(mCongGoc[1]), g2 = docSo(mCongGoc[2]);
    if (g1 > 0 && g2 > 0 && g1 + g2 < 360) {
      const hinh: DuongTronDay = {
        loai: 'duong-tron-day',
        chuong: 'C5',
        moTa: `Hai cung kề nhau ${g1}° và ${g2}°`,
        diem: [{ ten: 'A', goc: 15 }, { ten: 'M', goc: 15 + g1 }, { ten: 'B', goc: 15 + g1 + g2 }],
        doan: [{ tu: 'O', den: 'A' }, { tu: 'O', den: 'M', netDut: true }, { tu: 'O', den: 'B' }],
        cung: [
          { tuGoc: 15, denGoc: 15 + g1, nhanGoc: `${g1}°` },
          { tuGoc: 15 + g1, denGoc: 15 + g1 + g2, nhanGoc: `${g2}°` },
          { tuGoc: 15, denGoc: 15 + g1 + g2, toNhe: true, cungGoc: false, nhanCung: daTra ? `${g1 + g2}°` : '?' },
        ],
      };
      return { hinh, chu: `Hai góc ở tâm liền kề ${g1}° và ${g2}°; tìm số đo cung tổng AB.`, loaiMau: 'cong-cung' };
    }
  }

  if (tl.includes('nửa đường tròn')) {
    const hinh: DuongTronDay = {
      loai: 'duong-tron-day',
      chuong: 'C5',
      moTa: 'Nửa đường tròn đường kính AB',
      diem: [{ ten: 'A', goc: 180 }, { ten: 'B', goc: 0 }],
      doan: [{ tu: 'A', den: 'B' }],
      cung: [{ tuGoc: 0, denGoc: 180, toNhe: true, cungGoc: false, nhanCung: daTra ? '180°' : '?' }],
    };
    return { hinh, chu: `Nửa đường tròn có hai đầu là đường kính AB.`, loaiMau: 'nua-duong-tron' };
  }

  const mPhanTu = t.match(/1\/4 của 360°/);
  if (mPhanTu) {
    const hinh: QuatVanhKhuyen = {
      loai: 'quat-vanh-khuyen',
      chuong: 'C5',
      moTa: '1/4 hình tròn của 360°',
      kieu: 'quat',
      R: 1,
      goc: 90,
      veGocVuong: false,
      nhan: { goc: daTra ? '90°' : '?', cung: '1/4 vòng' },
    };
    return { hinh, chu: `Hình quạt chiếm 1/4 của cả đường tròn 360°.`, loaiMau: 'phan-hinh-tron' };
  }

  const m120 = t.match(/120\/360/);
  if (m120) {
    const hinh: QuatVanhKhuyen = {
      loai: 'quat-vanh-khuyen',
      chuong: 'C5',
      moTa: 'Hình quạt 120° trên cả đường tròn 360°',
      kieu: 'quat',
      R: 1,
      goc: 120,
      nhan: { goc: '120°', cung: daTra ? '1/3 vòng' : '1/? vòng' },
    };
    return { hinh, chu: `Hình quạt góc ở tâm 120° so với cả đường tròn 360°.`, loaiMau: 'phan-hinh-tron' };
  }

  // 11. Hình vành khuyên trong C5-B15-M3 (R² - r² hoặc R²π - r²π)
  if (kuId === 'C5-B15-M3') {
    const mBp = t.match(/(\d+)²\s*-\s*(\d+)²/);
    if (mBp) {
      const r1 = docSo(mBp[1]), r2 = docSo(mBp[2]);
      if (r1 > r2 && r2 > 0) {
        const hinh: QuatVanhKhuyen = {
          loai: 'quat-vanh-khuyen',
          chuong: 'C5',
          moTa: `Hình vành khuyên bán kính ${r1} và ${r2}`,
          kieu: 'vanh-khuyen',
          R: r1,
          r: r2,
          nhan: { R: `R = ${r1}`, r: `r = ${r2}`, doDay: daTra ? `R² − r² = ${r1 * r1 - r2 * r2}` : 'R² − r² = ?' },
        };
        return { hinh, chu: `Hai hình tròn đồng tâm bán kính ${r1} và ${r2}.`, loaiMau: 'vanh-khuyen' };
      }
    }
    const mPi = t.match(/(\d+)\s*π\s*-\s*(\d+)\s*π/);
    if (mPi) {
      const s1 = docSo(mPi[1]), s2 = docSo(mPi[2]);
      const r1 = Math.sqrt(s1), r2 = Math.sqrt(s2);
      if (r1 > r2 && r2 > 0) {
        const hinh: QuatVanhKhuyen = {
          loai: 'quat-vanh-khuyen',
          chuong: 'C5',
          moTa: `Hình vành khuyên diện tích lớn ${s1}π và nhỏ ${s2}π`,
          kieu: 'vanh-khuyen',
          R: r1,
          r: r2,
          nhan: { R: `R = ${dinhDang(r1)}`, r: `r = ${dinhDang(r2)}`, doDay: daTra ? `${s1 - s2}π` : '?π' },
        };
        return { hinh, chu: `Hình tròn lớn ${s1}π trừ hình tròn nhỏ ${s2}π.`, loaiMau: 'vanh-khuyen' };
      }
    }
  }

  // 12. Hai đường tròn biết R và r (C5-B17-M2)
  const mHaiDT = t.match(/\bR\s*=\s*(\d+(?:[.,]\d+)?)\s*,\s*r\s*=\s*(\d+(?:[.,]\d+)?)/);
  if (mHaiDT && (t.includes('R + r') || t.includes('R - r'))) {
    const r1 = docSo(mHaiDT[1]), r2 = docSo(mHaiDT[2]);
    if (r1 > r2 && r2 > 0) {
      const laCong = t.includes('R + r');
      const d = laCong ? r1 + r2 : r1 - r2;
      const hinh: HaiDuongTron = {
        loai: 'hai-duong-tron',
        chuong: 'C5',
        moTa: `Hai đường tròn bán kính R = ${dinhDang(r1)} và r = ${dinhDang(r2)}`,
        R: r1,
        r: r2,
        d,
        nhan: {
          R: `R = ${dinhDang(r1)}`,
          r: `r = ${dinhDang(r2)}`,
          d: daTra ? `OO′ = ${dinhDang(d)}` : 'OO′ = ?',
        },
      };
      return {
        hinh,
        chu: laCong ? `Hai đường tròn tiếp xúc ngoài: khoảng cách tâm OO′ = R + r.` : `Hai đường tròn tiếp xúc trong: khoảng cách tâm OO′ = R − r.`,
        loaiMau: 'hai-duong-tron',
      };
    }
  }

  return null;
}
