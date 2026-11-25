/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./nen
 */
import { Bong, Emoji, Khung, Nhan, useMau, type CanhProps } from './nen';

/**
 * Component React `Ke`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Ke({ x = 106, y = 330, w = 556 }: { x?: number; y?: number; w?: number }) {
  const fill = useMau();
  return <g transform={`translate(${x} ${y})`}>
    <Bong x={w / 2} y={109} rx={w / 2 + 38} ry={29}/>
    <rect x="23" y="12" width={w-46} height="94" rx="18" fill={fill('go')} stroke="#a16a53" strokeWidth="2"/>
    <rect width={w} height="29" rx="14" fill={fill('vang')} stroke="#d3965b" strokeWidth="2"/>
    <path d={`M19 7H${w-19}`} stroke="#fff2ce" strokeWidth="3" strokeLinecap="round" opacity=".8"/>
  </g>;
}

/**
 * Component React `ViTien`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function ViTien({ x, y, s = 98 }: { x: number; y: number; s?: number }) {
  return <Emoji ten="purse" x={x} y={y} s={s}/>;
}

/**
 * Component React `VoBut`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function VoBut({ id, mo }: CanhProps) {
  const haiLan = id.includes('-B3-');
  return <Khung mo={mo} nen="trong-nha">
    <Emoji ten="potted_plant" x={43} y={235} s={127}/>
    {haiLan ? <>
      <Ke x={124} y={337} w={246}/><Ke x={398} y={337} w={246}/>
      <Emoji ten="notebook" x={155} y={203} s={130}/><Emoji ten="pen" x={232} y={225} s={118}/>
      <Emoji ten="notebook" x={425} y={218} s={114}/><Emoji ten="pen" x={505} y={207} s={132}/>
      <ViTien x={257} y={344} s={79}/><ViTien x={533} y={345} s={79}/>
    </> : <>
      <Ke/><Emoji ten="notebook" x={173} y={167} s={185}/><Emoji ten="pen" x={393} y={168} s={190}/>
      <ViTien x={530} y={296} s={111}/>
    </>}
  </Khung>;
}

/**
 * Component React `Nguoi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Nguoi({ ten, x, y, s, ao, vay = false }: { ten: string; x: number; y: number; s: number; ao: string; vay?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${s/100})`}><g className="canh-nguoi">
    {vay && <g className="canh-vay" style={{ transformOrigin: '73px 89px' }}>
      <path d="M72 88q14 0 19-21" fill="none" stroke={ao} strokeWidth="13" strokeLinecap="round"/>
      <path d="M91 67q5-5 3-13" fill="none" stroke="#f4b643" strokeWidth="9" strokeLinecap="round"/>
    </g>}
    <path d="M19 103V84q1-20 30-22 30 2 32 22v19q-31 9-62 0Z" fill={ao} stroke="#a98083" strokeWidth="1.5"/>
    <path d="M27 88q12-19 24-15m-5 23h25" stroke="#fff" opacity=".35" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <Emoji ten={ten} x={11} y={0} s={78}/>
  </g></g>;
}
/**
 * Component React `VeTron`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function VeTron({ x, y, lat = false }: { x: number; y: number; lat?: boolean }) {
  const fill = useMau();
  return <g transform={`translate(${x} ${y}) rotate(${lat ? 9 : -9})`}>
    <path d="M8 0h122q8 0 8 8v9a12 12 0 0 0 0 24v10q0 8-8 8H8q-8 0-8-8V41a12 12 0 0 0 0-24V8q0-8 8-8Z" fill={fill(lat ? 'hong' : 'vang')} stroke="#c48956" strokeWidth="2"/>
    <path d="M104 7v45" stroke="#996651" strokeDasharray="3 5" strokeWidth="2"/>
    <Emoji ten="star" x={31} y={5} s={48}/>
  </g>;
}

/**
 * Component React `VeNhom`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function VeNhom({ mo }: CanhProps) {
  return <Khung mo={mo} nen="trong-nha"><Ke x={127} w={519}/>
    <Nguoi ten="man_default" x={196} y={107} s={154} ao="#7aafd3"/><Nguoi ten="child_default" x={425} y={153} s={112} ao="#e89883" vay/>
    <VeTron x={197} y={291}/><VeTron x={423} y={274} lat/><ViTien x={319} y={326} s={114}/>
  </Khung>;
}

/**
 * Component React `HangTraiCay`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function HangTraiCay({ x, nguoc }: { x: number; nguoc?: boolean }) {
  const trai = nguoc ? ['tangerine', 'red_apple'] : ['red_apple','tangerine'];
  return <g transform={`translate(${x} 0)`}>
    <Emoji ten="basket" x={-13} y={215} s={172}/>
    <Emoji ten={trai[0]} x={-6} y={183} s={97}/><Emoji ten={trai[1]} x={74} y={202} s={81}/>
  </g>;
}

/**
 * Component React `TaoCam`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function TaoCam({ mo }: CanhProps) {
  return <Khung mo={mo} nen="trong-nha">
    <Emoji ten="potted_plant" x={39} y={239} s={129}/><Ke x={118} y={352} w={244}/><Ke x={406} y={352} w={244}/>
    <HangTraiCay x={172}/><HangTraiCay x={449} nguoc/>
    <ViTien x={270} y={343}/><ViTien x={546} y={344}/>
  </Khung>;
}

/**
 * Component React `Vuon`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function Vuon({ mo, id }: CanhProps) {
  const fillRect = id.endsWith('Q16');
  return <Khung mo={mo}><ManhVuon vuong={fillRect}/></Khung>;
}

/**
 * Component React `ManhVuon`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function ManhVuon({ vuong }: { vuong: boolean }) {
  const fill = useMau();
  return <>
    <Emoji ten="house_with_garden" x={45} y={145} s={146}/><Emoji ten="evergreen_tree" x={606} y={166} s={108}/>
    <Bong x={387} y={417} rx={263} ry={37}/>
    <rect x="156" y="228" width="456" height="180" rx="14" fill={fill('go')} stroke="#9b704e" strokeWidth="3"/>
    <rect x="156" y="218" width="456" height="175" rx="14" fill={fill('go')} stroke="#f9d089" strokeWidth="6"/>
    {[0,1].map(row => <g key={row}>
      <rect x="187" y={249 + row * 62} width="394" height="45" rx="21" fill="#9c704e" opacity=".54"/>
      {Array.from({length:8},(_,i)=><Emoji key={i} ten="seedling" x={192+i*46} y={232+row*64} s={46} lop={i % 3 ? undefined : 'canh-hoa'}/>)}
    </g>)}
    {vuong && <rect x="266" y="183" width="238" height="238" rx="4" fill="none" stroke="#407ca5" strokeWidth="4" strokeDasharray="10 6"/>}
  </>;
}

/**
 * Component React `TrongCay`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function TrongCay({ mo }: CanhProps) {
  return <Khung mo={mo}><Emoji ten="school" x={67} y={119} s={184}/><Emoji ten="deciduous_tree" x={550} y={160} s={167}/>
    <Bong x={383} y={422} rx={218} ry={33}/>
    <Emoji ten="student_default" x={204} y={217} s={182} lop="canh-nguoi"/><Emoji ten="seedling" x={390} y={265} s={149} lop="canh-hoa"/>
    <Emoji ten="bucket" x={547} y={339} s={88}/><Emoji ten="hibiscus" x={104} y={377} s={72} lop="canh-hoa"/>
  </Khung>;
}

/**
 * Component React `MuaBut`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function MuaBut({ mo }: CanhProps) {
  return <Khung mo={mo} nen="trong-nha"><Ke/><Emoji ten="notebook" x={110} y={237} s={122}/>
    <Emoji ten="pen" x={206} y={184} s={161}/><Emoji ten="pen" x={367} y={185} s={148} lat/>
    <Emoji ten="student_default" x={545} y={152} s={158} lop="canh-nguoi"/><ViTien x={534} y={308} s={120}/>
  </Khung>;
}

/**
 * Component React `VePhim`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function VePhim({ mo }: CanhProps) {
  return <Khung mo={mo} nen="dem"><Rap/></Khung>;
}

/**
 * Component React `Rap`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Rap() {
  const fill = useMau();
  return <>
    <Bong x={395} y={447} rx={281} ry={25}/>
    <rect x="118" y="125" width="531" height="291" rx="28" fill={fill('hong')} stroke="#ffc9a3" strokeWidth="3"/>
    <rect x="164" y="161" width="253" height="181" rx="19" fill={fill('dem')} stroke="#fcbd9b" strokeWidth="4"/>
    {[0,1,2,3,4,5,6].map(i=><circle key={i} className="canh-nhap" cx={179+i*66} cy="140" r="5" fill="#ffe79c"/>)}
    <Emoji ten="clapper_board" x={204} y={181} s={162}/><Emoji ten="admission_tickets" x={220} y={310} s={119}/>
    <Emoji ten="student_default" x={472} y={183} s={145} lop="canh-nguoi"/><ViTien x={506} y={336} s={114}/>
  </>;
}

/**
 * Component React `BanPhim`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function BanPhim({ mo }: CanhProps) {
  return <Khung mo={mo} nen="trong-nha"><Ke/>
    <Emoji ten="keyboard" x={155} y={174} s={247}/><Emoji ten="pen" x={422} y={202} s={118}/>
    <Emoji ten="student_default" x={565} y={163} s={130} lop="canh-nguoi"/><ViTien x={551} y={308} s={108}/>
  </Khung>;
}

/**
 * Component React `ThangMay`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function ThangMay({ mo }: CanhProps) {
  return <Khung mo={mo} nen="trong-nha"><Cabin/></Khung>;
}

/**
 * Component React `Cabin`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Cabin() {
  const fill = useMau();
  const nguoi = ['man_default','woman_default','man_default','woman_default','man_default','woman_default','man_default','woman_default'];
  return <>
    <Bong x={388} y={458} rx={281} ry={26}/>
    <rect x="98" y="53" width="572" height="399" rx="28" fill={fill('kim-loai')} stroke="#7897b3" strokeWidth="4"/>
    <rect x="137" y="85" width="494" height="334" rx="18" fill={fill('dem')} stroke="#e8f2f8" strokeWidth="6"/>
    <path d="M145 379l76-87h324l79 87v34H145Z" fill={fill('san')}/>
    <path d="M386 91v247" stroke="#bbcee6" strokeWidth="4" opacity=".6"/>
    <circle cx="651" cy="238" r="7" fill="#ffe2a0" className="canh-nhap"/>
    {nguoi.map((ten,i)=><Nguoi key={i} ten={ten} x={170+(i%4)*111} y={i < 4 ? 112 : 227} s={i < 4 ? 78 : 95} ao={['#80b7d4','#dd9689','#7bbba3','#b9a6d2'][(i + Math.floor(i/4)) % 4]}/>)}
    <Emoji ten="package" x={529} y={323} s={101}/>
  </>;
}

/**
 * Component React `Voi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Voi({ x, nhan }: { x: number; nhan?: 'A' | 'B' }) {
  const fill = useMau();
  return <g transform={`translate(${x} 0)`}>
    <path d="M-61 198v-63q0-35 32-35h53q30 0 30 33v55" fill="none" stroke="#58758e" strokeWidth="33" strokeLinecap="round"/>
    <path d="M-61 197v-62q0-35 32-35h53q30 0 30 33v55" fill="none" stroke={fill('kim-loai')} strokeWidth="27" strokeLinecap="round"/>
    <path d="M-65 157v-23q0-25 18-29H20" fill="none" stroke="#f3fbff" strokeWidth="4" opacity=".7" strokeLinecap="round"/>
    <rect x="-64" y="58" width="18" height="38" rx="8" fill={fill('kim-loai')}/>
    <rect x="-91" y="56" width="69" height="19" rx="9" fill={fill('hong')} stroke="#b25460" strokeWidth="2"/>
    <ellipse cx="54" cy="190" rx="16" ry="7" fill="#39627f"/>
    <path className="canh-chay" d="M54 196v134" stroke="#76d9ff" strokeWidth="12" strokeLinecap="round" strokeDasharray="17 11"/>
    {nhan && <Nhan x={-3} y={134} nhan={nhan}/>}
  </g>;
}

/**
 * Component React `BeVoi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function BeVoi({ hai, mo, id }: CanhProps & { hai: boolean }) {
  return <Khung mo={mo}><BeNuoc hai={hai} id={id}/></Khung>;
}

/**
 * Component React `BeNuoc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function BeNuoc({ hai, id }: { hai: boolean; id: string }) {
  const fill = useMau();
  const coAB = id.endsWith('Q02') || id.endsWith('Q03');
  return <>
    <Emoji ten="house_with_garden" x={50} y={141} s={132}/><Emoji ten="deciduous_tree" x={609} y={156} s={111}/>
    <Bong x={388} y={443} rx={243} ry={27}/>
    <path d="M170 268q214-108 428 0v131q-217 83-428 0Z" fill={fill('kim-loai')} stroke="#638da7" strokeWidth="4"/>
    <ellipse cx="384" cy="269" rx="214" ry="54" fill="#699ab6" stroke="#d4eef6" strokeWidth="7"/>
    <ellipse className="canh-muc" cx="384" cy="290" rx="198" ry="43" fill={fill('nuoc')} stroke="#aae4f7" strokeWidth="3"/>
    {hai ? <><Voi x={260} nhan={coAB?'A':undefined}/><Voi x={439} nhan={coAB?'B':undefined}/></> : <Voi x={328}/>}
    <path d="M170 275q214 103 428 0v122q-214 93-428 0Z" fill={fill('kim-loai')} stroke="#8bb1c6" strokeWidth="4" fillOpacity=".83"/>
    <path d="M184 298q195 85 400 0" fill="none" stroke="#e8faff" strokeWidth="5" opacity=".78"/>
    <Emoji ten="droplet" x={583} y={331} s={80} lop="canh-hoa"/>
  </>;
}

/**
 * Component React `HaiVoi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function HaiVoi(props: CanhProps) { return <BeVoi {...props} hai/>; }
/**
 * Component React `MotVoi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function MotVoi(props: CanhProps) { return <BeVoi {...props} hai={false}/>; }

/**
 * Component React `ThungNuoc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function ThungNuoc({ mo }: CanhProps) {
  return <Khung mo={mo} nen="trong-nha"><LapPhuong/></Khung>;
}

/**
 * Component React `LapPhuong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function LapPhuong() {
  const fill = useMau();
  return <>
    <Bong x={382} y={429} rx={220} ry={34}/>
    <path d="M219 178l178-58 154 71-176 58Z" fill={fill('kim-loai')} stroke="#759aaf" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M236 181l160-50 134 62-156 49Z" fill={fill('nuoc')}/>
    <path className="canh-song" d="M293 175l68-21m-14 51 89-27m-38 45 79-25" stroke="#c4f0ff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M219 178l156 71v179l-156-73Z" fill={fill('kim-loai')} stroke="#7398ae" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M375 249l176-58v179l-176 58Z" fill={fill('nuoc')} stroke="#75a6bf" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M229 193l138 62v157" fill="none" stroke="#e3f5fb" strokeWidth="5" opacity=".75"/>
    <Emoji ten="droplet" x={579} y={282} s={110} lop="canh-hoa"/>
  </>;
}

