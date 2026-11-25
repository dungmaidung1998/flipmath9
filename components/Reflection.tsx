'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import {useState} from 'react';
/**
 * Component React `Reflection`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function Reflection({kuId}:{kuId:string}){
  const [text,setText]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  return <form id="tom-tat" className="card" onSubmit={async e=>{e.preventDefault();setBusy(true);try{const r=await fetch('/api/phan-tu',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kuId,text})});const d=await r.json();if(!r.ok)throw new Error(d.error);setMessage('Đã lưu tóm tắt. Em quay lại làm bài để kiểm tra điều vừa hiểu.');}catch(e){setMessage(e instanceof Error?e.message:'Không lưu được');}finally{setBusy(false);}}}>
    <h2>Tự giải thích sau khi xem</h2><label>Nêu quy tắc, một ví dụ và điều em còn thắc mắc<textarea required minLength={20} maxLength={4000} rows={5} value={text} onChange={e=>setText(e.target.value)}/></label><button disabled={busy} className="primary">{busy?'Đang lưu…':'Lưu tóm tắt'}</button><p role="status">{message}</p>
  </form>;
}
