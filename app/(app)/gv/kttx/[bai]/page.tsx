/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/kttx/[bai]
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/gv/BoLoc, @/components/kttx/KttxGVClient, @/lib/khkt/kttxMayChu, @/lib/gv/lopCuaToi
 */
import { notFound } from 'next/navigation';
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import KttxGVClient from '@/components/kttx/KttxGVClient';
import { taiDuLieuKttxGV } from '@/lib/khkt/kttxMayChu';
import { chonLopTu, lopCuaToi, tenHienThiLop } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * Component React `GvKttxChiTietPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function GvKttxChiTietPage({
  params,
  searchParams,
}: {
  params: { bai: string };
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
        <h1>Chi tiết bài KTTX</h1>
        <p className="mc-trong">Thầy cô chưa được phân công lớp nào.</p>
      </div>
    );
  }

  const dl = await taiDuLieuKttxGV(lop.class_id, params.bai);
  const baiHienTai = dl.baiList.find((b) => b.id === params.bai);
  if (!baiHienTai && !dl.chuaCoBang) {
    notFound();
  }

  return (
    <div className="mc">
      <div className="mc-dau">
        <h1>
          {baiHienTai?.tieu_de || 'Chi tiết bài KTTX'} — Lớp {tenHienThiLop(lop)}
        </h1>
        <a className="nho" href={`/gv/kttx?lop=${encodeURIComponent(lop.class_id)}`}>
          ← Danh sách bài KTTX
        </a>
      </div>

      <KttxGVClient
        key={`${lop.class_id}-${params.bai}`}
        lop={lop.class_id}
        vaiTro={lop.vai_tro ?? 'bo-mon'}
        siSoLop={dl.siSoLop}
        baiHienTai={baiHienTai ?? null}
        baiListBanDau={dl.baiList}
        deKiemTraList={dl.deList}
        baiNopBanDau={dl.baiNopList}
        errorDictionary={dl.errorDictionary}
      />
    </div>
  );
}
