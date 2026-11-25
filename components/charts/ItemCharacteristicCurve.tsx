'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/dfle/irt.js
 */
import { useState } from 'react';
import { raschProbability, itemInformation } from '@/lib/dfle/irt.js';

interface ItemData {
  id: string;
  b: number;
  label: string;
  pValue: number;
  total: number;
}

interface Props {
  items: ItemData[];
}

/**
 * Component React `ItemCharacteristicCurve`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function ItemCharacteristicCurve({ items }: Props) {
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id ?? '');

  const activeItem = items.find((it) => it.id === selectedId) ?? items[0];
  if (!activeItem) return null;

  // Tọa độ SVG: viewBox 0 0 500 240
  // Trục X: theta in [-3, 3] -> svgX in [50, 470]
  // Trục Y: P in [0, 1] -> svgY in [200, 20]
  const svgX = (theta: number) => 50 + ((theta + 3) / 6) * 420;
  const svgY = (p: number) => 200 - p * 180;

  // Tạo đường cong ICC: 61 điểm từ -3 đến +3 bước 0.1
  const points: [number, number][] = [];
  for (let t = -3; t <= 3.01; t += 0.1) {
    const p = raschProbability(t, activeItem.b);
    points.push([svgX(t), svgY(p)]);
  }
  const pathD = points.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ');

  // Đường cong lượng thông tin I(theta) (nhân 4 để hiển thị tỉ lệ đẹp cùng đồ thị)
  const infoPoints: [number, number][] = [];
  for (let t = -3; t <= 3.01; t += 0.1) {
    const info = itemInformation(t, activeItem.b); // max 0.25 -> nhân 4 bằng 1.0
    infoPoints.push([svgX(t), svgY(info * 3.5)]);
  }
  const infoPathD = infoPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ');

  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  const bX = svgX(Math.max(-3, Math.min(3, activeItem.b)));
  const bY = svgY(0.5);

  return (
    <div style={{ padding: '16px 20px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--navy-d)' }}>
            Đường cong đặc trưng câu hỏi (Item Characteristic Curve - ICC)
          </h3>
          <p className="hint" style={{ margin: 0, fontSize: 13 }}>
            Mô hình Rasch mô tả xác suất làm đúng $P(\theta)$ theo năng lực tiềm ẩn $\theta$ của học sinh
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label htmlFor="select-item" style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Chọn câu hỏi:</label>
          <select
            id="select-item"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
          >
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.id} (Độ khó b = {it.b > 0 ? '+' : ''}{it.b.toFixed(2)} · {it.label})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Đồ thị SVG */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: 650, height: 'auto', display: 'block', margin: '0 auto' }}>
          {/* Lưới tọa độ ngang */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((p) => {
            const y = svgY(p);
            return (
              <g key={p}>
                <line x1={50} y1={y} x2={470} y2={y} stroke="var(--line)" strokeDasharray={p === 0.5 ? '4 3' : undefined} />
                <text x={42} y={y + 4} textAnchor="end" fontSize={11} fill="var(--muted)">{p}</text>
              </g>
            );
          })}

          {/* Lưới tọa độ dọc trục theta */}
          {[-3, -2, -1, 0, 1, 2, 3].map((theta) => {
            const x = svgX(theta);
            return (
              <g key={theta}>
                <line x1={x} y1={20} x2={x} y2={200} stroke="var(--line)" />
                <text x={x} y={218} textAnchor="middle" fontSize={11} fill="var(--muted)">
                  {theta > 0 ? `+${theta}` : theta}
                </text>
              </g>
            );
          })}

          {/* Nhãn trục */}
          <text x={260} y={236} textAnchor="middle" fontSize={11.5} fontWeight={600} fill="var(--navy-d)">
            Năng lực học sinh (&theta; - logit)
          </text>
          <text x={18} y={110} textAnchor="middle" fontSize={11.5} fontWeight={600} fill="var(--navy-d)" transform="rotate(-90 18 110)">
            Xác suất P(đúng)
          </text>

          {/* Đường cong lượng thông tin I(theta) nét đứt màu cam */}
          <path d={infoPathD} fill="none" stroke="var(--accent)" strokeWidth={1.8} strokeDasharray="3 3" opacity={0.8} />

          {/* Đường cong ICC màu xanh navy */}
          <path d={pathD} fill="none" stroke="var(--navy)" strokeWidth={2.8} />

          {/* Điểm độ khó b tại P = 0.5 */}
          <line x1={bX} y1={bY} x2={bX} y2={200} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={bX} cy={bY} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />

          <text x={Math.min(440, Math.max(70, bX))} y={bY - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="#ef4444">
            Điểm uốn b = {activeItem.b > 0 ? '+' : ''}{activeItem.b.toFixed(2)} (P = 50%)
          </text>
        </svg>
      </div>

      {/* Chú giải đồ thị */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 12.5, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 3, background: 'var(--navy)', borderRadius: 2 }} />
          Đường cong đặc trưng Rasch (P)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 2, background: 'var(--accent)', borderTop: '2px dashed var(--accent)' }} />
          Lượng thông tin đo lường I(&theta;)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          Độ khó thực nghiệm b (tại điểm 50%)
        </span>
      </div>
    </div>
  );
}
