"use client";
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./GameMission, ./MathText, ./useGameAudio
 */
import {useState} from 'react';
import GameMission,{useGameMission} from './GameMission';
import MathText from './MathText';
import {useGameAudio} from './useGameAudio';
/**
 * Component React `shuffled`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
// Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
function shuffled<T,>(items:T[]):T[]{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
const hiddenNumbers=[-12,-10,-9,-7,-6,-4,-3,-2,-1,0,1,2,3,4,6,7,9,10,12,15];
const spots=[[10,13],[31,10],[53,17],[74,10],[91,24],[18,32],[39,29],[63,35],[80,42],[8,51],[27,54],[49,49],[68,58],[92,62],[14,74],[35,72],[55,79],[76,76],[26,90],[89,89]];
/**
 * Component React `Garden`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Garden(){return <svg viewBox="0 0 1000 650" preserveAspectRatio="none" className="opposite-garden" aria-hidden="true">
  <rect width="1000" height="650" fill="#c9edf4"/><circle cx="810" cy="85" r="57" fill="#ffdf79"/>
  <g fill="#fff8e8"><ellipse cx="150" cy="80" rx="100" ry="35"/><ellipse cx="360" cy="65" rx="80" ry="30"/><ellipse cx="550" cy="118" rx="95" ry="35"/></g>
  <path d="M0 300Q190 160 400 300Q660 120 1000 270V650H0Z" fill="#9bcd8c"/><path d="M0 420Q280 280 530 390Q740 270 1000 360V650H0Z" fill="#c5dda0"/>
  <path d="M540 300Q310 440 550 500T710 650" fill="none" stroke="#f5dcaa" strokeWidth="90"/>
  <g><rect x="95" y="240" width="28" height="160" rx="8" fill="#ac7759"/><circle cx="100" cy="225" r="85" fill="#64a982"/><circle cx="155" cy="250" r="55" fill="#7ab48c"/>
  <rect x="795" y="260" width="25" height="175" fill="#ac7759"/><circle cx="810" cy="255" r="86" fill="#6bad90"/></g>
  <path d="M310 220L420 145L520 220Z" fill="#d88e70"/><rect x="330" y="220" width="165" height="115" rx="8" fill="#ffedc3"/><rect x="392" y="255" width="44" height="80" rx="18" fill="#bf9074"/>
  <ellipse cx="230" cy="520" rx="155" ry="55" fill="#80c7d6"/><ellipse cx="230" cy="520" rx="125" ry="36" fill="#a2dbe2"/>
  <g fill="#a6b9ae"><ellipse cx="880" cy="490" rx="64" ry="35"/><ellipse cx="710" cy="570" rx="45" ry="28"/></g>
  {[70,370,610,910].map((x,i)=><g key={x} transform={`translate(${x} ${570-i%2*95})`}><path d="M0 35V0M0 25L-15 12" stroke="#60906a" strokeWidth="5"/><circle r="17" fill={i%2?'#e7a4af':'#eabf73'}/><circle r="6" fill="#fff4c8"/></g>)}
</svg>;}
/**
 * Component React `OppositeNumberGame`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function OppositeNumberGame(){
 const mission=useGameMission();
  const audio=useGameAudio();
  const [numbers,setNumbers]=useState<number[]>([]),[round,setRound]=useState(0),[options,setOptions]=useState<number[]>([]);
  const [wrong,setWrong]=useState<number[]>([]),[solved,setSolved]=useState(false),[firstCorrect,setFirstCorrect]=useState(0),[sound,setSound]=useState(true),[feedback,setFeedback]=useState('');
  const n=numbers[round],complete=numbers.length>0&&round===numbers.length;
  function start(){const next=shuffled([-9,-6,-3,-1,0,2,4,7,10,12]);setNumbers(next);setRound(0);setOptions(shuffled(hiddenNumbers));setWrong([]);setSolved(false);setFirstCorrect(0);setFeedback('Quan sát bức tranh và tìm số đối đang ẩn trong đó.');}
  function pick(value:number){if(solved||wrong.includes(value))return;const correct=value===-n;if(sound)audio.effect(correct);if(correct){setSolved(true);if(!wrong.length)setFirstCorrect(s=>s+1);setFeedback(n===0?'✓ Chính xác! Số đối của $0$ là $0$.':`✓ Đúng rồi! $${n}$ và $${-n}$ là hai số đối nhau: $${n}+\\left(${ -n}\\right)=0$.`);}else{setWrong([...wrong,value]);setFeedback(n===0?'Thử lại nhé: số nào cộng với $0$ thì bằng $0$?':'Chưa đúng. Hai số đối nhau có cùng khoảng cách đến $0$ và nằm ở hai phía của $0$. Em thử lại nhé!');}}
  function next(){const i=round+1;setRound(i);setWrong([]);setSolved(false);setFeedback('');}
  return <GameMission mission={mission} title={'Cặp đôi bù trừ'} icon="🌿" intro={'Quan sát bức tranh và tìm số đối đang ẩn trong khu vườn.'} step={`Câu ${round+1}/10`} finished={complete} ready={solved} onStart={start} onAdvance={next}><section className="foundation-game" aria-labelledby="opposite-title">
    <div className="game-heading"><div><span className="game-eyebrow">ÔN KIẾN THỨC CŨ · SỐ ĐỐI CỦA SỐ NGUYÊN</span><h2 id="opposite-title">🌿 Cặp đôi bù trừ</h2><p>Khám phá khu vườn có 20 con số ẩn nấp. Tìm và bấm vào số đối theo yêu cầu!</p></div><button type="button" aria-pressed={sound} onClick={()=>setSound(v=>!v)}>{sound?'🔊 Âm thanh bật':'🔇 Âm thanh tắt'}</button></div>
    <p><MathText>{String.raw`Hai số đối nhau có tổng bằng $0$. Ví dụ: số đối của $5$ là $-5$; số đối của $-5$ là $5$.`}</MathText></p>
    {!numbers.length?<button type="button" className="primary" onClick={start}>Khám phá bức tranh</button>:complete?<div className="game-check" role="status"><h3>🎉 Đã tìm đủ 10 cặp đôi bù trừ!</h3><p>Em chọn đúng ngay lần đầu {firstCorrect}/10 câu. {firstCorrect===10?'Rất tốt!':'Em có thể chơi lại để luyện thêm nhé.'}</p><button type="button" onClick={start}>Chơi lại</button></div>:<>
      <div className="game-controls"><strong>Câu {round+1}/{numbers.length}</strong><span>⭐ {firstCorrect} câu đúng ngay lần đầu</span><button type="button" onClick={start}>Chơi lại</button></div>
      <div className="game-help" style={{textAlign:'center',margin:'16px 0'}}><p>Tìm số đối của</p><div style={{fontSize:36,padding:12}}><MathText>{`$${n}$`}</MathText></div></div>
      <div className="opposite-scene" role="group" aria-label="Khu vườn có 20 số ẩn. Tìm số đối trong tranh."><Garden/>{options.map((value,i)=><button type="button" key={value} style={{left:spots[i][0]+'%',top:spots[i][1]+'%'}} className={`hidden-integer ${solved&&value===-n?'found':''} ${wrong.includes(value)?'missed':''}`} disabled={solved||wrong.includes(value)} aria-label={`Số ${value}`} onClick={()=>pick(value)}><MathText>{`$${value}$`}</MathText>{solved&&value===-n&&<span> ✓</span>}</button>)}</div>
      <div className="game-feedback" role="status" aria-live="polite"><MathText>{feedback}</MathText></div>
      
    </>}
    <p className="hint">Trò chơi để ôn tập, không tính điểm kiểm tra hoặc thay đổi mastery.</p>
  </section></GameMission>;
}
