// Proper bcrypt validation without PowerShell escape issues
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const cfg = { host:'localhost', port:3306, user:'root', password:'ausnita1947', database:'smart_campus' };

async function run() {
  const db = await mysql.createConnection(cfg);

  // Pull Yash's actual stored hash
  const [[yash]] = await db.execute(`SELECT password_hash FROM users WHERE email='yash@gmail.com'`);
  const [[stu]] = await db.execute(`SELECT password_hash FROM users WHERE id=18`);
  const [[admin]] = await db.execute(`SELECT password_hash FROM users WHERE email='admin@gmail.com'`);

  const r1 = await bcrypt.compare('yash@123', yash.password_hash);
  const r2 = await bcrypt.compare('campus@123', stu.password_hash);
  const r3 = await bcrypt.compare('campus@123', admin.password_hash);  // should be false

  console.log('=== BCRYPT LOGIN VALIDATION ===');
  console.log(`yash@gmail.com  / yash@123    → ${r1 ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`student id=18   / campus@123  → ${r2 ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`admin@gmail.com / campus@123  → ${r3 ? 'PASS ✓ (unexpected)' : 'CORRECT - admin has different pw ✓'}`);

  await db.end();
}
run().catch(e => { console.error(e); process.exit(1); });
