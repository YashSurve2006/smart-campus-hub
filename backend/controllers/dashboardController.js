import { asyncHandler } from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboardService.js';

export const student = asyncHandler(async (req, res) => {
  const data = await dashboardService.studentDashboard(req.user.id);
  res.json({ success: true, dashboard: data });
});

export const faculty = asyncHandler(async (req, res) => {
  const data = await dashboardService.facultyDashboard(req.user.id);
  res.json({ success: true, dashboard: data });
});

export const admin = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.adminCommandCenter();
  res.json({ success: true, dashboard });
});
