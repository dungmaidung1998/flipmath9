'use client';
/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/SignOut, @/lib/gv/dieuHuong
 */
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import SignOut from '@/components/SignOut';
import { NHOM_CHINH, NHOM_CAI_DAT, NHOM_NGHIEN_CUU, NHOM_QUAN_TRI, nhomCua } from '@/lib/gv/dieuHuong';

/**
 * Thanh trên cùng của giáo viên & quản trị.
 * Giữ lớp và bài đang chọn khi chuyển trang.
 */
export default function ThanhTrenGV({ laQuanTri = false, role }: { laQuanTri?: boolean; role?: string | null }) {
  const path = usePathname() || '';
  const sp = useSearchParams();
  const [mo, setMo] = useState(false);
  useEffect(() => setMo(false), [path]);
  useEffect(() => {
    if (!mo) return;
    const dong = (e: KeyboardEvent) => { if (e.key === 'Escape') setMo(false); };
    window.addEventListener('keydown', dong);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', dong); document.body.style.overflow = ''; };
  }, [mo]);
  const giu = new URLSearchParams();
  for (const k of ['lop', 'bai']) { const v = sp?.get(k); if (v) giu.set(k, v); }
  const q = giu.toString() ? `?${giu}` : '';
  const dang = nhomCua(path);
  const laTrang = (h: string) => path === h || (h !== '/gv' && path.startsWith(h + '/'));
  const trangDang = dang?.the.find((t) => laTrang(t.href));
  const nhanVaiTro = role === 'quan-tri-he-thong'
    ? 'Quản trị hệ thống'
    : role === 'quan-tri-truong'
      ? 'Quản trị trường'
      : 'Giáo viên';

  return (
    <div className={'topnav tg' + (mo ? ' tg--mo' : '')}>
      <button type="button" className="tg-nut" aria-expanded={mo} aria-controls="menu-gv" onClick={() => setMo((v) => !v)}>
        <span className="tg-ten">FlipMath9</span>
        <span className="tg-vai">{nhanVaiTro}</span>
        <span className="tg-mui" aria-hidden="true">{mo ? '✕' : '☰'}</span>
      </button>
      {dang && (
        <span className="tg-dang" aria-live="polite">
          <span aria-hidden="true">{dang.bieuTuong}</span> {dang.nhan}{trangDang && dang.the.length > 1 ? ` · ${trangDang.nhan}` : ''}
        </span>
      )}

      {mo && <div className="tg-man" onClick={() => setMo(false)} aria-hidden="true" />}
      <nav id="menu-gv" className="tg-menu" aria-label="Các trang giáo viên" hidden={!mo}>
        <ul className="tg-nhom">
          {NHOM_CHINH.map((n) => (
            <li key={n.id} className={dang?.id === n.id ? 'tg-nhom--dang' : ''}>
              <a className="tg-chinh" href={n.the[0].href + q} aria-current={dang?.id === n.id ? 'true' : undefined}>
                <span className="tg-bt" aria-hidden="true">{n.bieuTuong}</span>
                <span><b>{n.nhan}</b><small>{n.cauHoi}</small></span>
              </a>
              {n.the.length > 1 && (
                <div className="tg-con">
                  {n.the.map((t) => (
                    <a key={t.href} href={t.href + q} aria-current={laTrang(t.href) ? 'page' : undefined}>{t.nhan}</a>
                  ))}
                </div>
              )}
            </li>
          ))}
          {laQuanTri && (
            <li className={dang?.id === NHOM_QUAN_TRI.id ? 'tg-nhom--dang' : ''}>
              <a className="tg-chinh" href={NHOM_QUAN_TRI.the[0].href} aria-current={dang?.id === NHOM_QUAN_TRI.id ? 'true' : undefined}>
                <span className="tg-bt" aria-hidden="true">{NHOM_QUAN_TRI.bieuTuong}</span>
                <span><b>{NHOM_QUAN_TRI.nhan}</b><small>{NHOM_QUAN_TRI.cauHoi}</small></span>
              </a>
            </li>
          )}
        </ul>
        <div className="tg-phu">
          <details open={dang?.id === NHOM_CAI_DAT.id}>
            <summary><span aria-hidden="true">{NHOM_CAI_DAT.bieuTuong}</span> {NHOM_CAI_DAT.nhan}</summary>
            <div className="tg-con">
              {NHOM_CAI_DAT.the.map((t) => <a key={t.href} href={t.href + q} aria-current={laTrang(t.href) ? 'page' : undefined}>{t.nhan}</a>)}
            </div>
          </details>
          <details open={dang?.id === NHOM_NGHIEN_CUU.id}>
            <summary><span aria-hidden="true">{NHOM_NGHIEN_CUU.bieuTuong}</span> {NHOM_NGHIEN_CUU.nhan} <small>(cuối đợt)</small></summary>
            <div className="tg-con">
              {NHOM_NGHIEN_CUU.the.map((t) => <a key={t.href} href={t.href} aria-current={laTrang(t.href) ? 'page' : undefined}>{t.nhan}</a>)}
            </div>
          </details>
          <div className="tg-dang-xuat"><SignOut /></div>
        </div>
      </nav>
    </div>
  );
}
