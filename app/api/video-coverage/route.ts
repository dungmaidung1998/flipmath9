/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/video-coverage
 * LẤY DỮ LIỆU TỪ: profiles, contents, video_seconds
 * GỌI TỚI: @/lib/supabase/server
 */
import {NextResponse} from 'next/server';
import {supabaseServer,supabaseAdmin} from '@/lib/supabase/server';
/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req:Request){
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:'Chưa đăng nhập'},{status:401});
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const {data:p}=await db.from('profiles').select('student_id').eq('id',user.id).maybeSingle();if(!p?.student_id)return NextResponse.json({error:'Thiếu hồ sơ học sinh'},{status:403});
  const b=await req.json().catch(()=>null);
  if(typeof b?.kuId!=='string'||!Array.isArray(b.seconds)||b.seconds.length>120||b.seconds.some((n:unknown)=>!Number.isInteger(n)||Number(n)<0||Number(n)>=7200))return NextResponse.json({error:'Đoạn video không hợp lệ'},{status:400});
  // order + limit(1) chứ KHÔNG maybeSingle(): một mục có thể có hai dòng video
  // (bản dự phòng, bản quay lại), và maybeSingle() sẽ báo lỗi thay vì chọn một.
  // Phải lấy đúng dòng mà hàm learning_completion lấy, nếu không thì trang học
  // tính độ phủ trên video này còn bảng tổng hợp tính trên video kia.
  const {data:vs}=await db.from('contents').select('url,duration_sec').eq('ku_id',b.kuId).eq('kind','video').order('content_id').limit(1);
  const v=vs?.[0];
  if(!v?.url||v.url!==b.url||!v.duration_sec)return NextResponse.json({error:'Video chưa có thời lượng hoặc đã thay đổi'},{status:400});
  const rows=[...new Set<number>(b.seconds)].filter(n=>n<v.duration_sec).map(n=>({student_id:p.student_id,ku_id:b.kuId,video_url:v.url,second_index:n}));
  // Truy vấn Supabase: thêm hoặc cập nhật (upsert) bảng video_seconds
  if(rows.length){const {error}=await supabaseAdmin().from('video_seconds').upsert(rows,{onConflict:'student_id,ku_id,video_url,second_index',ignoreDuplicates:true});if(error)return NextResponse.json({error:'Chưa lưu được đoạn video. Kiểm tra migration 17.'},{status:503});}
  const {data,error}=await db.rpc('learning_completion',{p_student:p.student_id,p_ku:b.kuId});
  return NextResponse.json(error?{error:'Chưa đọc được tiến độ'}:data,{status:error?503:200});
}
