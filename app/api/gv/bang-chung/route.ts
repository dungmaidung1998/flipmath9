/**
 * FILE NÀY LÀM GÌ: API máy chủ phục vụ giáo viên xử lý dữ liệu lớp học, thống kê hoặc thao tác quản lý trên Supabase.
 * AI DÙNG: máy chủ (API)
 * ĐỊA CHỈ TRÊN WEB: /api/gv/bang-chung
 * LẤY DỮ LIỆU TỪ: profiles, students, assessments
 * GỌI TỚI: @/lib/supabase/server, @/lib/gv/lopCuaToi, @/lib/chapters, @/lib/khkt/thongKeThucNghiem
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { laVaiTroGV, lopCuaToi, tenHienThiLop } from '@/lib/gv/lopCuaToi';
import { CHAPTERS } from '@/lib/chapters';
import {
  taoDoanVanBaoCao,
  tTestDocLap,
  tTestGhepCap,
  tuPhanVi,
  type TuPhanVi,
} from '@/lib/khkt/thongKeThucNghiem';

export const dynamic = 'force-dynamic';

const esc = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (headers: string[], rows: any[][]) =>
  '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n') + '\n';

/**
 * Hàm `docHet(tao)`: nạp/truy xuất dữ liệu từ CSDL hoặc bộ nhớ.
 */
async function docHet<T = any>(tao: (tu: number, den: number) => any): Promise<T[]> {
  const out: T[] = [];
  for (let tu = 0; ; tu += 1000) {
    const { data, error } = await tao(tu, tu + 999);
    if (error || !data?.length) break;
    out.push(...(data as T[]));
    if (data.length < 1000) break;
  }
  return out;
}

/**
 * Xử lý HTTP GET: kiểm tra đăng nhập/quyền hạn, đọc dữ liệu và trả về JSON cho trình duyệt.
 */
export async function GET(req: Request) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (!laVaiTroGV(p?.role)) return NextResponse.json({ error: 'Chỉ giáo viên' }, { status: 403 });

  const lops = await lopCuaToi(db);
  const url = new URL(req.url);
  const lopParam = url.searchParams.get('lops') ?? '';
  const chonSet = new Set(lopParam.split(',').map((s) => s.trim()).filter(Boolean));
  const lopsChon = chonSet.size ? lops.filter((l) => chonSet.has(l.class_id)) : lops;

  const chuongParam = url.searchParams.get('chuong') ?? '';
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const chuong = /^C(?:10|[1-9])$/.test(chuongParam) ? chuongParam : '';
  const chiDongY = url.searchParams.get('dongY') !== '0';

  if (!lopsChon.length) {
    return NextResponse.json({ error: 'Không có lớp nào được chọn' }, { status: 400 });
  }

  const lopMap = new Map(lopsChon.map((l) => [l.class_id, l]));
  const classIds = lopsChon.map((l) => l.class_id);
  const admin = supabaseAdmin();

  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const hsRows = await docHet<{ student_id: string; class_id: string; consent_status: string }>((tu, den) => {
    // Truy vấn Supabase: đọc dữ liệu từ bảng students
    let q = admin.from('students').select('student_id, class_id, consent_status').in('class_id', classIds);
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    if (chiDongY) q = q.eq('consent_status', 'dong-y');
    return q.order('student_id').range(tu, den);
  });

  const hsIds = hsRows.map((h) => h.student_id);
  const assRows: {
    student_id: string;
    chapter_id: string;
    kind: string;
    submitted_at: string;
    result: any;
  }[] = [];

  for (let i = 0; i < hsIds.length; i += 200) {
    const chunk = hsIds.slice(i, i + 200);
    const part = await docHet<any>((tu, den) => {
      let q = admin
        .from('assessments')
        .select('student_id, chapter_id, kind, submitted_at, result')
        .in('student_id', chunk)
        .not('submitted_at', 'is', null);
      if (chuong) q = q.eq('chapter_id', chuong);
      return q.order('submitted_at', { ascending: true }).range(tu, den);
    });
    assRows.push(...part);
  }

  // Gom điểm theo (student_id, chapter_id): đầu vào (sớm nhất) vs kiểm tra chương (mới nhất)
  type CapDiem = { dauVao?: number; chuong?: number };
  const theoHS = new Map<string, Map<string, CapDiem>>();

  for (const a of assRows) {
    const diem = Number(a.result?.score);
    if (!Number.isFinite(diem)) continue;
    let m = theoHS.get(a.student_id);
    if (!m) {
      m = new Map();
      theoHS.set(a.student_id, m);
    }
    const cur = m.get(a.chapter_id) ?? {};
    if (a.kind === 'dau-vao' && cur.dauVao === undefined) cur.dauVao = diem;
    if (a.kind === 'chuong') cur.chuong = diem;
    m.set(a.chapter_id, cur);
  }

  type DongHS = {
    student_id: string;
    class_id: string;
    ten_lop: string;
    arm: 'TN' | 'DC';
    dau_vao: number | null;
    kiem_tra_chuong: number | null;
    chenh_lech: number | null;
  };

  const dongHS: DongHS[] = hsRows.map((h) => {
    const lop = lopMap.get(h.class_id);
    const arm = (lop?.arm === 'DC' ? 'DC' : 'TN') as 'TN' | 'DC';
    const mp = theoHS.get(h.student_id);
    const dvList: number[] = [];
    const scList: number[] = [];
    if (mp) {
      for (const v of mp.values()) {
        if (v.dauVao !== undefined) dvList.push(v.dauVao);
        if (v.chuong !== undefined) scList.push(v.chuong);
      }
    }
    const dauVao = dvList.length ? dvList.reduce((s, x) => s + x, 0) / dvList.length : null;
    const sauChuong = scList.length ? scList.reduce((s, x) => s + x, 0) / scList.length : null;
    return {
      student_id: h.student_id,
      class_id: h.class_id,
      ten_lop: lop ? tenHienThiLop(lop) : h.class_id,
      arm,
      dau_vao: dauVao == null ? null : Math.round(dauVao * 100) / 100,
      kiem_tra_chuong: sauChuong == null ? null : Math.round(sauChuong * 100) / 100,
      chenh_lech:
        dauVao != null && sauChuong != null ? Math.round((sauChuong - dauVao) * 100) / 100 : null,
    };
  });

  const nhomTN = dongHS.filter((d) => d.arm === 'TN');
  const nhomDC = dongHS.filter((d) => d.arm === 'DC');

  const dvTN = nhomTN.map((d) => d.dau_vao).filter((x): x is number => x != null);
  const dvDC = nhomDC.map((d) => d.dau_vao).filter((x): x is number => x != null);
  const sauTN = nhomTN.map((d) => d.kiem_tra_chuong).filter((x): x is number => x != null);
  const sauDC = nhomDC.map((d) => d.kiem_tra_chuong).filter((x): x is number => x != null);
  const tangTN = nhomTN.map((d) => d.chenh_lech).filter((x): x is number => x != null);
  const tangDC = nhomDC.map((d) => d.chenh_lech).filter((x): x is number => x != null);

  const pairTN = nhomTN.filter((d) => d.dau_vao != null && d.kiem_tra_chuong != null);
  const pairDC = nhomDC.filter((d) => d.dau_vao != null && d.kiem_tra_chuong != null);

  const dauVao = tTestDocLap(dvTN, dvDC);
  const sauTNvsDC = tTestDocLap(sauTN, sauDC);
  const mucTang = tTestDocLap(tangTN, tangDC);
  const truocSauTN = tTestGhepCap(
    pairTN.map((d) => d.dau_vao!),
    pairTN.map((d) => d.kiem_tra_chuong!)
  );
  const truocSauDC = tTestGhepCap(
    pairDC.map((d) => d.dau_vao!),
    pairDC.map((d) => d.kiem_tra_chuong!)
  );

  const boxPlot: { nhan: string; mau: string; stats: TuPhanVi | null }[] = [
    { nhan: 'TN · Đầu vào', mau: '#60a5fa', stats: tuPhanVi(dvTN) },
    { nhan: 'TN · Kiểm tra chương', mau: '#2563eb', stats: tuPhanVi(sauTN) },
    { nhan: 'ĐC · Đầu vào', mau: '#cbd5e1', stats: tuPhanVi(dvDC) },
    { nhan: 'ĐC · Kiểm tra chương', mau: '#64748b', stats: tuPhanVi(sauDC) },
  ];

  const chuongNhan = chuong
    ? CHAPTERS.find((c) => c.id === chuong)?.label ?? chuong
    : 'các chương đã đo';

  const doanVan = taoDoanVanBaoCao({
    chuongNhan,
    dauVao,
    sauTNvsDC,
    truocSauTN,
    truocSauDC,
  });

  if (url.searchParams.get('format') === 'csv') {
    const f = (v: number | null) => (v == null ? '' : v.toFixed(3));
    const headers = [
      'Nhom_chi_tiet',
      'Ma_hoc_sinh_an_danh',
      'Lop',
      'Nhom',
      'Diem_dau_vao',
      'Diem_kiem_tra_chuong',
      'Chenh_lech_sau_truoc',
    ];
    const rows: any[][] = [
      ['TOM_TAT_TN_VS_DC_SAU', `nTN=${sauTNvsDC.n1};nDC=${sauTNvsDC.n2}`, '', 'TN-DC', f(sauTNvsDC.mean1), f(sauTNvsDC.mean2), f(sauTNvsDC.chenhLech)],
      ['COHEN_D_VA_T_TEST', `d=${f(sauTNvsDC.cohenD)};t=${f(sauTNvsDC.t)};df=${sauTNvsDC.df ?? ''};p=${f(sauTNvsDC.p)}`, '', '', '', '', ''],
      ...dongHS.map((d) => ['HOC_SINH', d.student_id, d.ten_lop, d.arm, d.dau_vao ?? '', d.kiem_tra_chuong ?? '', d.chenh_lech ?? '']),
    ];
    const name = `bang-chung-thuc-nghiem-${chuong || 'tat-ca'}.csv`;
    return new NextResponse(toCsv(headers, rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${name}"`,
      },
    });
  }

  return NextResponse.json({
    siSoTN: nhomTN.length,
    siSoDC: nhomDC.length,
    dauVao,
    sauTNvsDC,
    mucTang,
    truocSauTN,
    truocSauDC,
    boxPlot,
    doanVan,
    coMauNho: sauTNvsDC.n1 < 30 || sauTNvsDC.n2 < 30 || (truocSauTN.n > 0 && truocSauTN.n < 30),
  });
}
