const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const notificationRoutes = require('./routes/notificationRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const seedMockData = require('./utils/seedMockData');
const Notification = require('./models/Notification');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5003;

// Connect to Database and seed mock data
connectDB().then(() => {
    seedMockData(Notification);
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'notifications-management' });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Notifications Management Service running on port ${PORT}`);
});

module.exports = app;
