// PHASE 5: Attendance records for all students
// Existing: 10 records for student_id=1, timetable_entries 1-10
// Avoid uq_att_slot_student_day violations
const mysql = require('mysql2/promise');
const cfg = { host:'localhost', port:3306, user:'root', password:'ausnita1947', database:'smart_campus' };

async function run() {
  const db = await mysql.createConnection(cfg);
  console.log('Connected. Building attendance...');

  // Get all timetable entries with dept/sem info
  const [ttRows] = await db.execute(`SELECT id, department_id, semester, day_of_week, faculty_id FROM timetable_entries`);
  // Get all students with dept/sem
  const [stuRows] = await db.execute(`SELECT id, department_id, semester, user_id FROM students`);
  // Get first faculty user_id for marking
  const [facRows] = await db.execute(`SELECT user_id FROM faculty ORDER BY id LIMIT 1`);
  const markerUserId = facRows[0].user_id; // user_id=2 (admin/first faculty)

  // Map timetable by dept+sem
  const ttMap = {};
  for (const t of ttRows) {
    const k = `${t.department_id}-${t.semester}`;
    if (!ttMap[k]) ttMap[k] = [];
    ttMap[k].push(t);
  }

  // Generate last 30 working days
  const dates = [];
  const d = new Date('2026-05-12');
  while (dates.length < 30) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) dates.push(d.toISOString().slice(0,10));
    d.setDate(d.getDate() - 1);
  }

  const statuses = ['present','present','present','present','present','present','present','absent','present','late'];
  // Yash: 85% present (better performance)
  const yashStatuses = ['present','present','present','present','present','present','present','present','present','late'];

  let count = 0;
  let skip = 0;
  for (const stu of stuRows) {
    const k = `${stu.department_id}-${stu.semester}`;
    const ttEntries = ttMap[k];
    if (!ttEntries || ttEntries.length === 0) continue;
    const isYash = stu.id === 3;
    // Use up to 3 timetable entries per student to keep data manageable
    const useTT = ttEntries.slice(0, 3);
    for (const tt of useTT) {
      for (let i = 0; i < Math.min(dates.length, 20); i++) {
        const date = dates[i];
        const pool = isYash ? yashStatuses : statuses;
        const status = pool[i % pool.length];
        try {
          await db.execute(
            `INSERT IGNORE INTO attendance_records (timetable_entry_id,student_id,attendance_date,status,marked_by) VALUES (?,?,?,?,?)`,
            [tt.id, stu.id, date, status, markerUserId]
          );
          count++;
        } catch(e) { skip++; }
      }
    }
  }
  console.log(`Attendance inserted: ${count}, skipped: ${skip}`);
  await db.end();
  console.log('PHASE 5 DONE.');
}
run().catch(e => { console.error(e); process.exit(1); });
