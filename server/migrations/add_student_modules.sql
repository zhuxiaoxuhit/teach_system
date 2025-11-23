-- 学员模块扩展表
USE teaching_system;

-- 学员报读表
CREATE TABLE IF NOT EXISTS student_enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL COMMENT '学员ID',
  student_name VARCHAR(50) NOT NULL COMMENT '学员姓名',
  gender VARCHAR(10) COMMENT '性别',
  relation VARCHAR(20) COMMENT '家长关系',
  phone VARCHAR(20) COMMENT '联系电话',
  course_type VARCHAR(50) COMMENT '课程类型',
  course_name VARCHAR(100) COMMENT '课程名称',
  total_class_hours DECIMAL(10,1) DEFAULT 0 COMMENT '总课时',
  used_class_hours DECIMAL(10,1) DEFAULT 0 COMMENT '已用课时',
  remaining_class_hours DECIMAL(10,1) DEFAULT 0 COMMENT '剩余课时',
  total_amount DECIMAL(10,2) DEFAULT 0 COMMENT '合计金额',
  paid_amount DECIMAL(10,2) DEFAULT 0 COMMENT '已付金额',
  discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
  refund_amount DECIMAL(10,2) DEFAULT 0 COMMENT '退费金额',
  balance DECIMAL(10,2) DEFAULT 0 COMMENT '欠费',
  campus VARCHAR(50) COMMENT '校区',
  status VARCHAR(20) DEFAULT '在读' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_student_name (student_name),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学员报读表';

-- 学员分班表
CREATE TABLE IF NOT EXISTS student_class_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL COMMENT '学员ID',
  student_name VARCHAR(50) NOT NULL COMMENT '学员姓名',
  gender VARCHAR(10) COMMENT '性别',
  phone VARCHAR(20) COMMENT '联系电话',
  campus VARCHAR(50) COMMENT '校区',
  course_type VARCHAR(50) COMMENT '课程类型',
  course_name VARCHAR(100) COMMENT '课程名称',
  class_name VARCHAR(100) COMMENT '班级名称',
  classroom VARCHAR(50) COMMENT '教室',
  teacher VARCHAR(50) COMMENT '任课老师',
  schedule VARCHAR(100) COMMENT '上课时间',
  class_type VARCHAR(50) DEFAULT '随堂班' COMMENT '班型',
  enrollment_date DATE COMMENT '报班日期',
  start_date DATE COMMENT '开班日期',
  end_date DATE COMMENT '结班日期',
  status VARCHAR(20) DEFAULT '在读' COMMENT '状态',
  remark TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_student_name (student_name),
  INDEX idx_class_name (class_name),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学员分班表';

-- 学员成绩表
CREATE TABLE IF NOT EXISTS student_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL COMMENT '学员ID',
  student_name VARCHAR(50) NOT NULL COMMENT '学员姓名',
  gender VARCHAR(10) COMMENT '性别',
  phone VARCHAR(20) COMMENT '联系电话',
  course_name VARCHAR(100) COMMENT '项目',
  class_name VARCHAR(100) COMMENT '班级',
  score DECIMAL(5,2) COMMENT '成绩',
  exam_date DATE COMMENT '考试日期',
  exam_type VARCHAR(50) COMMENT '考试类型',
  campus VARCHAR(50) COMMENT '校区',
  class_count INT DEFAULT 0 COMMENT '班级次数',
  remark TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_student_name (student_name),
  INDEX idx_exam_date (exam_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学员成绩表';
