import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { getAvailableSlots, bookAppointment, cancelAppointment } from '../services/scheduling';
import { confirmAppointment } from '../services/reminders';
import { parseISO } from 'date-fns';

const router = Router();

// GET /api/appointments/available - Get available slots for a date
router.get('/available', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'Missing date query parameter' });
      return;
    }

    const parsedDate = parseISO(date);
    const slots = await getAvailableSlots(parsedDate);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/scheduling/appointments - List all appointments (for business owner)
// Keeping this for the dashboard, but adding the lead-specific ones below
router.get('/all', async (req: Request, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        lead: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/appointments/:id/cancel - Cancel an appointment
router.post('/:id/cancel', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await cancelAppointment(id);
      res.json(result);
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      res.status(400).json({ error: error.message || 'Failed to cancel appointment' });
    }
});

// POST /api/appointments/:id/confirm - Confirm an appointment
router.post('/:id/confirm', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const appointment = await confirmAppointment(id);
      res.json(appointment);
    } catch (error: any) {
      console.error('Error confirming appointment:', error);
      res.status(400).json({ error: error.message || 'Failed to confirm appointment' });
    }
});

export default router;
