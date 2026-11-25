# -*- coding: utf-8 -*-
"""
NÉN ẢNH TRANG CHỦ SANG WEBP

Chạy lại mỗi khi thêm hoặc thay một tấm ảnh trong public/:

    python scripts/toi-uu-anh.py

Script đọc các tệp .png/.jpg trong public/ và ghi ra tệp .webp cùng tên,
cùng chỗ. Mã nguồn trang chủ ưu tiên dùng .webp nếu có, nên chỉ cần chạy
script là xong, không phải sửa code.

VÌ SAO PHẢI NÉN. Ảnh PNG do công cụ sinh ảnh xuất ra thường 1–2 MB mỗi tấm.
Trang chủ có 9 tấm là hơn 13 MB. Học sinh mở bằng 4G ở nhà, buổi tối, cả lớp
cùng lúc — 13 MB là trang không mở nổi. WebP cùng chất lượng thường nhỏ hơn
PNG 15–25 lần.

CỠ ĐÍCH lấy theo chỗ ảnh thật sự hiện ra trên màn hình, nhân đôi cho màn
hình mật độ cao. Ảnh biểu tượng số liệu hiện ra 80px thì lưu 256px là thừa
đủ — lưu 1254px chỉ tốn băng thông chứ mắt không thấy khác.
"""
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Thiếu thư viện Pillow. Chạy: pip install Pillow")

GOC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')

# (mẫu tên tệp, bề ngang tối đa, chất lượng)
QUY_TAC = [
    ('so-lieu/',      256,  85),   # hiện ra 80px
    ('hero-ngang',   1920,  82),   # ảnh nền hero trên laptop
    ('hero',          800,  85),   # ảnh vuông, chỉ dùng cho điện thoại
    ('vong-lap',     1600,  82),   # sơ đồ, chữ trong ảnh nên để rộng
    ('minh-hoa/',    1600,  82),   # các khối phía dưới
]
MAC_DINH = (1400, 82)


def quy_tac_cho(duong_dan_tuong_doi):
    for mau, rong, chat_luong in QUY_TAC:
        if duong_dan_tuong_doi.replace('\\', '/').startswith(mau) or \
           os.path.basename(duong_dan_tuong_doi).startswith(mau):
            return rong, chat_luong
    return MAC_DINH


def main():
    if not os.path.isdir(GOC):
        sys.exit("Không tìm thấy thư mục public/")

    tong_truoc = tong_sau = 0
    da_lam = 0

    for thu_muc, _, ten_tep in os.walk(GOC):
        for ten in sorted(ten_tep):
            if not ten.lower().endswith(('.png', '.jpg', '.jpeg')):
                continue
            nguon = os.path.join(thu_muc, ten)
            tuong_doi = os.path.relpath(nguon, GOC)
            dich = os.path.splitext(nguon)[0] + '.webp'

            # Bỏ qua nếu .webp đã mới hơn ảnh gốc.
            if os.path.exists(dich) and os.path.getmtime(dich) >= os.path.getmtime(nguon):
                continue

            rong_toi_da, chat_luong = quy_tac_cho(tuong_doi)
            anh = Image.open(nguon)
            # Giữ kênh trong suốt nếu ảnh gốc có — mất nó là ảnh hiện ra một
            # ô vuông trắng trên nền thẻ.
            anh = anh.convert('RGBA' if anh.mode in ('RGBA', 'LA', 'P') else 'RGB')

            if anh.width > rong_toi_da:
                cao = round(anh.height * rong_toi_da / anh.width)
                anh = anh.resize((rong_toi_da, cao), Image.LANCZOS)

            anh.save(dich, 'WEBP', quality=chat_luong, method=6)

            truoc = os.path.getsize(nguon)
            sau = os.path.getsize(dich)
            tong_truoc += truoc
            tong_sau += sau
            da_lam += 1
            print(f"  {tuong_doi:32s} {truoc//1024:5d} KB -> {sau//1024:4d} KB"
                  f"   ({anh.width}x{anh.height})")

    if da_lam == 0:
        print("Không có ảnh nào cần nén — tất cả đã có bản .webp mới.")
    else:
        print(f"\nXong {da_lam} ảnh: {tong_truoc//1024} KB -> {tong_sau//1024} KB")


if __name__ == '__main__':
    main()
