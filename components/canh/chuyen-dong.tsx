/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./nen
 */
import { Banh, Bong, Emoji, Khung, MuiTen, Nhan, useMau, type CanhProps } from './nen';

/**
 * Component React `Pho`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Pho() {
  return <>
    <rect y="232" width="768" height="30" fill="#b9e7a0"/>
    <Emoji ten="office_building" x={0} y={92} s={158.72}/><Emoji ten="house_with_garden" x={96} y={128} s={133.12}/>
    <Emoji ten="deciduous_tree" x={222} y={140} s={115.2}/><Emoji ten="evergreen_tree" x={470} y={152} s={97.28}/>
    <Emoji ten="deciduous_tree" x={520} y={140} s={115.2}/><Emoji ten="house" x={612} y={128} s={133.12}/>
    <Emoji ten="classical_building" x={676} y={120} s={102.4}/>
  </>;
}

/**
 * Component React `Duong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Duong({ caoToc = false }: { caoToc?: boolean }) {
  const fill = useMau();
  return <>
    <rect y="258" width="768" height="14" fill="#f3d3c3"/><rect y="270" width="768" height="4" fill="#fff"/>
    <rect y="274" width="768" height="104" fill={fill('duong')}/><rect y="374" width="768" height="4" fill="#fff"/>
    {Array.from({length:14}, (_,i) => <rect key={i} x={i * 60 + 8} y="324" width="34" height="5" rx="2.5" fill={caoToc ? '#ffe48e' : '#fff'} opacity=".9"/>)}
    <rect y="378" width="768" height="26" fill="#f3d3c3"/><rect y="404" width="768" height="26" fill="#8fd67a"/>
    <rect y="430" width="768" height="82" fill={fill('nuoc')}/>
    <path className="canh-song" d="M60 462q15-8 30 0t30 0M330 482q15-8 30 0t30 0M590 458q15-8 30 0t30 0" stroke="#d6f4ff" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <Emoji ten="hibiscus" x={8} y={420} s={92.16} lop="canh-hoa"/><Emoji ten="hibiscus" x={690} y={432} s={76.8} lop="canh-hoa"/>
  </>;
}

type Xe = 'automobile' | 'sport_utility_vehicle' | 'delivery_truck';
const banhXe: Record<Xe, { x: [number,number]; y: number; r: number }> = {
  automobile: { x: [68, 188], y: 211, r: 27 },
  sport_utility_vehicle: { x: [67, 180], y: 211, r: 28 },
  delivery_truck: { x: [68, 188], y: 211, r: 27 },
};

/**
 * Component React `OTo`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function OTo({ x, y, n = .66, phai = true, dung = false, ten = 'sport_utility_vehicle' }: {
  x: number; y: number; n?: number; phai?: boolean; dung?: boolean; ten?: Xe;
}) {
  const banh = banhXe[ten];
  return <g transform={`translate(${phai ? x+256*n : x} ${y}) scale(${phai ? -n : n} ${n})`}>
    <ellipse cx="128" cy="236" rx="112" ry="10" fill="#1b2a3a" opacity=".22"/>
    <Emoji ten={ten} x={0} y={0} s={256} lop={dung ? undefined : 'canh-rung'}/>
    {banh.x.map(cx => <Banh key={cx} x={cx} y={banh.y} r={banh.r} quay={!dung} xe lat={phai}/>)}
    {!dung && <g className="canh-gio" stroke="#fff" strokeWidth="5" strokeLinecap="round">
      <path d="M262 140h38"/><path d="M268 168h50"/><path d="M262 196h34"/>
    </g>}
  </g>;
}

/**
 * Component React `HaiXe`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function HaiXe({ id, mo }: CanhProps) {
  const rieng = id.endsWith('Q13');
  return <Khung mo={rieng ? 'Hai ô tô đi trên hai hành trình riêng' : mo} nen="duong">
    <Pho/><Duong/>
    <MuiTen x={285} y={300}/><MuiTen x={483} y={rieng ? 352 : 300} nguoc={!rieng}/>
    {!rieng && <Emoji ten="star" x={352} y={262} s={64} lop="canh-sao"/>}
    <OTo x={52} y={206}/><OTo ten="automobile" x={548} y={rieng ? 224 : 206} phai={rieng}/>
    {id.endsWith('Q05') && <><Nhan x={144} y={251} nhan="A"/><Nhan x={662} y={251} nhan="B"/></>}
  </Khung>;
}

/**
 * Component React `MotXe`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function MotXe({ mo }: CanhProps) {
  return <Khung mo={mo} nen="duong"><Pho/><Duong/><OTo x={245} y={144} n={.92}/><MuiTen x={554} y={298}/>
    <Emoji ten="stopwatch" x={497} y={352} s={67}/>
  </Khung>;
}

/**
 * Component React `XeDap`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function XeDap({ mo }: CanhProps) {
  return <Khung mo={mo} nen="duong"><Pho/><Duong/>
    <Nhan x={136} y={245} nhan="A"/><Nhan x={645} y={245} nhan="B"/>
    <Bong x={384} y={375} rx={126}/>
    <g transform="translate(500 143) scale(-.90625 .90625)">
      <Emoji ten="person_biking_default" x={0} y={0} s={256} lop="canh-rung"/>
      {[56, 200].map(cx => <g key={cx} transform={`translate(${cx} 200)`}><g className="canh-quay" opacity=".75">
        {[0, 60, 120].map(a => <path key={a} transform={`rotate(${a})`} d="M-29 0H29" stroke="#b7c8eb" strokeWidth="2.6"/>)}
      </g></g>)}
    </g>
    <MuiTen x={540} y={291}/><MuiTen x={211} y={348} nguoc/>
  </Khung>;
}

/**
 * Component React `XeTai`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function XeTai({ mo }: CanhProps) {
  return <Khung mo={mo} nen="duong"><Pho/><Duong/>
    <OTo ten="delivery_truck" x={225} y={84} n={1.17} phai={false} dung/>
    <Emoji ten="package" x={519} y={328} s={107}/><Emoji ten="package" x={613} y={348} s={78}/>
  </Khung>;
}

/**
 * Component React `CaoToc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function CaoToc({ mo }: CanhProps) {
  return <Khung mo={mo} nen="duong"><Pho/><Duong caoToc/>
    <BienBao x={527} y={183}/><BienBao x={648} y={183} toiDa/>
    <OTo x={202} y={157} n={.9}/>
  </Khung>;
}

/**
 * Component React `BienBao`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function BienBao({ x, y, toiDa = false }: { x: number; y: number; toiDa?: boolean }) {
  const fill = useMau();
  return <g transform={`translate(${x} ${y})`}>
    <rect x="-5" y="0" width="10" height="87" rx="5" fill={fill('kim-loai')}/>
    <circle r="38" fill={toiDa ? '#e85c66' : '#3f8ed7'}/><circle r="32" fill={toiDa ? fill('mat') : '#56a6e5'} stroke="#fff" strokeWidth="3"/>
    <path d={toiDa ? 'M-13-4 0 9 13-4' : 'M-13 4 0-9 13 4'} fill="none" stroke={toiDa ? '#b34051' : '#fff'} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"/>
  </g>;
}

