const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { sendMessage, getHistory, getSession, deleteSession } = require('../controllers/chatController');

router.post('/message', authMiddleware, sendMessage);
router.get('/history', authMiddleware, getHistory);
router.get('/history/:sessionId', authMiddleware, getSession);
router.delete('/history/:sessionId', authMiddleware, deleteSession);

module.exports = router;
