/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: profiles
 * GỌI TỚI: @/lib/supabase/server, @/lib/chuDeChuong, @/components/AnhChuDe, @/components/PhaoGiayChuong, @/components/LinhVatDaNang
 */
import type { CSSProperties } from 'react';
import { supabaseServer } from '@/lib/supabase/server';
import { chuDeChuong } from '@/lib/chuDeChuong';
import AnhChuDe from '@/components/AnhChuDe';
import PhaoGiayChuong from '@/components/PhaoGiayChuong';
import LinhVatDaNang from '@/components/LinhVatDaNang';

/**
 * Component React `LearningCompletion`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default async function LearningCompletion({ kuId }: { kuId: string }) {
  const db = supabaseServer();
  // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;
  // Truy vấn Supabase: đọc dữ liệu từ bảng profiles
  const { data: p } = await db.from('profiles').select('student_id').eq('id', user.id).maybeSingle();
  if (!p?.student_id) return null;

  const { data, error } = await db.rpc('learning_completion', { p_student: p.student_id, p_ku: kuId });
  const cd = chuDeChuong(kuId);
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const laOTC = /-OTC\b/i.test(kuId);

  if (error || !data) {
    return (
      <div className="card">
        <h2>Tiến độ hoạt động</h2>
        <p className="hint">Chưa tải được tiến độ bài học.</p>
      </div>
    );
  }

  const items = [
    {
      label: '🎬 Video bài học',
      done: data.video_complete !== false,
      text: data.video_complete === null ? 'Không yêu cầu' : data.video_complete ? 'Đã xem' : 'Chưa xem đủ'
    },
    {
      label: '✍️ Quiz chuẩn bị',
      done: data.preparation_submitted,
      text: data.preparation_submitted ? 'Đã nộp' : 'Chưa nộp'
    },
    {
      label: '🎯 Bài vận dụng',
      done: data.application_submitted,
      text: data.application_submitted ? 'Đã nộp' : 'Chưa nộp'
    }
  ];

  return (
    <div
      className={'card' + (cd ? ' lc-hoan-thanh' : '')}
      style={{
        maxWidth: 640,
        margin: '20px auto',
        textAlign: 'center',
        ...(cd ? ({ ['--mau-chuong' as string]: cd.mau } as CSSProperties) : {}),
      }}
    >
      {cd && <PhaoGiayChuong mau={cd.mau} active={!!data.lesson_complete || laOTC} />}
      <h2 style={{ marginBottom: 12, position: 'relative', zIndex: 2 }}>Tổng kết hoạt động</h2>
      <p style={{ position: 'relative', zIndex: 2, fontSize: 16, fontWeight: 700, color: data.lesson_complete ? 'var(--ok)' : 'var(--navy-d)', margin: '0 0 16px' }}>
        {data.lesson_complete ? '🎉 Em đã hoàn thành bài học này!' : `Đã hoàn thành ${data.activities_complete}/${data.activities_required} phần bắt buộc`}
      </p>

      {cd && (
        <div className="lc-thuong">
          <div className="lc-thuong__hang">
            <AnhChuDe
              className="lc-thuong__nv"
              src={cd.nvBin}
              fallback="/minh-hoa/nv/cam-co.webp"
              alt="Bin"
              width={68}
              height={102}
              loading="lazy"
            />
            <AnhChuDe
              className="lc-thuong__anh"
              src={cd.thuongAnh}
              fallback={cd.anhMuc(4)}
              alt={cd.thuong}
              width={120}
              height={120}
              loading="lazy"
            />
            <AnhChuDe
              className="lc-thuong__nv lc-thuong__nv--phu"
              src={cd.nvNa}
              fallback="/minh-hoa/nv/reo-ho.webp"
              alt="Na"
              width={68}
              height={102}
              loading="lazy"
            />
          </div>
          <span className="lc-thuong__nhan">
            {laOTC
              ? `🏆 Phần thưởng Ôn tập cuối chương: ${cd.thuong}`
              : `${cd.bieuTuong} Phần thưởng ${cd.chuDe}: ${cd.thuong}`}
          </span>
          {(data.lesson_complete || laOTC) && (
            <div className="lc-linh-vat-hang">
              <LinhVatDaNang loai="vooc" tuThe="cam-cup" kichThuoc={72} chuyenDong />
              <LinhVatDaNang loai="hoa-dao" tuThe="roi-canh" kichThuoc={64} chuyenDong />
            </div>
          )}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, margin: '14px 0' }}>
        {items.map((it) => (
          <div
            key={it.label}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: it.done ? 'rgba(23, 132, 91, 0.08)' : 'var(--chip)',
              border: `1px solid ${it.done ? 'var(--ok)' : 'var(--line)'}`
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>{it.label}</div>
            <span className={`tag ${it.done ? 'ok' : 'warn'}`} style={{ fontSize: 12 }}>
              {it.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
