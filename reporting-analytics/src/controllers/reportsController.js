const reportsService = require('../services/reportsService');

/**
 * Generate a new report
 */
const generateReport = async (req, res, next) => {
    try {
        const { title, authorName, period } = req.body;
        const report = await reportsService.generateReport(title, authorName, period);
        res.status(201).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all reports
 */
const getAllReports = async (req, res, next) => {
    try {
        const reports = await reportsService.getAllReports();
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        next(error);
    }
};

/**
 * Get report by ID
 */
const getReportById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const report = await reportsService.getReportById(id);
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete report by ID
 */
const deleteReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await reportsService.deleteReport(id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateReport,
    getAllReports,
    getReportById,
    deleteReport
};
