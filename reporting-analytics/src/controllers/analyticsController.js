const analyticsService = require('../services/analyticsService');

/**
 * Get summary statistics
 */
const getSummary = async (req, res, next) => {
    try {
        const { period = 'week' } = req.query;
        const summary = await analyticsService.getSummary(period);
        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
};

/**
 * Get weekly data
 */
const getWeeklyData = async (req, res, next) => {
    try {
        const weeklyData = await analyticsService.getWeeklyData();
        res.status(200).json({ success: true, data: weeklyData });
    } catch (error) {
        next(error);
    }
};

/**
 * Get status breakdown
 */
const getStatusBreakdown = async (req, res, next) => {
    try {
        const breakdown = await analyticsService.getStatusBreakdown();
        res.status(200).json({ success: true, data: breakdown });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user breakdown
 */
const getUserBreakdown = async (req, res, next) => {
    try {
        const userBreakdown = await analyticsService.getUserBreakdown();
        res.status(200).json({ success: true, data: userBreakdown });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSummary,
    getWeeklyData,
    getStatusBreakdown,
    getUserBreakdown
};
