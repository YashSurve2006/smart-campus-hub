// PHASE 6: Results + CGPA for all students
// Existing: 6 results for student_id=1 (CSE sem5 endterm), CGPA student_id=1 sem5 = 9.00
// Yash student_id=3, CSE sem7 → strong performer 80-89%, CGPA=9.20
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const cfg = { host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME || 'smart_campus' };

function gradeFromPct(pct) {
  if (pct >= 90) return ['O', 10.0];
  if (pct >= 80) return ['A+', 9.0];
  if (pct >= 70) return ['A',  8.0];
  if (pct >= 60) return ['B+', 7.0];
  if (pct >= 50) return ['B',  6.0];
  if (pct >= 40) return ['C',  5.0];
  return ['F', 0.0];
}

// Seeded random for reproducibility
function seededRand(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

async function run() {
  if (!cfg.user || !cfg.password) throw new Error('Set DB_USER and DB_PASSWORD in backend/.env before running this seed script.');
  const db = await mysql.createConnection(cfg);
  console.log('Connected. Inserting results...');

  const [stuRows] = await db.execute(`SELECT s.id, s.department_id, s.semester, s.user_id FROM students s`);
  const [facRows] = await db.execute(`SELECT id, department_id FROM faculty`);

  // Map faculty by dept
  const facByDept = {};
  for (const f of facRows) {
    if (!facByDept[f.department_id]) facByDept[f.department_id] = f.id;
  }

  // Get subjects by dept+sem
  const [subjRows] = await db.execute(`SELECT id, department_id, semester, credits FROM subjects`);
  const subjMap = {};
  for (const s of subjRows) {
    const k = `${s.department_id}-${s.semester}`;
    if (!subjMap[k]) subjMap[k] = [];
    subjMap[k].push(s);
  }

  const examTypes = ['internal','midterm','practical','endterm'];
  let resultCount = 0, cgpaCount = 0, skip = 0;

  for (const stu of stuRows) {
    const isYash = stu.id === 3;
    const isExistingCSE5 = stu.id === 1; // already has results
    if (isExistingCSE5) continue; // skip existing student with results

    const dept = stu.department_id;
    const sem = stu.semester;
    const fac = facByDept[dept] || 1;
    const key = `${dept}-${sem}`;
    const subjs = subjMap[key] || [];
    if (subjs.length === 0) continue;

    let totalCredits = 0, totalWeightedGP = 0;
    let seed = stu.id * 13;

    for (const subj of subjs) {
      for (let ei = 0; ei < examTypes.length; ei++) {
        const examType = examTypes[ei];
        let marks;
        if (isYash) {
          // Yash: 80-89 range
          marks = 80 + Math.floor(seededRand(seed + ei + subj.id) * 9);
        } else {
          // Others: 55-95 range with varied distribution
          const r = seededRand(seed + ei + subj.id);
          marks = 55 + Math.floor(r * 40);
        }
        const pct = parseFloat(((marks / 100) * 100).toFixed(2));
        const [grade, gp] = gradeFromPct(pct);
        const status = pct >= 40 ? 'pass' : 'fail';
        try {
          await db.execute(
            `INSERT IGNORE INTO results (student_id,subject_id,faculty_id,semester,exam_type,marks_obtained,total_marks,percentage,grade,grade_point,remarks,status,locked) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)`,
            [stu.id, subj.id, fac, sem, examType, marks, 100, pct, grade, gp, status === 'pass' ? 'Good performance' : 'Needs improvement', status]
          );
          resultCount++;
        } catch(e) { skip++; }
        seed += 7;
      }
      totalCredits += subj.credits;
      const avgMarks = isYash ? 84 : (55 + Math.floor(seededRand(seed + subj.id) * 30));
      const [,gp] = gradeFromPct(avgMarks);
      totalWeightedGP += gp * subj.credits;
    }

    const sgpa = totalCredits > 0 ? parseFloat((totalWeightedGP / totalCredits).toFixed(2)) : 0;
    // Yash: force CGPA 9.20
    const cgpa = isYash ? 9.20 : parseFloat((sgpa * 0.95 + seededRand(stu.id * 3) * 0.5).toFixed(2));

    try {
      await db.execute(
        `INSERT IGNORE INTO cgpa_records (student_id,semester,sgpa,cgpa,total_credits) VALUES (?,?,?,?,?)`,
        [stu.id, sem, sgpa, cgpa, totalCredits]
      );
      cgpaCount++;
    } catch(e) { /* skip duplicate */ }
  }

  console.log(`Results inserted: ${resultCount}, CGPA records: ${cgpaCount}, skipped: ${skip}`);
  await db.end();
  console.log('PHASE 6 DONE.');
}
run().catch(e => { console.error(e); process.exit(1); });
