import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'smart_campus',
} = process.env;

const DAYS = [1, 2, 3, 4, 5];

const TIME_SLOTS = [
  ['09:00:00', '10:00:00'],
  ['10:00:00', '11:00:00'],
  ['11:15:00', '12:15:00'],
  ['12:15:00', '13:15:00'],
  ['14:00:00', '15:00:00'],
  ['15:00:00', '16:00:00'],
];

const SUBJECTS = [
  ['CSE501', 'Database Management Systems'],
  ['CSE502', 'Operating Systems'],
  ['CSE503', 'Computer Networks'],
  ['CSE504', 'Software Engineering'],
  ['CSE505', 'Cloud Computing'],
  ['CSE506', 'Artificial Intelligence'],
];

function gradeMeta(marks) {
  if (marks >= 90) return { grade: 'O', point: 10 };
  if (marks >= 80) return { grade: 'A+', point: 9 };
  if (marks >= 70) return { grade: 'A', point: 8 };
  if (marks >= 60) return { grade: 'B+', point: 7 };
  if (marks >= 50) return { grade: 'B', point: 6 };
  if (marks >= 40) return { grade: 'C', point: 5 };

  return { grade: 'F', point: 0 };
}

async function main() {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
  });

  console.log('🚀 Connected to MySQL');

  const passwordHash = await bcrypt.hash('campus@123', 12);

  await conn.beginTransaction();

  try {
    console.log('🧹 Cleaning existing data...');

    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      'event_registrations',
      'cgpa_records',
      'result_publications',
      'results',
      'subjects',
      'campus_events',
      'uploaded_files',
      'notice_favorites',
      'notice_reads',
      'notice_attachments',
      'audit_logs',
      'activity_logs',
      'attendance_records',
      'notifications',
      'timetable_entries',
      'notices',
      'students',
      'faculty',
      'users',
      'classrooms',
      'campus_places',
      'departments',
    ];

    for (const table of tables) {
      try {
        await conn.query(`TRUNCATE TABLE ${table}`);
        console.log(`✔ Cleared ${table}`);
      } catch (err) {
        console.log(`⚠ Skipped ${table}`);
      }
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('🏢 Seeding departments...');

    await conn.query(`
      INSERT INTO departments (name, code)
      VALUES
      ('Computer Engineering', 'CSE'),
      ('Information Technology', 'IT'),
      ('Electronics Engineering', 'ECE'),
      ('Mechanical Engineering', 'ME'),
      ('Civil Engineering', 'CE'),
      ('AI & Data Science', 'AIDS')
    `);

    const [[dept]] = await conn.query(`
      SELECT id FROM departments
      WHERE code = 'CSE'
      LIMIT 1
    `);

    const deptId = dept.id;

    console.log('🏫 Seeding classrooms...');

    await conn.query(
      `
      INSERT INTO classrooms
      (name, building, floor, capacity, department_id)
      VALUES
      ('A-101', 'Academic Block A', '1', 120, ?),
      ('A-102', 'Academic Block A', '1', 120, ?),
      ('Smart Lab', 'Innovation Hub', '2', 60, ?),
      ('Lab-1', 'Computer Center', '1', 40, ?),
      ('Lab-2', 'Computer Center', '2', 40, ?),
      ('Seminar Hall', 'Main Building', 'G', 200, NULL)
    `,
      [deptId, deptId, deptId, deptId, deptId]
    );

    const [rooms] = await conn.query(`
      SELECT * FROM classrooms ORDER BY id
    `);

    console.log('👤 Creating users...');

    const [adminInsert] = await conn.execute(
      `
      INSERT INTO users
      (
        email,
        password_hash,
        role,
        first_name,
        last_name,
        phone
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        'admin@gmail.com',
        passwordHash,
        'admin',
        'Admin',
        'User',
        '+91 9876543210',
      ]
    );

    const [facultyUserInsert] = await conn.execute(
      `
      INSERT INTO users
      (
        email,
        password_hash,
        role,
        first_name,
        last_name,
        phone
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        'faculty@gmail.com',
        passwordHash,
        'faculty',
        'Jordan',
        'Lee',
        '+91 9876543211',
      ]
    );

    const [studentUserInsert] = await conn.execute(
      `
      INSERT INTO users
      (
        email,
        password_hash,
        role,
        first_name,
        last_name,
        phone
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        'student@gmail.com',
        passwordHash,
        'student',
        'Alex',
        'Rivera',
        '+91 9876543212',
      ]
    );

    const adminUserId = adminInsert.insertId;
    const facultyUserId = facultyUserInsert.insertId;
    const studentUserId = studentUserInsert.insertId;

    console.log('🎓 Creating faculty/student profiles...');

    const [facultyInsert] = await conn.execute(
      `
      INSERT INTO faculty
      (
        user_id,
        employee_code,
        department_id,
        designation,
        specialization
      )
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        facultyUserId,
        'FAC-CSE-001',
        deptId,
        'Assistant Professor',
        'Artificial Intelligence',
      ]
    );

    const facultyId = facultyInsert.insertId;

    const [studentInsert] = await conn.execute(
      `
      INSERT INTO students
      (
        user_id,
        student_code,
        department_id,
        semester,
        enrollment_year
      )
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        studentUserId,
        'CSE24-1042',
        deptId,
        5,
        2024,
      ]
    );

    const studentId = studentInsert.insertId;

    console.log('📘 Seeding subjects...');

    for (const [code, name] of SUBJECTS) {
      await conn.execute(
        `
        INSERT INTO subjects
        (
          code,
          name,
          credits,
          semester,
          department_id,
          total_marks,
          passing_marks
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          code,
          name,
          4,
          5,
          deptId,
          100,
          40,
        ]
      );
    }

    const [subjectRows] = await conn.query(`
      SELECT * FROM subjects
      ORDER BY id
    `);

    console.log('🗓 Creating timetable...');

    let subjectIndex = 0;

    for (const day of DAYS) {
      for (let i = 0; i < TIME_SLOTS.length; i++) {
        const subject = subjectRows[subjectIndex % subjectRows.length];
        const room = rooms[i % rooms.length];

        await conn.execute(
          `
          INSERT INTO timetable_entries
          (
            department_id,
            semester,
            day_of_week,
            start_time,
            end_time,
            subject_name,
            faculty_id,
            classroom_id,
            section
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            deptId,
            5,
            day,
            TIME_SLOTS[i][0],
            TIME_SLOTS[i][1],
            subject.name,
            facultyId,
            room.id,
            'A',
          ]
        );

        subjectIndex++;
      }
    }

    console.log('📢 Seeding notices...');

    const notices = [
      {
        title: 'Semester Examination Schedule Released',
        body:
          'Semester V examination timetable has been officially published.',
        role: 'student',
        priority: 'urgent',
      },
      {
        title: 'AI Innovation Hackathon',
        body:
          'Registrations are now open for the national AI Hackathon event.',
        role: 'all',
        priority: 'high',
      },
      {
        title: 'Faculty Attendance Submission',
        body:
          'All faculty members must complete attendance updates before Friday.',
        role: 'faculty',
        priority: 'normal',
      },
      {
        title: 'Campus Network Maintenance',
        body:
          'Campus servers will undergo maintenance on Saturday night.',
        role: 'all',
        priority: 'high',
      },
    ];

    for (const notice of notices) {
      await conn.execute(
        `
        INSERT INTO notices
        (
          title,
          body,
          author_id,
          target_role,
          department_id,
          notice_category,
          priority
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          notice.title,
          notice.body,
          adminUserId,
          notice.role,
          deptId,
          'general',
          notice.priority,
        ]
      );
    }

    console.log('🎉 Seeding campus events...');

    const events = [
      {
        title: 'AI Innovation Hackathon',
        category: 'academic',
        location: 'Innovation Hub',
        desc:
          '24-hour coding and innovation challenge focused on AI solutions.',
      },
      {
        title: 'Placement Drive 2026',
        category: 'career',
        location: 'Seminar Hall',
        desc:
          'Top recruiters visiting campus for internship and placement hiring.',
      },
      {
        title: 'Cloud Computing Workshop',
        category: 'academic',
        location: 'Smart Lab',
        desc:
          'Hands-on AWS and cloud-native application workshop.',
      },
    ];

    for (const event of events) {
      await conn.execute(
        `
        INSERT INTO campus_events
        (
          title,
          description,
          category,
          location,
          starts_at,
          ends_at,
          created_by,
          target_role,
          department_id,
          is_featured
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          event.title,
          event.desc,
          event.category,
          event.location,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          facultyUserId,
          'all',
          deptId,
          1,
        ]
      );
    }

    console.log('📊 Seeding results...');

    let totalPoints = 0;
    let totalCredits = 0;

    for (const subject of subjectRows) {
      const marks = Math.floor(Math.random() * 20) + 75;

      const meta = gradeMeta(marks);

      totalPoints += meta.point * subject.credits;
      totalCredits += subject.credits;

      await conn.execute(
        `
        INSERT INTO results
        (
          student_id,
          subject_id,
          faculty_id,
          semester,
          exam_type,
          marks_obtained,
          total_marks,
          percentage,
          grade,
          grade_point,
          remarks,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          studentId,
          subject.id,
          facultyId,
          5,
          'endterm',
          marks,
          100,
          marks,
          meta.grade,
          meta.point,
          'Excellent performance',
          'pass',
        ]
      );
    }

    const sgpa = (
      totalPoints / totalCredits
    ).toFixed(2);

    await conn.execute(
      `
      INSERT INTO cgpa_records
      (
        student_id,
        semester,
        sgpa,
        cgpa,
        total_credits
      )
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        studentId,
        5,
        sgpa,
        sgpa,
        totalCredits,
      ]
    );

    await conn.execute(
      `
      INSERT INTO result_publications
      (
        semester,
        department_id,
        published,
        published_at,
        published_by
      )
      VALUES (?, ?, ?, NOW(), ?)
    `,
      [
        5,
        deptId,
        1,
        adminUserId,
      ]
    );

    console.log('📅 Seeding attendance...');

    const [ttRows] = await conn.query(`
      SELECT * FROM timetable_entries
      LIMIT 10
    `);

    for (let i = 0; i < ttRows.length; i++) {
      await conn.execute(
        `
        INSERT INTO attendance_records
        (
          timetable_entry_id,
          student_id,
          attendance_date,
          status,
          marked_by
        )
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          ttRows[i].id,
          studentId,
          new Date(Date.now() - i * 86400000),
          i % 5 === 0 ? 'absent' : 'present',
          facultyUserId,
        ]
      );
    }

    console.log('🔔 Seeding notifications...');

    const notifications = [
      'Semester results published successfully.',
      'New notice available on dashboard.',
      'Upcoming placement drive announced.',
      'Timetable updated for Semester V.',
    ];

    for (const msg of notifications) {
      await conn.execute(
        `
        INSERT INTO notifications
        (
          user_id,
          title,
          message,
          type
        )
        VALUES (?, ?, ?, ?)
      `,
        [
          studentUserId,
          'Campus Notification',
          msg,
          'notice',
        ]
      );
    }

    console.log('📝 Seeding activity logs...');

    const activities = [
      'Faculty updated internal marks',
      'Student viewed semester results',
      'Admin published academic notice',
      'Result analytics generated',
    ];

    for (const activity of activities) {
      await conn.execute(
        `
        INSERT INTO activity_logs
        (
          user_id,
          action,
          details
        )
        VALUES (?, ?, ?)
      `,
        [
          adminUserId,
          activity,
          'Automated seed activity',
        ]
      );
    }

    console.log('📂 Seeding uploaded files...');

    await conn.execute(
      `
      INSERT INTO uploaded_files
      (
        user_id,
        scope,
        entity_type,
        entity_id,
        public_path,
        stored_name,
        original_name,
        mime_type,
        size_bytes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        adminUserId,
        'event_banner',
        'campus_event',
        '1',
        '/uploads/events/banner1.jpg',
        'banner1.jpg',
        'banner1.jpg',
        'image/jpeg',
        204800,
      ]
    );

    console.log('📌 Seeding event registrations...');

    const [eventsRows] = await conn.query(`
      SELECT * FROM campus_events
    `);

    for (const event of eventsRows) {
      await conn.execute(
        `
        INSERT INTO event_registrations
        (
          event_id,
          user_id,
          role_at_register,
          registration_code
        )
        VALUES (?, ?, ?, ?)
      `,
        [
          event.id,
          studentUserId,
          'student',
          randomUUID(),
        ]
      );
    }

    console.log('🔐 Seeding audit logs...');

    await conn.execute(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        entity_type,
        entity_id,
        metadata,
        ip_address,
        user_agent
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        adminUserId,
        'DATABASE_SEED',
        'system',
        'seed.js',
        JSON.stringify({
          status: 'success',
        }),
        '127.0.0.1',
        'Seed Script',
      ]
    );

    await conn.commit();

    console.log('');
    console.log('======================================');
    console.log('✅ SMART CAMPUS DATABASE SEEDED');
    console.log('======================================');
    console.log('');
    console.log('ADMIN LOGIN');
    console.log('Email: admin@gmail.com');
    console.log('Password: campus@123');
    console.log('');
    console.log('FACULTY LOGIN');
    console.log('Email: faculty@gmail.com');
    console.log('Password: campus@123');
    console.log('');
    console.log('STUDENT LOGIN');
    console.log('Email: student@gmail.com');
    console.log('Password: campus@123');
    console.log('');

    await conn.end();

    process.exit(0);
  } catch (err) {
    await conn.rollback();

    console.error('❌ SEED FAILED');
    console.error(err);

    await conn.end();

    process.exit(1);
  }
}

main();