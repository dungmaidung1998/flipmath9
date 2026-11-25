"use client";

/**
 * FILE NÀY LÀM GÌ: Trò chơi ghép toa tàu phân số giúp củng cố quy đồng, rút gọn và đổi dạng phân số.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./GameMission, ./MathText, ./useGameAudio
 */
import {useEffect,useState} from 'react';
import GameMission,{useGameMission} from './GameMission';
import MathText from './MathText';
import {useGameAudio} from './useGameAudio';
// Each round has its own target denominator; earned wagons retain their answers.
const stages=[[1,2,6],[2,5,10],[3,4,8],[1,3,12],[5,6,18],[3,5,15],[2,7,14],[3,8,24],[7,10,30],[5,12,36]].map(([a,b,den],i)=>{
  const answer=a*(den/b);
  return {title:`Lượt ${i+1}/10 · ${i<3?'Tìm tử số còn thiếu':'Tìm phân số bằng nhau'}`,den,parts:[[a,b]],cargo:[answer-1,answer,answer+1,answer+2].map((_,j)=>[answer-1,answer,answer+1,answer+2][(j+i)%4]),numerator:i<3};
});
const frac=(a:number|string,b:number)=>String.raw`\dfrac{${a}}{${b}}`;
export default function FractionTrain(){
 const mission=useGameMission();
  const audio=useGameAudio();const [stage,setStage]=useState(0),[loaded,setLoaded]=useState<Record<number,number>>({}),[selected,setSelected]=useState<number|null>(null),[sound,setSound]=useState(true),[feedback,setFeedback]=useState('Chọn kiện hàng rồi đặt vào toa, hoặc kéo kiện hàng vào toa.'),[finished,setFinished]=useState(false);
  const [ghost,setGhost]=useState<{value:number;x:number;y:number}|null>(null);
  const data=stages[stage],done=data.parts.every((_,i)=>loaded[i]!==undefined);
  const wagonCount=stage+(done?1:0);
  function advance(){
      if(stage===stages.length-1)setFinished(true);
      else{
        setStage(s=>s+1);setLoaded({});setSelected(null);setGhost(null);
        setFeedback('Toa mới! Quan sát mẫu số ở đầu tàu nhé.');
      }
    }
 useEffect(()=>{if(!mission.autoRun)return;
    if(!done||finished)return;
    const timer=setTimeout(advance,3000);
    return ()=>clearTimeout(timer);
  },[mission.autoRun,done,finished,stage]);

  function place(value:number,index:number){if(done||loaded[index]!==undefined)return;const [a,b]=data.parts[index],factor=data.den/b,correct=value===a*factor;if(sound)audio.effect(correct);if(correct){setLoaded(p=>({...p,[index]:value}));setSelected(null);setFeedback(`✓ Đúng rồi! $${frac(a,b)}=${frac(value,data.den)}$. Nhân cả tử và mẫu với $${factor}$.`);}else setFeedback(`Thử lại nhé: từ mẫu $${b}$ lên $${data.den}$ cần nhân $${factor}$. Tử số $${a}$ cũng phải nhân $${factor}$.`);}
  function reset(){setStage(0);setLoaded({});setSelected(null);setGhost(null);setFinished(false);setFeedback('Chọn kiện hàng rồi đặt vào toa, hoặc kéo kiện hàng vào toa.');}
  return <GameMission mission={mission} title={'Đoàn tàu cùng mẫu'} icon="🚂" intro={'Chọn hoặc kéo kiện hàng vào toa có phân số bằng nhau. Mỗi lượt đúng nối thêm một toa.'} step={`Toa ${stage+1}/10`} finished={finished} ready={done} onStart={reset} onAdvance={advance}><section className="foundation-game" aria-labelledby="train-title">
    <div className="game-heading"><div><span className="game-eyebrow">ÔN KIẾN THỨC NỀN · PHÂN SỐ BẰNG NHAU VÀ QUY ĐỒNG</span><h2 id="train-title">🚂 Đoàn tàu cùng mẫu</h2><p>Mỗi lượt đúng nối thêm 1 toa. Mỗi lượt có một mẫu số đích khác nhau. Hoàn thành 10 lượt để nối đủ 10 toa!</p></div><button type="button" aria-pressed={sound} onClick={()=>setSound(s=>!s)}>{sound?'🔊 Âm thanh bật':'🔇 Âm thanh tắt'}</button></div>
    <p className="train-count" role="status">🚂 Đã nối {wagonCount}/10 toa</p>
    <div className="earned-train-window" tabIndex={0} aria-label={`Đoàn tàu đã có ${wagonCount} toa, có thể cuộn ngang để xem`}><div className="earned-train">
      <div className="train-engine"><span aria-hidden="true">🚂</span><strong>Đoàn tàu của em</strong></div>
      {stages.slice(0,wagonCount).map((q,i)=><div className="earned-wagon" key={i}><strong>Toa {i+1}</strong><MathText>{`$${frac(q.parts[0][0]*(q.den/q.parts[0][1]),q.den)}$`}</MathText><span aria-hidden="true">●────●</span></div>)}
    </div><div className="train-rails" aria-hidden="true"/></div>
    {finished?<div className="game-check" role="status"><h3>🎉 Đoàn tàu đã đến đích!</h3><p>Em đã nối đủ 10 toa! Em đã luyện đưa phân số về nhiều mẫu số khác nhau.</p><button type="button" onClick={reset}>Chơi lại</button></div>:<>
    <div className="game-controls"><strong>{data.title}</strong><button type="button" onClick={reset}>Chơi lại</button></div>
    <p>{data.numerator?'Chọn tử số để hoàn thành phân số trên toa.':'Chọn kiện hàng có phân số bằng phân số trên toa.'} Mẫu số cần đạt là <MathText>{`$${data.den}$`}</MathText>.</p>
    <div className="train-window"><div className="fraction-train">
      <div className="train-engine"><span aria-hidden="true">🚂</span><strong>Mẫu số đích</strong><MathText>{`$${data.den}$`}</MathText></div>
      {data.parts.map(([a,b],i)=><button type="button" key={`${stage}:${i}`} className={`train-wagon ${loaded[i]!==undefined?'loaded':''}`} data-train-wagon={i} disabled={loaded[i]!==undefined} aria-label={`Đặt hàng vào toa ${i+1}, phân số ${a} phần ${b}`} onClick={()=>{if(selected!==null)place(selected,i);else setFeedback('Chọn kiện hàng ở bên dưới trước nhé!');}}><span>Kiện hàng cho toa {stage+1}</span><MathText>{`$${frac(a,b)}=${frac(loaded[i]??'?',data.den)}$`}</MathText><small>{loaded[i]!==undefined?'✓ Đã đủ hàng':'Thả kiện hàng vào đây'}</small></button>)}
    </div><div className="train-rails" aria-hidden="true"/></div>
    <div className="train-cargo" role="group" aria-label="Kiện hàng">{data.cargo.map(value=><button type="button" className="cargo-box" key={`${stage}:${value}`} disabled={done||Object.values(loaded).includes(value)} aria-pressed={selected===value} onClick={()=>setSelected(value)} onPointerDown={e=>{if(e.button!==0)return;setSelected(value);setGhost({value,x:e.clientX,y:e.clientY});e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))setGhost({value,x:e.clientX,y:e.clientY});}} onPointerCancel={()=>setGhost(null)} onPointerUp={e=>{setGhost(null);const target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-train-wagon]');if(target&&e.currentTarget.closest('section')?.contains(target))place(value,Number(target.dataset.trainWagon));}}><span aria-hidden="true">📦</span><MathText>{`$${data.numerator?value:frac(value,data.den)}$`}</MathText></button>)}</div>
    {ghost&&<div className="cargo-ghost" aria-hidden="true" style={{left:ghost.x,top:ghost.y}}><MathText>{`$${data.numerator?ghost.value:frac(ghost.value,data.den)}$`}</MathText></div>}
    <p className="hint">Trên điện thoại hoặc bàn phím: chọn kiện hàng rồi chọn toa. Không giới hạn thời gian.</p>
    <div className="game-feedback" role="status" aria-live="polite"><MathText>{feedback}</MathText>{done&&<p>🚂 Một toa mới đã được nối vào đoàn tàu phía trên!</p>}</div>
    {done&&mission.autoRun&&<p className="hint">{stage===stages.length-1?'Tự động xem tổng kết sau 3 giây…':'Tự động chuyển sang toa mới sau 3 giây…'}</p>}
    </>}
    <p className="hint">Nhân cả tử và mẫu với cùng một số khác 0 để được phân số bằng nhau. Trò chơi không thay đổi điểm kiểm tra hoặc mastery.</p>
  </section></GameMission>;
}

