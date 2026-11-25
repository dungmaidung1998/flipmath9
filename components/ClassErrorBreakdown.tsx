 'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./MathText
 */
import {useState} from 'react';
import MathText from './MathText';
import './teacher-insights.css';
export interface ClassErrorItem{code:string;count:number;misconception:string;viDu?:string;}
/**
 * Component React `ClassErrorBreakdown`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function ClassErrorBreakdown({errors,kuId,totalQuizTakers,loadError=false,overviewHref}:{errors:ClassErrorItem[];kuId:string;totalQuizTakers:number;loadError?:boolean;overviewHref?:string}){
 const [search,setSearch]=useState(''),[selected,setSelected]=useState<string|null>(null);
 const observed=errors.filter(e=>e.count>0).sort((a,b)=>b.count-a.count),total=observed.reduce((n,e)=>n+e.count,0),item=observed.find(e=>e.code===selected);
 const visible=observed.filter(e=>e.misconception.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')));
 return <section className="ti-panel"><header className="ti-heading"><div><h2>Những nội dung lớp cần hỗ trợ</h2><p className="ti-muted">Đếm theo lượt trả lời sai ở mục đang chọn; một em có thể sai nhiều lần.</p></div><div className="ti-total"><b>{loadError?'—':total}</b><span>lượt ghi nhận</span></div></header>
 {loadError?<p role="alert" className="ti-empty">Không tải được dữ liệu lỗi. Chưa thể thống kê khó khăn của lớp.</p>:!total?<div className="ti-empty"><h3>Chưa ghi nhận lỗi ở nội dung này</h3><p>Khi học sinh có bài làm gắn mã lỗi, các khó khăn sẽ xuất hiện tại đây.</p><a href={overviewHref??`/gv?ku=${encodeURIComponent(kuId)}`}>Xem tình hình làm bài →</a></div>:<><div className="ti-toolbar"><label>Tìm nội dung<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nhập tên khó khăn…"/></label><span>{totalQuizTakers} học sinh đã làm bài chuẩn bị</span></div><div className="ti-scroll"><table><thead><tr><th>Khó khăn ghi nhận</th><th>Lượt xuất hiện</th><th>Tỷ trọng lượt lỗi</th><th>Chi tiết</th></tr></thead><tbody>{visible.map(e=><tr key={e.code}><td>{e.misconception}</td><td className="ti-num">{e.count}</td><td><div className="ti-inline-bar"><span><i style={{width:`${e.count/total*100}%`}}/></span><b>{Math.round(e.count/total*100)}%</b></div></td><td><button aria-expanded={selected===e.code} onClick={()=>setSelected(selected===e.code?null:e.code)}>Xem chi tiết</button></td></tr>)}</tbody></table>{!visible.length&&<p>Không có nội dung phù hợp.</p>}</div>
 {item&&<section className="ti-detail"><div className="ti-heading"><h3>{item.misconception}</h3><button onClick={()=>setSelected(null)}>Đóng ×</button></div><div className="ti-steps"><article><span>1 · Đã quan sát</span><p>{item.count} lượt trả lời được gắn mã lỗi này.</p><small>Dữ liệu tổng hợp chưa chứa danh sách học sinh và câu trả lời cụ thể.</small></article><article><span>2 · Cần kiểm tra thêm</span><p>Đề nghị học sinh giải thích cách làm và thử một câu tương tự để phân biệt hiểu sai với tính nhầm.</p></article><article><span>3 · Hỗ trợ đề xuất</span><p>Chọn nội dung ôn sau khi xác minh khó khăn; kiểm tra lại bằng câu mới.</p></article></div>{item.viDu&&<div className="ti-example"><strong>Ví dụ minh họa</strong><p><MathText>{item.viDu}</MathText></p></div>}</section>}</>}
 </section>;
}
