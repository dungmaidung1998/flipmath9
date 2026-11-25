/**
 * FILE NÀY LÀM GÌ: Hàm thuần Ôn thi không quá tải: nhận diện 5 dấu hiệu hành vi (khuya, liên tục, sai liên tiếp, dồn dập, vượt ngày) và gộp giới hạn chặt hơn.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * ÔN THI KHÔNG QUÁ TẢI (hàm thuần TypeScript, KHÔNG dùng từ ngữ bệnh lý, KHÔNG chẩn đoán cảm xúc).
 * Chỉ dựa trên hành vi học (giờ học, thời lượng, nhịp làm bài, tỉ lệ sai).
 */

export type LoaiDauHieuQuaTai =
  | 'khuya'
  | 'lien-tuc'
  | 'sai-lien-tiep'
  | 'don-dap'
  | 'vuot-ngay';

export type CauHinhQuaTai = {
  phut_ngay: number; // mặc định 90
  gio_khuya: string; // mặc định '22:30'
  gio_sang: string; // mặc định '05:30'
  phut_lien_tuc: number; // mặc định 50
  sai_lien_tiep: number; // mặc định 5
  don_dap_so_cau: number; // mặc định 12
  don_dap_ti_le: number; // mặc định 0.5 (50%)
  bat_khuya: boolean;
  bat_lien_tuc: boolean;
  bat_sai_lien_tiep: boolean;
  bat_don_dap: boolean;
  bat_vuot_ngay: boolean;
};

export const CAU_HINH_QUA_TAI_MAC_DINH: CauHinhQuaTai = {
  phut_ngay: 90,
  gio_khuya: '22:30',
  gio_sang: '05:30',
  phut_lien_tuc: 50,
  sai_lien_tiep: 5,
  don_dap_so_cau: 12,
  don_dap_ti_le: 0.5,
  bat_khuya: true,
  bat_lien_tuc: true,
  bat_sai_lien_tiep: true,
  bat_don_dap: true,
  bat_vuot_ngay: true,
};

export type LuotCauGanDay = {
  tsMs: number;
  dung: boolean;
};

export type TrangThaiHanhViHoc = {
  /** Số phút kể từ 00:00 giờ Việt Nam (ví dụ 22:30 -> 1350). */
  phutTrongNgayVN: number;
  phutLienTuc: number;
  phutTrongNgay: number;
  /** Chuỗi các câu mới làm gần đây (theo thứ tự thời gian tăng dần). */
  cauGanDay: LuotCauGanDay[];
  nowMs: number;
};

/** Chuyển chuỗi 'HH:MM' thành phút từ 00:00 (ví dụ '22:30' -> 1350). */
export function gioPhutThanhSo(hhmm: string, macDinh: number): number {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm ?? '').trim());
  if (!m) return macDinh;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const h = Math.max(0, Math.min(23, Number(m[1])));
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const min = Math.max(0, Math.min(59, Number(m[2])));
  return h * 60 + min;
}

/** Lấy số phút trong ngày theo giờ Việt Nam (UTC+7). */
export function phutHienTaiVN(nowMs = Date.now()): number {
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const d = new Date(nowMs + 7 * 3600_000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/** Trả true nếu thời điểm thuộc khung giờ khuya/sớm (mặc định 22:30..05:30). */
export function laGioKhuya(
  phutTrongNgayVN: number,
  gioKhuya = '22:30',
  gioSang = '05:30'
): boolean {
  const khuya = gioPhutThanhSo(gioKhuya, 22 * 60 + 30);
  const sang = gioPhutThanhSo(gioSang, 5 * 60 + 30);
  if (khuya > sang) {
    return phutTrongNgayVN >= khuya || phutTrongNgayVN < sang;
  }
  return phutTrongNgayVN >= khuya && phutTrongNgayVN < sang;
}

/**
 * Gộp giới hạn của giáo viên (lớp/em) và phụ huynh: luôn chọn mức chặt hơn (bảo vệ sức khoẻ học sinh).
 */
export function hopNhatGioiHan(
  gv?: Partial<CauHinhQuaTai> | null,
  phuHuynh?: { phut_ngay?: number | null; gio_khuya?: string | null; gio_sang?: string | null } | null
): CauHinhQuaTai {
  const base: CauHinhQuaTai = { ...CAU_HINH_QUA_TAI_MAC_DINH, ...(gv ?? {}) };
  if (phuHuynh?.phut_ngay != null && Number.isFinite(phuHuynh.phut_ngay) && phuHuynh.phut_ngay > 0) {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    base.phut_ngay = Math.min(base.phut_ngay, Math.round(phuHuynh.phut_ngay));
  }
  if (phuHuynh?.gio_khuya) {
    const kBase = gioPhutThanhSo(base.gio_khuya, 22 * 60 + 30);
    const kPh = gioPhutThanhSo(phuHuynh.gio_khuya, 22 * 60 + 30);
    // Giờ khuya sớm hơn trong tối (vd 21:30 so với 22:30) là chặt hơn
    const norm = (x: number) => (x < 12 * 60 ? x + 24 * 60 : x);
    if (norm(kPh) < norm(kBase)) base.gio_khuya = phuHuynh.gio_khuya;
  }
  if (phuHuynh?.gio_sang) {
    const sBase = gioPhutThanhSo(base.gio_sang, 5 * 60 + 30);
    const sPh = gioPhutThanhSo(phuHuynh.gio_sang, 5 * 60 + 30);
    // Giờ dậy muộn hơn (vd 06:00 so với 05:30) là chặt hơn
    if (sPh > sBase) base.gio_sang = phuHuynh.gio_sang;
  }
  return base;
}

/** Phát hiện các dấu hiệu học quá tải hiện hành từ trạng thái hành vi. */
export function phatHienDauHieuQuaTai(
  trangThai: TrangThaiHanhViHoc,
  cauHinh: CauHinhQuaTai = CAU_HINH_QUA_TAI_MAC_DINH
): LoaiDauHieuQuaTai[] {
  const kq: LoaiDauHieuQuaTai[] = [];

  if (cauHinh.bat_khuya && laGioKhuya(trangThai.phutTrongNgayVN, cauHinh.gio_khuya, cauHinh.gio_sang)) {
    kq.push('khuya');
  }
  if (cauHinh.bat_lien_tuc && trangThai.phutLienTuc >= cauHinh.phut_lien_tuc) {
    kq.push('lien-tuc');
  }
  if (cauHinh.bat_vuot_ngay && trangThai.phutTrongNgay >= cauHinh.phut_ngay) {
    kq.push('vuot-ngay');
  }

  if (cauHinh.bat_sai_lien_tiep && trangThai.cauGanDay.length >= cauHinh.sai_lien_tiep) {
    const duoi = trangThai.cauGanDay.slice(-cauHinh.sai_lien_tiep);
    if (duoi.every((c) => !c.dung)) {
      kq.push('sai-lien-tiep');
    }
  }

  if (cauHinh.bat_don_dap) {
    const cuaSo5Phut = trangThai.nowMs - 5 * 60_000;
    const trong5Phut = trangThai.cauGanDay.filter((c) => c.tsMs >= cuaSo5Phut && c.tsMs <= trangThai.nowMs);
    if (trong5Phut.length >= cauHinh.don_dap_so_cau) {
      const tiLeDung = trong5Phut.filter((c) => c.dung).length / trong5Phut.length;
      if (tiLeDung < cauHinh.don_dap_ti_le) {
        kq.push('don-dap');
      }
    }
  }

  return kq;
}

/** Kích hoạt giảm tải tự động đề tiếp theo (3 câu & lùi 1 mức dễ hơn) khi sai liên tiếp hoặc làm dồn dập. */
export function canGiamTaiDe(dauHieu: LoaiDauHieuQuaTai[]): boolean {
  return dauHieu.includes('sai-lien-tiep') || dauHieu.includes('don-dap');
}

/** Khoá mềm bài MỚI đến hôm sau khi vượt giới hạn ngày hoặc vào giờ ngủ. */
export function biKhoaMemBaiMoi(dauHieu: LoaiDauHieuQuaTai[]): boolean {
  return dauHieu.includes('vuot-ngay') || dauHieu.includes('khuya');
}

export const NHAN_DAU_HIEU_QUA_TAI: Record<LoaiDauHieuQuaTai, { ten: string; loiBin: string }> = {
  khuya: {
    ten: 'Học khuya / sáng quá sớm',
    loiBin: 'Khuya rồi đó em, nghỉ ngơi ngủ đủ giấc để mai học nhớ lâu hơn nhé.',
  },
  'lien-tuc': {
    ten: 'Học liên tục lâu',
    loiBin: 'Em làm nhiều rồi, nghỉ 5 phút nhé để mắt và tay được thư giãn.',
  },
  'sai-lien-tiep': {
    ten: 'Sai nhiều câu liền nhau',
    loiBin: 'Em làm nhiều rồi, nghỉ 5 phút nhé — hoặc thử chuyển sang đề nhẹ nhàng hơn.',
  },
  'don-dap': {
    ten: 'Làm rất nhanh nhiều câu liên tiếp',
    loiBin: 'Em làm nhiều rồi, nghỉ 5 phút nhé rồi đọc chậm lại từng câu.',
  },
  'vuot-ngay': {
    ten: 'Đủ thời lượng học trong ngày',
    loiBin: 'Hôm nay em đã học đủ thời lượng đặt ra rồi. Em có thể xem lại tóm tắt hoặc Sổ lỗi nhé.',
  },
};

export const TU_THE_GIAN_CO = [
  {
    id: 'gian-co-co',
    ten: 'Nghiêng đầu nhẹ',
    moTa: 'Nghiêng nhẹ đầu sang trái 10 giây rồi sang phải 10 giây, thả lỏng vai.',
    anh: '/tinh-nang/qua-tai/gian-co-co.webp',
  },
  {
    id: 'gian-co-vai',
    ten: 'Xoay vai',
    moTa: 'Xoay tròn hai vai ra sau 5 vòng chậm, hít thở đều.',
    anh: '/tinh-nang/qua-tai/gian-co-vai.webp',
  },
  {
    id: 'gian-co-tay',
    ten: 'Duỗi cổ tay',
    moTa: 'Duỗi thẳng cánh tay, xoay nhẹ cổ tay trái phải vài vòng.',
    anh: '/tinh-nang/qua-tai/gian-co-tay.webp',
  },
  {
    id: 'nhin-xa',
    ten: 'Nhìn xa 20 giây',
    moTa: 'Nhìn ra cửa sổ hoặc vật ở xa khoảng 6 mét trong 20 giây cho mắt nghỉ.',
    anh: '/tinh-nang/qua-tai/nhin-xa.webp',
  },
] as const;
