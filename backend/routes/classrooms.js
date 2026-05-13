import { Router } from 'express';
import * as classroomController from '../controllers/classroomController.js';

const router = Router();

router.get('/', classroomController.listClassrooms);

export default router;
