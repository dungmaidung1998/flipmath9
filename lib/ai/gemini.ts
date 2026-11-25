/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
import katex from 'katex';

/**
 * TRỢ GIẢNG GEMINI CHO GIÁO VIÊN — CHỈ DÙNG TRÊN MÁY CHỦ Ở ROUTE GIÁO VIÊN / QUẢN TRỊ.
 *
 * Ràng buộc pháp lý: Học sinh dưới 18 tuổi KHÔNG BAO GIỜ gọi tệp này trực tiếp hay
 * gián tiếp. Không gửi tên học sinh, mã học sinh hay email cho Gemini. Mọi nội dung
 * AI soạn phải qua giáo viên chỉnh sửa và bấm duyệt trước khi học sinh nhìn thấy.
 */
if (typeof window !== 'undefined') {
  throw new Error('lib/ai/gemini chỉ được phép chạy trên máy chủ cho giáo viên.');
}

const SYSTEM_PROMPT = [
  'Bạn là trợ giảng Toán lớp 9 tiếng Việt hỗ trợ giáo viên trường THCS.',
  'Nguyên tắc sư phạm bắt buộc:',
  '1. Chỉ gợi mở phương pháp, công thức, bước đầu hoặc đặt câu hỏi dẫn dắt; KHÔNG giải hộ trọn vẹn bài toán của học sinh và KHÔNG nêu đáp án cuối cùng (số cụ thể hay A/B/C/D).',
  '2. Viết ngắn gọn, rõ ràng, thân thiện bằng tiếng Việt chuẩn.',
  '3. Mọi công thức toán học đặt đúng cặp dấu $...$ (LaTeX hợp lệ); tránh macro lạ.'
].join('\n');

/**
 * Hàm `aiTroGiupBat`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function aiTroGiupBat(): boolean {
  return (process.env.AI_TRO_GIUP_BAT ?? 'true').trim().toLowerCase() !== 'false';
}

/**
 * Hàm `coKhoaGemini`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function coKhoaGemini(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

/**
 * Hàm `tenMoHinhGemini`: nhận (không tham số), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function tenMoHinhGemini(): string {
  // gemini-2.0-flash bị Google ngừng từ 6/2026 nên mặc định dùng bản mới
  return process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash';
}

/** Ẩn danh dữ liệu trước khi gửi ra ngoài: bỏ email, số điện thoại, mã học sinh. */
export function anDanhNoiDung(text: string): string {
  return String(text ?? '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/\b0\d{8,10}\b/g, '[sdt]')
    .replace(/\bHS[-_ ]?\d+\b/gi, '[hoc-sinh]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 800);
}

/** Kiểm tra công thức KaTeX hợp lệ và không làm lộ đáp án cuối. */
export function kiemTraDauRaToan(text: string): {
  hopLe: boolean;
  lyDo?: string;
  vanBan: string;
} {
  const vanBan = String(text ?? '').trim().slice(0, 1400);
  if (!vanBan) return { hopLe: false, lyDo: 'Nội dung AI trả về trống.', vanBan: '' };

  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  if (/\b(đáp án (?:đúng )?là|chọn (?:đáp án )?[A-D]\b|kết quả cuối cùng là)\b/i.test(vanBan)) {
    return { hopLe: false, lyDo: 'Nội dung có dấu hiệu nêu thẳng đáp án cuối.', vanBan };
  }

  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  let tam = vanBan.replace(/\\\$/g, ' ');
  const khoiBlock: string[] = [];
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  tam = tam.replace(/\$\$([\s\S]*?)\$\$/g, (_m, expr) => {
    khoiBlock.push(String(expr));
    return ' ';
  });
  const khoiInline: string[] = [];
  // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
  tam = tam.replace(/\$([^$\n]+?)\$/g, (_m, expr) => {
    khoiInline.push(String(expr));
    return ' ';
  });

  if (tam.includes('$')) {
    return { hopLe: false, lyDo: 'Dấu $ công thức KaTeX bị lẻ hoặc xuống dòng.', vanBan };
  }

  try {
    for (const expr of khoiBlock) {
      katex.renderToString(expr.trim(), { displayMode: true, throwOnError: true, trust: false });
    }
    for (const expr of khoiInline) {
      katex.renderToString(expr.trim(), { displayMode: false, throwOnError: true, trust: false });
    }
  } catch {
    return { hopLe: false, lyDo: 'Công thức KaTeX trong văn bản không hợp lệ.', vanBan };
  }

  return { hopLe: true, vanBan };
}

/**
 * Hàm `goiGemini`: nhận (prompt, opts), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function goiGemini(
  prompt: string,
  opts?: { maxTokens?: number; timeoutMs?: number }
): Promise<{ ok: true; text: string; model: string } | { ok: false; error: string; model: string }> {
  const model = tenMoHinhGemini();
  if (!aiTroGiupBat()) {
    return { ok: false, error: 'Tính năng AI đang tắt bởi biến môi trường AI_TRO_GIUP_BAT=false.', model };
  }
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    return { ok: false, error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ.', model };
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts?.timeoutMs ?? 15000);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: prompt.slice(0, 2600) }] }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: opts?.maxTokens ?? 700
        }
      })
    });

    if (!res.ok) {
      return { ok: false, error: `Gemini trả mã lỗi ${res.status}.`, model };
    }
    const json = await res.json();
    const parts = json?.candidates?.[0]?.content?.parts;
    const rawText = Array.isArray(parts)
      ? parts.map((p: any) => String(p?.text ?? '')).join('\n').trim()
      : '';
    if (!rawText) {
      return { ok: false, error: 'Gemini không trả về văn bản.', model };
    }
    return { ok: true, text: rawText, model };
  } catch (e: any) {
    const msg = e?.name === 'AbortError' ? 'Quá thời gian chờ Gemini (timeout).' : 'Không kết nối được Gemini.';
    return { ok: false, error: msg, model };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Hàm `soanBaTangGoiY`: nhận (input), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function soanBaTangGoiY(input: {
  errorCode: string;
  misconception: string;
  viDu?: string | null;
  viBaiHoc?: string | null;
}): Promise<{ goiY: [string, string, string]; tuAi: boolean; moHinh: string; canhBao?: string }> {
  const ma = anDanhNoiDung(input.errorCode);
  const loi = anDanhNoiDung(input.misconception);
  const viDu = anDanhNoiDung(input.viDu ?? '');
  const viBai = anDanhNoiDung(input.viBaiHoc ?? '');

  const fallback: [string, string, string] = [
    `Kiểm tra lại bước hay mắc ở lỗi "${loi || ma}": đọc kĩ dấu, điều kiện xác định và đề bài.`,
    `Nhắc lại quy tắc cốt lõi: tách riêng từng bước biến đổi rồi tự thử thay một giá trị đơn giản để kiểm chứng.`,
    viDu
      ? `Thử làm lại ví dụ mẫu tương tự trước khi sửa bài: ${viDu.slice(0, 220)}`
      : `Xem lại phần quy tắc trong bài và tự viết từng bước trung gian, không bỏ tắt.`
  ];

  const prompt = [
    `Hãy soạn 3 tầng gợi ý sửa lỗi Toán 9 cho mã lỗi ${ma}.`,
    `Mô tả quan niệm sai: ${loi || 'Học sinh nhầm bước biến đổi cơ bản.'}`,
    viDu ? `Ví dụ tham khảo (chỉ xem cấu trúc): ${viDu}` : '',
    viBai ? `Vi bài học liên quan: ${viBai}` : '',
    'Yêu cầu trả về ĐÚNG JSON dạng {"t1":"...","t2":"...","t3":"..."} không kèm markdown ngoài JSON:',
    '- t1: Nhắc nhẹ chỗ dễ nhầm (1–2 câu, chưa nêu cách làm).',
    '- t2: Gợi ý quy tắc hoặc câu hỏi dẫn dắt bước tiếp theo (dùng $...$ nếu có công thức).',
    '- t3: Nêu một ví dụ tương tự KHÁC SỐ với lỗi gốc để học sinh tự đối chiếu, tuyệt đối không giải hộ hay cho đáp án cuối.'
  ].filter(Boolean).join('\n');

  const res = await goiGemini(prompt, { maxTokens: 650, timeoutMs: 15000 });
  if (!res.ok) {
    return { goiY: fallback, tuAi: false, moHinh: res.model, canhBao: res.error };
  }

  try {
    // Biểu thức chính quy (regex) kiểm tra hoặc tách chuỗi đúng mẫu dữ liệu
    const clean = res.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(clean);
    const t1 = kiemTraDauRaToan(String(parsed?.t1 ?? ''));
    const t2 = kiemTraDauRaToan(String(parsed?.t2 ?? ''));
    const t3 = kiemTraDauRaToan(String(parsed?.t3 ?? ''));
    if (t1.hopLe && t2.hopLe && t3.hopLe) {
      return { goiY: [t1.vanBan, t2.vanBan, t3.vanBan], tuAi: true, moHinh: res.model };
    }
    return {
      goiY: [
        t1.hopLe ? t1.vanBan : fallback[0],
        t2.hopLe ? t2.vanBan : fallback[1],
        t3.hopLe ? t3.vanBan : fallback[2]
      ],
      tuAi: t1.hopLe || t2.hopLe || t3.hopLe,
      moHinh: res.model,
      canhBao: t1.lyDo || t2.lyDo || t3.lyDo || 'Một phần gợi ý AI chưa đạt kiểm tra KaTeX/đáp án nên đã thay bằng mẫu an toàn.'
    };
  } catch {
    return {
      goiY: fallback,
      tuAi: false,
      moHinh: res.model,
      canhBao: 'Đầu ra Gemini không đúng định dạng 3 tầng JSON; đã dùng gợi ý dự phòng.'
    };
  }
}

/**
 * Hàm `soanNhapHoiBin`: nhận (input), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export async function soanNhapHoiBin(input: {
  cauHoi: string;
  tenMuc?: string | null;
  quyTac?: string | null;
}): Promise<{ nhap: string; tuAi: boolean; moHinh: string; canhBao?: string }> {
  const cauHoi = anDanhNoiDung(input.cauHoi);
  const tenMuc = anDanhNoiDung(input.tenMuc ?? '');
  const quyTac = anDanhNoiDung(input.quyTac ?? '');

  const fallback = [
    tenMuc ? `Về mục "${tenMuc}", em hãy bắt đầu bằng cách xác định đề bài cho gì và hỏi gì.` : 'Em hãy xác định rõ dữ kiện đề bài cho và đại lượng cần tìm.',
    quyTac ? `Nhớ lại quy tắc trọng tâm: ${quyTac.slice(0, 260)}` : 'Hãy viết từng bước biến đổi ngắn gọn và kiểm tra điều kiện xác định nếu có.',
    'Em thử làm bước đầu tiên rồi gửi lại cho thầy/cô xem nhé!'
  ].join(' ');

  const prompt = [
    'Giáo viên cần một bản nháp ngắn để trả lời thắc mắc Toán 9 của học sinh.',
    tenMuc ? `Mục kiến thức đang học: ${tenMuc}` : '',
    quyTac ? `Quy tắc trọng tâm của mục: ${quyTac}` : '',
    `Câu hỏi của học sinh: "${cauHoi}"`,
    'Hãy viết 2–4 câu gợi mở giúp học sinh tự làm được bước tiếp theo (xưng "em", dùng công thức $...$ nếu cần, không giải hộ hết bài, không nêu đáp án cuối).'
  ].filter(Boolean).join('\n');

  const res = await goiGemini(prompt, { maxTokens: 450, timeoutMs: 15000 });
  if (!res.ok) {
    return { nhap: fallback, tuAi: false, moHinh: res.model, canhBao: res.error };
  }

  const check = kiemTraDauRaToan(res.text);
  if (!check.hopLe) {
    return {
      nhap: fallback,
      tuAi: false,
      moHinh: res.model,
      canhBao: check.lyDo ?? 'Bản nháp AI chưa đạt kiểm tra an toàn.'
    };
  }
  return { nhap: check.vanBan, tuAi: true, moHinh: res.model };
}
