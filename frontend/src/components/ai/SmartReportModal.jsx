/**
 * SmartReportModal — AI Report generation modal.
 * Uses jsPDF (already installed) to generate a premium dark-themed
 * PDF report with analytics summaries, grade distributions,
 * moderation candidates, and AI recommendations.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { generateAIReport } from '../../services/aiAnalyticsApi';

function generatePDF({ report, type, departmentName, semester }) {
  // Dynamic import to avoid loading jsPDF until needed
  return import('jspdf').then(({ jsPDF }) => {
    return import('jspdf-autotable').then(() => {
      const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(2, 6, 23); // #020617
      doc.rect(0, 0, pw, 40, 'F');
      doc.setTextColor(165, 180, 252); // indigo-300
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SMART CAMPUS HUB — AI ACADEMIC INTELLIGENCE', pw / 2, 15, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(`${type === 'moderation' ? 'Moderation Report' : 'Analytics Summary'}`, pw / 2, 27, { align: 'center' });
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFontSize(8);
      doc.text(`Department: ${departmentName || 'All'} | Semester: ${semester} | Generated: ${new Date().toLocaleString()}`, pw / 2, 35, { align: 'center' });

      let y = 50;

      if (type === 'moderation' && report?.moderationCandidates?.length) {
        // Summary box
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(10, y, pw - 20, 28, 3, 3, 'F');
        doc.setTextColor(165, 180, 252);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('MODERATION SUMMARY', 15, y + 9);
        doc.setTextColor(200, 200, 220);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const s = report.summary || {};
        doc.text(
          `Total Subjects: ${s.totalSubjects || 0}  |  Needing Moderation: ${s.subjectsNeedingModeration || 0}  |  Urgent: ${s.urgentCases || 0}  |  Suggested Grace: ${s.recommendedGraceRange || 'N/A'}`,
          15, y + 20
        );
        y += 36;

        // Moderation table
        doc.setTextColor(165, 180, 252);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('SUBJECT MODERATION ANALYSIS', 15, y);
        y += 4;

        const tableRows = report.moderationCandidates.map((c) => [
          c.code,
          c.name?.slice(0, 22),
          `${c.avgPercentage}%`,
          `${c.failRate}%`,
          `${c.failCount}/${c.totalEntries}`,
          c.moderationUrgency?.toUpperCase() || 'NONE',
          `+${c.graceSuggestion?.graceMarks || 0}`,
        ]);

        doc.autoTable({
          startY: y,
          head: [['Code', 'Subject', 'Avg %', 'Fail %', 'Fails', 'Urgency', 'Grace']],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
          bodyStyles: { fillColor: [15, 23, 42], textColor: [200, 210, 230], fontSize: 7.5 },
          alternateRowStyles: { fillColor: [23, 33, 56] },
          styles: { lineColor: [30, 41, 59], lineWidth: 0.3 },
        });
        y = doc.lastAutoTable.finalY + 10;
      } else if (report?.rankings?.length) {
        // Rankings table
        doc.setTextColor(165, 180, 252);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('DEPARTMENT PERFORMANCE RANKINGS', 15, y);
        y += 4;

        const rankRows = report.rankings.map((r, i) => [
          `#${i + 1}`,
          r.department_name,
          `${r.avg_percentage || 0}%`,
          `${r.avg_cgpa || 0}`,
          `${r.pass_rate || 0}%`,
          r.performanceTier,
        ]);

        doc.autoTable({
          startY: y,
          head: [['Rank', 'Department', 'Avg %', 'Avg CGPA', 'Pass Rate', 'Tier']],
          body: rankRows,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
          bodyStyles: { fillColor: [15, 23, 42], textColor: [200, 210, 230], fontSize: 7.5 },
          alternateRowStyles: { fillColor: [23, 33, 56] },
          styles: { lineColor: [30, 41, 59], lineWidth: 0.3 },
        });
      }

      // Footer
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFillColor(2, 6, 23);
        doc.rect(0, doc.internal.pageSize.getHeight() - 12, pw, 12, 'F');
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.text(
          `Smart Campus Hub AI Analytics  |  Page ${i} of ${pages}  |  Confidential`,
          pw / 2,
          doc.internal.pageSize.getHeight() - 4,
          { align: 'center' }
        );
      }

      const filename = `AI_${type}_report_sem${semester}_${Date.now()}.pdf`;
      doc.save(filename);
      return filename;
    });
  });
}

export function SmartReportModal({
  open,
  onClose,
  departmentId,
  semester,
  departmentName,
}) {
  const [reportType, setReportType] = useState('moderation');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleGenerate() {
    setStatus('loading');
    setErrorMsg('');
    try {
      const result = await generateAIReport({ departmentId, semester, type: reportType });
      await generatePDF({
        report: result.report,
        type: reportType,
        departmentName,
        semester,
      });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to generate report. Please try again.');
      setStatus('error');
    }
  }

  const REPORT_TYPES = [
    { id: 'moderation', label: 'Moderation Report', desc: 'Grace marks, failure analysis, subject difficulty' },
    { id: 'summary', label: 'Analytics Summary', desc: 'Department rankings, heatmap, at-risk students' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20">
                    <FileText className="h-4 w-4 text-indigo-400" />
                  </div>
                  <h2 className="text-base font-bold text-white">Generate AI Report</h2>
                </div>
                <p className="text-xs text-slate-500">Semester {semester} · {departmentName || 'All Departments'}</p>
              </div>
              <button onClick={onClose} className="rounded-xl p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Report type selection */}
            <div className="mb-5 space-y-2">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => setReportType(rt.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-all duration-200 ${
                    reportType === rt.id
                      ? 'border-indigo-500/50 bg-indigo-500/15'
                      : 'border-white/8 bg-white/3 hover:border-white/15'
                  }`}
                >
                  <p className={`text-sm font-semibold ${reportType === rt.id ? 'text-indigo-300' : 'text-slate-300'}`}>{rt.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{rt.desc}</p>
                </button>
              ))}
            </div>

            {/* Error message */}
            {status === 'error' && (
              <p className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">{errorMsg}</p>
            )}

            {/* Generate button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={status === 'loading'}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold shadow-lg transition-all duration-200 ${
                status === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-500/30 disabled:opacity-60'
              }`}
            >
              {status === 'loading' ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating PDF…</>
              ) : status === 'success' ? (
                <><CheckCircle2 className="h-4 w-4" /> Downloaded!</>
              ) : (
                <><Download className="h-4 w-4" /> Download PDF Report</>
              )}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
