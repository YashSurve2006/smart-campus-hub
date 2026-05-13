const GRADE_SCALE = [
  { min: 90, grade: 'O', point: 10 },
  { min: 80, grade: 'A+', point: 9 },
  { min: 70, grade: 'A', point: 8 },
  { min: 60, grade: 'B+', point: 7 },
  { min: 50, grade: 'B', point: 6 },
  { min: 40, grade: 'C', point: 5 },
  { min: 0, grade: 'F', point: 0 },
];

export function safePercent(marksObtained, totalMarks) {
  if (!totalMarks || totalMarks <= 0) return 0;
  return Number(((marksObtained / totalMarks) * 100).toFixed(2));
}

export function gradeFromPercentage(percentage) {
  const slab = GRADE_SCALE.find((g) => percentage >= g.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1];
  return { grade: slab.grade, gradePoint: slab.point };
}

export function evaluateResult({ marksObtained, totalMarks, passingMarks }) {
  const percentage = safePercent(marksObtained, totalMarks);
  const { grade, gradePoint } = gradeFromPercentage(percentage);
  const passed = Number(marksObtained) >= Number(passingMarks ?? 0) && grade !== 'F';
  return {
    percentage,
    grade,
    gradePoint,
    status: passed ? 'pass' : 'fail',
  };
}

export function classifyDivision(cgpa) {
  if (cgpa >= 9) return 'Distinction';
  if (cgpa >= 7.5) return 'First Class';
  if (cgpa >= 6) return 'Second Class';
  if (cgpa > 0) return 'Pass Class';
  return 'N/A';
}

export function computeSgpa(rows) {
  let weightedPoints = 0;
  let totalCredits = 0;
  for (const row of rows) {
    const credits = Number(row.credits || 0);
    weightedPoints += Number(row.grade_point || 0) * credits;
    totalCredits += credits;
  }
  if (totalCredits === 0) return { sgpa: 0, totalCredits: 0 };
  return {
    sgpa: Number((weightedPoints / totalCredits).toFixed(2)),
    totalCredits,
  };
}

export function computeCgpa(semesterRows) {
  if (!semesterRows?.length) return 0;
  let weighted = 0;
  let credits = 0;
  for (const row of semesterRows) {
    weighted += Number(row.sgpa || 0) * Number(row.total_credits || 0);
    credits += Number(row.total_credits || 0);
  }
  if (!credits) return 0;
  return Number((weighted / credits).toFixed(2));
}
