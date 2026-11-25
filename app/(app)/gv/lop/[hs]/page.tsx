/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/lop/[hs]
 * LẤY DỮ LIỆU TỪ: students, student_errors, error_dictionary
 * GỌI TỚI: @/components/gv/BoLoc, @/components/gv/HanhDong, @/lib/gv/hoSoLop, @/lib/lichBai, @/lib/kyNangNen
 */
import { batBuocGiaoVien } from '@/components/gv/BoLoc';
import { NutGiaoViec } from '@/components/gv/HanhDong';
import { napHoSoLop, batThuong, vaoDep, TEN_MUC_NAM } from '@/lib/gv/hoSoLop';
import { trangThaiBai, TEN_TRANG_THAI_BAI, ngayDep } from '@/lib/lichBai';
import { taiHoSoNen, DS_KY_NANG } from '@/lib/kyNangNen';
import '../../hom-nay.css';
import '../lop.css';

export const dynamic = 'force-dynamic';

const TEN_TRANG_THAI_LOI: Record<string, string> = { 'can-sua': 'Cần sửa', 'cho-on-1': 'Đang ôn', 'cho-on-2': 'Đang ôn', 'da-nho': 'Đã nhớ' };

/** GV · HỒ SƠ MỘT EM: 4 con số, các bài gần đây, lỗi đang cần sửa, kiến thức nền hổng, và nút nhắc / giao gói lấp nền. */
export default async function HoSoHS({ params, searchParams }: { params: { hs: string }; searchParams: { lop?: string } }) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const id = decodeURIComponent(params.hs);
  // Truy vấn Supabase: đọc dữ liệu từ bảng students
  const { data: hs } = await db.from('students').select('student_id, display_name, class_id').eq('student_id', id).maybeSingle();
  if (!hs) return <div className="hn"><h1>Không tìm thấy học sinh</h1><p><a href="/gv/lop">← Về danh sách lớp</a></p></div>;
  const lop = hs.class_id as string;
  const q = `lop=${encodeURIComponent(lop)}`;
  const ten = (hs.display_name ?? id) as string;

  const du = await napHoSoLop(db, lop, id);
  const d = du.dong[0];
  const [loiRes, nenRes] = await Promise.all([
    db.from('student_errors').select('error_code, trang_thai, so_lan_sai, lan_sai_cuoi').eq('student_id', id).order('lan_sai_cuoi', { ascending: false })
      .then((r: any) => r.data ?? [], () => []),
    taiHoSoNen(db, [id]).catch(() => new Map())
  ]);
  const maLoi = loiRes.map((l: any) => l.error_code);
  // Truy vấn Supabase: đọc dữ liệu từ bảng error_dictionary
  const { data: tuDien } = maLoi.length ? await db.from('error_dictionary').select('error_code, misconception').in('error_code', maLoi) : { data: [] as any[] };
  const moTa = new Map((tuDien ?? []).map((x: any) => [x.error_code, x.misconception]));
  const canSua = loiRes.filter((l: any) => l.trang_thai === 'can-sua');
  const demLoi = { dangOn: loiRes.filter((l: any) => String(l.trang_thai).startsWith('cho-on')).length, daNho: loiRes.filter((l: any) => l.trang_thai === 'da-nho').length };

  const nen = nenRes.get(id) ?? new Map();
  const hong = DS_KY_NANG.filter((k) => nen.get(k.ma)?.muc === 'hong');
  const chuaChac = DS_KY_NANG.filter((k) => nen.get(k.ma)?.muc === 'chua-chac');

  // Bài gần đây theo lịch: trạng thái chuẩn bị và điểm lượt đầu
  const kuTheoBai = new Map<string, string[]>();
  for (const u of du.units) kuTheoBai.set(u.lesson_id ?? u.ku_id, [...(kuTheoBai.get(u.lesson_id ?? u.ku_id) ?? []), u.ku_id]);
  const nop = new Map<string, string>(), diemDau = new Map<string, number>();
  for (const a of du.attempts) if (a.kind === 'chuan-bi' && !nop.has(a.ku_id)) { nop.set(a.ku_id, a.submitted_at); diemDau.set(a.ku_id, Number(a.score)); }
  const baiGan = du.lich.filter((l) => Date.parse(l.ngay_mo + 'T00:00:00+07:00') <= Date.now()).slice(-6).reverse().map((l) => {
    const muc = kuTheoBai.get(l.lesson_id) ?? [];
    const diem = muc.map((k) => diemDau.get(k)).filter((x): x is number => x != null);
    return { l, tt: trangThaiBai(l, muc, nop), diem: diem.length ? diem.reduce((s, x) => s + x, 0) / diem.length : null };
  });

  return (
    <div className="hn ho-so">
      <p style={{ margin: '0 0 6px' }}><a href={`/gv/lop?${q}`}>← Cả lớp</a></p>
      <header className="hn-dau">
        <h1>{ten}</h1>
        <div className="ho-so-nut">
          <NutGiaoViec lop={lop} loai="nhac-nho" hs={[{ id, ten }]} nhan="Nhắc em"
            loiNhan="Thầy/cô nhắc em hoàn thành phần chuẩn bị trước giờ học nhé!" />
          {hong.length > 0 && (
            <NutGiaoViec lop={lop} loai="goi-lap-nen" hs={[{ id, ten }]} mucTieu={hong.map((k) => k.ma)} chinh nhan="Giao gói lấp nền"
              loiNhan={`Em làm gói lấp nền "${hong[0].ten}" nhé: đọc thẻ Ôn nhanh 1 phút rồi làm một lượt luyện.`} />
          )}
        </div>
      </header>

      {d && (
        <div className="ho-so-so">
          <div className={batThuong.chuanBi(d) ? 'lop-de-y' : ''}><b>{d.chuanBi.tong ? `${d.chuanBi.kip}/${d.chuanBi.tong}` : '–'}</b><span>bài chuẩn bị đúng hạn</span></div>
          <div className={batThuong.namBai(d) ? 'lop-de-y' : ''}><b>{d.namBai.muc ? TEN_MUC_NAM[d.namBai.muc] : 'Chưa có'}</b><span>nắm bài chương đang học</span></div>
          <div className={batThuong.loi(d) ? 'lop-de-y' : ''}><b>{d.loiCanSua}</b><span>lỗi cần sửa · {demLoi.dangOn} đang ôn · {demLoi.daNho} đã nhớ</span></div>
          <div className={batThuong.vang(d) ? 'lop-de-y' : ''}><b>{vaoDep(d.soNgayVang)}</b><span>lần vào gần nhất</span></div>
        </div>
      )}

      <div className="ho-so-hang">
        {/* Khối giao diện: Khối nội dung chính */}
        <section className="hn-the">
          <h2>Bài gần đây</h2>
          {baiGan.length ? (
            <ul className="ho-so-ds">
              {baiGan.map(({ l, tt, diem }) => (
                <li key={l.lesson_id}>
                  <span>{l.lesson_id.replace(/\.\s.*$/, '')} <small>· học {ngayDep(l.ngay_hoc)}</small></span>
                  <span>{TEN_TRANG_THAI_BAI[tt].bieuTuong} {TEN_TRANG_THAI_BAI[tt].ten}{diem != null && <small> · {diem.toFixed(1).replace('.', ',')} điểm</small>}</span>
                </li>
              ))}
            </ul>
          ) : <p className="hn-trong">Lớp chưa có lịch giao bài.</p>}
        </section>

        {/* Khối giao diện: Khối nội dung chính */}
        <section className="hn-the">
          <h2>Lỗi cần sửa {canSua.length > 0 && <span className="hn-dem">{canSua.length}</span>}</h2>
          {canSua.length ? (
            <ul className="ho-so-ds">
              {canSua.slice(0, 5).map((l: any) => (
                <li key={l.error_code}><span>{moTa.get(l.error_code) ?? l.error_code}</span><small>sai {l.so_lan_sai} lần</small></li>
              ))}
            </ul>
          ) : <p className="hn-trong">Không còn lỗi nào cần sửa.</p>}
          {canSua.length > 5 && <p className="hn-trong">… và {canSua.length - 5} lỗi nữa.</p>}
          {canSua.length > 0 && <p className="lop-ghi" style={{ margin: 0 }}>Lỗi suy từ phương án em chọn; hỏi em cách làm trước khi kết luận.</p>}
        </section>

        {/* Khối giao diện: Khối nội dung chính */}
        <section className="hn-the">
          <h2>Kiến thức nền</h2>
          {hong.length || chuaChac.length ? (
            <ul className="ho-so-ds">
              {hong.map((k) => <li key={k.ma}><span>{k.ten} <small>· Toán {k.lop}</small></span><span>🔴 Hổng</span></li>)}
              {chuaChac.map((k) => <li key={k.ma}><span>{k.ten} <small>· Toán {k.lop}</small></span><span>🟡 Chưa chắc</span></li>)}
            </ul>
          ) : <p className="hn-trong">Chưa thấy kỹ năng nền nào hổng (tính từ trò chơi ôn nền em đã chơi).</p>}
        </section>

      </div>
    </div>
  );
}
