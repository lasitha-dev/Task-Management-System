const TasksMirror = require('../models/TasksMirror');
const { TASK_STATUS, DAYS_OF_WEEK } = require('../utils/constants');
const {
    getDateRangeForPeriod,
    getPreviousPeriodDateRange,
    calculatePercentageChange,
    getDayName
} = require('../utils/helpers');

/**
 * Get summary statistics for a given period
 * @param {string} period - 'week' or 'month'
 * @returns {Promise<object>} - summary statistics
 */
const getSummary = async (period = 'week') => {
    try {
        const { startDate, endDate } = getDateRangeForPeriod(period);
        const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodDateRange(period);

        // Current period stats
        const totalTasksCurrent = await TasksMirror.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const completedTasksCurrent = await TasksMirror.countDocuments({
            status: TASK_STATUS.DONE,
            completedAt: { $gte: startDate, $lte: endDate }
        });

        const productivityCurrent = totalTasksCurrent > 0 
            ? ((completedTasksCurrent / totalTasksCurrent) * 100).toFixed(2)
            : 0;

        // Previous period stats
        const totalTasksPrevious = await TasksMirror.countDocuments({
            createdAt: { $gte: prevStart, $lte: prevEnd }
        });

        const completedTasksPrevious = await TasksMirror.countDocuments({
            status: TASK_STATUS.DONE,
            completedAt: { $gte: prevStart, $lte: prevEnd }
        });

        const productivityPrevious = totalTasksPrevious > 0
            ? ((completedTasksPrevious / totalTasksPrevious) * 100)
            : 0;

        return {
            totalTasks: totalTasksCurrent,
            completedTasks: completedTasksCurrent,
            productivity: parseFloat(productivityCurrent),
            totalChange: calculatePercentageChange(totalTasksCurrent, totalTasksPrevious),
            completedChange: calculatePercentageChange(completedTasksCurrent, completedTasksPrevious),
            productivityChange: calculatePercentageChange(parseFloat(productivityCurrent), productivityPrevious)
        };
    } catch (error) {
        console.error('Error getting summary:', error);
        throw error;
    }
};

/**
 * Get weekly data - completed tasks by day of week
 * @returns {Promise<Array>} - array of daily task counts
 */
const getWeeklyData = async () => {
    try {
        const { startDate, endDate } = getDateRangeForPeriod('week');

        // Get all tasks completed in the week
        const completedTasks = await TasksMirror.find({
            status: TASK_STATUS.DONE,
            completedAt: { $gte: startDate, $lte: endDate }
        });

        // Initialize day data
        const dayData = {};
        DAYS_OF_WEEK.forEach(day => {
            dayData[day] = 0;
        });

        // Count by day
        completedTasks.forEach(task => {
            const day = getDayName(new Date(task.completedAt));
            dayData[day]++;
        });

        // Format as array
        return DAYS_OF_WEEK.map(day => ({
            day: day.substring(0, 3),
            completed: dayData[day]
        }));
    } catch (error) {
        console.error('Error getting weekly data:', error);
        throw error;
    }
};

/**
 * Get task status breakdown
 * @returns {Promise<object>} - status breakdown with percentages
 */
const getStatusBreakdown = async () => {
    try {
        const completedCount = await TasksMirror.countDocuments({ status: TASK_STATUS.DONE });
        const inProgressCount = await TasksMirror.countDocuments({ status: TASK_STATUS.IN_PROGRESS });
        const todoCount = await TasksMirror.countDocuments({ status: TASK_STATUS.TODO });
        const total = completedCount + inProgressCount + todoCount;

        return {
            completed: {
                count: completedCount,
                percentage: total > 0 ? ((completedCount / total) * 100).toFixed(2) : 0
            },
            inProgress: {
                count: inProgressCount,
                percentage: total > 0 ? ((inProgressCount / total) * 100).toFixed(2) : 0
            },
            pending: {
                count: todoCount,
                percentage: total > 0 ? ((todoCount / total) * 100).toFixed(2) : 0
            },
            total
        };
    } catch (error) {
        console.error('Error getting status breakdown:', error);
        throw error;
    }
};

/**
 * Get user breakdown - productivity per user
 * @returns {Promise<Array>} - array of user productivity stats
 */
const getUserBreakdown = async () => {
    try {
        const userStats = await TasksMirror.aggregate([
            {
                $group: {
                    _id: '$assignedUserId',
                    userName: { $first: '$assignedUserName' },
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: {
                            $cond: [{ $eq: ['$status', TASK_STATUS.DONE] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { totalTasks: -1 }
            }
        ]);

        return userStats.map(user => ({
            userId: user._id,
            userName: user.userName,
            totalTasks: user.totalTasks,
            completedTasks: user.completedTasks,
            completionRate: user.totalTasks > 0 
                ? ((user.completedTasks / user.totalTasks) * 100).toFixed(2)
                : 0
        }));
    } catch (error) {
        console.error('Error getting user breakdown:', error);
        throw error;
    }
};

module.exports = {
    getSummary,
    getWeeklyData,
    getStatusBreakdown,
    getUserBreakdown
};
