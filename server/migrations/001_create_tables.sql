-- 班级表
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(100) NOT NULL COMMENT '班级编码/名称',
  `capacity` INT DEFAULT 20 COMMENT '班级容量',
  `teacher` VARCHAR(50) NOT NULL COMMENT '班主任',
  `assistant` VARCHAR(50) DEFAULT '-' COMMENT '助教',
  `course` VARCHAR(100) NOT NULL COMMENT '所属课程',
  `classroom` VARCHAR(100) DEFAULT '' COMMENT '授课教室',
  `start_date` DATE DEFAULT NULL COMMENT '开班日期',
  `end_date` DATE DEFAULT NULL COMMENT '结束日期',
  `status` VARCHAR(20) DEFAULT '开班在读' COMMENT '班级状态',
  `remark` TEXT COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (`code`),
  INDEX idx_teacher (`teacher`),
  INDEX idx_course (`course`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班级表';

-- 学员分班记录表
CREATE TABLE IF NOT EXISTS `student_class_assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL COMMENT '学员ID',
  `student_name` VARCHAR(50) NOT NULL COMMENT '学员姓名',
  `class_id` INT NOT NULL COMMENT '班级ID',
  `class_name` VARCHAR(100) NOT NULL COMMENT '班级名称',
  `course` VARCHAR(100) DEFAULT '' COMMENT '课程名称',
  `school` VARCHAR(100) DEFAULT '' COMMENT '所属校区',
  `grade` VARCHAR(50) DEFAULT '' COMMENT '年级',
  `operator` VARCHAR(50) DEFAULT '系统管理员' COMMENT '操作人',
  `operation_type` VARCHAR(20) DEFAULT '分配进班' COMMENT '操作类型：分配进班、移出班级、转班',
  `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-有效, inactive-无效, removed-已移除',
  `remark` TEXT COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_id (`student_id`),
  INDEX idx_class_id (`class_id`),
  INDEX idx_status (`status`),
  INDEX idx_operation_type (`operation_type`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学员分班记录表';

-- 学员表（如果不存在）
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL COMMENT '学员姓名',
  `phone` VARCHAR(20) DEFAULT '' COMMENT '学员手机号',
  `gender` VARCHAR(10) DEFAULT '' COMMENT '性别',
  `birthday` DATE DEFAULT NULL COMMENT '生日',
  `school` VARCHAR(100) DEFAULT '' COMMENT '就读学校',
  `grade` VARCHAR(50) DEFAULT '' COMMENT '年级',
  `parent_name` VARCHAR(50) DEFAULT '' COMMENT '家长姓名',
  `parent_phone` VARCHAR(20) DEFAULT '' COMMENT '家长电话',
  `address` VARCHAR(255) DEFAULT '' COMMENT '家庭住址',
  `enrollment_date` DATE DEFAULT NULL COMMENT '报名日期',
  `status` VARCHAR(20) DEFAULT '在读' COMMENT '状态',
  `remark` TEXT COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (`name`),
  INDEX idx_phone (`phone`),
  INDEX idx_parent_phone (`parent_phone`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学员表';
