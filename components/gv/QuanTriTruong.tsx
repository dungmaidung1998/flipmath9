'use client';

/**
 * FILE NÀY LÀM GÌ: Component React phía trình duyệt phục vụ bảng điều khiển, biểu đồ và biểu mẫu thao tác cho giáo viên.
 * AI DÙNG: giáo viên
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/gv/lopCuaToi
 */
import { useState } from 'react';
import { nhanTruongLop, tenHienThiLop, type LopCuaToi } from '@/lib/gv/lopCuaToi';

type Truong = { school_id: string; ten: string; tinh?: string | null };
type GiaoVien = { id: string; full_name: string | null; role: string; school_id: string | null };
type PhanCong = { class_id: string; teacher_id: string; vai_tro: string; ten_gv: string };

const VAI_TRO_TEN: Record<string, string> = {
  'bo-mon': 'Bộ môn',
  'chu-nhiem': 'Chủ nhiệm',
  'du-gio': 'Dự giờ'
};

/**
 * Component React `QuanTriTruong`: nhận props (thuộc tính truyền vào từ component cha) và dựng giao diện tương ứng.
 */
export default function QuanTriTruong({
  lops,
  truongs,
  giaoViens,
  phanCong,
  laHeThong,
  schoolIdMacDinh
}: {
  lops: LopCuaToi[];
  truongs: Truong[];
  giaoViens: GiaoVien[];
  phanCong: PhanCong[];
  laHeThong: boolean;
  schoolIdMacDinh: string;
}) {
  const [tenLop, setTenLop] = useState('');
  const [classCode, setClassCode] = useState('');
  const [grade, setGrade] = useState(9);
  const [arm, setArm] = useState('TN');
  const [schoolId, setSchoolId] = useState(schoolIdMacDinh || truongs[0]?.school_id || 'NPH');
  const [baoTao, setBaoTao] = useState('');
  const [dangTao, setDangTao] = useState(false);

  const [chonLopId, setChonLopId] = useState(lops[0]?.class_id ?? '');
  const [teacherId, setTeacherId] = useState(giaoViens[0]?.id ?? '');
  const [emailGV, setEmailGV] = useState('');
  const [vaiTro, setVaiTro] = useState('bo-mon');
  const [baoGan, setBaoGan] = useState('');
  const [dangGan, setDangGan] = useState(false);

  const taoLop = async (e: React.FormEvent) => {
    e.preventDefault();
    setDangTao(true);
    setBaoTao('');
    try {
      const r = await fetch('/api/quan-tri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tao-lop',
          ten_lop: tenLop,
          class_code: classCode,
          grade,
          arm,
          school_id: schoolId
        })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Chưa tạo được lớp.');
      setBaoTao(`✓ Đã tạo lớp ${d.lop.ten_lop} (${d.lop.class_code}). Đang tải lại…`);
      window.location.reload();
    } catch (err: any) {
      setBaoTao(err?.message ?? 'Không tạo được lớp.');
    } finally {
      setDangTao(false);
    }
  };

  const ganGV = async (e: React.FormEvent) => {
    e.preventDefault();
    setDangGan(true);
    setBaoGan('');
    try {
      const r = await fetch('/api/quan-tri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'gan-gv',
          class_id: chonLopId,
          teacher_id: emailGV.trim() ? '' : teacherId,
          email: emailGV.trim(),
          vai_tro: vaiTro
        })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Chưa gán được giáo viên.');
      setBaoGan('✓ Đã gán giáo viên vào lớp. Đang tải lại…');
      window.location.reload();
    } catch (err: any) {
      setBaoGan(err?.message ?? 'Không gán được giáo viên.');
    } finally {
      setDangGan(false);
    }
  };

  const goGV = async (classId: string, tid: string) => {
    if (!window.confirm('Gỡ giáo viên này khỏi lớp?')) return;
    const r = await fetch('/api/quan-tri', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'go-gv', class_id: classId, teacher_id: tid })
    });
    if (r.ok) window.location.reload();
    else {
      const d = await r.json().catch(() => ({}));
      window.alert(d.error ?? 'Chưa gỡ được.');
    }
  };

  return (
    <>
      <div className="qt-luoi">
        {/* Khối giao diện: Khối nội dung chính */}
        <section className="mc-khoi">
          <h2>➕ Tạo lớp mới</h2>
          {/* Khối giao diện: Biểu mẫu nhập liệu */}
          <form className="qt-form" onSubmit={taoLop}>
            {laHeThong && truongs.length > 0 && (
              <label>
                Trường
                <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
                  {truongs.map((t) => (
                    <option key={t.school_id} value={t.school_id}>{t.ten} ({t.school_id})</option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Tên lớp hiển thị
              <input
                value={tenLop}
                onChange={(e) => setTenLop(e.target.value)}
                placeholder="9/3"
                required
              />
            </label>
            <label>
              Mã lớp khi đăng nhập (không dấu, không khoảng trắng)
              <input
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="9A3"
                pattern="[A-Za-z0-9_-]{2,24}"
                required
              />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label>
                Khối
                <input
                  type="number"
                  min={6}
                  max={12}
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  required
                />
              </label>
              <label>
                Nhóm lớp
                <select value={arm} onChange={(e) => setArm(e.target.value)}>
                  <option value="TN">Thực nghiệm (TN)</option>
                  <option value="DC">Đối chứng (DC)</option>
                  <option value="DEMO">Lớp mẫu (DEMO)</option>
                </select>
              </label>
            </div>
            <button type="submit" className="chinh" disabled={dangTao}>
              {dangTao ? 'Đang tạo…' : 'Tạo lớp'}
            </button>
            {baoTao && <p role="status" className="mc-ghi">{baoTao}</p>}
          </form>
        </section>

        {/* Khối giao diện: Khối nội dung chính */}
        <section className="mc-khoi">
          <h2>👩‍🏫 Gán giáo viên vào lớp</h2>
          {/* Khối giao diện: Biểu mẫu nhập liệu */}
          <form className="qt-form" onSubmit={ganGV}>
            <label>
              Chọn lớp
              <select value={chonLopId} onChange={(e) => setChonLopId(e.target.value)} required>
                {lops.map((l) => (
                  <option key={l.class_id} value={l.class_id}>{nhanTruongLop(l)}</option>
                ))}
              </select>
            </label>
            <label>
              Giáo viên trong trường
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                <option value="">-- Hoặc nhập email bên dưới --</option>
                {giaoViens.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.full_name || g.id.slice(0, 8)} ({g.role})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Hoặc nhập email tài khoản giáo viên
              <input
                type="email"
                value={emailGV}
                onChange={(e) => setEmailGV(e.target.value)}
                placeholder="giaovien@truong.edu.vn (nếu không chọn ở trên)"
              />
            </label>
            <label>
              Vai trò trong lớp
              <select value={vaiTro} onChange={(e) => setVaiTro(e.target.value)}>
                <option value="bo-mon">Giáo viên bộ môn</option>
                <option value="chu-nhiem">Giáo viên chủ nhiệm</option>
                <option value="du-gio">Dự giờ / Tổ trưởng</option>
              </select>
            </label>
            <button type="submit" className="chinh" disabled={dangGan || !lops.length}>
              {dangGan ? 'Đang lưu…' : 'Gán giáo viên'}
            </button>
            {baoGan && <p role="status" className="mc-ghi">{baoGan}</p>}
          </form>
        </section>
      </div>

      {/* Khối giao diện: Khối nội dung chính */}
      <section className="mc-khoi">
        <h2>📋 Danh sách lớp & phân công giáo viên ({lops.length} lớp)</h2>
        <div className="scroll">
          {/* Khối giao diện: Bảng số liệu tổng hợp */}
          <table>
            <thead>
              <tr>
                <th>Lớp</th>
                <th>Mã đăng nhập</th>
                <th>Khối</th>
                <th>Trường</th>
                <th>Giáo viên phụ trách</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lops.map((l) => {
                const dsGV = phanCong.filter((p) => p.class_id === l.class_id);
                return (
                  <tr key={l.class_id}>
                    <th scope="row">{tenHienThiLop(l)}</th>
                    <td><code>{l.class_code}</code></td>
                    <td>{l.grade ?? '—'}</td>
                    <td>{l.ten_truong ?? l.school_id ?? '—'}</td>
                    <td>
                      {dsGV.length ? (
                        dsGV.map((p) => (
                          <span className="qt-gv-chip" key={`${p.class_id}-${p.teacher_id}`}>
                            <span>{p.ten_gv} · <small>{VAI_TRO_TEN[p.vai_tro] ?? p.vai_tro}</small></span>
                            <button
                              type="button"
                              aria-label={`Gỡ ${p.ten_gv} khỏi ${tenHienThiLop(l)}`}
                              onClick={() => goGV(p.class_id, p.teacher_id)}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="mc-ghi">Chưa phân công</span>
                      )}
                    </td>
                    <td className="n">
                      <a href={`/gv?lop=${encodeURIComponent(l.class_id)}`}>Xem lớp →</a>
                    </td>
                  </tr>
                );
              })}
              {!lops.length && (
                <tr><td colSpan={6} className="mc-trong">Chưa có lớp nào trong trường.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
