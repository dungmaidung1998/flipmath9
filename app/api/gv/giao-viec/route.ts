/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/giao-viec
 * LẤY DỮ LIỆU TỪ: students, gv_giao_viec, error_dictionary, recommendations
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/xacThucApi
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';

export const dynamic = 'force-dynamic';

const LOAI = new Set(['nhac-nho', 'goi-sua-loi', 'goi-lap-nen']);

/**
 * Giao việc cho HS: nhắc nhở (GV-16 C), Gói sửa lỗi (GV-15), Gói lấp nền (GV-16 B).
 * Lời nhắn là chữ GV đã đọc và duyệt. Nhãn "học chưa chăm" KHÔNG bao giờ được ghi
 * vào đây, vì HS đọc được bảng này.
 * Gói sửa lỗi còn ghi một dòng vào recommendations để HS mở được vi bài học của lỗi đó.
 */
export async function POST(req: Request) {
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 }); }
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const x = await giaoVienCuaLop(b?.lop);
  if ('loi' in x) return x.loi;
  const { db, user, lop } = x;

  const loai = String(b.loai ?? '');
  const loiNhan = String(b.loiNhan ?? '').trim().slice(0, 300);
  const hs: string[] = Array.isArray(b.hs) ? [...new Set<string>(b.hs.filter((s: any) => typeof s === 'string'))].slice(0, 60) : [];
  if (!LOAI.has(loai) || !loiNhan || !hs.length) return NextResponse.json({ error: 'Thiếu loại việc, lời nhắn hoặc học sinh' }, { status: 400 });

  // Truy vấn Supabase: đọc dữ liệu từ bảng students
  const { data: trongLop } = await db.from('students').select('student_id').eq('class_id', lop).in('student_id', hs);
  const hopLe = new Set((trongLop ?? []).map((s: any) => s.student_id));
  if (hopLe.size !== hs.length) return NextResponse.json({ error: 'Có học sinh không thuộc lớp này' }, { status: 403 });

  const chung: string[] = Array.isArray(b.mucTieu) ? b.mucTieu.filter((s: any) => typeof s === 'string').slice(0, 20) : [];
  const rieng: Record<string, string[]> = b.mucTieuTheoHS && typeof b.mucTieuTheoHS === 'object' ? b.mucTieuTheoHS : {};
  const mucTieuCua = (sid: string) => [...new Set([...(Array.isArray(rieng[sid]) ? rieng[sid] : []), ...chung])].filter((s) => typeof s === 'string').slice(0, 20);

  const rows = hs.map((sid) => ({ class_id: lop, student_id: sid, loai, loi_nhan: loiNhan, muc_tieu: loai === 'nhac-nho' ? [] : mucTieuCua(sid), tao_boi: user.id }));
  // Truy vấn Supabase: thêm bản ghi vào bảng gv_giao_viec
  const { error } = await db.from('gv_giao_viec').insert(rows);
  if (error) {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const chuaTao = /gv_giao_viec/.test(error.message) && /does not exist|schema cache/.test(error.message);
    return NextResponse.json({ error: chuaTao ? 'Chưa chạy tệp 41-man-chinh-giao-vien.sql trên Supabase.' : error.message }, { status: 400 });
  }

  if (loai === 'goi-sua-loi') {
    const ma = [...new Set(rows.flatMap((r) => r.muc_tieu))];
    if (ma.length) {
      const admin = supabaseAdmin();
      // Truy vấn Supabase: đọc dữ liệu từ bảng error_dictionary
      const { data: dict } = await admin.from('error_dictionary').select('error_code, ku_id, misconception, remediation_id').in('error_code', ma);
      const theoMa = new Map((dict ?? []).map((d: any) => [d.error_code, d]));
      const recs = rows.flatMap((r) => r.muc_tieu.map((code) => theoMa.get(code)).filter((d: any) => d?.remediation_id).map((d: any) => ({
        student_id: r.student_id, ku_id: d.ku_id, trigger_rule: 'GV-GIAO', diagnosis: d.misconception,
        action: 'Gói sửa lỗi do giáo viên giao', recommended_content: d.remediation_id
      })));
      // Truy vấn Supabase: thêm bản ghi vào bảng recommendations
      if (recs.length) await admin.from('recommendations').insert(recs);
    }
  }
  return NextResponse.json({ soHS: rows.length });
}
