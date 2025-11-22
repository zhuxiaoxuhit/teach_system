-- 教育教务管理系统数据库
-- 创建数据库
CREATE DATABASE IF NOT EXISTS teaching_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE teaching_system;

-- 1. 用户表（教师/员工）
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  role VARCHAR(20) DEFAULT 'teacher' COMMENT '角色：teacher/admin/assistant',
  status TINYINT DEFAULT 1 COMMENT '状态：1在职，0离职',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 学员表
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL COMMENT '学员姓名',
  gender VARCHAR(10) DEFAULT '男' COMMENT '性别',
  relation VARCHAR(20) DEFAULT '母亲' COMMENT '家长关系',
  phone VARCHAR(20) NOT NULL COMMENT '联系电话',
  birthday DATE COMMENT '出生日期',
  campus VARCHAR(50) DEFAULT '魏桥书院' COMMENT '报读校区',
  is_followed TINYINT DEFAULT 0 COMMENT '校宝家关注：1已关注，0未关注',
  card_bound TINYINT DEFAULT 0 COMMENT '磁卡绑定：1已绑定，0未绑定',
  rating INT DEFAULT 0 COMMENT '人脉评级',
  balance DECIMAL(10,2) DEFAULT 0.00 COMMENT '欠费金额',
  status VARCHAR(20) DEFAULT '在读' COMMENT '学员状态',
  remark TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_phone (phone),
  INDEX idx_status (status),
  INDEX idx_campus (campus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学员表';

-- 3. 班级表
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL COMMENT '班级编码/名称',
  capacity INT DEFAULT 20 COMMENT '班级容量',
  student_count INT DEFAULT 0 COMMENT '当前学员数',
  teacher VARCHAR(50) COMMENT '班主任',
  assistant VARCHAR(50) DEFAULT '-' COMMENT '助教',
  course VARCHAR(100) COMMENT '所属课程',
  classroom VARCHAR(50) COMMENT '授课教室',
  start_date DATE COMMENT '开班日期',
  end_date DATE COMMENT '结束日期',
  status VARCHAR(20) DEFAULT '开班在读' COMMENT '班级状态',
  remark TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_teacher (teacher),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班级表';

-- 4. 学员班级关联表
CREATE TABLE IF NOT EXISTS student_class (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL COMMENT '学员ID',
  class_id INT NOT NULL COMMENT '班级ID',
  join_date DATE COMMENT '加入日期',
  leave_date DATE COMMENT '离开日期',
  status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active/inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学员班级关联表';

-- 5. 上课记录表
CREATE TABLE IF NOT EXISTS class_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL COMMENT '班级ID',
  date DATE NOT NULL COMMENT '上课日期',
  time VARCHAR(50) COMMENT '上课时间',
  attendance_count INT DEFAULT 0 COMMENT '到课人数',
  evaluated_count INT DEFAULT 0 COMMENT '已点评人数',
  unevaluated_count INT DEFAULT 0 COMMENT '未点评人数',
  status VARCHAR(20) DEFAULT '进行中' COMMENT '状态：进行中/已完成',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  INDEX idx_class (class_id),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='上课记录表';

-- 6. 课堂点评表
CREATE TABLE IF NOT EXISTS evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_id INT NOT NULL COMMENT '上课记录ID',
  student_id INT NOT NULL COMMENT '学员ID',
  content TEXT COMMENT '点评内容',
  images TEXT COMMENT '图片URL列表（JSON格式）',
  red_dots INT DEFAULT 0 COMMENT '小红花数量',
  is_read TINYINT DEFAULT 0 COMMENT '是否已读：1已读，0未读',
  created_by VARCHAR(50) COMMENT '点评人',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES class_records(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_record (record_id),
  INDEX idx_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课堂点评表';

-- 7. 作业表
CREATE TABLE IF NOT EXISTS homework (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL COMMENT '班级ID',
  title VARCHAR(200) NOT NULL COMMENT '作业标题',
  content TEXT COMMENT '作业内容',
  images TEXT COMMENT '图片URL列表',
  deadline DATE COMMENT '截止日期',
  submit_count INT DEFAULT 0 COMMENT '提交人数',
  total_count INT DEFAULT 0 COMMENT '总人数',
  status VARCHAR(20) DEFAULT '进行中' COMMENT '状态',
  created_by VARCHAR(50) COMMENT '发布人',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  INDEX idx_class (class_id),
  INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业表';

-- 8. 通知公告表
CREATE TABLE IF NOT EXISTS notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL COMMENT '通知标题',
  content TEXT COMMENT '通知内容',
  target_type VARCHAR(20) COMMENT '目标类型：all/class/student',
  target_ids TEXT COMMENT '目标ID列表（JSON格式）',
  read_count INT DEFAULT 0 COMMENT '已读人数',
  total_count INT DEFAULT 0 COMMENT '总人数',
  created_by VARCHAR(50) COMMENT '发布人',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知公告表';

-- 插入测试用户数据
INSERT INTO users (phone, password, name, role) VALUES
('18701538360', '$2b$10$YourHashedPasswordHere', '杨倩', 'teacher'),
('13800138001', '$2b$10$YourHashedPasswordHere', '陈老师', 'teacher'),
('13800138002', '$2b$10$YourHashedPasswordHere', '梁辰', 'teacher');

-- 插入测试学员数据（部分）
INSERT INTO students (name, gender, relation, phone, campus, status) VALUES
('张伟', '男', '父亲', '13900000001', '魏桥书院', '在读'),
('李娜', '女', '母亲', '13900000002', '魏桥书院', '在读'),
('王芳', '女', '母亲', '13900000003', '魏桥书院', '在读'),
('刘洋', '男', '父亲', '13900000004', '魏桥书院', '在读'),
('陈静', '女', '母亲', '13900000005', '魏桥书院', '在读');

-- 插入测试班级数据
INSERT INTO classes (code, capacity, student_count, teacher, course, classroom, start_date, status) VALUES
('01-农小硬笔-15:30', 20, 12, '杨倩', '农小硬笔暑托', '1F教室1', '2024-07-01', '开班在读'),
('02-农小一对一-20:15', 1, 1, '陈老师', '农小一对一课试课', '1F教室2', '2024-07-05', '开班在读'),
('03-农小创意美术-15:40', 25, 15, '梁辰', '农小创意美术', '2F教室1', '2024-07-10', '开班在读');
