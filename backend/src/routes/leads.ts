import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { processLeadResponse } from '../services/aiResponse';
import { processLeadReply, extractQualificationData } from '../services/qualification';

const router = Router();

// POST /api/leads - Lead capture endpoint
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, serviceType, message, clientId } = req.body;

    if (!name || !email || !phone || !serviceType) {
      res.status(400).json({ error: 'Missing required fields: name, email, phone, serviceType' });
      return;
    }

    // Extract initial qualification data if message is present
    let initialPropertyDetails = {};
    let initialUrgency = null;
    let initialBudget = null;

    if (message) {
        const extracted = await extractQualificationData('temp', message); // leadId doesn't exist yet, but we just need parser
        if (extracted) {
            initialPropertyDetails = extracted.propertyDetails || {};
            initialUrgency = extracted.urgency;
            initialBudget = extracted.budgetRange;
        }
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        serviceType,
        message: message || null,
        clientId: clientId || null,
        status: 'NEW',
        propertyDetails: initialPropertyDetails,
        urgency: initialUrgency,
        budgetRange: initialBudget
      },
    });

    console.log(`New lead captured: ${lead.id}`);

    // Auto-trigger response
    processLeadResponse(lead).catch((err) => {
      console.error(`Failed to auto-respond to lead ${lead.id}:`, err);
    });

    res.status(201).json({
      message: 'Lead captured successfully and processing response',
      leadId: lead.id,
      status: lead.status,
    });
  } catch (error) {
    console.error('Error capturing lead:', error);
    res.status(500).json({ error: 'Internal server error while capturing lead' });
  }
});

// POST /api/leads/:id/reply - Simulate a lead replying to an SMS or Email
router.post('/:id/reply', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Missing reply text' });
      return;
    }

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    // Process reply asynchronously
    processLeadReply(id, text).catch((err) => {
      console.error(`Error processing reply for lead ${id}:`, err);
    });

    res.json({ message: 'Reply received and processing' });
  } catch (error) {
    console.error('Error handling lead reply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/leads/:id/respond - Generate and return/store a response for an existing lead
router.post('/:id/respond', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const result = await processLeadResponse(lead);
    res.json({
      message: 'Response generated successfully',
      ...result
    });
  } catch (error) {
    console.error('Error generating manual response:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leads/:id/responses - Fetch response history for a lead
router.get('/:id/responses', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const responses = await prisma.response.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leads - List all leads
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
