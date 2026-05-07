import express from 'express';
import { SavedLocation } from '../models/index.js';
import { getCoordinates } from '../services/weatherService.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
        
        const locations = await SavedLocation.find({ sessionId }).sort({ isFavorite: -1, lastAccessedAt: -1 });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { sessionId, name, isFavorite = false } = req.body;
        if (!sessionId || !name) return res.status(400).json({ error: 'sessionId and name required' });
        
        const coords = await getCoordinates(name);
        
        const newLocation = new SavedLocation({
            sessionId,
            name: coords.displayName || name,
            displayName: coords.displayName,
            latitude: coords.lat,
            longitude: coords.lon,
            isFavorite
        });
        
        await newLocation.save();
        res.status(201).json(newLocation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
