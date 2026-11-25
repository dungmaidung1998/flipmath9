/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /hoc/[ku]/lo-trinh
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, recommendations, mastery_states, learning_events, micro_lesson_events, quiz_locks
 * GỌI TỚI: @/lib/cheDo, @/lib/capDo, @/lib/supabase/server, @/components/Reflection, @/components/RefreshLearningPath, @/lib/adaptive, @/components/DauTrang, @/lib/minhHoa
 */
import { CHE_DO_KIEM_TRA } from '@/lib/cheDo';
import { redirect, notFound } from 'next/navigation';
import { tenCapDo } from '@/lib/capDo';
import { supabaseServer } from '@/lib/supabase/server';
import Reflection from '@/components/Reflection';
import RefreshLearningPath from '@/components/RefreshLearningPath';
import {targetLevels} from '@/lib/adaptive';
import DauTrang from '@/components/DauTrang';
import { hinhNhanVat } from '@/lib/minhHoa';
import { chuDeChuong } from '@/lib/chuDeChuong';
import type { CSSProperties } from 'react';
export const dynamic='force-dynamic';
/**
 * Component React `Page`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function Page({params}:{params:{ku:string}}){
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const db=supabaseServer();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const {data:profile}=await db.from('profiles').select('student_id,role').eq('id',user.id).maybeSingle();
  if(!['hoc-sinh','hoc-sinh-nckh'].includes(profile?.role??'')||!profile?.student_id)redirect('/gv');
  // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
  const {data:unit}=await db.from('knowledge_units').select('*').eq('ku_id',params.ku).maybeSingle();if(!unit)notFound();
  // Truy vấn Supabase: đọc dữ liệu từ bảng recommendations
  const {data:rows}=await db.from('recommendations').select('*').eq('student_id',profile.student_id).eq('ku_id',params.ku).is('post_score',null).order('created_at',{ascending:false}).limit(1);
  // Truy vấn Supabase: đọc dữ liệu từ bảng mastery_states
  const {data:state,error:stateError}=await db.from('mastery_states').select('mastery_level,updated_at').eq('student_id',profile.student_id).eq('ku_id',params.ku).maybeSingle();
  if(stateError)throw new Error('Không đọc được hồ sơ học tập.');
  const mastery=state?.mastery_level??null;
  // Old quiz diagnoses must not override newer assessment evidence.
  const rec=rows?.[0]&&(!state||new Date(rows[0].created_at)>=new Date(state.updated_at))?rows[0]:null;
  const {data:completion}=await db.rpc('learning_completion',{p_student:profile.student_id,p_ku:params.ku});
  const rule=rec?.trigger_rule==='R09'&&completion?.video_complete?undefined:rec?.trigger_rule;
  // Truy vấn Supabase: đọc dữ liệu từ bảng learning_events
  const {data:activity}=await db.from('learning_events').select('event_id').eq('student_id',profile.student_id).eq('ku_id',params.ku).in('event_type',['content_open','video_active']).limit(1);
  // Truy vấn Supabase: đọc dữ liệu từ bảng micro_lesson_events
  const {data:micro}=await db.from('micro_lesson_events').select('content_id').eq('student_id',profile.student_id).eq('ku_id',params.ku).eq('kind','hoan-thanh');
  const remedied=!!rec?.recommended_content&&!!micro?.some(m=>m.content_id===rec.recommended_content);
  // Truy vấn Supabase: đọc dữ liệu từ bảng mastery_states
  const {data:prereq}=unit.prerequisite_ku?await db.from('mastery_states').select('mastery_level').eq('student_id',profile.student_id).eq('ku_id',unit.prerequisite_ku).maybeSingle():{data:null};
  const base=`/hoc/${encodeURIComponent(params.ku)}`;
  // Truy vấn Supabase: đọc dữ liệu từ bảng quiz_locks
  const {data:lock}=await db.from('quiz_locks').select('locked_until').eq('student_id',profile.student_id).eq('ku_id',params.ku).maybeSingle();
  const locked=!CHE_DO_KIEM_TRA&&lock&&new Date(lock.locked_until).getTime()>Date.now();
  // Truy vấn Supabase: đọc dữ liệu từ bảng knowledge_units
  const {data:next}=await db.from('knowledge_units').select('ku_id,ku_name').gt('order_index',unit.order_index).order('order_index').limit(1);
  const steps: {title:string;href:string;label:string}[]=[];
  if(rule==='R05'&&unit.prerequisite_ku)steps.push({title:'Ôn kiến thức nền và làm lại bài kiểm tra của mục tiên quyết.',href:`/hoc/${encodeURIComponent(unit.prerequisite_ku)}`,label:'Mở mục tiên quyết'});
  if(rule==='R03'&&rec?.recommended_content&&!remedied)steps.push({title:'Đọc vi bài học và làm bài tập sửa lỗi.',href:`/vi-bai-hoc/${encodeURIComponent(rec.recommended_content)}`,label:'Mở vi bài học'});
  if(['R01','R04','R09'].includes(rule)||rule==='R05'&&!unit.prerequisite_ku||rule==='R03'&&!rec.recommended_content)steps.push({title:rule==='R09'?'Xem tiếp video và học liệu còn thiếu.':'Xem lại học liệu, ghi lại quy tắc và chỗ chưa hiểu.',href:base,label:'Mở học liệu'});
  if(rule==='R01')steps.push({title:'Tự giải thích quy tắc bằng lời của em ở phiếu bên dưới.',href:'#tom-tat',label:'Viết tóm tắt'});
  if(['R01','R04','R05','R09'].includes(rule))steps.push({title:locked?'Bài kiểm tra đang tạm khóa; em có thể ôn bài trong lúc chờ.':'Làm lại bài chuẩn bị để kiểm tra kiến thức vừa ôn.',href:base,label:'Quay lại bài kiểm tra'});
  if(!rule){
    if(prereq?.mastery_level===0&&mastery!==2&&mastery!==3)steps.push({title:'Kiến thức nền còn yếu; ôn trước khi tiếp tục.',href:`/hoc/${encodeURIComponent(unit.prerequisite_ku)}`,label:'Ôn kiến thức nền'});
    if((mastery==null||mastery<2)&&!activity?.length)steps.push({title:'Đọc hoặc xem học liệu để chuẩn bị cho bài tập.',href:base,label:'Mở học liệu'});
  }
  steps.push({title:`Làm bài tập mức ${targetLevels(mastery).join('–')} được chọn theo hồ sơ hiện tại.`,href:base+'/van-dung',label:remedied?'Đã ôn bổ trợ — kiểm tra lại':'Mở bài tập cá nhân hóa'});
  const cd=chuDeChuong(params.ku);
  type Tram={nhan:string;title:string;href:string;label:string;done?:boolean;chinh?:boolean};
  const trams:Tram[]=[];
  if(steps.length>=3){
    steps.forEach((s,idx)=>trams.push({nhan:`Trạm ${idx+1}`,title:s.title,href:s.href,label:s.label,chinh:idx===0}));
  }else{
    if(!steps.some(s=>s.href===base)){
      trams.push({nhan:'🎬 Trạm · Học liệu',title:'Xem video bài giảng và tóm tắt ghi vở.',href:base,label:completion?.video_complete?'Xem lại học liệu':'Mở học liệu',done:!!completion?.video_complete});
    }
    trams.push({nhan:'✍️ Trạm · Chuẩn bị',title:'Làm bài kiểm tra nhanh trước giờ học.',href:base,label:completion?.preparation_submitted?'Xem lại bài chuẩn bị':'Mở bài chuẩn bị',done:!!completion?.preparation_submitted});
    steps.forEach((s,idx)=>trams.push({nhan:idx===0?'🎯 Trạm tiếp theo':'🧭 Trạm bổ trợ',title:s.title,href:s.href,label:s.label,chinh:idx===0}));
    if(trams.length<4&&next?.[0]){
      trams.push({nhan:'🚀 Trạm kế tiếp',title:`Chuẩn bị sang mục tiếp theo: ${next[0].ku_name}`,href:`/hoc/${encodeURIComponent(next[0].ku_id)}`,label:`Mở bài ${next[0].ku_name}`,done:false});
    }
  }
  return <div className={cd?'wrap trang-chuong':'wrap'} style={cd?({['--mau-chuong' as string]:cd.mau} as CSSProperties):undefined}><RefreshLearningPath/><DauTrang tieuDe={<>Lộ trình của em · {unit.ku_name}</>} phu={(rule?rec?.diagnosis:null)??(mastery==null?'Chưa đủ bằng chứng: làm bài chẩn đoán cơ bản.':`Cấp độ hiện tại: ${tenCapDo(mastery)}. Bài tập được điều chỉnh theo kết quả mới nhất.`)} chuong={params.ku} nhanVat="na" hinh={hinhNhanVat('lo-trinh')} />
    {locked&&<p className="banner">Có thể làm lại bài chuẩn bị sau {new Date(lock.locked_until).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}.</p>}
    <p className="hint">Tiến độ: {completion ? `${completion.activities_complete}/${completion.activities_required} hoạt động hoàn thành` : "Chưa đọc được tổng hợp tiến độ"}. Lộ trình tự cập nhật khi quay lại trang.</p>
    <ol className="lt-ban-do">
      {trams.map((s,i)=>(
        <li className={'lt-tram'+(s.done?' lt-tram--xong':'')+(s.chinh?' lt-tram--chinh':'')} key={i}>
          <span className="lt-tram__so" aria-hidden="true">{s.done?'✓':i+1}</span>
          <div className="lt-tram__noi">
            <span className="lt-tram__nhan">{s.nhan}{s.done?' · Đã xong':''}</span>
            <p>{s.title}</p>
            <a className={s.chinh?'btnlink':'action-link'} href={s.href}>{s.label}</a>
          </div>
        </li>
      ))}
    </ol>
    {rule==='R01'&&<Reflection kuId={params.ku}/>}
    {!rule&&mastery!=null&&mastery>=2&&next?.[0]&&trams.every(t=>!t.href.includes(encodeURIComponent(next[0].ku_id)))&&<a className="action-link" href={`/hoc/${encodeURIComponent(next[0].ku_id)}`}>Bài tiếp theo: {next[0].ku_name}</a>}
    <p className="hint">Mở học liệu không được tính là đã nắm bài. Kết quả được đánh giá lại khi em nộp bài.</p>
  </div>;
}
