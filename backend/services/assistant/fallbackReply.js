export function buildFallbackReply(message, context) {
  const lower = String(message || '').toLowerCase();
  const cards = [];
  let reply =
    'Here is a live snapshot from your campus data. Connect OpenAI or Ollama for natural-language answers.';

  if (lower.includes('timetable') || lower.includes('schedule') || lower.includes('class')) {
    cards.push({ type: 'timetable', items: context.todayClasses?.slice(0, 12) || [] });
    reply = `Today you have ${context.todayClasses?.length || 0} scheduled slot(s). Details are in the card.`;
  } else if (lower.includes('notice')) {
    cards.push({ type: 'notices', items: context.recentNotices || [] });
    reply = 'Recent notices from your campus feed are shown below.';
  } else if (lower.includes('event')) {
    cards.push({ type: 'events', items: context.upcomingEvents || [] });
    reply = 'Upcoming events you can see are listed in the card.';
  } else if (lower.includes('attendance')) {
    cards.push({ type: 'attendance', summary: context.attendanceSummary || null });
    reply = 'Attendance summary is attached as a card.';
  } else {
    if (context.recentNotices?.length) {
      cards.push({ type: 'notices', items: context.recentNotices.slice(0, 4) });
    }
    if (context.upcomingEvents?.length) {
      cards.push({ type: 'events', items: context.upcomingEvents.slice(0, 4) });
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
