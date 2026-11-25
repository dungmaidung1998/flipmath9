/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/noi-dung
 * LẤY DỮ LIỆU TỪ: profiles, contents
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi
 */
import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * GẮN LINK HỌC LIỆU CHO TỪNG ĐƠN VỊ KIẾN THỨC
 *
 * Trước khi có tuyến này, muốn gắn một link video phải mở bảng contents trong
 * Supabase. Nghĩa là chỉ người biết SQL mới thêm được học liệu, và giáo viên —
 * đúng người biết bài nào cần video gì — lại là người không làm được.
 *
 * DUY NHẤT MỘT CHỖ ĐÁNG CHÚ Ý VỀ MẶT NGHIÊN CỨU: cột duration_sec.
 * Nó là mẫu số của tỉ lệ hoàn thành video, mà tỉ lệ đó là điều kiện của R01 và
 * R09. Ghi sai thời lượng thì cả lớp bị chẩn đoán sai. Vì vậy tuyến này TỪ CHỐI
 * lưu một video không có thời lượng, thay vì lặng lẽ nhận rồi để mặc con số 480
 * điền tạm từ lúc nạp dữ liệu mẫu.
 */

/** Chỉ nhận đường dẫn http/https. Chặn javascript:, data: và các lược đồ khác. */
function duongDanHopLe(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req: Request) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) {
    return NextResponse.json({ error: 'Chỉ giáo viên mới sửa được học liệu' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const contentId: string = body?.contentId;
  if (!contentId) return NextResponse.json({ error: 'Thiếu mã học liệu' }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: hienCo } = await admin
    .from('contents').select('content_id, kind').eq('content_id', contentId).maybeSingle();
  if (!hienCo) return NextResponse.json({ error: 'Không có học liệu này' }, { status: 404 });

  // Chuỗi rỗng nghĩa là GỠ link, khác hẳn với không gửi trường url lên.
  const urlTho = typeof body?.url === 'string' ? body.url.trim() : null;
  const url = urlTho === '' ? null : urlTho;
  if (url !== null && !duongDanHopLe(url)) {
    return NextResponse.json({ error: 'Đường dẫn phải bắt đầu bằng http:// hoặc https://' }, { status: 400 });
  }

  const capNhat: Record<string, any> = { url, cap_nhat_luc: new Date().toISOString() };

  if (hienCo.kind === 'video') {
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const giay = Math.round(Number(body?.durationSec));
    if (url !== null) {
      // Đây là chỗ chặn quan trọng nhất của tuyến này — xem chú thích đầu tệp.
      if (!Number.isFinite(giay) || giay <= 0) {
        return NextResponse.json(
          { error: 'Video phải có thời lượng thật. Thời lượng là mẫu số của tỉ lệ hoàn thành, ghi sai thì quy tắc R01 và R09 chẩn đoán sai cho cả lớp.' },
          { status: 400 }
        );
      }
      if (giay > 7200) {
        return NextResponse.json({ error: 'Thời lượng trên 2 giờ — nhiều khả năng nhập nhầm đơn vị' }, { status: 400 });
      }
      capNhat.duration_sec = giay;
    } else {
      capNhat.duration_sec = null;   // gỡ link thì gỡ luôn thời lượng cũ
    }
  }

  if (typeof body?.nguon === 'string') {
    const n = body.nguon.trim();
    capNhat.nguon = n === '' ? null : n.slice(0, 500);
  }

  // Truy vấn Supabase: cập nhật dữ liệu ở bảng contents
  const { error } = await admin.from('contents').update(capNhat).eq('content_id', contentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, contentId, ...capNhat });
}
