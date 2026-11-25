/**
 * ============================================================================
 * THUẬT TOÁN ĐIỂM CHĂM CHỈ THEO TUẦN (FLIP ACTIVITY SCORE - FAS)
 * ============================================================================
 * Tệp mã nguồn: code/web/lib/mucHoatDong.ts
 * Vai trò: Giúp thầy cô biết bạn nào học đều, bạn nào cần hỗ trợ trong tuần:
 *   - Thang điểm chuẩn: 0 đến 100 điểm.
 *   - Chu kỳ tính: Tính trọn vẹn từng tuần (từ Thứ Hai 00:00 đến Chủ Nhật 23:59:59 theo giờ Việt Nam).
 *   - NGUYÊN TẮC VÀNG: Thời gian mở máy ngồi chơi KHÔNG được tính điểm.
 *     Hệ thống chỉ chấm dựa trên HÀNH ĐỘNG HỌC TẬP THỰC TẾ để tránh tình trạng cắm máy giả vờ học!
 */

// Kiểu dữ liệu lưu sự kiện học tập (ví dụ: xem video, nộp bài, chơi trò chơi...)
export type SuKien = { 
  student_id: string; 
  event_type: string; 
  ts: string; 
  ku_id?: string | null; 
  payload?: any 
};

// Kiểu dữ liệu lưu một lượt nộp bài làm của học sinh
export type LuotLam = { 
  attempt_id: number; 
  student_id: string; 
  ku_id: string; 
  kind: string | null; 
  score: number | null; 
  submitted_at: string | null 
};

// Kiểu dữ liệu lưu kết quả từng câu trả lời trong một lượt nộp bài
export type TraLoi = { 
  attempt_id: number; 
  is_correct: boolean 
};

// Cấu trúc dữ liệu kết quả Điểm chăm chỉ FAS của một học sinh trong tuần
export type Fas = {
  fas: number;            // Điểm tổng kết FAS từ 0 đến 100 (đã làm tròn)
  nhom: NhomFas;          // Nhóm phân loại học sinh ('can-quan-tam', 'can-ho-tro', 'tich-cuc', 'xuat-sac')
  P: number | null;       // Điểm chuẩn bị trước giờ (0 -> 1)
  L: number;              // Điểm luyện tập số câu (0 -> 1)
  T: number;              // Điểm bài kiểm tra chuẩn bị (0 -> 1)
  R: number;              // Điểm đều đặn các ngày trong tuần (0 -> 1)
  K: number;              // Điểm kiên trì làm lại câu sai trong 48h (0 -> 1)
  E: number;              // Điểm khắc phục lỗi cũ (0 -> 1)
  ngay: number;           // Số ngày thực tế em có vào học trong tuần (0 -> 7 ngày)
  cauTraLoi: number;      // Tổng số câu trắc nghiệm em đã trả lời trong tuần
  mucChuanBi: number;     // Số mục bài học em đã chuẩn bị
  mucLopHoc: number;      // Số mục bài mà lớp đang học hoặc thầy cô giao
  theoLich: boolean;      // Có lịch giao bài chính thức của giáo viên hay không
  diemPhieu: number | null; // Điểm trung bình bài chuẩn bị (thang 10)
  khuya: number;          // Số lượt học bài vào đêm khuya (từ 22h đêm đến 6h sáng)
  lanCuoi: string | null; // Mốc thời gian lần cuối cùng em hoạt động trên web
  coHoatDong: boolean;    // Tuần này em có vào học hay không
};

// Định danh 4 nhóm phân loại học sinh
export type NhomFas = 'can-quan-tam' | 'can-ho-tro' | 'tich-cuc' | 'xuat-sac';

/**
 * [SỐ HIỆU TT-11: PHÂN NHÓM 4 MỨC NĂNG ĐỘNG HỌC TẬP (FAS CLUSTERING)]
 * ---------------------------------------------------------------------------
 * Ý tưởng sư phạm: Thầy cô nhìn màu sắc là biết ngay cần giúp đỡ học sinh nào:
 *   - Dưới 40 điểm: 🔴 CẦN QUAN TÂM (Em ít vào học, có thể gặp trục trặc thiết bị, mạng hoặc chán nản)
 *   - 40 - 59 điểm:  🟠 CẦN HỖ TRỢ  (Em có học nhưng chưa đều, cần nhắc nhở và giao việc ngắn vừa sức)
 *   - 60 - 79 điểm:  🟢 TÍCH CỰC    (Em học tập chăm chỉ, đạt chuẩn yêu cầu lớp học đảo ngược)
 *   - Từ 80 điểm:    🔵 XUẤT SẮC    (Em tự giác rất cao, hoàn thành vượt mức, có thể làm trợ giảng giúp bạn)
 */
export const TEN_NHOM: Record<NhomFas, { ten: string; bieuTuong: string; mau: string; nen: string; goiY: string }> = {
  'can-quan-tam': { ten: 'Cần quan tâm', bieuTuong: '🔴', mau: '#b3261e', nen: '#fde7e5', goiY: 'Gặp riêng, kiểm tra thiết bị, mạng' },
  'can-ho-tro':   { ten: 'Cần hỗ trợ',   bieuTuong: '🟠', mau: '#9a5b00', nen: '#ffecd2', goiY: 'Nhắc nhở, giao nhiệm vụ ngắn' },
  'tich-cuc':     { ten: 'Tích cực',     bieuTuong: '🟢', mau: '#1e7a4b', nen: '#e3f6ea', goiY: 'Duy trì' },
  'xuat-sac':     { ten: 'Xuất sắc',     bieuTuong: '🔵', mau: '#17579c', nen: '#e2eefb', goiY: 'Giao nhiệm vụ Đỉnh Sao, làm trợ giảng' }
};

/**
 * [SỐ HIỆU TT-10: CÔNG THỨC 6 THÀNH PHẦN TRỌNG SỐ FAS]
 * ---------------------------------------------------------------------------
 * Ý tưởng sư phạm: Đánh giá toàn diện sự chăm chỉ của học sinh qua 6 thành phần:
 *   - P (25%): Chuẩn bị bài trước khi đến lớp (Lớp học đảo ngược cốt lõi là bước này!)
 *   - L (20%): Luyện tập giải toán (Chỉ tiêu 40 câu/tuần là vừa sức, min(1, số_câu / 40))
 *   - T (20%): Chất lượng bài chuẩn bị (Điểm bài trắc nghiệm chuẩn bị / 10)
 *   - R (15%): Đều đặn (Học rải các ngày thay vì dồn một hôm, chỉ tiêu 5 ngày/tuần, min(1, số_ngày / 5))
 *   - K (10%): Kiên trì (Làm lại câu sai trong vòng 48 giờ để rút kinh nghiệm)
 *   - E (10%): Khắc phục lỗi (Tỉ lệ sửa đúng các lỗi trong mục Soát lỗi cũ)
 * 
 * Tổng trọng số: 0.25 + 0.20 + 0.20 + 0.15 + 0.10 + 0.10 = 1.0 (100%)
 */
export const TRONG_SO = { P: 0.25, L: 0.2, T: 0.2, R: 0.15, K: 0.1, E: 0.1 };
export const CHI_TIEU_CAU_TUAN = 40; // Mục tiêu: Trả lời 40 câu trắc nghiệm mỗi tuần

/** Hàm xếp loại học sinh vào nhóm tương ứng dựa trên điểm FAS */
export function nhomTheoFas(f: number): NhomFas {
  if (f >= 80) return 'xuat-sac';       // Điểm từ 80 trở lên: Xuất sắc
  if (f >= 60) return 'tich-cuc';       // Điểm từ 60 đến 79: Tích cực
  if (f >= 40) return 'can-ho-tro';     // Điểm từ 40 đến 59: Cần hỗ trợ
  return 'can-quan-tam';                // Điểm dưới 40: Cần quan tâm
}

// Bù giờ Việt Nam (UTC+7)
const VN = 7 * 3600_000;

/** Chuyển mốc thời gian sang định dạng ngày Việt Nam 'YYYY-MM-DD' */
export function ngayVN(iso: string | number | Date): string { 
  return new Date(new Date(iso).getTime() + VN).toISOString().slice(0, 10); 
}

/** Lấy giờ trong ngày theo giờ Việt Nam (0 đến 23) để kiểm tra xem em có học quá khuya hay không */
function gioVN(iso: string): number { 
  return new Date(new Date(iso).getTime() + VN).getUTCHours(); 
}

/** Xác định khung thời gian của tuần: Từ Thứ Hai 00:00 đến hết Chủ Nhật theo giờ Việt Nam */
export function khungTuan(luc = Date.now(), lui = 0): { tu: Date; den: Date; nhan: string } {
  const d = new Date(luc + VN);
  const thu = (d.getUTCDay() + 6) % 7; // 0 = thứ Hai, 6 = Chủ Nhật
  const dauVN = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - thu - 7 * lui);
  const tu = new Date(dauVN - VN), den = new Date(dauVN - VN + 7 * 86400_000);
  const f = (x: number) => new Date(x).toISOString().slice(5, 10).split('-').reverse().join('/');
  return { tu, den, nhan: `${f(dauVN)} – ${f(dauVN + 6 * 86400_000)}` };
}

// Danh sách các sự kiện KHÔNG tính điểm (ví dụ: mở video nhưng không bấm xem mà để đó)
const KHONG_TINH = new Set(['video_idle']);

/**
 * Hàm tính toán điểm FAS hoàn chỉnh cho cả lớp trong một tuần cụ thể
 */
export function tinhFas(
  hocSinh: string[], 
  suKien: SuKien[], 
  luot: LuotLam[], 
  traLoi: TraLoi[], 
  tu: Date, 
  den: Date,
  soatLoi: Map<string, { khacPhuc: number; tong: number }> = new Map(),
  giao: Map<string, { muc: string[]; han: string }[]> = new Map()
): Map<string, Fas> {
  // Hàm kiểm tra xem mốc thời gian s có nằm trong tuần đang xét hay không
  const trong = (s: string | null | undefined) => !!s && s >= tu.toISOString() && s < den.toISOString();

  // Bảng đếm tổng số câu và số câu sai theo từng lượt nộp bài
  const soCauTheoLuot = new Map<number, { tong: number; sai: number }>();
  for (const a of traLoi) {
    const c = soCauTheoLuot.get(a.attempt_id) ?? { tong: 0, sai: 0 };
    c.tong++; 
    if (!a.is_correct) c.sai++;
    soCauTheoLuot.set(a.attempt_id, c);
  }

  // Xác định những bài học nào cả lớp đang cùng học (có từ 1/3 sĩ số lớp trở lên làm bài chuẩn bị)
  const nguoiTheoMuc = new Map<string, Set<string>>();
  for (const l of luot) if (l.kind !== 'van-dung' && trong(l.submitted_at)) {
    (nguoiTheoMuc.get(l.ku_id) ?? nguoiTheoMuc.set(l.ku_id, new Set()).get(l.ku_id)!).add(l.student_id);
  }
  const mucLop = new Set(Array.from(nguoiTheoMuc).filter(([, s]) => s.size >= Math.max(1, Math.ceil(hocSinh.length / 3))).map(([k]) => k));

  // Bảng lưu kết quả FAS của từng học sinh
  const kq = new Map<string, Fas>();

  // Duyệt qua từng học sinh trong danh sách
  for (const id of hocSinh) {
    // 1. Lọc các sự kiện học tập thực sự có thao tác của học sinh này trong tuần
    const ev = suKien.filter((e) => e.student_id === id && trong(e.ts) && !KHONG_TINH.has(e.event_type));
    const lt = luot.filter((l) => l.student_id === id);
    const ltTuan = lt.filter((l) => trong(l.submitted_at));

    // 2. Đếm số ngày khác nhau trong tuần mà em có vào học bài
    const ngay = new Set<string>([...ev.map((e) => ngayVN(e.ts)), ...ltTuan.map((l) => ngayVN(l.submitted_at!))]);

    // 3. Đếm số lần em học bài quá khuya (từ 22h đêm đến 6h sáng) để nhắc em ngủ đủ giấc
    const khuya = [...ev.map((e) => e.ts), ...ltTuan.map((l) => l.submitted_at!)].filter((t) => { 
      const g = gioVN(t); return g >= 22 || g < 6; 
    }).length;

    // 4. Tính thành phần L (Luyện tập): Tổng câu làm trong bài tập và trò chơi chia cho chỉ tiêu 40 câu
    const cauBai = ltTuan.reduce((s, l) => s + (soCauTheoLuot.get(l.attempt_id)?.tong ?? 0), 0);
    const cauKhac = ev.filter((e) => ['game_finish', 'on_thi_10', 'tieng_anh'].includes(e.event_type))
      .reduce((s, e) => s + Math.max(0, Math.min(20, Number(e.payload?.tong) || 0)), 0);
    const cauTraLoi = cauBai + cauKhac;
    const L = Math.min(1, cauTraLoi / CHI_TIEU_CAU_TUAN); // Tối đa đạt 1.0 (100% chỉ tiêu)

    // 5. Tính thành phần T (Điểm bài chuẩn bị): Điểm trung bình phiếu chuẩn bị chia cho 10
    const phieu = ltTuan.filter((l) => l.kind !== 'van-dung' && l.score != null);
    const diemPhieu = phieu.length ? phieu.reduce((s, l) => s + Number(l.score), 0) / phieu.length : null;
    const T = diemPhieu == null ? 0 : Math.min(1, diemPhieu / 10);

    // 6. Tính thành phần P (Chuẩn bị trước giờ):
    //    Nếu có lịch giao bài của giáo viên: Số bài nộp đúng hạn / Tổng bài được giao
    //    Nếu chưa có lịch: Số bài em chuẩn bị / Số bài lớp đang học
    const mucEm = new Set(phieu.map((l) => l.ku_id));
    const baiGiao = giao.get(id) ?? [];
    let P: number | null;
    let mucDuocGiao = mucLop.size;
    if (baiGiao.length) {
      const nopDau = new Map<string, string>();
      for (const l of [...lt].filter((x) => x.kind !== 'van-dung' && x.submitted_at).sort((a, b) => a.submitted_at!.localeCompare(b.submitted_at!))) {
        if (!nopDau.has(l.ku_id)) nopDau.set(l.ku_id, l.submitted_at!);
      }
      const tong = baiGiao.reduce((s, b) => s + b.muc.length, 0);
      const dungHan = baiGiao.reduce((s, b) => s + b.muc.filter((m) => (nopDau.get(m) ?? '~') <= b.han).length, 0);
      P = tong ? dungHan / tong : null;
      mucDuocGiao = tong;
    } else {
      P = mucLop.size ? Array.from(mucLop).filter((k) => mucEm.has(k)).length / mucLop.size : null;
    }

    // 7. Tính thành phần R (Đều đặn): Số ngày có học chia cho chỉ tiêu 5 ngày/tuần
    const R = Math.min(1, ngay.size / 5);

    // 8. Tính thành phần K (Kiên trì): Tỉ lệ câu sai được em làm lại trong vòng 48 giờ
    let sai = 0, lamLai = 0;
    for (const l of ltTuan) {
      const s = soCauTheoLuot.get(l.attempt_id)?.sai ?? 0;
      if (!s) continue;
      sai += s;
      const t0 = new Date(l.submitted_at!).getTime();
      // Kiểm tra xem sau lần sai đó, trong vòng 48 giờ em có mở lại bài này để làm tiếp không
      if (lt.some((x) => x.attempt_id !== l.attempt_id && x.ku_id === l.ku_id && x.submitted_at
        && new Date(x.submitted_at).getTime() > t0 && new Date(x.submitted_at).getTime() - t0 <= 48 * 3600_000)) lamLai += s;
    }
    const K = sai ? lamLai / sai : 1; // Nếu không sai câu nào thì mặc định đạt điểm tối đa 1.0

    // 9. Tính thành phần E (Sửa lỗi): Tỉ lệ khắc phục thành công trong mục Soát lỗi cũ
    const sl = soatLoi.get(id);
    const E = sl && sl.tong ? sl.khacPhuc / sl.tong : 1; // Không có lỗi cần soát thì đạt 1.0

    // 10. TÍNH ĐIỂM TỔNG HỢP FAS (Có chuẩn hóa trọng số nếu tuần đó không tính điểm P):
    const coP = P != null;
    const tongTs = coP ? 1 : 1 - TRONG_SO.P; // Nếu không có P, tổng trọng số của 5 phần còn lại là 0.75
    const raw = (coP ? TRONG_SO.P * P! : 0) + TRONG_SO.L * L + TRONG_SO.T * T + TRONG_SO.R * R + TRONG_SO.K * K + TRONG_SO.E * E;
    const fas = Math.round(100 * raw / tongTs); // Nhân 100 và làm tròn thành số nguyên từ 0 đến 100

    // 11. Ghi nhận thời điểm cuối cùng hoạt động trong tuần
    const lanCuoi = [...ev.map((e) => e.ts), ...ltTuan.map((l) => l.submitted_at!)].sort().pop() ?? null;

    // Lưu kết quả đầy đủ của học sinh vào danh sách lớp
    kq.set(id, {
      fas, 
      nhom: nhomTheoFas(fas), 
      P, L, T, R, K, E, 
      ngay: ngay.size, 
      cauTraLoi, 
      mucChuanBi: mucEm.size, 
      mucLopHoc: mucDuocGiao, 
      theoLich: baiGiao.length > 0,
      diemPhieu: diemPhieu == null ? null : Math.round(diemPhieu * 10) / 10, 
      khuya, 
      lanCuoi, 
      coHoatDong: ngay.size > 0
    });
  }

  return kq;
}

/** Đọc hết các dòng từ cơ sở dữ liệu Supabase (phân trang 1000 dòng/lần) */
export async function docHet<T>(lay: (tu: number, den: number) => PromiseLike<{ data: T[] | null; error: unknown }>, toiDa = 50000): Promise<T[]> {
  const ra: T[] = [];
  for (let tu = 0; tu < toiDa; tu += 1000) {
    const { data, error } = await lay(tu, tu + 999);
    if (error) throw new Error('Không đọc được dữ liệu hoạt động.');
    ra.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return ra;
}
