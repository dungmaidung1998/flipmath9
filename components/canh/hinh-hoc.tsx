/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./nen, ./chuyen-dong
 */
import { Banh, Bong, Emoji, Goc, Khung, Nhan, diemCuc, rad, useMau, type CanhProps } from './nen';
import { OTo } from './chuyen-dong';

const NET = '#3c658d';

/**
 * Component React `Dieu`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function Dieu({ id, mo }: CanhProps) {
  const alpha = id.endsWith('Q16') ? 50 : 40;
  const x = 239, y = 355;
  const [dx, dy] = diemCuc(x, y, 323, -alpha);
  return <Khung mo={mo}>
    <Emoji ten="school" x={43} y={159} s={151}/><Emoji ten="deciduous_tree" x={601} y={218} s={129}/>
    <Bong x={191} y={433} rx={77}/><Emoji ten="person_standing_default" x={137} y={294} s={157} lop="canh-nguoi"/>
    <Goc x={x} y={y} dau={-alpha} rong={alpha} r={60}/>
    <path d={`M${x} ${y}H${dx}V${dy}M${x} ${y}v78`} fill="none" stroke={NET} strokeDasharray="9 7" strokeWidth="3"/>
    <path d={`M${x} ${y}L${dx} ${dy}`} stroke={NET} strokeWidth="3"/>
    <g transform={`translate(${dx} ${dy})`}><g className="canh-dieu">
      <Emoji ten="kite" x={-60} y={-94} s={128}/>
    </g></g>
    <Emoji ten="hibiscus" x={616} y={399} s={90} lop="canh-hoa"/>
  </Khung>;
}

/**
 * Component React `GocHa`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function GocHa({ id, mo }: CanhProps) {
  const coAB = id.endsWith('Q16');
  const alpha = coAB ? 60 : 25;
  const x = coAB ? 281 : 232, y = coAB ? 139 : 183, h = coAB ? 236 : 165;
  const s = h / .875;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const d = h / Math.tan(rad(alpha));
  return <Khung mo={mo}>
    <Emoji ten="office_building" x={x - .9375*s} y={y - s/16} s={s}/>
    <Emoji ten="person_standing_default" x={x - 27} y={y - 42} s={59} lop="canh-nguoi"/>
    <Emoji ten="house" x={604} y={205} s={109}/>
    <path d={`M30 ${y + h}H737`} stroke="#9cb9a9" strokeWidth="14" strokeLinecap="round"/>
    <Goc x={x} y={y} dau={0} rong={alpha} r={78}/>
    <path d={`M${x} ${y}h${d + 59}M${x} ${y}v${h}h${d}`} stroke={NET} strokeWidth="3" fill="none" strokeDasharray="8 6"/>
    <path d={`M${x} ${y}l${d} ${h}`} stroke={NET} strokeWidth="3"/>
    <OTo x={x + d - 36} y={y + h - 65} n={.29} dung phai={false}/>
    {coAB && <><Nhan x={x + 22} y={y - 12} nhan="A"/><Nhan x={x - 16} y={y + h + 30} nhan="B"/></>}
  </Khung>;
}

/**
 * Component React `Thap`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function Thap({ mo }: CanhProps) {
  const x = 171, y = 391, h = 238;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const gan = x + h, xa = x + h / Math.tan(rad(30));
  return <Khung mo={mo}>
    <Emoji ten="tokyo_tower" x={34} y={122} s={276}/><Emoji ten="deciduous_tree" x={635} y={210} s={118}/>
    <path d={`M${x} ${y}H${xa}`} stroke="#477a65" strokeWidth="3"/>
    <Goc x={gan} y={y} dau={180} rong={45} r={59}/><Goc x={xa} y={y} dau={180} rong={30} r={66}/>
    <path d={`M${gan} ${y}L${x} ${y-h}L${xa} ${y}`} stroke={NET} strokeWidth="3" strokeDasharray="8 6" fill="none"/>
    <Emoji ten="person_standing_default" x={gan - 49} y={295} s={99} lop="canh-nguoi"/>
    <Emoji ten="person_standing_default" x={xa - 49} y={295} s={99} lop="canh-nguoi" lat/>
  </Khung>;
}

/**
 * Component React `Loa`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function Loa({ mo }: CanhProps) {
  return <Khung mo={mo}><SongLoa/></Khung>;
}

/**
 * Component React `SongLoa`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function SongLoa() {
  const fill = useMau();
  return <>
    <circle cx="263" cy="251" r="226" fill={fill('nuoc')} fillOpacity=".14" stroke="#4593cd" strokeWidth="3" strokeDasharray="8 7"/>
    {[63,120,178].map((r,i) => <circle key={r} className="canh-am" style={{ animationDelay: i * -.8 + 's', transformOrigin: '263px 251px' }}
      cx="263" cy="251" r={r} fill="none" stroke="#4babe6" strokeWidth="5"/>)}
    <Bong x={268} y={367} rx={88}/><rect x="255" y="254" width="18" height="112" rx="9" fill={fill('kim-loai')}/>
    <Emoji ten="loudspeaker" x={177} y={148} s={166}/>
    <Nhan x={242} y={305} nhan="O"/>
    <Emoji ten="house" x={382} y={248} s={99}/><Emoji ten="house_with_garden" x={547} y={247} s={146}/>
  </>;
}

/**
 * Component React `DongHo`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function DongHo({ id, mo }: CanhProps) {
  return <Khung mo={mo} nen="trong-nha"><MatDongHo id={id}/><Emoji ten="potted_plant" x={588} y={323} s={128}/></Khung>;
}

/**
 * Component React `MatDongHo`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function MatDongHo({ id }: { id: string }) {
  const fill = useMau();
  const cungGio = id === 'C5-B15-M1-Q16', cungPhut = id === 'C5-B15-M1-Q07';
  const gio = id.endsWith('Q05') ? 90 : id.endsWith('Q13') ? 60 : cungGio ? 120 : 0;
  const phut = cungPhut ? 120 : 0;
  const r = cungPhut ? 133 : cungGio ? 96 : 84;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const start = cungGio ? -60 : -90, end = cungGio ? 30 : Math.max(gio, phut)-90;
  return <>
    <Bong x={384} y={438} rx={218} ry={26}/>
    <g transform="translate(384 250)">
      <circle cx="5" cy="7" r="179" fill="#a68984" opacity=".3"/>
      <circle r="175" fill={fill('hong')} stroke="#b76769" strokeWidth="4"/>
      <circle r="156" fill={fill('mat')} stroke="#fff4dc" strokeWidth="7"/>
      <Goc x={0} y={0} dau={start} rong={end-start} r={r}/>
      {Array.from({length:12}, (_,i)=><path key={i} d="M0-143v13" transform={`rotate(${i*30})`} stroke="#56698b" strokeWidth="6" strokeLinecap="round"/>)}
      {(cungGio || cungPhut) && <path d={`M0 0V${-r}`} transform={`rotate(${start+90})`} stroke="#9a725b" strokeDasharray="7 5" strokeWidth="4"/>}
      <g transform={`rotate(${phut})`}><path className={cungPhut ? 'canh-kim' : undefined} d="M0 9v-142" stroke="#4c90c3" strokeWidth="9" strokeLinecap="round"/></g>
      <g transform={`rotate(${gio})`}><path className={cungGio ? 'canh-kim' : undefined} d="M0 6v-102" stroke="#2e4268" strokeWidth="13" strokeLinecap="round"/></g>
      <circle r="11" fill={fill('vang')} stroke="#b97947" strokeWidth="2"/>
    </g>
  </>;
}

/**
 * Component React `BanhXe`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function BanhXe({ id, mo }: CanhProps) {
  const tiep = id.includes('B16');
  return <Khung mo={mo}><MatDuong/>
    <Emoji ten="bicycle" x={60} y={194} s={151}/>
    <Bong x={385} y={400} rx={166} ry={24}/>
    <Banh x={384} y={258} r={143} quay={!id.endsWith('M1-Q16') || !tiep} n={12}/>
    {tiep && <>
      <path d="M384 258v143h22v-22h-22" stroke="#ffe095" strokeWidth="5" fill="none"/><circle cx="384" cy="401" r="5" fill="#fff4cb"/>
      {id.endsWith('M2-Q08') && <Nhan x={361} y={254} nhan="O"/>}
    </>}
  </Khung>;
}

/**
 * Component React `MatDuong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function MatDuong() {
  const fill = useMau();
  return <>
    <Emoji ten="deciduous_tree" x={572} y={161} s={170}/><rect y="401" width="768" height="111" fill={fill('duong')}/>
    <path d="M0 403h768" stroke="#f6f5ed" strokeWidth="4"/><path d="M0 457h768" stroke="#f4d98d" strokeWidth="5" strokeDasharray="53 28"/>
  </>;
}

/**
 * Component React `NanHoa3D`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function NanHoa3D({ mo, n, goc }: CanhProps & { n: number; goc?: number }) {
  return <Khung mo={mo}><MatDuong/><Bong x={384} y={398} rx={163} ry={20}/>
    <Banh x={384} y={253} r={145} n={n} quay={false} goc={goc ?? 0}/>
    {goc === undefined && n === 8 && <Goc x={384} y={253} dau={-90} rong={135} r={62}/>}
  </Khung>;
}

/**
 * Component React `QuatGiay`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function QuatGiay({ mo }: CanhProps) {
  return <Khung mo={mo} nen="trong-nha"><MatQuat/><Emoji ten="hibiscus" x={597} y={334} s={108} lop="canh-hoa"/></Khung>;
}

/**
 * Component React `MatQuat`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function MatQuat() {
  const fill = useMau();
  return <>
    <Bong x={383} y={415} rx={229} ry={26}/>
    <g className="canh-quat" style={{ transformOrigin: '384px 405px' }}>
      <Goc x={384} y={405} dau={210} rong={120} r={263} chatLieu="hong"/>
      {Array.from({length:12}, (_,i)=><Goc key={i} x={384} y={405} dau={210+i*10} rong={10} r={252} chatLieu={i%2?'vang':'hong'}/>)}
      {Array.from({length:13},(_,i)=><path key={i} d="M384 405v-245" transform={`rotate(${i*10-60} 384 405)`} stroke="#b87559" strokeWidth="3"/>)}
      <circle cx="384" cy="405" r="18" fill={fill('go')} stroke="#a26b58" strokeWidth="2"/><circle cx="384" cy="401" r="5" fill="#ffe6ae"/>
    </g>
  </>;
}

/**
 * Component React `VoiTuoi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function VoiTuoi({ mo }: CanhProps) {
  return <Khung mo={mo}><VungTuoi/></Khung>;
}

/**
 * Component React `VungTuoi`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function VungTuoi() {
  const fill = useMau();
  return <>
    <Emoji ten="house_with_garden" x={41} y={155} s={151}/><Emoji ten="deciduous_tree" x={573} y={150} s={146}/>
    <Bong x={384} y={398} rx={198} ry={30}/>
    <Goc x={384} y={406} dau={225} rong={90} r={254} chatLieu="nuoc"/>
    <g transform="translate(384 406)"><g className="canh-quet">
      <path className="canh-chay" d="M0 0v-246" stroke="#dbfaff" strokeWidth="7" strokeLinecap="round" strokeDasharray="17 11"/>
      <path d="M0 0q-22-97-9-188m9 188q22-97 9-188" stroke="#a1e9ff" fill="none" strokeWidth="3" strokeDasharray="8 8"/>
    </g></g>
    <ellipse cx="384" cy="415" rx="33" ry="16" fill={fill('kim-loai')} stroke="#527797" strokeWidth="3"/>
    <rect x="371" y="373" width="26" height="40" rx="10" fill={fill('kim-loai')} stroke="#527797" strokeWidth="2"/>
    <Emoji ten="droplet" x={520} y={316} s={64} lop="canh-hoa"/>
  </>;
}

/**
 * Component React `DenPha`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function DenPha({ mo }: CanhProps) {
  return <Khung mo={mo} nen="dem">
    <Emoji ten="evergreen_tree" x={581} y={207} s={161}/><Bong x={221} y={431} rx={128}/>
    <Goc x={237} y={278} dau={-30} rong={60} r={435} chatLieu="den" lop="canh-den"/>
    <g transform="translate(237 278) rotate(135) scale(.62)"><Emoji ten="flashlight" x={-105} y={-105} s={256}/></g>
  </Khung>;
}

/**
 * Component React `OngCong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function OngCong({ mo }: CanhProps) {
  return <Khung mo={mo}><MatCong/></Khung>;
}

/**
 * Component React `MatCong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function MatCong() {
  const fill = useMau();
  return <>
    <Emoji ten="evergreen_tree" x={583} y={161} s={150}/><Emoji ten="brick" x={104} y={355} s={79}/>
    <Bong x={391} y={431} rx={250} ry={38}/>
    <path d="M321 146l160-44c100-14 157 70 154 158-2 56-35 105-97 117l-210 43Z" fill={fill('kim-loai')} stroke="#738da3" strokeWidth="4"/>
    <circle cx="325" cy="281" r="144" fill={fill('kim-loai')} stroke="#7992a2" strokeWidth="5"/>
    <circle cx="325" cy="281" r="115.2" fill={fill('dem')} stroke="#e6e6d9" strokeWidth="5"/>
    <path d="M231 330q95 44 187 0a106 106 0 0 1-187 0Z" fill={fill('nuoc')} opacity=".74"/>
    <path d="M220 310A111 111 0 0 1 375 181" fill="none" stroke="#a7c0cf" strokeWidth="5" opacity=".48"/>
    <path className="canh-song" d="M264 356q26-7 52 0t50 0" stroke="#b4f0ff" strokeWidth="4" fill="none"/>
  </>;
}

/**
 * Component React `SanTron`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function SanTron({ mo }: CanhProps) {
  return <Khung mo={mo}><BonCay/></Khung>;
}

/**
 * Component React `BonCay`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function BonCay() {
  const fill = useMau();
  return <>
    <Emoji ten="house_with_garden" x={58} y={147} s={144}/><Emoji ten="deciduous_tree" x={580} y={161} s={152}/>
    <Bong x={384} y={410} rx={205} ry={38}/>
    <circle cx="384" cy="268" r="188" fill={fill('go')} stroke="#ad7860" strokeWidth="3"/>
    <circle cx="384" cy="258" r="188" fill={fill('vang')} stroke="#ffdb8c" strokeWidth="5"/>
    <circle cx="384" cy="258" r="168" fill="none" stroke="#d39b61" strokeWidth="3" strokeDasharray="8 13"/>
    <circle cx="384" cy="258" r="37.6" fill={fill('doi')} stroke="#5c9c64" strokeWidth="4"/>
    <Emoji ten="blossom" x={365} y={236} s={42} lop="canh-hoa"/><Emoji ten="seedling" x={381} y={254} s={35}/>
  </>;
}

/**
 * Component React `HaiDang`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function HaiDang({ mo }: CanhProps) {
  return <Khung mo={mo}><MatBien/></Khung>;
}

/**
 * Component React `MatBien`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function MatBien() {
  const fill = useMau();
  // Điểm tiếp xúc được tính từ tâm (396,685), bán kính 385 và đỉnh (161,241).
  return <>
    <rect y="237" width="768" height="275" fill={fill('troi')}/>
    <circle cx="396" cy="685" r="385" fill={fill('nuoc')} stroke="#79c7e6" strokeWidth="5"/>
    <path d="M99 391l61-22 63 15-57 26Z" fill={fill('go')} stroke="#8a8b79" strokeWidth="3" strokeLinejoin="round"/>
    <Bong x={167} y={387} rx={55}/>
    <path d="M135 375l13-110h29l18 110q-29 12-60 0Z" fill={fill('mat')} stroke="#b48777" strokeWidth="3"/>
    <path d="M140 329q24 7 47 0l4 23q-28 8-54 0Z" fill={fill('hong')}/>
    <rect x="144" y="249" width="40" height="29" rx="5" fill={fill('vang')} stroke="#ad735b" strokeWidth="3"/>
    <path d="m135 253 26-27 32 27Z" fill={fill('hong')} stroke="#ab6c63" strokeWidth="3" strokeLinejoin="round"/>
    <path className="canh-den" d="M161 241 477 308 464 278Z" fill={fill('den')}/>
    <path d="M161 241 476.558 308.522" stroke="#975e39" strokeWidth="3.5" strokeDasharray="10 6"/>
    <circle cx="476.558" cy="308.522" r="5" fill="#ffedac" stroke="#b8794d" strokeWidth="2"/>
    <Emoji ten="water_wave" x={558} y={372} s={132} lop="canh-song"/>
    <path className="canh-song" d="M240 432q21-9 42 0t42 0m99 39q18-8 36 0t36 0" stroke="#d2f0ff" strokeWidth="4" fill="none" strokeLinecap="round"/>
  </>;
}

