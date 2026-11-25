/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/cham-vo
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/ChamVoGV, @/lib/gv/lopCuaToi
 */
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import ChamVoGV from '@/components/gv/ChamVoGV';
import { chonLopTu, lopCuaToi } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * Component React `ChamVoPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function ChamVoPage({
  searchParams,
}: {
  searchParams: { lop?: string };
}) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  if (!lops.length) {
    return (
      <div className="mc">
        <h1>Giám sát chấm vở AI</h1>
        <p className="mc-trong">Thầy cô chưa được phân công lớp nào.</p>
      </div>
    );
  }
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), true);
  return <ChamVoGV lops={lops} lopMacDinh={chon.dang} />;
}
