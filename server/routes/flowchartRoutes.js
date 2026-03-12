import express from 'express';
import {
  saveFlowchart,
  getFlowchart,
  listUserFlowcharts
} from '../controllers/flowchartController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/save', authMiddleware, saveFlowchart);
router.get('/', authMiddleware, listUserFlowcharts);
router.get('/:id', authMiddleware, getFlowchart);

export default router;
