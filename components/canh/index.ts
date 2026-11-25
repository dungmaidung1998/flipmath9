/**
 * FILE NÀY LÀM GÌ: Component React giao diện hiển thị và xử lý tương tác của người dùng trên trình duyệt.
 * AI DÙNG: học sinh
 * LẤY DỮ LIỆU TỪ: không truy vấn bảng trực tiếp
 * GỌI TỚI: ./chuyen-dong, ./sinh-hoat, ./hinh-hoc, ./nen
 */
import { CaoToc, HaiXe, MotXe, XeDap, XeTai } from './chuyen-dong';
import { BanPhim, HaiVoi, MotVoi, MuaBut, TaoCam, ThangMay, ThungNuoc, TrongCay, VeNhom, VePhim, VoBut, Vuon } from './sinh-hoat';
import { BanhXe, DenPha, Dieu, DongHo, GocHa, HaiDang, Loa, OngCong, QuatGiay, SanTron, Thap, VoiTuoi } from './hinh-hoc';
import type { CanhProps } from './nen';
import type { ComponentType } from 'react';

export const CANH: Record<string, ComponentType<CanhProps>> = {
  'vo-but': VoBut, 'C1-B1-M1-Q16': VeNhom, vuon: Vuon, 'trong-cay': TrongCay,
  'C1-B3-M1-Q13': TaoCam, 'o-to-mot-xe': MotXe, 'C1-B3-M1B-Q03': HaiXe, 'xe-dap-di-ve': XeDap,
  'C1-B3-M1C-Q03': HaiVoi, 'mot-voi': MotVoi, 'xe-tai': XeTai, 'cao-toc': CaoToc,
  'C2-B5-M1-Q15': ThangMay, 'mua-but': MuaBut, 'C2-B6-M1-Q14': VePhim, 'ban-phim': BanPhim,
  'thung-nuoc': ThungNuoc, 'C4-B12-M1-Q08': Dieu, 'C4-B12-M2-Q07': GocHa, 'thap-hai-ban': Thap,
  loa: Loa, 'dong-ho': DongHo, 'banh-xe-lan': BanhXe, 'quat-giay': QuatGiay,
  'C5-B15-M2-Q08': VoiTuoi, 'den-pha': DenPha, 'ong-cong': OngCong, 'san-tron': SanTron,
  'C5-B16-M2-Q15': HaiDang,
};

