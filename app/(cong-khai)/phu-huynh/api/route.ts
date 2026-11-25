/**
 * FILE NÀY LÀM GÌ: Trang công khai (cho phép mở không cần tài khoản) kèm xử lý giới hạn dữ liệu an toàn riêng tư.
 * AI DÙNG: công khai / phụ huynh
 * ĐỊA CHỈ TRÊN WEB: /(cong-khai)/phu-huynh/api
 * LẤY DỮ LIỆU TỪ: ma_phu_huynh, students, learning_events, quiz_attempts, gioi_han_hoc
 * GỌI TỚI: @/lib/supabase/server, @/lib/quaTaiMayChu, @/lib/quaTai, @/lib/dfle/ngay.js
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  bamChuoiAnToan,
  ghiLuotThuMaPhuHuynh,
  kiemTraBiChanDoanMa,
  layCauHinhQuaTaiHieuLuc,
  soKhopMaBam,
} from '@/lib/quaTaiMayChu';
import { NHAN_DAU_HIEU_QUA_TAI, type LoaiDauHieuQuaTai } from '@/lib/quaTai';
// @ts-ignore
import { homNayVN } from '@/lib/dfle/ngay.js';

export const dynamic = 'force-dynamic';

/**
 * Hàm `layIpClient(req)`: kiểm tra điều kiện hợp lệ (trả về true/false hoặc thông báo lỗi).
 */
function layIpClient(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  return (real || 'unknown').trim();
}

/**
 * Hàm `truNgayVN(homNay, soNgay)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function truNgayVN(homNay: string, soNgay: number): string {
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const ms = Date.parse(`${homNay}T00:00:00Z`) - soNgay * 86400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Hàm `xacThucMaPhuHuynh(maRaw, req)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function xacThucMaPhuHuynh(maRaw: unknown, req: Request) {
  const ip = layIpClient(req);
  const admin = supabaseAdmin();
  const { biChan } = await kiemTraBiChanDoanMa(admin, ip);
  if (biChan) {
    return {
      loi: NextResponse.json(
        { error: 'Thử sai quá 5 lần trong 1 giờ. Vui lòng đợi 1 giờ rồi thử lại.' },
        { status: 429 }
      ),
    } as const;
  }

  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const ma = String(maRaw ?? '').replace(/\s+/g, '');
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (!/^\d{6}$/.test(ma)) {
    await ghiLuotThuMaPhuHuynh(admin, ip, false);
    return {
      loi: NextResponse.json({ error: 'Mã phụ huynh gồm đúng 6 chữ số.' }, { status: 400 }),
    } as const;
  }

  const maBam = bamChuoiAnToan(ma);
  const { data: rows, error } = await admin
    .from('ma_phu_huynh')
    .select('id, student_id, ma_bam, thu_hoi')
    .eq('thu_hoi', false)
    .eq('ma_bam', maBam) // tra thẳng theo mã băm, không giới hạn số học sinh
    .limit(1);

  if (error) {
    return {
      loi: NextResponse.json(
        { error: 'Hệ thống cổng phụ huynh chưa được kích hoạt (thiếu SQL 56).' },
        { status: 503 }
      ),
    } as const;
  }

  const hit = (rows ?? []).find((r: any) => String(r.ma_bam) === maBam && soKhopMaBam(ma, String(r.ma_bam)));
  if (!hit) {
    await ghiLuotThuMaPhuHuynh(admin, ip, false);
    const { soLanConLai } = await kiemTraBiChanDoanMa(admin, ip);
    return {
      loi: NextResponse.json(
        {
          error:
            soLanConLai > 0
              ? `Mã không đúng hoặc đã thu hồi (còn ${soLanConLai} lần thử trong giờ này).`
              : 'Thử sai quá 5 lần trong 1 giờ. Vui lòng đợi 1 giờ rồi thử lại.',
        },
        { status: soLanConLai > 0 ? 401 : 429 }
      ),
    } as const;
  }

  await ghiLuotThuMaPhuHuynh(admin, ip, true);
  return { admin, studentId: String(hit.student_id) } as const;
}

/**
 * Hàm `taiDuLieuChoPhuHuynh(admin, studentId)`: nạp/truy xuất dữ liệu từ CSDL hoặc bộ nhớ.
 */
async function taiDuLieuChoPhuHuynh(admin: ReturnType<typeof supabaseAdmin>, studentId: string) {
  const { data: st } = await admin
    .from('students')
    .select('display_name, class_id')
    .eq('student_id', studentId)
    .maybeSingle();

  const tenDayDu = String(st?.display_name ?? 'Học sinh').trim();
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const phanTen = tenDayDu.split(/\s+/);
  // Chỉ hiện tên gọi ngắn gọn + viết tắt họ để bảo vệ riêng tư trên trang công khai
  const tenGoiNgan = phanTen.length > 1 ? `${phanTen[0]} … ${phanTen[phanTen.length - 1]}` : tenDayDu;

  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const homNay = homNayVN();
  const ngay7Truoc = truNgayVN(homNay, 6);
  const tuIso = new Date(`${ngay7Truoc}T00:00:00+07:00`).toISOString();

  const [{ data: vidEvs }, { data: qzs }, { data: qtEvs }, hieuLuc] = await Promise.all([
    admin
      .from('learning_events')
      .select('ts, duration_active_sec')
      .eq('student_id', studentId)
      .eq('event_type', 'video_active')
      .gte('ts', tuIso),
    admin
      .from('quiz_attempts')
      .select('submitted_at, time_on_task_sec')
      .eq('student_id', studentId)
      .gte('submitted_at', tuIso),
    admin
      .from('learning_events')
      .select('payload')
      .eq('student_id', studentId)
      .eq('event_type', 'qua_tai')
      .gte('ts', tuIso),
    layCauHinhQuaTaiHieuLuc(admin, studentId, st?.class_id),
  ]);

  // Tổng hợp phút học từng ngày trong 7 ngày gần nhất
  const giayTheoNgay = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    giayTheoNgay.set(truNgayVN(homNay, i), 0);
  }
  const congGiay = (iso: string | null | undefined, sec: number) => {
    if (!iso || !Number.isFinite(sec)) return;
    const ms = Date.parse(iso);
    if (!Number.isFinite(ms)) return;
    // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
    const ngay = new Date(ms + 7 * 3600_000).toISOString().slice(0, 10);
    if (giayTheoNgay.has(ngay)) {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      giayTheoNgay.set(ngay, (giayTheoNgay.get(ngay) ?? 0) + Math.max(0, sec));
    }
  };

  for (const e of vidEvs ?? []) congGiay((e as any).ts, Number((e as any).duration_active_sec ?? 0));
  for (const q of qzs ?? []) congGiay((q as any).submitted_at, Number((q as any).time_on_task_sec ?? 0));

  const chiTiet7Ngay = Array.from(giayTheoNgay.entries()).map(([ngay, sec]) => ({
    ngay,
    phut: Math.round(sec / 60),
  }));
  const phut7Ngay = chiTiet7Ngay.reduce((s, r) => s + r.phut, 0);

  const demQuaTai: Record<string, number> = {};
  for (const r of qtEvs ?? []) {
    const loai = String((r as any)?.payload?.loai ?? '');
    if (loai in NHAN_DAU_HIEU_QUA_TAI) {
      demQuaTai[loai] = (demQuaTai[loai] ?? 0) + 1;
    }
  }

  return {
    tenGoiNgan,
    phut7Ngay,
    chiTiet7Ngay,
    dauHieuQuaTai: Object.entries(demQuaTai).map(([loai, soLan]) => ({
      loai,
      ten: NHAN_DAU_HIEU_QUA_TAI[loai as LoaiDauHieuQuaTai]?.ten ?? loai,
      soLan,
    })),
    gioiHanHienTai: {
      phut_ngay: hieuLuc.cauHinh.phut_ngay,
      gio_khuya: hieuLuc.cauHinh.gio_khuya,
      gio_sang: hieuLuc.cauHinh.gio_sang,
    },
  };
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const auth = await xacThucMaPhuHuynh(b?.ma, req);
  if ('loi' in auth) return auth.loi;

  if (b?.action === 'dat-gioi-han') {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const phutNgay = Math.max(20, Math.min(240, Math.round(Number(b?.phut_ngay ?? 90))));
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const gioKhuya = /^([01]?\d|2[0-3]):[0-5]\d$/.test(String(b?.gio_khuya ?? '')) ? String(b.gio_khuya) : '22:30';
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const gioSang = /^([01]?\d|2[0-3]):[0-5]\d$/.test(String(b?.gio_sang ?? '')) ? String(b.gio_sang) : '05:30';

    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng gioi_han_hoc
    const { error } = await auth.admin.from('gioi_han_hoc').upsert(
      {
        student_id: auth.studentId,
        phut_ngay: phutNgay,
        gio_khuya: gioKhuya,
        gio_sang: gioSang,
        dat_boi: 'phu-huynh',
        cap_nhat: new Date().toISOString(),
      },
      { onConflict: 'student_id' }
    );
    if (error) {
      return NextResponse.json({ error: 'Không lưu được giới hạn mới.' }, { status: 400 });
    }
  }

  const duLieu = await taiDuLieuChoPhuHuynh(auth.admin, auth.studentId);
  return NextResponse.json({ ok: true, duLieu });
}
