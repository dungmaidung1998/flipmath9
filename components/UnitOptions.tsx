/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/chapters
 */
import { CHAPTERS, chapterOf } from '@/lib/chapters';

/** Danh sách <option> đơn vị kiến thức, gom theo chương bằng <optgroup>. */
export default function UnitOptions({ units }: { units: { ku_id: string; ku_name: string }[] }) {
  const nhom = CHAPTERS.map((c) => ({ c, ds: units.filter((u) => chapterOf(u.ku_id) === c.id) })).filter((g) => g.ds.length);
  const khac = units.filter((u) => !chapterOf(u.ku_id));
  return (
    <>
      {nhom.map(({ c, ds }) => (
        <optgroup key={c.id} label={`${c.label}. ${c.title.charAt(0)}${c.title.slice(1).toLowerCase()}`}>
          {ds.map((u) => <option key={u.ku_id} value={u.ku_id}>{u.ku_name}</option>)}
        </optgroup>
      ))}
      {khac.map((u) => <option key={u.ku_id} value={u.ku_id}>{u.ku_name}</option>)}
    </>
  );
}
