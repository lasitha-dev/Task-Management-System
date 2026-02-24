const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const reportRoutes = require('./routes/reportRoutes');
const { errorHandler } = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5004;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reports', reportRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'reporting-analytics' });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Reporting & Analytics Service running on port ${PORT}`);
});

module.exports = app;
