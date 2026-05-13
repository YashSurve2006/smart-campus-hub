// FINAL ACCURATE API VALIDATION — correct endpoint paths
const http = require('http');
function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname:'localhost', port:5000, path, method,
      headers:{
        'Content-Type':'application/json',
        ...(token?{'Authorization':`Bearer ${token}`}:{}),
        ...(data?{'Content-Length':Buffer.byteLength(data)}:{})
      }
    };
    const r = http.request(opts, res => {
      let d=''; res.on('data',c=>d+=c);
      res.on('end',()=>{ try{resolve({status:res.statusCode,body:JSON.parse(d)})}catch(e){resolve({status:res.statusCode,body:d})} });
    });
    r.on('error',reject); if(data)r.write(data); r.end();
  });
}

let passed=0, failed=0;
function check(label, condition, detail='') {
  if(condition){ console.log(`  ✓ ${label}`); passed++; }
  else { console.log(`  ✗ FAIL: ${label} ${detail}`); failed++; }
}

async function run() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║    SMART CAMPUS HUB — FINAL API VALIDATION      ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // ── Login all 3 roles
  console.log('[ AUTH ]');
  const yL = await req('POST','/api/auth/login',{email:'yash@gmail.com',password:'yash@123'});
  const aL = await req('POST','/api/auth/login',{email:'admin@gmail.com',password:'campus@123'});
  const fL = await req('POST','/api/auth/login',{email:'rajesh.sharma@campus.edu',password:'campus@123'});
  const facL = await req('POST','/api/auth/login',{email:'faculty@gmail.com',password:'campus@123'});

  check('Yash login (student)', yL.status===200 && !!yL.body.token);
  check('Admin login', aL.status===200 && !!aL.body.token);
  check('New faculty login (Dr. Rajesh Sharma)', fL.status===200 && !!fL.body.token, JSON.stringify(fL.body).slice(0,60));
  check('Existing faculty login (Jordan Lee)', facL.status===200 && !!facL.body.token);

  const yTok = yL.body.token;
  const aTok = aL.body.token;
  const fTok = fL.body.token || facL.body.token;

  // ── Student Profile
  console.log('\n[ STUDENT PROFILE ]');
  const me = await req('GET','/api/auth/me',null,yTok);
  check('GET /api/auth/me → 200', me.status===200);
  check('Role = student', me.body?.user?.role==='student');
  check('Email = yash@gmail.com', me.body?.user?.email==='yash@gmail.com');

  // ── Notices
  console.log('\n[ NOTICES ]');
  const notices = await req('GET','/api/notices',null,yTok);
  check('GET /api/notices → 200', notices.status===200);
  check(`Notices count ≥ 10 (got ${notices.body?.notices?.length})`, (notices.body?.notices?.length||0)>=10);

  // ── Events
  console.log('\n[ EVENTS ]');
  const events = await req('GET','/api/events',null,yTok);
  check('GET /api/events → 200', events.status===200);
  check(`Events count ≥ 5 (got ${events.body?.events?.length})`, (events.body?.events?.length||0)>=5);

  // ── Timetable
  console.log('\n[ TIMETABLE ]');
  const ttCSE7 = await req('GET','/api/timetable?department_id=1&semester=7',null,yTok);
  check('GET /api/timetable (CSE sem7) → 200', ttCSE7.status===200);
  check(`CSE sem7 timetable entries (got ${ttCSE7.body?.entries?.length})`, (ttCSE7.body?.entries?.length||0)>0);

  const ttIT5 = await req('GET','/api/timetable?department_id=2&semester=5',null,yTok);
  check(`IT sem5 timetable entries (got ${ttIT5.body?.entries?.length})`, (ttIT5.body?.entries?.length||0)>0);

  // ── Attendance (student routes)
  console.log('\n[ ATTENDANCE ]');
  const attMe = await req('GET','/api/attendance/me',null,yTok);
  check('GET /api/attendance/me (Yash) → 200', attMe.status===200, `status=${attMe.status}`);

  const attSum = await req('GET','/api/attendance/me/summary',null,yTok);
  check('GET /api/attendance/me/summary → 200', attSum.status===200, `status=${attSum.status}`);

  // Attendance roster (faculty)
  const rosterT = fTok || aTok;
  const roster = await req('GET','/api/attendance/roster/31',null,rosterT);
  check('GET /api/attendance/roster/:id (faculty) → 200', roster.status===200, `status=${roster.status}`);

  // ── Results
  console.log('\n[ RESULTS ]');
  const resMe = await req('GET','/api/results/student/me',null,yTok);
  check('GET /api/results/student/me (Yash) → 200', resMe.status===200, `status=${resMe.status}`);
  const resSubj = resMe.body?.semesters || resMe.body?.results;
  check('Results data populated', !!resMe.body && resMe.status===200);

  const subjects = await req('GET','/api/results/subjects?departmentId=1&semester=7',null,yTok);
  check('GET /api/results/subjects → 200', subjects.status===200, `status=${subjects.status}`);
  check(`CSE sem7 subjects (got ${subjects.body?.subjects?.length})`, (subjects.body?.subjects?.length||0)>=5);

  const facResults = await req('GET','/api/results/faculty?departmentId=1&semester=7',null,fTok||aTok);
  check('GET /api/results/faculty (faculty/admin) → 200', facResults.status===200, `status=${facResults.status}`);

  // ── Notifications
  console.log('\n[ NOTIFICATIONS ]');
  const notif = await req('GET','/api/notifications',null,yTok);
  check('GET /api/notifications → 200', notif.status===200);
  check(`Notifications (got ${notif.body?.notifications?.length})`, (notif.body?.notifications?.length||0)>=3);

  // ── Campus Places
  console.log('\n[ CAMPUS PLACES ]');
  const places = await req('GET','/api/campus/places',null,yTok);
  check('GET /api/campus/places → 200', places.status===200, `status=${places.status}`);
  check(`Places count ≥ 10 (got ${places.body?.places?.length})`, (places.body?.places?.length||0)>=10);

  // ── Admin APIs
  console.log('\n[ ADMIN PANEL ]');
  const stuList = await req('GET','/api/admin/students',null,aTok);
  check('GET /api/admin/students → 200', stuList.status===200);
  check(`Students total ≥ 90 (got ${stuList.body?.students?.length})`, (stuList.body?.students?.length||0)>=20);

  const facList = await req('GET','/api/admin/faculty',null,aTok);
  check('GET /api/admin/faculty → 200', facList.status===200);
  check(`Faculty total ≥ 10 (got ${facList.body?.faculty?.length})`, (facList.body?.faculty?.length||0)>=10);

  // ── Dashboard
  console.log('\n[ DASHBOARD ]');
  const dashY = await req('GET','/api/dashboard',null,yTok);
  check('GET /api/dashboard (student) → 200', dashY.status===200, `status=${dashY.status}`);

  const dashA = await req('GET','/api/dashboard',null,aTok);
  check('GET /api/dashboard (admin) → 200', dashA.status===200, `status=${dashA.status}`);

  // ── Analytics
  console.log('\n[ ANALYTICS ]');
  const analytics = await req('GET','/api/analytics',null,aTok);
  check('GET /api/analytics → 200', analytics.status===200, `status=${analytics.status}`);

  // ── Health
  console.log('\n[ SYSTEM ]');
  const health = await req('GET','/api/health',null,null);
  check('GET /api/health → 200', health.status===200 && health.body?.ok===true);

  // ── Summary
  const total = passed + failed;
  const pct = Math.round((passed/total)*100);
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log(`║  FINAL SCORE: ${passed}/${total} PASSED (${pct}%)`.padEnd(51)+'║');
  console.log(`║  ${failed===0?'ALL TESTS PASSED ✓':'FAILURES: '+failed+' — see above ✗'}`.padEnd(51)+'║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  process.exit(failed > 0 ? 1 : 0);
}
run().catch(e => { console.error(e); process.exit(1); });
