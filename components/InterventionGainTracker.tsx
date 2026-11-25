 'use client';

/**
 * FILE NÀY LÀM GÌ: Biểu đồ dumbbell theo dõi mức cải thiện điểm trước/sau can thiệp theo từng quy tắc sư phạm.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: nhận props từ phân tích lớp giáo viên
 * GỌI TỚI: ./teacher-insights.css
 */
import {useState} from 'react';
import './teacher-insights.css';
export interface RuleEffect{rule:string;ruleLabel:string;issued:number;done:number;pre:number;post:number;gain:number;}
export default function InterventionGainTracker({effects,loadError=false}:{effects:RuleEffect[];loadError?:boolean}){
 const [sort,setSort]=useState('count');
 const paired=effects.filter(e=>e.done>0&&Number.isFinite(e.pre)&&Number.isFinite(e.post)&&Number.isFinite(e.gain)),count=paired.reduce((n,e)=>n+e.done,0),issued=effects.reduce((n,e)=>n+e.issued,0),avg=count?paired.reduce((n,e)=>n+e.gain*e.done,0)/count:null;
 const signed=(v:number)=>(v>0?'+':'')+v.toFixed(2);
 const ordered=[...effects].sort((a,b)=>sort==='count'?b.done-a.done:(b.done?b.gain:-Infinity)-(a.done?a.gain:-Infinity));
 return <section className="ti-panel"><header className="ti-heading"><div><p className="ti-eyebrow">Theo dõi kết quả</p><h2>Kết quả sau hỗ trợ</h2><p className="ti-muted">Tổng hợp theo lớp và quy tắc đề xuất. Điểm quiz chuẩn bị/vận dụng không phải bài đo trước–sau nghiên cứu.</p></div></header>
 {loadError?<p role="alert" className="ti-empty">Không tải được kết quả hỗ trợ. Chưa thể tính chỉ số.</p>:<><div className="ti-kpis"><div><span>Lượt có đề xuất hỗ trợ</span><b>{issued}</b><small>Đếm lượt, không phải học sinh duy nhất</small></div><div><span>Có đủ điểm trước và sau</span><b>{count}<small> / {issued}</small></b><small>{issued-count} lượt chưa có cặp điểm hợp lệ</small></div><div><span>Chênh lệch điểm trung bình</span><b className={avg===null?'':avg<0?'ti-negative':'ti-positive'}>{avg===null?'—':signed(avg)}</b><small>{avg===null?'Chưa đủ dữ liệu':'Điểm trên thang 10 · Có trọng số theo số cặp'}</small></div></div>
 {!effects.length?<p className="ti-empty">Chưa có lượt đề xuất hỗ trợ trong phạm vi này.</p>:<><div className="ti-toolbar"><p>● Điểm trước (xám) · ● Điểm sau (xanh/cam)</p><label>Sắp xếp<select value={sort} onChange={e=>setSort(e.target.value)}><option value="count">Số cặp có dữ liệu</option><option value="gain">Chênh lệch điểm</option></select></label></div><div className="ti-scroll"><table><thead><tr><th>Nhóm cần hỗ trợ</th><th>Cặp điểm / lượt đề xuất</th><th>Điểm trước → sau</th><th>Chênh lệch</th><th>So sánh trên thang 0–10</th></tr></thead><tbody>{ordered.map(e=>{const valid=paired.includes(e),gain=e.gain,before=Math.max(0,Math.min(100,e.pre*10)),after=Math.max(0,Math.min(100,e.post*10));return <tr key={e.rule}><td>{e.ruleLabel}<small className="ti-rule">{e.rule}</small></td><td className="ti-num">{e.done}/{e.issued}</td><td className="ti-num">{valid?`${e.pre.toFixed(1)} → ${e.post.toFixed(1)}`:'Chưa đủ dữ liệu'}</td><td className={valid?(gain<0?'ti-negative':'ti-positive'):''}>{valid?`${signed(gain)} điểm`:'—'}</td><td>{valid?<div className="ti-dumbbell" role="img" aria-label={`Điểm trước ${e.pre}, điểm sau ${e.post}, chênh lệch ${signed(gain)} điểm`}><div className="ti-score-track"><i style={{left:`${Math.min(before,after)}%`,width:`${Math.abs(after-before)}%`,background:gain<0?'#b45309':'#168579'}}/><span style={{left:`${before}%`,background:'#718096'}}/><span style={{left:`${after}%`,background:gain<0?'#b45309':'#168579'}}/></div><div className="ti-axis"><span>0</span><span>5</span><span>10</span></div></div>:'Chưa có cặp đo'}</td></tr>;})}</tbody></table></div></>}
 <p className="ti-note">Chênh lệch = điểm sau − điểm trước, chỉ trên các lượt có đủ hai điểm. Đây là thống kê mô tả, chưa chứng minh thay đổi do riêng hoạt động hỗ trợ gây ra. Thiếu điểm sau không tính là 0.</p></>}
 </section>;
}
