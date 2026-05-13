// PHASE 1: Extra Classrooms + Faculty (users + faculty records)
const mysql = require('mysql2/promise');

const cfg = { host:'localhost', port:3306, user:'root', password:'ausnita1947', database:'smart_campus', multipleStatements:true };

// Hashes: campus@123 = $2a$12$xjR590gBxmlJwsPyTs.c6.ZegjDBLmQvA0g7HRBvFXObQ3QEcKgYm
const HASH = '$2a$12$xjR590gBxmlJwsPyTs.c6.ZegjDBLmQvA0g7HRBvFXObQ3QEcKgYm';

const classrooms = [
  [7,'B-101','Academic Block B','1',80,2],[8,'B-102','Academic Block B','1',80,2],
  [9,'C-101','Academic Block C','1',80,3],[10,'C-102','Academic Block C','1',80,3],
  [11,'D-101','Mechanical Block','1',60,4],[12,'D-102','Mechanical Block','1',60,4],
  [13,'E-101','Civil Block','1',60,5],[14,'E-102','Civil Block','1',60,5],
  [15,'F-101','AI & Data Science Block','1',80,6],[16,'F-102','AI & Data Science Block','1',80,6],
  [17,'Lab-CSE-3','Computer Center','2',40,1],[18,'ECE-Lab','Electronics Block','1',40,3],
  [19,'Mech-Lab','Mechanical Block','1',30,4],[20,'Civil-Lab','Civil Block','1',30,5],
];

// faculty: [user_id, email, first, last, phone, faculty_id, emp_code, dept_id, designation, specialization]
const facultyData = [
  [5,'rajesh.sharma@campus.edu','Rajesh','Sharma','9800000001',2,'FAC-CSE-002',1,'Associate Professor','Algorithms & Theory'],
  [6,'priya.kulkarni@campus.edu','Priya','Kulkarni','9800000002',3,'FAC-CSE-003',1,'Assistant Professor','Machine Learning'],
  [7,'vivek.patil@campus.edu','Vivek','Patil','9800000003',4,'FAC-IT-001',2,'Associate Professor','Network Security'],
  [8,'sneha.iyer@campus.edu','Sneha','Iyer','9800000004',5,'FAC-IT-002',2,'Assistant Professor','Cloud & DevOps'],
  [9,'amit.deshmukh@campus.edu','Amit','Deshmukh','9800000005',6,'FAC-ECE-001',3,'Professor','VLSI Design'],
  [10,'rohan.mehta@campus.edu','Rohan','Mehta','9800000006',7,'FAC-ECE-002',3,'Assistant Professor','Embedded Systems'],
  [11,'suresh.nair@campus.edu','Suresh','Nair','9800000007',8,'FAC-ME-001',4,'Professor','Thermodynamics'],
  [12,'kavita.joshi@campus.edu','Kavita','Joshi','9800000008',9,'FAC-ME-002',4,'Associate Professor','Machine Design'],
  [13,'anil.kumar@campus.edu','Anil','Kumar','9800000009',10,'FAC-CE-001',5,'Professor','Structural Engineering'],
  [14,'meera.pillai@campus.edu','Meera','Pillai','9800000010',11,'FAC-CE-002',5,'Associate Professor','Geotechnical Engineering'],
  [15,'deepak.verma@campus.edu','Deepak','Verma','9800000011',12,'FAC-AIDS-001',6,'Professor','Deep Learning & AI'],
  [16,'ananya.singh@campus.edu','Ananya','Singh','9800000012',13,'FAC-AIDS-002',6,'Assistant Professor','Data Science & Statistics'],
];

async function run() {
  const db = await mysql.createConnection(cfg);
  console.log('Connected.');

  // Classrooms
  for (const [id,name,building,floor,cap,dept_id] of classrooms) {
    await db.execute(
      `INSERT IGNORE INTO classrooms (id,name,building,floor,capacity,department_id) VALUES (?,?,?,?,?,?)`,
      [id,name,building,floor,cap,dept_id]
    );
  }
  console.log('Classrooms inserted.');

  // Faculty users
  for (const [uid,email,fn,ln,phone,fid,emp,dept,desig,spec] of facultyData) {
    await db.execute(
      `INSERT IGNORE INTO users (id,email,password_hash,role,first_name,last_name,phone) VALUES (?,?,?,'faculty',?,?,?)`,
      [uid,email,HASH,fn,ln,phone]
    );
    await db.execute(
      `INSERT IGNORE INTO faculty (id,user_id,employee_code,department_id,designation,specialization) VALUES (?,?,?,?,?,?)`,
      [fid,uid,emp,dept,desig,spec]
    );
  }
  console.log('Faculty inserted.');

  await db.end();
  console.log('PHASE 1 DONE.');
}
run().catch(e => { console.error(e); process.exit(1); });
