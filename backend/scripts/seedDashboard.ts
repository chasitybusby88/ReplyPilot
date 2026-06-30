import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.lead.count();
  console.log(`Number of leads: ${count}`);
  
  if (count === 0) {
    console.log('Seeding demo leads...');
    await prisma.client.create({
        data: {
            name: 'Pro Roofing LLC',
            email: 'info@proroofing.com',
            leads: {
                create: [
                    {
                        name: 'Alice Johnson',
                        email: 'alice@example.com',
                        phone: '555-0101',
                        serviceType: 'Roof Repair',
                        status: 'NEW',
                        qualification: {
                            create: {
                                status: 'PARTIAL',
                                urgency: 'HIGH'
                            }
                        }
                    },
                    {
                        name: 'Bob Smith',
                        email: 'bob@example.com',
                        phone: '555-0102',
                        serviceType: 'New Roof',
                        status: 'QUALIFIED',
                        qualification: {
                            create: {
                                status: 'QUALIFIED',
                                urgency: 'MEDIUM',
                                budgetRange: '$10k-$15k'
                            }
                        }
                    },
                    {
                        name: 'Charlie Brown',
                        email: 'charlie@example.com',
                        phone: '555-0103',
                        serviceType: 'Gutter Cleaning',
                        status: 'BOOKED',
                        qualification: {
                            create: {
                                status: 'QUALIFIED',
                                urgency: 'LOW'
                            }
                        },
                        appointments: {
                            create: {
                                scheduledAt: new Date(Date.now() + 86400000 * 2), // 2 days from now
                                status: 'SCHEDULED'
                            }
                        }
                    }
                ]
            }
        }
    });
    console.log('Demo leads seeded.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
