import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import * as eventService from '../services/eventService.js';
import * as notificationService from '../services/notificationService.js';
import * as auditService from '../services/auditService.js';
import { broadcastEventCreated, notifyUser } from '../realtime/socketHub.js';
import { SOCKET_EVENTS } from '../realtime/events.js';

export const list = asyncHandler(async (req, res) => {
  const rows = await eventService.listEvents({
    role: req.user.role,
    upcoming: req.query.upcoming,
    category: req.query.category,
    search: req.query.search,
    status: req.query.status,
    limit: req.query.limit,
  });
  res.json({ success: true, events: rows });
});

export const myRegistrations = asyncHandler(async (req, res) => {
  const rows = await eventService.listMyEventRegistrations(req.user.id);
  res.json({ success: true, registrations: rows });
});

export const featured = asyncHandler(async (req, res) => {
  const rows = await eventService.featuredUpcoming(req.user.role, Number(req.query.limit) || 5);
  res.json({ success: true, events: rows });
});

export const getOne = asyncHandler(async (req, res) => {
  const event = await eventService.getEvent(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Not found' });
  const registered = await eventService.userRegistered(event.id, req.user.id);
  let ticket = null;
  if (registered) {
    ticket = await eventService.getRegistrationTicket(event.id, req.user.id);
  }
  res.json({ success: true, event, registered, ticket });
});

export const listRegistrations = asyncHandler(async (req, res) => {
  const event = await eventService.getEvent(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && event.created_by !== req.user.id) {
    throw new AppError('Forbidden', 403);
  }
  const rows = await eventService.listRegistrations(req.params.id);
  res.json({ success: true, registrations: rows });
});

export const exportRegistrations = asyncHandler(async (req, res) => {
  const event = await eventService.getEvent(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && event.created_by !== req.user.id) {
    throw new AppError('Forbidden', 403);
  }
  const rows = await eventService.listRegistrations(req.params.id);
  const header = 'email,first_name,last_name,role,registered_at,registration_code\n';
  const body = rows
    .map((r) =>
      [
        r.email,
        r.first_name,
        r.last_name,
        r.role,
        r.registered_at,
        r.registration_code || '',
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="event-${req.params.id}-attendees.csv"`);
  res.send(header + body);
});

export const create = asyncHandler(async (req, res) => {
  const id = await eventService.createEvent(req.body, req.user.id);
  const event = await eventService.getEvent(id);

  await notificationService.createNotificationsForRole({
    title: 'New campus event',
    message: event.title,
    type: 'event',
    targetRole: event.target_role === 'all' ? 'all' : event.target_role,
  });

  const io = req.app.get('io');
  broadcastEventCreated(io, event);

  await auditService.logActivity(req.user.id, 'event_create', event.title);

  res.status(201).json({ success: true, event });
});

export const update = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  await eventService.updateEvent(req.params.id, req.body, req.user.id, isAdmin);
  const event = await eventService.getEvent(req.params.id);
  req.app.get('io')?.emit(SOCKET_EVENTS.eventUpdated, { event, at: Date.now() });
  req.app.get('io')?.emit(SOCKET_EVENTS.dashboardRefresh, { reason: 'event' });
  res.json({ success: true, event });
});

export const remove = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  await auditService.logAudit({
    userId: req.user.id,
    action: 'event_delete',
    entityType: 'campus_event',
    entityId: req.params.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });
  await eventService.deleteEvent(req.params.id, req.user.id, isAdmin);
  res.json({ success: true });
});

export const register = asyncHandler(async (req, res) => {
  await eventService.registerForEvent(req.params.id, req.user.id, req.user.role);
  const event = await eventService.getEvent(req.params.id);
  const ticket = await eventService.getRegistrationTicket(event.id, req.user.id);
  await notificationService.createUserNotification(req.user.id, {
    title: 'Registration confirmed',
    message: `You're registered for: ${event.title}`,
    type: 'event',
  });
  const io = req.app.get('io');
  notifyUser(io, req.user.id, SOCKET_EVENTS.userCampusEvent, {
    type: 'event_registration',
    eventId: event.id,
    title: event.title,
  });
  io?.emit(SOCKET_EVENTS.eventRegistration, { eventId: event.id, at: Date.now() });
  io?.emit(SOCKET_EVENTS.dashboardRefresh, { reason: 'event_registration' });
  res.json({ success: true, ticket });
});

export const unregister = asyncHandler(async (req, res) => {
  await eventService.unregisterEvent(req.params.id, req.user.id);
  res.json({ success: true });
});
