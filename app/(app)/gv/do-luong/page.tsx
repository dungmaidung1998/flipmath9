/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/do-luong
 * LẤY DỮ LIỆU TỪ: profiles, students, measurements
 * GỌI TỚI: @/lib/supabase/server, @/components/NhapDoLuong, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NhapDoLuong from '@/components/NhapDoLuong';
import { docCookieLop } from '@/components/gv/BoLoc';
import { chonLopTu, laVaiTroGV, lopCuaToi, nhanTruongLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

const TEN_DOT: Record<string, string> = {
  pre: 'Trước tác động',
  post: 'Sau tác động',
  followup: 'Đo duy trì (sau 6 tuần)'
};

/**
 * Component React `DoLuong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function DoLuong({ searchParams }: { searchParams: { lop?: string } }) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(profile?.role)) redirect('/');

  const classes = await lopCuaToi(supabase);
  const chon = chonLopTu(classes, searchParams.lop, docCookieLop(), true);
  const ids = chon.classIds;
  const { data: students } = await supabase
    .from('students').select('student_id, class_id, consent_status')
    .in('class_id', ids.length ? ids : ['__none__']).order('student_id');
  const sids = (students ?? []).map((s) => s.student_id);

  const { data: meas } = await supabase
    .from('measurements').select('student_id, wave, m1_digital, m2_active, m3_srl, y_math')
    .in('student_id', sids.length ? sids : ['__none__']);

  const dem = (w: string) => (meas ?? []).filter((m) => m.wave === w).length;
  const tong = (students ?? []).length;

  return (
    <div className="wrap">
      <h1>Số liệu ba đợt đo</h1>
      <p className="sub">
        {chon.tatCa ? `Tất cả ${classes.length} lớp` : chon.lop ? nhanTruongLop(chon.lop) : 'Chưa có lớp'} · bảng hỏi và bài kiểm tra Toán
      </p>

      <div className="banner">
        Lần <strong>đo duy trì</strong> sau khi ngừng can thiệp 6 tuần là thứ gần như mọi dự án
        cùng chủ đề bỏ qua. Không có nó thì không trả lời được câu hỏi khó nhất: hiệu quả có giữ
        được không, hay chỉ là hiệu ứng của việc học sinh biết mình đang được quan tâm.
      </div>

      <div className="card">
        <h2>Tiến độ nhập liệu</h2>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead><tr><th>Đợt đo</th><th className="n">Đã nhập</th><th className="n">Tổng số HS</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {['pre', 'post', 'followup'].map((w) => {
                const n = dem(w);
                return (
                  <tr key={w}>
                    <td>{TEN_DOT[w]}</td>
                    <td className="n">{n}</td>
                    <td className="n">{tong}</td>
                    <td>
                      <span className={'tag ' + (n === 0 ? 'warn' : n >= tong ? 'ok' : '')}>
                        {n === 0 ? 'chưa có' : n >= tong ? 'đủ' : 'còn thiếu ' + (tong - n)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="hint" style={{ marginTop: 10 }}>
          Sau khi nhập, tệp <code>analysis_input.csv</code> ở trang Xuất dữ liệu sẽ có sẵn bốn cột
          M1, M2, M3, Y thay vì để trống — chạy thẳng được <code>analyze.py</code>.
        </p>
      </div>

      <div className="banner">Điểm đo nghiên cứu pre/post/followup lấy từ công cụ đo riêng. Không tự thay bằng điểm quiz chuẩn bị hoặc vận dụng vì hai loại bài có mục đích và cấp độ khác nhau.</div><NhapDoLuong />

      <div className="card">
        <h2>Lấy sẵn danh sách mã học sinh</h2>
        <p className="hint" style={{ marginBottom: 10 }}>
          Sao đoạn dưới đây vào Excel làm cột đầu, điền bốn cột điểm rồi dán ngược lại vào ô trên.
        </p>
        <pre style={{ background: 'var(--field)', border: '1px solid var(--line)', borderRadius: 8,
                      padding: 12, overflow: 'auto', fontSize: 13, maxHeight: 220 }}>
{sids.length ? sids.map((s) => `${s}, , , , `).join('\n') : 'Lớp chưa có học sinh nào.'}</pre>
      </div>
    </div>
  );
}

