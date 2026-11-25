"use client";

/**
 * FILE NÀY LÀM GÌ: Trò chơi trục số tương tác giúp học sinh xác định vị trí và khoảng cách số nguyên/thực.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./GameMission, ./MathText, ./useGameAudio
 */
import {useRef,useState} from 'react';
import GameMission,{useGameMission} from './GameMission';
import MathText from './MathText';
import {useGameAudio} from './useGameAudio';
const rounds=[[-3,2,-1,4],[3,-4,1,-2],[-5,5,0,2]];
const ticks=Array.from({length:11},(_,i)=>i-5);
export default function NumberLineGame(){
 const mission=useGameMission();
  const audio=useGameAudio(),drag=useRef<{value:number;x:number;y:number}|null>(null);
  const [round,setRound]=useState(0),[placed,setPlaced]=useState<number[]>([]),[selected,setSelected]=useState<number|null>(null),[feedback,setFeedback]=useState('Chọn một số rồi kéo vào vạch tương ứng trên trục số.'),[sound,setSound]=useState(true),[mistakes,setMistakes]=useState(0),[finished,setFinished]=useState(false);
  const [ghost,setGhost]=useState<{value:number;x:number;y:number}|null>(null);
  const numbers=rounds[round],done=numbers.every(n=>placed.includes(n));
  function drop(value:number,target:number){if(placed.includes(value)||finished)return;const correct=value===target;if(sound)audio.effect(correct);if(correct){setPlaced(p=>p.includes(value)?p:[...p,value]);setSelected(null);setFeedback(`✓ $${value}$ đã về đúng tọa độ!`);}else{setMistakes(m=>m+1);setFeedback(value===0?'Số $0$ ở gốc trục số. Thử lại nhé!':`Chưa đúng. $${value}$ nằm bên ${value<0?'trái':'phải'} số $0$, cách gốc $${Math.abs(value)}$ đơn vị. Em đếm lại các vạch nhé!`);}}
  function restart(){setRound(0);setPlaced([]);setSelected(null);setMistakes(0);setFinished(false);setFeedback('Bắt đầu từ số 0, mỗi vạch cách nhau 1 đơn vị.');}
  function advance(){if(round===rounds.length-1)setFinished(true);else{setRound(r=>r+1);setPlaced([]);setSelected(null);setFeedback('Chặng mới: tìm vị trí cho các số nhé!');}}
  return <GameMission mission={mission} title={'Về đúng tọa độ'} icon="📍" intro={'Kéo số về đúng vạch, hoặc chọn số rồi chọn vạch trên trục số.'} step={`Chặng ${round+1}/3`} finished={finished} ready={done} onStart={restart} onAdvance={advance}><section className="foundation-game" aria-labelledby="number-line-title">
    <div className="game-heading"><div><span className="game-eyebrow">ÔN KIẾN THỨC CŨ · TRỤC SỐ VÀ SỐ NGUYÊN</span><h2 id="number-line-title">📍 Về đúng tọa độ</h2><p>Kéo từng số về đúng vạch trên trục số. Số nhỏ hơn nằm bên trái số lớn hơn.</p></div><button type="button" aria-pressed={sound} onClick={()=>setSound(s=>!s)}>{sound?'🔊 Âm thanh bật':'🔇 Âm thanh tắt'}</button></div>
    {finished?<div className="game-check" role="status"><h3>🎉 Tất cả các số đã về đúng tọa độ!</h3><p>Em hoàn thành 3 chặng, đặt đúng 12 số và thử lại {mistakes} lần.</p><button type="button" onClick={restart}>Chơi lại</button></div>:<>
      <div className="game-controls"><strong>Chặng {round+1}/3 · {placed.length}/{numbers.length} số</strong><button type="button" onClick={restart}>Chơi lại</button></div>
      {ghost&&<div aria-hidden="true" style={{position:"fixed",left:ghost.x,top:ghost.y,transform:"translate(-50%,-120%)",pointerEvents:"none",zIndex:1000,background:"#ede9fe",color:"#4c1d95",padding:12,border:"2px solid #7c3aed",borderRadius:12,fontSize:24}}><MathText>{`$${ghost.value}$`}</MathText></div>}
      <div className="coordinate-tray" role="group" aria-label="Các số cần đặt">{numbers.map(n=><button type="button" key={`${round}:${n}`} disabled={placed.includes(n)} className="coordinate-token" aria-pressed={selected===n} onClick={()=>setSelected(n)} onPointerDown={e=>{if(e.button!==0)return;drag.current={value:n,x:e.clientX,y:e.clientY};setSelected(n);e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const start=drag.current;if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)setGhost({value:start.value,x:e.clientX,y:e.clientY});}} onPointerUp={e=>{setGhost(null);const start=drag.current;drag.current=null;if(!start)return;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-coordinate]');if(target&&e.currentTarget.closest('section')?.contains(target))drop(start.value,Number(target.dataset.coordinate));}} onPointerCancel={()=>{drag.current=null;setGhost(null);}}><MathText>{`$${n}$`}</MathText>{placed.includes(n)&&' ✓'}</button>)}</div>
      <p className="hint">Có thể kéo-thả, hoặc chọn số rồi bấm vào vạch. Dùng Tab và Enter khi chơi bằng bàn phím. Trên màn hình nhỏ, vuốt ngang vùng trục số.</p>
      <div className="coordinate-scroll" tabIndex={0} aria-label="Trục số từ âm 5 đến 5"><div className="coordinate-axis"><div className="coordinate-arrow" aria-hidden="true">→</div>{ticks.map(n=><div className="coordinate-point" key={n}><button type="button" data-coordinate={n} className={`coordinate-slot ${placed.includes(n)?'filled':''}`} aria-label={n===0?'Gốc 0':`Vạch cách gốc ${Math.abs(n)} đơn vị về bên ${n<0?'trái':'phải'}`} onClick={()=>{if(selected!==null)drop(selected,n);else setFeedback('Em chọn một số trước nhé.');}}>{placed.includes(n)?<MathText>{`$${n}$`}</MathText>:<span aria-hidden="true">·</span>}</button><span className="coordinate-tick" aria-hidden="true"/><span className="coordinate-label"><MathText>{n===0?'$0$':n===-5?'$-5$':n===5?'$5$':' '}</MathText></span></div>)}</div></div>
      <div className="game-feedback" role="status" aria-live="polite"><MathText>{feedback}</MathText></div>
      
    </>}
    <p className="hint">Mỗi vạch cách nhau 1 đơn vị. Trò chơi ôn tập không thay đổi điểm kiểm tra hoặc mastery.</p>
  </section></GameMission>;
}
