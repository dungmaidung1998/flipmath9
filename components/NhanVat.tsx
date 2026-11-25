'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/nhanVat, @/lib/chuDeChuong, @/components/AnhChuDe
 */
import { useState, type CSSProperties } from 'react';
import { LOI_NHAN_VAT, NHAN_VAT, loiTheoChuong, type LoiNhanVat } from '@/lib/nhanVat';
import { chuDeChuong } from '@/lib/chuDeChuong';
import AnhChuDe from '@/components/AnhChuDe';
import './truc-quan/truc-quan.css';

const MAT: Record<string, { w:number; h:number; trai:[number,number]; phai:[number,number] }> = {
  chao: {w:221,h:360,trai:[61,128],phai:[126,123]},
  'goi-y': {w:211,h:360,trai:[59,138],phai:[115,139]},
  'dong-vien': {w:233,h:380,trai:[75,117],phai:[142,111]},
};

/**
 * Component React `NhayMat`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function NhayMat({ ten }: {ten:string}) {
  const mat = MAT[ten];
  if (!mat) return null;
  return <svg viewBox={`0 0 ${mat.w} ${mat.h}`} className="nhan-vat__mat" aria-hidden="true">
    {[mat.trai,mat.phai].map(([x,y])=><g key={x} transform={`translate(${x} ${y})`}>
      <ellipse rx="18" ry="22" fill="#d9b99e"/>
      <path d="M-13 4q13-13 26 0" stroke="#4b3631" strokeWidth="4" strokeLinecap="round" fill="none"/>
    </g>)}
  </svg>;
}

/**
 * Component React `NhanVat`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function NhanVat({
  loi,
  compact = false,
  moDau = false,
  chuong,
}: {
  loi: LoiNhanVat;
  compact?: boolean;
  moDau?: boolean;
  chuong?: string | null;
}) {
  const [an, setAn] = useState(false);
  const [dungTrangPhuc, setDungTrangPhuc] = useState(false);
  const { ai, anh } = LOI_NHAN_VAT[loi];
  const noi = loiTheoChuong(loi, chuong);
  const chaoDau = moDau ? loiTheoChuong('chao', chuong) : '';
  const nhan = NHAN_VAT[ai];
  const tuThe = moDau ? (ai === 'bin' ? 'chao' : 'goi-y') : anh;
  const anhGoc = '/minh-hoa/nv/' + tuThe + '.webp';
  const cd = chuDeChuong(chuong);
  const style = cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined;

  return (
    <aside
      className={
        'nhan-vat' +
        (compact ? ' nhan-vat--gon' : '') +
        (an ? ' nhan-vat--an' : '') +
        (cd ? ' nhan-vat--chuong' : '')
      }
      aria-label={nhan.ten}
      style={style}
    >
      <button
        className="nhan-vat__anh"
        type="button"
        title={nhan.tinhCach}
        onClick={() => setAn(v => !v)}
        aria-expanded={!an}
        aria-label={an ? 'Hiện lời của ' + nhan.ten : 'Ẩn lời của ' + nhan.ten}
      >
        <span className="nhan-vat__khung">
          {cd ? (
            <AnhChuDe
              src={ai === 'bin' ? cd.nvBin : cd.nvNa}
              fallback={anhGoc}
              onPrimaryState={setDungTrangPhuc}
              alt=""
              width={84}
              height={126}
              loading="lazy"
            />
          ) : (
            <img src={anhGoc} alt="" width={84} height={126} loading="lazy" />
          )}
          {!dungTrangPhuc && <NhayMat ten={tuThe} />}
        </span>
      </button>
      {!an && (
        <p className="nhan-vat__loi">
          <strong>{nhan.ten}</strong>
          <span>{moDau && loi !== 'chao' ? chaoDau + ' ' : ''}{noi}</span>
        </p>
      )}
    </aside>
  );
}
