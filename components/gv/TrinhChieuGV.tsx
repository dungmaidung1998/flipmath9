'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/components/QuestionFigure, @/components/MaQR, @/lib/chuDeChuong, @/lib/gv/lopCuaToi, @/lib/supabase/client
 */
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import MathText from '@/components/MathText';
import QuestionFigure from '@/components/QuestionFigure';
import MaQR from '@/components/MaQR';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { nhanTruongLop, type LopCuaToi } from '@/lib/gv/lopCuaToi';
import { supabaseBrowser } from '@/lib/supabase/client';
import './trinh-chieu.css';

type MucOption = {
  ku_id: string;
  ku_name: string;
  chuong: string;
  uuTien: boolean; // LTC / OTC
};

type CauPhong = {
  chi_so: number;
  question_id: string;
  ku_id: string;
  level: number;
  stem: string;
  hinh?: unknown;
  options: { nhan: string; option_key: string; option_text: string }[];
};

type Phong = {
  ma_phong: string;
  class_id: string;
  ku_id: string;
  chuong: string;
  trang_thai: 'cho' | 'dang-hoi' | 'hien-dap-an' | 'ket-thuc';
  chi_so_cau: number;
  giay_moi_cau: number;
  bat_dau_cau_luc: string | null;
  cau_hoi: CauPhong[];
};

const KY_HIEU: Record<string, string> = { A: '▲', B: '◆', C: '●', D: '■' };

/**
 * Component React `TrinhChieuGV`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function TrinhChieuGV({
  lops,
  lopMacDinh,
  mucs,
}: {
  lops: LopCuaToi[];
  lopMacDinh: string;
  mucs: MucOption[];
}) {
  const [classId, setClassId] = useState(lopMacDinh || lops[0]?.class_id || '');
  const [kuId, setKuId] = useState(mucs[0]?.ku_id ?? '');
  const [soCau, setSoCau] = useState(8);
  const [giayMoiCau, setGiayMoiCau] = useState(30);

  const [phong, setPhong] = useState<Phong | null>(null);
  const [phanBo, setPhanBo] = useState<Record<string, number>>({ A: 0, B: 0, C: 0, D: 0 });
  const [soDaTraLoi, setSoDaTraLoi] = useState(0);
  const [siSoLop, setSiSoLop] = useState(0);
  const [dapAnHienTai, setDapAnHienTai] = useState<string | null>(null);
  const [bangXepHang, setBangXepHang] = useState<{ studentId: string; ten: string; diem: number; dung: number; daTraLoi: number }[]>([]);
  const [demNguoc, setDemNguoc] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loi, setLoi] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function taiTrangThai(ma: string) {
    try {
      const res = await fetch(`/api/gv/trinh-chieu?ma=${encodeURIComponent(ma)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) return;
      if (data.phong) setPhong(data.phong);
      setPhanBo(data.phanBo ?? { A: 0, B: 0, C: 0, D: 0 });
      setSoDaTraLoi(Number(data.soDaTraLoi ?? 0));
      setSiSoLop(Number(data.siSoLop ?? 0));
      setDapAnHienTai(data.dapAnHienTai ?? null);
      setBangXepHang(data.bangXepHang ?? []);
    } catch {
      /* bỏ qua khi mạng chập chờn */
    }
  }

  // Supabase Realtime + Polling dự phòng 2 giây
  useEffect(() => {
    if (!phong?.ma_phong) return;
    const ma = phong.ma_phong;
    void taiTrangThai(ma);

    const poll = window.setInterval(() => {
      void taiTrangThai(ma);
    }, 2000);

    let channel: any = null;
    try {
      const sb = supabaseBrowser();
      channel = sb
        .channel(`phong-gv-${ma}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'phong_tra_loi', filter: `ma_phong=eq.${ma}` },
          () => void taiTrangThai(ma)
        )
        .subscribe();
    } catch {
      /* nếu Realtime chưa bật vẫn còn polling 2 giây */
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
  }, [phong?.ma_phong]);

  // Đồng hồ đếm ngược câu hỏi hiện tại
  useEffect(() => {
    if (!phong || phong.trang_thai !== 'dang-hoi' || !phong.bat_dau_cau_luc) {
      setDemNguoc(0);
      return;
    }
    const tick = () => {
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      const elapsed = Math.floor((Date.now() - new Date(phong.bat_dau_cau_luc!).getTime()) / 1000);
      // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
      setDemNguoc(Math.max(0, phong.giay_moi_cau - elapsed));
    };
    tick();
    const t = window.setInterval(tick, 500);
    return () => window.clearInterval(t);
  }, [phong?.trang_thai, phong?.chi_so_cau, phong?.bat_dau_cau_luc, phong?.giay_moi_cau]);

  async function moPhong() {
    setBusy(true);
    setLoi('');
    try {
      const res = await fetch('/api/gv/trinh-chieu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hanhDong: 'mo-phong', classId, kuId, soCau, giayMoiCau }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không mở được phòng.');
      setPhong(json.phong);
      setDapAnHienTai(null);
      setPhanBo({ A: 0, B: 0, C: 0, D: 0 });
      setBangXepHang([]);
    } catch (e: any) {
      setLoi(e?.message || 'Lỗi mở phòng');
    } finally {
      setBusy(false);
    }
  }

  async function dieuKhien(hanhDong: 'bat-dau' | 'hien-dap-an' | 'cau-tiep' | 'ket-thuc') {
    if (!phong || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/gv/trinh-chieu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hanhDong, maPhong: phong.ma_phong }),
      });
      const json = await res.json();
      if (res.ok && json.phong) {
        setPhong(json.phong);
        void taiTrangThai(phong.ma_phong);
      }
    } finally {
      setBusy(false);
    }
  }

  const cd = useMemo(() => chuDeChuong(phong?.chuong ?? kuId), [phong?.chuong, kuId]);
  const cauHienTai = phong?.cau_hoi?.[phong.chi_so_cau ?? 0];
  const joinUrl = phong ? `${origin}/phong/${phong.ma_phong}` : '';
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const maxCot = Math.max(1, ...Object.values(phanBo));

  if (!phong) {
    return (
      <div className="mc">
        <div className="mc-dau">
          <div>
            <h1>Trình chiếu trên lớp</h1>
            <p className="mc-cauhoi">
              Mở phòng trực tiếp cho tiết Luyện tập chung / Ôn tập chương; học sinh dùng điện thoại quét QR để chọn đáp án A/B/C/D, câu sai tự ghi vào Sổ lỗi.
            </p>
          </div>
        </div>

        {/* Khối giao diện: Khối nội dung chính */}
        <section className="mc-khoi">
          <h2>Mở phòng trình chiếu mới</h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
              <b>Lớp</b>
              <select value={classId} onChange={(e) => setClassId(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid var(--mc-vach)' }}>
                {lops.map((l) => (
                  <option key={l.class_id} value={l.class_id}>{nhanTruongLop(l)}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
              <b>Mục kiến thức (Luyện tập chung / Ôn tập chương ưu tiên đầu)</b>
              <select value={kuId} onChange={(e) => setKuId(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid var(--mc-vach)' }}>
                {mucs.map((m) => (
                  <option key={m.ku_id} value={m.ku_id}>
                    {m.uuTien ? '★ ' : ''}{m.ku_id} · {m.ku_name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
              <b>Số câu hỏi</b>
              <input type="number" min={3} max={20} value={soCau} onChange={(e) => setSoCau(Math.max(3, Math.min(20, Number(e.target.value) || 8)))} style={{ padding: 8, borderRadius: 8, border: '1px solid var(--mc-vach)' }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
              <b>Giây mỗi câu</b>
              <input type="number" min={10} max={180} value={giayMoiCau} onChange={(e) => setGiayMoiCau(Math.max(10, Math.min(180, Number(e.target.value) || 30)))} style={{ padding: 8, borderRadius: 8, border: '1px solid var(--mc-vach)' }} />
            </label>
          </div>

          <div style={{ marginTop: 16 }}>
            <button type="button" className="nho chinh" disabled={busy} onClick={moPhong}>
              {busy ? 'Đang tạo phòng…' : '📽️ Mở phòng trình chiếu'}
            </button>
          </div>
          {loi && <p role="alert" style={{ color: 'var(--st-nguy)', marginTop: 10 }}>{loi}</p>}
        </section>
      </div>
    );
  }

  return (
    <div className="tc-khung" style={cd ? ({ ['--tc-mau' as string]: cd.mau } as CSSProperties) : undefined}>
      <div className="tc-man">
        <div className="tc-thanh-tren">
          <span className="tc-chip">
            {cd ? `${cd.bieuTuong} ${cd.chuong} · ${cd.ten}` : phong.chuong} · Phòng #{phong.ma_phong}
          </span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              {phong.trang_thai === 'cho'
                ? `Lớp ${phong.class_id} (${siSoLop} HS)`
                : `Câu ${phong.chi_so_cau + 1}/${phong.cau_hoi.length} · ${soDaTraLoi}/${siSoLop} HS trả lời`}
            </span>
            {phong.trang_thai === 'dang-hoi' && (
              <span className={'tc-dong-ho' + (demNguoc <= 5 ? ' gap' : '')}>
                ⏱ {demNguoc}s
              </span>
            )}
            <button
              type="button"
              className="nho"
              onClick={() => {
                setPhong(null);
                setLoi('');
              }}
            >
              Mở phòng khác
            </button>
          </div>
        </div>

        {phong.trang_thai === 'cho' && (
          <div className="tc-cho">
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Học sinh mở FlipMath9 trên điện thoại → vào <b>/phong/{phong.ma_phong}</b> hoặc quét mã QR:
              </p>
              <div className="tc-ma-phong">{phong.ma_phong}</div>
              <p style={{ color: '#475569', fontSize: 16 }}>
                Gồm {phong.cau_hoi.length} câu · {phong.giay_moi_cau} giây/câu · Mục <code>{phong.ku_id}</code>
              </p>
              <button type="button" className="nho chinh" style={{ fontSize: 18, padding: '12px 24px', marginTop: 10 }} disabled={busy} onClick={() => dieuKhien('bat-dau')}>
                ▶ Bắt đầu Câu 1
              </button>
            </div>
            <div style={{ padding: 14, borderRadius: 16, border: '1px solid #cbd5e1', background: '#fff', textAlign: 'center' }}>
              <MaQR value={joinUrl || `/phong/${phong.ma_phong}`} size={220} label={`QR phòng ${phong.ma_phong}`} />
              <div style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>Quét để tham gia ngay</div>
            </div>
          </div>
        )}

        {(phong.trang_thai === 'dang-hoi' || phong.trang_thai === 'hien-dap-an') && cauHienTai && (
          <div>
            <p className="tc-de-lon">
              <MathText>{cauHienTai.stem}</MathText>
            </p>
            <QuestionFigure hinh={cauHienTai.hinh} />

            <div className="tc-4o">
              {cauHienTai.options.map((o) => {
                const hienDapAn = phong.trang_thai === 'hien-dap-an';
                const laDung = hienDapAn && dapAnHienTai === o.nhan;
                const laSai = hienDapAn && dapAnHienTai !== o.nhan;
                return (
                  <div
                    key={o.nhan}
                    className={'tc-pa' + (laDung ? ' dung' : '') + (laSai ? ' mo' : '')}
                    data-nhan={o.nhan}
                  >
                    <span className="tc-pa__hieu">{o.nhan} {KY_HIEU[o.nhan]}</span>
                    <span><MathText>{o.option_text}</MathText></span>
                  </div>
                );
              })}
            </div>

            {phong.trang_thai === 'hien-dap-an' && (
              <div className="tc-bieudo" aria-label="Biểu đồ cột số học sinh chọn mỗi phương án">
                {(['A', 'B', 'C', 'D'] as const).map((nhan) => {
                  const sl = phanBo[nhan] ?? 0;
                  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
                  const hPct = Math.max(8, Math.round((sl / maxCot) * 100));
                  return (
                    <div key={nhan} className="tc-cot">
                      <b style={{ fontSize: 16 }}>
                        {sl} HS {dapAnHienTai === nhan ? '✓' : ''}
                      </b>
                      <div className="tc-cot__thanh" data-nhan={nhan} style={{ height: `${sl ? hPct : 6}%` }} />
                      <span style={{ fontWeight: 800, fontSize: 16 }}>{nhan}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap' }}>
              {phong.trang_thai === 'dang-hoi' ? (
                <button type="button" className="nho chinh" style={{ fontSize: 16, padding: '10px 20px' }} disabled={busy} onClick={() => dieuKhien('hien-dap-an')}>
                  📊 Chốt &amp; Hiện đáp án
                </button>
              ) : (
                <button type="button" className="nho chinh" style={{ fontSize: 16, padding: '10px 20px' }} disabled={busy} onClick={() => dieuKhien('cau-tiep')}>
                  {phong.chi_so_cau + 1 >= phong.cau_hoi.length ? '🏁 Kết thúc & Xếp hạng' : '➡️ Câu tiếp'}
                </button>
              )}
            </div>
          </div>
        )}

        {(phong.trang_thai === 'hien-dap-an' || phong.trang_thai === 'ket-thuc') && (
          <div className="tc-bxh">
            <h2 style={{ margin: 0, fontSize: 18, color: cd?.mau ?? '#2d5fa8' }}>
              {cd ? `${cd.bieuTuong} ` : '🏆 '}Bảng xếp hạng — {cd?.ten ?? phong.chuong}
            </h2>
            {bangXepHang.length === 0 ? (
              <p className="mc-ghi" style={{ margin: '8px 0 0' }}>Chưa có học sinh nào gửi câu trả lời.</p>
            ) : (
              <ol>
                {bangXepHang.map((hs, i) => (
                  <li key={hs.studentId}>
                    <span style={{ color: cd?.mau ?? '#2d5fa8', fontWeight: 900 }}>#{i + 1}</span>
                    <span>{hs.ten}</span>
                    <span>{hs.dung}/{hs.daTraLoi} đúng</span>
                    <b style={{ color: cd?.mau ?? '#2d5fa8' }}>{hs.diem} đ</b>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
