/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/tong-quan
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, students, quiz_attempts, mastery_states, recommendations, loi_pho_bien, error_dictionary
 * GỌI TỚI: @/lib/supabase/server, @/components/ClassOverview, @/components/UnitOptions, @/components/gv/BoLoc, @/lib/gv/lopCuaToi
 */
import {supabaseServer,supabaseAdmin} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import ClassOverview,{type OverviewRow} from '@/components/ClassOverview';
import UnitOptions from '@/components/UnitOptions';
import {docCookieLop} from '@/components/gv/BoLoc';
import {chonLopTu,laVaiTroGV,lopCuaToi,nhanTruongLop,tenHienThiLop} from '@/lib/gv/lopCuaToi';
export const dynamic='force-dynamic';
// Fetch complete result sets rather than silently accepting the API's row limit.
async function pages(query:()=>any){
 const rows:any[]=[];
 for(let offset=0;;offset+=500){const {data,error}=await query().range(offset,offset+499);if(error)return {data:[],error:true};rows.push(...(data??[]));if(!data||data.length<500)return {data:rows,error:false};}
}
/**
 * Component React `Page`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function Page({searchParams}:{searchParams:{lop?:string;ku?:string}}){
 // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
 const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/dang-nhap');
 // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
 const {data:profile}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();if(!laVaiTroGV(profile?.role))redirect('/');
 // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
 const [classes,unitsRes]=await Promise.all([lopCuaToi(db),pages(()=>db.from('knowledge_units').select('ku_id,ku_name,order_index').order('order_index').order('ku_id'))]);
 if(unitsRes.error)return <div className="wrap"><h1>Tổng quan lớp</h1><p role="alert">Không tải được danh sách lớp hoặc kiến thức. Vui lòng tải lại trang.</p></div>;
 const units=unitsRes.data;
 const cls=chonLopTu(classes,searchParams.lop,docCookieLop(),false).lop,unit=units.find(u=>u.ku_id===searchParams.ku)??units[0];
 if(!cls||!unit)return <div className="wrap"><h1>Tổng quan lớp</h1><p>Chưa có lớp được phân công hoặc chưa có nội dung chương trình.</p></div>;
 // Truy vấn Supabase: đọc dữ liệu từ bảng students
 const studentsRes=await pages(()=>db.from('students').select('student_id,display_name').eq('class_id',cls.class_id).order('student_id'));
 if(studentsRes.error)return <div className="wrap"><h1>Tổng quan lớp</h1><p role="alert">Không tải được danh sách học sinh. Chưa thể tính các chỉ số.</p></div>;
 const ids=studentsRes.data.map(s=>s.student_id),queryIds=ids.length?ids:['__none__'];
 const [quiz,mastery,recs,errors,dict]=await Promise.all([
 pages(()=>db.from('quiz_attempts').select('attempt_id,student_id,score,kind,submitted_at').in('student_id',queryIds).eq('ku_id',unit.ku_id).order('submitted_at',{ascending:false}).order('attempt_id',{ascending:false})),
 pages(()=>db.from('mastery_states').select('student_id,mastery_level').in('student_id',queryIds).eq('ku_id',unit.ku_id).order('student_id')),
 pages(()=>db.from('recommendations').select('rec_id,student_id,diagnosis,action,created_at').in('student_id',queryIds).eq('ku_id',unit.ku_id).order('created_at',{ascending:false}).order('rec_id',{ascending:false})),
 pages(()=>db.from('loi_pho_bien').select('error_code,so_luot').eq('class_id',cls.class_id).eq('ku_id',unit.ku_id).order('error_code')),
 pages(()=>db.from('error_dictionary').select('error_code,misconception').order('error_code'))]);
 const names=new Map(dict.data.map(d=>[d.error_code,d.misconception]));
 const rows:OverviewRow[]=studentsRes.data.map(s=>{const attempts=quiz.data.filter(a=>a.student_id===s.student_id),latest=attempts[0],m=mastery.data.find(m=>m.student_id===s.student_id),r=recs.data.find(r=>r.student_id===s.student_id);return {id:s.student_id,name:s.display_name??s.student_id,score:latest?.score==null?null:Number(latest.score),submitted:latest?.submitted_at??null,prepared:attempts.some(a=>a.kind==='chuan-bi'),mastery:m?.mastery_level??null,diagnosis:r?.diagnosis??null,action:r?.action??null};});
 const warnings=[quiz.error?'Không tải được dữ liệu quiz. Các chỉ số quiz tạm thời không hiển thị.':'',mastery.error?'Không tải được mức làm chủ. Không coi lỗi tải dữ liệu là thiếu bằng chứng.':'',recs.error?'Không tải được đề xuất học tiếp.':'',errors.error?'Không tải được thống kê lỗi.':'',dict.error?'Không tải được tên lỗi; tạm hiển thị mã lỗi.':''].filter(Boolean);
 // Truy vấn Supabase: thêm bản ghi vào bảng dashboard_views
 try{await supabaseAdmin().from('dashboard_views').insert({teacher_id:user.id,class_id:cls.class_id,ku_id:unit.ku_id});}catch{}
 const params=new URLSearchParams({lop:String(cls.class_id),ku:unit.ku_id});
 return <div className="bi-page"><header className="bi-page-heading"><div><p>BẢNG ĐIỀU KHIỂN GIÁO VIÊN</p><h1>Tổng quan lớp học</h1></div><a href={`/gv/chuan-bi?${params}`} style={{fontWeight:700}}>Báo cáo trước giờ →</a></header>
 {/* Khối giao diện: Biểu mẫu nhập liệu */}
 <form className="bi-global-filter" action="/gv/tong-quan"><label>Lớp<select name="lop" defaultValue={cls.class_id}>{classes.map(c=><option key={c.class_id} value={c.class_id}>{nhanTruongLop(c)}</option>)}</select></label><label>Đơn vị kiến thức<select name="ku" defaultValue={unit.ku_id}><UnitOptions units={units} /></select></label><button className="primary">Áp dụng</button><a href="/gv/tong-quan">Đặt lại</a></form>
 <ClassOverview key={`${cls.class_id}:${unit.ku_id}`} rows={rows} className={tenHienThiLop(cls)} unitName={unit.ku_name} updated={new Date().toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})+' (GMT+7)'} errors={errors.data.map(e=>({name:String(names.get(e.error_code)??e.error_code),count:Number(e.so_luot)})).sort((a,b)=>b.count-a.count)} warnings={warnings} available={{quiz:!quiz.error,mastery:!mastery.error,recommendations:!recs.error,errors:!errors.error}} detailHref={`/gv/phan-tich-lop?${params}`}/>
 </div>;
}
