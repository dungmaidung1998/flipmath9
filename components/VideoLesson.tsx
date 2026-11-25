'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/learningMetrics
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {watchedSeconds} from '@/lib/learningMetrics';

/**
 * ĐO THỜI GIAN HỌC CÓ TƯƠNG TÁC
 * ---------------------------------------------------------------------------
 * Quyết định thiết kế (mục 6.2 bản thiết kế nghiên cứu): KHÔNG đo bằng thời gian
 * mở trang. Chỉ cộng giờ học khi đồng thời thoả ba điều kiện:
 *   1. trình phát đang chạy,
 *   2. tab đang hiển thị,
 *   3. người học có tương tác trong vòng IDLE_LIMIT giây gần nhất.
 *
 * Khi đang phát mà quá IDLE_LIMIT không có tương tác nào, hệ thống ghi một sự kiện
 * `video_idle` (để đối chiếu khi kiểm thử T2) và ngừng cộng giờ.
 */

const TICK_MS = 1000;
const FLUSH_SEC = 30;      // gom bao nhiêu giây thì gửi một lần
const IDLE_LIMIT_SEC = 120;

type Props = { kuId: string; title: string; url: string | null; durationSec: number | null };

/**
 * Component React `VideoLesson`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function VideoLesson({ kuId, title, url, durationSec }: Props) {
  const [playing, setPlaying] = useState(false);
  const [activeSec, setActiveSec] = useState(0);
  const [idle, setIdle] = useState(false);
  const [coverage,setCoverage]=useState<number|null>(null);
  const [saveError,setSaveError]=useState(false);
  const position=useRef<()=>number>(()=>NaN), previousPosition=useRef<number|null>(null);
  const videoRef=useRef<HTMLVideoElement>(null), seconds=useRef(new Set<number>()), sending=useRef(false);
  const reportCoverage=useCallback(async()=>{
    if(sending.current||!url)return;
    sending.current=true;
    const batch=Array.from(seconds.current).slice(0,120);
    try{const r=await fetch('/api/video-coverage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kuId,url,seconds:batch}),keepalive:true});if(!r.ok)throw Error();const d=await r.json();batch.forEach(s=>seconds.current.delete(s));setCoverage(d.video_percent??null);if(d.video_complete)window.dispatchEvent(new CustomEvent('f9-buoc-xong', { detail: 'video' }));setSaveError(false);}catch{setSaveError(true);}finally{sending.current=false;}
  },[kuId,url]);
  useEffect(()=>{void reportCoverage();const timer=setInterval(()=>void reportCoverage(),5000);const hide=()=>{void reportCoverage();};window.addEventListener('pagehide',hide);return()=>{clearInterval(timer);window.removeEventListener('pagehide',hide);void reportCoverage();};},[reportCoverage]);
  const attachPosition=useCallback((read:()=>number)=>{position.current=read;},[]);

  const pending = useRef(0);          // số giây chưa gửi
  const lastInteract = useRef(Date.now());
  const idleReported = useRef(false);
  const playingRef = useRef(false);
  playingRef.current = playing;

  const send = useCallback((events: any[]) => {
    if (!events.length) return;
    const payload = JSON.stringify({ events });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/events', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
    }
  }, []);

  const flush = useCallback(() => {
    if (pending.current <= 0) return;
    const sec = pending.current;
    pending.current = 0;
    send([{ kuId, type: 'video_active', durationSec: sec }]);
  }, [kuId, send]);

  // ghi nhận tương tác của người học
  useEffect(() => {
    const touch = () => {
      lastInteract.current = Date.now();
      if (idleReported.current) {
        idleReported.current = false;
        setIdle(false);
      }
    };
    const evs = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'mousemove'];
    evs.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, touch));
  }, []);

  // nhịp đếm giây
  useEffect(() => {
    const t = setInterval(() => {
      const current=videoRef.current?.currentTime??position.current();
      const previous=previousPosition.current;
      previousPosition.current=Number.isFinite(current)?current:null;
      if (!playingRef.current) return;
      if (document.visibilityState !== 'visible') return;
      // Tua lùi khi đang phát = xem lại một đoạn. GV-17 gom các đoạn bị xem lại nhiều để giảng lại đúng chỗ.
      if (previous != null && Number.isFinite(current) && current < previous - 2.5) {
        // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
        send([{ kuId, type: 'video_replay', payload: { tu: Math.round(current), den: Math.round(previous) } }]);
      }

      const idleFor = (Date.now() - lastInteract.current) / 1000;
      if (idleFor > IDLE_LIMIT_SEC) {
        if (!idleReported.current) {
          idleReported.current = true;
          setIdle(true);
          flush();
          // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
          send([{ kuId, type: 'video_idle', payload: { reason: 'khong-tuong-tac', idleFor: Math.round(idleFor) } }]);
        }
        return; // KHÔNG cộng giờ học
      }

      pending.current += 1;
      // A jump of more than 2.5 media seconds is seeking, not watched coverage.
      watchedSeconds(previous,current).forEach(s=>seconds.current.add(s));
      setActiveSec((s) => s + 1);
      if (pending.current >= FLUSH_SEC) flush();
    }, TICK_MS);
    return () => clearInterval(t);
  }, [flush, kuId, send]);

  // gửi nốt khi rời trang hoặc ẩn tab
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [flush]);

  const pct = coverage ?? 0;
  const yt = url ? youtubeId(url) : null;
  // Giữ nguyên identity của callback giữa các lần render. activeSec tăng mỗi
  // giây; nếu truyền arrow function mới vào YouTube ở mỗi render, effect bên
  // trong sẽ destroy/recreate iframe, gây chớp đen đúng theo nhịp đếm.
  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => {setPlaying(false);previousPosition.current=null;}, []);

  return (
    <div className="card">
      <h2>Video bài học</h2>
      <p style={{ margin: '0 0 12px', fontWeight: 600 }}>{title}</p>

      {yt ? (
        <YouTube videoId={yt} onPlay={handlePlay} onPause={handlePause} attachPosition={attachPosition} />
      ) : url ? (
        <video
          ref={videoRef}
          src={url}
          controls
          style={{ width: '100%', borderRadius: 8, background: '#000' }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); flush(); send([{ kuId, type: 'video_complete' }]); }}
        />
      ) : (
        <div className="banner" style={{ marginBottom: 0 }}>
          Bài này chưa có video. Em có thể đọc học liệu bên dưới hoặc hỏi thầy cô.
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <div className="bar">
          <span>Đoạn đã xem</span>
          <span className="track"><span className="fill" style={{ width: pct + '%' }} /></span>
          <span className="n">{coverage===null?'—':`${pct}%`}</span>
        </div>
        <p className="hint">
          {playing
            ? idle
              ? 'Video đang chạy nhưng không thấy em thao tác — hệ thống tạm dừng tính giờ học.'
              : `Đang tính giờ học · ${Math.floor(activeSec / 60)} phút ${activeSec % 60} giây`
            : 'Bấm phát để bắt đầu. Hệ thống chỉ tính thời gian em thực sự đang xem.'}
        </p>
        {saveError&&<p className="err">Chưa đồng bộ được tiến độ video; hệ thống sẽ thử lại.</p>}
      </div>
    </div>
  );
}

/**
 * Component React `youtubeId`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function youtubeId(url: string): string | null {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

/** Nhúng YouTube qua IFrame API để bắt được sự kiện phát và tạm dừng. */
function YouTube({ videoId, onPlay, onPause, attachPosition }: { videoId: string; onPlay: () => void; onPause: () => void; attachPosition:(read:()=>number)=>void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let player: any;
    let cancelled = false;

    const init = () => {
      if (cancelled || !box.current) return;
      player = new (window as any).YT.Player(box.current, {
        videoId,
        width: '100%', height: '100%',
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady:()=>attachPosition(()=>player?.getCurrentTime?.()??NaN),
          onStateChange: (e: any) => {
            const YT = (window as any).YT;
            if (e.data === YT.PlayerState.PLAYING) onPlay();
            else onPause();
          }
        }
      });
    };

    if ((window as any).YT?.Player) {
      init();
    } else {
      const prev = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => { prev?.(); init(); };
      if (!document.getElementById('yt-iframe-api')) {
        const s = document.createElement('script');
        s.id = 'yt-iframe-api';
        s.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(s);
      }
    }
    return () => { cancelled = true; try { player?.destroy?.(); } catch {} };
  }, [videoId, onPlay, onPause, attachPosition]);

  return <div className="youtube-frame" style={{ aspectRatio: '16 / 9', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
    <div ref={box} style={{ width: '100%', height: '100%' }} />
  </div>;
}
