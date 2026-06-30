import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leadRoutes from './routes/leads';
import sequenceRoutes from './routes/sequences';
import schedulingRoutes from './routes/scheduling';
import missedCallRoutes from './routes/missedCalls';
import statsRoutes from './routes/stats';
import { processPendingFollowUps } from './services/followUp';
import { processUpcomingReminders } from './services/reminders';
import { processPendingEscalations } from './services/missedCall';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/leads', leadRoutes);
app.use('/api/sequences', sequenceRoutes);
app.use('/api/appointments', schedulingRoutes);
app.use('/api/missed-calls', missedCallRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Background Worker (Run every 1 minute for demo/dev purposes)
setInterval(async () => {
    try {
        await processPendingFollowUps();
        await processUpcomingReminders();
        await processPendingEscalations();
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
