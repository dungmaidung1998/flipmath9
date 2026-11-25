/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/ho-tro
 * LẤY DỮ LIỆU TỪ: profiles, students, classes, teacher_classes, support_approvals, learning_recovery_records, support_sessions
 * GỌI TỚI: @/lib/supabase/server, @/lib/supportPilot, @/lib/gv/lopCuaToi
 */
import {NextResponse} from 'next/server';
import {supabaseServer,supabaseAdmin} from '@/lib/supabase/server';
import {VERSION,ACTIVITIES,TITLES,initialState,publicQuestion,transition,type Arm,type PilotState} from '@/lib/supportPilot';
import {laVaiTroGV} from '@/lib/gv/lopCuaToi';
export const dynamic='force-dynamic';
/**
 * Hàm `context(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
async function context(){
 // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
 const db=supabaseServer();const {data:{user}}=await db.auth.getUser();
 if(!user)return null;
 // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
 const {data:p}=await db.from('profiles').select('role,student_id').eq('id',user.id).maybeSingle();
 // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
 if(!p?.student_id||laVaiTroGV(p?.role))return null;
 const admin=supabaseAdmin();
 // Truy vấn Supabase: đọc dữ liệu từ bảng students
 const {data:student,error:se}=await admin.from('students').select('class_id').eq('student_id',p.student_id).single();
 if(se)throw Error('Không tải được lớp học.');
 // Truy vấn Supabase: đọc dữ liệu từ bảng classes
 const {data:cls,error:ce}=await admin.from('classes').select('teacher_id').eq('class_id',student.class_id).maybeSingle();
 if(ce)throw Error('Không tải được giáo viên phụ trách.');
 // Truy vấn Supabase: đọc dữ liệu từ bảng teacher_classes
 const tcRes=await admin.from('teacher_classes').select('teacher_id').eq('class_id',student.class_id).then(r=>r,()=>({data:[] as any[]}));
 const teacherIds=Array.from(new Set([cls?.teacher_id,...(tcRes.data??[]).map((t:any)=>t.teacher_id)].filter(Boolean))) as string[];
 const {data:approvals,error:ae}=teacherIds.length
  ? await admin.from('support_approvals').select('arm').in('teacher_id',teacherIds).eq('version',VERSION).eq('approved',true)
  : {data:[] as any[],error:null};
 if(ae)throw Error('Chưa tải được hoạt động hỗ trợ. Em báo giáo viên kiểm tra.');
 return {db:admin,studentId:p.student_id as string,eligible:Array.from(new Set((approvals??[]).map(a=>a.arm as Arm)))};
}
/**
 * Hàm `view(row)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
function view(row:any){
 const state=row.state as PilotState;
 const round=state.rounds.at(-1);
 const active=round&&state.phase==='activity'?ACTIVITIES[round.arm]:null;
 return {...row,question:state.phase==='waiting'&&Date.now()<Date.parse(state.dueAt!)?null:publicQuestion(state),activity:active?{intro:active.intro,total:active.tasks.length}:null};
}
/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(){
 try{
  const c=await context();if(!c)return NextResponse.json({error:'Em cần đăng nhập bằng tài khoản học sinh.'},{status:403});
  // Truy vấn Supabase: đọc dữ liệu từ bảng learning_recovery_records
  const {data:records,error:re}=await c.db.from('learning_recovery_records').select('recovery_id,created_at').eq('student_id',c.studentId).eq('manifest_error','E-CT-01').order('created_at',{ascending:false}).limit(30);
  // Truy vấn Supabase: đọc dữ liệu từ bảng support_sessions
  const {data:sessions,error:se}=await c.db.from('support_sessions').select('*').eq('student_id',c.studentId).order('created_at',{ascending:false}).limit(50);
  if(re||se)throw Error('Chưa tải được hồ sơ hỗ trợ. Em thử lại sau.');
  return NextResponse.json({records,sessions:(sessions??[]).map(view),eligible:c.eligible,titles:TITLES,version:VERSION});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Không tải được dữ liệu.'},{status:503});}
}
/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req:Request){
 try{
  const c=await context();if(!c)return NextResponse.json({error:'Em cần đăng nhập bằng tài khoản học sinh.'},{status:403});
  const b=await req.json();
  if(b.action==='start'){
   if(typeof b.recoveryId!=='string')throw Error('Thiếu hồ sơ hỗ trợ.');
   // Require all three teacher-approved activities before starting the diagnostic.
   if(c.eligible.length!==3)throw Error('Giáo viên cần duyệt đủ ba hoạt động trước khi mở lượt ôn.');
   // Truy vấn Supabase: đọc dữ liệu từ bảng learning_recovery_records
   const {data:record,error}=await c.db.from('learning_recovery_records').select('recovery_id').eq('student_id',c.studentId).eq('manifest_error','E-CT-01').eq('recovery_id',b.recoveryId).maybeSingle();
   if(error||!record)throw Error('Không tìm thấy hồ sơ phù hợp của em.');
   // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng support_sessions
   const {error:ie}=await c.db.from('support_sessions').upsert({recovery_id:record.recovery_id,student_id:c.studentId,version:VERSION,state:initialState()},{onConflict:'student_id,version',ignoreDuplicates:true});
   if(ie)throw Error('Chưa lưu được lượt hỗ trợ.');
   // Truy vấn Supabase: đọc dữ liệu từ bảng support_sessions
   const {data:row,error:readError}=await c.db.from('support_sessions').select('*').eq('version',VERSION).eq('student_id',c.studentId).single();
   if(readError)throw Error('Lượt ôn đã tạo, em tải lại để tiếp tục.');
   return NextResponse.json({session:view(row)});
  }
  if(typeof b.id!=='string'||!Number.isInteger(b.revision))throw Error('Thiếu phiên bản lượt ôn.');
  // Truy vấn Supabase: đọc dữ liệu từ bảng support_sessions
  const {data:row,error}=await c.db.from('support_sessions').select('*').eq('id',b.id).eq('student_id',c.studentId).single();
  if(error||!row)throw Error('Không tìm thấy lượt hỗ trợ.');
  if(row.version!==VERSION)throw Error('Lượt ôn thuộc phiên bản cũ. Em nhờ giáo viên xem lại.');
  if(row.revision!==b.revision)return NextResponse.json({error:'Lượt ôn đã thay đổi ở cửa sổ khác. Em tải lại để tiếp tục.'},{status:409});
  if(typeof b.seconds!=='number'||!Number.isFinite(b.seconds)||b.seconds<0)throw Error('Thời gian không hợp lệ.');
  // Client activity duration is an estimate, capped by elapsed server time.
  const seconds=Math.min(Math.round(b.seconds),Math.max(0,Math.ceil((Date.now()-Date.parse(row.updated_at))/1000)),3600);
  const next=transition(row.state,b.action,b.choice,c.eligible,seconds,Date.now());
  // Truy vấn Supabase: cập nhật dữ liệu ở bảng support_sessions
  const {data:saved,error:ue}=await c.db.from('support_sessions').update({state:next,revision:row.revision+1,updated_at:new Date().toISOString()}).eq('id',row.id).eq('student_id',c.studentId).eq('revision',b.revision).select('*').maybeSingle();
  if(ue)throw Error('Chưa lưu được câu trả lời. Em thử lại.');
  if(!saved)return NextResponse.json({error:'Lượt ôn đã thay đổi. Em tải lại để tiếp tục.'},{status:409});
  return NextResponse.json({session:view(saved)});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Không lưu được dữ liệu.'},{status:400});}
}
