import prisma from '../lib/prisma';
import { addMinutes, startOfHour, addHours, isBefore, isAfter, format } from 'date-fns';

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

/**
 * Generates available time slots for a given date.
 * In a real app, this would check Google Calendar/Calendly for conflicts.
 * For now, we'll generate slots from 9 AM to 5 PM with some mock unavailability.
 */
export async function getAvailableSlots(date: Date): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = [];
  const startOfDay = new Date(date);
  startOfDay.setHours(9, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(17, 0, 0, 0);

  // Get existing appointments for this day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        not: 'CANCELLED',
      },
    },
  });

  let currentSlotStart = startOfDay;
  while (isBefore(currentSlotStart, endOfDay)) {
    const currentSlotEnd = addMinutes(currentSlotStart, 60);
    
    // Check if slot is taken
    const isTaken = existingAppointments.some(appt => {
      const apptStart = new Date(appt.scheduledAt);
      const apptEnd = addMinutes(apptStart, appt.durationMinutes);
      
      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      return isBefore(currentSlotStart, apptEnd) && isAfter(currentSlotEnd, apptStart);
    });

    slots.push({
      start: new Date(currentSlotStart),
      end: currentSlotEnd,
      available: !isTaken,
    });

    currentSlotStart = currentSlotEnd;
  }

  return slots;
}

/**
 * Books an appointment for a lead.
 */
export async function bookAppointment(leadId: string, scheduledAt: Date, durationMinutes: number = 60) {
  // 1. Verify lead exists
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error('Lead not found');

  // 2. Check if slot is still available
  const dayStart = new Date(scheduledAt);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(scheduledAt);
  dayEnd.setHours(23, 59, 59, 999);

  const overlap = await prisma.appointment.findFirst({
    where: {
      scheduledAt: {
        gte: addMinutes(scheduledAt, -durationMinutes + 1),
        lte: addMinutes(scheduledAt, durationMinutes - 1),
      },
      status: {
        not: 'CANCELLED',
      },
    },
  });

  if (overlap) {
    throw new Error('This time slot is no longer available');
  }

  // 3. Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      leadId,
      scheduledAt,
      durationMinutes,
      status: 'SCHEDULED',
    },
  });

  // 4. Update lead status
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: 'BOOKED' },
  });

  console.log(`[BOOKING] Appointment confirmed for ${lead.name} at ${format(scheduledAt, 'PPpp')}`);
  
  // 5. Notify business owner (Mock)
  console.log(`[NOTIFICATION] New Booking: ${lead.name} for ${lead.serviceType} on ${format(scheduledAt, 'PPP')} at ${format(scheduledAt, 'p')}`);

  return appointment;
}

/**
 * Cancels an appointment.
 */
export async function cancelAppointment(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { lead: true }
  });

  if (!appointment) throw new Error('Appointment not found');

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' },
  });

  // If we wanted to, we could revert lead status back to QUALIFIED
  // but maybe they just want to reschedule.
  
  console.log(`[BOOKING] Appointment CANCELLED for ${appointment.lead.name}`);
  return { success: true };
}
