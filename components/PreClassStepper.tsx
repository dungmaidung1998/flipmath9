'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./LearningScreen, @/components/NhanVat, @/lib/nhanVat, @/lib/chuDeChuong
 */
import React, { Children, Fragment, isValidElement, useEffect, useRef, useState, type CSSProperties } from 'react';
import LearningScreen, { LearningBack, LearningActive, LearningNext } from './LearningScreen';
import NhanVat from '@/components/NhanVat';
import type { LoiNhanVat } from '@/lib/nhanVat';
import { chuDeChuong } from '@/lib/chuDeChuong';

/** Trạng thái đã xong của từng bước có điều kiện (máy chủ biết lúc mở trang; trình duyệt báo thêm khi em làm xong). */
export type DaXong = { game: boolean; video: boolean; quiz: boolean };

type Props = {
  /** Bước 0 Soát lỗi cũ (chỉ học sinh). */
  soatNode?: React.ReactNode;
  /** Khoá thứ tự các bước (học sinh). Giáo viên xem thử thì không khoá. */
  khoa?: boolean;
  daXong?: DaXong;
  hasGame: boolean;
  gameNode?: React.ReactNode;
  videoNode?: React.ReactNode;
  /** Bài ôn tập: bước video được thay bằng "Tổng hợp kiến thức" (không khoá). */
  videoKind?: 'video' | 'tong-hop';
  /** Bước "Ghi vở" ngay sau video: xem tóm tắt, chép 4 dòng vào vở. Không khoá bước sau. */
  ghiVoNode?: React.ReactNode;
  /** Bước tuỳ chọn "Thử tay" (thí nghiệm của mục), không khoá bước sau. */
  thuTayNode?: React.ReactNode;
  hocLieuNode?: React.ReactNode;
  quizNode?: React.ReactNode;
  completionNode?: React.ReactNode;
  chuong?: string | null;
};

/**
 * Component React `flatten`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function flatten(node: React.ReactNode): React.ReactNode[] {
  return Children.toArray(node).flatMap(child =>
    isValidElement(child) && child.type === Fragment
      ? flatten((child.props as { children: React.ReactNode }).children)
      : [child]
  );
}

/**
 * Component React `getPaneIcon`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function getPaneIcon(kind: string): string {
  switch (kind) {
    case 'soat': return '🪤';
    case 'game': return '🎮';
    case 'video': return '🎬';
    case 'tong-hop': return '📚';
    case 'sheet': return '📝';
    case 'thu-tay': return '🧪';
    case 'ghi-vo': return '📒';
    case 'quiz': return '✍️';
    case 'completion': return '🏆';
    default: return '📌';
  }
}

/**
 * Component React `getPaneShortTitle`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function getPaneShortTitle(kind: string, index: number, totalGames: number): string {
  switch (kind) {
    case 'soat': return 'Soát lỗi';
    case 'game': return totalGames > 1 ? `Game ${index + 1}` : 'Khởi động';
    case 'video': return 'Bài giảng';
    case 'tong-hop': return 'Tổng hợp';
    case 'sheet': return 'Phiếu học';
    case 'thu-tay': return 'Thử tay';
    case 'ghi-vo': return 'Ghi vở';
    case 'quiz': return 'Kiểm tra';
    case 'completion': return 'Hoàn thành';
    default: return 'Nhiệm vụ';
  }
}

const CAN_LAM: Record<string, string> = {
  soat: 'Nộp bài soát lỗi cũ để mở bước tiếp theo.',
  game: 'Chơi xong một lượt trò chơi ôn nền để mở bước tiếp theo.',
  video: 'Xem ít nhất 80% video để mở bước tiếp theo. Tua qua không được tính.',
  quiz: 'Nộp bài kiểm tra nhanh để mở bước tiếp theo.'
};

/**
 * Component React `PreClassStepper`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function PreClassStepper({
  soatNode,
  khoa = false,
  daXong,
  hasGame,
  gameNode,
  videoNode,
  videoKind = 'video',
  ghiVoNode,
  thuTayNode,
  hocLieuNode,
  quizNode,
  completionNode,
  chuong
}: Props) {
  const cd = chuDeChuong(chuong);
  const games = hasGame ? flatten(gameNode) : [];
  const rawPanes = [
    ...(soatNode ? [{ title: 'Soát lỗi cũ', shortTitle: getPaneShortTitle('soat', 0, 0), icon: getPaneIcon('soat'), node: soatNode, kind: 'soat' }] : []),
    ...games.map((node, i) => ({
      title: games.length > 1 ? `Trò chơi ôn tập ${i + 1}` : 'Trò chơi khởi động',
      shortTitle: getPaneShortTitle('game', i, games.length),
      icon: getPaneIcon('game'),
      node,
      kind: 'game'
    })),
    ...(videoNode ? [{
      title: videoKind === 'tong-hop' ? 'Xem tổng hợp kiến thức' : 'Xem video bài học',
      shortTitle: getPaneShortTitle(videoKind, 0, 0),
      icon: getPaneIcon(videoKind),
      node: videoNode,
      kind: videoKind
    }] : []),
    ...(ghiVoNode ? [{ title: 'Tóm tắt và ghi vở', shortTitle: getPaneShortTitle('ghi-vo', 0, 0), icon: getPaneIcon('ghi-vo'), node: ghiVoNode, kind: 'ghi-vo' }] : []),
    ...(thuTayNode ? [{ title: 'Thử tay (không bắt buộc)', shortTitle: getPaneShortTitle('thu-tay', 0, 0), icon: getPaneIcon('thu-tay'), node: thuTayNode, kind: 'thu-tay' }] : []),
    ...(hocLieuNode
      ? [
          {
            title: 'Phiếu hướng dẫn tự học',
            shortTitle: getPaneShortTitle('sheet', 0, 0),
            icon: getPaneIcon('sheet'),
            node: hocLieuNode,
            kind: 'sheet'
          }
        ]
      : []),
    {
      title: 'Kiểm tra nhanh',
      shortTitle: getPaneShortTitle('quiz', 0, 0),
      icon: getPaneIcon('quiz'),
      node: quizNode,
      kind: 'quiz'
    },
    {
      title: 'Tổng kết hoạt động',
      shortTitle: getPaneShortTitle('completion', 0, 0),
      icon: getPaneIcon('completion'),
      node: completionNode,
      kind: 'completion'
    }
  ];

  const panes = rawPanes;
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const [xong, setXong] = useState<Record<string, boolean>>({ soat: false, game: !!daXong?.game, video: !!daXong?.video, quiz: !!daXong?.quiz });
  const [nhac, setNhac] = useState('');
  const xongRef = useRef(xong);
  xongRef.current = xong;

  /** Bước i đã đạt điều kiện qua bước chưa (bước không có điều kiện thì luôn đạt). */
  const dat = (i: number, x = xongRef.current) => !khoa || !(panes[i].kind in CAN_LAM) || !!x[panes[i].kind];
  /** Được vào bước i khi mọi bước trước đó đã đạt. */
  const duocVao = (i: number, x = xongRef.current) => panes.slice(0, i).every((_, j) => dat(j, x));
  /** Bước đang dở: bước đầu tiên chưa đạt (hoặc bước cuối). */
  const buocDangDo = (x = xongRef.current) => { const k = panes.findIndex((_, j) => !dat(j, x)); return k < 0 ? panes.length - 1 : k; };

  function change(value: number) {
    if (value > step && !duocVao(value)) {
      const chan = panes.findIndex((_, j) => j < value && !dat(j));
      setNhac(CAN_LAM[panes[chan]?.kind] ?? 'Em hoàn thành bước này trước nhé.');
      return;
    }
    setNhac('');
    window.dispatchEvent(new Event('learning-step-leave'));
    setStep(value);
    setVisited(old => (old.includes(value) ? old : [...old, value]));
    try {
      sessionStorage.setItem('learning-step:' + location.pathname, String(value));
    } catch {}
  }
  const changeRef = useRef(change);
  changeRef.current = change;

  useEffect(() => {
    // Quay lại đúng bước đang dở: không vượt quá bước đầu tiên chưa đạt.
    let value = 0;
    try { value = Number(sessionStorage.getItem('learning-step:' + location.pathname)); } catch {}
    if (!Number.isInteger(value) || value < 0 || value >= panes.length) value = 0;
    // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
    if (khoa) value = soatNode ? 0 : Math.min(Math.max(value, 0), buocDangDo());
    setStep(value);
    setVisited([value]);

    const xongBuoc = (e: Event) => {
      const b = String((e as CustomEvent).detail);
      setXong(old => (old[b] ? old : { ...old, [b]: true }));
      setNhac('');
    };
    // Không có lỗi cần soát (hoặc hôm nay đã soát): tự sang bước đang dở.
    const boQuaSoat = () => {
      const x = { ...xongRef.current, soat: true };
      xongRef.current = x;
      setXong(x);
      // Không khoá bước: sang bước ngay sau phần soát lỗi (khỏi nhảy tới bước cuối).
      const k = khoa ? panes.findIndex((_, j) => !dat(j, x)) : Math.min(1, panes.length - 1);
      window.setTimeout(() => changeRef.current(k < 0 ? panes.length - 1 : k), 1200);
    };
    window.addEventListener('f9-buoc-xong', xongBuoc);
    window.addEventListener('f9-soat-bo-qua', boQuaSoat);
    return () => { window.removeEventListener('f9-buoc-xong', xongBuoc); window.removeEventListener('f9-soat-bo-qua', boQuaSoat); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panes.length]);

  // Dựng sẵn bước kế tiếp lúc máy rảnh, để bấm "Tiếp theo" là hiện ngay, không khựng.
  // (Video không dựng sẵn: chỉ tải khi em mở đúng bước video.)
  useEffect(() => {
    const ke = step + 1;
    if (ke >= panes.length || visited.includes(ke)) return;
    const w = window as any;
    const lam = () => setVisited((old) => (old.includes(ke) ? old : [...old, ke]));
    const id = w.requestIdleCallback ? w.requestIdleCallback(lam, { timeout: 2500 }) : window.setTimeout(lam, 900);
    return () => { if (w.cancelIdleCallback) w.cancelIdleCallback(id); else window.clearTimeout(id); };
  }, [step, visited, panes.length]);

  const currentPane = panes[step] ?? panes[0];
  const soBuocXong = panes.filter((p, i) => (visited.includes(i) && step > i) || (p.kind in CAN_LAM && !!xong[p.kind])).length;
  const muc5 = step >= panes.length - 1
    ? 4
    : Math.min(4, Math.max(0, Math.round((soBuocXong / Math.max(1, panes.length - 1)) * 4)));

  return (
    <LearningScreen
      title="Bài học"
      chuong={chuong}
      step={currentPane.title}
      onBack={() => (step > 0 ? change(step - 1) : window.location.assign('/bai-hoc'))}
      onNext={() => (step < panes.length - 1 ? change(step + 1) : window.location.assign('/bai-hoc'))}
      nextLabel={step === panes.length - 1 ? 'Hoàn thành' : 'Tiếp theo →'}
      disabled={step < panes.length - 1 && !dat(step, xong)}
      status={nhac || (step < panes.length - 1 && !dat(step, xong) ? CAN_LAM[currentPane.kind] : '')}
    >
      <div
        className={'stepper-nav-bar' + (cd ? ' stepper-nav-bar--chu-de' : '')}
        role="navigation"
        aria-label="Tiến trình học tập"
        style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}
      >
        {cd && (
          <div className="stepper-chu-de__dau">
            <img className="stepper-chu-de__hinh" src={cd.anhMuc(muc5)} alt={cd.mucTen[muc5]} width={48} height={48} />
            <div className="stepper-chu-de__chu">
              <strong>{cd.bieuTuong} {cd.chuDe} · {cd.mucTen[muc5]}</strong>
              <small>Con đường chủ đề {cd.ten} · mỗi bước xong thêm 1 {cd.donVi}</small>
            </div>
            <span className="stepper-chu-de__dem">{soBuocXong}/{panes.length} {cd.donVi}</span>
          </div>
        )}
        <div className="stepper-nav-steps" style={{ position: 'relative' }}>
          <div className="stepper-nav-track">
            <div
              className="stepper-nav-fill"
              style={{
                width: `${panes.length > 1 ? (step / (panes.length - 1)) * 100 : 100}%`
              }}
            />
          </div>
          <div className="stepper-nav-items">
            {panes.map((p, i) => {
              const isDone = visited.includes(i) && step > i;
              const isCurrent = step === i;
              const canClick = khoa ? i <= step || duocVao(i, xong) : true;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!canClick}
                  aria-label={`${p.title}${canClick ? '' : ' (chưa mở khoá)'}`}
                  className={`stepper-nav-btn ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                  onClick={() => change(i)}
                  title={p.title}
                >
                  <span className="stepper-nav-circle">
                    {isDone ? (cd ? cd.bieuTuong : '✓') : canClick ? p.icon : '🔒'}
                  </span>
                  <span className="stepper-nav-label">{p.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {panes.map((pane, i) => (
        <div key={i} hidden={step !== i} className="truc-quan-buoc">
          {step === i && <NhanVat key={pane.kind} loi={pane.kind as LoiNhanVat} chuong={chuong} moDau={i === 0} compact />}
          <LearningActive.Provider value={step === i}>
            <LearningBack.Provider value={() => (i > 0 ? change(i - 1) : window.location.assign('/bai-hoc'))}>
              <LearningNext.Provider value={() => change(Math.min(panes.length - 1, i + 1))}>
                {visited.includes(i) && (pane.kind === 'video' ? step === i && pane.node : pane.node)}
              </LearningNext.Provider>
            </LearningBack.Provider>
          </LearningActive.Provider>
        </div>
      ))}
    </LearningScreen>
  );
}
