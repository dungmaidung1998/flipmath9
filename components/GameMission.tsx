'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./LearningScreen
 */
import {useContext,useEffect,useState,type ReactNode} from 'react';
import LearningScreen,{LearningActive,LearningBack,LearningNext} from './LearningScreen';
import './game-mission.css';
/**
 * Component React `useGameMission`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export function useGameMission(){
 const active=useContext(LearningActive);
 const [started,setStarted]=useState(false),[help,setHelp]=useState(false),[automatic,setAutomatic]=useState(true),[visible,setVisible]=useState(true);
 useEffect(()=>{const update=()=>setVisible(!document.hidden);update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update);},[]);
 return {started,setStarted,help,setHelp,automatic,setAutomatic,canRun:active&&started&&!help&&visible,autoRun:active&&started&&!help&&visible&&automatic};
}
/**
 * Component React `GameMission`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function GameMission({mission,title,intro,icon,step,finished,ready,onStart,onAdvance,children}:{mission:ReturnType<typeof useGameMission>;title:string;intro:string;icon:string;step:string;finished:boolean;ready:boolean;onStart?:()=>void;onAdvance?:()=>void;children:ReactNode}){
 const back=useContext(LearningBack),next=useContext(LearningNext);
 return <LearningScreen title={title} step={!mission.started?'Sẵn sàng cho thử thách?':finished?'Hoàn thành nhiệm vụ':step}
 onBack={()=>{window.dispatchEvent(new Event('learning-step-leave'));if(back)back();else mission.setStarted(false);}}
 onNext={()=>{if(!mission.started){onStart?.();mission.setStarted(true);}else if(finished){window.dispatchEvent(new Event('learning-step-leave'));if(next)next();else window.location.assign('/bai-hoc');}else onAdvance?.();}}
 nextLabel={!mission.started?'Bắt đầu →':finished?'Tiếp tục bài học →':'Tiếp theo →'} disabled={mission.started&&!finished&&!ready}
 status={!mission.started?'Không giới hạn thời gian suy nghĩ.':finished?'Em có thể tiếp tục bài học hoặc chơi lại.':mission.help?'Đang xem hướng dẫn · Tự chuyển đã tạm dừng.':ready?(mission.automatic?'Đã hoàn thành bước này. Em có thể bấm Tiếp theo ngay.':'Em bấm Tiếp theo khi đã sẵn sàng.'):'Hoàn thành thử thách để chuyển bước.'}>
 <div className="game-mission"><div className="mission-help-toggle"><button aria-expanded={mission.help} onClick={()=>mission.setHelp(!mission.help)}>？ Cách chơi</button></div>
 {mission.help&&<aside className="mission-help-panel"><p>{intro}</p><label><input type="checkbox" checked={mission.automatic} onChange={e=>mission.setAutomatic(e.target.checked)}/> Tự chuyển khi hoàn thành (với trò có tự chuyển)</label><p>Quay lại giữ tiến độ trong trang. Tải lại trang có thể bắt đầu lại trò chơi.</p></aside>}
 {!mission.started?<div className="mission-welcome"><div aria-hidden="true">{icon}</div><h3>{title}</h3><p>{intro}</p></div>:children}
 </div></LearningScreen>;
}
