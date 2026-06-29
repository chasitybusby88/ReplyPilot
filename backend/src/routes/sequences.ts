import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/sequences - List all sequences
router.get('/', async (req: Request, res: Response) => {
  try {
    const sequences = await prisma.followUpSequence.findMany({
      include: {
        steps: {
          orderBy: { day: 'asc' }
        }
      }
    });
    res.json(sequences);
  } catch (error) {
    console.error('Error fetching sequences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/sequences - Create a new sequence
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, steps } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }

    const sequence = await prisma.followUpSequence.create({
      data: {
        name,
        description,
        steps: {
          create: steps || []
        }
      },
      include: {
        steps: true
      }
    });

    res.status(201).json(sequence);
  } catch (error) {
    console.error('Error creating sequence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sequences/:id - Get a single sequence
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const sequence = await prisma.followUpSequence.findUnique({
        where: { id },
        include: {
          steps: {
            orderBy: { day: 'asc' }
          }
        }
      });
  
      if (!sequence) {
        res.status(404).json({ error: 'Sequence not found' });
        return;
      }
  
      res.json(sequence);
    } catch (error) {
      console.error('Error fetching sequence:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/sequences/:id - Update a sequence
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
  
      const sequence = await prisma.followUpSequence.update({
        where: { id },
        data: {
          name,
          description
        }
      });
  
      res.json(sequence);
    } catch (error) {
      console.error('Error updating sequence:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/sequences/:id/steps - Add a step to a sequence
router.post('/:id/steps', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { day, type, template, subject } = req.body;
  
      if (!day || !type || !template) {
        res.status(400).json({ error: 'Missing required fields: day, type, template' });
        return;
      }
  
      const step = await prisma.followUpStep.create({
        data: {
          sequenceId: id,
          day,
          type,
          template,
          subject
        }
      });
  
      res.status(201).json(step);
    } catch (error) {
      console.error('Error creating step:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
