"use client";

/**
 * FILE NÀY LÀM GÌ: Trò chơi ôn nhanh quy tắc luỹ thừa với phản hồi âm thanh và gợi ý sửa lỗi.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./GameMission, ./MathText, ./useGameAudio
 */
import {useEffect,useState} from 'react';
import GameMission,{useGameMission} from './GameMission';
import MathText from './MathText';
import {useGameAudio} from './useGameAudio';
type Question={text:string;options:string[];answer:number;hint:string};
const aim:Question[]=[
 {text:'Tính $2^3$.',options:['6','8','9'],answer:1,hint:'$2^3=2\\times2\\times2=8$.'},
 {text:String.raw`Tính $\left(-2\right)^2$.`,options:['-4','4','-2'],answer:1,hint:String.raw`$\left(-2\right)\times\left(-2\right)=4$.`},
 {text:String.raw`Tính $\left(-3\right)^3$.`,options:['-27','27','-9'],answer:0,hint:'Ba thừa số âm cho kết quả âm; $3\\times3\\times3=27$.'},
 {text:String.raw`Cơ số của $\left(-5\right)^2$ là gì?`,options:['5','2','-5'],answer:2,hint:'Cơ số là số được nhân lặp lại, ở đây là $-5$.'},
 {text:'Số mũ của $4^3$ là gì?',options:['4','3','12'],answer:1,hint:'Số mũ $3$ cho biết có ba thừa số bằng $4$.'},
 {text:String.raw`Dấu của $\left(-2\right)^4$ là gì?`,options:['\\text{Âm}','\\text{Dương}','0'],answer:1,hint:'Có bốn thừa số âm: ghép thành hai cặp, mỗi cặp cho tích dương.'},
 {text:String.raw`Dấu của $\left(-1\right)^5$ là gì?`,options:['\\text{Âm}','\\text{Dương}','0'],answer:0,hint:'Có số lẻ thừa số âm nên tích âm.'},
 {text:'Tính $5^2$.',options:['10','25','32'],answer:1,hint:'$5^2=5\\times5=25$.'}
];
const tower:Question[]=[
 {text:'Khai triển $2^3$ thành tích nào?',options:[String.raw`2\times3`,String.raw`2\times2\times2`,'2+2+2'],answer:1,hint:'Số mũ cho biết số thừa số bằng cơ số: có ba thừa số bằng $2$.'},
 {text:String.raw`Tích $3\times3\times3\times3$ có bao nhiêu thừa số bằng $3$?`,options:['3','4','12'],answer:1,hint:'Đếm được bốn thừa số bằng $3$.'},
 {text:'Có 3 nhóm, mỗi nhóm gồm 2 thừa số bằng $2$. Tổng cộng có bao nhiêu thừa số?',options:['5','6','8'],answer:1,hint:String.raw`Có $3\times2=6$ thừa số.`},
 {text:String.raw`Viết $2\times2\times2\times2\times2\times2$ dưới dạng lũy thừa.`,options:['6^2','2^3','2^6'],answer:2,hint:'Cơ số $2$ được nhân lặp lại sáu lần: $2^6$.'},
 {text:'Có 2 nhóm, mỗi nhóm gồm 3 thừa số bằng $5$. Có tất cả bao nhiêu thừa số?',options:['6','5','9'],answer:0,hint:String.raw`Có $2\times3=6$ thừa số bằng $5$.`},
 {text:'Sáu thừa số bằng $5$ nhân với nhau được viết gọn thế nào?',options:['6^5','5^6','5^3'],answer:1,hint:'Cơ số là $5$, số mũ là số thừa số: $6$.'},
 {text:String.raw`Tích $\left(-2\right)\times\left(-2\right)\times\left(-2\right)\times\left(-2\right)$ viết gọn thế nào?`,options:[String.raw`\left(-2\right)^4`,'-2^4',String.raw`\left(-2\right)^2`],answer:0,hint:'Mỗi thừa số là $-2$, có bốn thừa số. Phải giữ ngoặc quanh cơ số âm.'},
 {text:'Có 3 nhóm, mỗi nhóm gồm 3 thừa số bằng $3$. Tích viết gọn thế nào?',options:['3^6','9^3','3^9'],answer:2,hint:String.raw`Đếm số thừa số: $3\times3=9$. Tích là $3^9$.`}
];
const pairs=[
 [{expr:'2^3',value:'8'},{expr:'3^2',value:'9'},{expr:String.raw`\left(-2\right)^3`,value:'-8'},{expr:'5^2',value:'25'}],
 [{expr:String.raw`2\times2\times2\times2`,value:'2^4'},{expr:String.raw`3\times3\times3`,value:'3^3'},{expr:String.raw`\left(-2\right)\times\left(-2\right)\times\left(-2\right)`,value:String.raw`\left(-2\right)^3`},{expr:String.raw`5\times5`,value:'5^2'}]
];
export default function PowerReviewGame({mode}:{mode:'aim'|'match'|'tower'}){
 const mission=useGameMission();
 const audio=useGameAudio();const [index,setIndex]=useState(0),[picked,setPicked]=useState<number|null>(null),[sound,setSound]=useState(true),[matched,setMatched]=useState<number[]>([]),[selected,setSelected]=useState<number|null>(null),[feedback,setFeedback]=useState(''),[ghost,setGhost]=useState<{id:number;x:number;y:number}|null>(null);
 const questions=mode==='tower'?tower:aim,finished=mode==='match'?index===pairs.length:index===questions.length,q=questions[Math.min(index,questions.length-1)],items=pairs[Math.min(index,1)];
 const done=mode==='match'?matched.length===items.length:picked===q.answer;
 function advance(){setIndex(n=>n+1);setPicked(null);setMatched([]);setSelected(null);setFeedback('');}
 useEffect(()=>{if(!mission.autoRun)return;if(!done||finished)return;const t=setTimeout(advance,2000);return()=>clearTimeout(t);},[mission.autoRun,done,finished,index]);
 function reset(){setIndex(0);setPicked(null);setMatched([]);setSelected(null);setFeedback('');setGhost(null);}
 function shoot(i:number){if(picked!==null)return;setPicked(i);if(sound)audio.effect(i===q.answer);}
 function match(id:number,value:string){if(finished||matched.includes(id))return;const ok=items[id].value===value;if(sound)audio.effect(ok);if(ok){setMatched(m=>m.includes(id)?m:[...m,id]);setSelected(null);setFeedback('✓ Đúng giá trị! Đã ghép thêm một cặp.');}else setFeedback(index===0?'Chưa đúng. Viết lũy thừa thành tích rồi tính lại.':'Chưa đúng. Xác định thừa số lặp lại làm cơ số, đếm số thừa số để tìm số mũ.');}
 const title=mode==='aim'?'🎯 Bắn bia lũy thừa':mode==='match'?'🧩 Ghép thẻ thần tốc':'🏰 Leo tháp lũy thừa';
 return <GameMission mission={mission} title={title} icon={mode==='aim'?'🎯':mode==='match'?'🧩':'🏰'} intro={mode==='aim'?'Chọn bia mang đáp án đúng để ôn cơ số, số mũ và giá trị của lũy thừa.':mode==='match'?'Ghép mỗi thẻ phép tính với thẻ có cùng giá trị. Hoàn thành hai chặng để về đích.':'Chọn đáp án đúng về cách viết lũy thừa để chinh phục từng tầng tháp.'} step={`Thử thách ${index+1}/${mode==='match'?2:8}`} finished={finished} ready={done} onStart={reset} onAdvance={advance}><section className="foundation-game" aria-labelledby={`power-${mode}`}><div className="game-heading"><div><span className="game-eyebrow">ÔN KIẾN THỨC CŨ · SỐ NGUYÊN VÀ LŨY THỪA</span><h2 id={`power-${mode}`}>{title}</h2><p>{mode==='match'?'Ghép lũy thừa với giá trị, rồi ghép tích các thừa số bằng nhau với cách viết lũy thừa.':mode==='aim'?'Bắn vào bia mang đáp án đúng. Ôn giá trị, cơ số, số mũ và dấu của lũy thừa số nguyên.':'Leo tháp bằng cách khai triển, đếm thừa số theo nhóm và viết tích thành lũy thừa.'} Không giới hạn thời gian.</p></div><button type="button" aria-pressed={sound} onClick={()=>setSound(s=>!s)}>{sound?'🔊 Âm thanh bật':'🔇 Âm thanh tắt'}</button></div>
 {mode==='tower'&&<div className="power-tower" aria-label={`Đã leo ${finished?8:index+(done?1:0)} tầng`}>{Array.from({length:8},(_,i)=><div key={i} className={i<index+(done?1:0)||finished?'floor-done':''}>{i<index+(done?1:0)||finished?'🚩':'🪟'} Tầng {i+1}</div>)}</div>}
 {finished?<div className="game-check" role="status"><h3>🎉 {mode==='match'?'Đã ghép đủ 8 cặp!':mode==='tower'?'Đã lên đỉnh tháp!':'Đã bắn trúng đủ 8 bia!'}</h3><button type="button" onClick={reset}>Chơi lại</button></div>:<>
 <div className="game-controls"><strong>{mode==='match'?`Chặng ${index+1}/2 · ${matched.length}/4 cặp`:`Thử thách ${index+1}/8`}</strong><button type="button" onClick={reset}>Chơi lại</button></div>
 {mode==='aim'&&<p className="aim-instruction">🏹 Di chuyển tâm ngắm đến bia rồi bấm để bắn. Trên điện thoại, chạm vào bia.</p>}{mode==='match'?<><div className="power-match"><div>{items.map((p,id)=><button type="button" className="power-card" key={`${index}:${id}`} disabled={matched.includes(id)} aria-pressed={selected===id} onClick={()=>setSelected(id)} onPointerDown={e=>{if(e.button!==0)return;setSelected(id);setGhost({id,x:e.clientX,y:e.clientY});e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))setGhost({id,x:e.clientX,y:e.clientY});}} onPointerCancel={()=>setGhost(null)} onPointerUp={e=>{setGhost(null);const el=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-power-value]');if(el&&e.currentTarget.closest('section')?.contains(el))match(id,el.dataset.powerValue!);}}><MathText>{`$${p.expr}$`}</MathText>{matched.includes(id)&&' ✓'}</button>)}</div><div>{[2,0,3,1].map(id=><button type="button" className="power-card power-value" key={`${index}:${id}`} data-power-value={items[id].value} disabled={matched.includes(id)} onClick={()=>{if(selected!==null)match(selected,items[id].value);else setFeedback('Chọn thẻ phép tính trước nhé.');}}><MathText>{`$${items[id].value}$`}</MathText>{matched.includes(id)&&' ✓'}</button>)}</div></div>{ghost&&<div className="cargo-ghost" aria-hidden="true" style={{left:ghost.x,top:ghost.y}}><MathText>{`$${items[ghost.id].expr}$`}</MathText></div>}<p className="hint">Kéo thẻ sang giá trị bên phải, hoặc chọn thẻ rồi chọn giá trị.</p><div role="status" className="game-feedback">{feedback}{done&&mission.autoRun&&<p>{mission.autoRun?'Tự chuyển sau 2 giây…':'Bấm Tiếp theo khi đã sẵn sàng.'}</p>}</div></>:<><div className="game-help power-question"><MathText>{q.text}</MathText></div><div className={`fraction-signs ${mode==='aim'?'power-targets':''}`}>{q.options.map((o,i)=><button type="button" key={`${index}:${i}`} className={`game-tile tile-${i} ${done&&i===q.answer?'paired':''} ${mode==='aim'&&picked===i?'target-shot':''}`} disabled={picked!==null} onClick={()=>shoot(i)}><MathText>{`$${o}$`}</MathText>{mode==='aim'&&picked===i&&<span className="target-arrow" aria-hidden="true">➶</span>}</button>)}</div>{picked!==null&&<div className="game-feedback" role="status"><strong>{done?'✓ Chính xác!':'Chưa đúng — thử lại nhé.'}</strong><p><MathText>{q.hint}</MathText></p>{done?<p>{mission.autoRun?'Tự chuyển sau 2 giây…':'Bấm Tiếp theo khi đã sẵn sàng.'}</p>:<button type="button" onClick={()=>setPicked(null)}>Thử lại</button>}</div>}</>}
 </>}
 <p className="hint">Chỉ ôn kiến thức đã học. Kết quả trò chơi không thay đổi điểm kiểm tra hoặc mastery.</p></section></GameMission>;
}
