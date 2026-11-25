'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/tro-choi-nen/amThanh, ./DuongCauHoi, ./DeCauHoi, ./DauCauHoi, @/components/truc-quan/NutAmHieuUng, @/components/truc-quan/PhanHoiDung, @/lib/chapters, ./MathText
 */
import { phat, chuanBiAmHieuUng } from '@/components/tro-choi-nen/amThanh';
import DuongCauHoi from './DuongCauHoi';
import DeCauHoi from './DeCauHoi';
import DauCauHoi from './DauCauHoi';
import NutAmHieuUng from '@/components/truc-quan/NutAmHieuUng';
import { TichVang } from '@/components/truc-quan/PhanHoiDung';
import {useEffect,useState,type CSSProperties} from 'react';
import {CHAPTERS} from '@/lib/chapters';
import MathText from './MathText';
import NutDoc from './NutDoc';
import QuestionFigure from './QuestionFigure';
import AnhMinhHoa from '@/components/AnhMinhHoa';
import { nhanCua } from '@/lib/tronPhuongAn';
import LearningScreen from './LearningScreen';
import {useActiveQuizTime} from './useActiveQuizTime';
import DauTrang from './DauTrang';
import { DIA_DANH } from '@/lib/diaDanh';
import { hinhNhanVat } from '../lib/minhHoa';
import { chuDeChuong } from '@/lib/chuDeChuong';
import AnhChuDe from '@/components/AnhChuDe';
type Result={score:number;by_unit:{ku_id:string;correct:number;total:number;score:number}[];mastery:Record<string,{level:number|null;index:number|null;question_count:number;status:string}>};
type Session={id:string;chapter_id:string;kind:string;submitted_at:string|null;started_at:string;result:Result|null;questions:{question_id:string;ku_id:string;stem:string;hinh?:unknown;options:{option_key:string;option_text:string;nhan?:string}[]}[]};
/**
 * Component React `Paper`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Paper({session,onDone,onExit}:{session:Session;onDone:(result:Result)=>void;onExit:()=>void}){
 const [answers,setAnswers]=useState<Record<string,string|null>>({}),[cursor,setCursor]=useState(0),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState('');const time=useActiveQuizTime();
 // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
 useEffect(()=>{try{const old=JSON.parse(sessionStorage.getItem('assessment:'+session.id)??'{}');const valid:Record<string,string|null>={};session.questions.forEach(q=>{if(old[q.question_id]===null||q.options.some(o=>o.option_key===old[q.question_id]))valid[q.question_id]=old[q.question_id];});setAnswers(valid);const page=Number(sessionStorage.getItem('assessment-page:'+session.id));if(Number.isInteger(page))setCursor(Math.max(0,Math.min(page,session.questions.length)));const seconds=Number(sessionStorage.getItem('assessment-time:'+session.id));if(Number.isFinite(seconds)&&seconds>0)time.current=seconds;}catch{setSaved('Không đọc được bản nháp.');}setReady(true);},[session.id]);
 useEffect(()=>{if(!ready)return;try{sessionStorage.setItem('assessment:'+session.id,JSON.stringify(answers));sessionStorage.setItem('assessment-page:'+session.id,String(cursor));setSaved('Đã lưu bản nháp trong tab này · Chưa nộp bài.');}catch{setSaved('Chưa lưu được bản nháp trên thiết bị.');}},[answers,cursor,ready,session.id]);
 useEffect(()=>{const save=()=>{try{sessionStorage.setItem('assessment-time:'+session.id,String(time.current));}catch{}};const timer=setInterval(save,1000);window.addEventListener('pagehide',save);return()=>{save();clearInterval(timer);window.removeEventListener('pagehide',save);};},[session.id]);
 async function submit(){if(busy)return;chuanBiAmHieuUng();setBusy(true);setError('');try{const r=await fetch('/api/danh-gia',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'submit',id:session.id,answers:Object.fromEntries(session.questions.map(q=>[q.question_id,answers[q.question_id]??null])),activeSeconds:time.current})});const d=await r.json();if(!r.ok)throw Error(d.error);if((d.result as Result).by_unit.some(u=>u.correct>0))phat('dung');onDone(d.result);window.dispatchEvent(new Event('f9-nop-bai-xong'));}catch(e){setError(e instanceof Error?e.message:'Không nộp được');}finally{setBusy(false);}}
 const review=cursor===session.questions.length,q=session.questions[cursor],done=session.questions.every(q=>q.question_id in answers);
 return <LearningScreen title="Đánh giá kiến thức" chuong={session.chapter_id} step={review?'Rà soát trước khi nộp':'Làm bài'} onBack={()=>cursor>0?setCursor(cursor-1):onExit()} onNext={()=>review?void submit():setCursor(cursor+1)} nextLabel={review?'Nộp bài':'Tiếp theo →'} busy={busy} disabled={!ready||(review&&!done)} exitHref="/danh-gia" status={review&&!done?'Còn câu chưa chọn. Em có thể chọn “Chưa biết” ở câu đó.':saved}>

 <DuongCauHoi cau={session.questions} hienTai={cursor} daLam={id => id in answers} denCau={setCursor} khoa={!ready || busy} chuong={session.chapter_id} />
 {review?<><p>Kiểm tra các lựa chọn trước khi nộp.</p><div style={{display:'flex',flexWrap:'wrap',gap:12}}>{session.questions.map((item,i)=><button key={item.question_id} onClick={()=>setCursor(i)}>Câu {i+1} · {!(item.question_id in answers)?'Chưa làm':answers[item.question_id]===null?'Chưa biết':'Đã chọn'}</button>)}</div></>:<fieldset disabled={!ready||busy} style={{border:0,padding:0}}><legend className="quiz-stem cau-de"><DauCauHoi ma={q.ku_id} chuong={session.chapter_id} viTri={cursor + 1} tong={session.questions.length} soDaLam={Object.keys(answers).length} daChon={q.question_id in answers} /><DeCauHoi key={q.question_id} text={q.stem} /></legend><QuestionFigure hinh={q.hinh}/><AnhMinhHoa id={q.question_id}/><div className="quiz-cong-cu" role="group" aria-label="Công cụ câu hỏi"><NutAmHieuUng/><NutDoc gon text={[q.stem,...q.options.map(o=>`Phương án ${o.nhan??o.option_key}. ${o.option_text}`)].join('. ')}/></div>{q.options.map(o=><label className={"opt touch-opt cau-phuong-an" + (answers[q.question_id] === o.option_key ? " picked" : "")} data-viec={{ A: "hoc", B: "luyen", C: "choi", D: "kiem" }[nhanCua(q.options, o.option_key)]} key={o.option_key}><input type="radio" name={q.question_id} checked={answers[q.question_id]===o.option_key} onChange={()=>setAnswers(a=>({...a,[q.question_id]:o.option_key}))}/><span className="opt-key-badge" data-nhan={nhanCua(q.options, o.option_key)}>{nhanCua(q.options, o.option_key)}</span><span className="answer-scroll"><span className="answer-content"><MathText>{o.option_text}</MathText></span></span></label>)}<label><input type="radio" style={{width:'auto'}} name={q.question_id} checked={answers[q.question_id]===null} onChange={()=>setAnswers(a=>({...a,[q.question_id]:null}))}/> Chưa biết</label><p className="hint">“Chưa biết” được ghi nhận là chưa làm đúng. Em có thể sửa lựa chọn trước khi nộp.</p></fieldset>}
 {error&&<p role="alert">{error}</p>}
 </LearningScreen>;
}
/**
 * Component React `Assessments`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function Assessments(){
  const [chapter,setChapter]=useState('C1'),[kind,setKind]=useState('dau-vao'),[history,setHistory]=useState<Session[]>([]),[session,setSession]=useState<Session|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function load(){try{const r=await fetch('/api/danh-gia');const d=await r.json();if(!r.ok)throw Error(d.error);setHistory(d.sessions);}catch(e){setError(e instanceof Error?e.message:'Không tải được');}}
  useEffect(()=>{void load();},[]);
  async function open(body:object){setBusy(true);setError('');try{const r=await fetch('/api/danh-gia',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error);setSession(d.session);}catch(e){setError(e instanceof Error?e.message:'Không mở được');}finally{setBusy(false);}}
  const kqCd = session?.result ? chuDeChuong(session.chapter_id) : null;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const kqMuc = session?.result ? Math.min(4, Math.max(0, Math.round((session.result.score / 10) * 4))) : 0;
  return <div className="wrap"><DauTrang gon tieuDe="Đánh giá theo kiến thức" phu="Làm bài đầu vào để biết em cần ôn gì trước khi học chương, hoặc kiểm tra lại sau khi học xong." hinh={hinhNhanVat('kinh-lup')} tranh="danh-gia" /><p style={{margin:'0 0 14px',display:'flex',gap:10,flexWrap:'wrap'}}><a className="action-link" href="/de-kiem-tra">⏱️ Làm thử 15 phút trước kiểm tra</a></p><section className="dg-khoi"><h2 className="dg-h">1️⃣ Chọn chương</h2><div className="dg-chuong">{CHAPTERS.map(c=>{const d=DIA_DANH[c.id];return <button key={c.id} type="button" aria-pressed={chapter===c.id} onClick={()=>setChapter(c.id)} className="dg-ch" style={{['--dg' as string]:d?.mau??'#2b4ba8'}}>{d&&<img src={`/fluent/${d.icon}_3d.png`} alt="" width={36} height={36}/>}<b>{c.label}</b><small>{d?.ten}</small></button>})}</div>
<h2 className="dg-h">2️⃣ Chọn loại bài</h2><div className="dg-loai"><button type="button" aria-pressed={kind==='dau-vao'} onClick={()=>setKind('dau-vao')} className="dg-lb dg-lb--xanh"><span>🔍</span><b>Đầu vào</b><small>Trước khi học chương: em cần ôn gì?</small></button><button type="button" aria-pressed={kind==='chuong'} onClick={()=>setKind('chuong')} className="dg-lb dg-lb--tim"><span>🏁</span><b>Kiểm tra chương</b><small>Sau khi học xong: em nắm tới đâu?</small></button></div>
<button disabled={busy} className="dg-bat-dau" onClick={()=>open({action:'start',chapter,kind})}>⏱️ Bắt đầu · {CHAPTERS.find(c=>c.id===chapter)?.label}</button><p className="dg-meo">💡 Làm lại bài đầu vào chỉ để chẩn đoán thêm, không thay điểm lần đầu.</p></section><p role="alert">{error}</p>
    {session&&!session.result&&<Paper key={session.id} session={session} onExit={()=>setSession(null)} onDone={result=>{setSession({...session,result});void load();}}/>}
    {session?.result&&<div className="card kq-gon" style={kqCd?({['--mau-chuong' as string]:kqCd.mau} as CSSProperties):undefined}><span className="cau-huy-hieu">🏅 Đã nộp bài</span>{/* Tối giản 22/11/2026: số câu đúng + danh sách mục, bỏ cột mức làm chủ/tỷ lệ */}<h2>Kết quả {session.kind==='dau-vao'?'đầu vào':'kiểm tra chương'}</h2>{kqCd&&<div className="kq-gon__muc"><AnhChuDe src={kqCd.anhMuc(kqMuc)} fallback={hinhNhanVat('reo-ho')} alt={kqCd.mucTen[kqMuc]} width={112} height={112} loading="lazy" /><span className="kq-gon__muc-chip">{kqCd.bieuTuong} {kqCd.ten} · {kqCd.mucTen[kqMuc]}</span></div>}<p className="kq-gon__so"><b>{session.result.by_unit.reduce((s,u)=>s+u.correct,0)}</b>/{session.result.by_unit.reduce((s,u)=>s+u.total,0)}</p><p className="kq-gon__nhan">câu đúng</p><ul className="kq-gon__ds">{session.result.by_unit.map(u=><li key={u.ku_id}><span>{u.correct===u.total?<TichVang/>:'🟡'} {u.ku_id}</span><span>{u.correct}/{u.total}{u.correct<u.total&&<> · <a href={`/hoc/${encodeURIComponent(u.ku_id)}/lo-trinh`}>Ôn lại</a></>}</span></li>)}</ul></div>}
    <section className="dg-khoi"><h2 className="dg-h">🕘 Bài gần đây</h2>{history.length===0?<p className="hint">Chưa có bài đánh giá.</p>:<ul className="dg-ls">{history.map(s=>{const d=DIA_DANH[s.chapter_id];return <li key={s.id} style={{['--dg' as string]:d?.mau??'#2b4ba8'}}><span className="dg-ls__ch">{CHAPTERS.find(c=>c.id===s.chapter_id)?.label??s.chapter_id}</span><span className="dg-ls__loai">{s.kind==='dau-vao'?'🔍 Đầu vào':'🏁 Kiểm tra chương'}</span><small>📅 {new Date(s.started_at).toLocaleDateString('vi-VN')}</small>{s.result?<b className="dg-ls__diem">⭐ {s.result.score}/10</b>:<b className="dg-ls__dang">⏳ Đang làm</b>}<button disabled={busy} className="dg-ls__nut" onClick={()=>open({action:'resume',id:s.id})}>{s.result?'👀 Xem kết quả':'▶ Tiếp tục'}</button></li>})}</ul>}</section>
  </div>;
}
