/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /ho-tro
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/components/SupportPilot, @/lib/supabase/server
 */
import SupportPilot from '@/components/SupportPilot';
import {supabaseServer} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
/**
 * Component React `Page`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function Page(){
 // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
 const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/dang-nhap');
 // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
 const {data:p}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();if(p?.role!=='hoc-sinh')redirect('/gv');
 return <SupportPilot/>;
}
