/**
 * FILE NÀY LÀM GÌ: API máy chủ tiếp nhận yêu cầu từ trình duyệt, kiểm tra quyền và làm việc với cơ sở dữ liệu Supabase / AI.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/can-thiep
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
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
 if(!user)return NextResponse.json({error:'Cần đăng nhập.'},{status:401});
 const b=await req.json().catch(()=>null);
 // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
 if(!b||typeof b.id!=='string'||!/^[0-9a-f-]{36}$/i.test(b.id)||typeof b.contacted!=='boolean')return NextResponse.json({error:'Dữ liệu không hợp lệ.'},{status:400});
 const {error}=await db.rpc('mark_recovery_contact',{p_id:b.id,p_contacted:b.contacted});
 if(error)return NextResponse.json({error:'Chưa lưu được trạng thái trao đổi. Vui lòng thử lại hoặc liên hệ người quản trị.'},{status:400});
 return NextResponse.json({ok:true});
}
