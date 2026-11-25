-- ============================================================================
-- DFLE-M7 · HỆ THỐNG PHỤC HỒI NHẬN THỨC THÍCH ỨNG (ALRE RECOVERY SCHEMA)
-- ============================================================================
-- File: 23-alre-recovery-schema.sql
-- Mục đích:
--   1. Tạo bảng learning_recovery_records lưu trữ chu trình 4 pha của ALRE:
--      (GDVM Lọc đoán mò -> RCGT Truy vết lỗi gốc -> ARIO Bandit Can thiệp -> CLVT Đo lường Gain)
--   2. Tạo view teacher_intervention_queue phục vụ buồng lái giáo viên (Human-in-the-loop)
--   3. Cấp quyền RLS cho giáo viên và học sinh
-- ============================================================================

-- 1. BẢNG LƯU TRỮ HỒ SƠ PHỤC HỒI NHẬN THỨC (learning_recovery_records)
CREATE TABLE IF NOT EXISTS learning_recovery_records (
  recovery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  ku_id TEXT NOT NULL REFERENCES knowledge_units(ku_id),
  manifest_error TEXT NOT NULL,                         -- Lỗi biểu hiện bề mặt (vd: E-TT-01)
  root_cause_error TEXT,                                -- Lỗi gốc chẩn đoán từ DAG (vd: E-HT-02)
  target_ku_id TEXT REFERENCES knowledge_units(ku_id),   -- Đơn vị kiến thức cần bù đắp (vd: C1-B1-M1)
  guess_score NUMERIC(4, 3) DEFAULT 0.000,              -- Điểm đoán mò G in [0, 1]
  is_rapid_guess BOOLEAN DEFAULT FALSE,                 -- Cờ làm bài siêu tốc bất thường
  selected_arm TEXT NOT NULL CHECK (
    selected_arm IN ('micro_lesson', 'scaffold_hint', 'jigsaw_peer', 'teacher_queue')
  ),                                                    -- Cánh tay can thiệp LinUCB
  status TEXT NOT NULL DEFAULT 'detected' CHECK (
    status IN ('detected', 'in_remediation', 'verified_success', 'escalated')
  ),                                                    -- Trạng thái máy phục hồi
  attempt_count INT DEFAULT 1,                          -- Số lượt can thiệp đã thử
  pre_score NUMERIC(4, 2) DEFAULT 0.00,                 -- Điểm trước can thiệp (0-10)
  post_score NUMERIC(4, 2),                             -- Điểm kiểm chứng sau can thiệp (0-10)
  learning_gain NUMERIC(4, 3),                          -- Chỉ số tiến bộ g của Hake
  teacher_pedagogical_prompt TEXT,                      -- Gợi ý câu hỏi sư phạm 1-1 cho giáo viên
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chỉ mục tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_recovery_student ON learning_recovery_records(student_id);
CREATE INDEX IF NOT EXISTS idx_recovery_ku ON learning_recovery_records(ku_id);
CREATE INDEX IF NOT EXISTS idx_recovery_status ON learning_recovery_records(status);

-- 2. VIEW HÀNG ĐỢI CAN THIỆP CỦA GIÁO VIÊN (teacher_intervention_queue)
-- Tự động tổng hợp các ca khẩn cấp cần giáo viên can thiệp 1-1 trực tiếp trên lớp:
-- Bao gồm các ca trạng thái 'escalated' HOẶC 'teacher_queue' HOẶC tái phát nhiều lần
CREATE OR REPLACE VIEW teacher_intervention_queue AS
SELECT
  r.recovery_id,
  r.student_id,
  s.display_name AS student_name,
  s.class_id,
  c.class_code,
  r.ku_id,
  ku.ku_name,
  r.manifest_error,
  ed_manifest.misconception AS manifest_error_name,
  r.root_cause_error,
  COALESCE(ed_root.misconception, r.root_cause_error) AS root_cause_name,
  r.target_ku_id,
  target_ku.ku_name AS target_ku_name,
  r.guess_score,
  r.is_rapid_guess,
  r.selected_arm,
  r.status,
  r.attempt_count,
  r.pre_score,
  r.post_score,
  r.learning_gain,
  r.teacher_pedagogical_prompt,
  r.created_at,
  -- Điểm ưu tiên can thiệp sư phạm (Priority Score):
  -- Ưu tiên cao hơn nếu tái phát nhiều lần, điểm đoán mò cao hoặc thụt lùi
  ROUND(
    (CASE WHEN r.status = 'escalated' THEN 5.0 ELSE 2.0 END) +
    (r.attempt_count * 1.5) +
    (r.guess_score * 2.0) -
    COALESCE(r.learning_gain * 3.0, 0),
    2
  ) AS priority_score
FROM learning_recovery_records r
JOIN students s ON r.student_id = s.student_id
JOIN classes c ON s.class_id = c.class_id
JOIN knowledge_units ku ON r.ku_id = ku.ku_id
LEFT JOIN knowledge_units target_ku ON r.target_ku_id = target_ku.ku_id
LEFT JOIN error_dictionary ed_manifest ON r.manifest_error = ed_manifest.error_code
LEFT JOIN error_dictionary ed_root ON r.root_cause_error = ed_root.error_code
WHERE r.status = 'escalated' OR r.selected_arm = 'teacher_queue' OR r.attempt_count >= 2
ORDER BY priority_score DESC, r.created_at DESC;

-- 3. CHÍNH SÁCH BẢO MẬT HÀNG (RLS)
ALTER TABLE learning_recovery_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Giao vien xem ho so phuc hoi cua lop minh" ON learning_recovery_records;
CREATE POLICY "Giao vien xem ho so phuc hoi cua lop minh"
  ON learning_recovery_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.class_id
      WHERE s.student_id = learning_recovery_records.student_id
        AND c.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Giao vien cap nhat trang thai ho so phuc hoi" ON learning_recovery_records;
CREATE POLICY "Giao vien cap nhat trang thai ho so phuc hoi"
  ON learning_recovery_records
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN classes c ON s.class_id = c.class_id
      WHERE s.student_id = learning_recovery_records.student_id
        AND c.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Hoc sinh xem ho so phuc hoi cua chinh minh" ON learning_recovery_records;
CREATE POLICY "Hoc sinh xem ho so phuc hoi cua chinh minh"
  ON learning_recovery_records
  FOR SELECT
  USING (student_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Không tự chèn hồ sơ giả vào học sinh. Dữ liệu minh họa chỉ được nạp riêng vào lớp DEMO.
