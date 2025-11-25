const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取排课列表（分页）
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      startDate,
      endDate,
      classId,
      teacherName,
      classroom,
      scheduleType,
      status
    } = req.query;

    let sql = `
      SELECT s.*,
        c.code as class_code,
        c.course as course_name
      FROM schedules s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      sql += ' AND s.schedule_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND s.schedule_date <= ?';
      params.push(endDate);
    }

    if (classId) {
      sql += ' AND s.class_id = ?';
      params.push(classId);
    }

    if (teacherName) {
      sql += ' AND s.teacher_name LIKE ?';
      params.push(`%${teacherName}%`);
    }

    if (classroom) {
      sql += ' AND s.classroom LIKE ?';
      params.push(`%${classroom}%`);
    }

    if (scheduleType) {
      sql += ' AND s.schedule_type = ?';
      params.push(scheduleType);
    }

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    // 获取总数
    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    // 分页查询
    sql += ' ORDER BY s.schedule_date, s.start_time LIMIT ? OFFSET ?';
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    params.push(parseInt(pageSize), offset);

    const [schedules] = await pool.query(sql, params);

    res.json({
      code: 200,
      data: {
        list: schedules,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取排课列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取课程表数据（按不同视图）
router.get('/timetable', async (req, res) => {
  try {
    const {
      viewType = 'time', // time: 时间课表视图, class: 班级课表视图, teacher: 教师课表视图, classroom: 教室课表视图
      startDate,
      endDate,
      campus,
      classId,
      teacherName,
      classroom
    } = req.query;

    let sql = `
      SELECT s.*,
        c.code as class_code,
        st.name as student_name
      FROM schedules s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN students st ON s.student_id = st.id
      WHERE s.schedule_date BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (campus) {
      sql += ' AND c.campus = ?';
      params.push(campus);
    }

    if (classId) {
      sql += ' AND s.class_id = ?';
      params.push(classId);
    }

    if (teacherName) {
      sql += ' AND s.teacher_name = ?';
      params.push(teacherName);
    }

    if (classroom) {
      sql += ' AND s.classroom = ?';
      params.push(classroom);
    }

    sql += ' AND s.status != "cancelled" ORDER BY s.schedule_date, s.start_time';

    const [schedules] = await pool.query(sql, params);

    // 根据视图类型组织数据
    let result = {};

    if (viewType === 'time') {
      // 时间课表视图：按日期和时间段组织
      result = organizeByTime(schedules);
    } else if (viewType === 'class') {
      // 班级课表视图：按班级分组
      result = organizeByClass(schedules);
    } else if (viewType === 'teacher') {
      // 教师课表视图：按教师分组
      result = organizeByTeacher(schedules);
    } else if (viewType === 'classroom') {
      // 教室课表视图：按教室分组
      result = organizeByClassroom(schedules);
    }

    res.json({
      code: 200,
      data: result
    });
  } catch (error) {
    console.error('获取课程表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 按时间组织排课数据
function organizeByTime(schedules) {
  const dateMap = {};

  schedules.forEach(schedule => {
    const date = schedule.schedule_date;
    if (!dateMap[date]) {
      dateMap[date] = [];
    }
    dateMap[date].push(schedule);
  });

  return dateMap;
}

// 按班级组织排课数据
function organizeByClass(schedules) {
  const classMap = {};

  schedules.forEach(schedule => {
    const classKey = schedule.class_code || `一对一-${schedule.student_name}`;
    if (!classMap[classKey]) {
      classMap[classKey] = [];
    }
    classMap[classKey].push(schedule);
  });

  return classMap;
}

// 按教师组织排课数据
function organizeByTeacher(schedules) {
  const teacherMap = {};

  schedules.forEach(schedule => {
    const teacher = schedule.teacher_name || '未分配';
    if (!teacherMap[teacher]) {
      teacherMap[teacher] = [];
    }
    teacherMap[teacher].push(schedule);
  });

  return teacherMap;
}

// 按教室组织排课数据
function organizeByClassroom(schedules) {
  const classroomMap = {};

  schedules.forEach(schedule => {
    const room = schedule.classroom || '未分配';
    if (!classroomMap[room]) {
      classroomMap[room] = [];
    }
    classroomMap[room].push(schedule);
  });

  return classroomMap;
}

// 获取冲突日程
router.get('/conflicts', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // 检测教师时间冲突
    const teacherConflictSql = `
      SELECT
        s1.id as schedule1_id,
        s1.teacher_name,
        s1.schedule_date,
        s1.start_time as start1,
        s1.end_time as end1,
        s1.classroom as classroom1,
        s1.course_name as course1,
        s2.id as schedule2_id,
        s2.start_time as start2,
        s2.end_time as end2,
        s2.classroom as classroom2,
        s2.course_name as course2,
        'teacher' as conflict_type
      FROM schedules s1
      JOIN schedules s2 ON s1.teacher_name = s2.teacher_name
        AND s1.schedule_date = s2.schedule_date
        AND s1.id < s2.id
        AND s1.teacher_name IS NOT NULL
        AND (
          (s1.start_time < s2.end_time AND s1.end_time > s2.start_time)
        )
      WHERE s1.schedule_date BETWEEN ? AND ?
        AND s1.status != 'cancelled'
        AND s2.status != 'cancelled'
    `;

    // 检测教室时间冲突
    const classroomConflictSql = `
      SELECT
        s1.id as schedule1_id,
        s1.classroom,
        s1.schedule_date,
        s1.start_time as start1,
        s1.end_time as end1,
        s1.teacher_name as teacher1,
        s1.course_name as course1,
        s2.id as schedule2_id,
        s2.start_time as start2,
        s2.end_time as end2,
        s2.teacher_name as teacher2,
        s2.course_name as course2,
        'classroom' as conflict_type
      FROM schedules s1
      JOIN schedules s2 ON s1.classroom = s2.classroom
        AND s1.schedule_date = s2.schedule_date
        AND s1.id < s2.id
        AND s1.classroom IS NOT NULL
        AND (
          (s1.start_time < s2.end_time AND s1.end_time > s2.start_time)
        )
      WHERE s1.schedule_date BETWEEN ? AND ?
        AND s1.status != 'cancelled'
        AND s2.status != 'cancelled'
    `;

    const params = [startDate, endDate];

    const [teacherConflicts] = await pool.query(teacherConflictSql, params);
    const [classroomConflicts] = await pool.query(classroomConflictSql, params);

    const conflicts = [...teacherConflicts, ...classroomConflicts];

    res.json({
      code: 200,
      data: conflicts
    });
  } catch (error) {
    console.error('获取冲突日程错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 创建排课
router.post('/', async (req, res) => {
  try {
    const {
      classId,
      studentId,
      courseId,
      courseName,
      teacherId,
      teacherName,
      classroom,
      scheduleDate,
      startTime,
      endTime,
      scheduleType = 'class',
      remark
    } = req.body;

    if (!scheduleDate || !startTime || !endTime) {
      return res.status(400).json({
        code: 400,
        message: '日期和时间不能为空'
      });
    }

    if (!teacherName && !teacherId) {
      return res.status(400).json({
        code: 400,
        message: '教师不能为空'
      });
    }

    // 计算星期几
    const date = new Date(scheduleDate);
    const weekDay = date.getDay() === 0 ? 7 : date.getDay();

    // 检查冲突
    const conflicts = await checkScheduleConflict({
      teacherName,
      classroom,
      scheduleDate,
      startTime,
      endTime
    });

    if (conflicts.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '存在时间冲突',
        data: conflicts
      });
    }

    const [result] = await pool.query(
      `INSERT INTO schedules
        (class_id, student_id, course_id, course_name, teacher_id, teacher_name,
         classroom, schedule_date, start_time, end_time, week_day, schedule_type, remark, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'normal')`,
      [classId, studentId, courseId, courseName, teacherId, teacherName,
       classroom, scheduleDate, startTime, endTime, weekDay, scheduleType, remark]
    );

    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建排课错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 批量导入一对一排课
router.post('/import-onetoone', async (req, res) => {
  try {
    const { schedules } = req.body;

    if (!schedules || !Array.isArray(schedules)) {
      return res.status(400).json({
        code: 400,
        message: '排课数据格式错误'
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const insertedIds = [];
      const conflicts = [];

      for (const schedule of schedules) {
        const {
          studentId,
          courseName,
          teacherName,
          classroom,
          scheduleDate,
          startTime,
          endTime
        } = schedule;

        // 计算星期几
        const date = new Date(scheduleDate);
        const weekDay = date.getDay() === 0 ? 7 : date.getDay();

        // 检查冲突
        const scheduleConflicts = await checkScheduleConflict({
          teacherName,
          classroom,
          scheduleDate,
          startTime,
          endTime
        }, connection);

        if (scheduleConflicts.length > 0) {
          conflicts.push({
            schedule,
            conflicts: scheduleConflicts
          });
          continue;
        }

        const [result] = await connection.query(
          `INSERT INTO schedules
            (student_id, course_name, teacher_name, classroom,
             schedule_date, start_time, end_time, week_day, schedule_type, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'onetoone', 'normal')`,
          [studentId, courseName, teacherName, classroom,
           scheduleDate, startTime, endTime, weekDay]
        );

        insertedIds.push(result.insertId);
      }

      await connection.commit();
      connection.release();

      res.json({
        code: 200,
        message: `成功导入${insertedIds.length}条排课`,
        data: {
          successCount: insertedIds.length,
          conflictCount: conflicts.length,
          conflicts
        }
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('批量导入排课错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 检查排课冲突
async function checkScheduleConflict(params, connection = null) {
  const { teacherName, classroom, scheduleDate, startTime, endTime, excludeId } = params;
  const conn = connection || pool;

  const conflicts = [];

  // 检查教师时间冲突
  if (teacherName) {
    let teacherSql = `
      SELECT * FROM schedules
      WHERE teacher_name = ?
        AND schedule_date = ?
        AND status != 'cancelled'
        AND (
          (start_time < ? AND end_time > ?)
          OR (start_time < ? AND end_time > ?)
          OR (start_time >= ? AND end_time <= ?)
        )
    `;
    const teacherParams = [teacherName, scheduleDate, endTime, startTime, endTime, endTime, startTime, endTime];

    if (excludeId) {
      teacherSql += ' AND id != ?';
      teacherParams.push(excludeId);
    }

    const [teacherConflicts] = await conn.query(teacherSql, teacherParams);

    if (teacherConflicts.length > 0) {
      conflicts.push({
        type: 'teacher',
        message: `教师"${teacherName}"在该时间段已有排课`,
        details: teacherConflicts
      });
    }
  }

  // 检查教室时间冲突
  if (classroom) {
    let classroomSql = `
      SELECT * FROM schedules
      WHERE classroom = ?
        AND schedule_date = ?
        AND status != 'cancelled'
        AND (
          (start_time < ? AND end_time > ?)
          OR (start_time < ? AND end_time > ?)
          OR (start_time >= ? AND end_time <= ?)
        )
    `;
    const classroomParams = [classroom, scheduleDate, endTime, startTime, endTime, endTime, startTime, endTime];

    if (excludeId) {
      classroomSql += ' AND id != ?';
      classroomParams.push(excludeId);
    }

    const [classroomConflicts] = await conn.query(classroomSql, classroomParams);

    if (classroomConflicts.length > 0) {
      conflicts.push({
        type: 'classroom',
        message: `教室"${classroom}"在该时间段已被占用`,
        details: classroomConflicts
      });
    }
  }

  return conflicts;
}

// 更新排课
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      classId,
      studentId,
      courseId,
      courseName,
      teacherId,
      teacherName,
      classroom,
      scheduleDate,
      startTime,
      endTime,
      scheduleType,
      status,
      remark
    } = req.body;

    // 如果修改了时间相关信息，检查冲突
    if (scheduleDate || startTime || endTime || teacherName || classroom) {
      // 获取当前排课信息
      const [current] = await pool.query('SELECT * FROM schedules WHERE id = ?', [id]);

      if (current.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '排课不存在'
        });
      }

      const conflicts = await checkScheduleConflict({
        teacherName: teacherName || current[0].teacher_name,
        classroom: classroom || current[0].classroom,
        scheduleDate: scheduleDate || current[0].schedule_date,
        startTime: startTime || current[0].start_time,
        endTime: endTime || current[0].end_time,
        excludeId: id
      });

      if (conflicts.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '存在时间冲突',
          data: conflicts
        });
      }
    }

    // 计算星期几
    let weekDay = null;
    if (scheduleDate) {
      const date = new Date(scheduleDate);
      weekDay = date.getDay() === 0 ? 7 : date.getDay();
    }

    const [result] = await pool.query(
      `UPDATE schedules SET
        class_id = COALESCE(?, class_id),
        student_id = COALESCE(?, student_id),
        course_id = COALESCE(?, course_id),
        course_name = COALESCE(?, course_name),
        teacher_id = COALESCE(?, teacher_id),
        teacher_name = COALESCE(?, teacher_name),
        classroom = COALESCE(?, classroom),
        schedule_date = COALESCE(?, schedule_date),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        week_day = COALESCE(?, week_day),
        schedule_type = COALESCE(?, schedule_type),
        status = COALESCE(?, status),
        remark = COALESCE(?, remark)
       WHERE id = ?`,
      [classId, studentId, courseId, courseName, teacherId, teacherName,
       classroom, scheduleDate, startTime, endTime, weekDay, scheduleType, status, remark, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '排课不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新排课错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 删除排课
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM schedules WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '排课不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除排课错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 取消排课
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE schedules SET status = 'cancelled' WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '排课不存在'
      });
    }

    res.json({
      code: 200,
      message: '取消成功'
    });
  } catch (error) {
    console.error('取消排课错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取教师列表
router.get('/teachers/list', async (req, res) => {
  try {
    const [teachers] = await pool.query(
      'SELECT * FROM teachers WHERE status = "active" ORDER BY name'
    );

    res.json({
      code: 200,
      data: teachers
    });
  } catch (error) {
    console.error('获取教师列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取课程列表
router.get('/courses/list', async (req, res) => {
  try {
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE status = "active" ORDER BY name'
    );

    res.json({
      code: 200,
      data: courses
    });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
