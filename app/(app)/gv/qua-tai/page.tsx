/**
 * FILE NÀY LÀM GÌ: Trang giao diện dành cho giáo viên trong khu vực đã đăng nhập, tổng hợp số liệu lớp và hỗ trợ điều chỉnh dạy học.
 * AI DÙNG: giáo viên
 * ĐỊA CHỈ TRÊN WEB: /gv/qua-tai
 * LẤY DỮ LIỆU TỪ: students, gioi_han_lop, gioi_han_hoc, ma_phu_huynh, learning_events
 * GỌI TỚI: @/components/gv/BoLoc, @/components/AnhChuDe, @/components/gv/QuaTaiGV, @/lib/gv/lopCuaToi, @/lib/quaTai, @/lib/supabase/server
 */
import { batBuocGiaoVien, docCookieLop } from '@/components/gv/BoLoc';
import AnhChuDe from '@/components/AnhChuDe';
import QuaTaiGV, { type HocSinhQuaTaiRow } from '@/components/gv/QuaTaiGV';
import { chonLopTu, lopCuaToi, nhanTruongLop, tenHienThiLop } from '@/lib/gv/lopCuaToi';
import { CAU_HINH_QUA_TAI_MAC_DINH, type CauHinhQuaTai, type LoaiDauHieuQuaTai } from '@/lib/quaTai';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Component React `GvQuaTaiPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function GvQuaTaiPage({
  searchParams,
}: {
  searchParams: { lop?: string };
}) {
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { db } = await batBuocGiaoVien();
  const lops = await lopCuaToi(db);
  const chon = chonLopTu(lops, searchParams.lop, docCookieLop(), false);
  const lop = chon.lop;

  if (!lop) {
    return (
      <div className="mc">
        <h1>Học không quá tải &amp; Mã phụ huynh</h1>
        <p className="mc-trong">Thầy cô chưa được phân công lớp nào.</p>
      </div>
    );
  }

  const admin = supabaseAdmin();
  let chuaCoBang = false;
  let cauHinhLop: CauHinhQuaTai = { ...CAU_HINH_QUA_TAI_MAC_DINH };
  let students: { student_id: string; display_name: string | null }[] = [];
  let gioiHanHsRows: any[] = [];
  let maPhRows: any[] = [];
  let quaTaiEvents: any[] = [];

  try {
    const { data: sts } = await admin
      .from('students')
      .select('student_id, display_name')
      .eq('class_id', lop.class_id)
      .order('student_id');
    students = (sts ?? []) as any[];
    const hsIds = students.map((s) => s.student_id);
    // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
    const bayNgayIso = new Date(Date.now() - 7 * 86400_000).toISOString();

    const [resLop, resGh, resMa, resEv] = await Promise.all([
      admin.from('gioi_han_lop').select('*').eq('class_id', lop.class_id).maybeSingle(),
      hsIds.length
        ? admin.from('gioi_han_hoc').select('*').in('student_id', hsIds)
        : Promise.resolve({ data: [], error: null }),
      hsIds.length
        ? admin.from('ma_phu_huynh').select('student_id').in('student_id', hsIds).eq('thu_hoi', false)
        : Promise.resolve({ data: [], error: null }),
      hsIds.length
        ? admin
            .from('learning_events')
            .select('student_id, payload, ts')
            .in('student_id', hsIds)
            .eq('event_type', 'qua_tai')
            .gte('ts', bayNgayIso)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (resLop.error || resGh.error || resMa.error) chuaCoBang = true;
    if (resLop.data) {
      const r = resLop.data as any;
      cauHinhLop = {
        phut_ngay: Number(r.phut_ngay ?? 90),
        gio_khuya: String(r.gio_khuya ?? '22:30'),
        gio_sang: String(r.gio_sang ?? '05:30'),
        phut_lien_tuc: Number(r.phut_lien_tuc ?? 50),
        sai_lien_tiep: Number(r.sai_lien_tiep ?? 5),
        don_dap_so_cau: Number(r.don_dap_so_cau ?? 12),
        don_dap_ti_le: Number(r.don_dap_ti_le ?? 0.5),
        bat_khuya: r.bat_khuya !== false,
        bat_lien_tuc: r.bat_lien_tuc !== false,
        bat_sai_lien_tiep: r.bat_sai_lien_tiep !== false,
        bat_don_dap: r.bat_don_dap !== false,
        bat_vuot_ngay: r.bat_vuot_ngay !== false,
      };
    }
    gioiHanHsRows = (resGh.data ?? []) as any[];
    maPhRows = (resMa.data ?? []) as any[];
    quaTaiEvents = (resEv.data ?? []) as any[];
  } catch {
    chuaCoBang = true;
  }

  const ghMap = new Map(gioiHanHsRows.map((r) => [r.student_id, r]));
  const maSet = new Set(maPhRows.map((r) => r.student_id));
  const demMap = new Map<string, Record<LoaiDauHieuQuaTai, number> & { tong: number }>();

  for (const ev of quaTaiEvents) {
    const sid = String(ev.student_id ?? '');
    if (!sid) continue;
    if (!demMap.has(sid)) {
      demMap.set(sid, {
        khuya: 0,
        'lien-tuc': 0,
        'sai-lien-tiep': 0,
        'don-dap': 0,
        'vuot-ngay': 0,
        tong: 0,
      });
    }
    const row = demMap.get(sid)!;
    const loai = String(ev.payload?.loai ?? '') as LoaiDauHieuQuaTai;
    if (loai in row && loai !== ('tong' as any)) {
      row[loai] += 1;
    }
    row.tong += 1;
  }

  const hocSinhBanDau: HocSinhQuaTaiRow[] = students.map((s) => {
    const gh = ghMap.get(s.student_id);
    return {
      student_id: s.student_id,
      tenHS: s.display_name || s.student_id,
      dem7Ngay: demMap.get(s.student_id) ?? {
        khuya: 0,
        'lien-tuc': 0,
        'sai-lien-tiep': 0,
        'don-dap': 0,
        'vuot-ngay': 0,
        tong: 0,
      },
      gioiHan: {
        phut_ngay: Number(gh?.phut_ngay ?? cauHinhLop.phut_ngay),
        gio_khuya: String(gh?.gio_khuya ?? cauHinhLop.gio_khuya),
        gio_sang: String(gh?.gio_sang ?? cauHinhLop.gio_sang),
        dat_boi: (gh?.dat_boi as 'gv' | 'phu-huynh' | undefined) ?? null,
      },
      coMaPhuHuynh: maSet.has(s.student_id),
    };
  });

  return (
    <div className="mc">
      <div className="mc-dau">
        <h1>Học không quá tải &amp; Mã phụ huynh — Lớp {tenHienThiLop(lop)}</h1>
        {lops.length > 1 && (
          <form className="mc-loc" action="/gv/qua-tai">
            <label>
              Lớp
              <select name="lop" defaultValue={lop.class_id}>
                {lops.map((l) => (
                  <option key={l.class_id} value={l.class_id}>
                    {nhanTruongLop(l)}
                  </option>
                ))}
              </select>
            </label>
            <button className="nho">Xem</button>
          </form>
        )}
      </div>

      <p className="mc-cauhoi">
        Điều chỉnh giới hạn thời gian ôn tập chống kiệt sức và cấp mã 6 chữ số cho phụ huynh xem tiến độ tại <code>/phu-huynh</code>.
        {' '}
        <a href={`/gv/cai-dat-lop?lop=${encodeURIComponent(lop.class_id)}`}>← Về Cài đặt lớp</a>
      </p>

      <div style={{ marginBottom: 14 }}>
        <AnhChuDe
          src="/tinh-nang/qua-tai/du-gio-hom-nay.webp"
          fallback="/minh-hoa/nv/nghi-mat.webp"
          alt="Học không quá tải"
          width={960}
          height={240}
          style={{
            width: '100%',
            maxHeight: 150,
            objectFit: 'cover',
            borderRadius: 12,
            border: '1px solid var(--mc-vach)',
          }}
        />
      </div>

      {chuaCoBang && (
        <p className="bang-vang">
          Chưa thấy các bảng <code>gioi_han_lop</code> / <code>gioi_han_hoc</code> / <code>ma_phu_huynh</code> trên Supabase — cô chạy file SQL <code>56-tu-luc-va-qua-tai.sql</code> để lưu cấu hình và cấp mã phụ huynh.
        </p>
      )}

      <QuaTaiGV
        key={lop.class_id}
        lop={lop.class_id}
        cauHinhBanDau={cauHinhLop}
        hocSinhBanDau={hocSinhBanDau}
      />
    </div>
  );
}
