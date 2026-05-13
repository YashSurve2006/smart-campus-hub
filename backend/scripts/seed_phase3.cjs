// PHASE 3: Students — 94 new students + Yash Surve
// Existing: student_id 1 = CSE sem5, student_id 2 = CSE sem3
// Yash: user_id=17, student_id=3, CSE sem7
const mysql = require('mysql2/promise');
const cfg = { host:'localhost', port:3306, user:'root', password:'ausnita1947', database:'smart_campus' };

const HASH   = '$2a$12$xjR590gBxmlJwsPyTs.c6.ZegjDBLmQvA0g7HRBvFXObQ3QEcKgYm'; // campus@123
const YASH_H = '$2a$12$N7HCt3g2Qh3LngfGuT557.akkAocsqK9NKipQuqJTuOwfLrC5cCZ2'; // yash@123

// [user_id, email, first, last, phone, student_id, student_code, dept_id, sem, year]
const students = [
  // Yash Surve — CSE sem7
  [17,'yash@gmail.com','Yash','Surve','9700000001',3,'CSE22-7001',1,7,2022],
  // CSE sem7 rest
  [18,'arjun.patil.cse7@campus.edu','Arjun','Patil','9700000002',4,'CSE22-7002',1,7,2022],
  [19,'riya.desai.cse7@campus.edu','Riya','Desai','9700000003',5,'CSE22-7003',1,7,2022],
  [20,'karan.mehta.cse7@campus.edu','Karan','Mehta','9700000004',6,'CSE22-7004',1,7,2022],
  // CSE sem5 rest (student_id 1 already exists)
  [21,'pooja.sharma.cse5@campus.edu','Pooja','Sharma','9700000005',7,'CSE24-5002',1,5,2024],
  [22,'rahul.joshi.cse5@campus.edu','Rahul','Joshi','9700000006',8,'CSE24-5003',1,5,2024],
  [23,'neha.kulkarni.cse5@campus.edu','Neha','Kulkarni','9700000007',9,'CSE24-5004',1,5,2024],
  // CSE sem3 rest (student_id 2 already exists)
  [24,'amit.nair.cse3@campus.edu','Amit','Nair','9700000008',10,'CSE24-3002',1,3,2024],
  [25,'priya.iyer.cse3@campus.edu','Priya','Iyer','9700000009',11,'CSE24-3003',1,3,2024],
  [26,'rohit.verma.cse3@campus.edu','Rohit','Verma','9700000010',12,'CSE24-3004',1,3,2024],
  // CSE sem1
  [27,'ananya.gupta.cse1@campus.edu','Ananya','Gupta','9700000011',13,'CSE26-1001',1,1,2026],
  [28,'vishal.kumar.cse1@campus.edu','Vishal','Kumar','9700000012',14,'CSE26-1002',1,1,2026],
  [29,'shreya.singh.cse1@campus.edu','Shreya','Singh','9700000013',15,'CSE26-1003',1,1,2026],
  [30,'dev.patel.cse1@campus.edu','Dev','Patel','9700000014',16,'CSE26-1004',1,1,2026],
  // IT sem7
  [31,'aarav.it7@campus.edu','Aarav','Mishra','9700000015',17,'IT22-7001',2,7,2022],
  [32,'ishaan.it7@campus.edu','Ishaan','Tiwari','9700000016',18,'IT22-7002',2,7,2022],
  [33,'diya.it7@campus.edu','Diya','Reddy','9700000017',19,'IT22-7003',2,7,2022],
  [34,'vivaan.it7@campus.edu','Vivaan','Rao','9700000018',20,'IT22-7004',2,7,2022],
  // IT sem5
  [35,'kavya.it5@campus.edu','Kavya','Pillai','9700000019',21,'IT24-5001',2,5,2024],
  [36,'aryan.it5@campus.edu','Aryan','Bose','9700000020',22,'IT24-5002',2,5,2024],
  [37,'siya.it5@campus.edu','Siya','Das','9700000021',23,'IT24-5003',2,5,2024],
  [38,'rehan.it5@campus.edu','Rehan','Khan','9700000022',24,'IT24-5004',2,5,2024],
  // IT sem3
  [39,'tanvi.it3@campus.edu','Tanvi','Jain','9700000023',25,'IT24-3001',2,3,2024],
  [40,'harsh.it3@campus.edu','Harsh','Shah','9700000024',26,'IT24-3002',2,3,2024],
  [41,'nisha.it3@campus.edu','Nisha','Modi','9700000025',27,'IT24-3003',2,3,2024],
  [42,'rajan.it3@campus.edu','Rajan','Patel','9700000026',28,'IT24-3004',2,3,2024],
  // IT sem1
  [43,'aditi.it1@campus.edu','Aditi','Sharma','9700000027',29,'IT26-1001',2,1,2026],
  [44,'nikhil.it1@campus.edu','Nikhil','Verma','9700000028',30,'IT26-1002',2,1,2026],
  [45,'simran.it1@campus.edu','Simran','Kaur','9700000029',31,'IT26-1003',2,1,2026],
  [46,'yuvraj.it1@campus.edu','Yuvraj','Singh','9700000030',32,'IT26-1004',2,1,2026],
  // ECE sem7
  [47,'sourav.ece7@campus.edu','Sourav','Das','9700000031',33,'ECE22-7001',3,7,2022],
  [48,'meghna.ece7@campus.edu','Meghna','Ghosh','9700000032',34,'ECE22-7002',3,7,2022],
  [49,'varun.ece7@campus.edu','Varun','Nair','9700000033',35,'ECE22-7003',3,7,2022],
  [50,'preethi.ece7@campus.edu','Preethi','Kumar','9700000034',36,'ECE22-7004',3,7,2022],
  // ECE sem5
  [51,'alok.ece5@campus.edu','Alok','Tiwari','9700000035',37,'ECE24-5001',3,5,2024],
  [52,'swati.ece5@campus.edu','Swati','Pandey','9700000036',38,'ECE24-5002',3,5,2024],
  [53,'saurabh.ece5@campus.edu','Saurabh','Yadav','9700000037',39,'ECE24-5003',3,5,2024],
  [54,'kajal.ece5@campus.edu','Kajal','Patel','9700000038',40,'ECE24-5004',3,5,2024],
  // ECE sem3
  [55,'manish.ece3@campus.edu','Manish','Chouhan','9700000039',41,'ECE24-3001',3,3,2024],
  [56,'ritu.ece3@campus.edu','Ritu','Saxena','9700000040',42,'ECE24-3002',3,3,2024],
  [57,'ankur.ece3@campus.edu','Ankur','Gupta','9700000041',43,'ECE24-3003',3,3,2024],
  [58,'pallavi.ece3@campus.edu','Pallavi','Dubey','9700000042',44,'ECE24-3004',3,3,2024],
  // ECE sem1
  [59,'nitin.ece1@campus.edu','Nitin','Chaturvedi','9700000043',45,'ECE26-1001',3,1,2026],
  [60,'minal.ece1@campus.edu','Minal','Teke','9700000044',46,'ECE26-1002',3,1,2026],
  [61,'omkar.ece1@campus.edu','Omkar','Bhosale','9700000045',47,'ECE26-1003',3,1,2026],
  [62,'gauri.ece1@campus.edu','Gauri','Kulkarni','9700000046',48,'ECE26-1004',3,1,2026],
  // ME sem7
  [63,'suraj.me7@campus.edu','Suraj','Patil','9700000047',49,'ME22-7001',4,7,2022],
  [64,'divya.me7@campus.edu','Divya','Bane','9700000048',50,'ME22-7002',4,7,2022],
  [65,'pratik.me7@campus.edu','Pratik','Shinde','9700000049',51,'ME22-7003',4,7,2022],
  [66,'amruta.me7@campus.edu','Amruta','Gaikwad','9700000050',52,'ME22-7004',4,7,2022],
  // ME sem5
  [67,'tejas.me5@campus.edu','Tejas','Kadam','9700000051',53,'ME24-5001',4,5,2024],
  [68,'snehal.me5@campus.edu','Snehal','More','9700000052',54,'ME24-5002',4,5,2024],
  [69,'akshay.me5@campus.edu','Akshay','Wagh','9700000053',55,'ME24-5003',4,5,2024],
  [70,'komal.me5@campus.edu','Komal','Jadhav','9700000054',56,'ME24-5004',4,5,2024],
  // ME sem3
  [71,'siddesh.me3@campus.edu','Siddesh','Salunkhe','9700000055',57,'ME24-3001',4,3,2024],
  [72,'rutuja.me3@campus.edu','Rutuja','Mane','9700000056',58,'ME24-3002',4,3,2024],
  [73,'nilesh.me3@campus.edu','Nilesh','Kale','9700000057',59,'ME24-3003',4,3,2024],
  [74,'aishwarya.me3@campus.edu','Aishwarya','Pawar','9700000058',60,'ME24-3004',4,3,2024],
  // ME sem1
  [75,'rohit.me1@campus.edu','Rohit','Deshpande','9700000059',61,'ME26-1001',4,1,2026],
  [76,'vedika.me1@campus.edu','Vedika','Joshi','9700000060',62,'ME26-1002',4,1,2026],
  [77,'ganesh.me1@campus.edu','Ganesh','Thakur','9700000061',63,'ME26-1003',4,1,2026],
  [78,'pooja.me1@campus.edu','Pooja','Ingle','9700000062',64,'ME26-1004',4,1,2026],
  // CE sem7
  [79,'sagar.ce7@campus.edu','Sagar','Naik','9700000063',65,'CE22-7001',5,7,2022],
  [80,'prachi.ce7@campus.edu','Prachi','Sawant','9700000064',66,'CE22-7002',5,7,2022],
  [81,'umesh.ce7@campus.edu','Umesh','Lokhande','9700000065',67,'CE22-7003',5,7,2022],
  [82,'sonali.ce7@campus.edu','Sonali','Mohite','9700000066',68,'CE22-7004',5,7,2022],
  // CE sem5
  [83,'vikas.ce5@campus.edu','Vikas','Raut','9700000067',69,'CE24-5001',5,5,2024],
  [84,'archana.ce5@campus.edu','Archana','Bhoir','9700000068',70,'CE24-5002',5,5,2024],
  [85,'sachin.ce5@campus.edu','Sachin','Kamble','9700000069',71,'CE24-5003',5,5,2024],
  [86,'ashwini.ce5@campus.edu','Ashwini','Ranpise','9700000070',72,'CE24-5004',5,5,2024],
  // CE sem3
  [87,'pankaj.ce3@campus.edu','Pankaj','Gharat','9700000071',73,'CE24-3001',5,3,2024],
  [88,'smita.ce3@campus.edu','Smita','Kadu','9700000072',74,'CE24-3002',5,3,2024],
  [89,'kiran.ce3@campus.edu','Kiran','Waghmare','9700000073',75,'CE24-3003',5,3,2024],
  [90,'vaibhav.ce3@campus.edu','Vaibhav','Dolas','9700000074',76,'CE24-3004',5,3,2024],
  // CE sem1
  [91,'hemant.ce1@campus.edu','Hemant','Shinde','9700000075',77,'CE26-1001',5,1,2026],
  [92,'shruti.ce1@campus.edu','Shruti','Pisal','9700000076',78,'CE26-1002',5,1,2026],
  [93,'yash.ce1@campus.edu','Yashraj','Mhatre','9700000077',79,'CE26-1003',5,1,2026],
  [94,'maya.ce1@campus.edu','Maya','Yadav','9700000078',80,'CE26-1004',5,1,2026],
  // AIDS sem7
  [95,'rohan.aids7@campus.edu','Rohan','Agarwal','9700000079',81,'AIDS22-7001',6,7,2022],
  [96,'anjali.aids7@campus.edu','Anjali','Batra','9700000080',82,'AIDS22-7002',6,7,2022],
  [97,'akash.aids7@campus.edu','Akash','Chandra','9700000081',83,'AIDS22-7003',6,7,2022],
  [98,'ishita.aids7@campus.edu','Ishita','Dixit','9700000082',84,'AIDS22-7004',6,7,2022],
  // AIDS sem5
  [99,'farhan.aids5@campus.edu','Farhan','Ansari','9700000083',85,'AIDS24-5001',6,5,2024],
  [100,'zara.aids5@campus.edu','Zara','Sheikh','9700000084',86,'AIDS24-5002',6,5,2024],
  [101,'kabir.aids5@campus.edu','Kabir','Malhotra','9700000085',87,'AIDS24-5003',6,5,2024],
  [102,'roshni.aids5@campus.edu','Roshni','Kapoor','9700000086',88,'AIDS24-5004',6,5,2024],
  // AIDS sem3
  [103,'sahil.aids3@campus.edu','Sahil','Arora','9700000087',89,'AIDS24-3001',6,3,2024],
  [104,'tanya.aids3@campus.edu','Tanya','Bajaj','9700000088',90,'AIDS24-3002',6,3,2024],
  [105,'harsh.aids3@campus.edu','Harsh','Chopra','9700000089',91,'AIDS24-3003',6,3,2024],
  [106,'ria.aids3@campus.edu','Ria','Mehra','9700000090',92,'AIDS24-3004',6,3,2024],
  // AIDS sem1
  [107,'vihaan.aids1@campus.edu','Vihaan','Sethi','9700000091',93,'AIDS26-1001',6,1,2026],
  [108,'saanvi.aids1@campus.edu','Saanvi','Khanna','9700000092',94,'AIDS26-1002',6,1,2026],
  [109,'arjun.aids1@campus.edu','Arjun','Luthra','9700000093',95,'AIDS26-1003',6,1,2026],
  [110,'priya.aids1@campus.edu','Priya','Taneja','9700000094',96,'AIDS26-1004',6,1,2026],
];

async function run() {
  const db = await mysql.createConnection(cfg);
  console.log('Connected. Inserting students...');
  let count = 0;
  for (const [uid,email,fn,ln,phone,sid,scode,dept,sem,yr] of students) {
    const isYash = uid === 17;
    const hash = isYash ? YASH_H : HASH;
    try {
      await db.execute(
        `INSERT IGNORE INTO users (id,email,password_hash,role,first_name,last_name,phone) VALUES (?,?,?,'student',?,?,?)`,
        [uid,email,hash,fn,ln,phone]
      );
      await db.execute(
        `INSERT IGNORE INTO students (id,user_id,student_code,department_id,semester,enrollment_year) VALUES (?,?,?,?,?,?)`,
        [sid,uid,scode,dept,sem,yr]
      );
      count++;
    } catch(e) { console.error(`SKIP uid=${uid}: ${e.message}`); }
  }
  console.log(`Students inserted: ${count}`);
  await db.end();
  console.log('PHASE 3 DONE.');
}
run().catch(e => { console.error(e); process.exit(1); });
