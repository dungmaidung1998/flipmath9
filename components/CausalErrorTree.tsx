 'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/dfle/do-thi-loi-toan-9.js, @/lib/dfle/noi-dung.js, ./MathText
 */
import {useState} from 'react';
import {ALL_ERROR_NODES as ERROR_NODES,ALL_CAUSAL_EDGES as CAUSAL_EDGES} from '@/lib/dfle/do-thi-loi-toan-9.js';
import {ALL_ERRORS as ERRORS} from '@/lib/dfle/noi-dung.js';
import MathText from './MathText';
import './teacher-insights.css';
type ObservedError={code:string;count:number;misconception?:string;viDu?:string};
/**
 * Component React `CausalErrorTree`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function CausalErrorTree({observedErrors=[],onSelectError}:{observedErrors?:ObservedError[];onSelectError?:(code:string)=>void}){
 const [selected,setSelected]=useState('');
 const node=ERROR_NODES.find((n:any)=>n.id===selected),observed=observedErrors.find(e=>e.code===selected),example=ERRORS.find((e:any)=>e.code===selected)?.viDu;
 const edges=CAUSAL_EDGES.filter((e:any)=>e.from===selected||e.to===selected);
 return <div className="ti-model"><p className="ti-note">Mô hình tham khảo: các liên kết là giả thuyết của mô hình, không phải kết quả chẩn đoán hoặc tỷ lệ giảm nguy cơ đã kiểm chứng ở lớp.</p><label>Chọn nội dung cần tìm hiểu<select value={selected} onChange={e=>{setSelected(e.target.value);onSelectError?.(e.target.value);}}><option value="">Chọn một nội dung…</option>{ERROR_NODES.map((n:any)=><option key={n.id} value={n.id}>{n.name}</option>)}</select></label>
 {node&&<><h3>{node.name}</h3><p>{observed?.count?`${observed.count} lượt ghi nhận trong dữ liệu đang xem.`:'Chưa ghi nhận lỗi này trong dữ liệu đang xem.'}</p>{example&&<div className="ti-example"><strong>Ví dụ minh họa, không phải bài làm của lớp</strong><p><MathText>{example}</MathText></p></div>}
 <h4>Nội dung liên quan trong mô hình</h4><p className="ti-muted">Giáo viên cần dùng câu thăm dò trước khi xác định nguyên nhân.</p><div className="ti-related">{edges.map((e:any)=>{const id=e.from===selected?e.to:e.from;return <button key={`${e.from}:${e.to}`} onClick={()=>{setSelected(id);onSelectError?.(id);}}>{ERROR_NODES.find((n:any)=>n.id===id)?.name??id}</button>;})}{!edges.length&&<p>Chưa có liên kết tham khảo.</p>}</div>
 <details><summary>Chi tiết mô hình nghiên cứu</summary><p>Mã: {node.id}. Vai trò cấu trúc: {node.role}. Trọng số dưới đây không được diễn giải là xác suất can thiệp thành công.</p><ul>{edges.map((e:any)=><li key={`${e.from}:${e.to}`}>{e.from} → {e.to}: {e.weight}</li>)}</ul></details></>}
 </div>;
}
