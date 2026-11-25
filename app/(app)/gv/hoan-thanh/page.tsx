/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/hoan-thanh
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, students, lesson_fidelity
 * GỌI TỚI: @/lib/supabase/server, @/components/UnitOptions, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import {supabaseServer} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import UnitOptions from '@/components/UnitOptions';
import {docCookieLop} from '@/components/gv/BoLoc';
import {chonLopTu,laVaiTroGV,lopCuaToi,nhanTruongLop} from '@/lib/gv/lopCuaToi';
export const dynamic='force-dynamic';
/**
 * Component React `Page`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function Page({searchParams}:{searchParams:{lop?:string;ku?:string}}){
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const {data:p}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();if(!laVaiTroGV(p?.role))redirect('/');
  const classes=await lopCuaToi(db);
  const cls=chonLopTu(classes,searchParams.lop,docCookieLop(),false).lop;
  // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
  const {data:units}=await db.from('knowledge_units').select('ku_id,ku_name').order('order_index');
  const unit=units?.find(u=>u.ku_id===searchParams.ku)??units?.[0];
  // Truy vấn Supabase: đọc dữ liệu từ bảng students
  const {data:students}=cls?await db.from('students').select('student_id').eq('class_id',cls.class_id):{data:[]};
  // Truy vấn Supabase: đọc dữ liệu từ bảng lesson_fidelity
  const {data:lessons}=cls&&unit?await db.from('lesson_fidelity').select('ngay_day,gio_bat_dau').eq('class_id',cls.class_id).eq('ku_id',unit.ku_id).order('ngay_day').limit(1):{data:[]};
  const lesson=lessons?.[0];const cutoff=lesson?.gio_bat_dau?`${lesson.ngay_day}T${lesson.gio_bat_dau}+07:00`:null;
  // Mỗi học sinh cần một tới hai lời gọi hàm, nên một lớp 40 em là tới 80 lời
  // gọi. Bắn hết cùng lúc bằng một Promise.all duy nhất thì Supabase gói miễn
  // phí chặn bớt và bảng hiện ra thủng lỗ chỗ mà không báo gì. Chia thành từng
  // đợt 8 em: chậm hơn vài giây, nhưng đọc đủ.
  const DOT=8;
  const results:{id:string;current:any;before:any}[]=[];
  for(let i=0;i<(students??[]).length;i+=DOT){
    const dot=await Promise.all((students??[]).slice(i,i+DOT).map(async s=>{
      const current=await db.rpc('learning_completion',{p_student:s.student_id,p_ku:unit!.ku_id});
      const before=cutoff?await db.rpc('learning_completion',{p_student:s.student_id,p_ku:unit!.ku_id,p_before:cutoff}):null;
      return {id:s.student_id,current:current.error?null:current.data,before:before?.error?null:before?.data};
    }));
    results.push(...dot);
  }
  return <div className="wrap"><h1>Hoàn thành và học trước giờ</h1><form className="card"><label>Lớp<select name="lop" defaultValue={cls?.class_id}>{classes.map(c=><option key={c.class_id} value={c.class_id}>{nhanTruongLop(c)}</option>)}</select></label><label>Mục<select name="ku" defaultValue={unit?.ku_id}><UnitOptions units={units ?? []} /></select></label><button className="primary">Xem</button></form><p>Chuẩn flipped-v1: nộp quiz chuẩn bị và xem ≥90% các giây video khác nhau trước giờ học. Bài không yêu cầu video chỉ xét quiz.</p><p>{cutoff?`Mốc tiết đầu: ${lesson?.ngay_day} ${lesson?.gio_bat_dau} (Việt Nam)`:'Chưa có giờ bắt đầu tiết học: chưa kết luận học trước.'}</p><div className="card scroll"><table><thead><tr><th>Học sinh</th><th>Đã học trước</th><th>Video</th><th>Hoạt động</th><th>Cả bài</th></tr></thead><tbody>{results.map(r=><tr key={r.id}><td>{r.id}</td><td>{r.before?.prepared==null?'Chưa xác định':r.before.prepared?'Có':'Chưa đạt'}</td><td>{r.current?.video_percent==null?'—':r.current.video_percent+'%'}</td><td>{r.current?`${r.current.activities_complete}/${r.current.activities_required}`:'Chưa có dữ liệu'}</td><td>{r.current?.lesson_complete==null?'Chưa xác định':r.current.lesson_complete?'Hoàn thành':'Chưa hoàn thành'}</td></tr>)}</tbody></table></div><p className="hint">Độ phủ trước khi cài bộ đo mới không thể khôi phục từ thời gian xem cũ. Quiz chuẩn bị/vận dụng không thay thế điểm đo pre/post/followup ở trang Số liệu đo.</p></div>;
}

