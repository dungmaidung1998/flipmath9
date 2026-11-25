'use client';

/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import React, { useMemo, useState } from 'react';
import './prerequisite-graph.css';

export interface GraphNode {
  id: string;
  name: string;
  prerequisite: string | null;
  mastery: number | null;
  isGap?: boolean;
}

interface Props {
  nodes: GraphNode[];
  activeKu?: string;
  onSelectNode?: (kuId: string) => void;
  /** Thu gọn thành một dòng bấm mở (trang học sinh), đỡ dài trên điện thoại. */
  thuGon?: boolean;
}

type TrangThai = 'gap' | 'vung' | 'dang' | 'chua';
type Nut = GraphNode & { trangThai: TrangThai };

const LA_MA = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const tenChuong = (ma: string) => {
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  const so = Number(ma.replace(/\D/g, ''));
  return `Chương ${LA_MA[so] ?? so}`;
};
/** "C3-B9-M2B" → "Bài 9"; "C3-LTC" → "Luyện tập chung" (giáo viên không cần đọc mã mục). */
const tenBai = (ma: string) => { const b = ma.match(/-B(\d+)-/); return b ? `Bài ${b[1]}` : /LTC/.test(ma) ? 'Luyện tập chung' : ''; };
const TEN_TRANG_THAI: Record<TrangThai, string> = { gap: 'Hổng kiến thức trước', vung: 'Nắm chắc', dang: 'Đang lên', chua: 'Chưa có dữ liệu' };

/**
 * Đồ thị kiến thức tiên quyết, xếp DỌC theo thứ tự bài học, tên mục hiện đủ (tự xuống dòng).
 * Mũi tên ↓ nối hai mục khi mục trên là tiên quyết trực tiếp của mục dưới; mục nối từ xa (rẽ nhánh,
 * mạch kiến thức khác trong chương) ghi rõ "Cần trước: …".
 * Nhiều chương (trang phân tích lớp): mỗi chương gập/mở được; mở sẵn chương đang xem.
 */
export default function PrerequisiteGraph({ nodes, activeKu, onSelectNode, thuGon }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const chuong = useMemo(() => {
    const theoMa = new Map(nodes.map((n) => [n.id, n]));
    const trangThai = (n: GraphNode): TrangThai => {
      const mp = n.prerequisite ? theoMa.get(n.prerequisite)?.mastery ?? null : null;
      // Lỗ hổng tiên quyết: mục tiên quyết ở mức 0 trong khi mục này đã có tương tác (hoặc đang xem)
      if (n.isGap || (mp === 0 && (n.mastery !== null || n.id === activeKu))) return 'gap';
      if (n.mastery !== null && n.mastery >= 2) return 'vung';
      if (n.mastery === 1) return 'dang';
      return 'chua';
    };
    const nhom = new Map<string, Nut[]>();
    for (const n of nodes) {
      const c = n.id.split('-')[0];
      const ds = nhom.get(c) ?? [];
      ds.push({ ...n, trangThai: trangThai(n) });
      nhom.set(c, ds);
    }
    return Array.from(nhom, ([ma, ds]) => ({
      ma, ds, coDuLieu: ds.some((n) => n.mastery !== null), coActive: ds.some((n) => n.id === activeKu)
    }));
  }, [nodes, activeKu]);
  const tenMuc = useMemo(() => new Map(nodes.map((n) => [n.id, n.name])), [nodes]);

  const mo = (n: Nut) => {
    if (onSelectNode) onSelectNode(n.id);
    else window.location.href = `/hoc/${encodeURIComponent(n.id)}`;
  };

  const veChuong = (c: (typeof chuong)[number]) => (
    <ol className="ptq-cot" aria-label={`Thứ tự học ${tenChuong(c.ma)}`}>
      {c.ds.map((n, i) => {
        const noiTiep = i > 0 && n.prerequisite === c.ds[i - 1].id;
        const ghiTruoc = n.prerequisite && !noiTiep;
        const sang = hovered !== null && (hovered === n.id || hovered === n.prerequisite);
        return (
          <li key={n.id} className="ptq-tang">
            {i > 0 && (noiTiep ? <span className="ptq-mui" aria-hidden="true" /> : <span className="ptq-cach" aria-hidden="true" />)}
            <button
              type="button"
              className={`ptq-nut ptq-nut--${n.trangThai}${n.id === activeKu ? ' ptq-nut--dang-xem' : ''}${sang ? ' ptq-nut--sang' : ''}`}
              onClick={() => mo(n)}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(n.id)}
              onBlur={() => setHovered(null)}
              aria-label={`${tenBai(n.id)}. ${n.name}. ${TEN_TRANG_THAI[n.trangThai]}${n.prerequisite ? `. Cần học trước: ${tenMuc.get(n.prerequisite) ?? ''}` : ''}`}
            >
              <span className="ptq-nut__so" aria-hidden="true">{{ vung: '✅', dang: '🌱', gap: '⚠️', chua: i + 1 }[n.trangThai as 'vung'] ?? i + 1}</span>
              <span className="ptq-nut__dau">
                <span className="ptq-nut__ma" title={n.id}>📘 {tenBai(n.id)}</span>
                <span className={'ptq-nhan ptq-nhan--' + n.trangThai}>{{ vung: 'Nắm chắc', dang: 'Đang lên', gap: 'Hổng nền', chua: 'Chưa học' }[n.trangThai as 'vung'] ?? ''}</span>
              </span>
              <span className="ptq-nut__ten">{n.name}</span>
              {ghiTruoc && <span className="ptq-nut__truoc">↳ Cần học trước: <b>{tenBai(n.prerequisite!)}</b>{tenMuc.get(n.prerequisite!) ? ` · ${tenMuc.get(n.prerequisite!)}` : ''}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );

  // Nhiều chương: mở sẵn chương đang xem; không có thì chương có dữ liệu cuối cùng; không có nữa thì chương đầu.
  const chuongMo = chuong.find((c) => c.coActive)?.ma ?? [...chuong].reverse().find((c) => c.coDuLieu)?.ma ?? chuong[0]?.ma;

  return (
    <Vo thuGon={thuGon}>
      {thuGon
        ? <summary className="ptq__tieu-de ptq__mo"><span aria-hidden="true">🧩</span> Đồ thị kiến thức tiên quyết <span className="hint">· bấm để xem</span></summary>
        : <h2 className="ptq__tieu-de"><span aria-hidden="true">🧩</span> Đồ thị kiến thức tiên quyết</h2>}
      <p className="hint ptq__mo-ta">Đọc từ trên xuống: mục ở trên cần học trước mục ở dưới. Mục trước chưa vững thì mục sau dễ hổng.</p>

      {chuong.length === 1 ? (
        <div className="ptq__mot-chuong">{veChuong(chuong[0])}</div>
      ) : (
        <div className="ptq__nhieu-chuong">
          {chuong.map((c) => (
            <details key={c.ma} className="ptq-chuong" open={c.ma === chuongMo}>
              <summary>
                {tenChuong(c.ma)}
                <span className="hint"> · {c.ds.length} mục</span>
              </summary>
              {veChuong(c)}
            </details>
          ))}
        </div>
      )}

      <div className="ptq-chu-giai">
        <span className="ptq-chu-giai__nhan">Chú giải:</span>
        <span><i className="ptq-cham ptq-cham--vung" /> Nắm chắc</span>
        <span><i className="ptq-cham ptq-cham--dang" /> Đang lên</span>
        <span><i className="ptq-cham ptq-cham--gap" /> Hổng kiến thức trước</span>
        <span><i className="ptq-cham ptq-cham--chua" /> Chưa có dữ liệu</span>
      </div>
    </Vo>
  );
}

/**
 * Component React `Vo`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
function Vo({ thuGon, children }: { thuGon?: boolean; children: React.ReactNode }) {
  return thuGon
    ? <details className="card ptq ptq--gon">{children}</details>
    : <div className="card ptq" style={{ marginTop: 20 }}>{children}</div>;
}
