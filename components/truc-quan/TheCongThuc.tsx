/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText
 */
import { useId } from 'react';
import MathText from '@/components/MathText';
import './truc-quan.css';

type The = { ten:string; art:string; latex:string[]; ghi:string };

const HE: The = {ten:'Hệ hai phương trình',art:'hai-duong',latex:[
  'a_1x+b_1y=c_1','a_2x+b_2y=c_2',
],ghi:'Nếu hai đường thẳng cắt nhau, tọa độ giao điểm là nghiệm duy nhất.'};

const TI_SO: The = {ten:'Tỉ số lượng giác',art:'thang',latex:[
  '\\sin\\alpha=\\dfrac{\\text{đối}}{\\text{huyền}}',
  '\\cos\\alpha=\\dfrac{\\text{kề}}{\\text{huyền}}',
  '\\tan\\alpha=\\dfrac{\\text{đối}}{\\text{kề}}',
],ghi:'Góc α là góc nhọn ở chân thang. Xác định cạnh đối và cạnh kề từ góc này.'};

const CAN: The = {ten:'Căn bậc hai',art:'vuong',latex:['x=\\sqrt{S}','x^2=S,\\ x\\ge 0'],ghi:'Hình vuông diện tích S có cạnh √S với S ≥ 0.'};
const CUNG: The = {ten:'Độ dài cung',art:'bicycle',latex:['\\ell=\\dfrac{n}{360}\\cdot 2\\pi R'],ghi:'R là bán kính, n là số đo góc ở tâm tính bằng độ.'};
const QUAT: The = {ten:'Diện tích hình quạt',art:'pizza',latex:['S=\\dfrac{n}{360}\\cdot\\pi R^2'],ghi:'Chia góc ở tâm n° cho 360° để tìm phần diện tích của cả hình tròn.'};
const VIETE: The = {ten:'Định lí Viète',art:'balance_scale',latex:['x_1+x_2=-\\dfrac ba','x_1x_2=\\dfrac ca'],ghi:'Áp dụng khi ax² + bx + c = 0, a ≠ 0, có hai nghiệm thực kể cả nghiệm kép.'};
const TRU: The = {ten:'Thể tích hình trụ',art:'canned_food',latex:['V=\\pi r^2h'],ghi:'r là bán kính đáy và h là chiều cao.'};
const NON: The = {ten:'Thể tích hình nón',art:'non',latex:['V=\\dfrac13\\pi r^2h'],ghi:'h là đường cao, không phải đường sinh.'};
const CAU: The = {ten:'Thể tích hình cầu',art:'soccer_ball',latex:['V=\\dfrac43\\pi r^3'],ghi:'Dùng bán kính r và ghi thể tích bằng đơn vị khối.'};
const THE: Record<string, The> = {'C5-B15-M1':CUNG,'C5-B15-M2':QUAT,'C10-B31-M1':TRU,'C10-B31-M2':TRU,'C10-B31-M3':NON,'C10-B31-M4':NON,'C10-B32-M1':CAU,'C10-B32-M2':CAU};

/**
 * Component React `theCuaMuc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function theCuaMuc(ku: string) {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (/^C1-B[12]-/.test(ku)) return HE;
  if (ku.startsWith('C3-B7-')) return CAN;
  if (ku.startsWith('C4-B11-') || ku.startsWith('C4-B12-')) return TI_SO;
  if (ku.startsWith('C6-B20-')) return VIETE;
  return THE[ku];
}

/**
 * Component React `HinhThe`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function HinhThe({ art }: { art: string }) {
  const id = useId().replaceAll(':','');
  if (!['thang','hai-duong','vuong','non'].includes(art)) {
    return <img src={'/fluent/' + art + '_3d.png'} width={96} height={96} alt="" loading="lazy"/>;
  }
  return <svg viewBox="0 0 110 103" aria-hidden="true">
    <defs><linearGradient id={id} x2="0" y2="1"><stop stopColor="#ffd88c"/><stop offset="1" stopColor="#db8254"/></linearGradient></defs>
    <ellipse cx="56" cy="88" rx="44" ry="9" fill="#526e8850"/>
    {art === 'thang' && <>
      <path d="M82 14v72H13" stroke="#7ba2bf" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M76 18L17 86m65-60L26 90" stroke={'url(#'+id+')'} strokeWidth="6" strokeLinecap="round"/>
      <path d="M66 31l9 6M55 44l9 6M44 57l9 6M33 70l9 6" stroke="#cc8856" strokeWidth="4" strokeLinecap="round"/>
      <path d="M82 74H70V86m-36 0q0-7-6-12" stroke="#506c83" strokeWidth="2" fill="none"/>
      <text x="37" y="82" fill="#365a72" fontSize="14">α</text>
    </>}
    {art === 'hai-duong' && <>
      <rect x="10" y="9" width="91" height="83" rx="12" fill="#e9f5ff" stroke="#9bbedb" strokeWidth="3"/>
      <path d="M27 25v52h60M23 39h61M23 57h61M46 24v53m20-53v53" stroke="#a8c9e0" strokeWidth="2" fill="none"/>
      <path d="M23 65l62-34M28 27l58 42" strokeWidth="4" strokeLinecap="round" stroke="#297196"/>
      <circle cx="55.5" cy="47.2" r="6" fill={'url(#'+id+')'}/>
    </>}
    {art === 'vuong' && <>
      <rect x="22" y="21" width="66" height="66" rx="3" fill="#c17c50"/>
      <rect x="22" y="15" width="66" height="66" rx="3" fill={'url(#'+id+')'}/>
      <path d="M44 16v64m22-64v64M23 37h64M23 59h64" stroke="#fff5c6" strokeWidth="2"/>
    </>}
    {art === 'non' && <>
      <path d="M10 76L55 15l45 61q-45 25-90 0Z" stroke="#b48255" strokeWidth="2" fill={'url(#'+id+')'}/>
      <path d="M29 51q26 7 52 0m-64 19q37 10 76 0" stroke="#fff1a7" strokeWidth="2" fill="none"/>
      <ellipse cx="55" cy="77" rx="44" ry="10" fill="none" stroke="#be834e" strokeWidth="2"/>
    </>}
  </svg>;
}

/**
 * Component React `TheCongThuc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function TheCongThuc({ kuId }: { kuId: string }) {
  const the = theCuaMuc(kuId);
  if (!the) return null;
  return <aside className="the-cong-thuc" aria-label={the.ten}>
    <HinhThe art={the.art}/>
    <div>
      <h3>{the.ten}</h3>
      <ul>{the.latex.map(text => <li key={text}><MathText inline>{'$'+text+'$'}</MathText></li>)}</ul>
      <p>{the.ghi}</p>
    </div>
  </aside>;
}

