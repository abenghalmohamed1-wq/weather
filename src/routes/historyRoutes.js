import express from 'express';
import { SearchHistory } from '../models/index.js';

const router = express.Router();

router.get('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const history = await SearchHistory.find({ sessionId }).sort({ createdAt: -1 }).limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
