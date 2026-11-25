'use client';

/**
 * FILE NÀY LÀM GÌ: Trò chơi xây nền tảng số học và biểu thức ngắn trước khi vào bài chuẩn bị.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./GameMission, ./MathText, ./useGameAudio
 */
import {useEffect,useRef,useState} from 'react';
import GameMission,{useGameMission} from './GameMission';
import MathText from './MathText';
import {useGameAudio} from './useGameAudio';

const pairs = [
  ['3',String.raw`\dfrac{3}{1}`,'Mọi số nguyên đều viết được thành phân số có mẫu là 1.'],
  ['-2',String.raw`-\dfrac{2}{1}`,'Giữ nguyên dấu âm khi viết số nguyên thành phân số.'],
  ['0',String.raw`\dfrac{0}{5}`,'Phân số có tử bằng 0 và mẫu khác 0 có giá trị bằng 0.'],
  ['0{,}5',String.raw`\dfrac{1}{2}`,String.raw`$0{,}5=\dfrac{5}{10}=\dfrac{1}{2}$.`],
  ['-0{,}75',String.raw`-\dfrac{3}{4}`,String.raw`$-0{,}75=-\dfrac{75}{100}=-\dfrac{3}{4}$.`],
  [String.raw`1\dfrac{1}{2}`,String.raw`\dfrac{3}{2}`,String.raw`$1\dfrac{1}{2}=\dfrac{1\times2+1}{2}=\dfrac{3}{2}$.`],
];
const checks = [
  {q:'Viết số $-4$ thành phân số.',options:[String.raw`-\dfrac{4}{1}`,String.raw`\dfrac{1}{4}`,String.raw`\dfrac{4}{1}`],correct:0,hint:'Số nguyên viết thành phân số có mẫu 1; giữ nguyên dấu.'},
  {q:'Phân số nào bằng $-0{,}75$?',options:[String.raw`-\dfrac{3}{100}`,String.raw`-\dfrac{3}{4}`,String.raw`\dfrac{3}{4}`],correct:1,hint:'Viết thành -75/100 rồi rút gọn cả tử và mẫu cho 25.'},
  {q:String.raw`Đổi $1\dfrac{2}{3}$ thành phân số.`,options:[String.raw`\dfrac{3}{3}`,String.raw`\dfrac{2}{3}`,String.raw`\dfrac{5}{3}`],correct:2,hint:'Tử số mới = phần nguyên × mẫu số + tử số; giữ mẫu số.'},
];
function shuffle(){const deck=Array.from({length:12},(_,i)=>i);for(let i=11;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}

export default function FoundationGame(){
 const mission=useGameMission();
 const [checkIndex,setCheckIndex]=useState(0);
  const gameAudio=useGameAudio();
  const [deck,setDeck]=useState<number[]>([]),[opened,setOpened]=useState<number[]>([]),[matched,setMatched]=useState<number[]>([]);
  const [showAll,setShowAll]=useState(false),[sound,setSound]=useState(true),[turns,setTurns]=useState(0),[misses,setMisses]=useState(0);
  const [feedback,setFeedback]=useState('Lật hai thẻ có cùng giá trị.'),[help,setHelp]=useState(false),[answers,setAnswers]=useState<Record<number,number>>({}),[submitted,setSubmitted]=useState(false);
  const timer=useRef<ReturnType<typeof setTimeout>>(),locked=useRef(false);
  useEffect(()=>()=>{clearTimeout(timer.current);},[]);
  function play(ok:boolean){if(sound)gameAudio.effect(ok);}
  function reset(){setCheckIndex(0);gameAudio.begin();clearTimeout(timer.current);locked.current=false;setDeck(shuffle());setOpened([]);setMatched([]);setTurns(0);setMisses(0);setFeedback('Lật hai thẻ có cùng giá trị.');setAnswers({});setSubmitted(false);}
  function pick(id:number){if(locked.current||opened.includes(id)||matched.includes(Math.floor(id/2)))return;const next=[...opened,id];setOpened(next);if(next.length<2)return;locked.current=true;setTurns(v=>v+1);const pair=Math.floor(id/2),ok=Math.floor(next[0]/2)===pair;play(ok);if(ok){setMatched(m=>[...m,pair]);setFeedback('✓ Ghép đúng! '+pairs[pair][2]);}else{setMisses(v=>v+1);setFeedback('Chưa bằng nhau. Em thử đổi hai số về phân số để so sánh.');}}
  useEffect(()=>{if(opened.length!==2||!mission.canRun)return;const ok=Math.floor(opened[0]/2)===Math.floor(opened[1]/2);timer.current=setTimeout(()=>{setOpened([]);locked.current=false;},ok?650:1500);return()=>clearTimeout(timer.current);},[opened,mission.canRun]);
  const complete=matched.length===6;
  function advanceCheck(){if(checkIndex<2)setCheckIndex(i=>i+1);else {setSubmitted(true);play(checks.every((q,i)=>answers[i]===q.correct));}}
  return <GameMission mission={mission} title={'Lật thẻ — Tìm số bằng nhau'} icon="✨" intro={'Lật hai thẻ cùng giá trị để tìm đủ 6 cặp, rồi tự kiểm tra bằng ba câu ngắn.'} step={complete?`Câu kiểm tra ${checkIndex+1}/3`:`Đã ghép ${matched.length}/6 cặp`} finished={complete&&submitted} ready={complete&&answers[checkIndex]!==undefined} onStart={reset} onAdvance={advanceCheck}><section className="foundation-game" aria-labelledby="foundation-title">
    <div className="game-heading"><div><span className="game-eyebrow">KHỞI ĐỘNG · ÔN KIẾN THỨC NỀN</span><h2 id="foundation-title">✨ Lật thẻ — Tìm số bằng nhau</h2><p>6 cặp số, nhiều cách viết. Không giới hạn thời gian!</p></div><button type="button" aria-pressed={sound} onClick={()=>setSound(v=>!v)}>{sound?'🔊 Âm thanh bật':'🔇 Âm thanh tắt'}</button></div>
    <button type="button" aria-pressed={gameAudio.music} onClick={gameAudio.toggleMusic}>{gameAudio.music?'♫ Nhạc nền bật':'♫ Nhạc nền tắt'}</button>
    {!deck.length?<button className="primary" onClick={reset}>Bắt đầu chơi ✨</button>:<>
    <div className="game-controls"><strong>⭐ {matched.length}/6 cặp</strong><span>{turns} lượt ghép</span><button aria-pressed={showAll} onClick={()=>setShowAll(v=>!v)}>{showAll?'Chơi lật thẻ':'Mở tất cả để ghép'}</button><button onClick={reset}>Chơi lại</button><button onClick={()=>setHelp(v=>!v)}>{help?'Ẩn hướng dẫn':'Nhắc lại cách đổi'}</button></div>
    {help&&<div className="game-help"><p><MathText>{String.raw`Số nguyên: $a=\dfrac{a}{1}$. Số thập phân: $0{,}5=\dfrac{5}{10}$. Hỗn số: $1\dfrac{1}{2}=\dfrac{1\times2+1}{2}$.`}</MathText></p></div>}
    <div className="game-grid" hidden={complete}>{deck.map((id,index)=>{const pair=Math.floor(id/2),done=matched.includes(pair),visible=done||showAll||opened.includes(id);return <button key={id} type="button" className={`game-tile tile-${index%4} ${visible?'revealed':''} ${done?'paired':''}`} disabled={done} aria-pressed={opened.includes(id)} aria-label={visible?undefined:`Thẻ úp ${index+1}`} onClick={()=>pick(id)}>{visible?<><MathText>{'$'+pairs[pair][id%2]+'$'}</MathText>{done&&<span className="pair-mark">✓</span>}</>:<span className="tile-back" aria-hidden="true">✦<small>{index+1}</small></span>}</button>;})}</div>
    <div className="game-feedback" role="status" aria-live="polite"><MathText>{feedback}</MathText></div>
    {misses>=3&&!help&&<p>Em có thể mở tất cả thẻ hoặc bấm “Nhắc lại cách đổi”.</p>}
    {complete&&<div className="game-check"><h3>🎉 Đã ghép đủ! Thử 3 câu để kiểm tra điều vừa ôn.</h3><p>Lượt lật thẻ không dùng để đánh giá mức làm chủ.</p><form onSubmit={e=>{e.preventDefault();if(Object.keys(answers).length<3)return;setSubmitted(true);play(checks.every((q,i)=>answers[i]===q.correct));}}>{checks.map((q,i)=>i===checkIndex&&<fieldset key={i} disabled={submitted}><legend><MathText>{q.q}</MathText></legend>{q.options.map((o,j)=><label key={j} className="game-answer"><input type="radio" name={`foundation-${i}`} required checked={answers[i]===j} onChange={()=>setAnswers(a=>({...a,[i]:j}))}/><MathText>{'$'+o+'$'}</MathText></label>)}{submitted&&<p>{answers[i]===q.correct?'✓ Chính xác!':'Ôn lại: '+q.hint}</p>}</fieldset>)}</form>{submitted&&<div role="status"><p>Em làm đúng {checks.filter((q,i)=>answers[i]===q.correct).length}/3 câu. {checks.every((q,i)=>answers[i]===q.correct)?'Sẵn sàng vào bài học!':'Đọc gợi ý rồi thử lại nhé.'}</p><button onClick={()=>{setSubmitted(false);setAnswers({});setCheckIndex(0);}}>Thử lại 3 câu</button></div>}</div>}
    </>}

  </section></GameMission>;
}

