/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /so-loi
 * LẤY DỮ LIỆU TỪ: profiles, student_errors, error_dictionary
 * GỌI TỚI: @/lib/supabase/server, @/components/DauTrang, @/components/MathText, @/components/soat-loi/SoatLoi, @/lib/minhHoa, @/components/AnhChuDe, @/components/LinhVatDaNang, @/lib/hinhViBaiHoc
 */
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DauTrang from '@/components/DauTrang';
import MathText from '@/components/MathText';
import SoatLoi from '@/components/soat-loi/SoatLoi';
import { hinhNhanVat } from '@/lib/minhHoa';
import AnhChuDe from '@/components/AnhChuDe';
import LinhVatDaNang from '@/components/LinhVatDaNang';
import { anhLoiBinNa } from '@/lib/hinhViBaiHoc';
import { TEN_TRANG_THAI, ngayVN, type TrangThai } from '@/lib/soatLoi';
import { demLoiDenHan } from '@/lib/soatLoiMayChu';
import { moTaLoi } from '@/lib/moTaLoi';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
import '@/components/soat-loi/soat-loi.css';
import './so-loi.css';

export const dynamic = 'force-dynamic';

const ngayNgan = (d: string | null) => (d ? d.split('-').reverse().slice(0, 2).join('/') : '');
const THU_TU: TrangThai[] = ['can-sua', 'cho-on-1', 'cho-on-2', 'da-nho'];

/** SỔ LỖI 🪤 của học sinh: bản tối giản dễ đọc trên điện thoại. */
export default async function SoLoi() {
  const db = supabaseServer();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('student_id, role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (laVaiTroGV(p?.role)) redirect('/gv/soat-loi');
  const sid = p?.student_id ?? '';

  let ds: any[] = [],
    moTa = new Map<string, string>(),
    denHan = 0,
    daSoat = false,
    loi = '';
  try {
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from('student_errors')
      .select('error_code, trang_thai, han_on, so_lan_sai, tai_phat, lan_sai_cuoi')
      .eq('student_id', sid)
      .order('lan_sai_cuoi', { ascending: false });
    if (error) throw error;
    ds = data ?? [];
    const { data: td } = await admin
      .from('error_dictionary')
      .select('error_code, misconception')
      .in('error_code', ds.length ? ds.map((d) => d.error_code) : ['__none__']);
    moTa = new Map((td ?? []).map((t) => [t.error_code, t.misconception]));
    const d = await demLoiDenHan(admin, sid);
    denHan = d.denHan;
    daSoat = d.daSoatHomNay;
  } catch {
    loi = 'Chưa đọc được sổ lỗi. Em tải lại trang.';
  }

  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const homNay = ngayVN();
  const dem = (t: TrangThai) => ds.filter((d) => d.trang_thai === t).length;

  return (
    <div className="wrap">
      <DauTrang
        tieuDe="Sổ lỗi của em"
        phu="Tổng hợp các lỗi cần chú ý và lịch ôn tập."
        hinh={hinhNhanVat('kinh-lup')}
      />
      <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '0 0 12px' }}>
        <a className="action-link" href="/kttx">📄 Chụp bài KTTX đã chấm để thầy cô duyệt ghi vào Sổ lỗi</a>
      </p>
      {loi && (
        <p role="alert" className="banner">
          {loi}
        </p>
      )}

      {/* Đầu trang gọn: 4 ô trạng thái + nút Soát lỗi hôm nay */}
      <section className="sl-dau-trang" aria-label="Tổng quan sổ lỗi">
        <div className="sl-dem">
          {THU_TU.map((t) => (
            <div
              key={t}
              className="sl-dem__o"
              style={{ color: TEN_TRANG_THAI[t].mau, background: TEN_TRANG_THAI[t].nen }}
            >
              <b>{dem(t)}</b>
              <span>
                {TEN_TRANG_THAI[t].bieuTuong} {t === 'da-nho' ? 'Đã nhớ' : TEN_TRANG_THAI[t].ten}
              </span>
            </div>
          ))}
        </div>
        <div className="sl-hanh-dong">
          {denHan > 0 ? (
            <a className="sl-nut-soat" href="#soat-loi-hom-nay">
              🪤 Soát lỗi hôm nay ({denHan})
            </a>
          ) : (
            <span className={'sl-trang-thai-ngay' + (daSoat ? ' sl-trang-thai-ngay--xong' : '')}>
              {daSoat
                ? '🎉 Hôm nay em đã soát lỗi xong'
                : ds.length
                  ? '😌 Hôm nay chưa có lỗi đến hạn ôn'
                  : '📒 Sổ lỗi đang trống'}
            </span>
          )}
        </div>
      </section>

      {denHan > 0 && (
        <div id="soat-loi-hom-nay" className="sl-khu-soat">
          <SoatLoi />
        </div>
      )}

      {ds.length === 0 && (
        <section className="sl-khoi sl-trong-lv" aria-label="Sổ lỗi đang trống">
          <LinhVatDaNang
            loai="vooc"
            tuThe="ngu"
            kichThuoc={92}
            chuThich="Chưa có lỗi nào trong sổ lỗi — Voọc chà vá Sơn Trà đang ngủ ngon!"
          />
        </section>
      )}

      {ds.length > 0 && (
        <section className="sl-khoi" aria-label="Danh sách lỗi của em">
          <ul className="sl-ds">
            {THU_TU.flatMap((t) => ds.filter((d) => d.trang_thai === t)).map((d) => {
              const tt = TEN_TRANG_THAI[d.trang_thai as TrangThai];
              const m = moTaLoi(d.error_code, moTa.get(d.error_code));
              const coTheSoatNgay =
                denHan > 0 && (d.trang_thai === 'can-sua' || (d.han_on && d.han_on <= homNay));
              const hrefLuyen = coTheSoatNgay
                ? '#soat-loi-hom-nay'
                : m.ku
                  ? `/hoc/${encodeURIComponent(m.ku)}/van-dung`
                  : '/bai-hoc';

              const anhLoi = anhLoiBinNa(d.error_code, m.ku);

              return (
                <li key={d.error_code} className="sl-loi-the" style={{ ['--tt' as string]: tt.mau }}>
                  <div className="sl-the-dau">
                    <AnhChuDe
                      className="sl-loi-anh"
                      src={anhLoi.boiRoi}
                      fallback={anhLoi.fallback}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                    />
                    <p className="sl-ten">
                      <span aria-hidden="true">✗ </span>
                      <MathText inline>{m.tenNgan}</MathText>
                    </p>
                  </div>

                  {m.saiMotDong && (
                    <div className="sl-dong sl-dong--sai">
                      <span className="sl-dong__nhan">Sai:</span>
                      <span className="sl-dong__nd">
                        <MathText inline>{m.saiMotDong}</MathText>
                      </span>
                    </div>
                  )}

                  {m.dungMotDong && (
                    <div className="sl-dong sl-dong--dung">
                      <span className="sl-dong__nhan">Đúng:</span>
                      <span className="sl-dong__nd">
                        <MathText inline>{m.dungMotDong}</MathText>
                      </span>
                    </div>
                  )}

                  {m.meoNho && (
                    <p className="sl-meo-dong">
                      💡 <MathText inline>{m.meoNho}</MathText>
                    </p>
                  )}

                  <div className="sl-chan">
                    <span>
                      🔁 Đã mắc <b>{d.so_lan_sai}</b> lần ·{' '}
                      {d.trang_thai === 'can-sua'
                        ? '🎯 Cần sửa'
                        : d.han_on
                          ? d.han_on <= homNay
                            ? '⏳ Ôn hôm nay'
                            : `⏳ Ôn lại ngày ${ngayNgan(d.han_on)}`
                          : '✅ Đã nhớ'}
                    </span>
                    <a className="sl-luyen-btn" href={hrefLuyen}>
                      Luyện lỗi này
                    </a>
                  </div>

                  {m.coGiaiThich && (
                    <details className="sl-giai-thich">
                      <summary>Xem giải thích</summary>
                      <div className="sl-giai-thich__noi">
                        {m.tieuDe !== m.tenNgan && (
                          <p>
                            <b>Mô tả đầy đủ:</b> <MathText>{m.tieuDe}</MathText>
                          </p>
                        )}
                        {m.chiTiet.length > 0 && (
                          <div>
                            <b>Lỗi thường gặp:</b>
                            <ul>
                              {m.chiTiet.map((x) => (
                                <li key={x}>
                                  <MathText>{x}</MathText>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {m.cachDung.length > 0 && (
                          <div>
                            <b>Cách làm đúng:</b>
                            <ul>
                              {m.cachDung.map((x) => (
                                <li key={x}>
                                  <MathText>{x}</MathText>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {m.viDuSai.length > 1 && (
                          <div>
                            <b>Ví dụ sai khác:</b>
                            <ul>
                              {m.viDuSai.slice(1).map((x) => (
                                <li key={x}>
                                  <MathText>{x}</MathText>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {m.viDuDung && (
                          <p>
                            <b>Ví dụ đúng:</b> <MathText>{m.viDuDung}</MathText>
                          </p>
                        )}
                      </div>
                    </details>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <details className="sl-khoi sl-cach">
        <summary>
          <img src={hinhNhanVat('goi-y')} alt="" width={40} height={40} />
          <b>Sổ lỗi hoạt động thế nào?</b>
        </summary>
        <ol className="sl-buoc">
          <li style={{ ['--b' as string]: '#d9342b' }}>
            <i>1</i>
            <div>
              <b>🪤 Chọn sai</b>
              <span>Máy ghi lại em mắc bẫy nào.</span>
            </div>
          </li>
          <li style={{ ['--b' as string]: '#e08a00' }}>
            <i>2</i>
            <div>
              <b>🔍 Soát lỗi cũ</b>
              <span>Đầu bài sau, em làm vài câu mới về đúng bẫy đó.</span>
            </div>
          </li>
          <li style={{ ['--b' as string]: '#c08a00' }}>
            <i>3</i>
            <div>
              <b>⏳ Ôn lần 1</b>
              <span>
                Đúng hết → hẹn ôn lại sau <b>3 ngày</b>.
              </span>
            </div>
          </li>
          <li style={{ ['--b' as string]: '#17579c' }}>
            <i>4</i>
            <div>
              <b>⏳ Ôn lần 2</b>
              <span>
                Lại đúng → hẹn ôn sau <b>7 ngày</b>.
              </span>
            </div>
          </li>
          <li style={{ ['--b' as string]: '#1e7a4b' }}>
            <i>5</i>
            <div>
              <b>✅ Đã nhớ</b>
              <span>Qua cả hai lần ôn là em nhớ thật sự.</span>
            </div>
          </li>
        </ol>
        <p className="sl-meo">
          💡 Ôn sai cũng không sao: máy hẹn em ôn lại <b>ngày hôm sau</b>.
        </p>
      </details>
    </div>
  );
}
