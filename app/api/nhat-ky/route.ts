/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/nhat-ky
 * LẤY DỮ LIỆU TỪ: profiles, nhat_ky_nghien_cuu
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi
 */
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * SỔ NHẬT KÝ NGHIÊN CỨU — ghi mục mới và xác nhận.
 *
 * Cố ý dùng client theo phiên đăng nhập, KHÔNG dùng khoá máy chủ: mọi lượt ghi
 * đều đi qua phân quyền của cơ sở dữ liệu, nên không có đường nào ghi hộ người
 * khác. Giờ ghi do máy chủ cơ sở dữ liệu đóng, không nhận từ trình duyệt.
 */

const chu = (v: unknown, toiDa = 4000) =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, toiDa) : null;

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });

  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: hoSo } = await db.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!hoSo || (!laVaiTroGV(hoSo.role) && hoSo.role !== 'hoc-sinh-nckh')) {
    return NextResponse.json({ error: 'Chỉ giáo viên hướng dẫn và học sinh thực hiện dự án mới ghi được.' }, { status: 403 });
  }

  const b = await req.json().catch(() => null);

  // ---- xác nhận một mục đã ghi (chỉ giáo viên; hàm trong CSDL tự kiểm tra lại)
  if (b?.hanhDong === 'xac-nhan') {
    if (!b?.id) return NextResponse.json({ error: 'Thiếu mã mục nhật ký.' }, { status: 400 });
    const { error } = await db.rpc('xac_nhan_nhat_ky', { p_id: b.id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  // ---- ghi mục mới
  const congViec = chu(b?.congViec);
  if (!congViec) return NextResponse.json({ error: 'Phải ghi công việc đã làm.' }, { status: 400 });

  const ngay = chu(b?.ngay, 10);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (!ngay || !/^\d{4}-\d{2}-\d{2}$/.test(ngay)) {
    return NextResponse.json({ error: 'Ngày làm việc không hợp lệ.' }, { status: 400 });
  }

  const thayCho = chu(b?.thayCho, 40);
  const lyDoSua = chu(b?.lyDoSua);
  if (thayCho && !lyDoSua) {
    return NextResponse.json({ error: 'Đính chính một mục cũ thì phải nêu lý do.' }, { status: 400 });
  }

  // Truy vấn Supabase: thêm bản ghi vào bảng nhat_ky_nghien_cuu
  const { error } = await db.from('nhat_ky_nghien_cuu').insert({
    ngay,
    tac_gia: user.id,
    tac_gia_ten: hoSo.full_name ?? user.email ?? 'không rõ',
    tac_gia_vai: hoSo.role,
    cong_viec: congViec,
    phuong_phap: chu(b?.phuongPhap),
    ket_qua: chu(b?.ketQua),
    vai_tro: chu(b?.vaiTro),
    cong_cu_ai: chu(b?.congCuAi),
    thay_cho: thayCho,
    ly_do_sua: lyDoSua
    // ghi_luc do cơ sở dữ liệu đặt — trình duyệt không gửi lên được
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
