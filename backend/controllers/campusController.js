import { asyncHandler } from '../utils/asyncHandler.js';
import * as campusService from '../services/campusService.js';

export const listPlaces = asyncHandler(async (req, res) => {
  const rows = await campusService.listPlaces(req.query);
  res.json({ success: true, places: rows });
});

export const createPlace = asyncHandler(async (req, res) => {
  const id = await campusService.createPlace(req.body);
  res.status(201).json({ success: true, id });
});

export const updatePlace = asyncHandler(async (req, res) => {
  await campusService.updatePlace(req.params.id, req.body);
  res.json({ success: true });
});

export const deletePlace = asyncHandler(async (req, res) => {
  await campusService.deletePlace(req.params.id);
  res.json({ success: true });
});
