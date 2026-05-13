// PHASE 7: Notices, Events, Campus Places, Notifications, Logs, Result Publications
const mysql = require('mysql2/promise');
const cfg = { host:'localhost', port:3306, user:'root', password:'ausnita1947', database:'smart_campus' };

async function run() {
  const db = await mysql.createConnection(cfg);
  console.log('Connected. Inserting misc data...');

  const adminId = 1; // admin user

  // ── CAMPUS PLACES ─────────────────────────────────────────────────────────
  const places = [
    ['Central Library','facility','Library Block','G','Premier academic library with 50,000+ volumes, digital resources & study zones',20.00,30.00],
    ['Main Auditorium','facility','Auditorium Block','G','2000-seat state-of-the-art auditorium for convocations and cultural events',50.00,40.00],
    ['Administration Block','building','Admin Block','G','Central administration offices, exam cell, and registrar office',45.00,20.00],
    ['Computer Lab Center','facility','Computer Center','G','300-seat computer lab with high-speed internet and latest hardware',25.00,50.00],
    ['Electronics Lab','facility','Academic Block C','1','Advanced electronics and communication lab with modern instruments',30.00,55.00],
    ['Mechanical Workshop','facility','Mechanical Block','G','Fully equipped workshop for manufacturing and mechanical experiments',35.00,60.00],
    ['Civil Engineering Lab','facility','Civil Block','G','Material testing, surveying, and fluid mechanics laboratories',40.00,65.00],
    ['Boys Hostel A','hostel','Hostel Block A','G','500-capacity boys hostel with Wi-Fi, gymnasium, and cafeteria',70.00,20.00],
    ['Boys Hostel B','hostel','Hostel Block B','G','300-capacity boys hostel with modern amenities',75.00,25.00],
    ['Girls Hostel','hostel','Hostel Block C','G','400-capacity girls hostel with 24/7 security and amenities',80.00,20.00],
    ['Sports Complex','sports','Sports Ground','G','Olympic-size pool, indoor courts, cricket ground and athletics track',15.00,70.00],
    ['Main Cafeteria','facility','Cafeteria Block','G','Multi-cuisine cafeteria serving 1500+ students daily',55.00,45.00],
    ['Innovation Hub','building','Innovation Hub','G','Startup incubation center with co-working spaces and maker labs',60.00,50.00],
    ['Medical Center','facility','Health Block','G','24/7 campus medical center with qualified doctors and emergency care',65.00,55.00],
    ['Placement Cell','building','Admin Block','1','Career services, placement drives coordination, and alumni network hub',45.00,25.00],
  ];
  for (const [name,category,building,floor,desc,mx,my] of places) {
    await db.execute(
      `INSERT IGNORE INTO campus_places (name,category,building,floor,description,map_x,map_y) VALUES (?,?,?,?,?,?,?)`,
      [name,category,building,floor,desc,mx,my]
    );
  }
  console.log('Campus places inserted.');

  // ── NOTICES ───────────────────────────────────────────────────────────────
  const notices = [
    ['End Semester Examination Schedule – May 2026','The End Semester Examinations for all programs will commence from May 25, 2026. Students are advised to download their hall tickets from the student portal by May 20, 2026. Examination timings: 10:00 AM – 1:00 PM. Reporting time: 9:30 AM.',adminId,'student',null,'exam','urgent'],
    ['Campus Placement Drive – Infosys & TCS','Infosys and TCS will be conducting their campus recruitment drive on May 28-29, 2026. Eligible students (CGPA ≥ 7.0, no active backlogs) from all final year branches are invited to register on the placement portal by May 22, 2026.',adminId,'student',null,'placement','high'],
    ['Annual Cultural Fest – ZEAL 2026','ZEAL 2026, the annual cultural extravaganza, is scheduled for June 5-7, 2026. Students can register for various events including music, dance, drama, fine arts, and literary activities. Prize pool worth ₹2,00,000.',adminId,'all',null,'cultural','high'],
    ['National Hackathon – SmartIndia 2026','Registration open for SmartIndia Hackathon 2026. Teams of 6 members from any department can register. Problem statements released. Last date for internal screening: May 18, 2026. Contact: hackathon@campus.edu.',adminId,'student',null,'academic','high'],
    ['Faculty Development Programme – AI & ML','A 5-day Faculty Development Programme on Artificial Intelligence and Machine Learning will be conducted from June 1-5, 2026. Faculty members are encouraged to enroll through the faculty portal. Certificate of completion will be awarded.',adminId,'faculty',null,'academic','normal'],
    ['Sports Tournament Registration Open','Inter-department Sports Tournament 2026 registration is now open. Events include Cricket, Football, Basketball, Badminton, Table Tennis, and Chess. Register your department team by May 20, 2026.',adminId,'all',null,'sports','normal'],
    ['Maintenance Notice – Campus Network','Planned network maintenance will be carried out on May 15, 2026 from 11 PM to 3 AM. Campus Wi-Fi and online services will be temporarily unavailable. We apologize for the inconvenience.',adminId,'all',null,'maintenance','high'],
    ['Scholarship Application Deadline','Applications for merit scholarships (State Government, Institute Merit, and Need-Based) are due by May 31, 2026. Upload required documents on the scholarship portal. Contact the accounts section for assistance.',adminId,'student',null,'academic','urgent'],
    ['Alumni Meet 2026 – Registration','The annual Alumni Meet will be held on June 15, 2026 at the Main Auditorium. Final year students and alumni can register at the alumni portal. A grand dinner and networking session is planned.',adminId,'all',null,'general','normal'],
    ['Updated Academic Calendar 2026-27','The academic calendar for the year 2026-27 has been published. Students and faculty can download it from the Downloads section of the campus portal. Odd semester begins July 15, 2026.',adminId,'all',null,'academic','normal'],
  ];
  for (const [title,body,author,target,dept,category,priority] of notices) {
    await db.execute(
      `INSERT INTO notices (title,body,author_id,target_role,department_id,notice_category,priority) VALUES (?,?,?,?,?,?,?)`,
      [title,body,author,target,dept,category,priority]
    );
  }
  console.log('Notices inserted.');

  // ── CAMPUS EVENTS ─────────────────────────────────────────────────────────
  const events = [
    ['SmartIndia Hackathon 2026','36-hour national-level hackathon with problem statements from government ministries. Open to teams of 6. Prizes worth ₹5 Lakhs.','academic','Innovation Hub','2026-06-10 09:00:00','2026-06-11 21:00:00',adminId,'student',null,1,500],
    ['TCS & Infosys Campus Placement','Campus recruitment drive by TCS and Infosys for eligible final-year students. Pre-placement talks, aptitude tests, and interviews.','career','Main Auditorium','2026-05-28 09:00:00','2026-05-29 18:00:00',adminId,'student',null,1,300],
    ['ZEAL 2026 – Annual Cultural Fest','Three-day annual cultural festival featuring music competitions, dance battles, drama, fine arts, and celebrity performances.','cultural','Sports Complex','2026-06-05 10:00:00','2026-06-07 22:00:00',adminId,'all',null,1,2000],
    ['Alumni Networking Meet 2026','Annual alumni gathering with industry talks, mentoring sessions, and networking dinner. Connect with 200+ working alumni.','general','Main Auditorium','2026-06-15 11:00:00','2026-06-15 20:00:00',adminId,'all',null,0,500],
    ['AI & Deep Learning Workshop','Two-day hands-on workshop on modern AI architectures, LLMs, and deployment. Led by industry experts from NVIDIA and Google.','academic','Computer Lab Center','2026-05-20 09:00:00','2026-05-21 17:00:00',adminId,'all',null,1,100],
    ['Inter-Department Sports Tournament','Annual sports tournament across 8 disciplines. Department teams compete for the Rolling Trophy and cash prizes.','sports','Sports Complex','2026-05-25 08:00:00','2026-05-30 18:00:00',adminId,'all',null,0,null],
    ['Project Exhibition 2026','Final year project exhibition open to students, faculty, and industry partners. Best projects receive funding support.','academic','Innovation Hub','2026-06-20 10:00:00','2026-06-20 17:00:00',adminId,'all',null,0,null],
  ];
  for (const [title,desc,cat,loc,start,end,by,target,dept,feat,maxA] of events) {
    await db.execute(
      `INSERT INTO campus_events (title,description,category,location,starts_at,ends_at,created_by,target_role,department_id,is_featured,max_attendees) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [title,desc,cat,loc,start,end,by,target,dept,feat,maxA]
    );
  }
  console.log('Events inserted.');

  // ── EVENT REGISTRATIONS ───────────────────────────────────────────────────
  // Get new event IDs and student user IDs for registrations
  const [evRows] = await db.execute(`SELECT id FROM campus_events WHERE id > 3 ORDER BY id LIMIT 7`);
  const [stuUserRows] = await db.execute(
    `SELECT u.id as user_id FROM users u JOIN students s ON s.user_id=u.id WHERE u.id >= 17 LIMIT 30`
  );
  const { v4: uuidv4 } = require('crypto');

  for (const ev of evRows) {
    for (let i = 0; i < Math.min(8, stuUserRows.length); i++) {
      const uid = stuUserRows[i].user_id;
      const code = require('crypto').randomUUID();
      try {
        await db.execute(
          `INSERT IGNORE INTO event_registrations (event_id,user_id,role_at_register,registration_code) VALUES (?,?,'student',?)`,
          [ev.id, uid, code]
        );
      } catch(e) { /* skip */ }
    }
  }
  console.log('Event registrations inserted.');

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  const [allUsers] = await db.execute(`SELECT id, role FROM users WHERE id >= 3`);
  const notifTemplates = [
    ['Exam Schedule Published','Your end-semester examination schedule has been published. Check the Notices section for details.','notice'],
    ['Attendance Alert','Your attendance in Data Structures has fallen below 75%. Please attend classes regularly to avoid debarment.','alert'],
    ['Result Available','Your Semester 5 results have been published. Login to view your grades and CGPA.','result'],
    ['Event Registration Confirmed','Your registration for SmartIndia Hackathon 2026 has been confirmed. Check your email for the team code.','event'],
    ['New Notice Posted','A new important notice has been posted: Campus Placement Drive – Infosys & TCS.','notice'],
    ['Timetable Updated','Your class timetable has been updated for the upcoming week. Please check the Timetable section.','timetable'],
    ['Assignment Deadline Reminder','Reminder: Database Systems assignment is due tomorrow at 11:59 PM. Submit via the portal.','reminder'],
  ];
  for (const user of allUsers) {
    const picks = notifTemplates.slice(0, user.role === 'faculty' ? 3 : 5);
    for (const [title, message, type] of picks) {
      try {
        await db.execute(
          `INSERT INTO notifications (user_id,title,message,type) VALUES (?,?,?,?)`,
          [user.id, title, message, type]
        );
      } catch(e) { /* skip */ }
    }
  }
  console.log('Notifications inserted.');

  // ── ACTIVITY LOGS ─────────────────────────────────────────────────────────
  const actLogs = [
    [1,'LOGIN','Admin logged in from 192.168.1.100'],
    [2,'LOGIN','Faculty Jordan Lee logged in'],
    [3,'VIEW_RESULT','Student viewed semester 5 results'],
    [17,'LOGIN','Yash Surve logged in for the first time'],
    [17,'VIEW_TIMETABLE','Yash Surve viewed CSE sem7 timetable'],
    [17,'VIEW_RESULT','Yash Surve checked academic results'],
    [5,'CREATE_TIMETABLE','Dr. Rajesh Sharma updated timetable for CSE sem1'],
    [1,'PUBLISH_RESULT','Admin published results for CSE semester 7'],
    [12,'MARK_ATTENDANCE','Prof. Kavita Joshi marked attendance for ME sem5'],
    [1,'CREATE_NOTICE','Admin posted exam schedule circular'],
  ];
  for (const [uid, action, details] of actLogs) {
    await db.execute(`INSERT INTO activity_logs (user_id,action,details) VALUES (?,?,?)`, [uid,action,details]);
  }
  console.log('Activity logs inserted.');

  // ── AUDIT LOGS ────────────────────────────────────────────────────────────
  const auditLogs = [
    [1,'user.login','users','1','{}','192.168.1.100','Mozilla/5.0 Chrome/124'],
    [2,'user.login','users','2','{}','192.168.1.105','Mozilla/5.0 Firefox/125'],
    [1,'notice.create','notices','6','{"priority":"urgent"}','192.168.1.100','Mozilla/5.0 Chrome/124'],
    [17,'user.login','users','17','{}','192.168.1.200','Mozilla/5.0 Chrome/124'],
    [1,'result.publish','result_publications','1','{"semester":7,"dept":1}','192.168.1.100','Mozilla/5.0 Chrome/124'],
  ];
  for (const [uid,action,etype,eid,meta,ip,ua] of auditLogs) {
    await db.execute(
      `INSERT INTO audit_logs (user_id,action,entity_type,entity_id,metadata,ip_address,user_agent) VALUES (?,?,?,?,?,?,?)`,
      [uid,action,etype,eid,meta,ip,ua]
    );
  }
  console.log('Audit logs inserted.');

  // ── RESULT PUBLICATIONS ────────────────────────────────────────────────────
  const deptIds = [1,2,3,4,5,6];
  const publishedSems = [1,3,5,7];
  for (const dept of deptIds) {
    for (const sem of publishedSems) {
      try {
        await db.execute(
          `INSERT IGNORE INTO result_publications (semester,department_id,published,published_at,published_by) VALUES (?,?,1,NOW(),1)`,
          [sem,dept]
        );
      } catch(e) { /* skip */ }
    }
  }
  console.log('Result publications inserted.');

  await db.end();
  console.log('PHASE 7 DONE.');
}
run().catch(e => { console.error(e); process.exit(1); });
