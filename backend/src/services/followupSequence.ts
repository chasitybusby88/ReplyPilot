import prisma from '../lib/prisma';
import { addDays } from 'date-fns';

export interface FollowUpTemplate {
  day: number;
  type: 'EMAIL' | 'SMS';
  subject?: string;
  content: string;
}

export const DEFAULT_TEMPLATES: Record<string, FollowUpTemplate[]> = {
  roofing: [
    { day: 1, type: 'EMAIL', subject: 'Protecting your home: The importance of roof maintenance', content: 'Hi {{name}}, did you know that regular roof inspections can extend your roof\'s life by up to 10 years? We noticed you were interested in roofing services and wanted to share this tip...' },
    { day: 2, type: 'SMS', content: 'Hi {{name}}! Tip: Check your attic for light streaks or damp spots after rain—early detection saves thousands on roof repairs.' },
    { day: 4, type: 'EMAIL', subject: 'What our customers say about our roofing', content: 'Hi {{name}}, we recently helped a neighbor of yours with a full roof replacement. They said: "Reliable and fast!" See our recent work here...' },
    { day: 6, type: 'SMS', content: 'Hi {{name}}, we just finished another 5-star roofing project in your area. Check out the photos here: [link]' },
    { day: 9, type: 'EMAIL', subject: 'Limited time offer on roof inspections', content: 'Hi {{name}}, our schedule is filling up fast for next month. Book your roofing estimate this week to lock in our current seasonal pricing here: {{bookingLink}}' },
    { day: 12, type: 'SMS', content: 'Hi {{name}}, last chance to grab our seasonal discount for your roofing project! Book your free estimate here: {{bookingLink}}' },
  ],
  HVAC: [
    { day: 1, type: 'EMAIL', subject: 'Breathe easier: HVAC maintenance tips', content: 'Hi {{name}}, changing your air filters every 3 months can reduce your energy bill by 15%. Just a quick tip as you consider HVAC services...' },
    { day: 2, type: 'SMS', content: 'Hi {{name}}! Tip: Keep your outdoor unit clear of debris to maintain maximum efficiency and prevent breakdowns.' },
    { day: 4, type: 'EMAIL', subject: 'Staying cool with our HVAC services', content: 'Hi {{name}}, another happy customer just saved on their energy bill after our tune-up. Here is their story...' },
    { day: 7, type: 'SMS', content: 'Hi {{name}}, we have helped over 100 families this month stay comfortable. Ready to be next? {{bookingLink}}' },
    { day: 10, type: 'EMAIL', subject: 'Don\'t get left in the heat', content: 'Hi {{name}}, summer is coming and our HVAC install slots are going fast. Book now to ensure your system is ready: {{bookingLink}}' },
    { day: 13, type: 'SMS', content: 'Hi {{name}}, don\'t wait for a breakdown! Lock in your HVAC appointment today and save $50: {{bookingLink}}' },
  ],
  plumbing: [
    { day: 1, type: 'EMAIL', subject: 'Stop the leaks: Simple plumbing maintenance', content: 'Hi {{name}}, a small drip can waste over 3,000 gallons of water a year. Here is how to check your toilets for silent leaks...' },
    { day: 3, type: 'SMS', content: 'Hi {{name}}! Plumbing tip: Never pour grease down the drain—it\'s the #1 cause of major pipe clogs.' },
    { day: 5, type: 'EMAIL', subject: 'Reliable plumbing you can trust', content: 'Hi {{name}}, we know plumbing issues are stressful. That\'s why we offer 24/7 support. See what our clients say...' },
    { day: 7, type: 'SMS', content: 'Hi {{name}}, another leak fixed and another happy homeowner! See our latest reviews here: {{bookingLink}}' },
    { day: 11, type: 'EMAIL', subject: 'Priority scheduling for your plumbing needs', content: 'Hi {{name}}, we have a few openings for plumbing estimates this Thursday. Grab your spot here: {{bookingLink}}' },
    { day: 14, type: 'SMS', content: 'Hi {{name}}, still need help with your plumbing? We have one spot left this week. Book it here: {{bookingLink}}' },
  ],
  'pressure washing': [
    { day: 1, type: 'EMAIL', subject: 'Boost your curb appeal instantly', content: 'Hi {{name}}, pressure washing your driveway can increase your home\'s value by up to 5%. Just wanted to share some curb appeal tips...' },
    { day: 2, type: 'SMS', content: 'Hi {{name}}! Tip: Soft washing is safer for your siding than high-pressure washing. We use the right tools for the job.' },
    { day: 4, type: 'EMAIL', subject: 'Amazing before & after results', content: 'Hi {{name}}, look at the difference a professional wash made for this home! We can do the same for you...' },
    { day: 7, type: 'SMS', content: 'Hi {{name}}, our clients love their clean homes. Read our latest pressure washing reviews here: {{bookingLink}}' },
    { day: 10, type: 'EMAIL', subject: 'Get ready for the weekend', content: 'Hi {{name}}, want your home sparkling for your next gathering? Book your pressure wash now for a discount: {{bookingLink}}' },
    { day: 13, type: 'SMS', content: 'Hi {{name}}, the sun is out and we are busy! Book your home wash this week to secure your spot: {{bookingLink}}' },
  ],
  cleaning: [
    { day: 1, type: 'EMAIL', subject: 'A cleaner home, a clearer mind', content: 'Hi {{name}}, did you know a clean home can reduce stress levels? Here is our 10-minute daily cleaning checklist...' },
    { day: 3, type: 'SMS', content: 'Hi {{name}}! Tip: Using microfiber cloths traps 99% of bacteria compared to just 33% with cotton.' },
    { day: 5, type: 'EMAIL', subject: 'Coming home to a clean house', content: 'Hi {{name}}, imagine walking into a perfectly clean home. That\'s what we do for our clients every day. See their feedback...' },
    { day: 8, type: 'SMS', content: 'Hi {{name}}, another home transformed! Our cleaners are the best in the business. Check out our work: {{bookingLink}}' },
    { day: 11, type: 'EMAIL', subject: 'Gift yourself some free time', content: 'Hi {{name}}, stop spending your weekends cleaning. We have a few new openings for weekly service. Book here: {{bookingLink}}' },
    { day: 14, type: 'SMS', content: 'Hi {{name}}, we have one opening left for a deep clean this Friday. Book now and save 10%: {{bookingLink}}' },
  ],
  'lawn care': [
    { day: 1, type: 'EMAIL', subject: 'The secret to a greener lawn', content: 'Hi {{name}}, watering deep once a week is better than light watering every day. Here are more tips for a healthy lawn...' },
    { day: 2, type: 'SMS', content: 'Hi {{name}}! Tip: Never cut more than 1/3 of the grass blade at once to avoid stressing your lawn.' },
    { day: 4, type: 'EMAIL', subject: 'The greenest lawn on the block', content: 'Hi {{name}}, we recently took over this lawn and the results speak for themselves. Read what the owner had to say...' },
    { day: 7, type: 'SMS', content: 'Hi {{name}}, we make lawns look like golf courses. See our latest projects here: {{bookingLink}}' },
    { day: 10, type: 'EMAIL', subject: 'Start your lawn transformation', content: 'Hi {{name}}, fertilization season is here. Book your service now to ensure your lawn stays lush all summer: {{bookingLink}}' },
    { day: 13, type: 'SMS', content: 'Hi {{name}}, our mowing routes are filling up! Join our schedule and get your first mow free: {{bookingLink}}' },
  ],
};

export async function initializeDefaultSequences() {
    for (const [service, steps] of Object.entries(DEFAULT_TEMPLATES)) {
        const sequence = await prisma.followUpSequence.upsert({
            where: { id: `default-${service}` },
            update: { name: `${service.toUpperCase()} Nurture` },
            create: {
                id: `default-${service}`,
                name: `${service.toUpperCase()} Nurture`,
                description: `Default 14-day nurture for ${service}`
            }
        });

        for (const step of steps) {
            await prisma.followUpStep.upsert({
                where: {
                    sequenceId_day_type: {
                        sequenceId: sequence.id,
                        day: step.day,
                        type: step.type
                    }
                },
                update: {
                    template: step.content,
                    subject: step.subject
                },
                create: {
                    sequenceId: sequence.id,
                    day: step.day,
                    type: step.type,
                    template: step.content,
                    subject: step.subject
                }
            });
        }
    }
    console.log('All default sequences initialized.');
}

export async function startSequenceForLead(leadId: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error('Lead not found');

  const serviceType = lead.serviceType.toLowerCase();
  const sequenceId = DEFAULT_TEMPLATES[serviceType] ? `default-${serviceType}` : 'default-roofing';

  // Check if already assigned
  const existing = await prisma.leadSequence.findUnique({
    where: { leadId_sequenceId: { leadId, sequenceId } }
  });

  if (existing && existing.status === 'ACTIVE') {
      return existing;
  }

  const assignment = await prisma.leadSequence.upsert({
    where: { leadId_sequenceId: { leadId, sequenceId } },
    update: {
      status: 'ACTIVE',
      currentDay: 0,
      nextSendAt: addDays(new Date(), 1)
    },
    create: {
      leadId,
      sequenceId,
      status: 'ACTIVE',
      currentDay: 0,
      nextSendAt: addDays(new Date(), 1)
    }
  });

  console.log(`Started sequence ${sequenceId} for lead ${leadId}`);
  return assignment;
}

export async function stopSequencesForLead(leadId: string) {
    await prisma.leadSequence.updateMany({
        where: { leadId, status: 'ACTIVE' },
        data: { status: 'STOPPED' }
    });
    console.log(`Stopped all active sequences for lead ${leadId}`);
}

export async function getLeadSequencePlan(leadId: string) {
    const assignments = await prisma.leadSequence.findMany({
        where: { leadId },
        include: {
            sequence: {
                include: {
                    steps: {
                        orderBy: { day: 'asc' }
                    }
                }
            },
            responses: {
                include: {
                    step: true
                }
            }
        }
    });

    return assignments.map(a => ({
        sequenceName: a.sequence.name,
        status: a.status,
        currentDay: a.currentDay,
        nextSendAt: a.nextSendAt,
        history: a.responses.map(r => ({
            day: r.step?.day,
            type: r.type,
            sentAt: r.sentAt,
            content: r.content
        })),
        upcoming: a.sequence.steps
            .filter(s => s.day > a.currentDay)
            .map(s => ({
                day: s.day,
                type: s.type,
                scheduledFor: addDays(a.updatedAt, s.day - a.currentDay) // Rough estimate
            }))
    }));
}
