-- 班级导入记录表
USE teaching_system;

CREATE TABLE IF NOT EXISTS `class_import_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL COMMENT '文件名',
  `total_count` INT DEFAULT 0 COMMENT '总导入数',
  `success_count` INT DEFAULT 0 COMMENT '成功数',
  `fail_count` INT DEFAULT 0 COMMENT '失败数',
  `fail_details` TEXT COMMENT '失败详情（JSON格式）',
  `operator` VARCHAR(50) DEFAULT '系统管理员' COMMENT '操作人',
  `status` VARCHAR(20) DEFAULT 'completed' COMMENT '状态：completed-已完成, failed-失败',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_operator (`operator`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班级导入记录表';
