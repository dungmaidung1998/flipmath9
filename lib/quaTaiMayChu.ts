/**
 * FILE NÀY LÀM GÌ: Đọc giới hạn quá tải hiệu lực của học sinh, băm SHA-256 mã phụ huynh 6 số và chống đoán mã theo IP.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: phu_huynh_thu_ma, students, gioi_han_lop, gioi_han_hoc, learning_events, quiz_attempts
 * GỌI TỚI: @/lib/quaTai, @/lib/dfle/ngay.js
 */
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  CAU_HINH_QUA_TAI_MAC_DINH,
  hopNhatGioiHan,
  type CauHinhQuaTai,
} from '@/lib/quaTai';
// @ts-ignore
import { homNayVN } from '@/lib/dfle/ngay.js';

/**
 * Hàm `biMatSalt`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function biMatSalt(): string {
  return process.env.PHU_HUYNH_SALT?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || 'flipmath9-phu-huynh-mac-dinh';
}

/**
 * Hàm `bamChuoiAnToan`: nhận (giaTri), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function bamChuoiAnToan(giaTri: string): string {
  return createHash('sha256').update(`${biMatSalt()}|${giaTri.trim()}`).digest('hex');
}

/**
 * Hàm `taoMaPhuHuynh6So`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function taoMaPhuHuynh6So(): string {
  return String(randomInt(100000, 1000000));
}

/**
 * Hàm `soKhopMaBam`: nhận (maNhap, maBamLuu), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function soKhopMaBam(maNhap: string, maBamLuu: string): boolean {
  const a = Buffer.from(bamChuoiAnToan(maNhap), 'hex');
  const b = Buffer.from(String(maBamLuu ?? ''), 'hex');
  if (!a.length || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Bộ nhớ dự phòng chặn đoán mã theo IP khi CSDL chưa chạy SQL 56
const gAny = globalThis as unknown as { __f9PhFailIp?: Map<string, number[]> };
/**
 * Hàm `boDemIpTrongRam`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function boDemIpTrongRam(): Map<string, number[]> {
  if (!gAny.__f9PhFailIp) gAny.__f9PhFailIp = new Map();
  return gAny.__f9PhFailIp;
}

const MAX_SAI_MOI_GIO = 5;
// Chặn chung toàn hệ thống: tổng số lần nhập sai của MỌI địa chỉ IP trong 1 giờ.
// Kẻ xấu đổi nhiều IP để dò mã 6 số vẫn bị chặn khi tổng số lần sai vượt mốc này.
const MAX_SAI_TOAN_HE_THONG_MOI_GIO = 100;
const MOT_GIO_MS = 3600_000;

/**
 * Hàm `kiemTraBiChanDoanMa`: nhận (admin, ip), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function kiemTraBiChanDoanMa(
  admin: SupabaseClient,
  ip: string
): Promise<{ biChan: boolean; soLanConLai: number }> {
  const ipHash = bamChuoiAnToan(`ip:${ip}`);
  const mocMs = Date.now() - MOT_GIO_MS;
  const map = boDemIpTrongRam();
  const mem = (map.get(ipHash) ?? []).filter((t) => t >= mocMs);
  map.set(ipHash, mem);

  try {
    const { count, error } = await admin
      .from('phu_huynh_thu_ma')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .eq('thanh_cong', false)
      .gte('tao_luc', new Date(mocMs).toISOString());
    // Đếm tổng số lần sai của mọi IP trong 1 giờ qua (chống dò mã bằng nhiều IP)
    const { count: tongSai } = await admin
      .from('phu_huynh_thu_ma')
      .select('*', { count: 'exact', head: true })
      .eq('thanh_cong', false)
      .gte('tao_luc', new Date(mocMs).toISOString());
    if ((tongSai ?? 0) >= MAX_SAI_TOAN_HE_THONG_MOI_GIO) return { biChan: true, soLanConLai: 0 };
    if (!error) {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const n = Math.max(mem.length, count ?? 0);
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      return { biChan: n >= MAX_SAI_MOI_GIO, soLanConLai: Math.max(0, MAX_SAI_MOI_GIO - n) };
    }
  } catch {
    /* fallback bộ nhớ RAM */
  }
  return {
    biChan: mem.length >= MAX_SAI_MOI_GIO,
    soLanConLai: Math.max(0, MAX_SAI_MOI_GIO - mem.length),
  };
}

/**
 * Hàm `ghiLuotThuMaPhuHuynh`: nhận (admin, ip, thanhCong), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function ghiLuotThuMaPhuHuynh(
  admin: SupabaseClient,
  ip: string,
  thanhCong: boolean
): Promise<void> {
  const ipHash = bamChuoiAnToan(`ip:${ip}`);
  const map = boDemIpTrongRam();
  if (!thanhCong) {
    const now = Date.now();
    const list = (map.get(ipHash) ?? []).filter((t) => t >= now - MOT_GIO_MS);
    list.push(now);
    map.set(ipHash, list);
  }
  try {
    // Truy vấn Supabase: thêm bản ghi vào bảng phu_huynh_thu_ma
    await admin.from('phu_huynh_thu_ma').insert({ ip_hash: ipHash, thanh_cong: thanhCong });
  } catch {
    /* chưa chạy SQL 56 */
  }
}

/**
 * Hàm `layCauHinhQuaTaiHieuLuc`: nhận (admin, studentId, classId), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function layCauHinhQuaTaiHieuLuc(
  admin: SupabaseClient,
  studentId: string,
  classId?: string | null
): Promise<{
  cauHinh: CauHinhQuaTai;
  phutHomNay: number;
}> {
  let lopId = classId ?? null;
  if (!lopId) {
    // Truy vấn Supabase: đọc dữ liệu từ bảng students
    const { data: st } = await admin.from('students').select('class_id').eq('student_id', studentId).maybeSingle();
    lopId = st?.class_id ?? null;
  }

  let cauHinhLop: Partial<CauHinhQuaTai> | null = null;
  let gioiHanRieng: any = null;

  try {
    const [resLop, resHs] = await Promise.all([
      lopId
        ? admin.from('gioi_han_lop').select('*').eq('class_id', lopId).maybeSingle()
        : Promise.resolve({ data: null }),
      admin.from('gioi_han_hoc').select('*').eq('student_id', studentId).maybeSingle(),
    ]);
    if (resLop.data) {
      const r = resLop.data as any;
      cauHinhLop = {
        phut_ngay: Number(r.phut_ngay ?? 90),
        gio_khuya: String(r.gio_khuya ?? '22:30'),
        gio_sang: String(r.gio_sang ?? '05:30'),
        phut_lien_tuc: Number(r.phut_lien_tuc ?? 50),
        sai_lien_tiep: Number(r.sai_lien_tiep ?? 5),
        don_dap_so_cau: Number(r.don_dap_so_cau ?? 12),
        don_dap_ti_le: Number(r.don_dap_ti_le ?? 0.5),
        bat_khuya: r.bat_khuya !== false,
        bat_lien_tuc: r.bat_lien_tuc !== false,
        bat_sai_lien_tiep: r.bat_sai_lien_tiep !== false,
        bat_don_dap: r.bat_don_dap !== false,
        bat_vuot_ngay: r.bat_vuot_ngay !== false,
      };
    }
    gioiHanRieng = resHs.data ?? null;
  } catch {
    /* chưa chạy SQL 56 */
  }

  const cauHinh = gioiHanRieng
    ? hopNhatGioiHan(cauHinhLop ?? CAU_HINH_QUA_TAI_MAC_DINH, {
        phut_ngay: gioiHanRieng.phut_ngay,
        gio_khuya: gioiHanRieng.gio_khuya,
        gio_sang: gioiHanRieng.gio_sang,
      })
    : { ...CAU_HINH_QUA_TAI_MAC_DINH, ...(cauHinhLop ?? {}) };

  // Tính tổng phút học ghi nhận hôm nay (video + quiz) từ server để đối chiếu
  let phutHomNay = 0;
  try {
    // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
    const startIso = new Date(`${homNayVN()}T00:00:00+07:00`).toISOString();
    const [{ data: evs }, { data: qz }] = await Promise.all([
      admin
        .from('learning_events')
        .select('duration_active_sec')
        .eq('student_id', studentId)
        .eq('event_type', 'video_active')
        .gte('ts', startIso),
      admin
        .from('quiz_attempts')
        .select('time_on_task_sec')
        .eq('student_id', studentId)
        .gte('submitted_at', startIso),
    ]);
    const tongGiay =
      (evs ?? []).reduce((s: number, r: any) => s + Number(r.duration_active_sec ?? 0), 0) +
      (qz ?? []).reduce((s: number, r: any) => s + Number(r.time_on_task_sec ?? 0), 0);
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    phutHomNay = Math.round(tongGiay / 60);
  } catch {
    phutHomNay = 0;
  }

  return { cauHinh, phutHomNay };
}
