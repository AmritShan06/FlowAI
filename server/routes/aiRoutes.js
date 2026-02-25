import express from 'express';
import { suggestImprovements } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/suggest', authMiddleware, suggestImprovements);

export default router;
