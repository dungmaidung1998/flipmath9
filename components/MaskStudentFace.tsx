/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
// Fourteen deliberately distinct portraits, kept as SVG so they remain sharp on phones.
const portraits = [
  {name:'Minh, tóc dựng', skin:'#e9b58d', hair:'#292524', rx:25, ry:29, style:0},
  {name:'Lan, hai bím tóc', skin:'#f6cbaa', hair:'#42261e', rx:27, ry:28, style:1},
  {name:'Nam, tóc xoăn và kính tròn', skin:'#bd805c', hair:'#241b19', rx:28, ry:27, style:2},
  {name:'Mai, tóc ngắn và kẹp hoa', skin:'#f2be98', hair:'#573528', rx:24, ry:30, style:3},
  {name:'Huy, tóc rẽ ngôi', skin:'#dca078', hair:'#30231e', rx:27, ry:29, style:4},
  {name:'Linh, tóc đuôi ngựa', skin:'#f4c7a1', hair:'#292524', rx:25, ry:28, style:5},
  {name:'An, tóc húi ngắn', skin:'#c9916b', hair:'#382820', rx:29, ry:27, style:6},
  {name:'Ngọc, hai búi tóc', skin:'#efb78f', hair:'#34251f', rx:26, ry:29, style:7},
  {name:'Khoa, tóc mái chéo và kính vuông', skin:'#edc09f', hair:'#51382c', rx:24, ry:29, style:8},
  {name:'Hà, tóc dài gợn sóng', skin:'#b97d58', hair:'#271f20', rx:26, ry:30, style:9},
  {name:'Đức, tóc mái bằng', skin:'#dfaa7c', hair:'#282020', rx:28, ry:28, style:10},
  {name:'Vy, tóc ngắn và băng đô', skin:'#f3c6a6', hair:'#684532', rx:25, ry:27, style:11},
  {name:'Bảo, tóc xoăn cao', skin:'#cc936c', hair:'#31241d', rx:25, ry:30, style:12},
  {name:'Thảo, bím tóc lệch và kính', skin:'#e6b18a', hair:'#453024', rx:27, ry:29, style:13},
];
const fringes = [
 'M34 37L30 22 43 25 46 8 57 19 68 6 73 21 86 15 88 38 77 29 66 33 52 26Z',
 'M33 40Q25 9 60 12Q95 9 87 40L74 24 61 33 46 24Z',
 'M33 35Q29 17 43 15Q45 5 57 13Q66 3 74 15Q92 12 88 36L74 29 61 33 48 28Z',
 'M32 46Q24 10 59 11Q94 8 88 49L79 30 43 30 39 50Z',
 'M33 40Q28 12 61 12Q94 11 87 36L66 25Q46 39 33 40Z',
 'M34 40Q29 9 62 11Q91 11 87 41L75 23Q57 33 42 27Z',
 'M33 29Q36 10 61 12Q84 12 88 30Q60 23 33 29Z',
 'M33 39Q29 12 60 12Q91 11 87 39L74 27 60 34 46 27Z',
 'M34 39Q26 9 63 11Q91 11 86 37L76 25Q61 44 44 39L58 24Z',
 'M33 43Q28 11 59 10Q94 9 87 43L72 22 61 29 46 24Z',
 'M32 36Q29 11 60 11Q91 11 89 36L78 32 76 36 63 32 61 36 47 33 44 37Z',
 'M32 43Q26 12 59 11Q93 9 89 43L78 28 42 28Z',
 'M34 33Q23 23 34 15Q31 3 46 8Q54-2 65 7Q79 0 84 12Q99 18 87 34L73 29 61 34 47 28Z',
 'M33 42Q28 10 60 11Q93 9 87 40L74 26Q58 35 44 25Z',
];
const mouths = [
 'M49 57Q60 67 71 56Z','M51 58Q61 66 70 56','M48 57Q60 73 73 55Z',
 'M53 59Q61 64 69 58','M48 58Q58 62 71 55','M50 56Q60 70 70 56Z',
 'M48 57Q60 65 72 57','M52 57Q60 68 69 57Z','M52 59Q60 64 69 57',
 'M49 56Q62 70 73 55Z','M49 58Q61 63 72 57','M53 57Q60 65 68 57Z',
 'M48 56Q60 71 72 56Z','M51 58Q61 66 71 56',
];
/**
 * Component React `MaskStudentFace`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function MaskStudentFace({index}:{index:number}) {
 const p=portraits[index % portraits.length], i=p.style;
 return <g aria-label={p.name}>
  <title>{p.name}</title>
  {/* Hair behind the face: braids, ponytail, buns and shoulder-length cuts. */}
  {i===1&&<path d="M34 36Q21 55 29 85M86 36Q99 55 91 85" stroke={p.hair} strokeWidth="13" strokeDasharray="7 2" strokeLinecap="round"/>}
  {i===3&&<path d="M33 32V72H46M87 32V72H74" stroke={p.hair} strokeWidth="13" strokeLinejoin="round"/>}
  {i===5&&<path d="M84 25Q112 16 103 54L94 75Q100 41 84 38Z" fill={p.hair}/>}
  {i===7&&<g fill={p.hair}><circle cx="32" cy="20" r="14"/><circle cx="88" cy="20" r="14"/></g>}
  {i===9&&<path d="M36 27Q20 36 28 52Q18 64 30 81H45V32M83 26Q100 37 92 53Q102 68 90 83H76V32" fill={p.hair}/>}
  {i===11&&<path d="M33 33Q24 58 37 69L45 56M87 33Q96 58 83 69L75 56" fill={p.hair}/>}
  {i===13&&<path d="M84 33Q96 57 85 91" stroke={p.hair} strokeWidth="14" strokeDasharray="8 2" strokeLinecap="round"/>}
  <g fill={p.skin}><circle cx="33" cy="46" r="6"/><circle cx="87" cy="46" r="6"/><ellipse cx="60" cy="44" rx={p.rx} ry={p.ry}/></g>
  <path d={fringes[i]} fill={p.hair}/>
  <g stroke={p.hair} strokeWidth="2" fill="none" strokeLinecap="round"><path d={i%2?'M44 38Q49 34 54 38M66 38Q71 34 76 38':'M44 37 54 36M66 36 76 38'}/></g>
  {i===5||i===10?<g fill="none" stroke="#302420" strokeWidth="2.5" strokeLinecap="round"><path d="M45 46Q50 39 55 46M65 46Q70 39 75 46"/></g>:<g fill="#302420"><ellipse cx={49+i%2} cy="45" rx={i%3===0?3.2:2.4} ry={i%3===1?4:3}/><ellipse cx={71-i%2} cy="45" rx={i%3===0?3.2:2.4} ry={i%3===1?4:3}/><circle cx="49" cy="44" r=".8" fill="white"/><circle cx="71" cy="44" r=".8" fill="white"/></g>}
  <path d={['M60 45 57 53 62 53','M60 48Q66 54 59 54','M58 52Q61 55 64 51','M61 46 63 52 59 53'][i%4]} stroke="#a5674c" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
  <path d={mouths[i]} stroke="#92443b" strokeWidth="2" fill={mouths[i].endsWith('Z')?'#fff7ed':'none'} strokeLinecap="round"/>
  {(i===2||i===8||i===13)&&<g fill="none" stroke={i===13?'#be185d':'#334155'} strokeWidth="2">{i===8?<><rect x="39" y="38" width="19" height="15" rx="3"/><rect x="63" y="38" width="19" height="15" rx="3"/></>:<><circle cx="49" cy="45" r="10"/><circle cx="71" cy="45" r="10"/></>}<path d="M58 44H62M32 41 39 43M82 43 88 40"/></g>}
  {(i===1||i===7)&&<g fill="#ec4899"><circle cx="30" cy={i===7?25:72} r="4"/><circle cx="90" cy={i===7?25:72} r="4"/></g>}
  {i===3&&<g fill="#f472b6"><circle cx="80" cy="27" r="5"/><circle cx="85" cy="23" r="5"/><circle cx="86" cy="30" r="5"/><circle cx="84" cy="27" r="3" fill="#fde047"/></g>}
  {i===11&&<path d="M33 30Q60 9 87 30" stroke="#38bdf8" strokeWidth="5" fill="none"/>}
  {(i===0||i===4||i===9)&&<g fill="#ae7256"><circle cx="42" cy="53" r="1"/><circle cx="46" cy="54" r="1"/><circle cx="75" cy="54" r="1"/><circle cx="79" cy="52" r="1"/></g>}
 </g>;
}
