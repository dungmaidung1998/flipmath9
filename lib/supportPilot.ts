/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
// Versioned pilot content. Import at runtime on the server only: includes answer keys.
export const VERSION = 'fraction-add-v1';
export const ARMS = ['visual', 'steps', 'game'] as const;
export type Arm = typeof ARMS[number];
export const TITLES: Record<Arm,string> = {visual:'Nhìn phân số bằng hình',steps:'Cộng phân số từng bước',game:'Đoàn tàu cùng mẫu'};
type Question = {id:string; stem:string; options:string[]; answer:number};
const q = (id:string,stem:string,options:string[],answer:number):Question => ({id,stem,options,answer});
export const PROBES = [
 q('p1','Viết $1/2$ thành phân số có mẫu 6.',['$1/6$','$3/6$','$2/6$'],1),
 q('p2','Tính $1/5 + 2/5$.',['$3/10$','$2/5$','$3/5$'],2),
];
export const ACTIVITIES:Record<Arm,{intro:string; tasks:Question[]}> = {
 visual:{intro:'Hai thanh có cùng chiều dài: một nửa là 3 phần sáu, một phần ba là 2 phần sáu. Ghép các phần có cùng kích thước; số phần tăng, kích thước mỗi phần giữ nguyên.',tasks:[
  q('v1','Một nửa thanh gồm bao nhiêu phần sáu?',['2','3','6'],1),
  q('v2','Ghép 3 phần sáu và 2 phần sáu được bao nhiêu?',['$5/12$','$5/6$','$6/5$'],1)]},
 steps:{intro:'Ví dụ $1/4 + 1/6$: chọn mẫu chung 12, đổi cả tử và mẫu với cùng thừa số, rồi cộng tử và giữ mẫu.',tasks:[
  q('s1','$1/4 = ?/12$. Tử số mới là:',['1','2','3'],2),
  q('s2','$1/6 = ?/12$. Tử số mới là:',['2','1','6'],0),
  q('s3','$3/12 + 2/12$ bằng:',['$5/24$','$5/12$','$6/12$'],1)]},
 game:{intro:'Mỗi cặp phân số bằng nhau nối thêm một toa tàu. Nhân cả tử và mẫu với cùng một số khác 0.',tasks:[
  q('g1','🚂 Mẫu 8: tìm toa bằng $1/2$.',['$1/8$','$4/8$','$2/8$'],1),
  q('g2','🚂 Mẫu 12: tìm toa bằng $2/3$.',['$2/12$','$6/12$','$8/12$'],2),
  q('g3','🚂 Mẫu 10: tìm toa bằng $3/5$.',['$6/10$','$3/10$','$8/10$'],0)]}
};
export const CHECKS = [
 [q('a1','Tính $1/3 + 1/4$.',['$2/7$','$7/12$','$1/12$'],1),q('a2','Hai đoạn dây dài $2/5$ m và $1/2$ m. Nối lại được bao nhiêu mét?',['$3/7$','$3/10$','$9/10$'],2)],
 [q('b1','Tính $1/6 + 1/3$.',['$1/2$','$2/9$','$2/18$'],0),q('b2','Bình có $3/8$ lít nước, thêm $1/4$ lít. Có tất cả bao nhiêu lít?',['$4/12$','$5/8$','$4/8$'],1)]
];
export const RETENTION = q('d1','Tính $2/7 + 1/2$.',['$3/9$','$3/14$','$11/14$'],2);
export type Evidence = {id:string; choice:number; correct:boolean};
export type Round = {arm:Arm; recommended:Arm; reason:string; eligible:Arm[]; activity:Evidence[]; checks:Evidence[]; seconds:number; switched:boolean};
export type PilotState = {phase:'probe'|'activity'|'check'|'waiting'|'done'|'teacher'; probes:Evidence[]; rounds:Round[]; dueAt?:string; retention?:Evidence; events:{at:string; action:string; seconds:number}[]};
export const initialState = ():PilotState => ({phase:'probe',probes:[],rounds:[],events:[]});
/**
 * Hàm `recommendation`: nhận (probes), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function recommendation(probes:Evidence[]):{arm:Arm;reason:string}{
 if(!probes[0]?.correct)return {arm:'game',reason:'Câu thăm dò cho thấy em cần ôn phân số bằng nhau.'};
 if(!probes[1]?.correct)return {arm:'visual',reason:'Em đổi phân số được; mình xem lại ý nghĩa cộng các phần cùng kích thước.'};
 return {arm:'steps',reason:'Hai câu nền đã đúng; mình luyện quy trình cộng khác mẫu.'};
}
/**
 * Hàm `currentQuestion`: nhận (s), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function currentQuestion(s:PilotState):Question|undefined {
 const r=s.rounds.at(-1);
 if(s.phase==='probe')return PROBES[s.probes.length];
 if(s.phase==='activity'&&r)return ACTIVITIES[r.arm].tasks[r.activity.filter(e=>e.correct).length];
 if(s.phase==='check'&&r)return CHECKS[s.rounds.length-1][r.checks.length];
 if(s.phase==='waiting')return RETENTION;
}
/**
 * Hàm `publicQuestion`: nhận (s), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function publicQuestion(s:PilotState){const value=currentQuestion(s);if(!value)return null;const {answer,...rest}=value;return rest;}
/**
 * Hàm `transition`: nhận (state, action, choice, eligible, seconds, now), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function transition(state:PilotState,action:string,choice:unknown,eligible:Arm[],seconds:number,now:number):PilotState {
 const s: PilotState=JSON.parse(JSON.stringify(state));
 const r=s.rounds.at(-1);
 if(s.events.length>=150)throw Error('Lượt ôn đã có quá nhiều thao tác. Em nhờ giáo viên hỗ trợ.');
 const openRound=(arm:Arm,reason:string)=>s.rounds.push({arm,recommended:arm,reason,eligible:[...eligible],activity:[],checks:[],seconds:0,switched:false});
 if(action==='switch'){
  if(s.phase!=='activity'||!r||r.switched||!eligible.includes(choice as Arm)||choice===r.arm)throw Error('Không thể đổi sang hoạt động này.');
  r.arm=choice as Arm;r.switched=true;r.activity=[];
 }else if(action==='retry'){
  if(s.phase!=='teacher'||s.rounds.length!==1||!eligible.includes(choice as Arm)||choice===r?.arm)throw Error('Chọn một cách ôn khác đã được duyệt.');
  openRound(choice as Arm,'Lỗi còn xuất hiện sau lượt đầu; thử hình thức khác.');s.phase='activity';
 }else if(action==='answer'){
  const item=currentQuestion(s);
  if(!item||!Number.isInteger(choice)||Number(choice)<0||Number(choice)>=item.options.length)throw Error('Lựa chọn không hợp lệ.');
  if(s.phase==='waiting'&&(!s.dueAt||now<Date.parse(s.dueAt)))throw Error('Chưa đến lịch kiểm tra duy trì.');
  const e={id:item.id,choice:Number(choice),correct:choice===item.answer};
  if(s.phase==='probe'){
   s.probes.push(e);
   if(s.probes.length===PROBES.length){const rec=recommendation(s.probes);if(!eligible.includes(rec.arm))throw Error('Hoạt động phù hợp chưa được giáo viên duyệt. Em quay lại sau.');openRound(rec.arm,rec.reason);s.phase='activity';}
  }else if(s.phase==='activity'&&r){
   if(!eligible.includes(r.arm))throw Error('Hoạt động đã ngừng được duyệt. Em liên hệ giáo viên.');
   r.activity.push(e);
   if(r.activity.filter(a=>a.correct).length===ACTIVITIES[r.arm].tasks.length)s.phase='check';
  }else if(s.phase==='check'&&r){
   r.checks.push(e);
   if(r.checks.length===2){s.phase=r.checks.every(a=>a.correct)?'waiting':'teacher';if(s.phase==='waiting')s.dueAt=new Date(now+3*86400000).toISOString();}
  }else if(s.phase==='waiting'){s.retention=e;s.phase='done';}
  else throw Error('Lượt kiểm tra đã kết thúc.');
 }else throw Error('Thao tác không hợp lệ.');
 if(r&&(state.phase==='activity'||state.phase==='check'))r.seconds+=seconds;
 s.events.push({at:new Date(now).toISOString(),action:action==='answer'?`${action}:${currentQuestion(state)?.id}:${choice}`:`${action}:${choice}`,seconds});
 return s;
}
