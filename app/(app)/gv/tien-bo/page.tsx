/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/tien-bo
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/HanhDong, @/lib/gv/manChinh
 */
import BoLoc, { batBuocGiaoVien, phanTram } from '@/components/gv/BoLoc';
import { DanhSachGon, NutDuaVaoTiet, NutGiaoViec } from '@/components/gv/HanhDong';
import { napManChinh } from '@/lib/gv/manChinh';

export const dynamic = 'force-dynamic';

const NHAN_MAU: Record<string, string> = { tot: 'tiến bộ tốt', 'chu-y': 'còn mắc', 'nguy-co': 'ít tiến bộ' };

/** GV-15 📈 Tiến bộ sau tiết trước. */
export default async function TienBo({ searchParams }: { searchParams: { lop?: string; bai?: string } }) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db, user } = await batBuocGiaoVien();
  let d: any;
  try { d = await napManChinh(db, user.id, searchParams); } catch (e: any) {
    return <div className="mc"><h1>Tiến bộ sau tiết trước</h1><p role="alert">Không tải được dữ liệu: {e.message}</p></div>;
  }
  if (!d.lop) return <div className="mc"><h1>Tiến bộ sau tiết trước</h1><p>Chưa có lớp hoặc nội dung.</p></div>;
  const lop = d.lop.class_id, tb = d.tienBo;
  const daDua = new Set<string>(d.keHoach?.loi_dua_vao ?? []);
  const tieuDe = `📈 Tiến bộ sau tiết ${d.baiTruoc?.tenNgan ?? 'trước'}`;

  return (
    <div className="mc">
      <div className="mc-dau">
        <h1>{tieuDe}</h1>
        <BoLoc action="/gv/tien-bo" lops={d.lops} lop={lop} bais={d.bais} bai={d.bai.id} />
      </div>
      <p className="mc-cauhoi">Sau tiết {d.baiTruoc?.tenNgan ?? 'trước'}, các em đã sửa được lỗi chưa? Lỗi nào còn mắc?</p>

      {!d.baiTruoc && <div className="mc-khoi"><p className="mc-trong">{d.bai.tenNgan} là bài đầu tiên, chưa có bài trước để so sánh.</p></div>}
      {d.baiTruoc && !tb?.coSo && (
        <div className="mc-khoi"><p className="mc-trong">Chưa có lỗi nào được ghi ở {d.baiTruoc.tenNgan}. Khi HS làm phiếu và luyện tập bài này, lỗi sẽ hiện ở đây.</p></div>
      )}

      {tb?.coSo > 0 && (
        <>
          <div className="mc-dong-dau">
            <span>{tb.daSoat}/{tb.coSo} HS đã làm lại các lỗi cũ</span>
            {tb.chuaSoat.length > 0 && (
              <>
                <span>· {tb.chuaSoat.length} HS chưa làm</span>
                <NutGiaoViec lop={lop} hs={tb.chuaSoat} loai="nhac-nho" nhan="Nhắc"
                  loiNhan={`Em vào làm phần soát lỗi cũ trước khi học ${d.bai.tenNgan} nhé!`} />
              </>
            )}
          </div>
          {!tb.duDaiDien && <div className="bang-vang">Số liệu chưa đủ đại diện ({tb.daSoat}/{tb.coSo} HS).</div>}

          {/* Khối giao diện: Khối nội dung chính */}
          <section className="mc-khoi" aria-labelledby="k1">
            <h2 id="k1">① Tỉ lệ khắc phục lỗi của lớp</h2>
            <div className="mc-so-hang">
              <span className="mc-so">{phanTram(tb.tiLe)}</span>
              {tb.chenhLech != null ? (
                <span className={`mc-chenh ${tb.chenhLech >= 0 ? 'len' : 'xuong'}`}>
                  {tb.chenhLech >= 0 ? '▲' : '▼'} {Math.abs(tb.chenhLech)} điểm so với sau tiết {d.baiTruoc2?.tenNgan} ({phanTram(tb.tiLeLanTruoc)})
                </span>
              ) : <span className="mc-ghi">Chưa có lần soát trước để so sánh</span>}
            </div>
          </section>

          {/* Khối giao diện: Khối nội dung chính */}
          <section className="mc-khoi" aria-labelledby="k2">
            <h2 id="k2">② Từng lỗi: trước tiết → sau tiết <span className="mc-so-nho">(số HS mắc, chỉ tính HS đã làm lại · thanh nhạt: trước tiết, đậm: còn mắc)</span></h2>
            {tb.loi.length === 0 ? <p className="mc-trong">Chưa có lỗi nào được soát lại.</p> : (
              <DanhSachGon>
                {tb.loi.map((l: any) => {
                  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
                  const max = Math.max(...tb.loi.map((x: any) => x.truoc), 1);
                  return (
                    <li key={l.code} className="mc-dong" style={{ display: 'block' }}>
                      <details>
                        <summary style={{ listStyle: 'none', cursor: 'pointer' }}>
                          <div className="ts">
                            <span className="mc-dong-ten">{l.ten}</span>
                            <span aria-hidden="true" title={`Trước ${l.truoc} HS, sau ${l.sau} HS`}><span className="ts-thanh" style={{ display: 'block', width: `${(l.truoc / max) * 100}%` }}><span style={{ width: `${l.truoc ? (l.sau / l.truoc) * 100 : 0}%` }} /></span></span>
                            <span style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end' }}>
                              <span className="ts-cap">{l.truoc}<span className="mui">→</span>{l.sau} HS</span>
                              <span className={`st ${l.mau}`}>{NHAN_MAU[l.mau]}</span>
                            </span>
                          </div>
                        </summary>
                        <div style={{ padding: '10px 0 4px' }}>
                          {l.hsConMac.length ? (
                            <p className="mc-dong-phu" style={{ margin: '0 0 8px' }}>
                              Còn mắc: {l.hsConMac.map((h: any) => h.ten + (h.trangThai === 'dang-sua' ? ' (đang sửa)' : '')).join(', ')}
                            </p>
                          ) : <p className="mc-dong-phu" style={{ margin: '0 0 8px' }}>Không còn HS nào mắc lỗi này.</p>}
                          <div className="mc-dong-hd" style={{ justifyContent: 'flex-start' }}>
                            {l.sau > 0 && <NutDuaVaoTiet lop={lop} bai={d.bai.id} code={l.code} daCo={daDua.has(l.code)} />}
                            <NutGiaoViec lop={lop} hs={l.hsConMac} loai="goi-sua-loi" mucTieu={[l.code]} nhan="Giao Gói sửa lỗi"
                              loiNhan={`Em làm Gói sửa lỗi "${l.ten}" để chắc kiến thức trước giờ học nhé!`} />
                          </div>
                        </div>
                      </details>
                    </li>
                  );
                })}
              </DanhSachGon>
            )}
          </section>

          {/* Khối giao diện: Khối nội dung chính */}
          <section className="mc-khoi" aria-labelledby="k3">
            <h2 id="k3">③ Học sinh</h2>
            <ul className="mc-ds">
              <li className="mc-dong">
                <div><span className="mc-dong-ten">🚀 Tiến bộ rõ · {tb.nhom.ro.length} HS</span> <span className="mc-dong-phu">khắc phục ≥ {phanTram(d.nguong.tienBoRo)} lỗi</span>
                  <details><summary className="mc-dong-phu" style={{ cursor: 'pointer' }}>Xem</summary><p className="mc-dong-phu">{tb.nhom.ro.map((h: any) => h.ten).join(', ') || 'Chưa có'}</p></details></div>
                <span />
              </li>
              <li className="mc-dong">
                <div><span className="mc-dong-ten">➡ Có tiến bộ · {tb.nhom.co.length} HS</span> <span className="mc-dong-phu">{phanTram(d.nguong.coTienBo)}–{Math.round(d.nguong.tienBoRo * 100) - 1}%</span>
                  <details><summary className="mc-dong-phu" style={{ cursor: 'pointer' }}>Xem</summary><p className="mc-dong-phu">{tb.nhom.co.map((h: any) => h.ten).join(', ') || 'Chưa có'}</p></details></div>
                <span />
              </li>
              <li className="mc-dong">
                <div>
                  <span className="mc-dong-ten">⚠ Chưa tiến bộ · {tb.nhom.chua.length} HS</span> <span className="mc-dong-phu">dưới {phanTram(d.nguong.coTienBo)} hoặc tái phạm</span>
                  <p style={{ margin: '4px 0 0' }}>{tb.nhom.chua.map((h: any) => h.ten + (h.taiPham ? ' (tái phạm)' : '')).join(' · ') || <span className="mc-trong">Không có</span>}</p>
                </div>
                <div className="mc-dong-hd">
                  <NutGiaoViec lop={lop} hs={tb.nhom.chua} loai="goi-sua-loi" chinh
                    mucTieuTheoHS={Object.fromEntries(tb.nhom.chua.map((h: any) => [h.id, tb.loi.filter((l: any) => l.hsConMac.some((x: any) => x.id === h.id)).map((l: any) => l.code)]))}
                    nhan={`Giao Gói sửa lỗi cho ${tb.nhom.chua.length} HS`}
                    loiNhan="Em làm Gói sửa lỗi thầy/cô vừa giao để sửa các lỗi còn mắc nhé!" />
                </div>
              </li>
            </ul>
          </section>
        </>
      )}
      <p className="mc-ghi khong-in">Chi tiết từng mã lỗi và từng HS: <a href={`/gv/phan-tich-lop?lop=${lop}`}>Phân tích lớp</a>.</p>
    </div>
  );
}
