/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/danh-gia
 * LẤY DỮ LIỆU TỪ: profiles, assessments, knowledge_units, questions
 * GỌI TỚI: @/lib/supabase/server, @/lib/chapters, @/lib/assessment, @/lib/tronPhuongAn
 */
import {NextResponse} from 'next/server';
import {supabaseServer,supabaseAdmin} from '@/lib/supabase/server';
import {CHAPTERS} from '@/lib/chapters';
import {selectAssessment,AssessmentQuestion} from '@/lib/assessment';
import {randomInt} from 'node:crypto';
import {tronPhuongAn} from '@/lib/tronPhuongAn';
/**
 * Hàm `student(không cần tham số)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
// Truy vấn Supabase: đọc dữ liệu từ bảng profiles
async function student(){const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)return null;const {data}=await db.from('profiles').select('student_id,role').eq('id',user.id).maybeSingle();return (data?.role==='hoc-sinh'||data?.role==='hoc-sinh-nckh')?data.student_id:null;}
// Trộn thứ tự phương án theo học sinh (đáp án gốc luôn là A); bài nộp vẫn gửi option_key gốc.
function publicSession(s:any){return {...s,questions:s.questions?.map(({correct_option,...q}:AssessmentQuestion)=>({...q,options:tronPhuongAn((q as any).options??[],String(s.student_id??''),q.question_id)}))};}
/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(){
  const sid=await student();if(!sid)return NextResponse.json({error:'Cần đăng nhập học sinh'},{status:403});
  // Truy vấn Supabase: đọc dữ liệu từ bảng assessments
  const {data,error}=await supabaseAdmin().from('assessments').select('id,chapter_id,kind,started_at,submitted_at,result').eq('student_id',sid).order('started_at',{ascending:false}).limit(50);
  return NextResponse.json(error?{error:'Cần cài migration 18 để sử dụng bài đánh giá.'}:{sessions:data},{status:error?503:200});
}
/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req:Request){
  const sid=await student();if(!sid)return NextResponse.json({error:'Cần đăng nhập học sinh'},{status:403});
  const b=await req.json().catch(()=>null),db=supabaseAdmin();
  if(b?.action==='submit'){
    if(typeof b.id!=='string'||!Number.isFinite(b.activeSeconds))return NextResponse.json({error:'Dữ liệu không hợp lệ'},{status:400});
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    const {data,error}=await db.rpc('submit_assessment',{p_id:b.id,p_student:sid,p_answers:b.answers,p_active:Math.max(0,Math.round(b.activeSeconds))});
    return NextResponse.json(error?{error:error.code==='PGRST202'?'Cần cài migration 18.':error.message}:{result:data},{status:error?400:200});
  }
  if(b?.action==='resume'){
    // Truy vấn Supabase: đọc dữ liệu từ bảng assessments
    const {data,error}=await db.from('assessments').select('*').eq('student_id',sid).eq('id',b.id).maybeSingle();
    return NextResponse.json(error||!data?{error:'Không tìm thấy bài làm'}:{session:publicSession(data)},{status:error||!data?404:200});
  }
  if(b?.action!=='start'||!CHAPTERS.some(c=>c.id===b.chapter)||!['dau-vao','chuong'].includes(b.kind))return NextResponse.json({error:'Chọn chương và loại bài hợp lệ'},{status:400});
  // Truy vấn Supabase: đọc dữ liệu từ bảng assessments
  const {data:existing,error:lookupError}=await db.from('assessments').select('*').eq('student_id',sid).eq('chapter_id',b.chapter).eq('kind',b.kind).is('submitted_at',null).maybeSingle();
  if(lookupError)return NextResponse.json({error:'Chưa đọc được bài làm. Kiểm tra migration 18.'},{status:503});
  if(existing)return NextResponse.json({session:publicSession(existing)});
  // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
  const {data:units,error:unitError}=await db.from('knowledge_units').select('ku_id').like('ku_id',b.chapter+'-%').order('order_index');
  if(unitError||!units?.length)return NextResponse.json({error:'Chương chưa có kiến thức để kiểm tra.'},{status:400});
  const bank:AssessmentQuestion[]=[];
  for(let offset=0;;offset+=500){
    // Truy vấn Supabase: đọc dữ liệu từ bảng questions
    const {data,error}=await db.from('questions').select('*,question_options(option_key,option_text)').in('ku_id',units.map(u=>u.ku_id)).order('question_id').range(offset,offset+499);
    if(error)return NextResponse.json({error:'Không đọc được ngân hàng câu hỏi.'},{status:503});
    bank.push(...(data??[]).filter((q:any)=>q.trang_thai!=='can-sua').map(q=>({...q,options:q.question_options})));
    if((data?.length??0)<500)break;
  }
  for(let i=bank.length-1;i>0;i--){const j=randomInt(i+1);[bank[i],bank[j]]=[bank[j],bank[i]];}
  const selected=selectAssessment(units.map(u=>u.ku_id),bank,b.kind);
  if(selected.missing.length)return NextResponse.json({error:'Chưa đủ đề phủ các kiến thức: '+selected.missing.join(', ')+'. Mỗi mục cần ít nhất 3 câu hợp lệ; bài chương cần có câu vận dụng.'},{status:400});
  // Truy vấn Supabase: thêm bản ghi vào bảng assessments
  const {data,error}=await db.from('assessments').insert({student_id:sid,chapter_id:b.chapter,kind:b.kind,questions:selected.questions}).select('*').single();
  if(error)return NextResponse.json({error:'Chưa tạo được đề. Nếu vừa mở ở tab khác, hãy tải lại lịch sử.'},{status:409});
  return NextResponse.json({session:publicSession(data)});
}
