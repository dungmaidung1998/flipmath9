/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /kien-thuc-nen
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/components/DauTrang, @/components/AnhChuDe, @/lib/minhHoa, @/lib/chuDeChuong, @/lib/kyNangNen, @/lib/gv/lopCuaToi
 */
import type { CSSProperties } from 'react';
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DauTrang from '@/components/DauTrang';
import AnhChuDe from '@/components/AnhChuDe';
import '@/components/soat-loi/soat-loi.css';
import { hinhNhanVat } from '@/lib/minhHoa';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { taiHoSoNen, DS_KY_NANG, TEN_MUC_NEN, KHONG_DU, type MucNen, type NamVung } from '@/lib/kyNangNen';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

const THU_TU: MucNen[] = ['hong', 'chua-chac', 'vung', 'chua-du'];
const MUI_TEN = { 1: ' ↑', 0: '', [-1]: ' ↓' } as Record<number, string>;

/** HS-15 KIẾN THỨC NỀN CỦA EM 🧱: mức nắm vững từng kỹ năng nền (từ trò chơi ôn nền), xu hướng, gói lấp nền. */
export default async function KienThucNen() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('student_id, role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (laVaiTroGV(p?.role)) redirect('/gv/mat-goc');
  const sid = p?.student_id ?? '';
  let hs = new Map<string, NamVung>(), loi = '';
  try { hs = (await taiHoSoNen(db, [sid])).get(sid) ?? new Map(); } catch (e: any) { loi = e.message; }

  const ds = DS_KY_NANG.map((k) => ({ ...k, nv: hs.get(k.ma) ?? KHONG_DU }))
    .sort((a, b) => THU_TU.indexOf(a.nv.muc) - THU_TU.indexOf(b.nv.muc) || a.lop - b.lop);
  const dem = (m: MucNen) => ds.filter((d) => d.nv.muc === m).length;

  return (
    <div className="wrap">
      <DauTrang tieuDe="Kiến thức nền của em" phu="Những kiến thức lớp dưới cần cho Toán 9. Mức được tính từ 10 câu gần nhất em làm ở trò chơi ôn nền." hinh={hinhNhanVat('doc-sach')} />
      {loi && <p role="alert" className="banner">{loi}</p>}
      <p className="hint">{THU_TU.map((m) => `${TEN_MUC_NEN[m].bieuTuong} ${TEN_MUC_NEN[m].ten}: ${dem(m)}`).join(' · ')}</p>
      <ul className="nen-ds">
        {ds.map((k) => {
          const t = TEN_MUC_NEN[k.nv.muc];
          const cd = chuDeChuong(k.muc[0]);
          const mucAnh = k.nv.muc === 'vung' ? 4 : k.nv.muc === 'chua-chac' ? 2 : k.nv.muc === 'hong' ? 1 : 0;
          // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
          const sao = k.nv.soCau ? Math.max(1, Math.min(5, Math.round((k.nv.tiLe ?? 0) * 5))) : 0;
          return (
            <li
              key={k.ma}
              className={'nen-the nen-the--' + k.nv.muc}
              style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}
            >
              <div className="nen-the__dau">
                <AnhChuDe
                  className="nen-the__hinh"
                  src={cd ? cd.anhMuc(mucAnh) : '/fluent/brick_3d.png'}
                  fallback={cd?.iconImg ?? '/fluent/brick_3d.png'}
                  alt=""
                  width={52}
                  height={52}
                  loading="lazy"
                />
                <div className="nen-the__meta">
                  <span className="nen-muc" style={{ color: t.mau, background: t.nen }}>{t.bieuTuong} {t.ten}{MUI_TEN[k.nv.xuHuong]}</span>
                  {cd && <span className="chuong-chip" style={{ ['--ch' as string]: cd.mau } as CSSProperties}>{cd.bieuTuong} {cd.chuong}</span>}
                </div>
              </div>
              <p className="nen-ten"><b>{k.ten}</b> <small>Toán {k.lop}</small></p>
              <div className="nen-sao" role="img" aria-label={k.nv.soCau ? `${sao} trên 5 sao` : 'Chưa có sao'}>
                {Array.from({ length: 5 }, (_, idx) => (
                  <span key={idx} className={idx < sao ? 'nen-sao__on' : 'nen-sao__off'} aria-hidden="true">
                    {idx < sao ? '★' : '☆'}
                  </span>
                ))}
                <small>{k.nv.soCau ? `${Math.round((k.nv.tiLe ?? 0) * 100)}% (${k.nv.soCau} câu)` : 'Chưa làm'}</small>
              </div>
              {(k.nv.muc === 'hong' || k.nv.muc === 'chua-chac') && <a className="action-link" href={`/lap-nen/${encodeURIComponent(k.ma)}`}>🧱 {k.nv.muc === 'hong' ? 'Làm gói lấp nền' : 'Luyện thêm'}</a>}
            </li>
          );
        })}
      </ul>
      <details className="card">
        <summary><strong>Mức được tính thế nào?</strong></summary>
        <p>Máy lấy 10 câu gần nhất em làm về kỹ năng đó trong các trò chơi ôn nền, lượt càng mới càng được tính nặng. Đúng từ 80% là 🟢 Vững, từ 50% là 🟡 Chưa chắc, dưới 50% là 🔴 Hổng. Làm chưa tới 3 câu thì ⚪ Chưa đủ dữ liệu. Mũi tên ↑ ↓ cho biết em đang tiến bộ hay đi xuống so với trước lượt gần nhất.</p>
      </details>
    </div>
  );
}
