'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import {useEffect,useRef,useState,type ReactNode} from 'react';
import './teacher-workspace.css';
/**
 * Component React `TeacherWorkspace`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function TeacherWorkspace({titles,children,index,onChange}:{titles:string[];children:ReactNode[];index?:number;onChange?:(index:number)=>void}){
 const [local,setLocal]=useState(0),heading=useRef<HTMLHeadingElement>(null);
 const active=index??local;
 useEffect(()=>{const restore=()=>{const raw=new URLSearchParams(location.search).get('view');const n=Number(raw);if(raw!==null&&Number.isInteger(n)&&n>=0&&n<titles.length){setLocal(n);onChange?.(n);}};restore();window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore);},[]);
 function change(n:number){setLocal(n);onChange?.(n);const url=new URL(location.href);url.searchParams.set('view',String(n));history.replaceState(null,'',url);requestAnimationFrame(()=>{heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({block:'start',behavior:'auto'});});}
 return <div className="teacher-workspace">
 <nav className="teacher-views" aria-label="Nội dung báo cáo">{titles.map((title,i)=><button type="button" key={title} aria-current={active===i?'page':undefined} onClick={()=>change(i)}><span>{i+1}</span>{title.includes(' · ')?<em><small>{title.split(' · ')[0]}</small>{title.split(' · ').slice(1).join(' · ')}</em>:title}</button>)}</nav>
 <div className="teacher-view-heading"><p>Màn hình {active+1}/{titles.length}</p><h2 tabIndex={-1} ref={heading}>{titles[active]}</h2></div>
 {children.map((child,i)=><div key={titles[i]} hidden={active!==i} className="teacher-view-content">{child}</div>)}
 <footer className="teacher-view-footer"><button type="button" disabled={active===0} onClick={()=>change(active-1)}>← Quay lại</button><span>{active+1} / {titles.length}</span><button type="button" className="primary" disabled={active===titles.length-1} onClick={()=>change(active+1)}>Tiếp theo →</button></footer>
 </div>;
}
