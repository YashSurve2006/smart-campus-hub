function eventSubtitle(event) {
  const date = event.starts_at ? new Date(event.starts_at).toLocaleDateString() : null;
  const location = event.location ? ` at ${event.location}` : '';
  return [date, event.category, location].filter(Boolean).join(' · ');
}

function noticeSubtitle(notice) {
  const date = notice.created_at ? new Date(notice.created_at).toLocaleDateString() : null;
  const priority = notice.priority ? `Priority: ${notice.priority}` : null;
  return [date, notice.notice_category, priority].filter(Boolean).join(' · ');
}

function attendanceItems(summary) {
  if (!summary) return [];
  return [
    { line: `Attendance: ${summary.attendancePct ?? 'N/A'}%` },
    summary.recordedSessions != null && { line: `Recorded sessions: ${summary.recordedSessions}` },
    summary.classCount != null && { line: `Classes: ${summary.classCount}` },
    summary.noticesPosted != null && { line: `Notices posted: ${summary.noticesPosted}` },
    summary.slotsWithoutTodayAttendance != null && { line: `Absent attendance entries: ${summary.slotsWithoutTodayAttendance}` },
  ].filter(Boolean);
}

function normalizeItems(items = []) {
  return items.map((item) => {
    if (item == null) return null;
    if (typeof item === 'string') return { line: item };
    if (item.title || item.name) {
      return {
        line: item.title || item.name,
        sub: item.summary || item.detail || item.description || item.sub || undefined,
      };
    }
    return { line: JSON.stringify(item) };
  }).filter(Boolean);
}

export function buildFallbackReply(message, context) {
  const lower = String(message || '').toLowerCase();
  const cards = [];
  let reply =
    'Here is a live snapshot from your campus data. Connect OpenAI or Ollama for natural-language answers.';

  if (lower.includes('timetable') || lower.includes('schedule') || lower.includes('class')) {
    cards.push({
      type: 'timetable',
      title: 'Today’s Timetable',
      items: normalizeItems(
        context.todayClasses?.slice(0, 12).map((entry) => ({
          title: entry.subject_name,
          sub: `${entry.day_of_week} ${entry.start_time}–${entry.end_time}${entry.room ? ` · ${entry.room}` : ''}`,
        })) || []
      ),
    });
    reply = `Today you have ${context.todayClasses?.length || 0} scheduled slot(s). Details are in the card.`;
  } else if (lower.includes('notice')) {
    cards.push({
      type: 'notices',
      title: 'Recent Notices',
      items: normalizeItems(context.recentNotices || []).map((item) => ({
        ...item,
        sub: noticeSubtitle(item),
      })),
    });
    reply = 'Recent notices from your campus feed are shown below.';
  } else if (lower.includes('event')) {
    cards.push({
      type: 'events',
      title: 'Upcoming Events',
      items: normalizeItems(context.upcomingEvents || []).map((item) => ({
        ...item,
        sub: eventSubtitle(item),
      })),
    });
    reply = 'Upcoming events you can see are listed in the card.';
  } else if (lower.includes('attendance')) {
    cards.push({
      type: 'attendance',
      title: 'Attendance Summary',
      items: attendanceItems(context.attendanceSummary),
    });
    reply = 'Attendance summary is attached as a card.';
  } else {
    if (context.recentNotices?.length) {
      cards.push({
        type: 'notices',
        title: 'Recent Notices',
        items: normalizeItems(context.recentNotices.slice(0, 4)).map((item) => ({
          ...item,
          sub: noticeSubtitle(item),
        })),
      });
    }
    if (context.upcomingEvents?.length) {
      cards.push({
        type: 'events',
        title: 'Upcoming Events',
        items: normalizeItems(context.upcomingEvents.slice(0, 4)).map((item) => ({
          ...item,
          sub: eventSubtitle(item),
        })),
      });
    }
    reply =
      'I pulled your latest notices and events. Use the suggested prompts or enable an LLM provider for deeper answers.';
  }

  return {
    reply,
    cards,
    provider: 'context',
    contextUsed: true,
    streaming: false,
  };
}
