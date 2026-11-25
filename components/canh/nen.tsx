'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { createContext, useContext, useId, type ReactNode } from 'react';

export type CanhProps = { id: string; mo: string };
type Nen = 'ngoai-troi' | 'duong' | 'trong-nha' | 'dem';
const TienTo = createContext('');
export const mau = (id: string, ten: string) => 'url(#' + id + '-' + ten + ')';
export const useMau = () => {
  const id = useContext(TienTo);
  return (ten: string) => mau(id, ten);
};

/**
 * Component React `Emoji`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function Emoji({ ten, x, y, s, lop, lat = false }: {
  ten: string; x: number; y: number; s: number; lop?: string; lat?: boolean;
}) {
  return <g transform={`translate(${lat ? x + s : x} ${y}) scale(${lat ? -1 : 1} 1)`}>
    <image className={lop} href={'/fluent/' + (ten.endsWith('_default') ? ten.replace('_default', '_3d_default') : ten + '_3d') + '.png'}
      width={s} height={s}/>
  </g>;
}

/**
 * Component React `Bong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function Bong({ x, y, rx, ry = 14, doDam = .26 }: { x: number; y: number; rx: number; ry?: number; doDam?: number }) {
  const fill = useMau();
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={fill('bong')} opacity={doDam}/>;
}

/**
 * Component React `Khung`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function Khung({ mo, children, nen = 'ngoai-troi' }: { mo: string; children: ReactNode; nen?: Nen }) {
  const id = 'canh' + useId().replaceAll(':', '');
  const fill = (ten: string) => mau(id, ten);
  return <svg className="canh-svg canh3d" viewBox="0 0 768 512" role="img" aria-label={mo} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={id + '-troi'} x2="0" y2="1"><stop stopColor="#7cc8ff"/><stop offset=".75" stopColor="#d9f0ff"/></linearGradient>
      <linearGradient id={id + '-doi'} x2="0" y2="1"><stop stopColor="#9fe0a8"/><stop offset="1" stopColor="#6cc58a"/></linearGradient>
      <linearGradient id={id + '-co'} x2="0" y2="1"><stop stopColor="#c7ec9d"/><stop offset="1" stopColor="#79c784"/></linearGradient>
      <linearGradient id={id + '-duong'} x2="0" y2="1"><stop stopColor="#7d8898"/><stop offset="1" stopColor="#5d6878"/></linearGradient>
      <linearGradient id={id + '-nuoc'} x2="0" y2="1"><stop stopColor="#6cc9f2"/><stop offset="1" stopColor="#2f9fd8"/></linearGradient>
      <linearGradient id={id + '-tuong'} x1="0" x2=".85" y2="1"><stop stopColor="#f7e5c6"/><stop offset=".5" stopColor="#fff5eb"/><stop offset="1" stopColor="#d7d5ef"/></linearGradient>
      <linearGradient id={id + '-san'} x2="0" y2="1"><stop stopColor="#d0a995"/><stop offset="1" stopColor="#f6d7a1"/></linearGradient>
      <linearGradient id={id + '-dem'} x2=".15" y2="1"><stop stopColor="#172751"/><stop offset="1" stopColor="#5b669b"/></linearGradient>
      <linearGradient id={id + '-go'} x2="0" y2="1"><stop stopColor="#fbc783"/><stop offset=".48" stopColor="#d99b63"/><stop offset="1" stopColor="#a46951"/></linearGradient>
      <linearGradient id={id + '-kim-loai'} x1="0" x2="1" y2=".3"><stop stopColor="#7194b7"/><stop offset=".32" stopColor="#e5f6fc"/><stop offset=".54" stopColor="#a0ccdd"/><stop offset="1" stopColor="#5883a5"/></linearGradient>
      <linearGradient id={id + '-vang'} x2=".25" y2="1"><stop stopColor="#fff1a7"/><stop offset=".48" stopColor="#ffc553"/><stop offset="1" stopColor="#e89335"/></linearGradient>
      <linearGradient id={id + '-hong'} x2=".25" y2="1"><stop stopColor="#ffc99c"/><stop offset=".46" stopColor="#f68e72"/><stop offset="1" stopColor="#cf5470"/></linearGradient>
      <radialGradient id={id + '-bong'}><stop stopColor="#183053"/><stop offset="1" stopColor="#183053" stopOpacity="0"/></radialGradient>
      <radialGradient id={id + '-mat'} cx=".32" cy=".24" r=".8"><stop stopColor="#fffdf4"/><stop offset=".73" stopColor="#fff0ce"/><stop offset="1" stopColor="#d6b189"/></radialGradient>
      <radialGradient id={id + '-lop'} cx=".35" cy=".26" r=".74"><stop stopColor="#777095"/><stop offset=".62" stopColor="#392c54"/><stop offset="1" stopColor="#1d1631"/></radialGradient>
      <radialGradient id={id + '-den'} cx="0" cy=".5" r="1"><stop stopColor="#fff8b6"/><stop offset="1" stopColor="#ffca6f" stopOpacity=".35"/></radialGradient>
    </defs>
    <TienTo.Provider value={id}>
      <rect width="768" height="512" fill={fill(nen === 'dem' ? 'dem' : nen === 'trong-nha' ? 'tuong' : 'troi')}/>
      {nen === 'trong-nha' ? <>
        <rect x="48" y="43" width="181" height="191" rx="24" fill="#fff" opacity=".21"/>
        <path d="M0 361H768V512H0Z" fill={fill('san')}/><path d="M0 361H768" stroke="#fff1da" strokeWidth="10"/>
      </> : nen === 'dem' ? <>
        <Emoji ten="crescent_moon" x={599} y={39} s={106}/><Emoji ten="star" x={123} y={82} s={33} lop="canh-nhap"/>
        <path d="M0 380Q220 325 386 391Q580 345 768 372V512H0Z" fill="#455b79"/>
      </> : <>
        <Emoji ten="sun" x={620} y={18} s={107.52} lop="canh-troi"/>
        <g className="canh-may"><Emoji ten="cloud" x={150} y={30} s={107.52}/><Emoji ten="cloud" x={430} y={8} s={81.92}/></g>
        <path d="M0 236 Q120 150 250 205 Q360 140 470 200 Q590 135 768 210 V245 H0Z" fill={fill('doi')} opacity=".8"/>
        {nen === 'ngoai-troi' && <path d="M0 240Q168 208 373 246T768 236V512H0Z" fill={fill('co')}/>}
      </>}
      {children}
    </TienTo.Provider>
  </svg>;
}

/**
 * Component React `Banh`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function Banh({ x, y, r, quay = true, n = 5, xe = false, lat = false, goc }: {
  x: number; y: number; r: number; quay?: boolean; n?: number; xe?: boolean; lat?: boolean; goc?: number;
}) {
  const fill = useMau();
  const vanh = xe ? .57 : .77;
  return <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={xe ? '#2b1d3f' : fill('lop')}/>
    <g transform={goc === undefined ? undefined : "rotate(-90)"}><g className={quay ? 'canh-quay' : goc !== undefined ? 'canh-quay-tay' : undefined} style={{ animationDirection: lat ? 'reverse' : 'normal', transform: goc === undefined ? undefined : `rotate(${goc}deg)` }}>
      <circle r={xe ? r : .91 * r} fill="none" stroke={xe ? '#4a3866' : '#9185ad'} strokeWidth={r * .185} strokeDasharray={`${r * .22} ${r * .185}`}/>
      <circle r={r * vanh} fill={xe ? '#dccbf2' : fill('kim-loai')}/>
      {Array.from({ length: n }, (_, i) => <path key={i} transform={`rotate(${i * 360 / n})`} d={`M0 0H${r * (vanh - .055)}`}
        stroke={xe ? '#8d78b3' : goc !== undefined && (i === 0 || (n === 8 && i === 3)) ? '#e76f51' : '#637c9a'} strokeWidth={r * (xe ? .13 : .042)} strokeLinecap="round"/>)}
      <circle r={r * .15} fill={xe ? '#6e5a93' : fill('vang')}/>
    </g></g>
  </g>;
}

/**
 * Component React `MuiTen`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function MuiTen({ x, y, nguoc = false }: { x: number; y: number; nguoc?: boolean }) {
  return <g className="canh-nhap" transform={`translate(${x} ${y}) scale(${nguoc ? -1 : 1} 1)`}>
    <path d="M-49 0h82" stroke="#ff5a4f" strokeWidth="6" strokeLinecap="round"/><path d="M31-11 49 0 31 11Z" fill="#ff5a4f"/>
  </g>;
}

export const rad = (n: number) => n * Math.PI / 180;
export const diemCuc = (x: number, y: number, r: number, a: number) => [x + r * Math.cos(rad(a)), y + r * Math.sin(rad(a))] as const;

/**
 * Component React `Goc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function Goc({ x, y, dau, rong, r = 64, chatLieu = 'vang', lop }: {
  x: number; y: number; dau: number; rong: number; r?: number; chatLieu?: string; lop?: string;
}) {
  const fill = useMau();
  return <path className={lop} d={`M${x} ${y} L${diemCuc(x,y,r,dau).join(' ')} A${r} ${r} 0 ${rong > 180 ? 1 : 0} 1 ${diemCuc(x,y,r,dau + rong).join(' ')} Z`}
    fill={fill(chatLieu)} stroke="#be8140" strokeWidth="1.5" strokeLinejoin="round"/>;
}

/**
 * Component React `Nhan`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function Nhan({ x, y, nhan }: { x: number; y: number; nhan: 'A' | 'B' | 'O' }) {
  return <text x={x} y={y} textAnchor="middle" fill="#264469" stroke="#f4faff" strokeWidth="4" paintOrder="stroke" fontSize="23" fontWeight="800">{nhan}</text>;
}

