import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Default Sequence
  const sequence = await prisma.followUpSequence.upsert({
    where: { id: 'default-nurture' },
    update: {},
    create: {
      id: 'default-nurture',
      name: 'Default 14-Day Nurture',
      description: 'Educational, Social Proof, and Urgency sequence.',
    },
  });

  const steps = [
    // Days 1-3: Educational
    { day: 1, type: 'EMAIL', subject: 'Welcome to ReplyPilot Tips', template: 'Hi {{name}}, here is a tip for your {{serviceType}} project...' },
    { day: 2, type: 'SMS', template: 'Hi {{name}}! Just checking in. Did you know that regular maintenance on your {{serviceType}} can save you thousands?' },
    { day: 3, type: 'EMAIL', subject: 'How to choose a contractor', template: 'Choosing a {{serviceType}} contractor is hard. Here is a guide...' },

    // Days 4-7: Social Proof
    { day: 5, type: 'EMAIL', subject: 'See our recent work', template: 'We just finished a {{serviceType}} job near you. Check out the results!' },
    { day: 7, type: 'SMS', template: 'Hi {{name}}, check out what our customers are saying about our {{serviceType}} services: [Link]' },

    // Days 8-14: Urgency
    { day: 10, type: 'EMAIL', subject: 'Still interested in {{serviceType}}?', template: 'We haven\'t heard from you in a while. Our schedule is filling up for next month...' },
    { day: 14, type: 'SMS', template: 'Hi {{name}}, last chance to lock in your quote for {{serviceType}}. Reply YES to book a call.' },
  ];

  for (const step of steps) {
    await prisma.followUpStep.upsert({
      where: {
        sequenceId_day_type: {
          sequenceId: sequence.id,
          day: step.day,
          type: step.type,
        },
      },
      update: step,
      create: {
        ...step,
        sequenceId: sequence.id,
      },
    });
  }

  console.log('Seed completed: Default sequences created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
