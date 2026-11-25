/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv
 * LẤY DỮ LIỆU TỪ: lich_bai, learning_events
 * GỌI TỚI: @/lib/tachLoi, @/components/gv/BoLoc, @/lib/supabase/server, @/lib/quaTai, @/components/gv/HanhDong, @/lib/gv/manChinh, @/lib/lichBai, @/lib/kyNangNen
 */
import { tachLoi } from '@/lib/tachLoi';
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import { supabaseAdmin } from '@/lib/supabase/server';
import { NHAN_DAU_HIEU_QUA_TAI, type LoaiDauHieuQuaTai } from '@/lib/quaTai';
import { NutGiaoViec } from '@/components/gv/HanhDong';
import { napManChinh } from '@/lib/gv/manChinh';
import { ngayVN, ngayDep, gioDep } from '@/lib/lichBai';
import { taiHoSoNen, DS_KY_NANG, kyNangCuaChuong } from '@/lib/kyNangNen';
import * as mcGoc from '@/lib/dfle/man-chinh-gv.js';
import {
  chonLopTu,
  lopCuaToi,
  nhanTruongLop,
  tenHienThiLop,
  type ThongKeLop
} from '@/lib/gv/lopCuaToi';
import './hom-nay.css';

export const dynamic = 'force-dynamic';
const mc: any = mcGoc;
const THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
/** Tách tên lỗi dài thành tên ngắn (đọc lướt) và phần giải thích (bấm mới mở). */
const thuNgay = (d: string) => `${THU[new Date(d + 'T12:00:00+07:00').getUTCDay()]} ${ngayDep(d)}`;

/**
 * GV · HÔM NAY — một màn hình trả lời: tiết tới cần làm gì, em nào cần mình ngay.
 *   1. Tiết tới (lấy từ Lịch giao bài): ngày học, hạn chuẩn bị, bao nhiêu em đã chuẩn bị.
 *   2. Cần chú ý: tối đa 5 em, mỗi em một lý do, một nút.
 *   3. Ba lỗi nhiều em mắc nhất ở bài tới.
 *   4. Cảnh báo mất gốc (chỉ khi có kỹ năng nền từ 30% lớp hổng).
 */
export default async function HomNay({ searchParams }: { searchParams: { lop?: string } }) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db, user } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), false);
  const lop = chon.lop;
  if (!lop) return <div className="hn"><h1>Hôm nay</h1><p>Thầy cô chưa được phân công lớp nào.</p></div>;

  const { data: tkRaw } = await db
    .rpc('thong_ke_lop', { p_tu: '2000-01-01' })
    .then((r: any) => r, () => ({ data: null }));
  const tkMap = new Map<string, ThongKeLop>(
    (tkRaw ?? []).map((r: any) => [
      String(r.class_id),
      {
        class_id: String(r.class_id),
        ten_lop: String(r.ten_lop ?? r.class_id),
        so_hs: Number(r.so_hs ?? 0),
        hs_hoat_dong: Number(r.hs_hoat_dong ?? 0),
        ti_le_lam_chu: r.ti_le_lam_chu == null ? null : Number(r.ti_le_lam_chu),
        muc_tb: r.muc_tb == null ? null : Number(r.muc_tb),
        loi_dang_mo: Number(r.loi_dang_mo ?? 0),
        loi_da_nho: Number(r.loi_da_nho ?? 0),
        phut_hoc: Number(r.phut_hoc ?? 0)
      }
    ])
  );

  // 1. Tiết tới: bài đầu tiên trong lịch có ngày học từ hôm nay trở đi
  const homNay = ngayVN();
  // Truy vấn Supabase: đọc dữ liệu từ bảng lich_bai
  const { data: lich } = await db.from('lich_bai').select('lesson_id, ngay_mo, han_chuan_bi, ngay_hoc')
    .eq('class_id', lop.class_id).gte('ngay_hoc', homNay).order('ngay_hoc').limit(1)
    .then((r: any) => r, () => ({ data: null }));
  const tietToi = lich?.[0] ?? null;

  let d: any;
  try { d = await napManChinh(db, user.id, { lop: lop.class_id, bai: tietToi?.lesson_id }); } catch (e: any) {
    return <div className="hn"><h1>Hôm nay</h1><p role="alert">Không tải được dữ liệu lớp: {e.message}. Tải lại trang sau ít phút.</p></div>;
  }
  if (!d.lop) return <div className="hn"><h1>Hôm nay</h1><p>Chưa có nội dung bài học.</p></div>;
  const siSo = d.hocSinh.length;
  const q = `lop=${encodeURIComponent(lop.class_id)}`;
  const kuDau = d.bai.kuIds[0];

  // 2. Cần chú ý: em vừa học chưa chăm vừa hổng nền lên đầu, rồi học chưa chăm, rồi hổng nền
  const cc = d.canChuY;
  const daCo = new Set<string>();
  const canChuY: { id: string; ten: string; lyDo: string; nhac?: string }[] = [];
  for (const c of [...cc.C.filter((x: any) => x.ca2), ...cc.C.filter((x: any) => !x.ca2)]) {
    if (daCo.has(c.id)) continue; daCo.add(c.id);
    canChuY.push({ id: c.id, ten: c.ten, lyDo: c.dauHieu.map((x: any) => x.nhan).join(', ') + (c.ca2 ? ', hổng nền' : ''), nhac: mc.loiNhacMacDinh(c.nangNhat, d.bai.tenNgan) });
  }
  for (const b of cc.B) {
    if (daCo.has(b.id)) continue; daCo.add(b.id);
    canChuY.push({ id: b.id, ten: b.ten, lyDo: `hổng nền: ${b.kyNang.join(', ')}` });
  }

  // 3. Lỗi nhiều em mắc nhất ở bài tới
  const loi = cc.A.slice(0, 3);

  // 4. Mất gốc: kỹ năng nền của chương bài tới có từ 30% lớp hổng
  let matGoc: { ma: string; ten: string; hs: { id: string; ten: string }[] } | null = null;
  try {
    const hoSo = await taiHoSoNen(db, d.hocSinh.map((h: any) => h.id));
    for (const ma of kyNangCuaChuong(`C${d.bai.chuong}`)) {
      const hong = d.hocSinh.filter((h: any) => hoSo.get(h.id)?.get(ma)?.muc === 'hong');
      if (siSo && hong.length / siSo >= 0.3 && (!matGoc || hong.length > matGoc.hs.length)) {
        matGoc = { ma, ten: DS_KY_NANG.find((k) => k.ma === ma)?.ten ?? ma, hs: hong };
      }
    }
  } catch { matGoc = null; }

  const tiLeCB = siSo ? d.soDaChuanBi / siSo : 0;
  const quaHan = tietToi ? Date.now() > Date.parse(tietToi.han_chuan_bi) : false;

  const quaTaiHsMap = new Map<string, { id: string; ten: string; tong: number; loai: Partial<Record<LoaiDauHieuQuaTai, number>> }>();
  try {
    const hsIds = d.hocSinh.map((h: any) => h.id);
    if (hsIds.length) {
      // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
      const bayNgay = new Date(Date.now() - 7 * 86400_000).toISOString();
      const { data: qtRows } = await supabaseAdmin()
        .from('learning_events')
        .select('student_id, payload')
        .in('student_id', hsIds)
        .eq('event_type', 'qua_tai')
        .gte('ts', bayNgay);
      const tenMap = new Map<string, string>(d.hocSinh.map((h: any) => [h.id, h.ten ?? h.id]));
      for (const r of (qtRows ?? []) as any[]) {
        const sid = String(r.student_id ?? '');
        if (!sid) continue;
        const cur = quaTaiHsMap.get(sid) ?? { id: sid, ten: tenMap.get(sid) ?? sid, tong: 0, loai: {} };
        const loai = String(r.payload?.loai ?? '') as LoaiDauHieuQuaTai;
        if (loai in NHAN_DAU_HIEU_QUA_TAI) {
          cur.loai[loai] = (cur.loai[loai] ?? 0) + 1;
        }
        cur.tong += 1;
        quaTaiHsMap.set(sid, cur);
      }
    }
  } catch {
    /* chưa có sự kiện quá tải hoặc chưa chạy SQL 56 */
  }
  const dsQuaTaiTuan = [...quaTaiHsMap.values()].sort((a, b) => b.tong - a.tong);

  const soChuY = canChuY.length;
  return (
    <div className="hn">
      {lops.length > 1 && (
        <section aria-label="Các lớp đang phụ trách">
          <div className="gv-lop-luoi">
            {lops.map((l) => {
              const tk = tkMap.get(l.class_id);
              const dang = l.class_id === lop.class_id;
              return (
                <article
                  key={l.class_id}
                  className={`gv-lop-the${dang ? ' gv-lop-the--dang' : ''}`}
                >
                  <div className="gv-lop-the__dau">
                    <div>
                      <div className="gv-lop-the__ten">Lớp {tenHienThiLop(l)}</div>
                      {l.ten_truong && <div className="gv-lop-the__truong">{l.ten_truong}</div>}
                    </div>
                    {dang && <span className="pill">Đang xem</span>}
                  </div>
                  <div className="gv-lop-the__so">
                    <span>Sĩ số: <b>{tk?.so_hs ?? '—'}</b></span>
                    <span>Hoạt động: <b>{tk?.hs_hoat_dong ?? '—'}</b></span>
                    <span>Làm chủ: <b>{tk?.ti_le_lam_chu == null ? '—' : `${Math.round(tk.ti_le_lam_chu * 100)}%`}</b></span>
                    <span>Lỗi mở: <b>{tk?.loi_dang_mo ?? '—'}</b></span>
                  </div>
                  <div className="gv-lop-the__nut">
                    <a href={`/gv?lop=${encodeURIComponent(l.class_id)}`}>
                      {dang ? 'Đang mở lớp này' : 'Vào lớp →'}
                    </a>
                    <a href="/gv/so-sanh-lop">So sánh</a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <header className="hn-dau">
        <div>
          <h1>Hôm nay</h1>
          <p className="hn-phu">{thuNgay(homNay)} · {nhanTruongLop(lop)} · {siSo} học sinh</p>
        </div>
        {lops.length > 1 && (
          <a className="hn-nut-phu" href="/gv/so-sanh-lop">So sánh các lớp →</a>
        )}
      </header>

      {/* Tóm tắt: 3 con số đọc trong 3 giây, bấm để tới phần chi tiết */}
      <nav className="hn-tom" aria-label="Tóm tắt hôm nay">
        <a href="#hn-tiet" className={tietToi ? (tiLeCB >= 0.8 ? 'hn-o tot' : 'hn-o chu-y') : 'hn-o'}>
          <span className="hn-o__bt" aria-hidden="true">📘</span>
          <b>{tietToi ? `${d.soDaChuanBi}/${siSo}` : '—'}</b>
          <small>{tietToi ? 'em đã chuẩn bị' : 'chưa có lịch'}</small>
        </a>
        <a href="#hn-chu-y" className={soChuY ? 'hn-o nguy' : 'hn-o tot'}>
          <span className="hn-o__bt" aria-hidden="true">🙋</span>
          <b>{soChuY}</b><small>em cần chú ý</small>
        </a>
        <a href="#hn-loi" className={loi.length ? 'hn-o chu-y' : 'hn-o tot'}>
          <span className="hn-o__bt" aria-hidden="true">🪤</span>
          <b>{loi.length}</b><small>lỗi nên chữa</small>
        </a>
      </nav>

      {matGoc && (
        <section className="hn-the hn-canh" aria-labelledby="hn-mat-goc">
          <h2 id="hn-mat-goc">⚠️ {matGoc.hs.length}/{siSo} em hổng "{matGoc.ten}"</h2>
          <p>Kiến thức nền của bài tới. Nên ôn 5 phút đầu giờ, hoặc giao gói lấp nền để các em tự ôn trước.</p>
          <NutGiaoViec lop={lop.class_id} loai="goi-lap-nen" hs={matGoc.hs} mucTieu={[matGoc.ma]} chinh
            loiNhan={`Em làm gói lấp nền "${matGoc.ten}" trước buổi học tới nhé: đọc thẻ Ôn nhanh 1 phút rồi làm một lượt luyện.`}
            nhan={`Giao gói lấp nền cho ${matGoc.hs.length} em`} />
        </section>
      )}

      <div className="hn-luoi">
        <div className="hn-cot">
          {/* Khối giao diện: Khối nội dung chính */}
          <section className="hn-the hn-tiet" id="hn-tiet" aria-labelledby="hn-tiet-t">
            <h2 id="hn-tiet-t"><span className="hn-buoc">1</span> Tiết tới</h2>
            {tietToi ? (
              <>
                <p className="hn-bai">{d.bai.ten}</p>
                <p className="hn-ngay">Học {thuNgay(tietToi.ngay_hoc)} · hạn chuẩn bị {ngayVN(tietToi.han_chuan_bi) === homNay ? `${gioDep(tietToi.han_chuan_bi).slice(0, 5)} hôm nay` : gioDep(tietToi.han_chuan_bi)}{quaHan ? ' (đã qua hạn)' : ''}</p>
                <div className="hn-so"><b>{d.soDaChuanBi}</b><span>/{siSo} em đã chuẩn bị</span></div>
                <div className="hn-thanh" role="img" aria-label={`${Math.round(tiLeCB * 100)}% lớp đã chuẩn bị`}><i style={{ width: `${tiLeCB * 100}%` }} /></div>
                <a className="hn-nut" href={`/gv/chuan-bi?${q}&ku=${encodeURIComponent(kuDau)}`}>Xem báo cáo trước giờ</a>
              </>
            ) : (
              <>
                <p className="hn-trong">Chưa đặt lịch, nên web chưa biết tiết tới là bài nào để nhắc học sinh chuẩn bị.</p>
                <a className="hn-nut" href={`/gv/lich-bai?${q}`}>Đặt lịch giao bài</a>
              </>
            )}
          </section>

          {/* Khối giao diện: Khối nội dung chính */}
          <section className="hn-the" id="hn-loi" aria-labelledby="hn-loi-t">
            <h2 id="hn-loi-t"><span className="hn-buoc">2</span> Lỗi nên chữa đầu giờ</h2>
            {loi.length ? (
              <ol className="hn-loi">
                {loi.map((l: any) => {
                  const [ngan, them] = tachLoi(String(l.ten));
                  return (
                    <li key={l.code}>
                      <div className="hn-loi__dong"><span className="hn-loi__ten">{ngan}</span><b className="hn-dem-em">{l.soHS} em</b></div>
                      {them && <details><summary>Chi tiết, ví dụ</summary><p>{them}</p></details>}
                    </li>
                  );
                })}
              </ol>
            ) : <p className="hn-trong">Chưa có bài chuẩn bị nào của bài tới.</p>}
            {loi.length > 0 && <a className="hn-xem-them" href={`/gv/goi-y-tiet?${q}&bai=${encodeURIComponent(d.bai.id)}`}>Xem gợi ý tiết dạy →</a>}
          </section>
        </div>

        {/* Khối giao diện: Khối nội dung chính */}
        <section className="hn-the" id="hn-chu-y" aria-labelledby="hn-chu-y-t">
          <h2 id="hn-chu-y-t"><span className="hn-buoc">3</span> Em cần chú ý</h2>
          {canChuY.length ? (
            <ul className="hn-ds">
              {canChuY.slice(0, 5).map((h) => (
                <li key={h.id}>
                  <div><a href={`/gv/lop/${encodeURIComponent(h.id)}?${q}`}><b>{h.ten}</b></a><span className="hn-ly-do">{h.lyDo}</span></div>
                  {h.nhac
                    ? <NutGiaoViec lop={lop.class_id} loai="nhac-nho" hs={[{ id: h.id, ten: h.ten }]} loiNhan={h.nhac} nhan="Nhắc" />
                    : <a className="hn-nut-phu" href={`/gv/lop/${encodeURIComponent(h.id)}?${q}`}>Xem</a>}
                </li>
              ))}
            </ul>
          ) : <p className="hn-trong">Không em nào đáng lo. 👍</p>}
          {canChuY.length > 5 && <a className="hn-xem-them" href={`/gv/lop?${q}`}>Xem cả lớp ({canChuY.length - 5} em nữa) →</a>}
        </section>
      </div>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="hn-the" style={{ marginTop: 16 }} aria-labelledby="hn-qua-tai">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 id="hn-qua-tai">
            Em có dấu hiệu học quá tải tuần này{' '}
            <span className="hn-dem">{dsQuaTaiTuan.length} em</span>
          </h2>
          <a className="hn-xem-them" href={`/gv/qua-tai?${q}`}>Cấu hình &amp; Mã phụ huynh →</a>
        </div>
        {dsQuaTaiTuan.length > 0 ? (
          <ul className="hn-ds">
            {dsQuaTaiTuan.slice(0, 5).map((h) => {
              const chiTiet = (Object.entries(h.loai) as [LoaiDauHieuQuaTai, number][])
                .filter(([, n]) => n > 0)
                .map(([k, n]) => `${NHAN_DAU_HIEU_QUA_TAI[k].ten} (${n})`)
                .join(' · ');
              return (
                <li key={h.id}>
                  <div>
                    <a href={`/gv/hoc-sinh/${h.id}?${q}`}>{h.ten}</a>
                    <span className="hn-ly-do">{chiTiet || `${h.tong} lượt dấu hiệu hành vi`}</span>
                  </div>
                  <b className="hn-dem-em">{h.tong} lượt</b>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="hn-trong">Tuần này chưa ghi nhận dấu hiệu học quá tải (khuya, dồn dập, sai liên tiếp hay vượt giới hạn ngày).</p>
        )}
      </section>
    </div>
  );
}
