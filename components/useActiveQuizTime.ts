'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./LearningScreen, @/lib/learningMetrics
 */
import {useContext,useEffect,useRef} from 'react';
import {LearningActive} from './LearningScreen';
import {activeElapsed} from '@/lib/learningMetrics';
/**
 * Hàm `useActiveQuizTime(enabled)`: xử lý dữ liệu đầu vào và trả kết quả.
 */
export function useActiveQuizTime(enabled=true){
  const visible=useContext(LearningActive);
  const active=visible&&enabled;
  const seconds=useRef(0),last=useRef(0),touch=useRef(0);
  useEffect(()=>{
    last.current=performance.now();touch.current=last.current;
    const tick=()=>{const now=performance.now();seconds.current+=activeElapsed(last.current,now,touch.current,!document.hidden&&active);last.current=now;};
    const interact=()=>{tick();touch.current=performance.now();};
    const visibility=()=>{last.current=performance.now();};
    const events=['pointerdown','keydown','wheel','touchstart'];
    events.forEach(e=>window.addEventListener(e,interact,{passive:true}));document.addEventListener('visibilitychange',visibility);
    const timer=setInterval(tick,500);
    return ()=>{clearInterval(timer);events.forEach(e=>window.removeEventListener(e,interact));document.removeEventListener('visibilitychange',visibility);};
  },[active]);
  return seconds;
}
