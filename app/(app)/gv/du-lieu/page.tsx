/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/du-lieu
 * LẤY DỮ LIỆU TỪ: profiles, students
 * GỌI TỚI: @/lib/supabase/server, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { docCookieLop } from '@/components/gv/BoLoc';
import { chonLopTu, laVaiTroGV, lopCuaToi, nhanTruongLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * Component React `DuLieu`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function DuLieu({ searchParams }: { searchParams: { lop?: string; dot?: string } }) {
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
  const classId = chon.dang;

  const { data: students } = await supabase
    .from('students').select('student_id, consent_status')
    .in('class_id', chon.classIds.length ? chon.classIds : ['__none__']);

  const inClass = (students ?? []).filter((s) => true);
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const dongY = inClass.filter((s) => s.consent_status === 'dong-y').length;
  const chua = inClass.length - dongY;

  const q = classId && classId !== 'tat-ca' ? `&lop=${encodeURIComponent(classId)}` : '';
  const dot = ['pre', 'post', 'followup'].includes(searchParams.dot ?? '') ? searchParams.dot! : 'post';
  const TEN_DOT: Record<string, string> = {
    pre: 'trước tác động', post: 'sau tác động', followup: 'đo duy trì'
  };

  const FILES = [
    {
      loai: 'phan-tich',
      ten: 'analysis_input.csv',
      mo: `Khung phân tích cho analysis/analyze.py — cột X_les tính từ dữ liệu hệ thống, bốn cột M1, M2, M3, Y lấy từ đợt đo "${TEN_DOT[dot]}" đã nhập ở trang Số liệu đo.`,
      chinh: true
    },
    {
      loai: 'les',
      ten: 'ho-so-les.csv',
      mo: 'Hồ sơ đầy đủ từng học sinh: năm thành phần của chỉ số LES, nhãn nhóm, mức làm chủ trung bình, điểm bài vận dụng.'
    },
    {
      loai: 'goi-y',
      ten: 'goi-y-T6.csv',
      mo: 'Từng lượt gợi ý kèm quy tắc đã kích hoạt, điểm trước và điểm sau — dữ liệu thô của phép thử T6.'
    },
    {
      loai: 'su-kien',
      ten: 'su-kien-hoc-tap.csv',
      mo: 'Sự kiện học tập thô: loại sự kiện, thời điểm, thời gian xem có tương tác. Dùng khi cần phân tích hành vi sâu hơn.'
    },
    {
      loai: 'loi-sai',
      ten: 'loi-sai-lan-dau.csv',
      mo: 'Từng câu trả lời ở lần làm bài chuẩn bị đầu tiên, kèm mã lỗi — dùng để đếm các mã lỗi phổ biến nhất trước tiết học.'
    },
    {
      loai: 'soat-loi',
      ten: 'soat-loi.csv',
      mo: 'Từng câu trả lời ở các lượt Soát lỗi cũ và ôn ngắt quãng (loại: sua, on-1 sau 3 ngày, on-2 sau 7 ngày) — số liệu chính để đo lỗi cũ còn hay hết sau khoảng chờ.'
    },
    {
      loai: 'so-loi',
      ten: 'so-loi.csv',
      mo: 'Trạng thái hiện tại của từng mã lỗi ở từng học sinh: cần sửa, chờ ôn lần 1, chờ ôn lần 2, đã nhớ; số lần sai và số lần tái diễn.'
    },
    {
      loai: 'lich-su-loi',
      ten: 'lich-su-loi.csv',
      mo: 'Lịch sử chuyển trạng thái của từng lỗi kèm thời điểm — dùng để tính thời gian từ lúc mắc lỗi tới lúc nhớ, và tỉ lệ tái diễn.'
    },
    {
      loai: 'fas',
      ten: 'weekly-fas.csv',
      mo: 'Chỉ số năng động FAS theo tuần của 8 tuần gần nhất, kèm 6 thành phần P, L, T, R, K, E. Lưu ý: thành phần P ở tệp này tính trên nhóm học sinh đã đồng thuận của lớp, nên có thể lệch nhẹ so với trang Mức độ hoạt động.'
    },
    {
      loai: 'tu-danh-gia',
      ten: 'tu-danh-gia.csv',
      mo: 'Mức tự đánh giá 1–4 sao của học sinh sau mỗi mục. Không xuất nội dung câu hỏi học sinh tự gõ.'
    }
  ];

  return (
    <div className="wrap">
      <h1>Xuất dữ liệu nghiên cứu</h1>
      <p className="sub">Năm tệp CSV, đều đã ẩn danh theo mã nghiên cứu</p>

      <div className="banner">
        Hệ thống <strong>chỉ xuất dữ liệu của học sinh đã đồng thuận tham gia</strong>. Đây là cam
        kết trong Phiếu 4 được thực thi bằng mã: dữ liệu của em chưa đồng thuận không nằm trong
        tệp tải về, kể cả khi bấm nhầm.
      </div>

      <div className="card">
        <h2>Tình trạng đồng thuận</h2>
        <div className="stat">
          <div><b>{inClass.length}</b><span>học sinh trong lớp</span></div>
          <div><b style={{ color: 'var(--ok)' }}>{dongY}</b><span>đã đồng thuận — sẽ xuất</span></div>
          <div><b style={{ color: chua ? 'var(--warn)' : undefined }}>{chua}</b><span>chưa — không xuất</span></div>
        </div>
        {chua > 0 && (
          <p className="hint" style={{ marginTop: 12 }}>
            Sau khi thu đủ phiếu đồng thuận có chữ ký của cha mẹ, cập nhật cột
            <code> consent_status </code> thành <code>dong-y</code> trong Table Editor của Supabase,
            hoặc chạy: <code>update students set consent_status = &apos;dong-y&apos; where student_id in (...);</code>
          </p>
        )}
        {classes.length > 1 && (
          <form style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'end' }}>
            <div style={{ minWidth: 160 }}>
              <label htmlFor="lop">Lọc theo lớp</label>
              <select id="lop" name="lop" defaultValue={classId}>
                <option value="tat-ca">Tất cả lớp ({classes.length})</option>
                {classes.map((c) => (
                  <option key={c.class_id} value={c.class_id}>{nhanTruongLop(c)} ({c.arm ?? '—'})</option>
                ))}
              </select>
            </div>
            <button className="primary">Áp dụng</button>
          </form>
        )}
      </div>

      <div className="card">
        <h2>Đợt đo dùng cho tệp phân tích</h2>
        {/* Khối giao diện: Biểu mẫu nhập liệu */}
        <form style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
          {classId && <input type="hidden" name="lop" value={classId} />}
          <div style={{ minWidth: 220 }}>
            <label htmlFor="dot">Bốn cột M1, M2, M3, Y lấy từ đợt</label>
            <select id="dot" name="dot" defaultValue={dot}>
              <option value="pre">Trước tác động</option>
              <option value="post">Sau tác động</option>
              <option value="followup">Đo duy trì (sau 6 tuần)</option>
            </select>
          </div>
          <button className="primary">Chọn đợt</button>
        </form>
        <p className="hint" style={{ marginTop: 10 }}>
          Muốn so sánh trước và sau thì tải hai tệp, chạy <code>analyze.py</code> cho từng tệp.
          Đợt chưa nhập số liệu thì bốn cột để trống và công cụ sẽ báo thiếu chứ không bịa số.
        </p>
      </div>

      {FILES.map((f) => (
        <div className="card" key={f.loai}>
          <h2>{f.ten}{f.chinh ? ' — tệp chính' : ''}</h2>
          <p style={{ margin: '0 0 12px' }}>{f.mo}</p>
          <a className="action-link print-link" href={`/api/xuat-du-lieu?loai=${f.loai}${q}${f.chinh ? `&dot=${dot}` : ''}`}>
            <button className={f.chinh ? 'primary' : ''}>Tải {f.ten}</button>
          </a>
        </div>
      ))}

      <div className="card">
        <h2>Bước tiếp theo sau khi tải</h2>
        <p style={{ margin: '0 0 10px' }}>
          Mở <code>analysis_input.csv</code> bằng Excel, điền bốn cột còn trống từ bảng hỏi 46 câu và
          bài kiểm tra Toán, lưu lại rồi chạy trong thư mục <code>dfle-engine</code>:
        </p>
        <pre style={{ background: 'var(--field)', border: '1px solid var(--line)', borderRadius: 8,
                      padding: 12, overflow: 'auto', fontSize: 13 }}>
python3 analysis/analyze.py duong-dan/analysis_input.csv</pre>
        <p className="hint" style={{ marginTop: 10 }}>
          Công cụ sẽ in ra bảng so sánh hai nhóm, Cohen&apos;s d, kiểm định các giả thuyết H1–H8 và
          phần so sánh hệ số cho H8. Bốn cột đó chưa điền thì công cụ từ chối chạy chứ không tự
          bịa số — đúng như thiết kế.
        </p>
      </div>
    </div>
  );
}
