/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/capDo, @/lib/chapters, @/lib/diaDanh
 */
import { CAP_DO } from '@/lib/capDo';
import { CHAPTERS, chapterOf } from '@/lib/chapters';
import { DIA_DANH } from '@/lib/diaDanh';
import './truc-quan.css';

const CAY = ['seedling', 'potted_plant', 'deciduous_tree', 'deciduous_tree'];
const DOI = ['#b9e1f3','#e1edd0','#cae7cf','#f2e9c9'];

/**
 * Component React `Fluent`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Fluent({ ten, className = '' }: { ten: string; className?: string }) {
  return <img className={className} src={'/fluent/' + ten + '_3d.png'} width={96} height={96} alt="" loading="lazy"/>;
}

/**
 * Component React `Dat`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Dat() {
  return <svg className="vuon-dat" viewBox="0 0 105 37" aria-hidden="true">
    <ellipse cx="52.5" cy="24" rx="47" ry="12" fill="#536c5250"/>
    <path d="M9 17q5 18 43.5 18T96 17Z" fill="#a56c47"/>
    <ellipse cx="52.5" cy="17" rx="43.5" ry="13" fill="#c78f58"/>
    <path d="M29 17q13-5 26 0t25 0" fill="none" stroke="#edbd7d" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}

/**
 * Component React `Sau`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Sau({ i }: { i: number }) {
  return <svg className={'vuon-sau vuon-sau-' + i} width="22" height="15" viewBox="0 0 22 15" aria-hidden="true">
    <path d="M3 10q2-5 6-1t8-1" stroke="#2e623a" strokeWidth="6" fill="none" strokeLinecap="round"/>
    <path d="M3 9q2-5 6-1t8-1" stroke="#a7da51" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <circle cx="18" cy="6" r="3.3" fill="#d1ec80"/><circle cx="18.6" cy="5.2" r=".8" fill="#263647"/>
  </svg>;
}

const MUC = [-1,0,1,2,3] as const;
const cap = (muc?: number | null) => muc != null && Object.hasOwn(CAP_DO,muc) ? muc : -1;
type SoMuc = { id:string; muc?:number|null; loi:number };

/**
 * Component React `CayKienThuc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function CayKienThuc({ chuong, muc, loi = 0 }: { chuong?:string; muc?:number|null; loi?:number }) {
  const level = cap(muc);
  const chuDe = chuong && DIA_DANH[chuong];
  return <div className={'vuon-cay vuon-cay-' + level + (chuDe ? ' vuon-cay--chu-de' : '')}>
    {chuDe ? <img className="vuon-anh-chu-de" src={'/vuon/' + chuong + '-' + (level+1) + '.webp'}
      width={96} height={96} alt="" loading="lazy" decoding="async"/> : <>
      <Dat />
      {level >= 0 && <Fluent ten={CAY[level]} className="vuon-than"/>}
      {level === 3 && <Fluent ten="star" className="vuon-sao"/>}
    </>}
    {chuDe ? loi > 0 && <span className="vuon-loi-chu-de" aria-hidden="true">
      {Array.from({length:Math.min(3,loi)},(_,i)=><i key={i}>!</i>)}
    </span> : Array.from({length:Math.min(3,loi)},(_,i)=><Sau key={i} i={i}/>)}
  </div>;
}

/**
 * Component React `VuonKienThuc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function VuonKienThuc({ chuong, mucs }: { chuong?:string; mucs:(SoMuc & {ten:string})[] }) {
  const dia = chuong ? DIA_DANH[chuong] : undefined;
  return <section className="vuon-kien-thuc" aria-labelledby="vuon-title">
    <h2 id="vuon-title">{dia ? dia.chuDe + ' của em' : 'Khu vườn kiến thức'}</h2>
    <p>{dia ? 'Chạm vào hình để vào mục học. Dấu ! đánh dấu mã lỗi đang cần sửa.' : 'Chạm vào cây để vào mục học. Sâu đánh dấu mã lỗi đang cần sửa.'}</p>
    {mucs.length === 0 ? <p>Chương này chưa có mục kiến thức.</p> : <ul className="vuon-luoi">
      {mucs.map(m => {
        const level = cap(m.muc);
        const tenCap = CAP_DO[level]?.ten ?? 'Chưa có cấp';
        return <li key={m.id}><a href={'/hoc/' + encodeURIComponent(m.id)} style={{ background: level < 0 ? undefined : 'linear-gradient(160deg,' + DOI[level] + '60,transparent)' }}>
          <CayKienThuc chuong={chuong} muc={level} loi={m.loi}/>
          <b>{m.ten}</b>
          {dia && <small className="vuon-ten-muc">{dia.mucTen[level+1]}</small>}
          <small>{tenCap}</small>
          {m.loi > 0 && <small className="vuon-canh-bao">{m.loi} mã cần sửa</small>}
        </a></li>;
      })}
    </ul>}
  </section>;
}

/**
 * Component React `TomTatVuon`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function TomTatVuon({ id, mucs, ten }: { id:string; ten:string; mucs:SoMuc[] }) {
  const dem = MUC.map(level => mucs.filter(m => cap(m.muc) === level).length);
  const loi = mucs.reduce((sum,m) => sum + m.loi, 0);
  const dia = DIA_DANH[id];
  return <a className="vuon-tom-tat" href={'/tien-do/' + id}>
    <span className="vuon-chuong">{ten}</span>
    <strong>{dia ? dia.ten + ' · ' + dia.chuDe : ten}</strong>
    <span className="vuon-mau">
      {dem.map((so,i) => <span key={i} className={so ? undefined : 'vuon-muc-trong'}>
        <CayKienThuc chuong={id} muc={i-1}/><span>{dia?.mucTen[i] ?? CAP_DO[i-1]?.ten ?? 'Chưa có cấp'}</span>
        <b className="vuon-so" title={`${so} mục kiến thức đang ở mức này`}>{so} <small>mục</small></b>
      </span>)}
    </span>
    <span className="vuon-giai">👆 Số dưới mỗi hình = <b>số mục kiến thức</b> của chương đang ở mức đó. Làm bài đúng nhiều → mục chuyển dần sang phải.</span>
    <span className="vuon-chip-ds">
      <span className="vuon-chip vuon-chip--xanh">🏆 {dem[3]+dem[4]}/{mucs.length} mục làm chủ</span>
      {loi > 0 && <span className="vuon-chip vuon-chip--do">🪤 {loi} lỗi cần sửa</span>}
    </span>
  </a>;
}

/**
 * Component React `HanhTrinhDiaDanh`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function HanhTrinhDiaDanh({ mucs }: { mucs:SoMuc[] }) {
  const theoChuong = new Map<string,SoMuc[]>();
  for (const muc of mucs) {
    const id = chapterOf(muc.id);
    if (!id || !DIA_DANH[id]) continue;
    const ds = theoChuong.get(id);
    if (ds) ds.push(muc);
    else theoChuong.set(id,[muc]);
  }
  return <section className="vuon-kien-thuc" aria-labelledby="vuon-tom-tat-title">
    <h2 id="vuon-tom-tat-title">Hành trình qua 10 địa danh</h2>
    <p>Chạm vào một địa danh để xem tiến độ của từng mục.</p>
    <div className="vuon-tom-luoi">
      {CHAPTERS.filter(c => DIA_DANH[c.id]).map(c =>
        <TomTatVuon key={c.id} id={c.id} ten={c.label} mucs={theoChuong.get(c.id) ?? []}/>)}
    </div>
  </section>;
}
