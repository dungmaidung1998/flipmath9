/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/tu-kiem-tra
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi
 */
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * TỰ KIỂM TRA HỆ THỐNG
 *
 * Gọi hàm kiem_tra_he_thong() trong cơ sở dữ liệu (tệp 27) — hàm chỉ đọc, gom
 * mọi phép kiểm tra rải rác ở các tệp 00, 20 và 24 vào một chỗ.
 *
 * Mở trang này rồi chụp màn hình: đó là bằng chứng "nguyên mẫu đã được kiểm tra
 * trong nhiều điều kiện" cho hồ sơ kỹ thuật, và là cách nhanh nhất để biết hệ
 * thống có đang hỏng chỗ nào không. Nên mở mỗi tuần một lần.
 */

const NHAN: Record<string, { ky: string; chu: string }> = {
  ok:       { ky: '✅', chu: 'Đạt' },
  canh_bao: { ky: '⚠️', chu: 'Cần xem lại' },
  loi:      { ky: '❌', chu: 'Hỏng' }
};

/**
 * Component React `TuKiemTra`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function TuKiemTra() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: hoSo } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(hoSo?.role)) redirect('/bai-hoc');

  const { data, error } = await supabaseAdmin().rpc('kiem_tra_he_thong');

  if (error) {
    return (
      <div className="wrap">
        <h1>Tự kiểm tra hệ thống</h1>
        <div className="card">
          <p className="err">Không chạy được phép kiểm tra: {error.message}</p>
          <p className="hint">Nhiều khả năng chưa chạy <code>31-tu-kiem-tra-he-thong.sql</code>.</p>
        </div>
      </div>
    );
  }

  const ds = (data ?? []) as { nhom: string; muc: string; trang_thai: string; chi_tiet: string }[];
  const dem = (t: string) => ds.filter((d) => d.trang_thai === t).length;
  const nhom = [...new Set(ds.map((d) => d.nhom))];
  const gio = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  return (
    <div className="wrap">
      <h1>Tự kiểm tra hệ thống</h1>
      <p className="sub">Chạy lúc {gio} · {ds.length} phép kiểm tra · chỉ đọc, không sửa gì</p>

      <div className="stat" style={{ marginBottom: 18 }}>
        <div><b>{dem('ok')}</b><span>đạt</span></div>
        <div><b>{dem('canh_bao')}</b><span>cần xem lại</span></div>
        <div><b>{dem('loi')}</b><span>hỏng</span></div>
      </div>

      {dem('loi') > 0 && (
        <div className="banner">
          Có mục đang hỏng. Sửa trước khi chạy tiếp đợt thực nghiệm, và ghi ngày sửa vào sổ nhật ký nghiên cứu.
        </div>
      )}

      {nhom.map((n) => (
        <div className="card" key={n}>
          <h2>{n}</h2>
          <div className="scroll">
            {/* Khối giao diện: Bảng số liệu tổng hợp */}
            <table>
              <thead><tr><th>Mục</th><th>Kết quả</th><th>Chi tiết</th></tr></thead>
              <tbody>
                {ds.filter((d) => d.nhom === n).map((d) => (
                  <tr key={d.muc}>
                    <td>{d.muc}</td>
                    <td>
                      <span className={'tag ' + (d.trang_thai === 'ok' ? 'ok' : 'warn')}>
                        {NHAN[d.trang_thai]?.ky} {NHAN[d.trang_thai]?.chu ?? d.trang_thai}
                      </span>
                    </td>
                    <td>{d.chi_tiet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="card">
        <h2>Sao lưu dữ liệu</h2>
        <p className="hint" style={{ marginBottom: 12 }}>
          Mất cơ sở dữ liệu giữa đợt là mất cả đợt thực nghiệm, không làm lại được. Tải gói sao
          lưu mỗi tuần một lần và cất vào <code>03-Du-lieu-goc</code>. Gói gồm toàn bộ bảng dữ
          liệu dạng CSV, kèm mã băm từng tệp để về sau chứng minh được tệp nộp đúng là tệp đã xuất.
        </p>
        <p className="action-row">
          <a className="btnlink" href="/api/sao-luu">Tải gói sao lưu</a>
          <a className="action-link" href="/api/xuat-du-lieu?loai=phan-tich">Chỉ tải dữ liệu phân tích</a>
        </p>
      </div>
    </div>
  );
}
