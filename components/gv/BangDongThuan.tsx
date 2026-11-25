'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useMemo, useState } from 'react';

export type HocSinhDongThuan = {
  student_id: string;
  class_id: string;
  display_name: string;
  consent_status: string;
};

type TrangThaiChon = 'chua' | 'dong-y' | 'tu-choi';

const LUA_CHON: { val: TrangThaiChon; nhan: string; cls: string }[] = [
  { val: 'chua', nhan: 'Chưa', cls: 'dt-nut--chua' },
  { val: 'dong-y', nhan: 'Đã đồng ý', cls: 'dt-nut--dong-y' },
  { val: 'tu-choi', nhan: 'Từ chối', cls: 'dt-nut--tu-choi' },
];

/**
 * Component React `BangDongThuan`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function BangDongThuan({
  students: initialStudents,
  tenLopCua,
  quyenSuaTheoLop,
  lopDangChon,
}: {
  students: HocSinhDongThuan[];
  tenLopCua: Record<string, string>;
  quyenSuaTheoLop: Record<string, boolean>;
  lopDangChon: string | null;
}) {
  const [rows, setRows] = useState<HocSinhDongThuan[]>(initialStudents);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const [busyLop, setBusyLop] = useState(false);
  const [hienXacNhan, setHienXacNhan] = useState(false);
  const [thongBao, setThongBao] = useState<{ ok: boolean; text: string } | null>(null);

  const distinctClasses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.class_id).filter(Boolean))),
    [rows]
  );
  const lopMucTieu = lopDangChon ?? (distinctClasses.length === 1 ? distinctClasses[0] : null);
  const coQuyenLopMucTieu = lopMucTieu ? quyenSuaTheoLop[lopMucTieu] !== false : false;
  const dsLopMucTieu = useMemo(
    () => (lopMucTieu ? rows.filter((r) => r.class_id === lopMucTieu) : []),
    [rows, lopMucTieu]
  );
  const daDongYCount = useMemo(
    () => rows.filter((r) => r.consent_status === 'dong-y').length,
    [rows]
  );

  async function doiMotEm(student: HocSinhDongThuan, nextStatus: TrangThaiChon) {
    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    if (student.consent_status === nextStatus || busyIds[student.student_id]) return;
    if (quyenSuaTheoLop[student.class_id] === false) return;

    // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
    const prevStatus = student.consent_status;
    setThongBao(null);
    setBusyIds((p) => ({ ...p, [student.student_id]: true }));
    setRows((p) =>
      p.map((r) => (r.student_id === student.student_id ? { ...r, consent_status: nextStatus } : r))
    );

    try {
      const res = await fetch('/api/gv/dong-thuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lop: student.class_id,
          ds: [{ student_id: student.student_id, consent_status: nextStatus }],
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Không cập nhật được trạng thái đồng thuận.');
      setThongBao({
        ok: true,
        text: `Đã cập nhật đồng thuận cho ${student.display_name} (${student.student_id}).`,
      });
    } catch (e: any) {
      setRows((p) =>
        p.map((r) => (r.student_id === student.student_id ? { ...r, consent_status: prevStatus } : r))
      );
      setThongBao({ ok: false, text: e?.message || 'Lỗi cập nhật đồng thuận.' });
    } finally {
      setBusyIds((p) => ({ ...p, [student.student_id]: false }));
    }
  }

  async function danhDauCaLopDongY() {
    if (!lopMucTieu || !coQuyenLopMucTieu || !dsLopMucTieu.length || busyLop) return;
    const prevRows = rows;
    setBusyLop(true);
    setThongBao(null);

    const payloadDs = dsLopMucTieu.map((r) => ({
      student_id: r.student_id,
      consent_status: 'dong-y' as const,
    }));

    setRows((p) =>
      p.map((r) => (r.class_id === lopMucTieu ? { ...r, consent_status: 'dong-y' } : r))
    );

    try {
      const res = await fetch('/api/gv/dong-thuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lop: lopMucTieu, ds: payloadDs }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Không đánh dấu được cả lớp.');
      setHienXacNhan(false);
      setThongBao({
        ok: true,
        text: `Đã đánh dấu cả lớp ${tenLopCua[lopMucTieu] ?? lopMucTieu} (${dsLopMucTieu.length} học sinh) đã đồng ý.`,
      });
    } catch (e: any) {
      setRows(prevRows);
      setThongBao({ ok: false, text: e?.message || 'Lỗi khi đánh dấu cả lớp.' });
    } finally {
      setBusyLop(false);
    }
  }

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 2px' }}>Danh sách hiện có ({rows.length})</h2>
          <p className="hint" style={{ margin: 0 }}>
            Đã đồng ý: <b>{daDongYCount}/{rows.length}</b> học sinh (dùng được chấm vở AI &amp; đưa vào thống kê nghiên cứu).
          </p>
        </div>

        {lopMucTieu && coQuyenLopMucTieu && dsLopMucTieu.length > 0 && (
          <button
            type="button"
            className="primary"
            disabled={busyLop}
            onClick={() => {
              setThongBao(null);
              setHienXacNhan(true);
            }}
          >
            ✓ Đánh dấu cả lớp đã đồng ý
          </button>
        )}
      </div>

      {!lopMucTieu && rows.length > 0 && (
        <p className="hint" style={{ marginTop: 0 }}>
          Chọn một lớp ở thanh chọn lớp phía trên nếu thầy cô muốn dùng nút &ldquo;Đánh dấu cả lớp đã đồng ý&rdquo;.
        </p>
      )}

      {hienXacNhan && lopMucTieu && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Xác nhận đánh dấu cả lớp đã đồng ý"
          style={{
            marginBottom: 14,
            padding: '12px 14px',
            borderRadius: 12,
            border: '2px solid #f59e0b',
            background: '#fffbeb',
          }}
        >
          <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#92400e' }}>
            ⚠️ Chỉ bấm khi đã thu đủ phiếu đồng ý có chữ ký phụ huynh
          </p>
          <p className="hint" style={{ margin: '0 0 10px' }}>
            Thao tác này sẽ chuyển toàn bộ {dsLopMucTieu.length} học sinh của lớp{' '}
            <b>{tenLopCua[lopMucTieu] ?? lopMucTieu}</b> sang trạng thái <b>Đã đồng ý</b>.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              className="primary"
              disabled={busyLop}
              onClick={danhDauCaLopDongY}
            >
              {busyLop ? 'Đang cập nhật…' : 'Xác nhận đánh dấu cả lớp đã đồng ý'}
            </button>
            <button
              type="button"
              disabled={busyLop}
              onClick={() => setHienXacNhan(false)}
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {thongBao && (
        <p
          role="status"
          style={{
            margin: '0 0 10px',
            padding: '8px 12px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13.5,
            background: thongBao.ok ? '#eaf8ef' : '#fff1f0',
            color: thongBao.ok ? '#14532d' : '#b3261e',
            border: `1px solid ${thongBao.ok ? '#9fd6b5' : '#f3b4ad'}`,
          }}
        >
          {thongBao.text}
        </p>
      )}

      <div className="scroll">
        {/* Khối giao diện: Bảng số liệu tổng hợp */}
        <table>
          <thead>
            <tr>
              <th>Mã học sinh</th>
              <th>Tên hiển thị</th>
              <th>Lớp</th>
              <th>Đồng thuận</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const coQuyen = quyenSuaTheoLop[s.class_id] !== false;
              const dangLuu = !!busyIds[s.student_id] || busyLop;
              return (
                <tr key={s.student_id}>
                  <td>
                    <code>{s.student_id}</code>
                  </td>
                  <td>{s.display_name}</td>
                  <td>{tenLopCua[s.class_id] ?? s.class_id}</td>
                  <td>
                    <div
                      role="group"
                      aria-label={`Đồng thuận của ${s.display_name}`}
                      style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}
                    >
                      {LUA_CHON.map((opt) => {
                        // Kiểm tra xác thực tài khoản, vai trò giáo viên hoặc điều kiện đồng ý
                        const active = s.consent_status === opt.val;
                        const bg =
                          active && opt.val === 'dong-y'
                            ? '#16a34a'
                            : active && opt.val === 'tu-choi'
                              ? '#dc2626'
                              : active
                                ? '#2b4ba8'
                                : '#fff';
                        const color = active ? '#fff' : '#334155';
                        const border =
                          active && opt.val === 'dong-y'
                            ? '#15803d'
                            : active && opt.val === 'tu-choi'
                              ? '#b91c1c'
                              : active
                                ? '#1e3a8a'
                                : '#cbd5e1';
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            aria-pressed={active}
                            disabled={!coQuyen || dangLuu}
                            onClick={() => doiMotEm(s, opt.val)}
                            style={{
                              padding: '5px 10px',
                              minHeight: 34,
                              borderRadius: 8,
                              fontSize: 12.5,
                              fontWeight: active ? 700 : 600,
                              background: bg,
                              color,
                              border: `1.5px solid ${border}`,
                              whiteSpace: 'nowrap',
                              opacity: !coQuyen ? 0.6 : 1,
                            }}
                          >
                            {opt.nhan}
                          </button>
                        );
                      })}
                      {s.consent_status === 'rut-lui' && (
                        <span className="tag warn">Rút lui</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={4} className="hint">
                  Chưa có học sinh nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
