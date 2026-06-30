import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/stats/dashboard - General dashboard statistics
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const totalLeads = await prisma.lead.count();
    const qualifiedLeads = await prisma.lead.count({
      where: {
        qualification: {
          status: 'QUALIFIED'
        }
      }
    });
    
    const bookedLeads = await prisma.lead.count({
      where: {
        status: 'BOOKED'
      }
    });

    const appointments = await prisma.appointment.findMany({
        where: {
            scheduledAt: {
                gte: new Date()
            }
        },
        include: {
            lead: true
        },
        orderBy: {
            scheduledAt: 'asc'
        },
        take: 5
    });

    // Mock response time (in seconds)
    // In a real app, we'd calculate this from Lead.createdAt and first Response.sentAt
    const avgResponseTime = 45; // 45 seconds

    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    const bookingRate = totalLeads > 0 ? (bookedLeads / totalLeads) * 100 : 0;
    
    // MRR mock: $500 setup + $300/mo base
    const activeClients = await prisma.client.count();
    const mrr = activeClients * 300;

    res.json({
      metrics: {
        totalLeads,
        qualifiedLeads,
        bookedLeads,
        avgResponseTime,
        qualificationRate: Math.round(qualificationRate),
        bookingRate: Math.round(bookingRate),
        mrr
      },
      upcomingAppointments: appointments
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/leads-over-time - Chart data
router.get('/leads-over-time', async (req: Request, res: Response) => {
    try {
        // Last 7 days lead count
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = await prisma.lead.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });

            last7Days.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count
            });
        }

        res.json(last7Days);
    } catch (error) {
        console.error('Error fetching leads over time:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
