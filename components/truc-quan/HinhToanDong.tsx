'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText
 */
import { useState } from 'react';
import MathText from '@/components/MathText';
import './truc-quan.css';

/**
 * Component React `coHinhToanDong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function coHinhToanDong(ku: string) {
  return ku.startsWith('C6-B18-') || ku.startsWith('C7-');
}

const HE_SO = [-2, -1, -.5, .5, 1, 2];

/**
 * Component React `Parabol`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Parabol() {
  const [i,setI] = useState(4);
  const a = HE_SO[i];
  const X = (x:number) => 160 + 40*x;
  const Y = (y:number) => 111 - 15*y;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const lim = Math.min(3, Math.sqrt(6 / Math.abs(a)));
  const mau = a > 0 ? '#086d72' : '#995186';
  const points = Array.from({length:41},(_,j)=> {
    const x = -lim + 2*lim*j/40;
    return X(x) + ',' + Y(a*x*x);
  }).join(' ');
  return <div className="hinh-toan-noi">
    <svg className="hinh-toan-svg" viewBox="0 0 320 222" role="img" aria-label={'Đồ thị y bằng ' + a + ' nhân x bình phương'}>
      <rect x="11" y="14" width="298" height="194" rx="14" fill="#eff9ff"/>
      <g stroke="#c8dfeb" strokeWidth="1">
        {[-3,-2,-1,0,1,2,3].map(x=><path key={x} d={'M'+X(x)+' 20v182'}/>)}
        {[-6,-4,-2,0,2,4,6].map(y=><path key={y} d={'M20 '+Y(y)+'h280'}/>)}
      </g>
      <g stroke="#486179" strokeWidth="1.5" fill="none"><path d="M17 111h283m-6-4 6 4-6 4M160 202V20l-4 6m4-6 4 6"/></g>
      <g fontSize="11" fill="#334e65">
        <text x="296" y="125">x</text><text x="169" y="29">y</text><text x="147" y="125">O</text>
        {[-3,-2,-1,1,2,3].map(x=><text key={x} x={X(x)} y="124" textAnchor="middle">{x}</text>)}
        {[-6,-4,-2,2,4,6].map(y=><text key={y} x="151" y={Y(y)-3} textAnchor="end">{y}</text>)}
      </g>
      <polyline key={a} className="hinh-toan-net" points={points} fill="none" stroke={mau} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      {[-2,-1,0,1,2].filter(x=>Math.abs(x)<=lim).map(x=><circle key={x} cx={X(x)} cy={Y(a*x*x)} r="4" fill={mau}/>)}
    </svg>
    <label className="hinh-toan-dk">Hệ số <MathText>{'$a$'}</MathText><output>{a.toLocaleString('vi-VN')}</output>
      <input type="range" min="0" max={HE_SO.length-1} step="1" value={i} onChange={e=>setI(Number(e.target.value))}/>
    </label>
    <p>Đồ thị <MathText>{'$y=ax^2$'}</MathText> có đỉnh O, đối xứng qua trục Oy và mở {a>0?'lên':'xuống'}.</p>
  </div>;
}

const MAU=['#15878a','#b36635','#7252a6'];
const NGAY=['Thứ Sáu','Thứ Bảy','Chủ nhật'];

/**
 * Component React `BieuDo`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function BieuDo() {
  const [cot,setCot] = useState(true);
  const [dem,setDem] = useState([3,4,5]);
  const tong = dem.reduce((sum,n)=>sum+n,0);
  const tran = 10;
  const toa = (f:number) => [160 + 80*Math.sin(f*2*Math.PI), 105 - 80*Math.cos(f*2*Math.PI)].join(' ');
  return <div className="hinh-toan-noi">
    <div className="hinh-toan-nut">
      <button type="button" aria-pressed={cot} onClick={()=>setCot(true)}>Biểu đồ cột</button>
      <button type="button" aria-pressed={!cot} onClick={()=>setCot(false)}>Biểu đồ tròn</button>
    </div>
    <svg className="hinh-toan-svg" viewBox="0 0 320 208" role="img" aria-label={(cot?'Tần số: ':'Tần số tương đối: ') + dem.map((n,j)=>NGAY[j]+' '+(cot?n:(100*n/tong).toLocaleString('vi-VN',{maximumFractionDigits:1})+'%')).join(', ')}>
      <rect x="10" y="9" width="300" height="190" rx="13" fill="#f1fafc"/>
      {cot ? <>
        {[0,2,4,6,8,10].map(v=><g key={v}><path d={'M43 '+(169-v*13)+'h245'} stroke="#c6e1e8"/>
          <text x="33" y={173-v*13} textAnchor="end" fill="#375168" fontSize="12">{v}</text></g>)}
        <path d="M43 30v139h247" fill="none" stroke="#486179" strokeWidth="1.5"/>
        {dem.map((n,j)=><g key={j}>
          <rect x={62+j*77} y={169-n*13} width="51" height={n*13} rx="4" fill={MAU[j]} className="hinh-toan-cot"/>
          <text x={87+j*77} y={163-n*13} textAnchor="middle" fill="#2b475e" fontSize="12">{n}</text>
          <text x={87+j*77} y="187" textAnchor="middle" fill="#2b475e" fontSize="11">{NGAY[j]}</text>
        </g>)}
      </> : dem.map((n,i)=>{
        const begin = dem.slice(0,i).reduce((s,v)=>s+v,0)/tong;
        return <path key={i} d={'M160 105L'+toa(begin)+'A80 80 0 '+(2*n>tong?1:0)+' 1 '+toa(begin+n/tong)+'Z'} stroke="#f1fafc" strokeWidth="2" fill={MAU[i]} className="hinh-toan-net"/>;
      })}
    </svg>
    <ul className="hinh-toan-chu-giai">{dem.map((n,j)=><li key={j}><i style={{background:MAU[j]}}/>{NGAY[j]}: {cot?n+' lượt':(100*n/tong).toLocaleString('vi-VN',{maximumFractionDigits:1})+'%'}</li>)}</ul>
    <div className="hinh-toan-nut">
      <button type="button" onClick={()=>setDem(([x,y,z])=>[x,y,Math.min(tran,z+1)])} disabled={dem[2]===tran}>Thêm lượt Chủ nhật</button>
      <button type="button" onClick={()=>setDem([3,4,5])}>Đặt lại</button>
    </div>
    <p>Dữ liệu minh hoạ về lượt đi biển. Tổng số lượt: <output>{tong}</output>.</p>
  </div>;
}

/**
 * Component React `HinhToanDong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function HinhToanDong({ kuId }: { kuId:string }) {
  if (!coHinhToanDong(kuId)) return null;
  return <section className="hinh-toan-dong" aria-label="Hình toán tương tác">{kuId.startsWith('C6-') ? <Parabol/> : <BieuDo/>}</section>;
}

