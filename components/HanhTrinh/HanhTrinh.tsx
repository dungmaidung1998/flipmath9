'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/NhanVat, @/components/tro-choi-nen/amThanh, @/components/truc-quan/NutAmHieuUng, @/components/MathText, @/components/canh/CanhMinhHoa, @/lib/hanhTrinh, ./diem
 */
import NhanVat from '@/components/NhanVat';
import { phat } from '@/components/tro-choi-nen/amThanh';
import NutAmHieuUng from '@/components/truc-quan/NutAmHieuUng';

import { useEffect, useId, useRef, useState } from 'react';
import MathText from '@/components/MathText';
import { CanhMinhHoa } from '@/components/canh/CanhMinhHoa';
import type { HanhTrinhData } from '@/lib/hanhTrinh';
import { layDiem } from './diem';
import './hanh-trinh.css';

type LuaChon = { noiDung: string };
type CauNho = { hoi: string; pa: LuaChon[]; goiY: string };
const tenChang = ['Đọc tranh, gom dữ kiện', 'Chọn ẩn, đơn vị, điều kiện', 'Lập mô hình', 'Giải', 'Đối chiếu điều kiện và trả lời'];

/**
 * Component React `taoCau`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function taoCau(hoi: string, dung: string, sai: string[], goiY: string): CauNho {
  return { hoi, pa: [dung, ...sai].map(noiDung => ({ noiDung })), goiY };
}

/**
 * Component React `Tich`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Tich() { return <span className="ht-tich" aria-hidden="true">✓</span>; }

/**
 * Component React `HanhTrinh`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function HanhTrinh({ data, hienDe = false }: { data: HanhTrinhData; hienDe?: boolean }) {
  const [gom, setGom] = useState<number[]>([]);
  const [chang, setChang] = useState(0);
  const [muc, setMuc] = useState(0);
  const [sai, setSai] = useState<number[]>([]);
  const [daSai, setDaSai] = useState<number[]>([]);
  const [loi, setLoi] = useState<{ chang: number; hoi: string }[]>([]);
  const [thongBao, setThongBao] = useState('');
  const [daChon, setDaChon] = useState<Record<string, LuaChon>>({});
  
  const noiDung = useRef<HTMLDivElement>(null);
  const dich = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (chang === 0) return;
    const element = chang === 5 ? dich.current : noiDung.current;
    const giamDong = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ block: 'nearest', behavior: giamDong ? 'instant' : 'smooth' });
  }, [chang, muc]);

  const buocGiai = data.buocGiai;
  const donViSai = ['m', 'giờ', 'đồng', 'km/h'].filter(x => x !== data.donVi).slice(0, 2);
  const daiLuong = ['Chọn dữ kiện đã biết: ' + data.duKien[0], 'Chọn một đại lượng tuỳ ý trong đề'];
  const dieuKienSai = ['Chấp nhận mọi giá trị âm', 'Có thể bỏ qua điều kiện và bối cảnh của đề'];
  const chuanBi = [
    taoCau('Chọn đại lượng cần tìm hoặc cần đặt ẩn.', data.an, daiLuong, 'Đọc lại đại lượng đề hỏi và các ký hiệu đề đã đặt.'),
    taoCau('Đại lượng được tính bằng đơn vị nào?', data.donVi, donViSai, 'Xem tên đại lượng và đơn vị của dữ kiện trong đề.'),
    taoCau('Chọn điều kiện hoặc hệ thức dùng để giải.', data.dieuKien, dieuKienSai, 'Dựa vào ý nghĩa của đại lượng hoặc tính chất hình học đã cho.'),
  ];
  const lam = data.moHinh.map(p => taoCau(p.de, p.dung, p.sai, p.congThuc));
  const giai = taoCau(buocGiai.hoi, buocGiai.pa[0], buocGiai.pa.slice(1), buocGiai.goiY);
  const traLoi = { hoi: 'Chọn phương án trả lời câu hỏi của đề.', pa: data.phuongAn.map(noiDung => ({ noiDung })), goiY: data.giai };
  const cauTheoChang = [[], chuanBi, lam, [giai], [traLoi]];
  const dangLam = cauTheoChang[chang]?.[muc];
  const sang = chang === 2 ? data.moHinh[muc].dungDuKien : [];
  const viTri = layDiem(data.id);
  const thuTu = dangLam ? dangLam.pa.map((_, i) => (i + (chang === 4 ? 0 : (chang + muc + Number(data.id.slice(-2))) % dangLam.pa.length)) % dangLam.pa.length) : [];

  function ghiDuKien(i: number) {
    if (gom.includes(i)) return;
    phat('dung');
    setThongBao(data.duKien[i]);
    const moi = [...gom, i];
    setGom(moi);
    if (moi.length === data.duKien.length) setChang(1);
  }

  function chon(i: number) {
    if (!dangLam) return;
    if (i !== 0) {
      if (daSai.includes(i)) return;
      setDaSai([...daSai, i]);
      setSai([...sai, chang]);
      const hoi = chang === 2 ? 'Hệ thức ' + (muc + 1) + ' · ' + data.moHinh[muc].dungDuKien.map(j => data.duKien[j]).join(', ') : dangLam.hoi;
      setLoi([...loi, { chang, hoi: hoi + ' · đã chọn ' + dangLam.pa[i].noiDung }]);
      return;
    }
    phat('dung');
    setDaChon({ ...daChon, [chang + '-' + muc]: dangLam.pa[i] });
    setDaSai([]);
    if (muc + 1 === cauTheoChang[chang].length) {
      setMuc(0);
      setChang(chang + 1);
    } else setMuc(muc + 1);
  }

  return <section className="ht" aria-labelledby={id}>
    <div className="ht-dau"><h2 id={id}>Hành trình giải bài · {data.ten}</h2>
      <NutAmHieuUng className="ht-am" />
    </div>
    {hienDe && <p className="ht-de"><MathText>{data.stem}</MathText></p>}
    <div className="ht-tien-do" aria-label={chang === 5 ? 'Đã hoàn thành năm chặng' : 'Đang ở chặng ' + chang}>
      {tenChang.map((ten, i) => <i key={ten} className={i < chang ? 'xong' : i === chang ? 'dang' : ''}/>)}
    </div>
    <div className={'ht-gom' + (chang > 0 ? ' gon' : '')}>
      <div className="ht-tranh">
        <CanhMinhHoa id={data.id}/>
        {chang === 0 && data.duKien.map((dk, i) => <button type="button" key={dk} className={'ht-diem' + (gom.includes(i) ? ' da' : '')}
          style={{ left: viTri[i][0] + '%', top: viTri[i][1] + '%' }} aria-label={'Dữ kiện ' + (i + 1) + (gom.includes(i) ? ', đã ghi: ' + dk : '')}
          aria-pressed={gom.includes(i)} onClick={() => ghiDuKien(i)}>{gom.includes(i) ? <Tich/> : '•'}</button>)}
        {chang === 0 && thongBao && <p className="ht-bong" aria-hidden="true">{thongBao}</p>}
      </div>
      <div className="ht-so"><strong>📒 Sổ dữ kiện</strong>
        {gom.length === 0 && <p>Chạm vào các chấm sáng trên tranh để ghi dữ kiện.</p>}
        <ul>{data.duKien.map((dk, i) => gom.includes(i) && <li key={dk} className={sang.includes(i) ? 'sang' : ''}>{dk}</li>)}</ul>
      </div>
    </div>
    <span className="ht-sr" role="status">{thongBao}</span>
    {tenChang.map((ten, i) => <section className={'ht-chang' + (i > chang ? ' khoa' : '')} key={ten} aria-label={ten}>
      <h3>{i < chang ? <Tich/> : <span className="ht-so-chang">{i}</span>}{ten}</h3>
      {i === 0 && <p>{chang === 0 ? 'Đã gom ' + gom.length + '/' + data.duKien.length + ' dữ kiện.' : 'Đã gom đủ dữ kiện.'}</p>}
      {cauTheoChang[i].map((cau, j) => {
        const da = daChon[i + '-' + j];
        return da && <div className="ht-da-chon" key={j}><MathText>{da.noiDung}</MathText><Tich/></div>;
      })}
      {i === chang && dangLam && <div className="ht-cau" tabIndex={-1} ref={noiDung}>
        {chang === 2 && <div className="ht-dung-du-kien"><b>Dữ kiện dùng</b>{sang.map(j => <span key={j}>{data.duKien[j]}</span>)}</div>}
        {chang === 4 && <div className="ht-doi-chieu"><b>Đối chiếu với điều kiện đã chọn</b><p>{data.dieuKien}.</p><p>{data.giai}</p></div>}
        <p><b>{chang === 2 && data.moHinh.length > 1 ? 'Hệ thức ' + (muc + 1) + '. ' : ''}{dangLam.hoi}</b></p>
        <div className="ht-pa">{thuTu.map((j, viTri) => <button type="button" key={j} aria-disabled={daSai.includes(j)} className={daSai.includes(j) ? 'sai' : ''} onClick={() => chon(j)}>
          {chang === 4 && <b>{String.fromCharCode(65 + viTri)}. </b>}<MathText>{dangLam.pa[j].noiDung}</MathText>
        </button>)}</div>
        {!!daSai.length && <div className="ht-goi-y" role="status">💡 {chang === 2 && <b>Công thức áp dụng. </b>}<MathText>{dangLam.goiY}</MathText> Chọn lại nhé.</div>}
        {!!daSai.length && <NhanVat loi={sai.length >= 3 ? "saiNhieu" : "sai"} chuong={data.id} compact />}
      </div>}
    </section>)}
    {chang === 5 && <div className="ht-tong-ket" tabIndex={-1} ref={dich}>
      <h3>🎉 Hoàn thành hành trình</h3>
      <p><MathText>{data.phuongAn[0]}</MathText></p>
      <ul>{tenChang.map((ten, i) => {
        const n = sai.filter(c => c === i).length;
        return <li key={ten}><span>{ten}</span><b>{'⭐'.repeat(Math.max(1, 3 - n))}{n ? ' · sai ' + n + ' lần' : ''}</b></li>;
      })}</ul>
      <div className="ht-loi"><b>Giáo viên sẽ thấy</b>
        {loi.length ? <ul>{Array.from(new Set(loi.map(l => tenChang[l.chang] + ' · ' + l.hoi))).map(l => <li key={l}>{l}</li>)}</ul> : <p>Không vướng chặng nào.</p>}
      </div>
    </div>}
  </section>;
}

