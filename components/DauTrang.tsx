/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/chuDeChuong, @/components/AnhChuDe
 */
import type { CSSProperties, ReactNode } from 'react';
import { chuDeChuong } from '@/lib/chuDeChuong';
import AnhChuDe, { AnhNenChuong } from '@/components/AnhChuDe';

/** 6 bảng màu bối cảnh (trời – biển – đồi Đà Nẵng); chọn theo tiêu đề để mỗi trang một màu, ổn định giữa các lần tải. */
const CANH = ['bien', 'hoang-hon', 'doi-xanh', 'pho-dem', 'hoa-dao', 'nang-sang'] as const;
/** Tranh bối cảnh (Codex ImageGen, 24/11) theo trang — tra theo tiêu đề để không phải sửa từng trang. */
const TRANH: Record<string, string> = {
  'Tiến độ của tôi': 'tien-do', 'Sổ lỗi của em': 'so-loi', 'Ôn thi vào lớp 10': 'on-thi-10', '🧪 Thử tay': 'thi-nghiem',
  'Toán tiếng Anh': 'tieng-anh', 'Kiến thức nền của em': 'kien-thuc-nen', 'Đánh giá theo kiến thức': 'danh-gia', 'Bài học': 'bai-hoc'
};
const chonCanh = (s: string) => CANH[[...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % CANH.length];

/** Đầu trang: khung bối cảnh nhiều màu, tiêu đề to, nhân vật/hình minh hoạ bên phải nhún nhẹ. */
export default function DauTrang({
  tieuDe,
  phu,
  hinh,
  children,
  canh,
  tranh,
  chuong,
  muc,
  nhanVat,
  gon,
}: {
  tieuDe: ReactNode;
  phu?: ReactNode;
  hinh?: string | null;
  children?: ReactNode;
  canh?: (typeof CANH)[number];
  tranh?: string;
  chuong?: string | null;
  muc?: number;
  nhanVat?: 'bin' | 'na';
  gon?: boolean;
}) {
  const c = canh ?? chonCanh(typeof tieuDe === 'string' ? tieuDe : String(phu ?? 'flipmath9'));
  const t = tranh ?? (typeof tieuDe === 'string' ? TRANH[tieuDe] : undefined);
  const cd = chuDeChuong(chuong);
  const fallbackTranh = t ? `/canh/${t}.webp` : null;

  const hinhMuc = typeof muc === 'number' && cd ? cd.anhMuc(muc) : null;
  const coHinhPhai = Boolean(cd && (nhanVat || hinhMuc)) || Boolean(hinh);

  const style: CSSProperties | undefined = cd
    ? { ['--mau-chuong' as string]: cd.mau }
    : t
      ? { ['--dt-tranh' as string]: `url(/canh/${t}.webp)` }
      : undefined;

  return (
    <div
      className={
        'dau-trang dau-trang--canh dau-trang--' +
        c +
        (coHinhPhai ? ' dau-trang--co-hinh' : '') +
        (!cd && t ? ' dau-trang--tranh' : '') +
        (cd ? ' dau-trang--chuong' : '') +
        (gon ? ' dau-trang--gon' : '')
      }
      style={style}
    >
      {cd && <AnhNenChuong src={cd.tranh} fallback={fallbackTranh} />}
      <span className="dau-trang__may dau-trang__may--1" aria-hidden="true" />
      <span className="dau-trang__may dau-trang__may--2" aria-hidden="true" />
      <span className="dau-trang__mat-troi" aria-hidden="true" />
      <svg className="dau-trang__doi" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40 Q60 10 120 32 T250 26 T400 30 V60 H0Z" />
        <path d="M0 50 Q90 30 180 46 T400 42 V60 H0Z" />
      </svg>
      <div className="dau-trang__chu">
        {cd && (
          <p className="dau-trang__dia-danh">
            <span>📍 {cd.ten}</span>
            <span>{cd.bieuTuong} {cd.chuDe}</span>
          </p>
        )}
        <h1>{tieuDe}</h1>
        {phu ? <p className="sub">{phu}</p> : null}
        {children}
      </div>
      {cd && nhanVat ? (
        <AnhChuDe
          className="dau-trang__hinh"
          src={nhanVat === 'bin' ? cd.nvBin : cd.nvNa}
          fallback={hinh ?? cd.anhMuc(typeof muc === 'number' ? muc : 2)}
          alt=""
          width={240}
          height={240}
        />
      ) : cd && hinhMuc ? (
        <AnhChuDe
          className="dau-trang__hinh"
          src={hinhMuc}
          fallback={hinh ?? null}
          alt=""
          width={240}
          height={240}
        />
      ) : hinh ? (
        <img className="dau-trang__hinh" src={hinh} alt="" width={240} height={240} />
      ) : null}
    </div>
  );
}
