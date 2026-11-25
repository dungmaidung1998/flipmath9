/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/ke-hoach
 * LẤY DỮ LIỆU TỪ: gv_ke_hoach_tiet
 * GỌI TỚI: @/lib/gv/xacThucApi
 */
import { NextResponse } from 'next/server';
import { giaoVienCuaLop } from '@/lib/gv/xacThucApi';

export const dynamic = 'force-dynamic';

const ID_HD = new Set(['mo-dau', 'giai-dap', 'luyen-tap', 'van-dung']);
const TT = new Set(['goi-y', 'chap-nhan', 'bo']);
const NHOM = new Set(['sao', 'choi', 'mam']);

/**
 * Kế hoạch tiết dạy (GV-17).
 * { lop, bai, loi, them }  → thêm/bớt một lỗi ở phần Mở đầu (nút "Đưa vào tiết dạy" ở GV-15)
 * { lop, bai, banSua }     → lưu bản GV đã chấp nhận / sửa / bỏ và phân nhóm
 */
export async function POST(req: Request) {
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 }); }
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const x = await giaoVienCuaLop(b?.lop);
  if ('loi' in x) return x.loi;
  const { db, lop } = x;
  const bai = typeof b.bai === 'string' ? b.bai.slice(0, 200) : '';
  if (!bai) return NextResponse.json({ error: 'Thiếu bài' }, { status: 400 });

  // Truy vấn Supabase: đọc dữ liệu từ bảng gv_ke_hoach_tiet
  const { data: cu, error: e1 } = await db.from('gv_ke_hoach_tiet').select('loi_dua_vao, ban_sua').eq('class_id', lop).eq('lesson_id', bai).maybeSingle();
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (e1) return NextResponse.json({ error: /does not exist|schema cache/.test(e1.message) ? 'Chưa chạy tệp 41-man-chinh-giao-vien.sql trên Supabase.' : e1.message }, { status: 400 });

  let loi: string[] = cu?.loi_dua_vao ?? [];
  let banSua: any = cu?.ban_sua ?? null;
  if (typeof b.loi === 'string') {
    loi = b.them ? [...new Set([...loi, b.loi])].slice(0, 5) : loi.filter((c) => c !== b.loi);
  }
  if (b.banSua && typeof b.banSua === 'object') {
    const hd = (Array.isArray(b.banSua.hoatDong) ? b.banSua.hoatDong : []).filter((h: any) => ID_HD.has(h?.id)).map((h: any) => ({
      id: h.id, trangThai: TT.has(h.trangThai) ? h.trangThai : 'goi-y', coDinh: !!h.coDinh,
      phut: Math.max(0, Math.min(45, Math.round(Number(h.phut) || 0))),
      noiDungSua: typeof h.noiDungSua === 'string' && h.noiDungSua.trim() ? h.noiDungSua.slice(0, 2000) : null
    }));
    const nhom: Record<string, string> = {};
    for (const [k, v] of Object.entries(b.banSua.nhom ?? {})) if (typeof k === 'string' && NHOM.has(String(v))) nhom[k] = String(v);
    banSua = { hoatDong: hd, nhom };
  }
  // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng gv_ke_hoach_tiet
  const { error } = await db.from('gv_ke_hoach_tiet').upsert({ class_id: lop, lesson_id: bai, loi_dua_vao: loi, ban_sua: banSua, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, loiDuaVao: loi });
}
