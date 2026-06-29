import prisma from '../lib/prisma';
import { addDays } from 'date-fns';

export async function assignLeadToSequence(leadId: string, sequenceName: string) {
  const sequence = await prisma.followUpSequence.findFirst({
    where: { name: sequenceName },
  });

  if (!sequence) {
    throw new Error(`Sequence ${sequenceName} not found`);
  }

  // Create assignment
  await prisma.leadSequence.upsert({
    where: {
      leadId_sequenceId: {
        leadId,
        sequenceId: sequence.id,
      },
    },
    update: {
      status: 'ACTIVE',
      currentDay: 0,
      nextSendAt: addDays(new Date(), 1), // Start tomorrow
    },
    create: {
      leadId,
      sequenceId: sequence.id,
      status: 'ACTIVE',
      currentDay: 0,
      nextSendAt: addDays(new Date(), 1),
    },
  });

  console.log(`Lead ${leadId} assigned to sequence ${sequenceName}`);
}

export async function processPendingFollowUps() {
  const now = new Date();

  // Find all active sequences that are due
  const pendingAssignments = await prisma.leadSequence.findMany({
    where: {
      status: 'ACTIVE',
      nextSendAt: {
        lte: now,
      },
    },
    include: {
      lead: true,
      sequence: {
        include: {
          steps: true,
        },
      },
    },
  });

  console.log(`Processing ${pendingAssignments.length} pending follow-ups`);

  for (const assignment of pendingAssignments) {
    // Check if lead has booked or responded recently? 
    // Usually handled by status updates, but let's double check status
    if (assignment.lead.status === 'QUALIFIED' || assignment.lead.status === 'BOOKED') {
        // Auto-stop if qualified or booked
        await prisma.leadSequence.update({
            where: { id: assignment.id },
            data: { status: 'STOPPED' }
        });
        continue;
    }

    const nextDay = assignment.currentDay + 1;
    const step = assignment.sequence.steps.find((s) => s.day === nextDay);

    if (step) {
      // Send the message (Mock)
      await sendFollowUpMessage(assignment.lead, step, assignment.id);

      // Update assignment
      await prisma.leadSequence.update({
        where: { id: assignment.id },
        data: {
          currentDay: nextDay,
          nextSendAt: addDays(now, 1), // Schedule next one for tomorrow
        },
      });
    } else {
      // No more steps, mark as completed
      await prisma.leadSequence.update({
        where: { id: assignment.id },
        data: {
          status: 'COMPLETED',
        },
      });
      console.log(`Lead ${assignment.leadId} completed sequence ${assignment.sequence.name}`);
    }
  }
}

async function sendFollowUpMessage(lead: any, step: any, leadSequenceId: string) {
  const content = interpolateTemplate(step.template, lead);
  
  // Log the response and link it to the step and sequence
  await prisma.response.create({
    data: {
      leadId: lead.id,
      leadSequenceId: leadSequenceId,
      stepId: step.id,
      type: step.type,
      content: content,
    },
  });

  console.log(`[FOLLOW-UP] Sent ${step.type} (Day ${step.day}) to ${lead.name}: ${content.substring(0, 50)}...`);
}

function interpolateTemplate(template: string, data: any) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

export async function stopFollowUpSequence(leadId: string) {
  await prisma.leadSequence.updateMany({
    where: { leadId, status: 'ACTIVE' },
    data: { status: 'STOPPED' },
  });
  console.log(`Stopped follow-up sequences for lead ${leadId}`);
}
