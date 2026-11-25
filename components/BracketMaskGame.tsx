"use client";

/**
 * FILE NÀY LÀM GÌ: Trò chơi rèn kỹ năng phá ngoặc có dấu âm qua hình ảnh đeo khẩu trang che dấu ngoặc.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./GameMission, ./MathText, ./MaskStudentFace, ./useGameAudio
 */
import {useEffect,useRef,useState} from 'react';
import GameMission,{useGameMission} from './GameMission';
import MathText from './MathText';
import MaskStudentFace from './MaskStudentFace';
import {useGameAudio} from './useGameAudio';
type Step={base:string;out:number;values:string[];signs:number[];suffix?:string;formula?:string;note?:string};
type Round=Step & {steps?:Step[]};
const rounds:Round[]=[
 {base:'7',out:1,values:['3','2'],signs:[1,-1]},
 {base:'8',out:-1,values:['3','5','2'],signs:[1,-1,1]},
 {base:'a',out:1,values:['b','c'],signs:[-1,1]},
 {base:'9-4',out:-1,values:['2','7'],signs:[-1,1]},
 {base:'5+2',out:1,values:['4','3','6'],signs:[1,-1,-1]},
 {base:'x',out:-1,values:['y','3','z'],signs:[1,1,-1]},
 {base:'3-1+6',out:1,values:['8','5','1'],signs:[-1,-1,1]},
 {base:'a+b',out:-1,values:['c','d','2'],signs:[-1,-1,1]},
 {base:'x-y+2',out:1,values:['a','b','4'],signs:[-1,1,-1]},
 {base:'15-6+2',out:-1,values:['3','8','2','5'],signs:[1,-1,1,-1]}
];

rounds.push(
 {base:'8',out:1,values:['3','2'],signs:[1,-1],steps:[
  {base:'8',out:1,values:['3','2'],signs:[1,-1],suffix:String.raw`-\left(5-1\right)`,note:'Bước 1/2: bỏ ngoặc thứ nhất.'},
  {base:'8+3-2',out:-1,values:['5','1'],signs:[1,-1],note:'Bước 2/2: bỏ ngoặc thứ hai.'}]},
 {base:'a',out:-1,values:['b','c'],signs:[1,-1],steps:[
  {base:'a',out:-1,values:['b','c'],signs:[1,-1],suffix:String.raw`+\left(x-y\right)`,note:'Bước 1/2: bỏ ngoặc thứ nhất.'},
  {base:'a-b+c',out:1,values:['x','y'],signs:[1,-1],note:'Bước 2/2: bỏ ngoặc thứ hai.'}]},
 {base:'12',out:-1,values:['7','2','3'],signs:[1,-1,1],steps:[
  {base:String.raw`12-\left(7`,out:-1,values:['2','3'],signs:[1,-1],suffix:String.raw`\right)`,formula:String.raw`12-\left(7-\left(2-3\right)\right)`,note:'Bước 1/2: bỏ ngoặc trong, giữ nguyên ngoặc ngoài.'},
  {base:'12',out:-1,values:['7','2','3'],signs:[1,-1,1],note:'Bước 2/2: bỏ ngoặc ngoài.'}]},
 {base:'x+y',out:-1,values:['a','b','c'],signs:[1,-1,1],steps:[
  {base:String.raw`x+y-\left(a`,out:1,values:['b','c'],signs:[-1,1],suffix:String.raw`\right)`,formula:String.raw`x+y-\left(a+\left(-b+c\right)\right)`,note:'Bước 1/2: bỏ ngoặc trong có dấu cộng.'},
  {base:'x+y',out:-1,values:['a','b','c'],signs:[1,-1,1],note:'Bước 2/2: bỏ ngoặc ngoài có dấu trừ.'}]}
);
const sign=(n:number)=>n===1?'+':'-';
export default function BracketMaskGame(){
 const mission=useGameMission();
 const audio=useGameAudio();const [index,setIndex]=useState(0),[signs,setSigns]=useState(rounds[0].signs),[solved,setSolved]=useState(false),[errors,setErrors]=useState<number[]>([]),[feedback,setFeedback]=useState('Bấm vào từng dấu để giữ hoặc đổi dấu, rồi kéo mặt nạ sang phải.'),[sound,setSound]=useState(true),[offset,setOffset]=useState(0);
 const [step,setStep]=useState(0);
 const skipClick=useRef(false);
 const origin=useRef<number|null>(null),finished=index===rounds.length,round=rounds[Math.min(index,rounds.length-1)],q=round.steps?.[step]??round;
 const roundComplete=solved&&(!round.steps||step===round.steps.length-1);
 const revealed=Math.min(rounds.length,index+(roundComplete?1:0));
 const inside=q.values.map((v,i)=>(i===0&&q.signs[i]===1?'':sign(q.signs[i]))+v).join('');
 const formula=q.formula??String.raw`${q.base}${sign(q.out)}\left(${inside}\right)${q.suffix??''}`;
 function advance(){
    const nextStep=step+1;
    if(round.steps&&nextStep<round.steps.length){setStep(nextStep);setSigns([...round.steps[nextStep].signs]);setFeedback('Tiếp tục bỏ cặp ngoặc còn lại.');}
    else{const next=index+1;setIndex(next);setStep(0);if(next<rounds.length)setSigns([...(rounds[next].steps?.[0]??rounds[next]).signs]);setFeedback('Lượt mới: quan sát dấu đứng trước ngoặc.');}
    setSolved(false);setErrors([]);setOffset(0);
  }
 useEffect(()=>{if(!mission.autoRun)return;
  if(!solved||finished)return;
  const timer=setTimeout(advance,2000);
  return()=>clearTimeout(timer);
 },[mission.autoRun,solved,finished,index,step,round]);
 function check(){if(solved||finished)return;const wrong=q.signs.map((s,i)=>signs[i]!==s*q.out?i:-1).filter(i=>i>=0);setErrors(wrong);setOffset(0);if(sound)audio.effect(wrong.length===0);if(!wrong.length){setSolved(true);setFeedback(round.steps&&step<round.steps.length-1?'✓ Đúng bước này! Hoàn thành ngoặc còn lại để mở mặt nạ.':'✓ Chính xác! Một bạn đã được mở mặt nạ.');}else setFeedback(q.out===1?'Trước ngoặc là dấu cộng: giữ nguyên dấu của mọi hạng tử. Xem lại các dấu được đánh dấu.':'Trước ngoặc là dấu trừ: đổi dấu của tất cả các hạng tử, kể cả hạng tử đầu tiên. Xem lại các dấu được đánh dấu.');}
 function restart(){setStep(0);setIndex(0);setSigns([...rounds[0].signs]);setSolved(false);setErrors([]);setOffset(0);origin.current=null;setFeedback('Bấm vào từng dấu để giữ hoặc đổi dấu, rồi kéo mặt nạ sang phải.');}
 return <GameMission mission={mission} title={'Chiếc mặt nạ dấu ngoặc'} icon="🎭" intro={'Sửa dấu trong biểu thức, rồi kéo mặt nạ để kiểm tra. Mỗi câu đúng mở mặt nạ một bạn.'} step={`Mặt nạ ${index+1}/${rounds.length} · Bước ${step+1}`} finished={finished} ready={solved} onStart={restart} onAdvance={advance}><section className="foundation-game" aria-labelledby="mask-title"><div className="game-heading"><div><span className="game-eyebrow">ÔN LỚP 6 · QUY TẮC DẤU NGOẶC</span><h2 id="mask-title">🎭 Chiếc mặt nạ dấu ngoặc</h2><p>Gỡ dấu ngoặc bằng cách giữ hoặc đổi dấu. Chỉ viết lại biểu thức, không cần tính kết quả.</p></div><button type="button" aria-pressed={sound} onClick={()=>setSound(v=>!v)}>{sound?'🔊 Âm thanh bật':'🔇 Âm thanh tắt'}</button></div>
 <div className="mask-game-layout"><div className="mask-puzzle">
 {finished?<div className="game-check" role="status"><h3>🎉 Đã mở đủ {rounds.length} mặt nạ!</h3><p>Trước ngoặc là dấu cộng: giữ dấu. Trước ngoặc là dấu trừ: đổi mọi dấu.</p><button type="button" onClick={restart}>Chơi lại</button></div>:<>
 <div className="game-controls"><strong>Mặt nạ {index+1}/{rounds.length}</strong><button type="button" onClick={restart}>Chơi lại</button></div>
 {q.note&&<p className="game-help">{q.note}</p>}
 <div className="mask-original"><MathText>{`$${formula}$`}</MathText></div>
 <p>Biểu thức sau khi bỏ ngoặc — giữ nguyên phần ngoài ngoặc, bấm các dấu của phần trong ngoặc để sửa:</p>
 <div className="mask-expression"><MathText>{`$${q.base}${q.formula?String.raw`\right.`:''}$`}</MathText>{q.values.map((v,i)=><span className="mask-term" key={i}><button type="button" className={`mask-sign ${errors.includes(i)?'mask-error':''}`} disabled={solved} aria-label={`Dấu trước ${v}: ${signs[i]===1?'cộng':'trừ'}. Bấm để đổi dấu.`} onClick={()=>{setSigns(s=>s.map((n,j)=>j===i?-n:n));setErrors(e=>e.filter(j=>j!==i));}}><MathText>{`$${sign(signs[i])}$`}</MathText>{errors.includes(i)&&<small aria-label="Cần xem lại">!</small>}</button><MathText>{`$${v}$`}</MathText></span>)}{q.suffix&&<MathText>{`$${q.formula?String.raw`\left.`:''}${q.suffix}$`}</MathText>}</div>
 <div className={`mask-reveal ${solved?'mask-solved':''}`}><button type="button" className="mask-handle" disabled={solved} style={{transform:`translateX(${offset}px)`}} onClick={()=>{if(skipClick.current){skipClick.current=false;return;}check();}} onPointerDown={e=>{if(e.button!==0)return;skipClick.current=false;origin.current=e.clientX;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(origin.current!==null)setOffset(Math.max(0,Math.min(100,e.clientX-origin.current)));}} onPointerCancel={()=>{origin.current=null;setOffset(0);}} onPointerUp={e=>{const start=origin.current;origin.current=null;if(start!==null&&e.clientX-start>=55){skipClick.current=true;check();}else setOffset(0);}}>{solved?'✨ Mặt nạ đã mở':'🎭 Kéo mặt nạ sang phải →'}</button></div>
 <p className="hint">Cũng có thể bấm mặt nạ hoặc dùng Tab và Enter để kiểm tra.</p>
 <div className="game-feedback" role="status"><MathText>{feedback}</MathText>{solved&&mission.autoRun&&<p>{mission.autoRun?'Tự chuyển sau 2 giây…':'Bấm Tiếp theo khi đã sẵn sàng.'}</p>}</div>
 </>}
 </div><details className="mask-classroom"><summary>Lớp học bí mật · Đã mở {revealed}/{rounds.length} mặt nạ</summary>
 <h3>🎭 Lớp học bí mật</h3><p role="status">Đã mở {revealed}/{rounds.length} mặt nạ</p>
 <div className="mask-students">{rounds.map((_,i)=>{
 const open=i<revealed;
 const active=i===index&&!finished;
 const preview=active&&!open?offset*.65:0;
 const colors=['#7c3aed','#0284c7','#db2777','#059669','#ea580c','#4f46e5','#0891b2'];
 return <div key={i} className={`mask-student ${open?'is-revealed':''} ${active?'is-active':''}`}>
 <svg viewBox="0 0 120 150" role="img" aria-label={`Bạn ${i+1}: ${open?'đã mở mặt nạ':'đang cầm mặt nạ'}`}>
 <ellipse cx="60" cy="143" rx="39" ry="5" fill="#ddd6fe"/>
 <path d="M43 119v22m34-22v22" stroke="#334155" strokeWidth="12" strokeLinecap="round"/>
 <path d="M32 118V88Q32 72 60 72T88 88v30Z" fill={colors[i%colors.length]}/>
 <path d="m49 76 11 13 11-13" fill="white"/>
 <MaskStudentFace index={i}/>
 <g className="student-mask" style={{transform:open?'translate(30px, 42px) rotate(22deg)':`translate(${preview}px, 0px)`}}>
 <path d="M86 55v49" stroke="#a16207" strokeWidth="5" strokeLinecap="round"/>
 <path d="M27 33Q42 25 60 33Q78 25 93 33L90 56Q79 76 60 61Q41 76 30 56Z" fill={colors[(i+2)%colors.length]} stroke="white" strokeWidth="3"/>
 <path d="M37 44q10-10 18 1-10 10-18-1m29 1q9-11 18-1-8 11-18 1" fill="#fef3c7"/>
 <path d="M86 98 92 91" stroke="#f4c7a1" strokeWidth="10" strokeLinecap="round"/>
 </g>
 {open&&<text x="8" y="23" fontSize="22">✨</text>}
 </svg><span> Bạn {i+1} {open?'✓':''}</span></div>;
 })}</div><p className="hint">Mỗi câu đúng mở mặt nạ một bạn. Câu có hai bước cần hoàn thành cả hai.</p>
 </details></div>
 <p className="hint">Trò chơi ôn tập không thay đổi điểm kiểm tra hoặc mastery.</p></section></GameMission>;
}
