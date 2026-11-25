/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: @/lib/latexSangChu, @/lib/tronPhuongAn
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { latexSangChu } from '@/lib/latexSangChu';
import { bam, tronPhuongAn } from '@/lib/tronPhuongAn';

export type MaTran4Muc = {
  1: number; // Nhận biết
  2: number; // Thông hiểu
  3: number; // Vận dụng
  4: number; // Vận dụng cao
};

export type PhuongAnDe = {
  option_key: string;
  option_text: string;
};

export type CauDeKiemTra = {
  question_id: string;
  ku_id: string;
  level: 1 | 2 | 3 | 4;
  stem: string;
  hinh?: unknown;
  expected_time_sec: number;
  trang_thai?: string | null;
  options: PhuongAnDe[];
  correct_option: string;
  error_map?: Record<string, string>;
};

export type DeKiemTraData = {
  id: string;
  class_id: string;
  chuong: string;
  ku_ids: string[];
  tieu_de: string;
  thoi_gian_phut: number;
  ma_tran: MaTran4Muc;
  cau_hoi: CauDeKiemTra[];
  cho_lam_thu: boolean;
  canh_bao: string | null;
  tao_luc: string;
};

export type CauTrongMaDe = {
  stt: number;
  question_id: string;
  ku_id: string;
  level: number;
  stem: string;
  options: { nhan: string; option_key: string; option_text: string }[];
  dapAnDung: string; // 'A' | 'B' | 'C' | 'D'
};

export type MaDeXao = {
  maDe: string;
  cau: CauTrongMaDe[];
};

export const TEN_MUC_DO: Record<number, string> = {
  1: 'Nhận biết',
  2: 'Thông hiểu',
  3: 'Vận dụng',
  4: 'Vận dụng cao',
};

/**
 * Hàm `xaoThuTu`: nhận (ds, seed), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
function xaoThuTu<T>(ds: T[], seed: string): T[] {
  return [...ds]
    .map((item, idx) => ({ item, k: bam(`${seed}|${idx}`) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.item);
}

/** Sinh 2 mã đề (101 và 102) có xáo thứ tự câu trong từng mức và xáo phương án A/B/C/D. */
export function xaoThanhHaiMaDe(cauHoi: CauDeKiemTra[], seed: string): [MaDeXao, MaDeXao] {
  const taoMotMa = (maDe: string): MaDeXao => {
    const theoMuc: CauDeKiemTra[] = [];
    for (const lv of [1, 2, 3, 4] as const) {
      const nhom = cauHoi.filter((c) => Number(c.level) === lv);
      theoMuc.push(...xaoThuTu(nhom, `${seed}|${maDe}|lv${lv}`));
    }
    const cau: CauTrongMaDe[] = theoMuc.map((q, i) => {
      const pa = tronPhuongAn(q.options ?? [], `${seed}|${maDe}`, q.question_id);
      const dung = pa.find((o) => o.option_key === q.correct_option)?.nhan ?? 'A';
      return {
        stt: i + 1,
        question_id: q.question_id,
        ku_id: q.ku_id,
        level: q.level,
        stem: q.stem,
        options: pa.map((o) => ({
          nhan: o.nhan,
          option_key: o.option_key,
          option_text: o.option_text,
        })),
        dapAnDung: dung,
      };
    });
    return { maDe, cau };
  };

  return [taoMotMa('101'), taoMotMa('102')];
}

const p = (
  text: string,
  o: { bold?: boolean; italic?: boolean; indent?: boolean; center?: boolean; size?: number; after?: number; before?: number } = {}
) =>
  new Paragraph({
    alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    indent: o.indent ? { left: 360 } : undefined,
    spacing: { before: o.before ?? 0, after: o.after ?? 70, line: 280 },
    children: [
      new TextRun({
        text,
        bold: o.bold,
        italics: o.italic,
        font: 'Times New Roman',
        size: o.size ?? 24,
      }),
    ],
  });

const cell = (text: string, opts: { bold?: boolean; center?: boolean; widthPct?: number } = {}) =>
  new TableCell({
    width: opts.widthPct ? { size: opts.widthPct, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text,
            bold: opts.bold,
            font: 'Times New Roman',
            size: 22,
          }),
        ],
      }),
    ],
  });

const BORDERS = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '555555' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '555555' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '555555' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '555555' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '888888' },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '888888' },
};

/** Tạo tệp Word (.docx) chứa: Ma trận 4 cấp độ + 2 mã đề (101, 102) + Đáp án. */
export async function taoFileWordDeKiemTra(input: {
  de: DeKiemTraData;
  tenLop: string;
  tenGV?: string | null;
  tenMucMap: Map<string, string>;
}): Promise<Buffer> {
  const { de, tenLop, tenGV, tenMucMap } = input;
  const [ma101, ma102] = xaoThanhHaiMaDe(de.cau_hoi, de.id || de.tieu_de);
  const tongCau = de.cau_hoi.length;
  const diemMoiCau = tongCau ? Math.round((10 / tongCau) * 100) / 100 : 0;

  // Bảng ma trận theo từng mục kiến thức
  const kuList = Array.from(new Set(de.cau_hoi.map((c) => c.ku_id)));
  const matrixRows: TableRow[] = [
    new TableRow({
      children: [
        cell('Mục kiến thức', { bold: true, widthPct: 40 }),
        cell('Nhận biết', { bold: true, center: true, widthPct: 12 }),
        cell('Thông hiểu', { bold: true, center: true, widthPct: 12 }),
        cell('Vận dụng', { bold: true, center: true, widthPct: 12 }),
        cell('VD cao', { bold: true, center: true, widthPct: 12 }),
        cell('Tổng', { bold: true, center: true, widthPct: 12 }),
      ],
    }),
  ];

  for (const ku of kuList) {
    const sub = de.cau_hoi.filter((c) => c.ku_id === ku);
    const n1 = sub.filter((c) => c.level === 1).length;
    const n2 = sub.filter((c) => c.level === 2).length;
    const n3 = sub.filter((c) => c.level === 3).length;
    const n4 = sub.filter((c) => c.level === 4).length;
    matrixRows.push(
      new TableRow({
        children: [
          cell(`${ku} · ${tenMucMap.get(ku) ?? ku}`),
          cell(String(n1), { center: true }),
          cell(String(n2), { center: true }),
          cell(String(n3), { center: true }),
          cell(String(n4), { center: true }),
          cell(String(sub.length), { bold: true, center: true }),
        ],
      })
    );
  }

  const tongTheoMuc = [1, 2, 3, 4].map((lv) => de.cau_hoi.filter((c) => c.level === lv).length);
  matrixRows.push(
    new TableRow({
      children: [
        cell('Tổng cộng (tỉ lệ %)', { bold: true }),
        ...tongTheoMuc.map((n) =>
          cell(`${n} (${tongCau ? Math.round((n * 100) / tongCau) : 0}%)`, { bold: true, center: true })
        ),
        cell(`${tongCau} (100%)`, { bold: true, center: true }),
      ],
    })
  );

  const renderDe = (ma: MaDeXao): (Paragraph | Table)[] => {
    const blocks: (Paragraph | Table)[] = [
      p(`Trường THCS ..............................        KIỂM TRA THƯỜNG XUYÊN TOÁN 9`, { bold: true }),
      p(`Lớp: ${tenLop} · Thời gian: ${de.thoi_gian_phut} phút`, { italic: true }),
      p(`${de.tieu_de.toUpperCase()} — MÃ ĐỀ ${ma.maDe}`, { bold: true, center: true, size: 28, before: 80 }),
      p('Họ và tên: ...................................................    Lớp: ..........', { after: 120 }),
    ];
    for (const q of ma.cau) {
      blocks.push(
        p(`Câu ${q.stt} (${TEN_MUC_DO[q.level] ?? `Mức ${q.level}`}): ${latexSangChu(q.stem)}`, {
          bold: false,
          before: 80,
          after: 40,
        })
      );
      const dongPA = q.options
        .map((o) => `${o.nhan}. ${latexSangChu(o.option_text)}`)
        .join('        ');
      blocks.push(p(dongPA, { indent: true, after: 60 }));
    }
    return blocks;
  };

  const renderBangDapAn = (ma: MaDeXao): Table => {
    const rows: TableRow[] = [
      new TableRow({
        children: [
          cell('Câu', { bold: true, center: true, widthPct: 12 }),
          cell('Mã mục', { bold: true, center: true, widthPct: 24 }),
          cell('Mức độ', { bold: true, center: true, widthPct: 28 }),
          cell(`Đáp án (Mã ${ma.maDe})`, { bold: true, center: true, widthPct: 20 }),
          cell('Điểm', { bold: true, center: true, widthPct: 16 }),
        ],
      }),
    ];
    for (const q of ma.cau) {
      rows.push(
        new TableRow({
          children: [
            cell(String(q.stt), { center: true }),
            cell(q.ku_id, { center: true }),
            cell(TEN_MUC_DO[q.level] ?? String(q.level), { center: true }),
            cell(q.dapAnDung, { bold: true, center: true }),
            cell(String(diemMoiCau), { center: true }),
          ],
        })
      );
    }
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: BORDERS,
      rows,
    });
  };

  const children: (Paragraph | Table)[] = [
    p(`MA TRẬN ĐỀ KIỂM TRA THƯỜNG XUYÊN (${de.chuong})`, { bold: true, center: true, size: 28 }),
    p(
      `Đề: ${de.tieu_de} · Lớp ${tenLop} · Thời gian ${de.thoi_gian_phut} phút · GV: ${tenGV || '..................'}`,
      { center: true, italic: true, after: 120 }
    ),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: BORDERS,
      rows: matrixRows,
    }),
    p(`Ghi chú: Tổng ${tongCau} câu trắc nghiệm (~${diemMoiCau} điểm/câu).` + (de.canh_bao ? ` Cảnh báo: ${de.canh_bao}` : ''), {
      italic: true,
      before: 100,
    }),
    new Paragraph({ children: [new PageBreak()] }),
    ...renderDe(ma101),
    new Paragraph({ children: [new PageBreak()] }),
    ...renderDe(ma102),
    new Paragraph({ children: [new PageBreak()] }),
    p(`ĐÁP ÁN & HƯỚNG DẪN CHẤM — ${de.tieu_de.toUpperCase()}`, { bold: true, center: true, size: 28, after: 120 }),
    p('1. Đáp án Mã đề 101', { bold: true, before: 60 }),
    renderBangDapAn(ma101),
    p('2. Đáp án Mã đề 102', { bold: true, before: 160 }),
    renderBangDapAn(ma102),
  ];

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 1134, bottom: 1134, left: 1418, right: 1134 } } },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
