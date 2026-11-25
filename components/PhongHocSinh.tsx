'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/chuDeChuong, @/lib/supabase/client, @/components/DauTrang
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { supabaseBrowser } from '@/lib/supabase/client';
import DauTrang from '@/components/DauTrang';
import './phong-hs.css';

type TrangThaiPhongHS = {
  maPhong: string;
  chuong: string;
  kuId: string;
  trangThai: 'cho' | 'dang-hoi' | 'hien-dap-an' | 'ket-thuc';
  chiSoCau: number;
  tongCau: number;
  giayMoiCau: number;
  batDauCauLuc: string | null;
  daChonHienTai: { nhan_hien_thi: string; is_correct: boolean; diem: number } | null;
  dapAnDung: string | null;
  tongDiem: number;
  soCauDung: number;
  tenHS: string;
};

const KY_HIEU: Record<string, string> = { A: '▲', B: '◆', C: '●', D: '■' };

/**
 * Component React `PhongHocSinh`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function PhongHocSinh({ maPhong }: { maPhong: string }) {
  const [state, setState] = useState<TrangThaiPhongHS | null>(null);
  const [daBam, setDaBam] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loi, setLoi] = useState('');

  async function tai() {
    try {
      const res = await fetch(`/api/phong?ma=${encodeURIComponent(maPhong)}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) {
        setLoi(json?.error || 'Không vào được phòng.');
        return;
      }
      setLoi('');
      setState(json);
      if (json.daChonHienTai?.nhan_hien_thi) {
        setDaBam(json.daChonHienTai.nhan_hien_thi);
      } else {
        setDaBam(null);
      }
    } catch {
      /* giữ trạng thái cũ nếu mạng chập chờn */
    }
  }

  useEffect(() => {
    void tai();
    const poll = window.setInterval(() => void tai(), 2000);

    let channel: any = null;
    try {
      const sb = supabaseBrowser();
      channel = sb
        .channel(`phong-hs-${maPhong}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'phong_trinh_chieu', filter: `ma_phong=eq.${maPhong}` },
          () => void tai()
        )
        .subscribe();
    } catch {
      /* dùng polling 2 giây nếu Realtime chưa bật */
    }

    return () => {
      window.clearInterval(poll);
      if (channel) {
        try {
          void supabaseBrowser().removeChannel(channel);
        } catch {
          /* bỏ qua */
        }
      }
    };
  }, [maPhong]);

  async function chon(nhan: 'A' | 'B' | 'C' | 'D') {
    if (!state || state.trangThai !== 'dang-hoi' || daBam || busy) return;
    setBusy(true);
    setDaBam(nhan);
    try {
      const res = await fetch('/api/phong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maPhong,
          chiSoCau: state.chiSoCau,
          nhan,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setLoi(json?.error || 'Không gửi được đáp án.');
      } else {
        void tai();
      }
    } catch {
      setLoi('Mất mạng tạm thời, em thử bấm lại.');
      setDaBam(null);
    } finally {
      setBusy(false);
    }
  }

  if (loi && !state) {
    return (
      <div className="ph-hs">
        <div className="ph-the">
          <p role="alert" style={{ fontWeight: 700, color: '#c0312b' }}>{loi}</p>
          <a className="action-link" href="/phong">← Nhập lại mã phòng</a>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="ph-hs">
        <div className="ph-the"><p>Đang kết nối phòng #{maPhong}…</p></div>
      </div>
    );
  }

  const cd = chuDeChuong(state.chuong);

  return (
    <div className="ph-hs" style={cd ? ({ ['--ph-mau' as string]: cd.mau } as CSSProperties) : undefined}>
      <DauTrang
        gon
        tieuDe={`Phòng #${state.maPhong}`}
        phu={`Trình chiếu trên lớp · ${state.tenHS}`}
        chuong={state.chuong}
        tranh="bai-hoc"
      />
      <div className="ph-the">
        <div className="ph-dau">
          <span>{cd ? `${cd.bieuTuong} ${cd.chuong}` : state.chuong} · Phòng #{state.maPhong}</span>
          <span>⭐ {state.tongDiem} đ</span>
        </div>

        {state.trangThai === 'cho' && (
          <div style={{ textAlign: 'center', padding: '26px 8px' }}>
            <h2 style={{ margin: '0 0 8px' }}>👋 Xin chào {state.tenHS}</h2>
            <p className="hint">Nhìn lên màn hình máy chiếu và chờ thầy cô bắt đầu câu hỏi đầu tiên…</p>
          </div>
        )}

        {state.trangThai === 'dang-hoi' && (
          <>
            <p style={{ textAlign: 'center', fontWeight: 700, margin: '0 0 12px' }}>
              Câu {state.chiSoCau + 1}/{state.tongCau} — {daBam ? `Em đã chọn ${daBam}. Chờ kết quả…` : 'Nhìn đề trên bảng và chạm phương án:'}
            </p>
            <div className="ph-luoi4">
              {(['A', 'B', 'C', 'D'] as const).map((nhan) => (
                <button
                  key={nhan}
                  type="button"
                  data-nhan={nhan}
                  disabled={Boolean(daBam) || busy}
                  className={'ph-nut' + (daBam === nhan ? ' chon' : '') + (daBam && daBam !== nhan ? ' mo' : '')}
                  onClick={() => chon(nhan)}
                >
                  <span>{nhan}</span>
                  <small>{KY_HIEU[nhan]}</small>
                </button>
              ))}
            </div>
          </>
        )}

        {state.trangThai === 'hien-dap-an' && (
          <div style={{ textAlign: 'center', padding: '22px 8px' }}>
            {state.daChonHienTai ? (
              <>
                <div style={{ fontSize: 42 }}>{state.daChonHienTai.is_correct ? '🎉' : '💡'}</div>
                <h2 style={{ margin: '6px 0' }}>
                  {state.daChonHienTai.is_correct
                    ? `Chính xác! +${state.daChonHienTai.diem} điểm`
                    : `Chưa đúng (Đáp án đúng: ${state.dapAnDung ?? '—'})`}
                </h2>
                {!state.daChonHienTai.is_correct && (
                  <p className="hint">Nếu câu này có mã lỗi, hệ thống đã lưu vào Sổ lỗi để em ôn lại sau tiết.</p>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: 38 }}>⏱️</div>
                <h2>Hết giờ câu {state.chiSoCau + 1} · Đáp án đúng: {state.dapAnDung ?? '—'}</h2>
              </>
            )}
            <p className="hint">Chờ thầy cô chuyển sang câu tiếp theo…</p>
          </div>
        )}

        {state.trangThai === 'ket-thuc' && (
          <div style={{ textAlign: 'center', padding: '22px 8px' }}>
            <div style={{ fontSize: 44 }}>🏆</div>
            <h2>Kết thúc phần trình chiếu!</h2>
            <p style={{ fontSize: 20, fontWeight: 800, color: cd?.mau ?? '#2d5fa8' }}>
              Đúng {state.soCauDung}/{state.tongCau} câu · {state.tongDiem} điểm
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
              <a className="action-link" href="/so-loi">🪤 Xem Sổ lỗi</a>
              <a className="action-link" href="/bai-hoc">📚 Về bài học</a>
            </div>
          </div>
        )}

        {loi && <p role="alert" style={{ color: '#c0312b', marginTop: 10 }}>{loi}</p>}
      </div>
    </div>
  );
}
