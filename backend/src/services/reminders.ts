import prisma from '../lib/prisma';
import { subHours, isBefore, format, addHours } from 'date-fns';

export async function processUpcomingReminders() {
  const now = new Date();
  const tomorrow = addHours(now, 24);
  const inOneHour = addHours(now, 1);

  // 1. 24h Reminders
  // Find appointments in the window (23h to 25h from now) that haven't been reminded
  const appointments24h = await prisma.appointment.findMany({
    where: {
      scheduledAt: {
        gte: addHours(now, 23),
        lte: addHours(now, 25),
      },
      reminded24hAt: null,
      status: 'SCHEDULED',
    },
    include: { lead: true },
  });

  for (const appt of appointments24h) {
    await sendReminder(appt, '24h');
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminded24hAt: new Date() },
    });
  }

  // 2. 1h Reminders
  // Find appointments in the window (0.5h to 1.5h from now) that haven't been reminded
  const appointments1h = await prisma.appointment.findMany({
    where: {
      scheduledAt: {
        gte: addHours(now, 0.5),
        lte: addHours(now, 1.5),
      },
      reminded1hAt: null,
      status: 'SCHEDULED',
    },
    include: { lead: true },
  });

  for (const appt of appointments1h) {
    await sendReminder(appt, '1h');
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminded1hAt: new Date() },
    });
  }
}

async function sendReminder(appointment: any, type: '24h' | '1h') {
  const { lead, scheduledAt } = appointment;
  const timeStr = format(scheduledAt, 'p');
  const dateStr = format(scheduledAt, 'PPP');
  
  let message = '';
  if (type === '24h') {
    message = `Reminder: Hi ${lead.name}, you have an estimate appointment scheduled for tomorrow, ${dateStr} at ${timeStr}. Please reply CONFIRM to let us know you're still available, or use this link to reschedule: https://replypilot.app/book/${lead.id}`;
  } else {
    message = `See you soon! Hi ${lead.name}, our specialist will be arriving for your estimate in about an hour (${timeStr}). Need to cancel? Call us or use: https://replypilot.app/book/${lead.id}`;
  }

  // Log to Response table (Mock SMS)
  await prisma.response.create({
    data: {
      leadId: lead.id,
      type: 'SMS',
      content: message,
    },
  });

  console.log(`[REMINDER ${type}] Sent to ${lead.name} (${lead.phone}): ${message}`);
}

export async function confirmAppointment(appointmentId: string) {
  return await prisma.appointment.update({
    where: { id: appointmentId },
    data: { confirmedAt: new Date() },
  });
}
