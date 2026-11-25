/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/kttx
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/gv/BoLoc, @/components/AnhChuDe, @/components/kttx/KttxGVClient, @/lib/gv/lopCuaToi, @/lib/khkt/kttxMayChu
 */
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import AnhChuDe from '@/components/AnhChuDe';
import KttxGVClient from '@/components/kttx/KttxGVClient';
import { chonLopTu, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';
import { taiDuLieuKttxGV } from '@/lib/khkt/kttxMayChu';

export const dynamic = 'force-dynamic';

/**
 * Component React `GvKttxPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function GvKttxPage({
  searchParams,
}: {
  searchParams: { lop?: string };
}) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), false);
  const lop = chon.lop;

  if (!lop) {
    return (
      <div className="mc">
        <h1>KTTX trên giấy</h1>
        <p className="mc-trong">Thầy cô chưa được phân công lớp nào.</p>
      </div>
    );
  }

  const dl = await taiDuLieuKttxGV(lop.class_id, null);

  return (
    <div className="mc">
      <div className="mc-dau">
        <h1>KTTX trên giấy — Lớp {tenHienThiLop(lop)}</h1>
        {lops.length > 1 && (
          <form className="mc-loc" action="/gv/kttx">
            <label>
              Lớp
              <select name="lop" defaultValue={lop.class_id}>
                {lops.map((l) => (
                  <option key={l.class_id} value={l.class_id}>
                    {nhanTruongLop(l)}
                  </option>
                ))}
              </select>
            </label>
            <button className="nho">Xem</button>
          </form>
        )}
      </div>
      <p className="mc-cauhoi">
        Tổng hợp bài KTTX học sinh chụp bằng Claude AI; thầy cô kiểm tra đối chiếu các bài đánh dấu đỏ và duyệt để ghi vào Sổ lỗi.
      </p>

      <div style={{ marginBottom: 14 }}>
        <AnhChuDe
          src="/tinh-nang/kttx/gv-excel.webp"
          fallback="/minh-hoa/nv/chi-bang.webp"
          alt="KTTX trên giấy"
          width={960}
          height={240}
          style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--mc-vach)' }}
        />
      </div>

      {dl.chuaCoBang && (
        <p className="bang-vang">
          Chưa chạy file SQL <code>57-kttx.sql</code> trên Supabase — cô chạy tệp này để lưu bài KTTX và ảnh trong Storage.
        </p>
      )}

      <KttxGVClient
        key={lop.class_id}
        lop={lop.class_id}
        vaiTro={lop.vai_tro ?? 'bo-mon'}
        siSoLop={dl.siSoLop}
        baiListBanDau={dl.baiList}
        deKiemTraList={dl.deList}
        baiNopBanDau={dl.baiNopList}
        errorDictionary={dl.errorDictionary}
      />
    </div>
  );
}
