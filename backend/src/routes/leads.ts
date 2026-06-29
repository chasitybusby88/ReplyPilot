import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/leads - Lead capture endpoint
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, serviceType, message, clientId } = req.body;

    // Basic validation
    if (!name || !email || !phone || !serviceType) {
      res.status(400).json({ error: 'Missing required fields: name, email, phone, serviceType' });
      return;
    }

    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        serviceType,
        message: message || null,
        clientId: clientId || null,
        status: 'NEW',
      },
    });

    console.log(`New lead captured: ${lead.id}`);

    // TODO: Trigger AI response engine here in a future task
    // For now, just return the lead ID and success status

    res.status(201).json({
      message: 'Lead captured successfully',
      leadId: lead.id,
      status: lead.status,
    });
  } catch (error) {
    console.error('Error capturing lead:', error);
    res.status(500).json({ error: 'Internal server error while capturing lead' });
  }
});

// GET /api/leads - Optional: list leads (for testing/dashboard later)
router.get('/', async (req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
