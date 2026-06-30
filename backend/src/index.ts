import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leadRoutes from './routes/leads';
import sequenceRoutes from './routes/sequences';
import schedulingRoutes from './routes/scheduling';
import { processPendingFollowUps } from './services/followUp';
import { processUpcomingReminders } from './services/reminders';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/leads', leadRoutes);
app.use('/api/sequences', sequenceRoutes);
app.use('/api/appointments', schedulingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Background Worker (Run every 1 minute for demo/dev purposes)
setInterval(async () => {
    try {
        await processPendingFollowUps();
        await processUpcomingReminders();
    } catch (error) {
        console.error('Background worker error:', error);
    }
}, 60000); // 60 seconds

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Global error handlers to prevent crashes
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
