/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/bang-chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/BangChungClient, @/lib/gv/lopCuaToi
 */
import { batBuocGiaoVien } from '@/components/gv/BoLoc';
import BangChungClient from '@/components/gv/BangChungClient';
import { lopCuaToi } from '@/lib/gv/lopCuaToi';

export const dynamic = 'force-dynamic';

/**
 * Component React `BangChungPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function BangChungPage() {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  if (!lops.length) {
    return (
      <div className="mc">
        <h1>Bảng bằng chứng thực nghiệm</h1>
        <p className="mc-trong">Thầy cô chưa được phân công lớp nào.</p>
      </div>
    );
  }
  return <BangChungClient lops={lops} />;
}
