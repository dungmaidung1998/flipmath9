"use client";
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./GameMission, ./MathText, ./useGameAudio
 */
import {useEffect,useState} from 'react';
import GameMission,{useGameMission} from './GameMission';
import MathText from './MathText';
import {useGameAudio} from './useGameAudio';
const questions=[
  {q:String.raw`\dfrac{1}{5}+\dfrac{2}{5}`,options:[String.raw`\dfrac{3}{5}`,String.raw`\dfrac{3}{10}`,String.raw`\dfrac{2}{5}`],answer:0,hint:'Cùng mẫu số: cộng tử số, giữ nguyên mẫu số.'},
  {q:'7+5',options:['11','12','13'],answer:1,hint:'$7+5=12$.'},
  {q:'1{,}2+0{,}5',options:['1{,}25','6{,}2','1{,}7'],answer:2,hint:'Cộng theo hàng thập phân: $1{,}2+0{,}5=1{,}7$.'},
  {q:String.raw`\dfrac{1}{2}+\dfrac{1}{4}`,options:[String.raw`\dfrac{2}{6}`,String.raw`\dfrac{3}{4}`,String.raw`\dfrac{1}{6}`],answer:1,hint:String.raw`Quy đồng: $\dfrac{1}{2}=\dfrac{2}{4}$, rồi cộng để được $\dfrac{3}{4}$.`},
  {q:'-4+7',options:['3','-3','11'],answer:0,hint:'Hai số khác dấu: lấy $7-4=3$, giữ dấu của số có giá trị tuyệt đối lớn hơn.'},
  {q:'2{,}35+1{,}4',options:['2{,}49','3{,}39','3{,}75'],answer:2,hint:'Viết $1{,}4=1{,}40$, đặt các dấu phẩy thẳng cột: kết quả $3{,}75$.'},
  {q:String.raw`\dfrac{1}{3}+\dfrac{1}{6}`,options:[String.raw`\dfrac{2}{9}`,String.raw`\dfrac{1}{2}`,String.raw`\dfrac{1}{9}`],answer:1,hint:String.raw`$\dfrac{1}{3}+\dfrac{1}{6}=\dfrac{2}{6}+\dfrac{1}{6}=\dfrac{3}{6}=\dfrac{1}{2}$.`},
  {q:String.raw`1\dfrac{1}{2}+2\dfrac{1}{2}`,options:['3','4',String.raw`3\dfrac{1}{2}`],answer:1,hint:String.raw`Cộng phần nguyên và phần phân số: $1+2=3$, $\dfrac{1}{2}+\dfrac{1}{2}=1$. Tổng bằng $4$.`},
  {q:String.raw`2\dfrac{1}{3}+1\dfrac{1}{6}`,options:[String.raw`3\dfrac{1}{2}`,String.raw`3\dfrac{2}{9}`,String.raw`3\dfrac{1}{6}`],answer:0,hint:String.raw`$2+1=3$ và $\dfrac{1}{3}+\dfrac{1}{6}=\dfrac{3}{6}=\dfrac{1}{2}$. Tổng là $3\dfrac{1}{2}$.`},
  {q:String.raw`1\dfrac{3}{4}+2\dfrac{2}{3}`,options:[String.raw`3\dfrac{5}{7}`,String.raw`3\dfrac{5}{12}`,String.raw`4\dfrac{5}{12}`],answer:2,hint:String.raw`$\dfrac{3}{4}+\dfrac{2}{3}=\dfrac{9}{12}+\dfrac{8}{12}=1\dfrac{5}{12}$. Cộng thêm $1+2=3$, được $4\dfrac{5}{12}$.`}
];
/**
 * Component React `FractionRace`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function FractionRace(){
 const mission=useGameMission();
  const audio=useGameAudio();const [started,setStarted]=useState(false),[index,setIndex]=useState(0),[picked,setPicked]=useState<number|null>(null),[speed,setSpeed]=useState(40),[correct,setCorrect]=useState(0),[sound,setSound]=useState(true);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const finished=index===questions.length,q=questions[Math.min(index,questions.length-1)];
  function advance(){setIndex(n=>n+1);setPicked(null);}
 useEffect(()=>{if(!mission.autoRun)return;
    if(!started||finished||picked!==q.answer)return;
    const timer=setTimeout(advance,2000);
    return ()=>clearTimeout(timer);
  },[mission.autoRun,started,finished,picked,q.answer,index]);
  function start(){setStarted(true);setIndex(0);setPicked(null);setSpeed(40);setCorrect(0);}
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  function answer(i:number){if(picked!==null)return;setPicked(i);const ok=i===q.answer;if(sound)audio.effect(ok);setSpeed(s=>Math.max(10,Math.min(120,s+(ok?15:-20))));if(ok)setCorrect(c=>c+1);}
  return <GameMission mission={mission} title={'Đua xe phân số'} icon="🏎️" intro={'Trả lời đúng phép cộng để xe tiến gần đích. Hoàn thành 10 trạm để vượt vạch đích.'} step={`Trạm ${index+1}/10`} finished={finished} ready={picked===q.answer} onStart={start} onAdvance={advance}><section className="foundation-game" aria-labelledby="race-title"><div className="game-heading"><div><span className="game-eyebrow">ÔN KIẾN THỨC CŨ · PHÉP CỘNG</span><h2 id="race-title">🏎️ Đua xe phân số</h2><p>Qua {questions.length} trạm: 2 phép cộng số nguyên, 2 số thập phân, 3 phân số và 3 hỗn số. Mỗi câu đúng đưa xe gần đích hơn. Đúng đủ 10 câu để vượt vạch đích!</p></div><button type="button" aria-pressed={sound} onClick={()=>setSound(s=>!s)}>{sound?'🔊 Âm thanh bật':'🔇 Âm thanh tắt'}</button></div>
    <div className="race-road" aria-label={`Tốc độ trò chơi ${speed} km/h`}><div className="race-dashes" style={{animationDuration:`${160/speed}s`,animationPlayState:started&&!finished?'running':'paused'}}/><span className="race-car race-progress-car" style={{left:`${correct===questions.length?94:8+correct*6.8}%`}} aria-hidden="true">🏎️</span><strong className="race-speed">{speed} km/h</strong><span className="race-finish-line" aria-hidden="true"/><span className="race-destination race-fixed-flag" aria-hidden="true">🏁</span></div>
    {!started?<><p>Mỗi câu đúng tăng 15 km/h; sai giảm 20 km/h (từ 10 đến 120 km/h). Câu sai được làm lại; xe chỉ tiến khi trả lời đúng. Không giới hạn thời gian suy nghĩ.</p><button type="button" className="primary" onClick={start}>Xuất phát!</button></>:finished?<div className="game-check" role="status"><h3>🏁 Đã qua đủ {questions.length} trạm!</h3><p>Đúng {correct}/{questions.length} câu · Tốc độ cuối: {speed} km/h.</p><button type="button" onClick={start}>Đua lại</button></div>:<>
      <div className="game-controls"><strong>Trạm {index+1}/{questions.length}</strong><span>⭐ {correct} câu đúng</span><button type="button" onClick={start}>Đua lại</button></div>
      <progress value={correct} max={questions.length} aria-label="Số trạm đã hoàn thành" style={{width:'100%'}}/>
      <div className="fraction-duel"><MathText>{`$${q.q}=?$`}</MathText></div>
      <div className="fraction-signs">{q.options.map((o,i)=><button type="button" key={`${index}:${i}`} className={`game-tile tile-${i} ${picked!==null&&i===q.answer?'paired':''}`} disabled={picked!==null} onClick={()=>answer(i)}><MathText>{`$${o}$`}</MathText></button>)}</div>
      {picked!==null&&<div className="game-feedback" role="status"><strong>{picked===q.answer?'✓ Chính xác — xe tăng tốc!':'Xe giảm tốc — cùng xem lại cách tính nhé.'}</strong><p><MathText>{q.hint}</MathText></p>{picked===q.answer?<p className="hint">{!mission.autoRun?'Bấm Tiếp theo khi đã sẵn sàng.':index===questions.length-1?'Tự động về đích sau 2 giây…':'Tự động sang trạm tiếp theo sau 2 giây…'}</p>:<button type="button" className="primary" onClick={()=>setPicked(null)}>Thử lại câu này →</button>}</div>}
    </>}
    <p className="hint">Tốc độ là hiệu ứng trò chơi. Kết quả ôn tập không thay đổi điểm kiểm tra hoặc mastery.</p>
  </section></GameMission>;
}
