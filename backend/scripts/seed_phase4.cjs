// PHASE 4: Timetable entries for all depts/semesters
// Existing: IDs 1-30 (CSE sem5, Mon-Fri)
// Faculty mapping: dept1=fac1,2,3 | dept2=fac4,5 | dept3=fac6,7 | dept4=fac8,9 | dept5=fac10,11 | dept6=fac12,13
// Classroom mapping: dept1=1-5,17 | dept2=7,8 | dept3=9,10,18 | dept4=11,12,19 | dept5=13,14,20 | dept6=15,16
const mysql = require('mysql2/promise');
const cfg = { host:'localhost', port:3306, user:'root', password:'ausnita1947', database:'smart_campus' };

const slots = [
  ['08:00:00','09:00:00'],['09:00:00','10:00:00'],['10:00:00','11:00:00'],
  ['11:15:00','12:15:00'],['12:15:00','13:15:00']
];

// depts to generate: [ dept_id, semesters[], faculty_ids[], classroom_ids[] ]
const deptConfig = [
  [1, [1,3,7], [1,2,3],   [1,2,17,3,4]],   // CSE — sems 1,3,7 (sem5 already done via existing 30 entries)
  [2, [1,3,5,7], [4,5],   [7,8,7,8]],       // IT
  [3, [1,3,5,7], [6,7],   [9,10,18,9]],     // ECE
  [4, [1,3,5,7], [8,9],   [11,12,19,11]],   // ME
  [5, [1,3,5,7], [10,11], [13,14,20,13]],   // CE
  [6, [1,3,5,7], [12,13], [15,16,15,16]],   // AIDS
];

// subject names per dept/sem combo (5 subjects = Mon-Fri one per day)
const subjectMap = {
  '1-1': ['Engg Mathematics I','Applied Physics','Programming in C','Basic Electrical Engg','Engineering Graphics'],
  '1-3': ['OOP with Java','Computer Organization','Discrete Mathematics','Electronics Fundamentals','Microprocessors'],
  '1-7': ['Deep Learning','Blockchain Technology','IoT Systems','Advanced Algorithms','Research Methodology'],
  '2-1': ['Engg Mathematics I','Applied Physics','Programming Fundamentals','Computer Fundamentals','Communication Skills'],
  '2-3': ['Database Management','Computer Networks','System Analysis & Design','Web Technologies','Software Testing'],
  '2-5': ['Distributed Systems','Network Security','Web Frameworks','Data Mining','IoT Fundamentals'],
  '2-7': ['Cloud Architecture','Cyber Forensics','AI Applications','Agile Development','Industry Project'],
  '3-1': ['Engg Mathematics I','Applied Physics','Basic Electronics','Programming in C','Engineering Graphics'],
  '3-3': ['Signals and Systems','Analog Electronics','Microprocessors','Communication Systems','Electromagnetic Theory'],
  '3-5': ['Wireless Communication','Digital Signal Processing','Antenna Design','RF Engineering','Optical Fiber Comm'],
  '3-7': ['Advanced Embedded Systems','Robotics','ML for Signal Processing','MEMS Technology','Industry Project'],
  '4-1': ['Engg Mathematics I','Applied Physics','Engineering Chemistry','Engineering Graphics','Workshop Practice'],
  '4-3': ['Fluid Mechanics','Strength of Materials','Kinematics of Machinery','Machine Drawing','Applied Thermodynamics'],
  '4-5': ['Machine Design I','Automobile Engineering','Hydraulics & Pneumatics','CAD CAM','Operations Research'],
  '4-7': ['Advanced Manufacturing','Mechatronics','Quality Engineering','Project Work','Research Methods'],
  '5-1': ['Engg Mathematics I','Applied Physics','Engineering Chemistry','Engineering Graphics','Communication Skills'],
  '5-3': ['Structural Analysis','Fluid Mechanics','Surveying II','Geotechnical Engineering','Construction Materials'],
  '5-5': ['Concrete Technology','Geotechnical Engg II','Highway Engineering','Water Resources Engg','Structural Design'],
  '5-7': ['Bridge Design','Smart Cities','Pavement Design','Project Management','Industry Project'],
  '6-1': ['Engg Mathematics I','Statistics I','Programming in Python','Computer Fundamentals','Communication Skills'],
  '6-3': ['Machine Learning I','Probability Theory','Linear Algebra for AI','Data Visualization','Web Technologies'],
  '6-5': ['Advanced ML','Reinforcement Learning','Big Data Analytics','AI Ethics & Policy','Research Methods'],
  '6-7': ['Advanced Deep Learning','AI System Design','Responsible AI','Industry Project','Research Methodology'],
};

async function run() {
  const db = await mysql.createConnection(cfg);
  console.log('Connected. Inserting timetable...');
  let count = 0;
  for (const [dept_id, sems, facIds, roomIds] of deptConfig) {
    for (let si = 0; si < sems.length; si++) {
      const sem = sems[si];
      const fac = facIds[si % facIds.length];
      const room = roomIds[si % roomIds.length];
      const key = `${dept_id}-${sem}`;
      const subjects = subjectMap[key] || ['Subject A','Subject B','Subject C','Subject D','Subject E'];
      for (let day = 1; day <= 5; day++) {
        const subj = subjects[(day-1) % subjects.length];
        const [st, et] = slots[(day-1) % slots.length];
        try {
          await db.execute(
            `INSERT IGNORE INTO timetable_entries (department_id,semester,day_of_week,start_time,end_time,subject_name,faculty_id,classroom_id,section) VALUES (?,?,?,?,?,?,?,?,?)`,
            [dept_id, sem, day, st, et, subj, fac, room, 'A']
          );
          count++;
        } catch(e) { console.error(`TT skip: ${e.message}`); }
      }
    }
  }
  console.log(`Timetable entries inserted: ${count}`);
  await db.end();
  console.log('PHASE 4 DONE.');
}
run().catch(e => { console.error(e); process.exit(1); });
