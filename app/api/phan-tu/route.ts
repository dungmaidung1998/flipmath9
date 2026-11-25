/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/phan-tu
 * LẤY DỮ LIỆU TỪ: profiles, recommendations, learning_events
 * GỌI TỚI: @/lib/supabase/server
 */
import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req:Request){
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:'Chưa đăng nhập'},{status:401});
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const {data:p}=await db.from('profiles').select('student_id').eq('id',user.id).maybeSingle();if(!p?.student_id)return NextResponse.json({error:'Cần tài khoản học sinh'},{status:403});
  const b=await req.json().catch(()=>null);if(typeof b?.text!=='string'||b.text.trim().length<20||b.text.length>4000||typeof b.kuId!=='string')return NextResponse.json({error:'Nhập tóm tắt từ 20 đến 4000 ký tự'},{status:400});
  // Truy vấn Supabase: đọc dữ liệu từ bảng recommendations
  const {data:rec}=await db.from('recommendations').select('rec_id').eq('student_id',p.student_id).eq('ku_id',b.kuId).eq('trigger_rule','R01').is('post_score',null).limit(1);
  if(!rec?.length)return NextResponse.json({error:'Không có phiếu tóm tắt đang được giao'},{status:400});
  // Truy vấn Supabase: thêm bản ghi vào bảng learning_events
  const {error}=await db.from('learning_events').insert({student_id:p.student_id,ku_id:b.kuId,event_type:'reflection_submit',payload:{text:b.text.trim(),rec_id:rec[0].rec_id}});
  return NextResponse.json(error?{error:error.message}:{ok:true},{status:error?400:200});
}
