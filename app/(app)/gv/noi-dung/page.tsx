/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/noi-dung
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, contents
 * GỌI TỚI: @/lib/supabase/server, @/components/SoanNoiDung, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SoanNoiDung, { type MucNoiDung } from '@/components/SoanNoiDung';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * SOẠN HỌC LIỆU — màn giáo viên còn thiếu lâu nhất của dự án.
 *
 * Trước đây gắn một link video phải mở bảng contents trong Supabase, nghĩa là
 * chỉ người biết SQL mới thêm được học liệu. Toàn bộ pha học trước giờ lên lớp
 * đứng chờ ở đúng chỗ đó: 13 video và 13 phiếu học tập đã có tên trong cơ sở dữ
 * liệu nhưng không có đường dẫn, nên học sinh mở bài ra không có gì để xem.
 */
export default async function SoanHocLieu() {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) redirect('/');

  const [{ data: units }, { data: contents }] = await Promise.all([
    supabase.from('knowledge_units').select('ku_id, ku_name, lesson_id, order_index, co_video').order('order_index'),
    supabase.from('contents')
      .select('content_id, ku_id, kind, title, url, duration_sec, nguon')
      .in('kind', ['video', 'hoc-lieu']).order('content_id')
  ]);

  const muc: MucNoiDung[] = (units ?? []).map((u) => {
    const cua = (contents ?? []).filter((c) => c.ku_id === u.ku_id);
    const v = cua.find((c) => c.kind === 'video');
    return {
      kuId: u.ku_id,
      kuName: u.ku_name,
      lessonId: u.lesson_id,
      // Tiết luyện tập chung và ôn tập cuối chương không có video bài học mới.
      // Đó là đặc điểm của loại tiết, không phải việc còn thiếu.
      canVideo: u.co_video !== false,
      video: v
        ? { contentId: v.content_id, title: v.title, url: v.url, durationSec: v.duration_sec, nguon: v.nguon ?? null }
        : null,
      hocLieu: cua
        .filter((c) => c.kind === 'hoc-lieu')
        .map((c) => ({ contentId: c.content_id, title: c.title, url: c.url, nguon: c.nguon ?? null }))
    };
  });

  const canVideo = muc.filter((m) => m.canVideo);
  const daGan = canVideo.filter((m) => m.video?.url).length;

  return (
    <div className="wrap">
      <h1>Học liệu từng mục</h1>
      <p className="sub">
        Gắn video và phiếu học tập cho {muc.length} đơn vị kiến thức · đã gắn video {daGan}/{canVideo.length}
      </p>

      <div className="card">
        <h2>Hai điều cần biết trước khi dán link</h2>
        <div className="rule">
          <div className="lbl">Thời lượng không phải con số trang trí</div>
          Tỉ lệ hoàn thành video được tính bằng <em>thời gian xem có tương tác chia cho thời lượng
          video</em>, và web dựa vào tỉ lệ đó để biết em nào xem video chưa kĩ. Nếu thời lượng ghi trong hệ
          thống dài hơn video thật, một em xem trọn vẹn vẫn bị tính là chưa xem hết và bị chẩn đoán
          sai. Vì vậy khi thầy cô dán link YouTube, trình phát sẽ tự khai thời lượng thật và điền vào
          ô — <b>nên dùng con số tự đọc đó</b>, đừng sửa tay trừ khi có lý do rõ ràng.

          <div className="lbl">Dùng video của người khác thì phải ghi nguồn</div>
          Ô <em>Nguồn</em> ở mỗi mục đi thẳng vào phần học liệu của báo cáo dự thi. Để trống nghĩa là
          hồ sơ hiểu rằng nhóm tự sản xuất học liệu đó. Khai nhầm chỗ này là lỗi liêm chính, nặng hơn
          mọi lỗi kỹ thuật trong dự án — nên khai ngay lúc gắn link, đừng để tới lúc viết báo cáo mới
          cố nhớ lại.
        </div>
      </div>

      {muc.length === 0 ? (
        <div className="card">
          <p className="hint">
            Chưa có đơn vị kiến thức nào. Chạy tệp <code>supabase/07-noi-dung-chuong-1.sql</code> trước.
          </p>
        </div>
      ) : (
        <SoanNoiDung muc={muc} />
      )}
    </div>
  );
}
