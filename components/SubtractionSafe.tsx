"use client";
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./LearningScreen, ./MathText, ./useGameAudio
 */
import {useContext,useEffect,useState} from 'react';
import LearningScreen,{LearningActive,LearningBack,LearningNext} from './LearningScreen';
import './safe-mission.css';
import MathText from './MathText';
import {useGameAudio} from './useGameAudio';
const f=(a:number,b:number)=>String.raw`\dfrac{${a}}{${b}}`;
const questions=[
 {q:'Số đối của $-7$ là số nào?',o:['7','-7','0'],a:0,h:'Hai số đối nhau có tổng bằng $0$.'},
 {q:`Số đối của $${f(3,5)}$ là số nào?`,o:[f(5,3),'-'+f(3,5),f(3,5)],a:1,h:`$${f(3,5)}$ và $-${f(3,5)}$ có tổng bằng $0$.`},
 {q:'Tính $4-9$.',o:['5','13','-5'],a:2,h:String.raw`$4-9=4+\left(-9\right)=-5$.`},
 {q:String.raw`Tính $-3-\left(-8\right)$.`,o:['-11','5','-5'],a:1,h:String.raw`Trừ một số là cộng với số đối: $-3-\left(-8\right)=-3+8=5$.`},
 {q:'Tính $3{,}5-1{,}2$.',o:['2{,}3','2{,}7','4{,}7'],a:0,h:'Đặt dấu phẩy thẳng cột: $3{,}5-1{,}2=2{,}3$.'},
 {q:'Tính $5-2{,}75$.',o:['3{,}25','2{,}75','2{,}25'],a:2,h:'Viết $5=5{,}00$, rồi trừ được $2{,}25$.'},
 {q:`Tính $${f(5,6)}-${f(1,3)}$.`,o:[f(4,3),f(1,2),f(2,3)],a:1,h:`Quy đồng: $${f(5,6)}-${f(2,6)}=${f(3,6)}=${f(1,2)}$.`},
 {q:`Tính $${f(3,4)}-${f(2,3)}$.`,o:[f(1,12),f(1,7),f(1,3)],a:0,h:`Mẫu chung $12$: $${f(9,12)}-${f(8,12)}=${f(1,12)}$.`},
 {q:`Tính $3${f(3,4)}-1${f(1,2)}$.`,o:['2'+f(1,2),'2'+f(1,4),'1'+f(1,4)],a:1,h:`$3-1=2$ và $${f(3,4)}-${f(1,2)}=${f(1,4)}$. Kết quả $2${f(1,4)}$.`},
 {q:`Tính $2${f(1,3)}-1${f(3,4)}$.`,o:['1'+f(5,12),f(5,12),f(7,12)],a:2,h:`Đổi hỗn số: $${f(7,3)}-${f(7,4)}=${f(28,12)}-${f(21,12)}=${f(7,12)}$.`}
];
const code='7319528046';
/**
 * Component React `SubtractionSafe`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function SubtractionSafe(){
 const audio=useGameAudio(),active=useContext(LearningActive),back=useContext(LearningBack),nextActivity=useContext(LearningNext);
 const [started,setStarted]=useState(false),[index,setIndex]=useState(0),[picked,setPicked]=useState<number|null>(null),[sound,setSound]=useState(true),[misses,setMisses]=useState(0),[help,setHelp]=useState(false),[auto,setAuto]=useState(true),[visible,setVisible]=useState(true),[remaining,setRemaining]=useState(2);
 // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
 const finished=index===questions.length,q=questions[Math.min(index,questions.length-1)],correct=picked===q.a,unlocked=finished?10:index+(correct?1:0);
 useEffect(()=>{const change=()=>setVisible(!document.hidden);change();document.addEventListener('visibilitychange',change);return()=>document.removeEventListener('visibilitychange',change);},[]);
 // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
 function advance(){setIndex(i=>Math.min(questions.length,i+1));setPicked(null);setRemaining(2);setHelp(false);}
 // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
 useEffect(()=>{setRemaining(2);if(!started||finished||!correct||!auto||help||!active||!visible)return;const tick=setInterval(()=>setRemaining(n=>Math.max(0,n-1)),1000);const timer=setTimeout(advance,2000);return()=>{clearInterval(tick);clearTimeout(timer);};},[started,finished,correct,index,auto,help,active,visible]);
 function restart(){setStarted(true);setIndex(0);setPicked(null);setMisses(0);setHelp(false);setRemaining(2);if(sound)audio.begin();}
 function answer(i:number){if(picked!==null)return;setPicked(i);if(sound)audio.effect(i===q.a);if(i!==q.a)setMisses(n=>n+1);}
 const status=!started?'Mỗi câu đúng mở một chữ số mật mã.':finished?'Em đã hoàn thành 10 thử thách.':correct?(auto&&!help?`Sang bước tiếp theo sau ${remaining} giây. Em có thể bấm Tiếp theo ngay.`:'Đọc xong, em bấm Tiếp theo nhé.'):picked!==null?'Em có thể thử lại hoặc mở hướng dẫn.':'Chọn đáp án để mở khóa.';
 return <LearningScreen title="Phá khóa két sắt" step={!started?'Nhiệm vụ: mở chiếc két bí mật':finished?'Két sắt đã mở!':`Ổ khóa ${index+1}/10`} onBack={()=>{audio.leave();if(back)back();else setStarted(false);}} onNext={()=>{if(!started)restart();else if(finished){audio.leave();if(nextActivity)nextActivity();else window.location.assign('/bai-hoc');}else if(correct)advance();else if(picked!==null)setPicked(null);}} nextLabel={!started?'Bắt đầu →':finished?'Tiếp tục bài học →':picked!==null&&!correct?'Thử lại':'Tiếp theo →'} disabled={started&&!finished&&picked===null} status={status}>
 <div className="safe-mission">
 <div className="safe-tools"><button aria-pressed={sound} onClick={()=>{setSound(!sound);if(sound)audio.leave();else audio.begin();}}>{sound?'🔊 Âm thanh':'🔇 Âm thanh'}</button><button aria-expanded={help} onClick={()=>setHelp(!help)}>?</button></div>
 {help&&<aside className="safe-help"><strong>Cách chơi</strong><p>Chọn kết quả đúng để mở từng ô mật mã. Chữ số được thưởng không phải đáp án phép tính.</p><label><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/> Tự chuyển sau 2 giây khi đúng</label><p>Quay lại hoạt động trước không xóa tiến độ trong trang này.</p></aside>}
 <div className={'mission-vault'+(finished?' is-open':'')} aria-label={finished?'Két đã mở':`Đã mở ${unlocked}/10 chữ số`}><div className="vault-door"><div className="vault-wheel" aria-hidden="true">{finished?'💎':'✣'}</div><div className="vault-code">{Array.from(code).map((digit,i)=><span key={i} className={i<unlocked?'revealed':''}>{i<unlocked?digit:'•'}</span>)}</div></div></div>
 {!started?<div className="safe-intro"><h3>Giải phép trừ, tìm mật mã</h3><p>10 thử thách về số đối, số nguyên, số thập phân, phân số và hỗn số.</p><p>Không giới hạn thời gian.</p></div>:finished?<div className="safe-intro" role="status"><h3>Em đã mở đủ 10 chữ số!</h3><p>{misses?`Em đã kiên trì thử lại ${misses} lần.`:'Em hoàn thành mà không cần thử lại.'}</p><button onClick={restart}>Chơi lại</button></div>:<>
 <div className="mission-question"><MathText>{q.q}</MathText></div>
 <div className="mission-answers">{q.o.map((o,i)=><button key={`${index}:${i}`} aria-pressed={picked===i} className={picked===i?(correct?'right':'wrong'):''} disabled={picked!==null} onClick={()=>answer(i)}><span className="mission-letter">{String.fromCharCode(65+i)}</span><MathText>{`$${o}$`}</MathText>{picked===i&&<span>{correct?'✓':'×'}</span>}</button>)}</div>
 <div className="mission-feedback" role="status" aria-live="polite">{picked!==null?<><strong>{correct?'✓ Chính xác! Một ô mật mã đã mở.':'Chưa đúng. Mình thử lại nhé.'}</strong><button className="safe-explain" aria-expanded={help} onClick={()=>setHelp(!help)}>Xem giải thích</button>{help&&<p><MathText>{q.h}</MathText></p>}</>:<span>Em chọn một đáp án nhé.</span>}</div>
 </>}
 </div>
 </LearningScreen>;
}
