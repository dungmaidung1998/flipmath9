/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/chapters, @/lib/diaDanh, @/lib/chuDeChuong, @/components/AnhChuDe
 */
import type { CSSProperties, ReactNode } from 'react';
import { CHAPTERS } from '@/lib/chapters';
import { DIA_DANH } from '@/lib/diaDanh';
import { chuDeChuong } from '@/lib/chuDeChuong';
import AnhChuDe, { AnhNenChuong } from '@/components/AnhChuDe';
import './truc-quan.css';

export type Moc = { id: string; dat: number; tong: number; daBatDau: boolean };

/**
 * Component React `BanDoDaNang`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function BanDoDaNang({ moc, thongKe, loiNhan }: { moc: Moc[]; thongKe?: string; loiNhan?: ReactNode }) {
  const dang = moc.filter(m => m.tong && m.dat < m.tong && m.daBatDau);
  const hienTai = dang[0] ?? moc.find(m => m.tong && m.dat < m.tong);
  const cdHienTai = chuDeChuong(hienTai?.id);
  const diem = CHAPTERS.filter(c => c.id !== 'TN');
  const doc = diem.map((_, i) => 'C 66 ' + (i*100+25) + ' 7 ' + (i*100+73) + ' 34 ' + ((i+1)*100)).join(' ');
  const ngang = diem.map((_, i) => {
    const x = i % 2 ? 35 : 65;
    return 'C ' + (100-x) + ' ' + (i*100+32) + ' ' + x + ' ' + (i*100+71) + ' ' + x + ' ' + ((i+1)*100);
  }).join(' ');
  return <section className="dn-map" aria-labelledby="dn-map-title">
    <header className="dn-map-head">
      <div><h1 id="dn-map-title">Hành trình Toán 9 qua Đà Nẵng</h1><p>{thongKe ?? 'Chọn một điểm dừng để vào học.'}</p></div>
      {cdHienTai ? (
        <AnhChuDe src={cdHienTai.nvBin} fallback="/minh-hoa/nv/di-hoc.webp" width={80} height={120} loading="lazy" alt="" />
      ) : (
        <img src="/minh-hoa/nv/di-hoc.webp" width={80} height={120} loading="lazy" alt="" />
      )}
    </header>
    {loiNhan}
    <div className="dn-route-khung">
      <svg className="dn-road dn-road-doc" viewBox="0 0 72 1000" preserveAspectRatio="none" aria-hidden="true">
        <path d={'M 34 0 ' + doc}/><path d={'M 34 0 ' + doc}/>
      </svg>
      <svg className="dn-road dn-road-ngang" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
        <path d={'M 35 0 ' + ngang}/><path d={'M 35 0 ' + ngang}/>
      </svg>
      <ol className="dn-route">
      {diem.map(c => {
        const m = moc.find(x => x.id === c.id);
        // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
        const phanTram = m?.tong ? Math.round(m.dat * 100 / m.tong) : 0;
        const tt = phanTram === 100 && m?.dat === m?.tong ? 'xong' : c.id === hienTai?.id ? 'dang' : m?.daBatDau ? 'bat-dau' : 'chua';
        const nhan = tt === 'xong' ? 'Đã làm chủ' : tt === 'dang' ? 'Điểm dừng hiện tại' : tt === 'bat-dau' ? 'Đã ghé' : 'Chưa tới';
        // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
        const muc5 = Math.min(4, Math.round(phanTram / 25));
        const cd = chuDeChuong(c.id);
        return <li key={c.id} className={'dn-stop ' + tt} style={{ '--mau-chuong': DIA_DANH[c.id].mau } as CSSProperties}>
          <a href={'/bai-hoc/' + c.id} className="dn-ticket" aria-current={tt === 'dang' ? 'location' : undefined}>
            <div className="dn-ticket-picture dn-ticket-picture--chu-de">
              <img className="dn-chu-de-anh" src={`/vuon/${c.id}-${muc5}.webp`} width={256} height={256} loading="lazy" alt=""/>
              {tt === 'xong' && <span className="dn-flag" aria-hidden="true">⚑</span>}
              {tt === 'dang' && (
                cd ? (
                  <AnhChuDe className="dn-walker dn-walker--chu-de" src={cd.nvBin} fallback="/minh-hoa/nv/di-hoc.webp" width={60} height={90} loading="lazy" alt="" />
                ) : (
                  <img className="dn-walker dn-walker--chu-de" src="/minh-hoa/nv/di-hoc.webp" width={80} height={120} loading="lazy" alt=""/>
                )
              )}
            </div>
            <div className="dn-ticket-text">
              <span className="dn-caption">{c.label} · {nhan}</span>
              <strong className="dn-ten-noi-dung">{c.title.charAt(0) + c.title.slice(1).toLocaleLowerCase('vi')}</strong>
              <span className="dn-nhan-ds"><span className="dn-nhan">📍 {DIA_DANH[c.id].ten}</span><span className="dn-nhan dn-nhan--chu-de">{DIA_DANH[c.id].chuDe}: {DIA_DANH[c.id].mucTen[muc5]}</span></span>
              <div className="dn-meter"><progress aria-label="Mức làm chủ" value={phanTram} max={100}/><b className="hs-vong-tien-do" style={{ '--tien-do': phanTram + '%' } as CSSProperties}>{phanTram}%</b></div>
            </div>
          </a>
        </li>;
      })}
      </ol>
    </div>
    <a className="action-link" href="/bai-hoc/TN">Thực hành trải nghiệm →</a>
  </section>;
}

/**
 * Component React `BangRonDiaDanh`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function BangRonDiaDanh({ id, label, title, dat, tong }: { id:string; label:string; title:string; dat:number; tong:number }) {
  const dia = DIA_DANH[id];
  const cd = chuDeChuong(id);
  if (!dia) return null;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const muc5 = Math.min(4, Math.round((tong ? dat / tong : 0) * 4));
  return (
    <header
      className={'dn-banner' + (cd ? ' dn-banner--tranh' : '')}
      style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}
    >
      {cd && <AnhNenChuong src={cd.tranh} fallback={null} />}
      <img className="dn-banner__chu-de" src={`/vuon/${id}-${muc5}.webp`} width={256} height={256} alt="" loading="lazy"/>
      <div>
        <p className="dn-caption">{label} · <span className="dn-nhan">📍 {dia.ten}</span> <span className="dn-nhan dn-nhan--chu-de">{dia.chuDe}</span></p>
        <h1>{title.charAt(0) + title.slice(1).toLocaleLowerCase('vi')}</h1>
        <p className="dn-hook">{dia.hoi}</p>
        <p className="hint">{dat}/{tong} mục đã đạt mức làm chủ</p>
      </div>
    </header>
  );
}
