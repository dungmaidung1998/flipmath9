/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /hoc/[ku]
 * LẤY DỮ LIỆU TỪ: knowledge_units, contents, questions_public, question_options, profiles, learning_events, students, class_content
 * GỌI TỚI: @/lib/cheDo, @/lib/supabase/server, @/components/VideoLesson, @/components/Quiz, @/components/LearningCompletion, @/components/PreClassStepper, @/components/DauTrang, @/lib/minhHoa
 */
import { CHE_DO_KIEM_TRA } from '@/lib/cheDo';
import { supabaseAdmin, supabaseServer } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import VideoLesson from '@/components/VideoLesson';
import Quiz from '@/components/Quiz';
import LearningCompletion from '@/components/LearningCompletion';
import PreClassStepper from '@/components/PreClassStepper';
import DauTrang from '@/components/DauTrang';
import { hinhBai, hinhNhanVat } from '@/lib/minhHoa';
import TroChoiNen from '@/components/tro-choi-nen/TroChoiNen';
import SoatLoi from '@/components/soat-loi/SoatLoi';
import { ngayVN, ngayDep, gioDep } from '@/lib/lichBai';
import TuDanhGia from '@/components/TuDanhGia';
import { TuVungMuc } from '@/components/tieng-anh/ToanTiengAnh';
import { TRO_CHOI_THEO_MUC } from '@/lib/dfle/t9-tro-choi-nen.js';
import ThiNghiem from '@/components/thi-nghiem/ThiNghiem';
import { thiNghiemCuaMuc } from '@/lib/thiNghiem';
import TomTatGhiVo from '@/components/tom-tat/TomTatGhiVo';
import HinhToanDong from '@/components/truc-quan/HinhToanDong';
import { tronCauHoi } from '@/lib/tronPhuongAn';
import { chonPhieu } from '@/lib/chonPhieu';
import { themTiengAnh } from '@/lib/themTiengAnh';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
import KhoaMemQuaTai from '@/components/KhoaMemQuaTai';
import { layCauHinhQuaTaiHieuLuc } from '@/lib/quaTaiMayChu';
import { biKhoaMemBaiMoi, phatHienDauHieuQuaTai, phutHienTaiVN } from '@/lib/quaTai';
import type { CSSProperties } from 'react';

/** Khoá bước (phải xem ≥80% video, làm xong game/quiz mới qua bước sau). Đang build web nên TẮT; bật lại: đổi thành true. */
const KHOA_BUOC_HOC = !CHE_DO_KIEM_TRA && false;
import { anhTomTatCuaMuc } from '@/lib/dfle/t9-tom-tat.js';
import TongHopKienThuc from '@/components/on-tap/TongHopKienThuc';
import { laOnTap } from '@/lib/dfle/t9-on-tap.js';

export const dynamic = 'force-dynamic';

/**
 * Component React `BaiHoc`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function BaiHoc({ params }: { params: { ku: string } }) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const kuId = decodeURIComponent(params.ku);

  const { data: ku } = await supabase
    .from('knowledge_units').select('ku_id, ku_name, lesson_id, co_video').eq('ku_id', kuId).maybeSingle();
  if (!ku) notFound();

  const { data: video } = await supabase
    .from('contents').select('title, url, duration_sec')
    .eq('ku_id', kuId).eq('kind', 'video').maybeSingle();

  const { data: questions } = await supabase
    .from('questions_public').select('question_id, stem, level, expected_time_sec, hinh')
    .eq('ku_id', kuId).lte('level', 3).order('level');

  // Phiếu học tập: tối đa 10 câu (3 · 4 · 3), cố định theo tài khoản — API chấm bài chọn lại y hệt.
  const phieu = chonPhieu(questions ?? [], user.id);
  const ids = phieu.map((q) => q.question_id);
  const { data: options } = await supabase
    .from('question_options').select('question_id, option_key, option_text')
    .in('question_id', ids.length ? ids : ['__none__']).order('option_key');

  // Trộn thứ tự phương án theo từng tài khoản (đáp án gốc luôn là A).
  const withOptions = tronCauHoi(themTiengAnh(phieu.map((q) => ({
    ...q,
    options: (options ?? []).filter((o) => o.question_id === q.question_id)
  }))), user.id);

  // Khoá chuỗi trước giờ (SPEC M2): soát lỗi cũ → trò chơi nền → video (≥ 80%) → bài kiểm tra → tự đánh giá.
  // Giáo viên xem thử thì không khoá và không có bước soát lỗi.
  const { data: hoSo } = await supabase.from('profiles').select('student_id, role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const laHocSinh = !!hoSo?.student_id && !laVaiTroGV(hoSo?.role);
  let daXong = { game: false, video: false, quiz: false };
  let lopHocSinh: string | null = null;
  let noiDungLop: { dao_nguoc: boolean; an: boolean; an_game: boolean; an_video: boolean } | null = null;
  if (laHocSinh) {
    const [{ data: tienDo }, { count: soLanChoi }, { data: em }] = await Promise.all([
      supabase.rpc('learning_completion', { p_student: hoSo!.student_id, p_ku: kuId }),
      supabase.from('learning_events').select('event_id', { count: 'exact', head: true })
        .eq('student_id', hoSo!.student_id).eq('ku_id', kuId).eq('event_type', 'game_finish'),
      supabase.from('students').select('class_id').eq('student_id', hoSo!.student_id).maybeSingle()
    ]);
    lopHocSinh = em?.class_id ?? null;
    if (lopHocSinh) {
      const { data: cc } = await supabase
        .from('class_content')
        .select('dao_nguoc, an, an_game, an_video')
        .eq('class_id', lopHocSinh)
        .eq('ku_id', kuId)
        .maybeSingle()
        .then((r: any) => r, () => ({ data: null }));
      if (cc) {
        noiDungLop = {
          dao_nguoc: !!cc.dao_nguoc,
          an: !!cc.an,
          an_game: !!cc.an_game,
          an_video: !!cc.an_video
        };
      }
    }
    daXong = {
      game: (soLanChoi ?? 0) > 0,
      // null = video chưa đo được thời lượng: không khoá oan học sinh.
      video: tienDo?.video_complete !== false,
      quiz: !!tienDo?.preparation_submitted
    };
  }

  const cd = chuDeChuong(kuId);
  const wrapStyle = cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined;

  // Mục bị giáo viên ẩn riêng cho lớp (class_content.an = true)
  if (!CHE_DO_KIEM_TRA && laHocSinh && noiDungLop?.an) {
    return (
      <div className={cd ? 'wrap trang-chuong' : 'wrap'} style={wrapStyle}>
        <DauTrang tieuDe={ku.ku_name} phu={ku.lesson_id ?? ''} chuong={kuId} nhanVat="bin" hinh={hinhNhanVat('lo-trinh')} />
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>🙈 Mục này đang tạm ẩn cho lớp của em</h2>
          <p className="hint">Thầy cô sẽ mở mục này khi đến tiết phù hợp.</p>
          <p><a className="action-link" href="/bai-hoc">← Về danh sách bài học</a></p>
        </div>
      </div>
    );
  }

  // Lịch giao bài: trước ngày mở thì học sinh thấy 🔒 (giáo viên xem thử không bị khoá).
  if (!CHE_DO_KIEM_TRA && laHocSinh && ku.lesson_id && lopHocSinh) {
    const { data: lich } = await supabase
      .from('lich_bai')
      .select('ngay_mo, han_chuan_bi, ngay_hoc')
      .eq('class_id', lopHocSinh)
      .eq('lesson_id', ku.lesson_id)
      .maybeSingle()
      .then((r) => r, () => ({ data: null }));
    // Xử lý mốc ngày giờ theo múi giờ Việt Nam (UTC+7)
    if (lich && ngayVN() < lich.ngay_mo) {
      return (
        <div className={cd ? 'wrap trang-chuong' : 'wrap'} style={wrapStyle}>
          <DauTrang tieuDe={ku.ku_name} phu={ku.lesson_id} chuong={kuId} nhanVat="bin" hinh={hinhNhanVat('lo-trinh')} />
          <div className="card" style={{ textAlign: 'center' }}>
            <h2>🔒 Bài này mở ngày {ngayDep(lich.ngay_mo)}</h2>
            <p>Hạn chuẩn bị: {gioDep(lich.han_chuan_bi)} · Học trên lớp: {ngayDep(lich.ngay_hoc)}.</p>
            <p><a className="action-link" href="/bai-hoc">← Về danh sách bài học</a></p>
          </div>
        </div>
      );
    }
  }

  // Trò chơi ôn kiến thức nền: chơi trước khi xem video (ẩn nếu class_content.an_game = true).
  const gameElement: React.ReactNode = !noiDungLop?.an_game && TRO_CHOI_THEO_MUC[kuId] ? <TroChoiNen kuId={kuId} /> : null;

  const onTap = laOnTap(kuId);
  const videoElement = noiDungLop?.an_video
    ? undefined
    : onTap
      ? <TongHopKienThuc kuId={kuId} />
      : ku.co_video !== false ? (
        <VideoLesson
          kuId={kuId}
          title={video?.title ?? 'Video bài học'}
          url={video?.url ?? null}
          durationSec={video?.duration_sec ?? null}
        />
      ) : (
        <div className="card">
          <p className="hint">Mục này không có video mới. Em làm bài kiểm tra bên dưới.</p>
        </div>
      );

  let khoaQuaTai = false;
  let phutGioiHan = 90;
  let khuya = false;
  if (laHocSinh && !CHE_DO_KIEM_TRA) {
    try {
      const hieuLuc = await layCauHinhQuaTaiHieuLuc(supabaseAdmin(), hoSo!.student_id!, lopHocSinh);
      phutGioiHan = hieuLuc.cauHinh.phut_ngay;
      const ds = phatHienDauHieuQuaTai(
        {
          phutTrongNgayVN: phutHienTaiVN(),
          phutLienTuc: 0,
          phutTrongNgay: hieuLuc.phutHomNay,
          cauGanDay: [],
          nowMs: Date.now(),
        },
        hieuLuc.cauHinh
      );
      khoaQuaTai = biKhoaMemBaiMoi(ds);
      khuya = ds.includes('khuya');
    } catch { /* bỏ qua */ }
  }

  const thiNghiem = thiNghiemCuaMuc(kuId);
  const coHinhDong = kuId.startsWith('C6-B18-') || kuId.startsWith('C7-');
  const quizElement = withOptions.length ? (
    <KhoaMemQuaTai
      khoaBanDau={khoaQuaTai}
      phutGioiHanBanDau={phutGioiHan}
      laGioKhuyaBanDau={khuya}
    >
      <Quiz kuId={kuId} questions={withOptions} />
    </KhoaMemQuaTai>
  ) : (
    <div className="card">
      <h2>Bài kiểm tra</h2>
      <p className="hint">Đang cập nhật câu hỏi.</p>
    </div>
  );

  const daoNguoc = !!noiDungLop?.dao_nguoc;

  return (
    <div className={cd ? 'wrap trang-chuong' : 'wrap'} style={wrapStyle}>
      <DauTrang tieuDe={ku.ku_name} phu={ku.lesson_id ?? ''} chuong={kuId} nhanVat="bin" hinh={hinhBai(ku.lesson_id) ?? hinhNhanVat('xem-video')} />
      {laHocSinh && (
        <p
          style={{
            margin: '0 0 12px',
            display: 'inline-block',
            padding: '5px 12px',
            borderRadius: 999,
            fontSize: 13.5,
            fontWeight: 700,
            background: daoNguoc ? '#e8f1ff' : '#f3f5f8',
            color: daoNguoc ? '#1d4ed8' : '#526075',
            border: daoNguoc ? '1px solid #bfdbfe' : '1px solid var(--line)'
          }}
        >
          {daoNguoc ? '🔄 Tiết đảo ngược – chuẩn bị trước giờ học' : 'Tự học thêm (không bắt buộc)'}
        </p>
      )}

      <PreClassStepper
        chuong={kuId}
        soatNode={laHocSinh ? <SoatLoi kuId={kuId} /> : undefined}
        khoa={KHOA_BUOC_HOC && laHocSinh}
        daXong={daXong}
        hasGame={!!gameElement}
        gameNode={gameElement}
        videoNode={videoElement}
        videoKind={onTap ? 'tong-hop' : 'video'}
        ghiVoNode={!onTap && anhTomTatCuaMuc(kuId) ? <TomTatGhiVo kuId={kuId} /> : undefined}
        thuTayNode={thiNghiem || coHinhDong || kuId === 'C4-B12-M2' || kuId === 'C4-B12-M3' ? <>
          {thiNghiem && <ThiNghiem tn={thiNghiem} ghi={laHocSinh} />}
          {(kuId === 'C4-B12-M2' || kuId === 'C4-B12-M3') && (
            <div className="card" style={{ marginTop: 12, background: '#eefaf2', borderColor: '#86efac', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <b>📐 Thực hành ngoài trời: Đo chiều cao bằng điện thoại (3D + AR)</b>
                <p className="hint" style={{ margin: '2px 0 0' }}>Ngắm đỉnh vật thật ở sân trường, dựng tam giác vuông 3D rồi tự tính chiều cao.</p>
              </div>
              <a className="action-link" href="/do-chieu-cao">Mở đo chiều cao →</a>
            </div>
          )}
          {coHinhDong && <HinhToanDong kuId={kuId}/>}
        </> : undefined}
        /* Bỏ bước Phiếu trên web (trùng các bước khác); phiếu in vẫn mở từ bước Tóm tắt. */
        hocLieuNode={undefined}
        quizNode={quizElement}
        completionNode={<>{laHocSinh && <TuDanhGia kuId={kuId} />}<LearningCompletion kuId={kuId}/><div id="lesson-video" /></>}
      />
      <TuVungMuc kuId={kuId} />
    </div>
  );
}
