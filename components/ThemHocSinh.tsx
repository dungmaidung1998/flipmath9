'use client';
/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import { useState } from 'react';

type Cls = { class_id: string; class_code: string; arm: string };

/**
 * Component React `ThemHocSinh`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function ThemHocSinh({ classes }: { classes: Cls[] }) {
  const [classId, setClassId] = useState(classes[0]?.class_id ?? '');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setMsg(null);
    const students = text
      .split('\n').map((l) => l.trim()).filter(Boolean)
      .map((line) => {
        const [studentCode, password, displayName] = line.split(',').map((x) => (x ?? '').trim());
        return { studentCode, password, displayName };
      });

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId, students })
    });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) { setMsg(d.error ?? 'Không tạo được'); return; }
    setMsg(
      `Đã tạo ${d.created.length} tài khoản.` +
      (d.failed.length ? ` Lỗi ${d.failed.length}: ` + d.failed.map((f: any) => `${f.code} (${f.reason})`).join('; ') : '')
    );
    if (d.created.length) setText('');
  }

  return (
    <div className="card">
      <h2>Tạo tài khoản hàng loạt</h2>
      <label htmlFor="cls">Lớp</label>
      <select id="cls" value={classId} onChange={(e) => setClassId(e.target.value)}>
        {classes.map((c) => <option key={c.class_id} value={c.class_id}>{c.class_code} ({c.arm})</option>)}
      </select>

      <label htmlFor="ds">Danh sách — mỗi dòng một học sinh: <code>mã học sinh, mật khẩu, tên hiển thị</code></label>
      <textarea
        id="ds" rows={7} value={text} onChange={(e) => setText(e.target.value)}
        placeholder={'hs001, matkhau123, Học sinh 01\nhs002, matkhau456, Học sinh 02'}
        style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13.5 }}
      />
      <p className="hint" style={{ marginTop: 6 }}>
        Mã học sinh nên là <strong>mã nghiên cứu</strong>, không phải họ tên. Mật khẩu tối thiểu 6 ký tự;
        in ra phát riêng cho từng em, nhắc các em đổi nếu hệ thống cho phép.
      </p>
      <button className="primary" onClick={submit} disabled={busy || !classId || !text.trim()} style={{ marginTop: 12 }}>
        {busy ? 'Đang tạo…' : 'Tạo tài khoản'}
      </button>
      {msg && <p className="err" style={{ color: 'var(--ink)' }}>{msg}</p>}
    </div>
  );
}
