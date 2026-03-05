const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

/**
 * GET /api/analytics/summary?period=week|month
 * Returns: total tasks, completed tasks, productivity %, change vs previous period
 */
router.get('/summary', analyticsController.getSummary);

/**
 * GET /api/analytics/weekly
 * Returns: array of { day, completed } for chart rendering
 */
router.get('/weekly', analyticsController.getWeeklyData);

/**
 * GET /api/analytics/status
 * Returns: { completed: %, inProgress: %, pending: % } for donut chart
 */
router.get('/status', analyticsController.getStatusBreakdown);

/**
 * GET /api/analytics/users
 * Returns: per-user productivity breakdown
 */
router.get('/users', analyticsController.getUserBreakdown);

module.exports = router;
