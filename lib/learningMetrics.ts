/**
 * FILE NÀY LÀM GÌ: Mô-đun TypeScript/JavaScript hỗ trợ xử lý dữ liệu và nghiệp vụ trong hệ thống FlipMath 9.
 * AI DÙNG: dùng chung
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: không gọi mô-đun nội bộ khác
 */
/**
 * Hàm `activeElapsed`: nhận (previous, now, lastInteraction, visible), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function activeElapsed(previous:number,now:number,lastInteraction:number,visible:boolean):number {
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  return visible?Math.max(0,Math.min(now,lastInteraction+120000)-previous)/1000:0;
}
/**
 * Hàm `watchedSeconds`: nhận (previous, current), xử lý nghiệp vụ và trả kết quả tương ứng.
 */
export function watchedSeconds(previous:number|null,current:number):number[]{
  if(previous===null||!Number.isFinite(current)||current<=previous||current-previous>2.5)return [];
  // Tính toán, làm tròn hoặc giới hạn giá trị theo công thức
  return Array.from({length:Math.max(0,Math.floor(current)-Math.floor(previous))},(_,i)=>Math.floor(previous)+i);
}
