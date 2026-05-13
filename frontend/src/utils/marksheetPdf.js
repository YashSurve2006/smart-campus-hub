import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadMarksheetPdf({ student, semester, rows, summary }) {
  const doc = new jsPDF();
  doc.setFillColor(18, 24, 38);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('Smart Campus Hub - University Marksheet', 14, 14);
  doc.setFontSize(10);
  doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 14, 22);
  doc.text('QR: [Verification Placeholder]', 148, 22);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(`Student: ${student.first_name} ${student.last_name}`, 14, 42);
  doc.text(`Roll Number: ${student.student_code}`, 14, 49);
  doc.text(`Department: ${student.department_name}`, 14, 56);
  doc.text(`Semester: ${semester}`, 14, 63);

  autoTable(doc, {
    startY: 72,
    head: [['Code', 'Subject', 'Credits', 'Exam', 'Marks', 'Grade', 'Status']],
    body: rows.map((r) => [
      r.code,
      r.name,
      r.credits,
      r.exam_type,
      `${r.marks_obtained}/${r.total_marks}`,
      r.grade,
      r.status.toUpperCase(),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 190;
  doc.text(`SGPA: ${summary.sgpa ?? '-'}`, 14, finalY);
  doc.text(`CGPA: ${summary.cgpa ?? '-'}`, 70, finalY);
  doc.text(`Division: ${summary.division ?? '-'}`, 126, finalY);
  doc.text('Controller of Examinations Signature: ___________________', 14, finalY + 20);

  const safeName = `${student.first_name}_${semester}`.replace(/\s+/g, '');
  doc.save(`${safeName}_Result.pdf`);
}
