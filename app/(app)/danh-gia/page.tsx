/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /danh-gia
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/components/Assessments, @/lib/supabase/server
 */
import Assessments from '@/components/Assessments';
import {supabaseServer} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
/**
 * Component React `Page`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
// Truy vấn Supabase: đọc dữ liệu từ bảng profiles
export default async function Page(){const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/dang-nhap');const {data:p}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();if(!['hoc-sinh','hoc-sinh-nckh'].includes(p?.role??''))redirect('/gv');return <Assessments/>;}
