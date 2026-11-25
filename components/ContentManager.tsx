'use client';

/**
 * FILE NÀY LÀM GÌ: Thành phần quản lý đơn vị kiến thức, bài học và phương án chẩn đoán lỗi sai.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: gọi API nội bộ qua fetch
 * GỌI TỚI: ./MathText
 */
import { useEffect, useState } from 'react';
import MathText from './MathText';

type Unit = { ku_id: string; ku_name: string; lesson_id: string; order_index: number; prerequisite_ku: string | null };
type Option = { option_key: string; option_text: string; error_code: string };
type Question = { question_id: string; ku_id: string; stem: string; level: number; correct_option: string; expected_time_sec: number; options: Option[] };
type StoredQuestion = Question & { question_options: Option[]; distractor_errors: {option_key:string;error_code:string}[] };
const emptyUnit: Unit = { ku_id:'', ku_name:'', lesson_id:'', order_index:0, prerequisite_ku:'' };
const emptyQuestion = (): Question => ({ question_id:'',ku_id:'',stem:'',level:1,correct_option:'A',expected_time_sec:60,options:['A','B','C','D'].map(option_key=>({option_key,option_text:'',error_code:''})) });

export default function ContentManager({ kind }: {kind:'unit'|'question'}) {
  const [units,setUnits]=useState<Unit[]>([]), [questions,setQuestions]=useState<StoredQuestion[]>([]);
  const [errors,setErrors]=useState<{error_code:string;misconception:string}[]>([]);
  const [search,setSearch]=useState(''), [ku,setKu]=useState(''), [level,setLevel]=useState(''), [page,setPage]=useState(0), [count,setCount]=useState(0);
  const [unit,setUnit]=useState<Unit>(emptyUnit), [question,setQuestion]=useState<Question>(emptyQuestion);
  const [editing,setEditing]=useState(false), [open,setOpen]=useState(false), [busy,setBusy]=useState(false), [loading,setLoading]=useState(true), [message,setMessage]=useState(''), [revision,setRevision]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    setLoading(true);
    const params=new URLSearchParams({kind:kind==='question'?'questions':'units',search,ku,level,page:String(page)});
    fetch('/api/quan-ly?'+params,{signal:controller.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);return d;}).then(d=>{setUnits(d.units);setQuestions(d.questions??[]);setCount(d.count??0);setErrors(d.errors??[]);setLoading(false);}).catch(e=>{if(e.name!=='AbortError'){setMessage(e.message);setLoading(false);}});
    return ()=>controller.abort();
  },[kind,search,ku,level,page,revision]);
  async function save(action:'create'|'update'|'delete',data:Unit|Question) {
    if(action==='delete'&&!window.confirm('Xóa mục này? Mục đang có dữ liệu liên quan sẽ không được xóa.'))return;
    setBusy(true);setMessage('');
    try {const r=await fetch('/api/quan-ly',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,action,data})});const d=await r.json();if(!r.ok)throw new Error(d.error);setMessage(action==='delete'?'Đã xóa.':'Đã lưu.');setOpen(false);setRevision(v=>v+1);}
    catch(e){setMessage(e instanceof Error?e.message:'Không lưu được.');} finally{setBusy(false);}
  }
  function editQuestion(q:StoredQuestion,copy=false){setQuestion({...q,question_id:copy?'':q.question_id,options:['A','B','C','D'].map(key=>({option_key:key,option_text:q.question_options.find(o=>o.option_key===key)?.option_text??'',error_code:q.distractor_errors.find(o=>o.option_key===key)?.error_code??''}))});setEditing(!copy);setOpen(true);setMessage('');}
  const unitChoices=<>{units.map(u=><option key={u.ku_id} value={u.ku_id}>{u.lesson_id} · {u.ku_name}</option>)}</>;
  return <div className="wrap">
    <h1>{kind==='unit'?'Quản lý chương trình / bài học':'Ngân hàng câu hỏi'}</h1>
    <p className="sub">{kind==='unit'?'Tổ chức bài học, thứ tự các mục và kiến thức tiên quyết.':'Soạn câu trắc nghiệm, chọn đáp án đúng và gắn mã lỗi cho đáp án sai.'}</p>
    <div className="manager-toolbar">
      <button className="primary" onClick={()=>{setUnit({...emptyUnit,order_index:units.length?Math.max(...units.map(u=>u.order_index))+1:1});setQuestion({...emptyQuestion(),ku_id:ku||units[0]?.ku_id||''});setEditing(false);setOpen(true);setMessage('');}}>+ {kind==='unit'?'Thêm mục bài học':'Thêm câu hỏi'}</button>
      <a className="action-link" href={kind==='unit'?'/gv/cau-hoi':'/gv/chuong-trinh'}>{kind==='unit'?'Ngân hàng câu hỏi':'Chương trình'}</a>
      <a className="action-link" href="/gv/noi-dung">Gắn video / học liệu</a>
    </div>
    <div role="status" aria-live="polite">{message&&<p className="card">{message}</p>}</div>
    {open&&<form className="card" onSubmit={e=>{e.preventDefault();void save(editing?'update':'create',kind==='unit'?unit:question);}}>
      <h2>{editing?'Chỉnh sửa':'Tạo mới'}</h2>
      <fieldset disabled={busy} className="manager-fields">
      {kind==='unit'?<>
        <label>Mã mục<input required pattern="[A-Za-z0-9_-]{1,80}" disabled={editing} value={unit.ku_id} onChange={e=>setUnit({...unit,ku_id:e.target.value})}/></label>
        <label>Bài học<input required list="lesson-list" value={unit.lesson_id} onChange={e=>setUnit({...unit,lesson_id:e.target.value})}/><datalist id="lesson-list">{Array.from(new Set(units.map(u=>u.lesson_id))).map(l=><option key={l} value={l}/>)}</datalist></label>
        <label>Tên mục<input required value={unit.ku_name} onChange={e=>setUnit({...unit,ku_name:e.target.value})}/></label>
        <label>Thứ tự<input required type="number" min="0" step="1" value={unit.order_index} onChange={e=>setUnit({...unit,order_index:Number(e.target.value)})}/></label>
        <label>Mục tiên quyết<select value={unit.prerequisite_ku??''} onChange={e=>setUnit({...unit,prerequisite_ku:e.target.value})}><option value="">Không có</option>{units.filter(u=>u.ku_id!==unit.ku_id).map(u=><option key={u.ku_id} value={u.ku_id}>{u.ku_name}</option>)}</select></label>
      </>:<>
        <label>Mã câu hỏi<input required pattern="[A-Za-z0-9_-]{1,80}" disabled={editing} value={question.question_id} onChange={e=>setQuestion({...question,question_id:e.target.value})}/></label>
        <label>Mục bài học<select required value={question.ku_id} onChange={e=>setQuestion({...question,ku_id:e.target.value})}><option value="">Chọn mục</option>{unitChoices}</select></label>
        <label>Cấp độ<select value={question.level} onChange={e=>setQuestion({...question,level:Number(e.target.value)})}>{['Nhận biết','Thông hiểu','Vận dụng','Vận dụng tình huống mới'].map((n,i)=><option key={n} value={i+1}>{i+1} · {n}</option>)}</select></label>
        <label>Thời gian dự kiến (giây)<input required type="number" min="1" max="7200" value={question.expected_time_sec} onChange={e=>setQuestion({...question,expected_time_sec:Number(e.target.value)})}/></label>
        <label>Đề bài<textarea required rows={3} value={question.stem} onChange={e=>setQuestion({...question,stem:e.target.value})}/></label>
        <p className="hint">Viết công thức trong $...$, ví dụ {'$\\left(\\dfrac{a}{b}\\right)^2$'}.</p>
        {question.options.map((o,i)=><div className="card" key={o.option_key}><label>Đáp án {o.option_key}<textarea required value={o.option_text} onChange={e=>setQuestion({...question,options:question.options.map((x,j)=>j===i?{...x,option_text:e.target.value}:x)})}/></label><label>Mã lỗi khi chọn sai<select disabled={question.correct_option===o.option_key} value={question.correct_option===o.option_key?'':o.error_code} onChange={e=>setQuestion({...question,options:question.options.map((x,j)=>j===i?{...x,error_code:e.target.value}:x)})}><option value="">Không gắn mã lỗi</option>{errors.map(x=><option key={x.error_code} value={x.error_code}>{x.error_code} · {x.misconception}</option>)}</select></label></div>)}
        <label>Đáp án đúng<select value={question.correct_option} onChange={e=>setQuestion({...question,correct_option:e.target.value})}>{['A','B','C','D'].map(k=><option key={k}>{k}</option>)}</select></label>
        <div className="card"><h2>Xem trước</h2><MathText>{question.stem}</MathText>{question.options.map(o=><p key={o.option_key}><strong>{o.option_key}. </strong><MathText>{o.option_text}</MathText>{o.option_key===question.correct_option?' ✓':''}</p>)}</div>
      </>}
      <div className="manager-toolbar"><button className="primary" type="submit">{busy?'Đang lưu…':'Lưu'}</button><button type="button" onClick={()=>setOpen(false)}>Hủy</button></div>
      </fieldset>
    </form>}
    <div className="card">
      <label>Tìm {kind==='unit'?'bài / mục':'nội dung câu hỏi'}<input type="search" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}/></label>
      {kind==='question'&&<div className="manager-toolbar"><label>Bài / mục<select value={ku} onChange={e=>{setKu(e.target.value);setPage(0);}}><option value="">Tất cả</option>{unitChoices}</select></label><label>Cấp độ<select value={level} onChange={e=>{setLevel(e.target.value);setPage(0);}}><option value="">Tất cả</option>{[1,2,3,4].map(n=><option key={n}>{n}</option>)}</select></label></div>}
      {loading?<p>Đang tải…</p>:kind==='unit'?<>{units.filter(u=>(u.ku_name+' '+u.lesson_id+' '+u.ku_id).toLowerCase().includes(search.toLowerCase())).map(u=><article className="card" key={u.ku_id}><h3>{u.lesson_id} · {u.ku_name}</h3><p className="hint">{u.ku_id} · Thứ tự {u.order_index} · Tiên quyết: {u.prerequisite_ku||'Không có'}</p><div className="manager-toolbar"><button disabled={busy} onClick={()=>{setUnit(u);setEditing(true);setOpen(true);}}>Sửa</button><button disabled={busy} onClick={()=>save('delete',u)}>Xóa</button></div></article>)}{!units.length&&<p>Chưa có mục bài học.</p>}</>:<><p>{count} câu hỏi</p>{questions.map(q=><article className="card" key={q.question_id}><p className="hint">{q.question_id} · {q.ku_id} · Mức {q.level}</p><MathText>{q.stem}</MathText><div className="manager-toolbar"><button disabled={busy} onClick={()=>editQuestion(q)}>Sửa</button><button disabled={busy} onClick={()=>editQuestion(q,true)}>Tạo bản sao</button><button disabled={busy} onClick={()=>save('delete',q)}>Xóa</button></div></article>)}<div className="manager-toolbar"><button disabled={page===0} onClick={()=>setPage(p=>p-1)}>Trước</button><span>Trang {page+1}</span><button disabled={(page+1)*30>=count} onClick={()=>setPage(p=>p+1)}>Sau</button></div></>}
    </div>
  </div>;
}
