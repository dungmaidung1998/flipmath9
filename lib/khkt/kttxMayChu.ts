/**
 * FILE NÀY LÀM GÌ: Tải dữ liệu bài KTTX của lớp (ảnh signed URL, danh sách nộp, câu chi tiết, đối chiếu nghiên cứu) từ Supabase bằng khoá máy chủ.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: kttx_bai, de_kiem_tra, students, error_dictionary, kttx_bai_nop, kttx_cau_chi_tiet, kttx
 * GỌI TỚI: @/lib/supabase/server, @/lib/khkt/kttx, @/components/kttx/KttxGVClient, @/components/kttx/KttxHocSinhClient
 */
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  chuanHoaTrangThaiKTTX,
  tinhThongKeNghienCuuKTTX,
  type ThongKeNghienCuuKTTX,
} from '@/lib/khkt/kttx';
import type { KttxBaiGV, DeKiemTraShort, KttxBaiNopGV } from '@/components/kttx/KttxGVClient';
import type { LoiDictItem } from '@/components/kttx/KttxHocSinhClient';

/**
 * Hàm `taiDuLieuKttxGV`: tải đầy đủ dữ liệu KTTX theo lớp / bài kiểm tra cho trang giáo viên.
 */
export async function taiDuLieuKttxGV(classId: string, baiId?: string | null) {
  const admin = supabaseAdmin();
  let chuaCoBang = false;
  let baiList: KttxBaiGV[] = [];
  let deList: DeKiemTraShort[] = [];
  let baiNopList: KttxBaiNopGV[] = [];
  let errorDictionary: LoiDictItem[] = [];
  let studentsLop: { student_id: string; display_name: string | null }[] = [];
  let siSoLop = 0;

  try {
    const [{ data: bais, error: errBai }, { data: des }, { data: sts }, { data: dict }] = await Promise.all([
      admin.from('kttx_bai').select('*').eq('class_id', classId).order('tao_luc', { ascending: false }).limit(50),
      admin.from('de_kiem_tra').select('id, tieu_de, chuong, tao_luc').eq('class_id', classId).order('tao_luc', { ascending: false }).limit(30),
      admin.from('students').select('student_id, display_name').eq('class_id', classId).order('student_id'),
      admin.from('error_dictionary').select('error_code, ku_id, misconception').order('error_code'),
    ]);

    if (errBai) chuaCoBang = true;
    baiList = (bais ?? []) as KttxBaiGV[];
    deList = (des ?? []) as DeKiemTraShort[];
    errorDictionary = (dict ?? []) as LoiDictItem[];
    studentsLop = (sts ?? []) as { student_id: string; display_name: string | null }[];
    siSoLop = studentsLop.length;

    if (!chuaCoBang) {
      let qNop = admin
        .from('kttx_bai_nop')
        .select('*')
        .eq('class_id', classId)
        .order('tao_luc', { ascending: false })
        .limit(250);
      if (baiId) qNop = qNop.eq('bai_id', baiId);

      const { data: nops, error: errNop } = await qNop;
      if (errNop) chuaCoBang = true;

      const list = nops ?? [];
      const nopIds = list.map((r: any) => r.id);
      const { data: cauRows } = nopIds.length
        ? await admin.from('kttx_cau_chi_tiet').select('*').in('bai_nop_id', nopIds).order('so_cau')
        : { data: [] as any[] };
      const cauMap = new Map<string, any[]>();
      for (const c of cauRows ?? []) {
        const arr = cauMap.get(c.bai_nop_id) ?? [];
        arr.push(c);
        cauMap.set(c.bai_nop_id, arr);
      }

      const tenHS = new Map(studentsLop.map((s) => [s.student_id, s.display_name || s.student_id]));
      baiNopList = await Promise.all(
        list.map(async (r: any) => {
          const paths = Array.isArray(r.anh_paths) ? r.anh_paths : [];
          const anhUrls: string[] = [];
          if (!r.anh_da_xoa && paths.length) {
            for (const p of paths) {
              try {
                // Thao tác Supabase Storage: truy cập kho ảnh riêng tư (bucket) kttx
                const s = await admin.storage.from('kttx').createSignedUrl(String(p), 900);
                if (s.data?.signedUrl) anhUrls.push(s.data.signedUrl);
              } catch {}
            }
          }
          const hsCauMap = new Map<number, any>(
            Array.isArray(r.diem_cau_hs) ? r.diem_cau_hs.map((x: any) => [Number(x?.soCau), x]) : []
          );
          const tt = chuanHoaTrangThaiKTTX(r.trang_thai);
          const cacCauRows = cauMap.get(r.id) ?? [];
          return {
            ...r,
            trang_thai: tt,
            ly_do_kiem_tra: Array.isArray(r.ly_do_kiem_tra) ? r.ly_do_kiem_tra : [],
            ten_hs: tenHS.get(r.student_id) ?? r.student_id,
            anh_urls: anhUrls,
            cacCau: cacCauRows.map((c: any) => {
              const hsO = hsCauMap.get(c.so_cau);
              return {
                soCau: c.so_cau,
                noiDungNgan: c.noi_dung_ngan,
                kuId: c.ku_id,
                maLoiGoiY: c.ma_loi_duyet ?? c.ma_loi_goi_y,
                diemDat: c.diem_gv_sua ?? hsO?.diemDat ?? c.diem_dat,
                diemToiDa: c.diem_toi_da,
                nhanXetGV: c.nhan_xet_gv ?? '',
                doTinCay: Number(c.do_tin_cay ?? 0.8),
                ghiChuHs: hsO?.ghiChuHs ?? c.ghi_chu_hs,
              };
            }),
            cauDoiChieu: cacCauRows.map((c: any) => ({
              diem_ai: c.diem_dat != null ? Number(c.diem_dat) : null,
              diem_chot: c.diem_gv_sua != null ? Number(c.diem_gv_sua) : null,
            })),
          } as KttxBaiNopGV & { cauDoiChieu?: { diem_ai: number | null; diem_chot: number | null }[] };
        })
      );
    }
  } catch {
    chuaCoBang = true;
  }

  const thongKeNghienCuu: ThongKeNghienCuuKTTX = tinhThongKeNghienCuuKTTX(
    baiNopList.map((b: any) => ({
      trang_thai: b.trang_thai,
      tong_diem_ai: b.tong_diem_ai ?? null,
      tong_diem_hs: b.tong_diem_hs ?? null,
      tong_diem_excel: b.tong_diem_excel ?? null,
      hs_ly_do_bao_sai: b.hs_ly_do_bao_sai ?? null,
      cau_doi_chieu: b.cauDoiChieu ?? [],
    }))
  );

  return {
    chuaCoBang,
    baiList,
    deList,
    baiNopList,
    errorDictionary,
    studentsLop,
    siSoLop,
    thongKeNghienCuu,
  };
}
