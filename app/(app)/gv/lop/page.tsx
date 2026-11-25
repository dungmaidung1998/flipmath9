/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/lop
 * LẤY DỮ LIỆU TỪ: mastery_states
 * GỌI TỚI: @/components/gv/BoLoc, @/lib/gv/hoSoLop, @/lib/chapters, @/lib/gv/lopCuaToi
 */
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import { napHoSoLop, batThuong, vaoDep, mucNam, TEN_MUC_NAM, type DongHS } from '@/lib/gv/hoSoLop';
import { CHAPTERS } from '@/lib/chapters';
import { chonLopTu, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';
import '../hom-nay.css';
import './lop.css';

export const dynamic = 'force-dynamic';

type DongVoiLop = DongHS & { classId: string; tenLop: string };

const XEP: Record<string, { nhan: string; so: (d: DongHS) => number }> = {
  ten: { nhan: 'Học sinh', so: () => 0 },
  'chuan-bi': { nhan: 'Chuẩn bị đúng hạn', so: (d) => (d.chuanBi.tong ? d.chuanBi.kip / d.chuanBi.tong : 1) },
  'nam-bai': { nhan: 'Nắm bài chương', so: (d) => d.namBai.tb ?? -1 },
  loi: { nhan: 'Lỗi cần sửa', so: (d) => -d.loiCanSua },
  vao: { nhan: 'Lần vào gần nhất', so: (d) => -(d.soNgayVang ?? 999) }
};

/** GV · HỌC SINH · Cả lớp: hỗ trợ xem 1 lớp hoặc Tất cả lớp, lọc thêm theo chương. */
export default async function CaLop({ searchParams }: { searchParams: { lop?: string; xep?: string; chuong?: string } }) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), true);
  if (!chon.classIds.length) return <div className="hn"><h1>Học sinh</h1><p>Thầy cô chưa được phân công lớp nào.</p></div>;

  const tenLopCua = new Map(lops.map((l) => [l.class_id, tenHienThiLop(l)]));
  let dsDu: { classId: string; du: Awaited<ReturnType<typeof napHoSoLop>> }[] = [];
  try {
    dsDu = await Promise.all(
      chon.classIds.map(async (cid) => ({ classId: cid, du: await napHoSoLop(db, cid) }))
    );
  } catch (e: any) {
    return <div className="hn"><h1>Học sinh</h1><p role="alert">Không tải được dữ liệu: {e.message}</p></div>;
  }

  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const chuongChon = searchParams.chuong && /^C(?:10|[1-9])$/.test(searchParams.chuong) ? searchParams.chuong : '';

  let dongGoc: DongVoiLop[] = dsDu.flatMap(({ classId, du }) =>
    du.dong.map((d) => ({ ...d, classId, tenLop: tenLopCua.get(classId) ?? classId }))
  );

  // Nếu chọn chương cụ thể thì tính lại cột "Nắm bài chương" đúng theo chương đó
  if (chuongChon && dongGoc.length) {
    const kuChuong = new Set(
      (dsDu[0]?.du.units ?? [])
        .filter((u: any) => String(u.ku_id).startsWith(`${chuongChon}-`))
        .map((u: any) => u.ku_id)
    );
    const sids = dongGoc.map((d) => d.id);
    const { data: msRows } = kuChuong.size
      ? await db.from('mastery_states').select('student_id, ku_id, mastery_level').in('student_id', sids).in('ku_id', Array.from(kuChuong))
      : { data: [] as any[] };
    const theoHs = new Map<string, number[]>();
    for (const r of msRows ?? []) {
      if (r.mastery_level == null) continue;
      theoHs.set(r.student_id, [...(theoHs.get(r.student_id) ?? []), Number(r.mastery_level)]);
    }
    dongGoc = dongGoc.map((d) => {
      const vals = theoHs.get(d.id) ?? [];
      const tb = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      return { ...d, namBai: { tb, muc: mucNam(tb) } };
    });
  }

  const xep = XEP[searchParams.xep ?? ''] ? searchParams.xep! : 'ten';
  const dong = xep === 'ten' ? dongGoc : [...dongGoc].sort((a, b) => XEP[xep].so(a) - XEP[xep].so(b) || a.ten.localeCompare(b.ten, 'vi'));
  const chuongMacDinh = dsDu[0]?.du.chuong;
  const tenChuong = chuongChon
    ? CHAPTERS.find((c) => c.id === chuongChon)?.label ?? chuongChon
    : chuongMacDinh
      ? CHAPTERS.find((c) => c.id === `C${chuongMacDinh}`)?.label ?? `Chương ${chuongMacDinh}`
      : null;
  const soDangDeY = dong.filter((d) => batThuong.chuanBi(d) || batThuong.namBai(d) || batThuong.loi(d) || batThuong.vang(d)).length;
  const coLich = dsDu.some((x) => x.du.lich.length > 0);
  const thamSoChung = new URLSearchParams({ lop: chon.dang, ...(chuongChon ? { chuong: chuongChon } : {}) });

  const tieuDe = (k: string) => (
    <th scope="col" aria-sort={xep === k ? 'ascending' : undefined}>
      <a href={`/gv/lop?${thamSoChung.toString()}&xep=${k}`}>{k === 'nam-bai' && tenChuong ? `Nắm bài ${tenChuong}` : XEP[k].nhan}{xep === k ? ' ▾' : ''}</a>
    </th>
  );

  return (
    <div className="hn lop">
      <header className="hn-dau">
        <div>
          <h1>Học sinh</h1>
          <p className="hn-phu">
            {chon.tatCa ? `Tất cả ${lops.length} lớp` : chon.lop ? nhanTruongLop(chon.lop) : ''} · {dong.length} em · {soDangDeY ? `${soDangDeY} em có ô tô màu cần để ý` : 'không em nào đáng lo'}
          </p>
        </div>
        {/* Khối giao diện: Biểu mẫu nhập liệu */}
        <form className="hn-lop" method="get">
          <input type="hidden" name="lop" value={chon.dang} />
          {xep !== 'ten' && <input type="hidden" name="xep" value={xep} />}
          <label htmlFor="chuong-chon">Chương</label>
          <select id="chuong-chon" name="chuong" defaultValue={chuongChon}>
            <option value="">Chương đang học</option>
            {CHAPTERS.filter((c) => c.id !== 'TN').map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <button type="submit">Lọc</button>
          <a
            className="action-link"
            href={`/ho-so/${encodeURIComponent(chuongChon || (chuongMacDinh ? `C${chuongMacDinh}` : 'C1'))}?lop=${encodeURIComponent(chon.lop?.class_id ?? lops[0].class_id)}`}
          >
            📄 Hồ sơ chương (PDF)
          </a>
        </form>
      </header>

      <div className="lop-bang">
        {/* Khối giao diện: Bảng số liệu tổng hợp */}
        <table>
          <thead><tr>{tieuDe('ten')}{chon.tatCa && <th scope="col">Lớp</th>}{tieuDe('chuan-bi')}{tieuDe('nam-bai')}{tieuDe('loi')}{tieuDe('vao')}</tr></thead>
          <tbody>
            {dong.map((d) => (
              <tr key={d.id}>
                <th scope="row"><a href={`/gv/lop/${encodeURIComponent(d.id)}?lop=${encodeURIComponent(d.classId)}`}>{d.ten}</a></th>
                {chon.tatCa && <td>{d.tenLop}</td>}
                <td className={batThuong.chuanBi(d) ? 'lop-de-y' : ''}>{d.chuanBi.tong ? `${d.chuanBi.kip}/${d.chuanBi.tong} bài` : '–'}</td>
                <td className={batThuong.namBai(d) ? 'lop-de-y' : ''}>{d.namBai.muc ? TEN_MUC_NAM[d.namBai.muc] : <span className="lop-nhat">Chưa có</span>}</td>
                <td className={batThuong.loi(d) ? 'lop-de-y' : ''}>{d.loiCanSua}</td>
                <td className={batThuong.vang(d) ? 'lop-de-y' : ''}>{vaoDep(d.soNgayVang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="lop-ghi">
        Ô tô màu: chuẩn bị kịp dưới một nửa số bài, chưa nắm bài chương, từ 15 lỗi cần sửa, hoặc 7 ngày không vào web.
        {!coLich && !chon.tatCa && <> Chưa có <a href={`/gv/lich-bai?lop=${encodeURIComponent(chon.dang)}`}>lịch giao bài</a> nên chưa tính được cột chuẩn bị đúng hạn.</>}
      </p>
    </div>
  );
}
