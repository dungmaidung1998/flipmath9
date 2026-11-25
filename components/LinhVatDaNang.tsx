'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/AnhChuDe, @/lib/linhVat
 */
import AnhChuDe from '@/components/AnhChuDe';
import {
  layLinhVat,
  type TuTheCaChep,
  type TuTheHoaDao,
  type TuTheVooc,
} from '@/lib/linhVat';

type Props =
  | { loai: 'vooc'; tuThe: TuTheVooc; kichThuoc?: number; chuyenDong?: boolean; inDenTrang?: boolean; chuThich?: string; className?: string }
  | { loai: 'hoa-dao'; tuThe: TuTheHoaDao; kichThuoc?: number; chuyenDong?: boolean; inDenTrang?: boolean; chuThich?: string; className?: string }
  | { loai: 'ca-chep'; tuThe: TuTheCaChep; kichThuoc?: number; chuyenDong?: boolean; inDenTrang?: boolean; chuThich?: string; className?: string };

/**
 * Component React `LinhVatDaNang`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function LinhVatDaNang(props: Props) {
  const { loai, tuThe, kichThuoc = 88, chuyenDong = false, inDenTrang = false, chuThich, className } = props;
  const info =
    loai === 'vooc'
      ? layLinhVat('vooc', tuThe)
      : loai === 'hoa-dao'
        ? layLinhVat('hoa-dao', tuThe)
        : layLinhVat('ca-chep', tuThe);

  const cls = [
    'lv-anh',
    chuyenDong && !inDenTrang ? 'lv-anh--dong' : '',
    inDenTrang ? 'lv-den-trang' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={'lv-khung' + (chuThich ? ' lv-khung--co-chu' : '')}>
      <AnhChuDe
        src={info.src}
        fallback={info.fallback}
        alt={chuThich ? info.alt : ''}
        width={kichThuoc}
        height={kichThuoc}
        className={cls}
        style={{ width: kichThuoc, height: kichThuoc }}
        loading="lazy"
      />
      {chuThich && <p className="lv-chu-thich">{chuThich}</p>}
    </div>
  );
}
