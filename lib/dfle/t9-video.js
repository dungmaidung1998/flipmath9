/**
 * VIDEO BÀI HỌC TOÁN 9 — kênh OLM.VN (youtube.com/@olm_vn), danh sách phát "TOÁN LỚP 9 MỚI":
 *   https://www.youtube.com/playlist?list=PLDHr_ecbSve7neyouEH8Ptxod-AElpVaO
 * Chỉ chọn video dùng được cho bộ Kết nối tri thức (bỏ video riêng Cánh diều, Chân trời sáng tạo).
 * Mỗi video là một đơn vị kiến thức; giay = thời lượng video.
 */
export const NGUON_VIDEO_T9 = 'OLM.VN — kênh YouTube @olm_vn, danh sách phát Toán lớp 9 mới (dùng lại, ghi nguồn)';

const yt = (id, giay) => ({ url: `https://www.youtube.com/watch?v=${id}`, giay });

/** @type {Record<string, {url:string, giay:number}>} */
export const VIDEO_T9 = {
  'C3-B7-M1': yt('K5_ZUcj6y7g', 725),
  'C3-B7-M2': yt('-DF9D9hUfKg', 690),
  'C3-B8-M1': yt('b0QVODTGXl0', 525),
  'C3-B8-M2': yt('UHWh-P6CNf4', 565),
  'C3-B9-M1': yt('axtQn80AdDI', 515),
  'C3-B9-M1B': yt('x4zgjut9HSQ', 371),
  'C3-B9-M2': yt('I6r0O0MEvKY', 539),
  'C3-B9-M2B': yt('pE4qVhtKt7A', 408),
  'C3-B9-M3': yt('8n3tiFChsJ0', 707),
  'C3-B10-M1': yt('x4eKsO9wPxM', 604),
  'C3-B10-M2': yt('aQteds9pG_8', 557),
  // ---- Chương I
  'C1-B1-M1': yt('ZW-Y_v5M5X4', 765),
  'C1-B1-M2': yt('ntfSnt3FiwI', 715),
  'C1-B1-M3': yt('XWhsGsCHR3Y', 661),
  'C1-B2-M1': yt('RNDYOjFT83g', 670),
  'C1-B2-M2': yt('_xbWVac914Q', 637),
  'C1-B3-M1': yt('PSP_47L3jfY', 622),
  'C1-B3-M1B': yt('-nqJN-PL9hg', 753),
  'C1-B3-M1C': yt('uTuw9KxOI_4', 536),
  // ---- Chương II
  'C2-B4-M1': yt('Apwo51BP6-Y', 649),
  'C2-B4-M2': yt('I3f3aWa5XbY', 789),
  'C2-B5-M1': yt('mYyCxxYl80Q', 506),
  'C2-B5-M2': yt('Z7aH8eQc-5E', 887),
  'C2-B6-M1': yt('fGsr6lXu5xk', 512),
  'C2-B6-M2': yt('-whAPe9n-nc', 645),
  // ---- Chương IV
  'C4-B11-M1': yt('ps4wtd7VAu8', 790),
  'C4-B11-M2': yt('5h87iTzBC34', 773),
  'C4-B11-M3': yt('XoekmlUg9yU', 805),
  'C4-B12-M1': yt('digAYEpq0yY', 687),
  'C4-B12-M2': yt('fqzNfulRrfE', 649),
  'C4-B12-M3': yt('SOs26-8h2h4', 595),
  // ---- Chương V
  'C5-B13-M1': yt('4x7lTMLkF70', 705),
  'C5-B13-M2': yt('YI8IautHUuQ', 497),
  'C5-B14-M1': yt('Qin2IXCOneQ', 492),
  'C5-B14-M2': yt('6mmk_TSekH4', 395),
  'C5-B14-M3': yt('0CMwRNYktvM', 453),
  'C5-B15-M1': yt('c_kEhECFqbY', 840),
  'C5-B15-M2': yt('vhXQThTq_Ic', 610),
  'C5-B15-M3': yt('zNL2PSoyJqw', 464),
  'C5-B16-M1': yt('ilVRzB_V99o', 737),
  'C5-B16-M2': yt('FVEwbXc-02g', 555),
  'C5-B16-M3': yt('RK0ekWufOS8', 766),
  'C5-B17-M1': yt('cXURMs7uUgg', 704),
  'C5-B17-M2': yt('qkjt7Dgwj9U', 683),
  // ---- Chương VI
  'C6-B18-M1': yt('y9s6uSV5IZA', 688),
  'C6-B18-M2': yt('pRu9pNG-lVs', 807),
  'C6-B19-M1': yt('UECCCQAzJRk', 703),
  'C6-B19-M2': yt('XHXNUMcy39E', 698),
  'C6-B19-M3': yt('zOAlfGWAoMA', 624),
  'C6-B20-M1': yt('yu9l3PuOGvQ', 810),
  'C6-B20-M2': yt('G5w19Yaw_40', 598),
  'C6-B20-M3': yt('vEcF0WdrRBs', 606),
  'C6-B21-M1': yt('b0DbMKsfQ9I', 517),
  'C6-B21-M2': yt('sJnBsWYkp60', 493),
  // ---- Chương VII
  'C7-B22-M1': yt('z9fNLoSQCc8', 630),
  'C7-B22-M2': yt('LPuaC57JO6E', 621),
  'C7-B23-M1': yt('2TqN-GAOQm0', 641),
  'C7-B23-M2': yt('s00Tt1qvxgA', 611),
  'C7-B24-M1': yt('VGltCAI9g4Y', 491),
  'C7-B24-M2': yt('Z0hhgSUzyzY', 560),
  'C7-B24-M3': yt('JFkLtgFgi6E', 646),
  'C7-B24-M4': yt('qOwU0Hf9Sig', 740),
  // ---- Chương VIII
  'C8-B25-M1': yt('DUxG-s_ylXw', 618),
  'C8-B26-M1': yt('bpJQYq2Rp6w', 666),
  'C8-B26-M2': yt('f0M51_r67pU', 617),
  // ---- Chương IX
  'C9-B27-M1': yt('INEyc42u1Fs', 532),
  'C9-B28-M1': yt('6KEbO_62j6M', 456),
  'C9-B28-M2': yt('j31b2Wxz83E', 465),
  'C9-B28-M3': yt('V_EERwXYU78', 565),
  'C9-B29-M1': yt('yGbtho3gYdQ', 539),
  'C9-B29-M2': yt('knENQvpf-eE', 482),
  'C9-B30-M1': yt('I_KHRnnMl64', 459),
  'C9-B30-M2': yt('ycGbRJQmpXQ', 479),
  'C9-B30-M3': yt('TZ1rZxpmVGE', 540),
  'C9-B30-M4': yt('WMDrax0IG-o', 453),
  // ---- Chương X
  'C10-B31-M1': yt('XMiFweHyfgk', 567),
  'C10-B31-M2': yt('yvBHc2tuza8', 589),
  'C10-B31-M3': yt('R8TGql53nrg', 585),
  'C10-B31-M4': yt('_iGuB1mVuSU', 535),
  'C10-B32-M1': yt('Hp2DVf6N_tA', 361),
  'C10-B32-M2': yt('U4PYpIYhWbo', 454),
};
