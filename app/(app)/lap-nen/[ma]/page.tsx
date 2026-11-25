/**
 * FILE NÀY LÀM GÌ: Trang Next.js App Router trong khu vực học tập đã đăng nhập, nạp dữ liệu ban đầu và hiển thị giao diện tương tác.
 * AI DÙNG: học sinh
 * ĐỊA CHỈ TRÊN WEB: /lap-nen/[ma]
 * LẤY DỮ LIỆU TỪ: profiles, learning_events
 * GỌI TỚI: @/lib/supabase/server, @/components/DauTrang, @/components/OnNhanh, @/components/tro-choi-nen/TroChoiNen, @/components/AnhChuDe, @/lib/minhHoa, @/lib/chuDeChuong, @/lib/kyNangNen
 */
import type { CSSProperties } from 'react';
import { supabaseServer } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import DauTrang from '@/components/DauTrang';
import OnNhanh from '@/components/OnNhanh';
import TroChoiNen from '@/components/tro-choi-nen/TroChoiNen';
import AnhChuDe from '@/components/AnhChuDe';
import { hinhNhanVat } from '@/lib/minhHoa';
import { chuDeChuong } from '@/lib/chuDeChuong';
import { DS_KY_NANG, taiHoSoNen, TEN_MUC_NEN, KHONG_DU } from '@/lib/kyNangNen';
import { TRO_CHOI_THEO_MUC } from '@/lib/dfle/t9-tro-choi-nen.js';
import '@/components/soat-loi/soat-loi.css';

export const dynamic = 'force-dynamic';

/**
 * GÓI LẤP NỀN (SPEC M13.3): thẻ Ôn nhanh + một lượt luyện của kỹ năng nền đó.
 * Lượt luyện là trò chơi ôn nền của một mục dùng kỹ năng này; mỗi lần mở đổi sang mục khác để không lặp câu.
 * Kết quả ghi như mọi lượt trò chơi nền, nên mức nắm vững được tính lại ngay.
 */
export default async function LapNen({ params }: { params: { ma: string } }) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/dang-nhap');
  const ma = decodeURIComponent(params.ma);
  const k = DS_KY_NANG.find((x) => x.ma === ma);
  if (!k) notFound();
  const coTro = k.muc.filter((m) => (TRO_CHOI_THEO_MUC as Record<string, unknown>)[m]);
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('student_id').eq('id', user.id).maybeSingle();
  let nv = KHONG_DU;
  let daChoi = new Map<string, string>();
  if (p?.student_id) {
    try { nv = (await taiHoSoNen(db, [p.student_id])).get(p.student_id)?.get(ma) ?? KHONG_DU; } catch { /* hiện mức chưa đủ dữ liệu */ }
    // Truy vấn Supabase: đọc dữ liệu từ bảng learning_events
    const { data: ev } = await db.from('learning_events').select('ku_id, ts').eq('student_id', p.student_id).eq('event_type', 'game_finish').in('ku_id', coTro.length ? coTro : ['__none__']).order('ts', { ascending: false }).limit(200);
    for (const e of ev ?? []) if (!daChoi.has(e.ku_id)) daChoi.set(e.ku_id, e.ts);
  }
  // Mục chơi lâu nhất chưa chơi (chưa chơi bao giờ thì trước tiên).
  const muc = [...coTro].sort((a, b) => (daChoi.get(a) ?? '').localeCompare(daChoi.get(b) ?? ''))[0];
  const t = TEN_MUC_NEN[nv.muc];
  const chuongMa = muc ?? k.muc[0];
  const cd = chuDeChuong(chuongMa);
  const mucAnh = nv.muc === 'vung' ? 4 : nv.muc === 'chua-chac' ? 2 : nv.muc === 'hong' ? 1 : 0;
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const sao = nv.soCau ? Math.max(1, Math.min(5, Math.round((nv.tiLe ?? 0) * 5))) : 0;

  return (
    <div className={cd ? 'wrap trang-chuong' : 'wrap'} style={cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : undefined}>
      <DauTrang
        tieuDe={`Gói lấp nền: ${k.ten}`}
        phu="Đọc thẻ Ôn nhanh trong 1 phút, rồi làm một lượt luyện. Mức nắm vững được tính lại ngay sau lượt luyện."
        chuong={chuongMa}
        nhanVat="bin"
        hinh={hinhNhanVat('van-dung')}
      />
      <div className="nen-tom-tat">
        {cd && (
          <AnhChuDe
            className="nen-the__hinh"
            src={cd.anhMuc(mucAnh)}
            fallback={cd.iconImg}
            alt=""
            width={52}
            height={52}
          />
        )}
        <div>
          <p style={{ margin: '0 0 4px' }}>
            Mức hiện tại: <span className="nen-muc" style={{ color: t.mau, background: t.nen }}>{t.bieuTuong} {t.ten}</span>
          </p>
          <div className="nen-sao" role="img" aria-label={nv.soCau ? `${sao} trên 5 sao` : 'Chưa có sao'}>
            {Array.from({ length: 5 }, (_, idx) => (
              <span key={idx} className={idx < sao ? 'nen-sao__on' : 'nen-sao__off'} aria-hidden="true">
                {idx < sao ? '★' : '☆'}
              </span>
            ))}
            <small>{nv.soCau ? `đúng ${Math.round((nv.tiLe ?? 0) * 100)}% / ${nv.soCau} câu` : 'Chưa làm lượt nào'}</small>
          </div>
        </div>
        <div className="nen-tom-tat__buoc" aria-label="Hai bước lấp nền">
          <span>1. ⚡ Ôn nhanh</span>
          <span>2. 🎮 Luyện tập</span>
        </div>
      </div>
      <OnNhanh ma={ma} tieuDe="⚡ Bước 1 · Ôn nhanh" />
      <h2 style={{ marginTop: 18 }}>🎮 Bước 2 · Luyện</h2>
      {muc ? <TroChoiNen kuId={muc} /> : <p className="hint">Kỹ năng này chưa có lượt luyện.</p>}
      <p style={{ marginTop: 16 }}><a className="action-link" href="/kien-thuc-nen">← Kiến thức nền của em</a></p>
    </div>
  );
}
