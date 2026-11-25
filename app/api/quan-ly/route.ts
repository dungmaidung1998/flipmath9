/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/quan-ly
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, questions, error_dictionary
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi
 */
import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

/**
 * Hàm `teacher(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function teacher() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return false;
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  return laVaiTroGV(data?.role);
}
/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  if (!await teacher()) return NextResponse.json({ error: 'Chỉ giáo viên được truy cập.' }, { status: 403 });
  const db = supabaseAdmin();
  const url = new URL(req.url);
  // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
  const { data: units, error } = await db.from('knowledge_units').select('*').order('order_index');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (url.searchParams.get('kind') !== 'questions') return NextResponse.json({ units });
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const page = Math.max(0, Number(url.searchParams.get('page')) || 0);
  // Truy vấn Supabase: đọc dữ liệu từ bảng questions
  let query = db.from('questions').select('*,question_options(*),distractor_errors(*)', { count: 'exact' }).order('question_id').range(page * 30, page * 30 + 29);
  const ku = url.searchParams.get('ku');
  const level = url.searchParams.get('level');
  const search = url.searchParams.get('search')?.trim();
  if (ku) query = query.eq('ku_id', ku);
  if (level) query = query.eq('level', Number(level));
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (search) query = query.ilike('stem', `%${search.replace(/[%_]/g, '')}%`);
  const result = await query;
  // Truy vấn Supabase: đọc dữ liệu từ bảng error_dictionary
  const errors = await db.from('error_dictionary').select('error_code,misconception,ku_id');
  if (result.error || errors.error) return NextResponse.json({ error: result.error?.message ?? errors.error?.message }, { status: 400 });
  return NextResponse.json({ units, questions: result.data, count: result.count, errors: errors.data });
}
/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  if (!await teacher()) return NextResponse.json({ error: 'Chỉ giáo viên được chỉnh sửa.' }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body || !['unit', 'question'].includes(body.kind)) return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
  const { error } = await supabaseAdmin().rpc('manage_learning_content', { p_kind: body.kind, p_action: body.action, p_data: body.data });
  if (error) return NextResponse.json({ error: error.code === 'PGRST202' ? 'Cần chạy file SQL 16-quan-ly-noi-dung.sql trong Supabase trước khi lưu.' : error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
