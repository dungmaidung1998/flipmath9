/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/phan-hoi-goi-y
 * LẤY DỮ LIỆU TỪ: profiles, hint_feedback
 * GỌI TỚI: @/lib/supabase/server
 */
import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
/**
 * Xử lý HTTP POST: kiểm tra đăng nhập/quyền hạn, nhận dữ liệu mới / xử lý và trả về JSON cho trình duyệt.
 */
export async function POST(req:Request){
 // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
 const db=supabaseServer();const {data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:'Em cần đăng nhập lại.'},{status:401});
 // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
 const {data:profile}=await db.from('profiles').select('student_id,role').eq('id',user.id).maybeSingle();
 if(profile?.role!=='hoc-sinh'||!profile.student_id)return NextResponse.json({error:'Chỉ học sinh gửi phản hồi.'},{status:403});
 const b=await req.json().catch(()=>null);
 if(!b||typeof b.questionId!=='string'||!Number.isInteger(b.tier)||b.tier<1||b.tier>3||typeof b.text!=='string'||!b.text.trim()||b.text.length>2000)return NextResponse.json({error:'Phản hồi chưa hợp lệ.'},{status:400});
 // Truy vấn Supabase: thêm bản ghi vào bảng hint_feedback
 const {error}=await db.from('hint_feedback').insert({student_id:profile.student_id,question_id:b.questionId,tier:b.tier,hint_text:b.text});
 if(error&&error.code!=='23505')return NextResponse.json({error:'Chưa gửi được phản hồi. Em thử lại sau.'},{status:503});
 return NextResponse.json({ok:true});
}
