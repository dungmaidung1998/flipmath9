/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/phan-hoi
 * LẤY DỮ LIỆU TỪ: profiles, hint_feedback
 * GỌI TỚI: @/lib/supabase/server, @/components/MathText, @/lib/gv/lopCuaToi
 */
import {supabaseServer} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import MathText from '@/components/MathText';
import {laVaiTroGV} from '@/lib/gv/lopCuaToi';
/**
 * Component React `Feedback`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function Feedback(){
 // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
 const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/dang-nhap');
 // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
 const {data:p}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();if(!laVaiTroGV(p?.role))redirect('/bai-hoc');
 // Truy vấn Supabase: đọc dữ liệu từ bảng hint_feedback
 const {data,error}=await db.from('hint_feedback').select('*').order('created_at',{ascending:false}).limit(100);
 return <div className="wrap"><h1>Phản hồi về gợi ý</h1><p>100 phản hồi gần nhất của học sinh thuộc lớp được phân quyền. Đây là phản hồi của học sinh, chưa phải kết luận gợi ý sai.</p>{error?<p role="alert">Không tải được phản hồi. Kiểm tra kết nối và chạy migration 26 nếu chưa cài đặt.</p>:!data?.length?<p>Chưa có phản hồi.</p>:data.map(r=><section className="card" key={r.id}><h2>{r.student_id} · {r.question_id} · Tầng {r.tier}</h2><MathText>{r.hint_text}</MathText><p className="hint">{new Date(r.created_at).toLocaleString('vi-VN')}</p></section>)}</div>;
}
