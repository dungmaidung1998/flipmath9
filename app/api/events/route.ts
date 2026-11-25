/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/events
 * LẤY DỮ LIỆU TỪ: profiles, learning_events
 * GỌI TỚI: @/lib/supabase/server
 */
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Các loại sự kiện được phép ghi. Client không tự đặt tên sự kiện tuỳ ý. */
const ALLOWED = new Set([
  'video_active',      // một đoạn xem CÓ tương tác
  'video_idle',        // mở trang nhưng không tương tác — ghi lại để đối chiếu, KHÔNG tính giờ học
  'video_complete',
  'video_replay',      // tua lùi khi đang xem: { tu, den } giây — GV-17 tìm đoạn bị xem lại nhiều
  'content_open',
  'quiz_start',
  'game_start',        // bắt đầu trò chơi ôn kiến thức nền: { kieu }
  'game_finish',       // xong trò chơi ôn nền: { kieu, dung, tong }
  'tu_danh_gia',       // bước 4: { muc: 1–4, cau_hoi }
  'on_thi_10',         // ôn thi vào 10: { che_do: 'dang'|'lam-thu', cau, dung, tong }
  'tieng_anh',         // Toán tiếng Anh: { viec: 'nghe'|'luyen-nghe', tu?, dung?, tong? }
  'thi_nghiem',        // Thử tay (phòng thí nghiệm): { chon, dung, thao_tac, giay, ghi }
  'do_chieu_cao',      // Đo chiều cao Đà Nẵng bằng điện thoại (Chương IV)
  'qua_tai',           // Dấu hiệu học quá tải (chỉ ghi loại dấu hiệu hành vi)
]);

/** Chặn client gửi đoạn xem dài bất thường (một nhịp tim chỉ vài chục giây). */
const MAX_CHUNK_SEC = 120;

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('student_id').eq('id', user.id).maybeSingle();
  if (!profile?.student_id) {
    return NextResponse.json({ error: 'Tài khoản không gắn với học sinh nào' }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 });
  }

  const list = Array.isArray(body?.events) ? body.events : [];
  if (!list.length) return NextResponse.json({ inserted: 0 });
  if (list.length > 50) return NextResponse.json({ error: 'Quá nhiều sự kiện' }, { status: 400 });

  const rows = list
    .filter((e: any) => ALLOWED.has(e?.type) && typeof e?.kuId === 'string')
    .map((e: any) => ({
      // student_id lấy từ phiên đăng nhập, KHÔNG lấy từ body — client không tự khai được
      student_id: profile.student_id,
      ku_id: e.kuId,
      event_type: e.type,
      duration_active_sec:
        e.type === 'video_active'
          ? Math.max(0, Math.min(MAX_CHUNK_SEC, Math.round(Number(e.durationSec) || 0)))
          : null,
      payload: e.payload && typeof e.payload === 'object' ? e.payload : null
    }));

  if (!rows.length) return NextResponse.json({ inserted: 0 });

  // Truy vấn Supabase: thêm bản ghi vào bảng learning_events
  const { error } = await supabase.from('learning_events').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ inserted: rows.length });
}
