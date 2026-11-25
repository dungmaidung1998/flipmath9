/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/qua-tai
 * LẤY DỮ LIỆU TỪ: gioi_han_lop, students, gioi_han_hoc, ma_phu_huynh
 * GỌI TỚI: @/lib/gv/xacThucApi, @/lib/supabase/server, @/lib/quaTaiMayChu, @/lib/quaTai
 */
import { NextResponse } from 'next/server';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';
import { supabaseAdmin } from '@/lib/supabase/server';
import { bamChuoiAnToan, taoMaPhuHuynh6So } from '@/lib/quaTaiMayChu';
import { hopNhatGioiHan } from '@/lib/quaTai';

export const dynamic = 'force-dynamic';

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const auth = await giaoVienCuaLop(b?.lop);
  if ('loi' in auth) return auth.loi;
  const admin = supabaseAdmin();

  if (b?.hanhDong === 'luu-lop') {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const phutNgay = Math.max(20, Math.min(240, Math.round(Number(b?.phut_ngay ?? 90))));
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const gioKhuya = /^\d{1,2}:\d{2}$/.test(String(b?.gio_khuya ?? '')) ? String(b.gio_khuya) : '22:30';
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const gioSang = /^\d{1,2}:\d{2}$/.test(String(b?.gio_sang ?? '')) ? String(b.gio_sang) : '05:30';
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const phutLienTuc = Math.max(20, Math.min(120, Math.round(Number(b?.phut_lien_tuc ?? 50))));
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const saiLienTiep = Math.max(3, Math.min(10, Math.round(Number(b?.sai_lien_tiep ?? 5))));
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const donDapSoCau = Math.max(6, Math.min(25, Math.round(Number(b?.don_dap_so_cau ?? 12))));
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const donDapTiLe = Math.max(0.2, Math.min(0.8, Number(b?.don_dap_ti_le ?? 0.5)));

    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng gioi_han_lop
    const { error } = await admin.from('gioi_han_lop').upsert(
      {
        class_id: auth.lop,
        phut_ngay: phutNgay,
        gio_khuya: gioKhuya,
        gio_sang: gioSang,
        phut_lien_tuc: phutLienTuc,
        sai_lien_tiep: saiLienTiep,
        don_dap_so_cau: donDapSoCau,
        don_dap_ti_le: donDapTiLe,
        bat_khuya: b?.bat_khuya !== false,
        bat_lien_tuc: b?.bat_lien_tuc !== false,
        bat_sai_lien_tiep: b?.bat_sai_lien_tiep !== false,
        bat_don_dap: b?.bat_don_dap !== false,
        bat_vuot_ngay: b?.bat_vuot_ngay !== false,
        cap_nhat_boi: auth.user.id,
        cap_nhat: new Date().toISOString(),
      },
      { onConflict: 'class_id' }
    );
    if (error) {
      return NextResponse.json(
        { error: /does not exist|schema cache/i.test(error.message) ? 'Chưa chạy SQL 56 trên Supabase.' : error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  const studentId = String(b?.studentId ?? '').trim();
  if (!studentId) return NextResponse.json({ error: 'Thiếu mã học sinh.' }, { status: 400 });

  // Kiểm tra học sinh thuộc lớp giáo viên phụ trách
  const { data: st } = await admin
    .from('students')
    .select('student_id, class_id')
    .eq('student_id', studentId)
    .eq('class_id', auth.lop)
    .maybeSingle();
  if (!st) return NextResponse.json({ error: 'Học sinh không thuộc lớp này.' }, { status: 403 });

  if (b?.hanhDong === 'luu-hs') {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const phutNgay = Math.max(20, Math.min(240, Math.round(Number(b?.phut_ngay ?? 90))));
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const gioKhuya = /^\d{1,2}:\d{2}$/.test(String(b?.gio_khuya ?? '')) ? String(b.gio_khuya) : '22:30';
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const gioSang = /^\d{1,2}:\d{2}$/.test(String(b?.gio_sang ?? '')) ? String(b.gio_sang) : '05:30';

    // Truy vấn Supabase: đọc dữ liệu từ bảng gioi_han_hoc
    const { data: cu } = await admin.from('gioi_han_hoc').select('*').eq('student_id', studentId).maybeSingle();
    const merged = cu?.dat_boi === 'phu-huynh'
      ? hopNhatGioiHan({ phut_ngay: phutNgay, gio_khuya: gioKhuya, gio_sang: gioSang }, cu)
      : { phut_ngay: phutNgay, gio_khuya: gioKhuya, gio_sang: gioSang };

    // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng gioi_han_hoc
    const { error } = await admin.from('gioi_han_hoc').upsert(
      {
        student_id: studentId,
        phut_ngay: merged.phut_ngay,
        gio_khuya: merged.gio_khuya,
        gio_sang: merged.gio_sang,
        dat_boi: 'gv',
        cap_nhat: new Date().toISOString(),
      },
      { onConflict: 'student_id' }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (b?.hanhDong === 'tao-ma') {
    const maTho = taoMaPhuHuynh6So();
    const maBam = bamChuoiAnToan(maTho);

    await admin
      .from('ma_phu_huynh')
      .update({ thu_hoi: true })
      .eq('student_id', studentId)
      .eq('thu_hoi', false)
      .then(() => {}, () => {});

    // Truy vấn Supabase: thêm bản ghi vào bảng ma_phu_huynh
    const { error } = await admin.from('ma_phu_huynh').insert({
      student_id: studentId,
      ma_bam: maBam,
      thu_hoi: false,
    });
    if (error) {
      return NextResponse.json(
        { error: /does not exist|schema cache/i.test(error.message) ? 'Chưa chạy SQL 56 trên Supabase.' : error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, maTho });
  }

  if (b?.hanhDong === 'thu-hoi-ma') {
    const { error } = await admin
      .from('ma_phu_huynh')
      .update({ thu_hoi: true })
      .eq('student_id', studentId)
      .eq('thu_hoi', false);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 });
}
