import { asyncHandler } from '../utils/asyncHandler.js';
import * as assistantService from '../services/assistantService.js';

export const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const result = await assistantService.answerAssistant({
    message,
    userId: req.user.id,
    role: req.user.role,
  });
  res.json({ success: true, ...result });
});

export const capabilities = asyncHandler(async (_req, res) => {
  res.json({ success: true, ...assistantService.getAssistantCapabilities() });
});
