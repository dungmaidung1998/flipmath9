/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /kttx
 * LẤY DỮ LIỆU TỪ: profiles, students, kttx_bai, kttx_bai_nop, error_dictionary, kttx_cau_chi_tiet
 * GỌI TỚI: @/lib/supabase/server, @/lib/ai/claude, @/components/kttx/KttxHocSinhClient, @/lib/dfle/ngay.js
 */
import { redirect } from 'next/navigation';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { aiChamVoBat, coKhoaClaude } from '@/lib/ai/claude';
import { chuanHoaTrangThaiKTTX } from '@/lib/khkt/kttx';
import KttxHocSinhClient, {
  type BaiKttxItem,
  type BaiNopKttxHS,
  type LoiDictItem,
} from '@/components/kttx/KttxHocSinhClient';
// @ts-ignore
import { homNayVN } from '@/lib/dfle/ngay.js';

export const dynamic = 'force-dynamic';

/**
 * Component React `KttxPage`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function KttxPage() {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const { data: prof } = await db
    .from('profiles')
    .select('student_id, class_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!prof?.student_id) {
    redirect('/gv/kttx');
  }

  const admin = supabaseAdmin();
  // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
  const homNay = homNayVN();

  let chuaCoBang = false;
  let baiList: BaiKttxItem[] = [];
  let baiNopList: BaiNopKttxHS[] = [];
  let dictList: LoiDictItem[] = [];
  let daDungHomNay = 0;
  let consentStatus = 'chua';

  try {
    const [{ data: st }, { data: bais, error: errB }, { data: nops, error: errN }, { data: dict }] =
      await Promise.all([
        admin.from('students').select('consent_status, class_id').eq('student_id', prof.student_id).maybeSingle(),
        prof.class_id
          ? admin.from('kttx_bai').select('id, tieu_de, chuong, ngay_thi, thang_diem, khung_cau').eq('class_id', prof.class_id).order('tao_luc', { ascending: false }).limit(30)
          : Promise.resolve({ data: [], error: null }),
        admin.from('kttx_bai_nop').select('*').eq('student_id', prof.student_id).order('tao_luc', { ascending: false }).limit(30),
        admin.from('error_dictionary').select('error_code, ku_id, misconception').order('error_code'),
      ]);

    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    consentStatus = String(st?.consent_status ?? 'chua');
    if (errB || errN) chuaCoBang = true;
    baiList = (bais ?? []) as BaiKttxItem[];
    dictList = (dict ?? []) as LoiDictItem[];

    const nopIds = (nops ?? []).map((n: any) => n.id);
    const { data: cauRows } = nopIds.length
      ? await admin.from('kttx_cau_chi_tiet').select('*').in('bai_nop_id', nopIds).order('so_cau')
      : { data: [] as any[] };
    const cauMap = new Map<string, any[]>();
    for (const c of cauRows ?? []) {
      const arr = cauMap.get(c.bai_nop_id) ?? [];
      arr.push(c);
      cauMap.set(c.bai_nop_id, arr);
    }

    baiNopList = (nops ?? []).map((n: any) => {
      const tt = chuanHoaTrangThaiKTTX(n.trang_thai);
      const hsCauMap = new Map<number, any>(
        Array.isArray(n.diem_cau_hs) ? n.diem_cau_hs.map((x: any) => [Number(x?.soCau), x]) : []
      );
      return {
        ...n,
        trang_thai: tt,
        ly_do_kiem_tra: Array.isArray(n.ly_do_kiem_tra) ? n.ly_do_kiem_tra : [],
        cacCau: (cauMap.get(n.id) ?? []).map((c: any) => {
          const hsO = hsCauMap.get(c.so_cau);
          const diemHien =
            tt === 'da-chot'
              ? (c.diem_gv_sua ?? hsO?.diemDat ?? c.diem_dat)
              : (hsO?.diemDat ?? c.diem_gv_sua ?? c.diem_dat);
          return {
            soCau: c.so_cau,
            noiDungNgan: c.noi_dung_ngan,
            kuId: c.ku_id,
            maLoiGoiY: c.ma_loi_duyet ?? c.ma_loi_goi_y,
            diemDat: diemHien,
            diemToiDa: c.diem_toi_da,
            nhanXetGV: c.nhan_xet_gv ?? '',
            doTinCay: Number(c.do_tin_cay ?? 0.8),
            ghiChuHs: hsO?.ghiChuHs ?? c.ghi_chu_hs,
          };
        }),
      };
    });

    daDungHomNay = (nops ?? [])
      .filter((n: any) => n.ngay === homNay)
      .reduce((s: number, n: any) => s + Number(n.so_trang ?? 1), 0);
  } catch {
    chuaCoBang = true;
  }

  return (
    <KttxHocSinhClient
      baiListBanDau={baiList}
      baiNopBanDau={baiNopList}
      errorDictionary={dictList}
      chuaCoBangBanDau={chuaCoBang}
      quotaBanDau={{
        daDungHomNay,
        gioiHanNgay: 5,
        conLaiHomNay: Math.max(0, 5 - daDungHomNay),
        consentStatus,
        coKhoaClaude: coKhoaClaude(),
        aiBat: aiChamVoBat(),
      }}
    />
  );
}
