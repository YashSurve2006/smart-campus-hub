# Assignment Module Manual Test Checklist

## Setup Prerequisites
1. **Backend running on http://localhost:5000**
2. **Frontend running on http://localhost:5173**
3. **Test users in your database**:
   - Admin (role: admin, password as per your DB)
   - Faculty (role: faculty, password as per your DB)
   - Student (role: student, password as per your DB)
   - Both students and faculty should have department_id, semester (student) set
4. **At least 1 subject in the database (for faculty to assign to an assignment)**

---

## Test 1: Faculty Creates & Publishes Assignment
1. Log in as **faculty**
2. Go to **Assignments** from sidebar
3. Click **New Assignment**
4. Fill out:
   - Title: "Midterm Assignment"
   - Description: "Complete all questions"
   - Subject ID: (select from your DB, e.g., 1)
   - Department ID: (your faculty's dept id, e.g., 1)
   - Semester: (your student's semester, e.g., 5)
   - Due date: (1 week from now)
   - Max marks: 100
5. Click **Create**
6. Verify assignment appears in list with status **Draft**
7. Click **Publish**
8. Verify status changes to **Published**

---

## Test 2: Student Views & Submits Assignment
1. Log in as **student**
2. Go to **Assignments** from sidebar
3. Verify "Midterm Assignment" is visible
4. Open assignment details
5. Click to attach files (select any test file)
6. Click **Submit**
7. Verify submission is successful

---

## Test 3: Faculty Grades Submission
1. Log in as **faculty**
2. Go to **Assignments**
3. Open your assignment's **Submissions**
4. Click **Grade** on the student's submission
5. Enter:
   - Marks obtained: 85
   - Remarks: "Great work!"
6. Click **Save grade**
7. Verify grade appears in submission list

---

## Test 4: Student Sees Grade & Remarks
1. Log in as **student**
2. Go to **Assignments**
3. Open "Midterm Assignment"
4. Verify grade (85/100) and remarks ("Great work!") are visible

---

## Test 5: Admin Views All Assignments
1. Log in as **admin**
2. Go to **Assignments** from sidebar
3. Verify "Midterm Assignment" is visible
4. Check basic analytics (total assignments, total submissions) are loaded

---

## ✅ All Tests Pass → Module is Ready!
