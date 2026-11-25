/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /nhat-ky
 * LẤY DỮ LIỆU TỪ: profiles, nhat_ky_nghien_cuu
 * GỌI TỚI: @/lib/supabase/server, @/components/NhatKyForm, @/components/XacNhanNhatKy, @/components/DauTrang, @/lib/minhHoa, @/lib/chuDeChuong, @/lib/gv/lopCuaToi
 */
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NhatKyForm from '@/components/NhatKyForm';
import XacNhanNhatKy from '@/components/XacNhanNhatKy';
import DauTrang from '@/components/DauTrang';
import { hinhNhanVat } from '@/lib/minhHoa';
import { chuDeChuong } from '@/lib/chuDeChuong';
import type { CSSProperties } from 'react';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

/**
 * Component React `timChuongTrongMuc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function timChuongTrongMuc(m: any): string | null {
  const txt = [m.cong_viec, m.phuong_phap, m.ket_qua].filter(Boolean).join(' ');
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const mCode = /\b(C(?:10|[1-9]))(?:\b|-)/i.exec(txt);
  if (mCode) return mCode[1].toUpperCase();
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const mSo = /Chương\s+(10|[1-9])\b/i.exec(txt);
  if (mSo) return 'C' + mSo[1];
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const mLaMa = /Chương\s+(X|IX|VIII|VII|VI|IV|V|III|II|I)\b/i.exec(txt);
  if (mLaMa) {
    const map: Record<string, string> = { I: 'C1', II: 'C2', III: 'C3', IV: 'C4', V: 'C5', VI: 'C6', VII: 'C7', VIII: 'C8', IX: 'C9', X: 'C10' };
    return map[mLaMa[1].toUpperCase()] ?? null;
  }
  return null;
}

export const dynamic = 'force-dynamic';

/**
 * SỔ NHẬT KÝ NGHIÊN CỨU
 *
 * Người ghi: hai học sinh thực hiện dự án (vai trò 'hoc-sinh-nckh') và giáo
 * viên hướng dẫn. Học sinh trong đợt thực nghiệm không mở được trang này.
 *
 * Trang cố ý KHÔNG có nút sửa và nút xoá. Đính chính thì ghi mục mới trỏ về mục
 * cũ; sổ giữ cả hai. Giờ ghi do máy chủ đóng, hiện ngay cạnh ngày làm việc —
 * khoảng cách giữa hai cột đó là thứ giám khảo nhìn để biết sổ có ghi đều không.
 */

// Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
const ngayVN = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

/**
 * Component React `NhatKy`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function NhatKy({ searchParams }: { searchParams: { 'dinh-chinh'?: string } }) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');

  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: hoSo } = await db.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const laGV = laVaiTroGV(hoSo?.role);
  const laHS = hoSo?.role === 'hoc-sinh-nckh';
  if (!laGV && !laHS) redirect('/bai-hoc');

  const { data: muc, error } = await db
    .from('nhat_ky_nghien_cuu')
    .select('*')
    .order('ngay', { ascending: false })
    .order('ghi_luc', { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="wrap">
        <h1>Sổ nhật ký nghiên cứu</h1>
        <div className="card">
          <p className="err">Chưa đọc được sổ: {error.message}</p>
          <p className="hint">Nhiều khả năng chưa chạy <code>30-nhat-ky-nghien-cuu.sql</code>.</p>
        </div>
      </div>
    );
  }

  const ds = muc ?? [];
  const daThayThe = new Set(ds.map((m: any) => m.thay_cho).filter(Boolean));
  const soChuaXacNhan = ds.filter((m: any) => !m.xac_nhan_luc).length;

  return (
    <div className="wrap">
      <DauTrang
        tieuDe="Sổ nhật ký nghiên cứu"
        phu={`${ds.length} mục · ${ds.length - soChuaXacNhan} mục đã được giáo viên xác nhận`}
        hinh={hinhNhanVat('doc-sach')}
        tranh="tien-do"
        canh="nang-sang"
      />

      <div className="banner">
        Ghi ngay sau khi làm, đừng ghi bù. Mỗi mục mang giờ ghi của máy chủ, không sửa được —
        đó chính là thứ làm cho sổ này có giá trị làm chứng cứ.
      </div>

      <NhatKyForm dinhChinhId={searchParams['dinh-chinh']} />

      {ds.length === 0 ? (
        <div className="card"><p className="hint">Sổ chưa có mục nào.</p></div>
      ) : (
        ds.map((m: any) => {
          const cd = chuDeChuong(timChuongTrongMuc(m));
          return (
          <div className="card" key={m.id} style={cd ? ({ borderLeft: `5px solid ${cd.mau}` } as CSSProperties) : undefined}>
            <h2>
              {new Date(m.ngay + 'T00:00:00').toLocaleDateString('vi-VN')} · {m.tac_gia_ten}
              {laVaiTroGV(m.tac_gia_vai) && <span className="tag" style={{ marginLeft: 8 }}>giáo viên</span>}
              {m.thay_cho && <span className="tag warn" style={{ marginLeft: 8 }}>đính chính</span>}
              {daThayThe.has(m.id) && <span className="tag warn" style={{ marginLeft: 8 }}>đã được đính chính</span>}
              {cd && <span className="chuong-chip" style={{ marginLeft: 8, ['--ch' as string]: cd.mau } as CSSProperties}>{cd.bieuTuong} {cd.chuong} · {cd.ten}</span>}
            </h2>

            <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 10px' }}>{m.cong_viec}</p>

            {m.phuong_phap && (<><div className="lbl">Cách làm</div><p style={{ whiteSpace: 'pre-wrap' }}>{m.phuong_phap}</p></>)}
            {m.ket_qua && (<><div className="lbl">Kết quả</div><p style={{ whiteSpace: 'pre-wrap' }}>{m.ket_qua}</p></>)}
            {m.vai_tro && (<><div className="lbl">Ai làm phần nào</div><p>{m.vai_tro}</p></>)}
            {m.cong_cu_ai && (<><div className="lbl">Công cụ AI</div><p>{m.cong_cu_ai}</p></>)}
            {m.ly_do_sua && (<><div className="lbl">Lý do đính chính</div><p>{m.ly_do_sua}</p></>)}

            <p className="hint" style={{ marginTop: 10 }}>
              Ghi lúc {ngayVN(m.ghi_luc)}
              {m.xac_nhan_luc
                ? ` · giáo viên đã xác nhận lúc ${ngayVN(m.xac_nhan_luc)}`
                : ' · chưa có xác nhận của giáo viên'}
            </p>

            <p className="action-row">
              <a className="action-link" href={`/nhat-ky?dinh-chinh=${m.id}`}>Đính chính mục này</a>
              {laGV && !m.xac_nhan_luc && <XacNhanNhatKy id={m.id} />}
            </p>
          </div>
          );
        })
      )}

      <p className="action-row" style={{ marginTop: 4 }}>
        <a className="action-link" href="/api/nhat-ky/xuat">Tải sổ nhật ký (Markdown, in ra PDF được)</a>
        <a className="action-link" href="/api/nhat-ky/xuat?dinh-dang=csv">Tải dạng CSV</a>
      </p>
    </div>
  );
}
