'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useEffect, useRef, useState } from 'react';

/**
 * SOẠN HỌC LIỆU CHO TỪNG ĐƠN VỊ KIẾN THỨC
 *
 * Việc chính của màn này không phải là lưu một chuỗi url — mà là lấy cho ĐÚNG
 * thời lượng video. Thời lượng là mẫu số của tỉ lệ hoàn thành, và tỉ lệ đó là
 * điều kiện của quy tắc R01 và R09. Bắt giáo viên tự bấm đồng hồ rồi gõ tay là
 * mời gọi sai số, nên với video YouTube thì trình phát tự khai thời lượng: dán
 * link xong, bản xem thử tải lên và con số điền vào ô một cách tự động.
 *
 * Bản xem thử còn có tác dụng thứ hai, quan trọng không kém: giáo viên nhìn
 * thấy ngay mình vừa dán đúng bài hay nhầm bài — chứ không phải chờ tới lúc một
 * em học sinh mở ra mới biết.
 */

type HocLieu = { contentId: string; title: string; url: string | null; nguon: string | null };
type Video = HocLieu & { durationSec: number | null };
export type MucNoiDung = {
  kuId: string;
  kuName: string;
  lessonId: string | null;
  canVideo: boolean;
  video: Video | null;
  hocLieu: HocLieu[];
};

const phutGiay = (s: number | null) =>
  s === null || !Number.isFinite(s) ? '—' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

/**
 * Component React `maYouTube`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function maYouTube(url: string): string | null {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

/**
 * Component React `SoanNoiDung`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function SoanNoiDung({ muc }: { muc: MucNoiDung[] }) {
  const [mo, setMo] = useState<string | null>(null);
  const [dl, setDl] = useState(muc);

  const capNhat = (contentId: string, thayDoi: Partial<Video>) =>
    setDl((cu) =>
      cu.map((m) => ({
        ...m,
        video: m.video?.contentId === contentId ? { ...m.video, ...thayDoi } : m.video,
        hocLieu: m.hocLieu.map((h) => (h.contentId === contentId ? { ...h, ...thayDoi } : h))
      }))
    );

  const soChuaGan = dl.filter((m) => m.canVideo && !m.video?.url).length;

  return (
    <>
      {soChuaGan > 0 && (
        <div className="banner">
          Còn <b>{soChuaGan}</b> trên {dl.length} mục chưa có video. Học sinh mở những mục này ra
          sẽ không có gì để xem, nên pha học trước giờ lên lớp chưa chạy được.
        </div>
      )}

      {dl.map((m) => {
        const dangMo = mo === m.kuId;
        const daGan = !!m.video?.url;
        return (
          <div className="card" key={m.kuId}>
            <div className="dong-muc">
              <div>
                <strong>{m.kuName}</strong>
                <div className="hint">
                  {m.lessonId ?? ''}
                </div>
              </div>
              <div className="dong-muc-phai">
                <span className={'tag' + (!m.canVideo ? '' : daGan ? ' ok' : ' warn')}>
                  {!m.canVideo
                    ? 'không cần video'
                    : daGan
                      ? `video ${phutGiay(m.video?.durationSec ?? null)}`
                      : 'chưa có video'}
                </span>
                <span className={'tag' + (m.hocLieu.some((h) => h.url) ? ' ok' : '')}>
                  {m.hocLieu.some((h) => h.url) ? 'có phiếu' : 'chưa có phiếu'}
                </span>
                <button className="ghost" onClick={() => setMo(dangMo ? null : m.kuId)}>
                  {dangMo ? 'Đóng' : 'Sửa'}
                </button>
              </div>
            </div>

            {dangMo && (
              <div className="khung-sua">
                {m.canVideo && m.video && <OHocLieu item={m.video} laVideo onLuu={capNhat} />}
                {m.hocLieu.map((h) => (
                  <OHocLieu key={h.contentId} item={h} laVideo={false} onLuu={capNhat} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/**
 * Component React `OHocLieu`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function OHocLieu({
  item,
  laVideo,
  onLuu
}: {
  item: Video | HocLieu;
  laVideo: boolean;
  onLuu: (contentId: string, thayDoi: Partial<Video>) => void;
}) {
  const [url, setUrl] = useState(item.url ?? '');
  const [nguon, setNguon] = useState(item.nguon ?? '');
  const [giay, setGiay] = useState<number | null>((item as Video).durationSec ?? null);
  const [tuDong, setTuDong] = useState(false);
  const [trangThai, setTrangThai] = useState<string | null>(null);
  const [dangLuu, setDangLuu] = useState(false);

  const ma = laVideo && url ? maYouTube(url) : null;

  async function luu() {
    setDangLuu(true);
    setTrangThai(null);
    const res = await fetch('/api/noi-dung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId: item.contentId, url, nguon, durationSec: giay })
    });
    const kq = await res.json().catch(() => ({}));
    setDangLuu(false);
    if (!res.ok) {
      setTrangThai(kq.error ?? 'Không lưu được');
      return;
    }
    setTrangThai('Đã lưu');
    onLuu(item.contentId, { url: url || null, nguon: nguon || null, durationSec: giay });
  }

  return (
    <div className="o-hoc-lieu">
      <div className="lbl">{laVideo ? 'Video bài học' : 'Phiếu hướng dẫn tự học'} — {item.title}</div>

      <input
        value={url}
        placeholder={laVideo ? 'Dán đường dẫn YouTube của bài này' : 'Đường dẫn phiếu học tập (Drive, PDF…)'}
        onChange={(e) => {
          setUrl(e.target.value);
          setTrangThai(null);
          if (laVideo) { setGiay(null); setTuDong(false); }
        }}
      />

      {laVideo && ma && (
        <>
          <XemThu
            videoId={ma}
            onThoiLuong={(s) => {
              // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
              if (s > 0) { setGiay(Math.round(s)); setTuDong(true); }
            }}
          />
          <p className="hint">
            {tuDong
              ? `Thời lượng đọc được từ trình phát: ${phutGiay(giay)} (${giay} giây). Con số này là mẫu số của tỉ lệ hoàn thành video — đừng sửa trừ khi biết rõ đang làm gì.`
              : 'Đang đọc thời lượng từ trình phát… Nếu mãi không hiện, nhập tay bên dưới theo dạng phút:giây.'}
          </p>
          <label className="nho">
            Thời lượng (phút:giây)
            <input
              className="hep"
              value={giay === null ? '' : phutGiay(giay)}
              placeholder="6:12"
              onChange={(e) => {
                // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
                const m = e.target.value.match(/^(\d+):([0-5]?\d)$/);
                setTuDong(false);
                setGiay(m ? Number(m[1]) * 60 + Number(m[2]) : null);
              }}
            />
          </label>
        </>
      )}

      {laVideo && url && !ma && (
        <p className="hint">
          Không nhận ra đây là đường dẫn YouTube, nên không tự đọc được thời lượng. Nhập tay bên dưới
          theo dạng phút:giây — và nhớ kiểm tra lại bằng cách mở video đếm thử.
        </p>
      )}
      {laVideo && url && !ma && (
        <label className="nho">
          Thời lượng (phút:giây)
          <input
            className="hep"
            value={giay === null ? '' : phutGiay(giay)}
            placeholder="6:12"
            onChange={(e) => {
              // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
              const m = e.target.value.match(/^(\d+):([0-5]?\d)$/);
              setGiay(m ? Number(m[1]) * 60 + Number(m[2]) : null);
            }}
          />
        </label>
      )}

      <label className="nho">
        Nguồn — để trống nếu do nhóm tự làm
        <input
          value={nguon}
          placeholder="Tên kênh / tác giả, ví dụ: Kênh Toán 9 ABC — dùng lại, có ghi nguồn"
          onChange={(e) => setNguon(e.target.value)}
        />
      </label>
      <p className="hint">
        Dùng video của người khác thì <b>bắt buộc</b> khai ở đây. Ô này đi thẳng vào mục học liệu
        của báo cáo; để trống là hồ sơ hiểu rằng nhóm tự sản xuất.
      </p>

      <div className="hang-nut">
        <button className="primary" onClick={luu} disabled={dangLuu}>{dangLuu ? 'Đang lưu…' : 'Lưu'}</button>
        {trangThai && (
          <span className={trangThai === 'Đã lưu' ? 'tag ok' : 'tag warn'}>{trangThai}</span>
        )}
      </div>
    </div>
  );
}

/** Bản xem thử: vừa để giáo viên soát đúng bài, vừa để lấy thời lượng thật. */
function XemThu({ videoId, onThoiLuong }: { videoId: string; onThoiLuong: (s: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const goi = useRef(onThoiLuong);
  goi.current = onThoiLuong;

  useEffect(() => {
    let player: any;
    let huy = false;
    let dem = 0;
    let t: any;

    const doThoiLuong = () => {
      const s = player?.getDuration?.() ?? 0;
      if (s > 0) { goi.current(s); return; }
      // Vài video trả về 0 ngay sau onReady — thử lại tối đa 10 lần, mỗi lần 500ms.
      if (dem++ < 10) t = setTimeout(doThoiLuong, 500);
    };

    const init = () => {
      if (huy || !box.current) return;
      player = new (window as any).YT.Player(box.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: { onReady: doThoiLuong }
      });
    };

    if ((window as any).YT?.Player) {
      init();
    } else {
      const truoc = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => { truoc?.(); init(); };
      if (!document.getElementById('yt-iframe-api')) {
        const s = document.createElement('script');
        s.id = 'yt-iframe-api';
        s.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(s);
      }
    }
    return () => { huy = true; clearTimeout(t); try { player?.destroy?.(); } catch {} };
  }, [videoId]);

  return (
    <div className="xem-thu">
      <div ref={box} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
