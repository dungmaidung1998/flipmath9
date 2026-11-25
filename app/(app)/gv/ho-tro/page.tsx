/**
 * FILE NÀY LÀM GÌ: Trang giáo viên quản lý nhóm hỗ trợ thử nghiệm (SupportPilot arms) và theo dõi bài thăm dò.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/ho-tro
 * LẤY DỮ LIỆU TỪ: profiles, students, study_sessions
 * GỌI TỚI: @/lib/supabase/server, @/lib/supportPilot, @/components/MathText, @/lib/gv/lopCuaToi
 */
import {supabaseServer} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {VERSION,ARMS,TITLES,ACTIVITIES,PROBES,CHECKS,RETENTION,type PilotState} from '@/lib/supportPilot';
import MathText from '@/components/MathText';
import {laVaiTroGV} from '@/lib/gv/lopCuaToi';
async function approve(form:FormData){
 'use server';
 const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/dang-nhap');
 const {data:p}=await db.from('profiles').select('role').eq('id',user.id).single();if(!laVaiTroGV(p?.role))redirect('/bai-hoc');
 const arm=String(form.get('arm'));if(!ARMS.includes(arm as any))return;
 const {error}=await db.from('support_approvals').upsert({teacher_id:user.id,version:VERSION,arm,approved:form.get('approved')==='true',updated_at:new Date().toISOString()});
 if(error)redirect('/gv/ho-tro?error=save');
 revalidatePath('/gv/ho-tro');redirect('/gv/ho-tro');
}
export default async function Page({searchParams}:{searchParams:{error?:string}}){
 const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/dang-nhap');
 const {data:p}=await db.from('profiles').select('role').eq('id',user.id).single();if(!laVaiTroGV(p?.role))redirect('/bai-hoc');
 const [{data:approvals,error:ae},{data:rows,error:se}]=await Promise.all([
 db.from('support_approvals').select('*').eq('teacher_id',user.id).eq('version',VERSION),
 db.from('support_sessions').select('*').order('updated_at',{ascending:false}).limit(200)]);
 const sessions: {id:string;student_id:string;version:string;recovery_id:string;updated_at:string;state:PilotState}[]=(rows??[]).map(row=>({...row,state:row.state as PilotState}));
 const preview=(items:typeof PROBES)=>items.map(q=><li key={q.id}><MathText>{q.stem}</MathText> — Đáp án: <MathText>{q.options[q.answer]}</MathText><p>{q.options.map((o,i)=><span key={i} style={{marginRight:16}}><MathText>{o}</MathText></span>)}</p></li>);
 return <div className="wrap"><h1>Hiệu quả hỗ trợ học sinh</h1><p>Nội dung {VERSION} · Lỗi cộng cả tử và mẫu (E-CT-01). Chọn hoạt động theo quy tắc, chưa dùng thuật toán tự học.</p>
 {(ae||se||searchParams.error)&&<p role="alert">Chưa đọc hoặc lưu được dữ liệu. Kiểm tra kết nối, quyền truy cập và migration 28.</p>}
 <section className="card"><h2>Duyệt nội dung</h2><p>Duyệt áp dụng cho các lớp thầy cô phụ trách. Hãy xem cả bộ câu hỏi trước khi duyệt. Ngừng duyệt chặn lượt mới và bước hoạt động chưa hoàn thành.</p>
 {ARMS.map(arm=>{const approved=approvals?.some(a=>a.arm===arm&&a.approved);return <details key={arm}><summary>{TITLES[arm]} · {approved?'Đã duyệt':'Chưa duyệt'}</summary><p><MathText>{ACTIVITIES[arm].intro}</MathText></p><ol>{preview(ACTIVITIES[arm].tasks)}</ol><form action={approve}><input type="hidden" name="arm" value={arm}/><input type="hidden" name="approved" value={approved?'false':'true'}/><button disabled={!!ae}>{approved?'Ngừng duyệt':'Đã kiểm tra hoạt động và bộ câu hỏi — Duyệt'}</button></form></details>;})}
 <details><summary>Bộ câu thăm dò và kiểm tra chung</summary><h3>Thăm dò</h3><ol>{preview(PROBES)}</ol>{CHECKS.map((qs,i)=><div key={i}><h3>Câu mới sau lượt {i+1}</h3><ol>{preview(qs)}</ol></div>)}<h3>Duy trì sau 3 ngày</h3><ol>{preview([RETENTION])}</ol><p>Các bộ chưa được hiệu chỉnh độ khó, chưa phải bài đo tương đương đã kiểm định.</p></details></section>
 {!se&&<><section className="card"><h2>Thống kê tối đa 200 hồ sơ cập nhật gần nhất</h2><p>Các nhóm được chọn theo khó khăn khác nhau, không phân ngẫu nhiên. Bảng mô tả không chứng minh cách nào gây ra tiến bộ tốt hơn.</p>
 <div style={{overflowX:'auto'}}><table><thead><tr><th>Hình thức</th><th>Lượt</th><th>Đủ 2 câu mới</th><th>Đúng cả 2</th><th>Duy trì đúng / đã làm</th><th>Thời gian trung vị*</th></tr></thead><tbody>{ARMS.map(arm=>{
 const rounds=sessions.flatMap(s=>s.state.rounds.filter(r=>r.arm===arm));const tested=rounds.filter(r=>r.checks.length===2);const delayed=sessions.filter(s=>s.state.rounds.at(-1)?.arm===arm&&s.state.retention);
 const times=tested.map(r=>r.seconds).sort((a,b)=>a-b);const m=Math.floor(times.length/2);const median=times.length?(times.length%2?times[m]:(times[m-1]+times[m])/2):null;
 return <tr key={arm}><td>{TITLES[arm]}</td><td>{rounds.length}</td><td>{tested.length}</td><td>{tested.filter(r=>r.checks.every(e=>e.correct)).length}/{tested.length}</td><td>{delayed.filter(s=>s.state.retention?.correct).length}/{delayed.length}</td><td>{median===null?'Chưa có dữ liệu':`${Math.round(median)} giây`}</td></tr>;
 })}</tbody></table></div><p>* Ước lượng phía thiết bị cho hoạt động và kiểm tra ngay, trên lượt đủ hai câu mới. Thiếu kiểm tra duy trì không tính là sai. Kết quả được lưu riêng, chưa cập nhật mastery.</p></section>
 <h2>Hồ sơ hỗ trợ</h2>{!sessions.length&&<p>Chưa có lượt hỗ trợ.</p>}
 {sessions.map(row=><details className="card" key={row.id}><summary>{row.student_id} · {({probe:'Đang thăm dò',activity:'Đang ôn',check:'Đang kiểm tra',waiting:'Chờ kiểm tra duy trì',done:'Đã kiểm tra duy trì',teacher:'Cần giáo viên xem xét'} as const)[row.state.phase]} · {new Date(row.updated_at).toLocaleString('vi-VN')}</summary><p>Phiên bản: {row.version} · Hồ sơ nguồn: {row.recovery_id}</p><p>Thăm dò: {row.state.probes.length?row.state.probes.map(e=>`${e.id}: ${e.correct?'đúng':'sai'}`).join('; '):'Chưa trả lời'}</p>
 {row.state.rounds.map((r,i)=><div key={i}><h3>Lượt {i+1}: {TITLES[r.arm]}</h3><p>Đề xuất: {TITLES[r.recommended]}. {r.reason} {r.switched?'Học sinh đổi hình thức.':''}</p><p>Đủ điều kiện: {r.eligible.map(a=>TITLES[a]).join(', ')}. Câu mới: {r.checks.length?r.checks.map(e=>`${e.id}: ${e.correct?'đúng':'sai'}`).join('; '):'Chưa có dữ liệu'}.</p></div>)}
 <p>Duy trì: {row.state.retention?(row.state.retention.correct?'Đúng':'Sai'):row.state.dueAt?`Chưa có kết quả; hẹn ${new Date(row.state.dueAt).toLocaleString('vi-VN')}`:'Chưa lên lịch'}</p>
 <details><summary>Nhật ký thao tác (lựa chọn đánh số từ 0)</summary><ol>{row.state.events.map((e,i)=><li key={i}>{new Date(e.at).toLocaleString('vi-VN')} · {e.action} · {e.seconds} giây</li>)}</ol></details></details>)}
 </>}
 </div>;
}
