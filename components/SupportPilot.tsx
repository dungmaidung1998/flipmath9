'use client';

/**
 * FILE NÀY LÀM GÌ: Giao diện học sinh thực hiện hoạt động hỗ trợ thử nghiệm theo nhánh can thiệp.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: nhận props và gọi API lưu tiến độ thử nghiệm
 * GỌI TỚI: @/lib/supportPilot, @/components/tro-choi-nen/amThanh, @/components/truc-quan/PhanHoiDung
 */
import { phat, chuanBiAmHieuUng } from '@/components/tro-choi-nen/amThanh';
import NutAmHieuUng from '@/components/truc-quan/NutAmHieuUng';
import { TichVang } from '@/components/truc-quan/PhanHoiDung';
import {useEffect,useRef,useState} from 'react';
import type {Arm,PilotState} from '@/lib/supportPilot';
import {useActiveQuizTime} from './useActiveQuizTime';
import MathText from './MathText';
import LearningScreen from './LearningScreen';
import DauTrang from './DauTrang';
import { hinhNhanVat } from '@/lib/minhHoa';
type Session={savedChoice?:number;id:string;recovery_id:string;revision:number;state:PilotState;question:{id:string;stem:string;options:string[]}|null;activity:{intro:string;total:number}|null};
type Data={records:{recovery_id:string;created_at:string}[];sessions:Session[];eligible:Arm[];titles:Record<Arm,string>};
export default function SupportPilot(){
 const [data,setData]=useState<Data|null>(null),[session,setSession]=useState<Session|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[feedback,setFeedback]=useState('');
 const [choice,setChoice]=useState<number|null>(null),[trail,setTrail]=useState<Session[]>([]),[viewIndex,setViewIndex]=useState<number|null>(null);
 const lock=useRef(false),seconds=useActiveQuizTime(!!session&&viewIndex===null);
 useEffect(()=>{
  if(!session?.question)return;
  try{const saved=sessionStorage.getItem(`support-choice:${session.id}:${session.revision}`);const value=saved===null?null:Number(saved);setChoice(value!==null&&Number.isInteger(value)&&value>=0&&value<session.question.options.length?value:null);}catch{}
 },[session?.id,session?.revision]);
 function choose(value:number){setChoice(value);if(session)try{sessionStorage.setItem(`support-choice:${session.id}:${session.revision}`,String(value));}catch{}}
 async function load(){setError('');try{const res=await fetch('/api/ho-tro',{cache:'no-store'});const d=await res.json();if(!res.ok)throw Error(d.error);setData(d);setSession(old=>old?d.sessions.find((s:Session)=>s.id===old.id)??null:null);}catch(e){setError(e instanceof Error?e.message:'Chưa tải được dữ liệu.');}}
 useEffect(()=>{void load();},[]);
 async function send(action:string,choice?:number|Arm,recoveryId?:string){
  if(action==='answer')chuanBiAmHieuUng();
  if(lock.current)return;lock.current=true;setBusy(true);setError('');setFeedback('');
  const previous=session;
  try{const res=await fetch('/api/ho-tro',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,choice,recoveryId,id:session?.id,revision:session?.revision,seconds:seconds.current})});const d=await res.json();if(!res.ok)throw Error(d.error);setSession(d.session);seconds.current=0;setChoice(null);if(previous?.question&&action==='answer'&&previous.question.id!==d.session.question?.id)setTrail(old=>[...old,{...previous,savedChoice:typeof choice==='number'?choice:undefined}]);
   setData(old=>old?{...old,sessions:[d.session,...old.sessions.filter(s=>s.id!==d.session.id)]}:old);
   if(previous?.state.phase==='activity'&&action==='answer'){const evidence=d.session.state.rounds.at(-1)?.activity.at(-1);if(evidence?.correct)phat('dung');setFeedback(evidence?.correct?'Đúng rồi! Em tiếp tục nhé.':'Chưa đúng. Em xem lại hướng dẫn và thử một lần nữa.');}
  }catch(e){setError(e instanceof Error?e.message:'Chưa lưu được.');}finally{setBusy(false);lock.current=false;}
 }
 const display=viewIndex===null?session:trail[viewIndex];
 const s=display?.state,r=s?.rounds.at(-1),completed=r?.activity.filter(e=>e.correct).length??0;
 const content=<div className="wrap">{!session&&<DauTrang gon tieuDe="Chọn cách ôn phù hợp" phu="Ôn phép cộng phân số, rồi thử câu mới để xem em đã hiểu đến đâu." hinh={hinhNhanVat('goi-y')} tranh="kien-thuc-nen" canh="doi-xanh"><p className="dau-trang__dia-danh"><span>🧱 Kiến thức nền</span><span>Hỗ trợ từng bước</span></p></DauTrang>}
 {error&&<p role="alert">{error} <button onClick={load} disabled={busy}>Tải lại</button></p>}
 {!data&&!error&&<p role="status">Đang tải…</p>}
 {data&&!session&&<>
 <p>Hoạt động được giáo viên duyệt: {data.eligible.length}/3. Mỗi hồ sơ có tối đa hai lượt hỗ trợ.</p>
 {data.sessions.map(row=><p key={row.id}><button onClick={()=>{setSession(row);seconds.current=0;setFeedback('');setTrail([]);setViewIndex(null);setChoice(null);}}>Mở lượt ôn · {({probe:'Kiểm tra nền',activity:'Đang ôn',check:'Thử câu mới',waiting:'Chờ kiểm tra duy trì',done:'Đã kiểm tra duy trì',teacher:'Cần xem lại'} as const)[row.state.phase]}</button>{row.state.dueAt&&` · Lịch kiểm tra: ${new Date(row.state.dueAt).toLocaleString('vi-VN')}`}</p>)}
 {!data.sessions.length&&data.records.slice(0,1).map(rec=><p key={rec.recovery_id}><button disabled={busy||data.eligible.length!==3} onClick={()=>send('start',undefined,rec.recovery_id)}>Bắt đầu ôn từ bài làm {new Date(rec.created_at).toLocaleDateString('vi-VN')}</button></p>)}
 {!data.records.length&&!data.sessions.length&&<p>Chưa có bài làm ghi nhận lỗi cộng cả tử và mẫu để mở lượt ôn này.</p>}
 </>}
 {display&&s&&data&&<section className="card">
 
 <h2>{s.phase==='probe'?'Hai câu kiểm tra nền':s.phase==='activity'&&r?data.titles[r.arm]:s.phase==='check'?'Thử câu mới — tự làm, không dùng gợi ý':'Kết quả lượt hỗ trợ'}</h2>
 {r&&<p>{r.reason}{r.switched?' Em đã chọn thử cách khác.':''}</p>}
 {display.activity&&r&&<>
 <MathText>{display.activity.intro}</MathText>
 {r.arm==='visual'&&<div style={{margin:'20px 0'}}>{[3,2,5].map((n,i)=><div key={n} style={{marginBottom:12}}><p>{['1/2 = 3/6','1/3 = 2/6','1/2 + 1/3 = 5/6'][i]}</p><div aria-label={`${n} phần được tô trong 6 phần bằng nhau`} style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',maxWidth:420,height:42}}>{Array.from({length:6},(_,j)=><span key={j} style={{border:'1px solid #334155',background:j<n?(i===1?'#f59e0b':'#2563eb'):'#fff'}}/>)}</div></div>)}</div>}
 {r.arm==='game'&&<p style={{fontSize:38}} aria-label={`Đã nối ${completed} toa`}>🚂 {Array.from({length:completed},(_,i)=><span key={i}>🚃</span>)}</p>}
 <p>Bước {completed+1}/{display.activity.total}</p>
 {!r.switched&&viewIndex===null&&<details><summary>Thử cách khác</summary>{data.eligible.filter(a=>a!==r.arm).map(a=><button key={a} disabled={busy} onClick={()=>send('switch',a)}>{data.titles[a]}</button>)}</details>}
 </>}
 <NutAmHieuUng/><p role="status" aria-live="polite">{feedback.startsWith('Đúng rồi') && <TichVang/>} {feedback}</p>
 {display.question&&<div key={display.question.id}><p style={{fontSize:22}}><MathText>{display.question.stem}</MathText></p><div style={{display:'flex',flexWrap:'wrap',gap:12}}>{display.question.options.map((text,i)=><button key={i} disabled={busy||viewIndex!==null} style={{minHeight:48,padding:'12px 20px',fontSize:20,whiteSpace:'normal'}} aria-pressed={(viewIndex===null?choice:display.savedChoice)===i} className={(viewIndex===null?choice:display.savedChoice)===i?'picked':''} onClick={()=>choose(i)}><MathText>{text}</MathText></button>)}</div></div>}
 {s.phase==='waiting'&&!display.question&&<><p>Em đã làm đúng hai câu mới. Hẹn em kiểm tra lại vào {new Date(s.dueAt!).toLocaleString('vi-VN')}.</p><button disabled={busy} onClick={load}>Kiểm tra lịch</button></>}
 {s.phase==='waiting'&&display.question&&<p>Đây là câu kiểm tra duy trì. Em tự làm trước khi ôn lại nhé.</p>}
 {s.phase==='teacher'&&<><p>Em còn cần hỗ trợ. Kết quả đã được lưu để giáo viên xem xét.</p>{viewIndex===null&&s.rounds.length===1&&data.eligible.filter(a=>a!==r?.arm).map(a=><button key={a} disabled={busy} onClick={()=>send('retry',a)}>Thử {data.titles[a]}</button>)}</>}
 {s.phase==='done'&&<p>{s.retention?.correct?'Em đã trả lời đúng câu kiểm tra duy trì.':'Câu kiểm tra duy trì chưa đúng. Em nhờ giáo viên cùng xem lại nhé.'}</p>}
 {(s.phase==='waiting'||s.phase==='teacher'||s.phase==='done')&&s.rounds.map((round,i)=><p key={i}>Lượt {i+1} · {data.titles[round.arm]} · Câu mới đúng: {round.checks.filter(e=>e.correct).length}/{round.checks.length}</p>)}
 
 </section>}
 </div>;
 if(!session)return content;
 return <LearningScreen title="Ôn có hỗ trợ" step={viewIndex!==null?'Xem lại bước đã gửi':s?.phase==='probe'?`Kiểm tra nền ${(s?.probes.length??0)+1}/2`:s?.phase==='check'?`Câu mới ${(r?.checks.length??0)+1}/2`:s?.phase==='activity'?`Ôn tập · Bước ${completed+1}`:'Kết quả'}
 onBack={()=>{if(viewIndex!==null){if(viewIndex>0)setViewIndex(viewIndex-1);else {setSession(null);setViewIndex(null);setTrail([]);}}else if(trail.length)setViewIndex(trail.length-1);else setSession(null);}}
 onNext={()=>{if(viewIndex!==null){setViewIndex(viewIndex+1<trail.length?viewIndex+1:null);}else if(display?.question&&choice!==null)void send('answer',choice);else {setSession(null);setTrail([]);}}}
 nextLabel={viewIndex===null&&!display?.question?'Hoàn thành':'Tiếp theo →'} busy={busy} disabled={viewIndex===null&&!!display?.question&&choice===null} exitHref="/ho-tro"
 status={viewIndex!==null?'Xem lại không thay đổi câu trả lời đã gửi.':error?'Chưa lưu được. Lựa chọn vẫn được giữ để thử lại.':display?.question?(choice===null?'Em chọn một đáp án để tiếp tục.':'Đã chọn · Bấm Tiếp theo để lưu câu trả lời.'):'Kết quả đã lưu.'}>{content}</LearningScreen>;
}
