'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./tro-choi-nen/amThanh
 */
import {useEffect,useRef,useState} from 'react';
import { phat } from './tro-choi-nen/amThanh';

/** Audio is initialized only by a game button gesture. */
export function useGameAudio(){
  const [music,setMusic]=useState(true);
  const context=useRef<AudioContext|null>(null);
  const loop=useRef<ReturnType<typeof setInterval>|null>(null);
  const notes=useRef(new Set<OscillatorNode>());
  const enabled=useRef(true), started=useRef(false), step=useRef(0);
  function stopMusic(){
    if(loop.current!==null)clearInterval(loop.current);
    loop.current=null;
    for(const oscillator of notes.current){try{oscillator.stop();}catch{}}
    notes.current.clear();
  }
  function tone(ctx:AudioContext,frequency:number,time:number,duration:number,volume:number,background=false){
    const oscillator=ctx.createOscillator(),gain=ctx.createGain();
    oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,time);
    if(!background&&frequency<300)oscillator.frequency.exponentialRampToValueAtTime(frequency*.65,time+duration);
    gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+.025);gain.gain.exponentialRampToValueAtTime(.001,time+duration);
    oscillator.connect(gain);gain.connect(ctx.destination);
    if(background)notes.current.add(oscillator);
    oscillator.onended=()=>{notes.current.delete(oscillator);oscillator.disconnect();gain.disconnect();};
    oscillator.start(time);oscillator.stop(time+duration+.03);
  }
  function startMusic(){
    const ctx=context.current;
    if(!ctx||!enabled.current||!started.current||document.hidden||loop.current!==null)return;
    const melody=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,659.25,783.99,987.77,783.99,587.33,659.25,523.25,0];
    const tick=()=>{const f=melody[step.current++%melody.length];if(f)tone(ctx,f,ctx.currentTime,.48,.018,true);};
    tick();loop.current=setInterval(tick,550);
  }
  function prepare(){
    try{const ctx=context.current??new AudioContext();context.current=ctx;void ctx.resume().then(startMusic).catch(()=>{});return ctx;}catch{return null;}
  }
  function begin(){started.current=true;prepare();}
  function toggleMusic(){enabled.current=!enabled.current;setMusic(enabled.current);if(enabled.current)prepare();else stopMusic();}
  function leave(){started.current=false;stopMusic();}
  function effect(ok:boolean){ if (ok) phat('dung'); else phat('sai'); }
  useEffect(()=>{
    const visibility=()=>{if(document.hidden)stopMusic();else startMusic();};
    document.addEventListener('visibilitychange',visibility);
    window.addEventListener('learning-step-leave',leave);
    return ()=>{window.removeEventListener('learning-step-leave',leave);document.removeEventListener('visibilitychange',visibility);stopMusic();void context.current?.close().catch(()=>{});context.current=null;};
  },[]);
  return {music,toggleMusic,begin,leave,effect};
}
