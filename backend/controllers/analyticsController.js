import { asyncHandler } from '../utils/asyncHandler.js';
import * as analyticsService from '../services/analyticsService.js';

export const overview = asyncHandler(async (req, res) => {
  const [
    attendanceByDept,
    enrollmentTrend,
    noticesOverTime,
    attendanceDailyTrend,
    facultyActivity,
    timetableLoad,
  ] = await Promise.all([
    analyticsService.attendanceByDepartment(),
    analyticsService.enrollmentTrend(),
    analyticsService.noticesOverTime(),
    analyticsService.attendanceDailyTrend(30),
    analyticsService.facultyActivityStats(),
    analyticsService.timetableLoadByDepartment(),
  ]);

  let eventsOverTime = [];
  let registrationTrend = [];
  let eventParticipation = [];
  try {
    eventsOverTime = await analyticsService.eventsOverTime();
    registrationTrend = await analyticsService.registrationTrend();
    eventParticipation = await analyticsService.topEventsByRegistrations(12);
  } catch {
    /* campus_events not migrated */
  }

  res.json({
    success: true,
    analytics: {
      attendanceByDept,
      enrollmentTrend,
      noticesOverTime,
      attendanceDailyTrend,
      facultyActivity,
      timetableLoad,
      eventsOverTime,
      registrationTrend,
      eventParticipation,
    },
  });
});
