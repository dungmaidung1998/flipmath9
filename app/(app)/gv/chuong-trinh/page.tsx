/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/chuong-trinh
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/components/ContentManager, @/lib/gv/lopCuaToi
 */
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import ContentManager from '@/components/ContentManager';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
export const dynamic='force-dynamic';
/**
 * Component React `Page`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function Page(){
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const {data}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();if(!laVaiTroGV(data?.role))redirect('/');
  return <ContentManager kind="unit"/>;
}
