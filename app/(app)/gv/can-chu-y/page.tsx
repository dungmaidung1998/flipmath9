/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/can-chu-y
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/HanhDong, @/lib/gv/manChinh, @/lib/dfle/man-chinh-gv.js
 */
import BoLoc, { batBuocGiaoVien } from '@/components/gv/BoLoc';
import { DanhSachGon, NutBoQua, NutGiaoViec } from '@/components/gv/HanhDong';
import { napManChinh } from '@/lib/gv/manChinh';
// @ts-ignore
import { loiNhacMacDinh } from '@/lib/dfle/man-chinh-gv.js';

export const dynamic = 'force-dynamic';

const PHAM_VI = [['bai', 'Bài này'], ['tuan', 'Tuần'], ['chuong', 'Chương']] as const;

/** GV-16 📊 Thống kê cần chú ý — chỉ 3 khối. */
export default async function CanChuY({ searchParams }: { searchParams: { lop?: string; bai?: string; pv?: string } }) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db, user } = await batBuocGiaoVien();
  let d: any;
  try { d = await napManChinh(db, user.id, searchParams); } catch (e: any) {
    return <div className="mc"><h1>Thống kê cần chú ý</h1><p role="alert">Không tải được dữ liệu: {e.message}</p></div>;
  }
  if (!d.lop) return <div className="mc"><h1>Thống kê cần chú ý</h1><p>Chưa có lớp hoặc nội dung.</p></div>;
  const lop = d.lop.class_id, cc = d.canChuY;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const maxA = Math.max(1, ...cc.A.map((a: any) => a.soHS));
  const goiNen: Record<string, string[]> = {};
  const tenSangMa = new Map(d.kyNang.map((k: any) => [k.ten, k.id]));
  for (const b of cc.B) goiNen[b.id] = b.tatCa.map((t: string) => tenSangMa.get(t)).filter(Boolean);
  const link = (pv: string) => `/gv/can-chu-y?${new URLSearchParams({ lop, bai: d.bai.id, pv })}`;

  return (
    <div className="mc">
      <div className="mc-dau">
        <h1>📊 Cần chú ý · Lớp {d.lop.class_code} · {d.bai.tenNgan}</h1>
        <BoLoc action="/gv/can-chu-y" lops={d.lops} lop={lop} bais={d.bais} bai={d.bai.id} them={{ pv: d.pv }} />
      </div>
      <p className="mc-cauhoi">Lớp sai nhiều ở đâu? Em nào đang có nguy cơ?</p>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi" aria-labelledby="kA">
        <h2 id="kA" style={{ justifyContent: 'space-between' }}>
          <span>A. Lỗi sai nhiều nhất <span className="mc-so-nho">(đếm theo số HS)</span></span>
          <span className="mc-loc" style={{ gap: 4 }}>
            {PHAM_VI.map(([k, nhan]) => (
              <a key={k} className="nut" href={link(k)} aria-current={d.pv === k ? 'true' : undefined}
                style={d.pv === k ? { background: 'var(--chip)', color: 'var(--navy-d)' } : undefined}>{nhan}</a>
            ))}
          </span>
        </h2>
        {cc.A.length ? (
          <>
            <div className="mc-so-hang" style={{ marginBottom: 12 }}>
              <span className="mc-so">{cc.A[0].soHS}</span><span className="mc-ghi">HS mắc lỗi nhiều nhất: {cc.A[0].ten}</span>
            </div>
            <DanhSachGon>
              {cc.A.map((a: any, i: number) => (
                <li key={a.code} className="mc-dong" style={{ display: 'block' }}>
                  <details>
                    <summary style={{ listStyle: 'none', cursor: 'pointer' }}>
                      <div className="ta">
                        <span className="ta-hang">{i + 1}</span>
                        <span className="mc-dong-ten">{a.ten}</span>
                        <span className="ts-thanh" aria-hidden="true"><span style={{ width: `${(a.soHS / maxA) * 100}%` }} /></span>
                        <span className="ta-so">{a.soHS} HS</span>
                      </div>
                    </summary>
                    <p className="mc-dong-phu" style={{ margin: '8px 0 0 34px' }}>{a.hs.map((h: any) => h.ten).join(', ')} · mã {a.code}</p>
                  </details>
                </li>
              ))}
            </DanhSachGon>
          </>
        ) : <p className="mc-trong">Chưa có lỗi nào trong phạm vi này.</p>}
      </section>

      <div className="mc-hai">
        {/* Khối giao diện: Khối nội dung chính */}
        <section className="mc-khoi" aria-labelledby="kB">
          <h2 id="kB"><span className="st nguy-co">B. Nguy cơ do hổng nền</span> <span className="mc-so-nho">{cc.B.length} HS</span></h2>
          {cc.B.length ? (
            <>
              <DanhSachGon>
                {cc.B.map((b: any) => (
                  <li key={b.id} className="mc-dong">
                    <div>
                      <div className="mc-dong-ten">{b.ten}{b.ca2 && <span className="canh" title="Ở cả khối B và C, nên gặp riêng"> ⚠</span>}</div>
                      <div className="mc-dong-phu">{b.soHong} kiến thức hổng · {b.kyNang.join(', ')}</div>
                    </div>
                    <div className="mc-dong-hd">
                      <NutGiaoViec lop={lop} hs={[{ id: b.id, ten: b.ten }]} loai="goi-lap-nen" mucTieuTheoHS={{ [b.id]: goiNen[b.id] }}
                        nhan="Giao gói" loiNhan="Em ôn lại các phần kiến thức nền thầy/cô vừa giao trước khi học bài mới nhé!" />
                    </div>
                  </li>
                ))}
              </DanhSachGon>
              <div style={{ marginTop: 12 }}>
                <NutGiaoViec lop={lop} hs={cc.B.map((b: any) => ({ id: b.id, ten: b.ten }))} loai="goi-lap-nen" mucTieuTheoHS={goiNen} chinh
                  nhan={`Giao Gói lấp nền cho ${cc.B.length} HS`} loiNhan="Em ôn lại các phần kiến thức nền thầy/cô vừa giao trước khi học bài mới nhé!" />
              </div>
            </>
          ) : <p className="mc-trong">Không có HS nào hổng từ {d.nguong.soKyNangHong} phần kiến thức nền trở lên.</p>}
          <p className="mc-ghi" style={{ marginTop: 12 }}>Kiến thức nền đang tạm tính theo các mục đã học trong chương, chưa dùng danh mục kỹ năng nền lớp 6–8.</p>
        </section>

        {/* Khối giao diện: Khối nội dung chính */}
        <section className="mc-khoi" aria-labelledby="kC">
          <h2 id="kC"><span className="st chu-y">C. Học chưa chăm</span> <span className="mc-so-nho">{cc.C.length} HS · chỉ thầy cô thấy</span></h2>
          {cc.C.length ? (
            <>
              <DanhSachGon>
                {cc.C.map((c: any) => (
                  <li key={c.id} className="mc-dong">
                    <div>
                      <div className="mc-dong-ten">{c.ten}{c.ca2 && <span className="canh" title="Ở cả khối B và C, nên gặp riêng"> ⚠</span>}</div>
                      <div className="mc-dong-phu">{c.dauHieu.map((x: any) => x.nhan).join(' · ')}</div>
                    </div>
                    <div className="mc-dong-hd">
                      <NutGiaoViec lop={lop} hs={[{ id: c.id, ten: c.ten }]} loai="nhac-nho" nhan="Nhắc nhở" loiNhan={loiNhacMacDinh(c.nangNhat, d.bai.tenNgan)} />
                      <NutBoQua lop={lop} sid={c.id} />
                    </div>
                  </li>
                ))}
              </DanhSachGon>
              <div style={{ marginTop: 12 }}>
                <NutGiaoViec lop={lop} hs={cc.C.map((c: any) => ({ id: c.id, ten: c.ten }))} loai="nhac-nho" chinh
                  nhan={`Nhắc nhở ${cc.C.length} HS`} loiNhan={`Thầy/cô nhắc em hoàn thành phần chuẩn bị ${d.bai.tenNgan} trước giờ học nhé!`} />
              </div>
            </>
          ) : <p className="mc-trong">Không có HS nào có dấu hiệu học chưa chăm.</p>}
        </section>
      </div>

      {cc.ca2.length > 0 && <p className="mc-ghi"><span className="canh">⚠</span> = HS ở cả khối B và C, nên ưu tiên gặp riêng.</p>}
      <p className="mc-ghi khong-in">
        Ngưỡng xếp HS vào khối B, C chỉnh ở <a href={`/gv/cai-dat-lop?lop=${lop}`}>Cài đặt lớp</a> ·
        Số liệu chi tiết: <a href="/gv/hoc-sinh">Học sinh</a>, <a href={`/gv/phan-tich-lop?lop=${lop}`}>Phân tích lớp</a>
      </p>
    </div>
  );
}
