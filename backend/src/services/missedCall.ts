import prisma from '../lib/prisma';
import { addMinutes, isBefore } from 'date-fns';

export interface MissedCallData {
  phone: string;
  callSid: string;
  fromCity?: string;
  fromState?: string;
  fromCountry?: string;
}

export async function handleMissedCall(data: MissedCallData) {
  // Normalize phone number (handle space from URL-decoded '+')
  const phone = data.phone.trim().replace(/^ /, '+');

  // 1. Log the missed call
  const missedCall = await prisma.missedCall.create({
    data: {
      phone: phone,
      callSid: data.callSid,
      fromCity: data.fromCity,
      fromState: data.fromState,
      fromCountry: data.fromCountry,
    },
  });

  console.log(`[MISSED CALL] Logged call from ${phone} (SID: ${data.callSid})`);

  // 2. Check if a lead already exists for this phone number
  let lead = await prisma.lead.findFirst({
    where: { phone: phone },
  });

  if (!lead) {
    // Optional: Create a partial lead so we have an ID for the booking link
    lead = await prisma.lead.create({
      data: {
        name: 'Valued Customer', // Placeholder
        phone: phone,
        email: 'pending@example.com', // Placeholder
        serviceType: 'Inquiry', // Placeholder
        status: 'PARTIAL',
      },
    });
    console.log(`[MISSED CALL] Created partial lead for new number: ${lead.id}`);
  }

  // 3. Send auto-text-back (Mock)
  const bookingLink = `https://replypilot.app/book/${lead.id}`;
  const message = `Sorry we missed you! We'll get back ASAP. In the meantime, you can book an estimate here: ${bookingLink} or reply with your service needs.`;

  await prisma.response.create({
    data: {
      leadId: lead.id,
      type: 'SMS',
      content: message,
    },
  });

  await prisma.missedCall.update({
    where: { id: missedCall.id },
    data: { respondedAt: new Date() },
  });

  console.log(`[MOCK SEND] SMS to ${phone}: ${message}`);

  return { missedCallId: missedCall.id, leadId: lead.id };
}

export async function processPendingEscalations() {
  const thirtyMinutesAgo = addMinutes(new Date(), -30);

  // Find missed calls older than 30 mins that haven't been forwarded
  // and where the lead hasn't replied yet.
  // Note: For this mock, we'll assume "replied" means a Response entry exists 
  // that was created after the missed call and isn't the auto-text-back.
  // To keep it simple, we'll just check if forwardedAt is null and createdAt < 30 mins ago.

  const pendingCalls = await prisma.missedCall.findMany({
    where: {
      forwardedAt: null,
      createdAt: {
        lte: thirtyMinutesAgo,
      },
    },
  });

  console.log(`[ESCALATION] Checking ${pendingCalls.length} pending missed call escalations`);

  for (const call of pendingCalls) {
    // In a real app, we'd check for incoming messages from this phone number.
    // For this mock, we'll just forward it.
    
    await forwardToBusinessOwner(call);

    await prisma.missedCall.update({
      where: { id: call.id },
      data: { forwardedAt: new Date() },
    });
  }
}

async function forwardToBusinessOwner(call: any) {
  const message = `ESCALATION: Missed call from ${call.phone} (${call.fromCity || 'Unknown City'}) 30 minutes ago still has no recorded follow-up reply from the customer.`;
  
  // Mock forwarding (e.g., to an internal notification system or owner's phone)
  console.log(`[NOTIFICATION TO OWNER] ${message}`);
}
