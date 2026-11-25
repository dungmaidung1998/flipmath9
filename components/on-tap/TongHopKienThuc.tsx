/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/components/MathText, @/lib/dfle/t9-noi-dung.js, @/lib/dfle/t9-on-tap.js, @/lib/dfle/t9-tom-tat.js, @/components/tom-tat/AnhTrangTomTatBai, @/lib/dfle/t9-phieu-hoc-tap.js, @/lib/dfle/latex-hoa.js
 */
import MathText from '@/components/MathText';
import { CHUONG_T9 } from '@/lib/dfle/t9-noi-dung.js';
import { ON_TAP_THEO_MUC, mucTrongPhamVi } from '@/lib/dfle/t9-on-tap.js';
import { tomTatCuaMuc, anhTomTatCuaMuc, BAI_CO_ANH_TRANG_DAY_DU } from '@/lib/dfle/t9-tom-tat.js';
import AnhTrangTomTatBai from '@/components/tom-tat/AnhTrangTomTatBai';
import { phieuHocTap } from '@/lib/dfle/t9-phieu-hoc-tap.js';
import { latexHoa } from '@/lib/dfle/latex-hoa.js';
import '@/components/tom-tat/tom-tat.css';
import './on-tap.css';

type Unit = { id: string; bai: string; name: string; muc?: string };
type Ghi = { quyTac: string; viDu: string; deSai: string };
type TomTat = { bai: number; ghi: Ghi };
type Phieu = { ghiNho?: { quyTac: string }[]; viDu?: { de: string; giai: string }[]; loiHayGap?: string[] } | null;

/** Lấy 3 dòng ghi nhớ của mục: ưu tiên bảng tóm tắt, thiếu thì rút từ phiếu học tập. */
function ghiCuaMuc(id: string): Ghi | null {
  const t = tomTatCuaMuc(id) as TomTat | null;
  if (t) return t.ghi;
  const p = phieuHocTap(id) as Phieu;
  if (!p?.ghiNho?.length) return null;
  const vd = p.viDu?.[0];
  return {
    quyTac: latexHoa(p.ghiNho.map((g) => g.quyTac).join(' ')),
    viDu: vd ? latexHoa(`${vd.de} → ${vd.giai}`) : '',
    deSai: p.loiHayGap?.[0] ? latexHoa(p.loiHayGap[0]) : ''
  };
}

/**
 * Bước thay cho "Xem video" ở bài Luyện tập chung / Ôn tập cuối chương:
 * gom quy tắc – ví dụ – chỗ dễ sai của mọi mục trong phạm vi, nhóm theo bài như SGK.
 */
export default function TongHopKienThuc({ kuId }: { kuId: string }) {
  const info = ON_TAP_THEO_MUC[kuId] as { loai: 'ltc' | 'otc'; name: string } | undefined;
  const ma = kuId.split('-')[0];
  const chuong = CHUONG_T9.find((c: unknown[]) => c[0] === ma)?.[1] as { UNITS: Unit[] } | undefined;
  if (!info || !chuong) return null;

  const ids = mucTrongPhamVi(kuId, chuong.UNITS.map((u) => u.id)) as string[];
  const theoBai = new Map<string, Unit[]>();
  for (const id of ids) {
    const u = chuong.UNITS.find((x) => x.id === id)!;
    if (!theoBai.has(u.bai)) theoBai.set(u.bai, []);
    theoBai.get(u.bai)!.push(u);
  }

  return (
    <section className="th" aria-labelledby={`th-${kuId}`}>
      <div className="th-dau">
        <h2 id={`th-${kuId}`}>📚 Tổng hợp kiến thức {info.loai === 'otc' ? 'cả chương' : 'cần dùng'}</h2>
        <p>Đọc lại từng bài, che phần <b>Ví dụ</b> rồi tự làm lại trước khi mở xem. Chỗ <b>Dễ sai</b> là bẫy hay gặp trong bài luyện tập phía sau.</p>
      </div>

      {[...theoBai.entries()].map(([bai, mucs]) => {
        // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
        const soBai = Number(/^Bài\s+(\d+)/.exec(bai)?.[1] ?? 0);
        return (
          <article key={bai} className="th-bai">
            <h3>{bai}</h3>
            <ul className="th-muc">
              {mucs.map((u) => {
                const g = ghiCuaMuc(u.id);
                const anh = anhTomTatCuaMuc(u.id) as string | null;
                return (
                  <li key={u.id}>
                    <p className="th-ten">{u.name}</p>
                    {g ? (
                      <dl>
                        <dt>Quy tắc</dt><dd className="tt-khung"><MathText>{g.quyTac}</MathText></dd>
                        {g.viDu && <><dt>Ví dụ</dt><dd><details><summary>Mở ví dụ</summary><MathText>{g.viDu}</MathText></details></dd></>}
                        {g.deSai && <><dt>Dễ sai</dt><dd className="th-sai"><MathText>{g.deSai}</MathText></dd></>}
                      </dl>
                    ) : <p className="hint">Xem lại vở ghi của mục này.</p>}
                    {anh && <details className="tt-them"><summary>🖼 Sơ đồ ghi nhớ của mục</summary>
                      <a href={anh} target="_blank" rel="noreferrer"><img src={anh} alt={`Sơ đồ ghi nhớ: ${u.name}`} loading="lazy" decoding="async" className="th-anh" /></a>
                    </details>}
                  </li>
                );
              })}
            </ul>
            {BAI_CO_ANH_TRANG_DAY_DU.has(soBai) && (
              <details className="tt-them">
                <summary>🗺 Xem trang tóm tắt cả {bai.split(':')[0]}</summary>
                <AnhTrangTomTatBai bai={soBai} tenBai={bai} />
              </details>
            )}
          </article>
        );
      })}
      <p className="tt-nguon">Xem xong thì bấm sang bước tiếp theo để làm bài luyện tập.</p>
    </section>
  );
}
