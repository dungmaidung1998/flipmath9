/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /hoc/[ku]/van-dung
 * LẤY DỮ LIỆU TỪ: profiles, class_content, knowledge_units, recommendations, contents, questions_public, mastery_states, question_options
 * GỌI TỚI: @/lib/cheDo, @/lib/supabase/server, @/lib/tronPhuongAn, @/lib/themTiengAnh, @/components/Quiz, @/lib/adaptive, @/lib/loiCu, @/lib/capDo
 */
import { CHE_DO_KIEM_TRA } from '@/lib/cheDo';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { tronCauHoi } from '@/lib/tronPhuongAn';
import { themTiengAnh } from '@/lib/themTiengAnh';
import Quiz from '@/components/Quiz';
import {selectAdaptive,targetLevels} from '@/lib/adaptive';
import { uuTienLoiCu } from '@/lib/loiCu';
import { tenCapDo } from '@/lib/capDo';
import DauTrang from '@/components/DauTrang';
import { hinhNhanVat } from '@/lib/minhHoa';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
import { KhoiChamVoVanDung } from '@/components/cham-vo/ChamVoModal';
import KhoaMemQuaTai from '@/components/KhoaMemQuaTai';
import { layCauHinhQuaTaiHieuLuc } from '@/lib/quaTaiMayChu';
import { biKhoaMemBaiMoi, phatHienDauHieuQuaTai, phutHienTaiVN } from '@/lib/quaTai';
import type { CSSProperties } from 'react';

export const dynamic = 'force-dynamic';

/**
 * PHA SAU GIỜ HỌC
 *
 * Hai việc: (1) làm nội dung bổ trợ mà hệ thống đã giao ở pha trước giờ học,
 * (2) làm bài vận dụng để đo xem đã chuyển hoá được kiến thức chưa.
 *
 * Điểm bài vận dụng chính là appliedScore — thứ mà quy tắc R02 cần, và cũng là
 * post_score đóng lại vòng lặp thích ứng để kiểm chứng gợi ý có tác dụng không.
 */
export default async function VanDung({
  params,
  searchParams,
}: {
  params: { ku: string };
  searchParams?: { giamTai?: string };
}) {
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');

  const kuId = decodeURIComponent(params.ku);

  const { data: profile } = await supabase
    .from('profiles').select('student_id, role, class_id').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (laVaiTroGV(profile?.role)) redirect('/gv');
  const sid = profile?.student_id ?? '';

  if (profile?.class_id) {
    const { data: ccAn } = await supabase
      .from('class_content').select('an').eq('class_id', profile.class_id).eq('ku_id', kuId).maybeSingle()
      .then((r: any) => r, () => ({ data: null }));
    if (ccAn?.an) redirect('/bai-hoc');
  }

  const { data: ku } = await supabase
    .from('knowledge_units').select('ku_id, ku_name').eq('ku_id', kuId).maybeSingle();
  if (!ku) notFound();

  // gợi ý đang mở của đơn vị kiến thức này
  const { data: recs } = await supabase
    .from('recommendations')
    .select('rec_id, trigger_rule, diagnosis, action, recommended_content, post_score, created_at')
    .eq('student_id', sid).eq('ku_id', kuId)
    .order('created_at', { ascending: false }).limit(1);
  const rec = recs?.[0];

  const { data: content } = rec?.recommended_content
    ? await supabase.from('contents').select('title, duration_sec, url')
        .eq('content_id', rec.recommended_content).maybeSingle()
    : { data: null };

  // bài vận dụng: các câu mức 3–4 của đơn vị kiến thức
  const { data: bank } = await supabase
    .from('questions_public').select('question_id, stem, level, expected_time_sec, hinh')
    .eq('ku_id', kuId).order('level');
  // Truy vấn Supabase: đọc dữ liệu từ bảng mastery_states
  const {data:state,error:stateError}=await supabase.from('mastery_states').select('mastery_level').eq('student_id',sid).eq('ku_id',kuId).maybeSingle();
  if(stateError)throw new Error('Không đọc được mức làm chủ. Vui lòng thử lại.');
  const level=state?.mastery_level??null;

  // Lỗi cũ của em: ưu tiên câu dính lỗi em từng mắc. API chấm bài dùng cùng hàm này để xác minh đề.
  const giamTai = searchParams?.giamTai === '1';
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const mucThichUng = giamTai ? (level == null ? 0 : Math.max(0, level - 1)) : level;
  let uuTien = new Map<string, number>();
  try { uuTien = await uuTienLoiCu(supabaseAdmin(), sid, (bank ?? []).map((q) => q.question_id)); }
  catch { throw new Error('Không đọc được dữ liệu lỗi cũ. Em tải lại trang.'); }
  const questionsAll=selectAdaptive(bank??[],mucThichUng,uuTien);
  const questions = giamTai ? questionsAll.slice(0, 3) : questionsAll;
  const soOnLoi=questions.filter((q)=>uuTien.has(q.question_id)).length;

  let khoaQuaTai = false;
  let phutGioiHan = 90;
  let khuya = false;
  if (sid && !CHE_DO_KIEM_TRA) {
    try {
      const hieuLuc = await layCauHinhQuaTaiHieuLuc(supabaseAdmin(), sid, profile?.class_id);
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

  const ids = (questions ?? []).map((q) => q.question_id);
  const { data: options } = await supabase
    .from('question_options').select('question_id, option_key, option_text')
    .in('question_id', ids.length ? ids : ['__none__']).order('option_key');

  // Trộn thứ tự phương án theo từng tài khoản (đáp án gốc luôn là A).
  const withOptions = tronCauHoi(themTiengAnh((questions ?? []).map((q) => ({
    ...q,
    onLoi: uuTien.has(q.question_id),
    options: (options ?? []).filter((o) => o.question_id === q.question_id)
  }))), user.id);

  const cd = chuDeChuong(kuId);

  return (
    <div className={cd ? 'wrap trang-chuong' : 'wrap'} style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}>
      <DauTrang tieuDe={ku.ku_name} phu="Pha sau giờ học — củng cố và vận dụng" chuong={kuId} nhanVat="bin" hinh={hinhNhanVat('van-dung')} />

      {rec ? (
        <div className="card">
          <h2>Việc hệ thống giao cho em</h2>
          <div className="rule">
            <strong>Gợi ý học tiếp cho em</strong>
            <div className="lbl">Nhận xét</div>{rec.diagnosis}
            <div className="lbl">Việc cần làm</div>{rec.action}
            {content && (
              <>
                <div className="lbl">Nội dung bổ trợ</div>
                {content.url
                  ? <a className="action-link" href={content.url} target="_blank" rel="noreferrer">{content.title}</a>
                  : content.title}
                {content.duration_sec ? ` (${Math.round(content.duration_sec / 60)} phút)` : ''}
              </>
            )}
          </div>
          {rec.post_score !== null && (
            <p className="hint" style={{ marginTop: 12 }}>
              Em đã làm bài vận dụng cho gợi ý này rồi — kết quả {Number(rec.post_score).toFixed(1)} điểm.
              Làm lại vẫn được, hệ thống ghi nhận lượt mới.
            </p>
          )}
        </div>
      ) : (
        <div className="card">
          <h2>Việc hệ thống giao cho em</h2>
          <p className="hint">
            Chưa có gợi ý nào cho bài này. Em làm <a className="action-link" href={`/hoc/${kuId}`}>bài kiểm tra ngắn trước giờ học</a> trước đã.
          </p>
        </div>
      )}

      {withOptions.length ? (
        <KhoaMemQuaTai
          khoaBanDau={khoaQuaTai}
          phutGioiHanBanDau={phutGioiHan}
          laGioKhuyaBanDau={khuya}
          duongDanGiamTai={giamTai ? undefined : `/hoc/${encodeURIComponent(kuId)}/van-dung?giamTai=1`}
        >
          <Quiz
            kuId={kuId}
            questions={withOptions}
            mode="van-dung"
            giamTai={giamTai}
            heading={giamTai ? 'Bài tập nhẹ nhàng (3 câu)' : 'Bài tập phù hợp với em'}
            note={giamTai
              ? `${withOptions.length} câu giảm tải mức ${targetLevels(mucThichUng).join('–')} giúp em lấy lại nhịp tự tin.`
              : `${withOptions.length} câu mức ${targetLevels(level).join("–")}, chọn theo cấp độ ${level==null?"chưa đủ dữ liệu":tenCapDo(level)}. ${soOnLoi?` Có ${soOnLoi} câu 🎯 giúp em luyện lại chỗ em từng làm sai.`:""} Kết quả sẽ cập nhật bài tập tiếp theo.`}
          />
          <KhoiChamVoVanDung
            kuId={kuId}
            cauHoi={withOptions.map((q) => ({ question_id: q.question_id, stem: q.stem }))}
            bat={(process.env.AI_CHAM_VO_BAT ?? 'true').trim().toLowerCase() !== 'false'}
          />
        </KhoaMemQuaTai>
      ) : (
        <div className="card">
          <h2>Bài vận dụng</h2>
          <p className="hint">
            Chưa có câu hỏi phù hợp mức hiện tại. Em quay lại học liệu và báo giáo viên bổ sung bài tập.
          </p>
        </div>
      )}

      <p className="action-row" style={{ marginTop: 4 }}><a className="action-link" href={`/hoc/${kuId}`}>← Quay lại bài học</a></p>
    </div>
  );
}
