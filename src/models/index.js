/**
 * PHASE 2: Database Models
 */

import mongoose from 'mongoose';

// ============================================================================
// USER SESSION MODEL
// ============================================================================

const userSessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        language: {
            type: String,
            enum: ['en', 'fr', 'ar', 'darija'],
            default: 'en',
        },
        currentLocation: {
            type: String,
            default: 'Casablanca, Morocco',
        },
        conversationHistory: {
            type: [Object],
            default: [],
        },
        lastActivityAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 7 * 24 * 60 * 60, // Auto-delete after 7 days (TTL)
        },
    },
    { timestamps: true }
);

export const UserSession = mongoose.model('UserSession', userSessionSchema);

// ============================================================================
// SEARCH HISTORY MODEL
// ============================================================================

const searchHistorySchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            index: true,
        },
        userMessage: {
            type: String,
            required: true,
        },
        assistantResponse: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        queryType: {
            type: String,
            enum: ['current', 'forecast', 'historical'],
            required: true,
        },
        queryDate: String, // For historical queries
        weatherData: Object, // Store the actual weather data returned
        language: {
            type: String,
            enum: ['en', 'fr', 'ar', 'darija'],
            default: 'en',
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    { timestamps: true }
);

// Index for efficient history retrieval
searchHistorySchema.index({ sessionId: 1, createdAt: -1 });

export const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

// ============================================================================
// SAVED LOCATIONS MODEL
// ============================================================================

const savedLocationSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        displayName: String,
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        country: String,
        state: String,
        isFavorite: {
            type: Boolean,
            default: false,
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now,
        },
        accessCount: {
            type: Number,
            default: 1,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    { timestamps: true }
);

// Compound index for quick favorite location retrieval
savedLocationSchema.index({ sessionId: 1, isFavorite: -1, lastAccessedAt: -1 });

export const SavedLocation = mongoose.model('SavedLocation', savedLocationSchema);

// ============================================================================
// WEATHER CACHE MODEL (for API rate limiting & performance)
// ============================================================================

const weatherCacheSchema = new mongoose.Schema(
    {
        cacheKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        location: String,
        date: String,
        type: {
            type: String,
            enum: ['current', 'forecast', 'historical'],
        },
        data: Object,
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour TTL
            index: { expireAfterSeconds: 0 },
        },
    },
    { timestamps: true }
);

export const WeatherCache = mongoose.model('WeatherCache', weatherCacheSchema);

// ============================================================================
// USER PREFERENCES MODEL
// ============================================================================

const userPreferencesSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        tempUnit: {
            type: String,
            enum: ['celsius', 'fahrenheit'],
            default: 'celsius',
        },
        language: {
            type: String,
            enum: ['en', 'fr', 'ar', 'darija'],
            default: 'en',
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light',
        },
        notificationsEnabled: {
            type: Boolean,
            default: false,
        },
        defaultLocation: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);