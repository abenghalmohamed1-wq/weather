import express from 'express';
import { chat } from '../services/openaiService.js';
import { v4 as uuidv4 } from 'uuid';
import { UserSession } from '../models/index.js';

const router = express.Router();

router.post('/message', async (req, res) => {
    try {
        const { message, sessionId, language = 'en' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        let currentSessionId = sessionId;
        let session = null;
        
        if (currentSessionId) {
            session = await UserSession.findOne({ sessionId: currentSessionId });
        }
        
        if (!session) {
            currentSessionId = uuidv4();
            session = new UserSession({
                sessionId: currentSessionId,
                language,
                conversationHistory: []
            });
            await session.save();
        }
        
        const response = await chat(message, session.conversationHistory, language, currentSessionId);
        
        if (response.success) {
            session.conversationHistory = response.conversationHistory;
            session.lastActivityAt = new Date();
            await session.save();
        }
        
        res.json({
            ...response,
            sessionId: currentSessionId
        });
    } catch (error) {
        console.error('Chat route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
