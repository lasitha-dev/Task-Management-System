const Report = require('../models/Report');
const analyticsService = require('./analyticsService');

/**
 * Generate a new report
 * @param {string} title - report title
 * @param {string} authorName - author name
 * @param {string} period - report period (week, month, custom)
 * @returns {Promise<object>} - created report
 */
const generateReport = async (title, authorName, period) => {
    try {
        // Create report with processing status
        const report = new Report({
            title,
            authorName,
            period,
            status: 'processing',
            generatedAt: new Date()
        });

        await report.save();
        console.log(`📊 Report "${title}" created with ID: ${report._id}`);

        // Get analytics snapshot
        const analyticsData = {
            summary: await analyticsService.getSummary(period),
            weeklyData: await analyticsService.getWeeklyData(),
            statusBreakdown: await analyticsService.getStatusBreakdown(),
            userBreakdown: await analyticsService.getUserBreakdown()
        };

        // Update report with data and status ready
        report.data = analyticsData;
        report.status = 'ready';
        await report.save();

        console.log(`✅ Report "${title}" is ready`);
        return report;
    } catch (error) {
        console.error('Error generating report:', error);
        throw error;
    }
};

/**
 * Get all reports
 * @returns {Promise<Array>} - all reports sorted by date desc
 */
const getAllReports = async () => {
    try {
        const reports = await Report.find().sort({ generatedAt: -1 });
        return reports;
    } catch (error) {
        console.error('Error getting all reports:', error);
        throw error;
    }
};

/**
 * Get report by ID
 * @param {string} id - report ID
 * @returns {Promise<object>} - report object
 */
const getReportById = async (id) => {
    try {
        const report = await Report.findById(id);
        if (!report) {
            throw new Error('Report not found');
        }
        return report;
    } catch (error) {
        console.error('Error getting report by ID:', error);
        throw error;
    }
};

/**
 * Delete report by ID
 * @param {string} id - report ID
 * @returns {Promise<object>} - deletion result
 */
const deleteReport = async (id) => {
    try {
        const report = await Report.findByIdAndDelete(id);
        if (!report) {
            throw new Error('Report not found');
        }
        console.log(`🗑️ Report "${report.title}" deleted`);
        return { success: true, message: 'Report deleted successfully' };
    } catch (error) {
        console.error('Error deleting report:', error);
        throw error;
    }
};

module.exports = {
    generateReport,
    getAllReports,
    getReportById,
    deleteReport
};
