import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSocket, disconnectSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import { SOCKET_EVENTS } from '../constants/socketEvents';

function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 740;
    g.gain.setValueAtTime(0.035, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.1);
  } catch {
    /* ignore */
  }
}

export function useRealtime() {
  const token = useAuthStore((s) => s.token);
  const setConnected = useSocketStore((s) => s.setConnected);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setConnected(false);
      return;
    }
    disconnectSocket();
    const s = getSocket();
    if (!s) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    setConnected(s.connected);

    const onEvent = (payload) => {
      window.dispatchEvent(new CustomEvent('sch:notify-refresh'));
      playChime();
      if (payload?.type === 'notice' && payload.notice?.title) {
        toast.info(`New notice: ${payload.notice.title}`);
      } else if (payload?.type === 'event' && payload.event?.title) {
        toast.info(`New event: ${payload.event.title}`);
      } else if (payload?.type === 'event_registration' && payload.title) {
        toast.success(payload.title);
      }
    };

    const onDash = (payload) => {
      window.dispatchEvent(new CustomEvent('sch:dashboard-refresh', { detail: payload }));
    };

    const onNotice = () => {
      window.dispatchEvent(new CustomEvent('sch:dashboard-refresh', { detail: { reason: 'notice' } }));
    };
    const onEventSch = () => {
      window.dispatchEvent(new CustomEvent('sch:dashboard-refresh', { detail: { reason: 'event' } }));
    };
    const onAttendance = () => {
      window.dispatchEvent(new CustomEvent('sch:dashboard-refresh', { detail: { reason: 'attendance' } }));
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on(SOCKET_EVENTS.userCampusEvent, onEvent);
    s.on(SOCKET_EVENTS.dashboardRefresh, onDash);
    s.on(SOCKET_EVENTS.noticeCreated, onNotice);
    s.on(SOCKET_EVENTS.eventCreated, onEventSch);
    s.on(SOCKET_EVENTS.attendanceUpdated, onAttendance);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off(SOCKET_EVENTS.userCampusEvent, onEvent);
      s.off(SOCKET_EVENTS.dashboardRefresh, onDash);
      s.off(SOCKET_EVENTS.noticeCreated, onNotice);
      s.off(SOCKET_EVENTS.eventCreated, onEventSch);
      s.off(SOCKET_EVENTS.attendanceUpdated, onAttendance);
    };
  }, [token, setConnected]);
}
