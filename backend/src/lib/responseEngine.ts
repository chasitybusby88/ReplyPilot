import prisma from './prisma';
import { generateEmailResponse, generateSMSResponse } from './openai';

export async function processNewLead(leadId: string) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      console.error(`Lead with ID ${leadId} not found`);
      return;
    }

    console.log(`Processing response for lead: ${lead.id} (${lead.serviceType})`);

    // 1. Generate responses using LLM
    const emailContent = await generateEmailResponse(lead);
    const smsContent = await generateSMSResponse(lead);

    // 2. Log responses to database
    await prisma.response.createMany({
      data: [
        {
          leadId: lead.id,
          type: 'EMAIL',
          content: emailContent,
        },
        {
          leadId: lead.id,
          type: 'SMS',
          content: smsContent,
        },
      ],
    });

    // 3. Update lead status if necessary
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: 'RESPONDED' },
    });

    // 4. Actually send the responses (Placeholders for now)
    // In a real app, this would call Twilio and an Email API
    console.log(`[MOCK SEND] Email to ${lead.email}: ${emailContent}`);
    console.log(`[MOCK SEND] SMS to ${lead.phone}: ${smsContent}`);

    return { emailContent, smsContent };
  } catch (error) {
    console.error('Error in response engine:', error);
    throw error;
  }
}
