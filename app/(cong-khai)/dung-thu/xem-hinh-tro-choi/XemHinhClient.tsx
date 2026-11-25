'use client';

import HinhNen from '@/components/tro-choi-nen/HinhNen';
import TroChoiNen from '@/components/tro-choi-nen/TroChoiNen';
import '@/components/tro-choi-nen/tro-choi-nen.css';

const MAU_KIEM_TRA: { id: string; tieuDe: string; kuId: string; cau?: { t: string; tra: boolean } }[] = [
  { id: '01-c1-b1-m1', tieuDe: '1. C1-B1-M1 — Đường thẳng nghiệm ax + by = c', kuId: 'C1-B1-M1' },
  { id: '02-c1-b2-m1', tieuDe: '2. C1-B2-M1 — Hai đường cắt / song song / trùng', kuId: 'C1-B2-M1' },
  { id: '03-c2-b5-m2', tieuDe: '3. C2-B5-M2 — Cân bất đẳng thức (đổi chiều)', kuId: 'C2-B5-M2' },
  { id: '04-c2-b6-m1', tieuDe: '4. C2-B6-M1 — Trục số tập nghiệm x > a, x ≤ a', kuId: 'C2-B6-M1' },
  { id: '05-c3-b7-m1', tieuDe: '5. C3-B7-M1 — Hình vuông diện tích a → cạnh √a', kuId: 'C3-B7-M1' },
  {
    id: '06-c4-b11-m1',
    tieuDe: '6. C4-B11-M1 (Q1) — Tam giác vuông 3 và 4',
    kuId: 'C4-B11-M1',
    cau: { t: 'Tam giác vuông có hai cạnh góc vuông 3 và 4. Cạnh huyền bằng?', tra: false },
  },
  {
    id: '07-c4-b12-m3',
    tieuDe: '7. C4-B12-M3 (Bài 1) — Tam giác ABC vuông tại A, góc B = 35°',
    kuId: 'C4-B12-M3',
    cau: { t: 'Tam giác ABC vuông tại A có góc B = 35°. Tìm góc C.', tra: false },
  },
  {
    id: '08-c5-b13-m1',
    tieuDe: '8. C5-B13-M1 (Q1) — Đường tròn đường kính 10 cm',
    kuId: 'C5-B13-M1',
    cau: { t: 'Đường tròn có đường kính 10 cm. Bán kính bằng bao nhiêu cm?', tra: false },
  },
  {
    id: '09-c5-b14-m3',
    tieuDe: '9. C5-B14-M3 (Q4) — Cung nhỏ AB = 100°, tìm cung lớn',
    kuId: 'C5-B14-M3',
    cau: { t: 'Cung nhỏ AB bằng 100°. Cung lớn AB bằng bao nhiêu độ?', tra: false },
  },
  {
    id: '10-c5-b16-m2',
    tieuDe: '10. C5-B16-M2 (Q1) — Tiếp tuyến OA = 3, OM = 5',
    kuId: 'C5-B16-M2',
    cau: { t: 'OA = 3, OM = 5. Tính AM.', tra: false },
  },
];

export default function XemHinhClient() {
  return (
    <main style={{ maxWidth: 440, margin: '0 auto', padding: '12px 10px 40px', background: '#f8fafc' }}>
      <h1 style={{ fontSize: 18, margin: '0 0 12px', color: '#1e293b' }}>
        Xem thử 10 hình trò chơi mới C1–C5
      </h1>

      <section id="tro-choi-that" style={{ marginBottom: 18 }}>
        <TroChoiNen kuId="C4-B11-M1" />
      </section>

      {MAU_KIEM_TRA.map((m) => (
        <section key={m.id} id={m.id} className="tcn" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14.5, margin: '0 0 6px', color: '#334155' }}>{m.tieuDe}</h2>
          <div className="tcn-bo">
            <div className="tcn-bo__hinh">
              <HinhNen kuId={m.kuId} cau={m.cau ?? null} />
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
