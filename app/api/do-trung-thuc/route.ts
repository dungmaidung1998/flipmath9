/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/do-trung-thuc
 * LẤY DỮ LIỆU TỪ: profiles, week_plan, lesson_log
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi
 */
import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { kiemTraQuyenLop, laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * GHI KẾ HOẠCH TUẦN VÀ NHẬT KÝ TIẾT DẠY
 *
 * Hai việc, một cửa:
 *   loai = 'ke-hoach'  → số tiết dự kiến của một tuần (MẪU SỐ của độ trung thực)
 *   loai = 'nhat-ky'   → một tiết đã dạy (TỬ SỐ)
 *
 * Kế hoạch phải khai TRƯỚC khi dạy. Nếu để khai sau, giáo viên chỉ cần khai
 * đúng bằng số tiết đã dạy đủ ba pha là luôn được 100% — chỉ số mất hết ý nghĩa.
 * Hệ thống không cấm được việc đó về mặt kỹ thuật, nhưng ghi lại created_at của
 * cả hai bảng để người hướng dẫn đối chiếu được thứ tự thời gian.
 */

async function giaoVien() {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { loi: NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 }) };
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) {
    return { loi: NextResponse.json({ error: 'Chỉ giáo viên mới ghi được' }, { status: 403 }) };
  }
  return { user, supabase };
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const { loi, user, supabase } = await giaoVien();
  if (loi) return loi;

  const body = await req.json().catch(() => null);
  const classId: string = body?.classId ?? '';
  const tuan = Number(body?.tuan);

  if (!classId) return NextResponse.json({ error: 'Thiếu mã lớp' }, { status: 400 });
  if (!Number.isInteger(tuan) || tuan < 1 || tuan > 40) {
    return NextResponse.json({ error: 'Tuần phải là số nguyên từ 1 đến 40' }, { status: 400 });
  }

  // chỉ cho ghi vào lớp thầy cô phụ trách
  const lop = await kiemTraQuyenLop(supabase!, classId);
  if (!lop) return NextResponse.json({ error: 'Lớp này không thuộc quyền phụ trách của thầy cô' }, { status: 403 });

  const admin = supabaseAdmin();

  if (body?.loai === 'ke-hoach') {
    const soTiet = Number(body?.soTietKeHoach);
    if (!Number.isInteger(soTiet) || soTiet < 0 || soTiet > 10) {
      return NextResponse.json({ error: 'Số tiết dự kiến phải từ 0 đến 10' }, { status: 400 });
    }
    // Truy vấn Supabase: đọc dữ liệu từ bảng week_plan
    const { error } = await admin.from('week_plan')
      .upsert({ class_id: classId, tuan, so_tiet_ke_hoach: soTiet, ghi_chu: body?.ghiChu ?? null },
              { onConflict: 'class_id,tuan' });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, thongBao: `Đã ghi kế hoạch tuần ${tuan}: ${soTiet} tiết.` });
  }

  if (body?.loai === 'nhat-ky') {
    const kuId: string = body?.kuId ?? '';
    const ngay: string = body?.ngayDay ?? '';
    if (!kuId) return NextResponse.json({ error: 'Chọn bài học đã dạy' }, { status: 400 });
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay)) {
      return NextResponse.json({ error: 'Ngày dạy không hợp lệ' }, { status: 400 });
    }
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const gio: string | null = /^\d{2}:\d{2}$/.test(body?.gioBatDau ?? '') ? body.gioBatDau : null;
    const soHs = Number(body?.soHsCoMat);

    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng lesson_log
    const { error } = await admin.from('lesson_log').upsert({
      class_id: classId, ku_id: kuId, tuan, ngay_day: ngay, gio_bat_dau: gio,
      pha_truoc_gio: !!body?.phaTruocGio,
      pha_tren_lop: !!body?.phaTrenLop,
      pha_sau_gio: !!body?.phaSauGio,
      da_chia_nhom_theo_du_lieu: !!body?.daChiaNhom,
      so_hs_co_mat: Number.isFinite(soHs) && soHs > 0 ? Math.round(soHs) : null,
      ghi_chu: body?.ghiChu ?? null
    }, { onConflict: 'class_id,ku_id,ngay_day' });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Ô "đã mở báo cáo chẩn đoán trước giờ" cố tình KHÔNG nhận từ biểu mẫu:
    // hệ thống tự suy ra từ bảng dashboard_views.
    return NextResponse.json({ ok: true, thongBao: `Đã ghi nhật ký tiết ngày ${ngay}.` });
  }

  return NextResponse.json({ error: 'Loại ghi không hợp lệ' }, { status: 400 });
}
