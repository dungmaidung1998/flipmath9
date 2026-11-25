'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/components/QuestionFigure, @/lib/gv/lopCuaToi, @/lib/khkt/deKiemTra
 */
import { useEffect, useMemo, useState } from 'react';
import MathText from '@/components/MathText';
import QuestionFigure from '@/components/QuestionFigure';
import type { LopCuaToi } from '@/lib/gv/lopCuaToi';
import { nhanTruongLop } from '@/lib/gv/lopCuaToi';
import type { DeKiemTraData, MaTran4Muc } from '@/lib/khkt/deKiemTra';
import { TEN_MUC_DO } from '@/lib/khkt/deKiemTra';

type MucInfo = {
  ku_id: string;
  ku_name: string;
  lesson_id: string | null;
  chuong: string;
  demDuyet: Record<number, number>;
  demTong: Record<number, number>;
};

type BaoCaoLoi = {
  deId: string;
  soHocSinhLam: number;
  soLuotLam: number;
  diemTB: number | null;
  topLoi: { errorCode: string; moTa: string; soLan: number }[];
  cauSaiNhieu: { questionId: string; kuId: string; stem: string; soSai: number; tongLam: number; tiLeSai: number }[];
};

const DS_CHUONG = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'];

/**
 * Component React `DeKiemTraClient`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function DeKiemTraClient({
  lops,
  lopMacDinh,
  mucs,
}: {
  lops: LopCuaToi[];
  lopMacDinh: string;
  mucs: MucInfo[];
}) {
  const [classId, setClassId] = useState(lopMacDinh || lops[0]?.class_id || '');
  const [chuong, setChuong] = useState('C1');
  const [chonKu, setChonKu] = useState<string[]>([]);
  const [tieuDe, setTieuDe] = useState('');
  const [thoiGian, setThoiGian] = useState(15);
  const [maTran, setMaTran] = useState<MaTran4Muc>({ 1: 4, 2: 3, 3: 2, 4: 1 });
  const [choLamThu, setChoLamThu] = useState(true);

  const [dangSinh, setDangSinh] = useState(false);
  const [dangTaiWord, setDangTaiWord] = useState(false);
  const [loi, setLoi] = useState('');
  const [thongBao, setThongBao] = useState('');
  const [deHienTai, setDeHienTai] = useState<DeKiemTraData | null>(null);
  const [deList, setDeList] = useState<DeKiemTraData[]>([]);
  const [baoCaoMap, setBaoCaoMap] = useState<Record<string, BaoCaoLoi>>({});

  const mucTrongChuong = useMemo(() => mucs.filter((m) => m.chuong === chuong), [mucs, chuong]);

  useEffect(() => {
    setChonKu(mucTrongChuong.slice(0, 3).map((m) => m.ku_id));
  }, [chuong]); // eslint-disable-line react-hooks/exhaustive-deps

  const khaDung = useMemo(() => {
    const chonSet = new Set(chonKu);
    const tong: Record<number, { duyet: number; tong: number }> = {
      1: { duyet: 0, tong: 0 },
      2: { duyet: 0, tong: 0 },
      3: { duyet: 0, tong: 0 },
      4: { duyet: 0, tong: 0 },
    };
    for (const m of mucTrongChuong) {
      if (!chonSet.has(m.ku_id)) continue;
      for (const lv of [1, 2, 3, 4]) {
        tong[lv].duyet += m.demDuyet[lv] ?? 0;
        tong[lv].tong += m.demTong[lv] ?? 0;
      }
    }
    return tong;
  }, [mucTrongChuong, chonKu]);

  async function taiDanhSach(lopFilter = classId) {
    try {
      const res = await fetch(`/api/gv/de-kiem-tra?lop=${encodeURIComponent(lopFilter)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) return;
      setDeList(data.deList ?? []);
      const mp: Record<string, BaoCaoLoi> = {};
      for (const bc of data.baoCaoLoi ?? []) mp[bc.deId] = bc;
      setBaoCaoMap(mp);
      if (data.thongBaoBang) setThongBao(data.thongBaoBang);
      if (!deHienTai && data.deList?.length) setDeHienTai(data.deList[0]);
    } catch {
      // bỏ qua lỗi mạng tạm
    }
  }

  useEffect(() => {
    if (classId) void taiDanhSach(classId);
  }, [classId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function sinhDe() {
    if (!classId || !chonKu.length) {
      setLoi('Vui lòng chọn lớp và ít nhất một mục kiến thức.');
      return;
    }
    setDangSinh(true);
    setLoi('');
    setThongBao('');
    try {
      const res = await fetch('/api/gv/de-kiem-tra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hanhDong: 'sinh',
          classId,
          chuong,
          kuIds: chonKu,
          tieuDe: tieuDe.trim() || `Kiểm tra thường xuyên ${chuong}`,
          thoiGianPhut: thoiGian,
          maTran,
          choLamThu,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Không sinh được đề.');
      setDeHienTai(json.de);
      if (json.canhBao || json.de?.canh_bao) setThongBao(json.canhBao || json.de?.canh_bao);
      if (!json.chuaLuuDb) void taiDanhSach(classId);
    } catch (e: any) {
      setLoi(e?.message || 'Có lỗi xảy ra khi sinh đề.');
    } finally {
      setDangSinh(false);
    }
  }

  async function taiWord(de: DeKiemTraData) {
    setDangTaiWord(true);
    setLoi('');
    try {
      const res = await fetch('/api/gv/de-kiem-tra/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(de),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Không xuất được file Word.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DeKT-${de.chuong}-${de.class_id}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setLoi(e?.message || 'Lỗi xuất file Word.');
    } finally {
      setDangTaiWord(false);
    }
  }

  async function doiTrangThaiLamThu(de: DeKiemTraData, bat: boolean) {
    try {
      const res = await fetch('/api/gv/de-kiem-tra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hanhDong: 'bat-tat-lam-thu', deId: de.id, choLamThu: bat }),
      });
      if (res.ok) {
        setDeHienTai((cu) => (cu && cu.id === de.id ? { ...cu, cho_lam_thu: bat } : cu));
        setDeList((ds) => ds.map((d) => (d.id === de.id ? { ...d, cho_lam_thu: bat } : d)));
      }
    } catch {
      /* bỏ qua */
    }
  }

  const toggleKu = (id: string) =>
    setChonKu((cu) => (cu.includes(id) ? cu.filter((x) => x !== id) : [...cu, id]));

  const tongCau = maTran[1] + maTran[2] + maTran[3] + maTran[4];
  const baoCao = deHienTai ? baoCaoMap[deHienTai.id] : undefined;

  return (
    <div className="mc">
      <div className="mc-dau">
        <div>
          <h1>Đề kiểm tra thường xuyên theo ma trận</h1>
          <p className="mc-cauhoi">
            Tự sinh đề 4 mức độ nhận thức, tránh câu học sinh vừa làm trong 7 ngày, xuất Word 2 mã đề và mở bài làm thử 15 phút trước tiết.
          </p>
        </div>
      </div>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>1. Thiết lập ma trận đề</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
            <b>Lớp áp dụng</b>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid var(--mc-vach)' }}>
              {lops.map((l) => (
                <option key={l.class_id} value={l.class_id}>
                  {nhanTruongLop(l)}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
            <b>Chương</b>
            <select value={chuong} onChange={(e) => setChuong(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid var(--mc-vach)' }}>
              {DS_CHUONG.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
            <b>Tiêu đề đề kiểm tra</b>
            <input
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder={`Kiểm tra thường xuyên ${chuong}`}
              style={{ padding: 8, borderRadius: 8, border: '1px solid var(--mc-vach)' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
            <b>Thời gian (phút)</b>
            <input
              type="number"
              min={5}
              max={120}
              value={thoiGian}
              onChange={(e) => setThoiGian(Math.max(5, Math.min(120, Number(e.target.value) || 15)))}
              style={{ padding: 8, borderRadius: 8, border: '1px solid var(--mc-vach)' }}
            />
          </label>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <b style={{ fontSize: 14 }}>Chọn các mục kiến thức ({chonKu.length}/{mucTrongChuong.length})</b>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="nho" onClick={() => setChonKu(mucTrongChuong.map((m) => m.ku_id))}>
                Chọn hết
              </button>
              <button type="button" className="nho" onClick={() => setChonKu([])}>
                Bỏ chọn
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {mucTrongChuong.map((m) => {
              const checked = chonKu.includes(m.ku_id);
              const tongDuyet = [1, 2, 3, 4].reduce((s, lv) => s + (m.demDuyet[lv] ?? 0), 0);
              const tongCauMuc = [1, 2, 3, 4].reduce((s, lv) => s + (m.demTong[lv] ?? 0), 0);
              return (
                <label
                  key={m.ku_id}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-start',
                    padding: '8px 10px',
                    border: '1px solid var(--mc-vach)',
                    borderRadius: 8,
                    background: checked ? '#eff6ff' : 'transparent',
                    fontSize: 13.5,
                    cursor: 'pointer',
                  }}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleKu(m.ku_id)} style={{ marginTop: 3 }} />
                  <span>
                    <b>{m.ku_id}</b> · {m.ku_name}
                    <br />
                    <small style={{ color: 'var(--muted)' }}>
                      Đã duyệt: {tongDuyet}/{tongCauMuc} câu
                    </small>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <b style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
            Số câu mỗi mức độ nhận thức (Tổng: {tongCau} câu)
          </b>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            {([1, 2, 3, 4] as const).map((lv) => (
              <label key={lv} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13.5, padding: 10, borderRadius: 8, border: '1px solid var(--mc-vach)' }}>
                <b>{lv}. {TEN_MUC_DO[lv]}</b>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={maTran[lv]}
                  onChange={(e) =>
                    setMaTran((m) => ({ ...m, [lv]: Math.max(0, Math.min(30, Number(e.target.value) || 0)) }))
                  }
                  style={{ padding: 6, borderRadius: 6, border: '1px solid var(--mc-vach)' }}
                />
                <small style={{ color: khaDung[lv].duyet < maTran[lv] ? 'var(--st-chuy)' : 'var(--muted)' }}>
                  Có {khaDung[lv].duyet} câu duyệt / {khaDung[lv].tong} tổng
                </small>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
            <input type="checkbox" checked={choLamThu} onChange={(e) => setChoLamThu(e.target.checked)} />
            Mở cho học sinh lớp “Làm thử {thoiGian} phút trước kiểm tra”
          </label>
          <button type="button" className="nho chinh" disabled={dangSinh} onClick={sinhDe}>
            {dangSinh ? 'Đang sinh đề…' : '🎲 Sinh đề mới'}
          </button>
        </div>

        {loi && <p role="alert" style={{ color: 'var(--st-nguy)', marginTop: 10, fontWeight: 600 }}>{loi}</p>}
        {thongBao && <p className="bang-vang" style={{ marginTop: 10 }}>⚠️ {thongBao}</p>}
      </section>

      {deHienTai && (
        <section className="mc-khoi">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h2 style={{ margin: 0 }}>{deHienTai.tieu_de}</h2>
              <p className="mc-ghi" style={{ margin: '4px 0 0' }}>
                {deHienTai.cau_hoi.length} câu · {deHienTai.thoi_gian_phut} phút · Lớp {deHienTai.class_id}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="nho"
                onClick={() => doiTrangThaiLamThu(deHienTai, !deHienTai.cho_lam_thu)}
              >
                {deHienTai.cho_lam_thu ? '🟢 Đang mở làm thử' : '⚪ Đang tắt làm thử'}
              </button>
              <button type="button" className="nho chinh" disabled={dangTaiWord} onClick={() => taiWord(deHienTai)}>
                {dangTaiWord ? 'Đang tạo Word…' : '📄 Xuất Word (2 mã đề + đáp án + ma trận)'}
              </button>
            </div>
          </div>

          {deHienTai.canh_bao && <p className="bang-vang">⚠️ {deHienTai.canh_bao}</p>}

          {baoCao && (
            <div style={{ padding: 14, borderRadius: 10, border: '1px solid var(--mc-vach)', marginBottom: 16, background: '#f8fafc' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>
                📊 Bảng lỗi cả lớp trước tiết ({baoCao.soHocSinhLam} HS đã làm thử · Điểm TB: {baoCao.diemTB ?? '—'})
              </h3>
              {baoCao.soLuotLam === 0 ? (
                <p className="mc-ghi" style={{ margin: 0 }}>Chưa có học sinh nào làm thử đề này.</p>
              ) : (
                <div className="mc-hai">
                  <div>
                    <b style={{ fontSize: 13.5 }}>Mã lỗi hay gặp:</b>
                    {baoCao.topLoi.length ? (
                      <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13.5 }}>
                        {baoCao.topLoi.map((x) => (
                          <li key={x.errorCode}>
                            <code>{x.errorCode}</code> ({x.soLan} lượt): {x.moTa}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mc-ghi">Chưa ghi nhận mã lỗi sai nào.</p>
                    )}
                  </div>
                  <div>
                    <b style={{ fontSize: 13.5 }}>Câu sai nhiều nhất:</b>
                    {baoCao.cauSaiNhieu.length ? (
                      <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13.5 }}>
                        {baoCao.cauSaiNhieu.map((c) => (
                          <li key={c.questionId}>
                            <b>{c.tiLeSai}% sai</b> ({c.soSai}/{c.tongLam}) · <code>{c.kuId}</code>: <MathText>{c.stem.slice(0, 120)}</MathText>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mc-ghi">Chưa có câu sai.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <details open>
            <summary style={{ cursor: 'pointer', fontWeight: 700, marginBottom: 10 }}>
              Xem trước đề gốc ({deHienTai.cau_hoi.length} câu — bản Word sẽ xáo thành Mã đề 101 &amp; 102)
            </summary>
            <ol style={{ paddingLeft: 20, display: 'grid', gap: 12 }}>
              {deHienTai.cau_hoi.map((q, idx) => (
                <li key={q.question_id} style={{ borderBottom: '1px solid var(--mc-vach)', paddingBottom: 10 }}>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 4 }}>
                    Câu {idx + 1} · <b>{q.ku_id}</b> · {TEN_MUC_DO[q.level]} · Trạng thái: <code>{q.trang_thai ?? 'chưa gắn'}</code> · Đáp án gốc: <b>{q.correct_option}</b>
                  </div>
                  <div><MathText>{q.stem}</MathText></div>
                  <QuestionFigure hinh={q.hinh} />
                  <div style={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 6, fontSize: 14 }}>
                    {q.options.map((o) => (
                      <div key={o.option_key} style={{ color: o.option_key === q.correct_option ? 'var(--st-tot)' : undefined, fontWeight: o.option_key === q.correct_option ? 700 : 400 }}>
                        {o.option_key}. <MathText>{o.option_text}</MathText>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </details>
        </section>
      )}

      {deList.length > 0 && (
        <section className="mc-khoi">
          <h2>Danh sách đề đã sinh ({deList.length})</h2>
          <ul className="mc-ds">
            {deList.map((d) => {
              const bc = baoCaoMap[d.id];
              return (
                <li key={d.id} className="mc-dong">
                  <div>
                    <div className="mc-dong-ten">{d.tieu_de}</div>
                    <div className="mc-dong-phu">
                      {d.chuong} · {d.cau_hoi.length} câu · {d.thoi_gian_phut} phút · {bc?.soHocSinhLam ?? 0} HS đã làm thử (TB: {bc?.diemTB ?? '—'})
                    </div>
                  </div>
                  <div className="mc-dong-hd">
                    <button type="button" className="nho" onClick={() => setDeHienTai(d)}>
                      Xem &amp; Bảng lỗi
                    </button>
                    <button type="button" className="nho" onClick={() => taiWord(d)}>
                      Tải Word
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
