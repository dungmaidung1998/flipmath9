/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /tien-do/[chuong]
 * LẤY DỮ LIỆU TỪ: profiles, knowledge_units, mastery_states, quiz_attempts
 * GỌI TỚI: @/lib/supabase/server, @/components/CapDo, @/lib/chapters, @/lib/minhHoa, @/lib/diaDanh, @/lib/vuonKienThuc, @/components/truc-quan/VuonKienThuc, @/components/NhanVat
 */
import { supabaseServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import CapDo, { ChuGiaiCapDo } from '@/components/CapDo';
import { CHAPTERS, chapterOf } from '@/lib/chapters';
import { hinhBai } from '@/lib/minhHoa';
import { DIA_DANH } from '@/lib/diaDanh';
import { docSauTheoMuc } from '@/lib/vuonKienThuc';
import { VuonKienThuc } from '@/components/truc-quan/VuonKienThuc';
import NhanVat from '@/components/NhanVat';
import DauTrang from '@/components/DauTrang';
import { chuDeChuong } from '@/lib/chuDeChuong';
import AnhChuDe from '@/components/AnhChuDe';
import { laVaiTroGV } from '@/lib/gv/lopCuaToi';
import type { CSSProperties } from 'react';

export const dynamic = 'force-dynamic';

/** MỨC LÀM CHỦ CỦA MỘT CHƯƠNG (23/11/2026): từng bài, từng mục. Mở từ trang Tiến độ. */
export default async function LamChuChuong({ params }: { params: { chuong: string } }) {
  const chuong = CHAPTERS.find((c) => c.id === params.chuong);
  if (!chuong) notFound();
  const supabase = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/dang-nhap');
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: profile } = await supabase.from('profiles').select('student_id, role').eq('id', user.id).maybeSingle();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  if (laVaiTroGV(profile?.role)) redirect('/gv');
  const sid = profile?.student_id ?? '';

  const [{ data: units }, { data: mastery }, { data: attempts }, sau] = await Promise.all([
    supabase.from('knowledge_units').select('ku_id, ku_name, order_index, lesson_id').order('order_index'),
    supabase.from('mastery_states').select('ku_id, mastery_level, evidence').eq('student_id', sid),
    supabase.from('quiz_attempts').select('ku_id, score, attempt_no').eq('student_id', sid).like('ku_id', `${chuong.id}-%`),
    docSauTheoMuc(supabase, sid)
  ]);
  const mMap = new Map((mastery ?? []).map((m) => [m.ku_id, m.mastery_level]));
  const evMap = new Map((mastery ?? []).map((m) => [m.ku_id, m.evidence as any]));
  const lanDau = new Map<string, number>();
  for (const a of attempts ?? []) if (a.attempt_no === 1 && !lanDau.has(a.ku_id)) lanDau.set(a.ku_id, Number(a.score));

  const ds = (units ?? []).filter((u) => chapterOf(u.ku_id) === chuong.id);
  const bai: { ten: string; mucs: typeof ds }[] = [];
  for (const u of ds) {
    const ten = u.lesson_id ?? 'Khác';
    const cuoi = bai[bai.length - 1];
    if (cuoi && cuoi.ten === ten) cuoi.mucs.push(u); else bai.push({ ten, mucs: [u] });
  }
  const dat = ds.filter((u) => (mMap.get(u.ku_id) ?? -1) >= 2).length;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const pt = ds.length ? Math.round((dat / ds.length) * 100) : 0;
  const cd = chuDeChuong(chuong.id);
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const muc5 = Math.min(4, Math.max(0, Math.round((pt / 100) * 4)));

  return (
    <div className={cd ? 'wrap trang-chuong' : 'wrap'} style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}>
      <p className="chuong-ve" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <a href="/tien-do">← Tiến độ của tôi</a>
        <a className="action-link" href={`/ho-so/${chuong.id}`}>📄 Hồ sơ năng lực chương (PDF)</a>
      </p>
      <DauTrang
        tieuDe={chuong.title}
        phu={`${chuong.label} · Mức làm chủ`}
        chuong={chuong.id}
        muc={muc5}
        hinh={DIA_DANH[chuong.id] ? `/fluent/${DIA_DANH[chuong.id].icon}_3d.png` : `/minh-hoa/chuong/${chuong.id}.webp`}
      >
        <div style={{ marginTop: 8 }}>
          <span className="lc-thanh" style={{ maxWidth: 320, display: 'block', marginBottom: 4 }}><i style={{ width: `${pt}%` }} /></span>
          <span className="hint" style={{ fontWeight: 700 }}>Đã làm chủ {dat}/{ds.length} mục</span>
          {cd && ds.length > 0 && dat === ds.length && (
            <div className="chuong-huy-hieu-dat">
              <AnhChuDe src={cd.huyHieu} fallback={cd.anhMuc(4)} alt={`Huy hiệu ${chuong.label}`} width={40} height={40} loading="lazy" />
              <span>🏅 Đã đạt huy hiệu {chuong.label}!</span>
            </div>
          )}
        </div>
      </DauTrang>

      <NhanVat loi="vuon" chuong={chuong.id} compact />
      <VuonKienThuc chuong={chuong.id} mucs={ds.map(u => ({id:u.ku_id, ten:u.ku_name, muc:mMap.get(u.ku_id), loi:sau.get(u.ku_id) ?? 0}))} />
      <details className="vuon-chi-tiet">
        <summary>Danh sách từng bài và mục</summary>
      {bai.map((b) => {
        const datBai = b.mucs.filter((u) => (mMap.get(u.ku_id) ?? -1) >= 2).length;
        return (
          <div className="card lc-bai" key={b.ten}>
            <div className="lc-bai__dau">
              {hinhBai(b.ten) && <img src={hinhBai(b.ten)!} alt="" width={44} height={44} loading="lazy" />}
              <h2>{b.ten}</h2>
              <span className="lc-bai__dem">{datBai}/{b.mucs.length}</span>
            </div>
            <ul className="lc-muc">
              {b.mucs.map((u) => {
                const m = mMap.get(u.ku_id);
                const ev = evMap.get(u.ku_id);
                const s = lanDau.get(u.ku_id);
                return (
                  <li key={u.ku_id}>
                    <a href={`/hoc/${u.ku_id}`}>
                      <span className="lc-muc__ten">{u.ku_name}
                        <small>{s !== undefined ? `Lần đầu ${s.toFixed(1)}` : 'Chưa làm bài'}{ev?.version === 'mastery-v2' ? ` · đúng ${ev.index ?? 0}/${ev.question_count ?? 0} câu` : ''}</small>
                      </span>
                      <CapDo m={m} nho chuong={chapterOf(u.ku_id)} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      </details>

      <details className="card lc-chu-giai">
        <summary>Bốn cấp độ làm chủ là gì?</summary>
        <ChuGiaiCapDo />
        <p className="hint">Mức làm chủ xét tối đa 12 câu khác nhau gần nhất, cần ít nhất 3 câu. Câu làm lại thay cho lần cũ; cấp cao cần đúng câu vận dụng.</p>
      </details>
    </div>
  );
}
