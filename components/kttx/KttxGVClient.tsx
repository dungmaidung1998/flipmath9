'use client';

/**
 * FILE NÀY LÀM GÌ: Giao diện số hoá bài kiểm tra KTTX trên giấy cho học sinh (kèm hộp che tên Canvas) và màn hình duyệt/thống kê cho giáo viên.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/lib/khkt/kttx, @/components/kttx/KttxHocSinhClient
 */
import { useMemo, useState } from 'react';
import MathText from '@/components/MathText';
import AnhChuDe from '@/components/AnhChuDe';
import {
  chuanHoaTrangThaiKTTX,
  tinhThongKeBaiKTTX,
  tinhThongKeNghienCuuKTTX,
  xuatCsvKTTX,
  type CauKTTX,
} from '@/lib/khkt/kttx';
import type { LoiDictItem } from '@/components/kttx/KttxHocSinhClient';
import './kttx.css';

export type KttxBaiGV = {
  id: string;
  class_id: string;
  de_id: string | null;
  tieu_de: string;
  chuong: string | null;
  ngay_thi: string | null;
  thang_diem: number;
  khung_cau: any[];
  tao_luc: string;
};

export type DeKiemTraShort = {
  id: string;
  tieu_de: string;
  chuong: string;
  tao_luc: string;
};

export type KttxBaiNopGV = {
  id: string;
  bai_id: string | null;
  student_id: string;
  ten_hs: string;
  class_id: string;
  so_trang: number;
  anh_da_xoa: boolean;
  anh_urls: string[];
  ten_bai_ai: string | null;
  ngay_thi_ai: string | null;
  tong_diem_ai: number | null;
  tong_diem_tren_bai: number | null;
  tong_diem_hs?: number | null;
  tong_diem_excel?: number | null;
  tong_diem_gv: number | null;
  tong_diem_khop: boolean;
  can_kiem_tra: boolean;
  ly_do_kiem_tra: string[];
  mo_hinh: string | null;
  trang_thai: 'ai-nhap' | 'hs-xac-nhan' | 'hs-bao-sai' | 'da-chot' | 'lech' | 'tu-choi' | string;
  nhan_xet_gv: string | null;
  hs_ly_do_bao_sai?: string | null;
  chua_co_anh?: boolean;
  da_ghi_so_loi: boolean;
  tao_luc: string;
  cacCau: CauKTTX[];
  cauDoiChieu?: { diem_ai: number | null; diem_chot: number | null }[];
};

export type XemTruocExcelPayload = {
  khop: { student_id: string; ten_hs: string; bai_nop_id: string; diem_ai: number | null; diem_hs: number; diem_excel: number }[];
  lech: { student_id: string; ten_hs: string; bai_nop_id: string; diem_ai: number | null; diem_hs: number; diem_excel: number; ly_do_hs: string | null }[];
  chuaNopHoacChuaXacNhan: { student_id: string; ten_hs: string; bai_nop_id: string | null; diem_ai: number | null; diem_excel: number; chuaCoAnh: boolean }[];
  khongGhepDuoc: { dongSo: number; maHS: string; hoTen: string; diemRaw: string; lyDo: string }[];
  tongDongHopLe: number;
};

/**
 * Component React `TheNopKttxGV`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function TheNopKttxGV({
  item,
  readOnly,
  dictList,
  onUpdated,
}: {
  item: KttxBaiNopGV;
  readOnly: boolean;
  dictList: LoiDictItem[];
  onUpdated: (updated: KttxBaiNopGV, msg: string) => void;
}) {
  const [cacCau, setCacCau] = useState<CauKTTX[]>(item.cacCau ?? []);
  const tt = chuanHoaTrangThaiKTTX(item.trang_thai);
  const [tongGv, setTongGv] = useState<string>(
    item.tong_diem_excel != null
      ? String(item.tong_diem_excel)
      : item.tong_diem_gv != null
        ? String(item.tong_diem_gv)
        : item.tong_diem_hs != null
          ? String(item.tong_diem_hs)
          : item.tong_diem_tren_bai != null
            ? String(item.tong_diem_tren_bai)
            : item.tong_diem_ai != null
              ? String(item.tong_diem_ai)
              : ''
  );
  const [nhanXet, setNhanXet] = useState<string>(item.nhan_xet_gv ?? '');
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function xuLyDuyet(trangThai: 'da-chot' | 'tu-choi') {
    if (readOnly) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/gv/kttx', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duyet',
          id: item.id,
          trangThai,
          tongDiemGv: tongGv.trim() === '' ? null : Number(tongGv.replace(',', '.')),
          nhanXetGv: nhanXet,
          cacCau,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(json?.error || 'Không lưu được chốt điểm.');
        return;
      }
      const next: KttxBaiNopGV = {
        ...item,
        ...json.item,
        ten_hs: item.ten_hs,
        anh_urls: item.anh_urls,
        cacCau: json.item?.cacCau ?? cacCau,
      };
      const tb =
        trangThai === 'da-chot'
          ? `✓ Đã chốt bài của ${item.ten_hs}${json.soLoiDaGhi ? ` (+${json.soLoiDaGhi} lỗi vào Sổ lỗi)` : ''}.`
          : `Đã yêu cầu ${item.ten_hs} chụp lại ảnh rõ hơn.`;
      setMsg(tb);
      onUpdated(next, tb);
    } catch {
      setMsg('Lỗi kết nối khi chốt điểm.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className="mc-khoi"
      style={{
        minWidth: 0,
        borderLeft:
          tt === 'lech' || tt === 'hs-bao-sai' || item.can_kiem_tra
            ? '5px solid #ea580c'
            : tt === 'da-chot'
              ? '5px solid #16a34a'
              : '5px solid #2563eb',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <b>{item.ten_hs}</b> (<code>{item.student_id}</code>) ·{' '}
          <span className="mc-ghi">{item.ten_bai_ai || 'Bài KTTX'}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {(tt === 'lech' || tt === 'hs-bao-sai' || item.can_kiem_tra) && (
            <span className="kttx-pill tay">
              <AnhChuDe
                src="/tinh-nang/kttx/ic-lech.webp"
                fallbackNode={<span>⚠️</span>}
                alt="Cần kiểm tra tay do lệch điểm hoặc báo sai"
                width={24}
                height={24}
                className="kttx-ic"
                loading="lazy"
              />
              {tt === 'lech' ? 'Lệch điểm' : tt === 'hs-bao-sai' ? 'HS báo sai' : 'Cần đối chiếu'}
            </span>
          )}
          <span
            className={`kttx-pill ${
              tt === 'da-chot' ? 'duyet' : tt === 'tu-choi' ? 'tu-choi' : 'cho'
            }`}
          >
            <AnhChuDe
              src={
                tt === 'da-chot'
                  ? '/tinh-nang/kttx/ic-da-chot.webp'
                  : tt === 'hs-xac-nhan'
                    ? '/tinh-nang/kttx/ic-hs-xac-nhan.webp'
                    : tt === 'lech' || tt === 'hs-bao-sai' || tt === 'tu-choi'
                      ? '/tinh-nang/kttx/ic-lech.webp'
                      : '/tinh-nang/kttx/ic-ban-nhap.webp'
              }
              fallbackNode={null}
              alt="Trạng thái bài nộp"
              width={24}
              height={24}
              className="kttx-ic"
              loading="lazy"
            />
            {tt === 'da-chot'
              ? 'Đã chốt'
              : tt === 'hs-xac-nhan'
                ? 'HS đã xác nhận'
                : tt === 'hs-bao-sai'
                  ? 'HS báo sai'
                  : tt === 'lech'
                    ? 'Lệch Excel'
                    : tt === 'tu-choi'
                      ? 'Cần chụp lại'
                      : 'AI nháp'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 13, color: '#334155', marginTop: 6 }}>
        <span>AI đọc: <b>{item.tong_diem_ai != null ? String(item.tong_diem_ai).replace('.', ',') : '—'}</b></span>
        <span>HS xác nhận: <b>{item.tong_diem_hs != null ? String(item.tong_diem_hs).replace('.', ',') : '—'}</b></span>
        <span>Excel GV: <b>{item.tong_diem_excel != null ? String(item.tong_diem_excel).replace('.', ',') : '—'}</b></span>
        {item.chua_co_anh && <span className="kttx-pill cho">Chưa có ảnh</span>}
      </div>

      {item.hs_ly_do_bao_sai && (
        <div className="kttx-canh-bao" style={{ marginTop: 8 }}>
          <b>💬 Lý do HS báo sai:</b> {item.hs_ly_do_bao_sai}
        </div>
      )}

      {item.can_kiem_tra && item.ly_do_kiem_tra?.length > 0 && (
        <div className="kttx-canh-bao" style={{ marginTop: 8 }}>
          <b>Lý do cần đối chiếu:</b> {item.ly_do_kiem_tra.join('; ')}
        </div>
      )}

      {item.anh_urls?.length > 0 ? (
        <div style={{ margin: '10px 0' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {item.anh_urls.map((u, idx) => (
              <button
                key={u}
                type="button"
                className="nho"
                style={{ padding: 4 }}
                onClick={() => setZoomIdx(zoomIdx === idx ? null : idx)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={u}
                  alt={`Trang ${idx + 1} - ${item.ten_hs}`}
                  style={{ width: 92, height: 112, objectFit: 'cover', borderRadius: 6, display: 'block' }}
                />
              </button>
            ))}
          </div>
          {zoomIdx != null && item.anh_urls[zoomIdx] && (
            <div className="kttx-canvas-hop" style={{ marginTop: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.anh_urls[zoomIdx]} alt="Phóng to trang bài làm" />
            </div>
          )}
        </div>
      ) : (
        <p className="mc-ghi" style={{ margin: '6px 0' }}>
          {item.anh_da_xoa ? 'Ảnh đã tự xoá sau 30 ngày.' : 'Không có ảnh đính kèm.'}
        </p>
      )}

      <div className="kttx-cau-list" style={{ marginTop: 8 }}>
        {cacCau.map((c, idx) => (
          <div key={c.soCau} className={`kttx-cau-item${c.doTinCay < 0.6 ? ' thap' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <b>Câu {c.soCau}</b>
              <span className="mc-ghi">Tin cậy AI: {Math.round(c.doTinCay * 100)}%</span>
            </div>
            <div style={{ fontSize: 13.5, color: '#334155' }}>
              <MathText>{c.noiDungNgan}</MathText>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ fontSize: 13 }}>
                Điểm đạt
                <input
                  type="number"
                  step={0.25}
                  min={0}
                  max={10}
                  disabled={readOnly}
                  value={c.diemDat ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? null : Number(e.target.value);
                    setCacCau((list) => list.map((x, i) => (i === idx ? { ...x, diemDat: v } : x)));
                  }}
                  style={{ width: 72, marginLeft: 4 }}
                />
              </label>
              <span className="mc-ghi">/ {c.diemToiDa ?? '?'}</span>
              <label style={{ fontSize: 13, flex: '1 1 180px' }}>
                Mã lỗi ghi Sổ lỗi
                <select
                  disabled={readOnly}
                  value={c.maLoiGoiY ?? ''}
                  onChange={(e) => {
                    const code = e.target.value || null;
                    const dictHit = dictList.find((d) => d.error_code === code);
                    setCacCau((list) =>
                      list.map((x, i) =>
                        i === idx
                          ? { ...x, maLoiGoiY: code, kuId: dictHit?.ku_id ?? x.kuId }
                          : x
                      )
                    );
                  }}
                  style={{ marginLeft: 4, maxWidth: '100%' }}
                >
                  <option value="">(Không có lỗi)</option>
                  {dictList.map((d) => (
                    <option key={d.error_code} value={d.error_code}>
                      {d.error_code} — {d.misconception.slice(0, 60)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {c.nhanXetGV && (
              <div className="mc-ghi">Lời phê đọc được: {c.nhanXetGV}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 10 }}>
        <label style={{ fontSize: 13.5 }}>
          <b>Tổng điểm GV duyệt</b>
          <input
            type="text"
            inputMode="decimal"
            disabled={readOnly}
            value={tongGv}
            onChange={(e) => setTongGv(e.target.value)}
            style={{ width: 82, marginLeft: 6 }}
          />
        </label>
        <label style={{ fontSize: 13.5, flex: '1 1 220px' }}>
          Nhận xét gửi học sinh
          <input
            type="text"
            disabled={readOnly}
            value={nhanXet}
            onChange={(e) => setNhanXet(e.target.value)}
            placeholder="Ví dụ: Em xem lại dấu khi quy đồng ở câu 2"
          />
        </label>
      </div>

      {!readOnly && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="nho chinh"
            disabled={busy}
            onClick={() => xuLyDuyet('da-chot')}
          >
            {busy ? 'Đang lưu…' : tt === 'lech' ? '✓ Chốt điểm & Ghi Sổ lỗi' : '✓ Duyệt & Chốt điểm'}
          </button>
          {item.tong_diem_excel != null && (
            <button type="button" className="nho" onClick={() => setTongGv(String(item.tong_diem_excel))}>
              Chọn điểm Excel ({String(item.tong_diem_excel).replace('.', ',')})
            </button>
          )}
          {item.tong_diem_hs != null && (
            <button type="button" className="nho" onClick={() => setTongGv(String(item.tong_diem_hs))}>
              Chọn điểm HS ({String(item.tong_diem_hs).replace('.', ',')})
            </button>
          )}
          <button
            type="button"
            className="nho"
            disabled={busy}
            onClick={() => xuLyDuyet('tu-choi')}
          >
            ↺ Yêu cầu chụp lại
          </button>
          {item.da_ghi_so_loi && <span className="mc-ghi">Đã ghi Sổ lỗi</span>}
        </div>
      )}

      {msg && <p style={{ margin: '8px 0 0', fontWeight: 700, color: '#15803d' }}>{msg}</p>}
    </article>
  );
}

/**
 * Component React `KttxGVClient`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function KttxGVClient({
  lop,
  vaiTro,
  siSoLop,
  baiHienTai,
  baiListBanDau,
  deKiemTraList,
  baiNopBanDau,
  errorDictionary,
  cheDoXemThu = false,
}: {
  lop: string;
  vaiTro: string;
  siSoLop: number;
  baiHienTai?: KttxBaiGV | null;
  baiListBanDau: KttxBaiGV[];
  deKiemTraList: DeKiemTraShort[];
  baiNopBanDau: KttxBaiNopGV[];
  errorDictionary: LoiDictItem[];
  cheDoXemThu?: boolean;
}) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const readOnly = vaiTro === 'du-gio';
  const [baiList, setBaiList] = useState<KttxBaiGV[]>(baiListBanDau);
  const [baiNopList, setBaiNopList] = useState<KttxBaiNopGV[]>(baiNopBanDau);

  const [deIdChon, setDeIdChon] = useState('');
  const [tieuDeMoi, setTieuDeMoi] = useState('');
  const [chuongMoi, setChuongMoi] = useState('C1');
  const [ngayThiMoi, setNgayThiMoi] = useState('');
  const [busy, setBusy] = useState(false);
  const [thongBao, setThongBao] = useState('');

  const [baiChotExcelId, setBaiChotExcelId] = useState<string>(baiHienTai?.id ?? baiListBanDau[0]?.id ?? '');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [xemTruocExcel, setXemTruocExcel] = useState<XemTruocExcelPayload | null>(null);
  const [excelLoi, setExcelLoi] = useState('');

  const dictMap = useMemo(
    () => new Map(errorDictionary.map((d) => [d.error_code, d.misconception])),
    [errorDictionary]
  );

  const dsSapXep = useMemo(() => {
    return [...baiNopList].sort((a, b) => {
      const rank = (x: KttxBaiNopGV) => {
        const t = chuanHoaTrangThaiKTTX(x.trang_thai);
        if (t === 'lech' || t === 'hs-bao-sai') return 0;
        if (t === 'hs-xac-nhan') return 1;
        if (t === 'ai-nhap') return 2;
        if (t === 'tu-choi') return 3;
        return 10;
      };
      return rank(a) - rank(b) + (a.can_kiem_tra ? 0 : 0.5) - (b.can_kiem_tra ? 0 : 0.5);
    });
  }, [baiNopList]);

  const thongKe = useMemo(
    () =>
      tinhThongKeBaiKTTX(
        baiNopList.map((b) => ({
          student_id: b.student_id,
          ten_hs: b.ten_hs,
          trang_thai: b.trang_thai,
          tong_diem: b.tong_diem_excel ?? b.tong_diem_gv ?? b.tong_diem_hs ?? b.tong_diem_tren_bai ?? b.tong_diem_ai ?? null,
          can_kiem_tra: Boolean(b.can_kiem_tra),
          cac_cau: b.cacCau ?? [],
        })),
        siSoLop
      ),
    [baiNopList, siSoLop]
  );

  const thongKeNghienCuu = useMemo(
    () =>
      tinhThongKeNghienCuuKTTX(
        baiNopList.map((b) => ({
          trang_thai: b.trang_thai,
          tong_diem_ai: b.tong_diem_ai ?? null,
          tong_diem_hs: b.tong_diem_hs ?? null,
          tong_diem_excel: b.tong_diem_excel ?? null,
          hs_ly_do_bao_sai: b.hs_ly_do_bao_sai ?? null,
          cau_doi_chieu: b.cauDoiChieu ?? [],
        }))
      ),
    [baiNopList]
  );

  const duDieuKienDuyetNhanh = useMemo(
    () =>
      baiNopList
        .filter((b) => {
          const t = chuanHoaTrangThaiKTTX(b.trang_thai);
          return (t === 'ai-nhap' || t === 'hs-xac-nhan') && !b.can_kiem_tra && b.tong_diem_khop;
        })
        .map((b) => b.id),
    [baiNopList]
  );

  async function taoBaiMoi(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly || !tieuDeMoi.trim()) return;
    if (cheDoXemThu) {
      setThongBao('Đang ở chế độ xem thử cục bộ.');
      return;
    }
    setBusy(true);
    setThongBao('');
    try {
      const res = await fetch('/api/gv/kttx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lop,
          deId: deIdChon || null,
          tieuDe: tieuDeMoi.trim(),
          chuong: chuongMoi,
          ngayThi: ngayThiMoi || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setThongBao(json?.error || 'Không tạo được bài KTTX.');
        return;
      }
      setBaiList((prev) => [json.bai, ...prev]);
      setTieuDeMoi('');
      setDeIdChon('');
      setThongBao('✓ Đã tạo bài KTTX mới.');
    } catch {
      setThongBao('Lỗi kết nối.');
    } finally {
      setBusy(false);
    }
  }

  async function duyetHangLoat() {
    if (readOnly || !duDieuKienDuyetNhanh.length) return;
    if (cheDoXemThu) {
      setBaiNopList((prev) =>
        prev.map((x) =>
          duDieuKienDuyetNhanh.includes(x.id) ? { ...x, trang_thai: 'da-chot', da_ghi_so_loi: true } : x
        )
      );
      setThongBao(`✓ Đã chốt nhanh ${duDieuKienDuyetNhanh.length} bài trên chế độ xem thử.`);
      return;
    }
    setBusy(true);
    setThongBao('');
    try {
      const res = await fetch('/api/gv/kttx', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duyet-hang-loat',
          lop,
          ids: duDieuKienDuyetNhanh,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setThongBao(json?.error || 'Không duyệt hàng loạt được.');
        return;
      }
      setBaiNopList((prev) =>
        prev.map((x) =>
          duDieuKienDuyetNhanh.includes(x.id) ? { ...x, trang_thai: 'da-chot', da_ghi_so_loi: true } : x
        )
      );
      setThongBao(
        `✓ Đã chốt ${json.soDaDuyet} bài tin cậy (+${json.soLoiDaGhi} lượt lỗi vào Sổ lỗi).`
      );
    } catch {
      setThongBao('Lỗi kết nối.');
    } finally {
      setBusy(false);
    }
  }

  async function guiExcel(mode: 'xem-truoc' | 'chot') {
    if (readOnly) return;
    const targetBai = baiHienTai?.id || baiChotExcelId;
    if (!targetBai) {
      setExcelLoi('Vui lòng chọn bài KTTX trước khi tải Excel.');
      return;
    }
    if (!excelFile) {
      setExcelLoi('Vui lòng chọn tệp bảng điểm .xlsx.');
      return;
    }
    if (cheDoXemThu) {
      setThongBao('Đang ở chế độ xem thử — xem trước Excel đang hiển thị dữ liệu mẫu.');
      return;
    }

    setBusy(true);
    setExcelLoi('');
    setThongBao('');
    try {
      const fd = new FormData();
      fd.append('lop', lop);
      fd.append('baiId', targetBai);
      fd.append('mode', mode);
      fd.append('file', excelFile);

      const res = await fetch('/api/gv/kttx/excel', { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setExcelLoi(json?.error || 'Không xử lý được file Excel.');
        return;
      }

      if (mode === 'xem-truoc') {
        setXemTruocExcel(json.ketQua as XemTruocExcelPayload);
        return;
      }

      setXemTruocExcel(null);
      setExcelFile(null);
      setThongBao(
        `✓ Đã chốt từ Excel: ${json.soChotKhop} khớp, ${json.soDanhDauLech} lệch cần xem, ${json.soChotChuaCoAnh} chốt theo Excel (+${json.soLoiDaGhi} lỗi vào Sổ lỗi).`
      );

      // Tải lại danh sách mới nhất từ API giáo viên
      const refresh = await fetch(`/api/gv/kttx?lop=${encodeURIComponent(lop)}${baiHienTai ? `&baiId=${encodeURIComponent(baiHienTai.id)}` : ''}`);
      const rJson = await refresh.json().catch(() => null);
      if (refresh.ok && rJson?.baiNopList) {
        setBaiNopList(rJson.baiNopList);
      }
    } catch {
      setExcelLoi('Lỗi kết nối khi tải bảng điểm Excel.');
    } finally {
      setBusy(false);
    }
  }

  function taiCsv() {
    const csv = xuatCsvKTTX(
      baiHienTai?.tieu_de || `KTTX-${lop}`,
      baiNopList.map((b) => ({
        student_id: b.student_id,
        ten_hs: b.ten_hs,
        trang_thai: b.trang_thai,
        tong_diem: b.tong_diem_excel ?? b.tong_diem_gv ?? b.tong_diem_hs ?? b.tong_diem_tren_bai ?? b.tong_diem_ai ?? null,
        tong_diem_ai: b.tong_diem_ai ?? null,
        tong_diem_hs: b.tong_diem_hs ?? null,
        tong_diem_excel: b.tong_diem_excel ?? null,
        hs_ly_do_bao_sai: b.hs_ly_do_bao_sai ?? null,
        can_kiem_tra: b.can_kiem_tra,
        cac_cau: b.cacCau ?? [],
        ngay_nop: b.tao_luc?.slice(0, 10) ?? '',
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kttx-${lop}-${baiHienTai?.id?.slice(0, 8) || 'tat-ca'}.csv`;
    a.click();
  }

  return (
    <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
      {readOnly && (
        <p className="bang-vang">
          Thầy cô đang xem lớp này với quyền <b>dự giờ (chỉ xem)</b> — các nút tạo, sửa điểm và duyệt bài đã được tắt.
        </p>
      )}

      {!baiHienTai && !readOnly && (
        <form className="mc-khoi" style={{ minWidth: 0 }} onSubmit={taoBaiMoi}>
          <h2 style={{ marginTop: 0 }}>1. Tạo bài KTTX mới (hoặc nhập từ Đề kiểm tra)</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {deKiemTraList.length > 0 && (
              <label style={{ fontSize: 14 }}>
                Nhập nhanh từ Đề kiểm tra có sẵn (tuỳ chọn)
                <select
                  value={deIdChon}
                  onChange={(e) => {
                    const id = e.target.value;
                    setDeIdChon(id);
                    const de = deKiemTraList.find((x) => x.id === id);
                    if (de) {
                      setTieuDeMoi(de.tieu_de);
                      setChuongMoi(de.chuong || 'C1');
                    }
                  }}
                >
                  <option value="">-- Tạo mới thủ công --</option>
                  {deKiemTraList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.tieu_de} ({d.chuong})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="kttx-o-doi">
              <label style={{ fontSize: 14 }}>
                Tên bài KTTX
                <input
                  type="text"
                  required
                  value={tieuDeMoi}
                  onChange={(e) => setTieuDeMoi(e.target.value)}
                  placeholder="Ví dụ: KTTX số 1 — Chương III Căn thức"
                />
              </label>
              <label style={{ fontSize: 14 }}>
                Ngày kiểm tra
                <input
                  type="date"
                  value={ngayThiMoi}
                  onChange={(e) => setNgayThiMoi(e.target.value)}
                />
              </label>
            </div>
            <div>
              <button type="submit" className="nho chinh" disabled={busy}>
                ➕ Tạo bài KTTX cho lớp
              </button>
            </div>
          </div>
        </form>
      )}

      {!baiHienTai && (
        <section className="mc-khoi" style={{ minWidth: 0 }}>
          <h2 style={{ marginTop: 0 }}>2. Danh sách bài KTTX của lớp</h2>
          {baiList.length === 0 ? (
            <p className="mc-trong">Chưa tạo bài KTTX nào. Học sinh vẫn có thể chụp bài chế độ tự nhận diện bên dưới.</p>
          ) : (
            <ul className="mc-ds">
              {baiList.map((b) => {
                const thuocBai = baiNopList.filter((n) => n.bai_id === b.id);
                const cho = thuocBai.filter((n) => {
                  const t = chuanHoaTrangThaiKTTX(n.trang_thai);
                  return t !== 'da-chot' && t !== 'tu-choi';
                }).length;
                return (
                  <li
                    key={b.id}
                    className="mc-dong"
                    style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <b>{b.tieu_de}</b>{' '}
                      <span className="mc-ghi">
                        ({thuocBai.length} bài · {cho} chờ chốt)
                      </span>
                    </div>
                    <a className="nho chinh" href={`/gv/kttx/${b.id}?lop=${encodeURIComponent(lop)}`}>
                      Mở bảng điểm &amp; Duyệt →
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Khối thống kê & hành động nhanh */}
      <section className="mc-khoi" style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0 }}>
            {baiHienTai ? `Tổng hợp bài: ${baiHienTai.tieu_de}` : 'Tổng hợp bài KTTX đã chụp trong lớp'}
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="nho" onClick={taiCsv}>
              ⬇ Xuất CSV UTF-8 BOM
            </button>
            {!readOnly && duDieuKienDuyetNhanh.length > 0 && (
              <button
                type="button"
                className="nho chinh"
                disabled={busy}
                onClick={duyetHangLoat}
              >
                ✅ Duyệt nhanh {duDieuKienDuyetNhanh.length} bài tin cậy
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 12 }}>
          <div className="mc-o" style={{ display: 'grid', gap: 4 }}>
            <span className="mc-ghi">Đã nộp / Sĩ số</span>
            <b style={{ fontSize: '1.25rem' }}>{thongKe.soHsNop}/{thongKe.siSoLop}</b>
          </div>
          <div className="mc-o" style={{ display: 'grid', gap: 4 }}>
            <span className="mc-ghi">Chờ chốt / Lệch·Báo sai</span>
            <b style={{ fontSize: '1.25rem' }}>{thongKe.choDuyet} / {thongKe.canKiemTraTay}</b>
          </div>
          <div className="mc-o" style={{ display: 'grid', gap: 4 }}>
            <span className="mc-ghi">Đã chốt / HS xác nhận</span>
            <b style={{ fontSize: '1.25rem' }}>{thongKe.daDuyet} / {thongKe.hsXacNhan}</b>
          </div>
          <div className="mc-o" style={{ display: 'grid', gap: 4 }}>
            <span className="mc-ghi">Điểm TB / Trung vị</span>
            <b style={{ fontSize: '1.25rem' }}>
              {thongKe.diemTB == null ? '—' : String(thongKe.diemTB).replace('.', ',')}
              {' / '}
              {thongKe.diemTrungVi == null ? '—' : String(thongKe.diemTrungVi).replace('.', ',')}
            </b>
          </div>
        </div>

        <div className="mc-o" style={{ marginTop: 12, display: 'grid', gap: 6 }}>
          <b style={{ fontSize: 13.5 }}>Chỉ số đối chiếu cho nghiên cứu KHKT</b>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13 }}>
            <span>
              AI đọc trùng Excel (±0,05):{' '}
              <b>
                {thongKeNghienCuu.aiTrungExcel.tiLePct == null
                  ? '—'
                  : `${thongKeNghienCuu.aiTrungExcel.tiLePct}%`}
              </b>{' '}
              (n={thongKeNghienCuu.aiTrungExcel.n})
              {thongKeNghienCuu.aiTrungExcelTheoCau.n > 0 && (
                <> · Theo câu: <b>{thongKeNghienCuu.aiTrungExcelTheoCau.tiLePct}%</b> (n={thongKeNghienCuu.aiTrungExcelTheoCau.n})</>
              )}
            </span>
            <span>
              HS xác nhận trùng Excel:{' '}
              <b>
                {thongKeNghienCuu.hsTrungExcel.tiLePct == null
                  ? '—'
                  : `${thongKeNghienCuu.hsTrungExcel.tiLePct}%`}
              </b>{' '}
              (n={thongKeNghienCuu.hsTrungExcel.n})
            </span>
            <span>
              HS &ldquo;Báo sai&rdquo; trúng AI sai thật:{' '}
              <b>{thongKeNghienCuu.baoSaiDungThat.soBai}/{thongKeNghienCuu.baoSaiDungThat.tongBaoSai}</b>
            </span>
          </div>
        </div>

        {!readOnly && (baiHienTai || baiList.length > 0) && (
          <div className="mc-o" style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <b style={{ fontSize: 14.5 }}>Bước 3 · Chốt điểm từ bảng điểm Excel (.xlsx)</b>
              <a
                className="nho"
                href={`/api/gv/kttx/excel?lop=${encodeURIComponent(lop)}${(baiHienTai?.id || baiChotExcelId) ? `&baiId=${encodeURIComponent(baiHienTai?.id || baiChotExcelId)}` : ''}`}
              >
                📄 Tải file mẫu
              </a>
            </div>
            {!baiHienTai && baiList.length > 0 && (
              <label style={{ fontSize: 13 }}>
                Chọn bài KTTX áp dụng bảng điểm Excel
                <select value={baiChotExcelId} onChange={(e) => setBaiChotExcelId(e.target.value)}>
                  {baiList.map((b) => (
                    <option key={b.id} value={b.id}>{b.tieu_de}</option>
                  ))}
                </select>
              </label>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => {
                  setExcelFile(e.target.files?.[0] ?? null);
                  setXemTruocExcel(null);
                  setExcelLoi('');
                }}
                style={{ maxWidth: '100%' }}
              />
              <button
                type="button"
                className="nho chinh"
                disabled={busy || !excelFile}
                onClick={() => void guiExcel('xem-truoc')}
              >
                📥 Tải bảng điểm Excel để chốt
              </button>
            </div>
            {excelLoi && <p role="alert" style={{ margin: 0, color: '#b91c1c', fontWeight: 700, fontSize: 13.5 }}>{excelLoi}</p>}

            {xemTruocExcel && (
              <div style={{ display: 'grid', gap: 10 }}>
                <div className="kttx-nhom-o" style={{ borderColor: '#86efac', background: '#f0fdf4' }}>
                  <b>✅ Khớp ({xemTruocExcel.khop.length} em — sẽ chuyển thành Đã chốt)</b>
                  {xemTruocExcel.khop.length > 0 && (
                    <div className="kttx-bang-cuon">
                      <table>
                        <thead><tr><th>Mã HS</th><th>Họ tên</th><th>HS</th><th>Excel</th></tr></thead>
                        <tbody>
                          {xemTruocExcel.khop.map((r) => (
                            <tr key={r.student_id}>
                              <td><code>{r.student_id}</code></td>
                              <td>{r.ten_hs}</td>
                              <td>{String(r.diem_hs).replace('.', ',')}</td>
                              <td><b>{String(r.diem_excel).replace('.', ',')}</b></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="kttx-nhom-o" style={{ borderColor: '#fdba74', background: '#fff7ed' }}>
                  <b>⚠️ Lệch ({xemTruocExcel.lech.length} em — sẽ đánh dấu Lệch để cô mở ảnh xem)</b>
                  {xemTruocExcel.lech.length > 0 && (
                    <div className="kttx-bang-cuon">
                      <table>
                        <thead><tr><th>Mã HS</th><th>Họ tên</th><th>AI</th><th>HS</th><th>Excel</th></tr></thead>
                        <tbody>
                          {xemTruocExcel.lech.map((r) => (
                            <tr key={r.student_id}>
                              <td><code>{r.student_id}</code></td>
                              <td>{r.ten_hs}</td>
                              <td>{r.diem_ai != null ? String(r.diem_ai).replace('.', ',') : '—'}</td>
                              <td>{String(r.diem_hs).replace('.', ',')}</td>
                              <td><b>{String(r.diem_excel).replace('.', ',')}</b></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="kttx-nhom-o">
                  <b>🕒 Có điểm Excel nhưng em chưa nộp / chưa xác nhận ({xemTruocExcel.chuaNopHoacChuaXacNhan.length} em — chốt theo Excel, ghi chú chưa có ảnh)</b>
                  {xemTruocExcel.chuaNopHoacChuaXacNhan.length > 0 && (
                    <div className="kttx-bang-cuon">
                      <table>
                        <thead><tr><th>Mã HS</th><th>Họ tên</th><th>Excel chốt</th><th>Ảnh</th></tr></thead>
                        <tbody>
                          {xemTruocExcel.chuaNopHoacChuaXacNhan.map((r) => (
                            <tr key={r.student_id}>
                              <td><code>{r.student_id}</code></td>
                              <td>{r.ten_hs}</td>
                              <td><b>{String(r.diem_excel).replace('.', ',')}</b></td>
                              <td>{r.chuaCoAnh ? 'Chưa có ảnh' : 'Có ảnh (HS chưa xác nhận)'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {xemTruocExcel.khongGhepDuoc.length > 0 && (
                  <div className="kttx-nhom-o" style={{ borderColor: '#fca5a5', background: '#fef2f2' }}>
                    <b>❓ Không ghép được học sinh ({xemTruocExcel.khongGhepDuoc.length} dòng — cần cô sửa file Excel)</b>
                    <div className="kttx-bang-cuon">
                      <table>
                        <thead><tr><th>Dòng</th><th>Mã / Tên trong Excel</th><th>Lý do</th></tr></thead>
                        <tbody>
                          {xemTruocExcel.khongGhepDuoc.map((r, i) => (
                            <tr key={`${r.dongSo}-${i}`}>
                              <td>{r.dongSo}</td>
                              <td>{r.maHS || r.hoTen || '—'}</td>
                              <td>{r.lyDo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="nho chinh"
                    disabled={busy || xemTruocExcel.tongDongHopLe === 0}
                    onClick={() => void guiExcel('chot')}
                  >
                    ✓ Chốt điểm từ bảng Excel ({xemTruocExcel.khop.length + xemTruocExcel.chuaNopHoacChuaXacNhan.length} chốt · {xemTruocExcel.lech.length} lệch)
                  </button>
                  <button type="button" className="nho" onClick={() => setXemTruocExcel(null)}>
                    Huỷ xem trước
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {thongKe.cauHaySai.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 14.5 }}>Tỉ lệ mất điểm theo từng câu</h3>
            <div style={{ display: 'grid', gap: 6 }}>
              {thongKe.cauHaySai.slice(0, 8).map((c) => (
                <div key={c.soCau} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 48px', gap: 8, alignItems: 'center', fontSize: 13 }}>
                  <b>Câu {c.soCau}</b>
                  <div style={{ height: 12, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, c.tiLeMatDiemPct)}%`,
                        height: '100%',
                        background: c.tiLeMatDiemPct >= 50 ? '#dc2626' : '#2563eb',
                      }}
                    />
                  </div>
                  <span>{c.tiLeMatDiemPct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {thongKe.topLoi.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 13.5 }}>
            <b>Lỗi gặp nhiều nhất:</b>{' '}
            {thongKe.topLoi
              .map((l) => `${l.errorCode} (${l.soLan} lượt${dictMap.get(l.errorCode) ? `: ${dictMap.get(l.errorCode)}` : ''})`)
              .join(' · ')}
          </div>
        )}

        {thongBao && (
          <p role="status" style={{ margin: '10px 0 0', fontWeight: 700, color: '#15803d' }}>
            {thongBao}
          </p>
        )}
      </section>

      {/* Khối giao diện: Khối nội dung chính */}
      <section style={{ display: 'grid', gap: 12, minWidth: 0 }}>
        {dsSapXep.length === 0 ? (
          <div className="mc-khoi">
            <p className="mc-trong">Chưa có bài KTTX nào được học sinh chụp nộp.</p>
          </div>
        ) : (
          dsSapXep.map((item) => (
            <TheNopKttxGV
              key={item.id}
              item={item}
              readOnly={readOnly}
              dictList={errorDictionary}
              onUpdated={(updated, m) => {
                setThongBao(m);
                setBaiNopList((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
              }}
            />
          ))
        )}
      </section>
    </div>
  );
}
