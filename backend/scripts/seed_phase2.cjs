// PHASE 2: Subjects — all 6 depts × 8 semesters (skip existing CSE sem5 IDs 1-6)
const mysql = require('mysql2/promise');
const cfg = { host:'localhost', port:3306, user:'root', password:'ausnita1947', database:'smart_campus' };

// dept_id, sem, code, name, credits
const subjects = [
// CSE sem1
[1,1,'CSE101','Engineering Mathematics I',4],[1,1,'CSE102','Applied Physics',3],[1,1,'CSE103','Basic Electrical Engineering',4],[1,1,'CSE104','Programming in C',4],[1,1,'CSE105','Engineering Graphics',2],
// CSE sem2
[1,2,'CSE201','Engineering Mathematics II',4],[1,2,'CSE202','Applied Chemistry',3],[1,2,'CSE203','Data Structures',4],[1,2,'CSE204','Digital Logic Design',4],[1,2,'CSE205','Environmental Studies',2],
// CSE sem3
[1,3,'CSE301','OOP with Java',4],[1,3,'CSE302','Computer Organization',4],[1,3,'CSE303','Discrete Mathematics',4],[1,3,'CSE304','Electronics Fundamentals',3],[1,3,'CSE305','Microprocessors',4],
// CSE sem4
[1,4,'CSE401','Theory of Computation',4],[1,4,'CSE402','System Programming',4],[1,4,'CSE403','Computer Graphics',3],[1,4,'CSE404','Web Technologies',4],[1,4,'CSE405','Computer Architecture',4],
// CSE sem5 — skip (IDs 1-6 already exist); these will get new codes to avoid uq_subject_dept_sem_code
// CSE sem6
[1,6,'CSE601','Machine Learning',4],[1,6,'CSE602','Cryptography & Security',4],[1,6,'CSE603','Distributed Systems',4],[1,6,'CSE604','Mobile Computing',3],[1,6,'CSE605','Project Management',2],
// CSE sem7
[1,7,'CSE701','Deep Learning',4],[1,7,'CSE702','Blockchain Technology',3],[1,7,'CSE703','IoT Systems',4],[1,7,'CSE704','Advanced Algorithms',4],[1,7,'CSE705','Research Methodology',2],
// CSE sem8
[1,8,'CSE801','Cloud Architecture',4],[1,8,'CSE802','Cyber Security',4],[1,8,'CSE803','Big Data Analytics',4],[1,8,'CSE804','Capstone Project',6],[1,8,'CSE805','Entrepreneurship',2],
// IT sem1
[2,1,'IT101','Engineering Mathematics I',4],[2,1,'IT102','Applied Physics',3],[2,1,'IT103','Programming Fundamentals',4],[2,1,'IT104','Computer Fundamentals',3],[2,1,'IT105','Communication Skills',2],
// IT sem2
[2,2,'IT201','Engineering Mathematics II',4],[2,2,'IT202','Data Structures',4],[2,2,'IT203','Digital Electronics',4],[2,2,'IT204','Object Oriented Programming',4],[2,2,'IT205','Environmental Studies',2],
// IT sem3
[2,3,'IT301','Database Management',4],[2,3,'IT302','Computer Networks',4],[2,3,'IT303','System Analysis & Design',4],[2,3,'IT304','Web Technologies',4],[2,3,'IT305','Software Testing',3],
// IT sem4
[2,4,'IT401','Operating Systems',4],[2,4,'IT402','Information Security',4],[2,4,'IT403','Cloud Computing',4],[2,4,'IT404','Mobile App Development',3],[2,4,'IT405','Project Management',2],
// IT sem5
[2,5,'IT501','Distributed Systems',4],[2,5,'IT502','Network Security',4],[2,5,'IT503','Web Frameworks',4],[2,5,'IT504','Data Mining',4],[2,5,'IT505','IoT Fundamentals',3],
// IT sem6
[2,6,'IT601','Machine Learning',4],[2,6,'IT602','Blockchain',3],[2,6,'IT603','DevOps Practices',4],[2,6,'IT604','Big Data',4],[2,6,'IT605','Research Methods',2],
// IT sem7
[2,7,'IT701','Cloud Architecture',4],[2,7,'IT702','Cyber Forensics',4],[2,7,'IT703','AI Applications',4],[2,7,'IT704','Agile Development',3],[2,7,'IT705','Industry Project',4],
// IT sem8
[2,8,'IT801','Advanced Security',4],[2,8,'IT802','Cloud Native Dev',4],[2,8,'IT803','Capstone Project',6],[2,8,'IT804','Entrepreneurship',2],[2,8,'IT805','Professional Ethics',2],
// ECE sem1
[3,1,'ECE101','Engineering Mathematics I',4],[3,1,'ECE102','Applied Physics',3],[3,1,'ECE103','Basic Electronics',4],[3,1,'ECE104','Programming in C',3],[3,1,'ECE105','Engineering Graphics',2],
// ECE sem2
[3,2,'ECE201','Engineering Mathematics II',4],[3,2,'ECE202','Circuit Analysis',4],[3,2,'ECE203','Electronic Devices',4],[3,2,'ECE204','Digital Electronics',4],[3,2,'ECE205','Environmental Studies',2],
// ECE sem3
[3,3,'ECE301','Signals and Systems',4],[3,3,'ECE302','Analog Electronics',4],[3,3,'ECE303','Microprocessors',4],[3,3,'ECE304','Communication Systems',4],[3,3,'ECE305','Electromagnetic Theory',3],
// ECE sem4
[3,4,'ECE401','Digital Communication',4],[3,4,'ECE402','VLSI Design',4],[3,4,'ECE403','Embedded Systems',4],[3,4,'ECE404','Control Systems',4],[3,4,'ECE405','Microwave Engineering',3],
// ECE sem5
[3,5,'ECE501','Wireless Communication',4],[3,5,'ECE502','Digital Signal Processing',4],[3,5,'ECE503','Antenna Design',3],[3,5,'ECE504','RF Engineering',4],[3,5,'ECE505','Optical Fiber Comm',3],
// ECE sem6
[3,6,'ECE601','5G Networks',4],[3,6,'ECE602','IoT Systems',4],[3,6,'ECE603','Image Processing',4],[3,6,'ECE604','FPGA Design',4],[3,6,'ECE605','Satellite Communication',3],
// ECE sem7
[3,7,'ECE701','Advanced Embedded Systems',4],[3,7,'ECE702','Robotics',4],[3,7,'ECE703','ML for Signal Processing',4],[3,7,'ECE704','MEMS Technology',3],[3,7,'ECE705','Industry Project',4],
// ECE sem8
[3,8,'ECE801','Advanced VLSI',4],[3,8,'ECE802','Autonomous Systems',4],[3,8,'ECE803','Capstone Project',6],[3,8,'ECE804','Entrepreneurship',2],[3,8,'ECE805','Professional Ethics',2],
// ME sem1
[4,1,'ME101','Engineering Mathematics I',4],[4,1,'ME102','Applied Physics',3],[4,1,'ME103','Engineering Chemistry',3],[4,1,'ME104','Engineering Graphics',4],[4,1,'ME105','Workshop Practice',2],
// ME sem2
[4,2,'ME201','Engineering Mathematics II',4],[4,2,'ME202','Thermodynamics',4],[4,2,'ME203','Material Science',4],[4,2,'ME204','Manufacturing Processes',4],[4,2,'ME205','Environmental Studies',2],
// ME sem3
[4,3,'ME301','Fluid Mechanics',4],[4,3,'ME302','Strength of Materials',4],[4,3,'ME303','Kinematics of Machinery',4],[4,3,'ME304','Machine Drawing',3],[4,3,'ME305','Applied Thermodynamics',4],
// ME sem4
[4,4,'ME401','Heat Transfer',4],[4,4,'ME402','Theory of Machines',4],[4,4,'ME403','Manufacturing Technology',4],[4,4,'ME404','Industrial Engineering',3],[4,4,'ME405','Metrology',3],
// ME sem5
[4,5,'ME501','Machine Design I',4],[4,5,'ME502','Automobile Engineering',4],[4,5,'ME503','Hydraulics & Pneumatics',4],[4,5,'ME504','CAD CAM',4],[4,5,'ME505','Operations Research',3],
// ME sem6
[4,6,'ME601','Robotics',4],[4,6,'ME602','Finite Element Analysis',4],[4,6,'ME603','Refrigeration & AC',4],[4,6,'ME604','Production Planning',3],[4,6,'ME605','Entrepreneurship',2],
// ME sem7
[4,7,'ME701','Advanced Manufacturing',4],[4,7,'ME702','Mechatronics',4],[4,7,'ME703','Quality Engineering',4],[4,7,'ME704','Project Work',4],[4,7,'ME705','Research Methods',2],
// ME sem8
[4,8,'ME801','Industry 4.0',4],[4,8,'ME802','Advanced CAD',4],[4,8,'ME803','Capstone Project',6],[4,8,'ME804','Professional Ethics',2],[4,8,'ME805','Startup Management',2],
// CE sem1
[5,1,'CE101','Engineering Mathematics I',4],[5,1,'CE102','Applied Physics',3],[5,1,'CE103','Engineering Chemistry',3],[5,1,'CE104','Engineering Graphics',4],[5,1,'CE105','Communication Skills',2],
// CE sem2
[5,2,'CE201','Engineering Mathematics II',4],[5,2,'CE202','Structural Mechanics',4],[5,2,'CE203','Surveying I',4],[5,2,'CE204','Building Materials',4],[5,2,'CE205','Environmental Studies',2],
// CE sem3
[5,3,'CE301','Structural Analysis',4],[5,3,'CE302','Fluid Mechanics',4],[5,3,'CE303','Surveying II',4],[5,3,'CE304','Geotechnical Engineering',4],[5,3,'CE305','Construction Materials',3],
// CE sem4
[5,4,'CE401','Design of Structures',4],[5,4,'CE402','Transportation Engineering',4],[5,4,'CE403','Hydraulics',4],[5,4,'CE404','Environmental Engineering',3],[5,4,'CE405','Quantity Estimation',3],
// CE sem5
[5,5,'CE501','Concrete Technology',4],[5,5,'CE502','Geotechnical Engg II',4],[5,5,'CE503','Highway Engineering',4],[5,5,'CE504','Water Resources Engg',4],[5,5,'CE505','Structural Design',4],
// CE sem6
[5,6,'CE601','Construction Management',4],[5,6,'CE602','Advanced Structural Analysis',4],[5,6,'CE603','Urban Planning',3],[5,6,'CE604','Foundation Engineering',4],[5,6,'CE605','Research Methods',2],
// CE sem7
[5,7,'CE701','Bridge Design',4],[5,7,'CE702','Smart Cities',3],[5,7,'CE703','Pavement Design',4],[5,7,'CE704','Project Management',3],[5,7,'CE705','Industry Project',4],
// CE sem8
[5,8,'CE801','Advanced Foundation',4],[5,8,'CE802','Earthquake Engineering',4],[5,8,'CE803','Capstone Project',6],[5,8,'CE804','Professional Ethics',2],[5,8,'CE805','Entrepreneurship',2],
// AIDS sem1
[6,1,'AIDS101','Engineering Mathematics I',4],[6,1,'AIDS102','Statistics I',4],[6,1,'AIDS103','Programming in Python',4],[6,1,'AIDS104','Computer Fundamentals',3],[6,1,'AIDS105','Communication Skills',2],
// AIDS sem2
[6,2,'AIDS201','Engineering Mathematics II',4],[6,2,'AIDS202','Statistics II',4],[6,2,'AIDS203','Data Structures',4],[6,2,'AIDS204','Database Systems',4],[6,2,'AIDS205','Environmental Studies',2],
// AIDS sem3
[6,3,'AIDS301','Machine Learning I',4],[6,3,'AIDS302','Probability Theory',4],[6,3,'AIDS303','Linear Algebra for AI',4],[6,3,'AIDS304','Data Visualization',3],[6,3,'AIDS305','Web Technologies',3],
// AIDS sem4
[6,4,'AIDS401','Machine Learning II',4],[6,4,'AIDS402','Deep Learning',4],[6,4,'AIDS403','Computer Vision',4],[6,4,'AIDS404','Natural Language Processing',4],[6,4,'AIDS405','Data Engineering',3],
// AIDS sem5
[6,5,'AIDS501','Advanced ML',4],[6,5,'AIDS502','Reinforcement Learning',4],[6,5,'AIDS503','Big Data Analytics',4],[6,5,'AIDS504','AI Ethics & Policy',3],[6,5,'AIDS505','Research Methods',2],
// AIDS sem6
[6,6,'AIDS601','Generative AI',4],[6,6,'AIDS602','Knowledge Graphs',3],[6,6,'AIDS603','Explainable AI',4],[6,6,'AIDS604','Cloud ML Platforms',4],[6,6,'AIDS605','Federated Learning',3],
// AIDS sem7
[6,7,'AIDS701','Advanced Deep Learning',4],[6,7,'AIDS702','AI System Design',4],[6,7,'AIDS703','Responsible AI',3],[6,7,'AIDS704','Industry Project',4],[6,7,'AIDS705','Research Methodology',2],
// AIDS sem8
[6,8,'AIDS801','AI for Healthcare',4],[6,8,'AIDS802','Autonomous Systems',4],[6,8,'AIDS803','Capstone Project',6],[6,8,'AIDS804','Entrepreneurship',2],[6,8,'AIDS805','Professional Ethics',2],
];

async function run() {
  const db = await mysql.createConnection(cfg);
  console.log('Connected. Inserting subjects...');
  let count = 0;
  for (const [dept_id, semester, code, name, credits] of subjects) {
    try {
      await db.execute(
        `INSERT IGNORE INTO subjects (code,name,credits,semester,department_id,total_marks,passing_marks) VALUES (?,?,?,?,?,100,40)`,
        [code, name, credits, semester, dept_id]
      );
      count++;
    } catch(e) { console.error(`SKIP ${code}: ${e.message}`); }
  }
  console.log(`Subjects inserted: ${count}`);
  await db.end();
  console.log('PHASE 2 DONE.');
}
run().catch(e => { console.error(e); process.exit(1); });
