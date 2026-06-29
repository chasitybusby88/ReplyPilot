import OpenAI from 'openai';
import dotenv from 'dotenv';
import prisma from '../lib/prisma';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LeadInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message?: string | null;
}

/**
 * Generates and stores AI responses for a lead.
 */
export async function processLeadResponse(lead: LeadInfo) {
  console.log(`Generating AI responses for lead: ${lead.id} (${lead.serviceType})`);

  // 1. Generate Email Content
  const emailContent = await generateEmailContent(lead);
  
  // 2. Generate SMS Content
  const smsContent = await generateSMSContent(lead);

  // 3. Store in database
  const responses = await prisma.response.createMany({
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

  // 4. Update Lead Status
  await prisma.lead.update({
    where: { id: lead.id },
    data: { status: 'RESPONDED' },
  });

  // Mock sending
  console.log(`[MOCK SEND] Email to ${lead.email}: ${emailContent.substring(0, 50)}...`);
  console.log(`[MOCK SEND] SMS to ${lead.phone}: ${smsContent}`);

  return { emailContent, smsContent };
}

async function generateEmailContent(lead: LeadInfo): Promise<string> {
  const prompt = `
    You are a professional assistant for a home service business (${lead.serviceType}).
    Lead Name: ${lead.name}
    Lead Message: ${lead.message || 'No message provided'}

    Write a professional and friendly email acknowledgment.
    Include:
    1. A greeting to ${lead.name}.
    2. Acknowledgment of their interest in ${lead.serviceType}.
    3. A statement that we will be in touch shortly to provide a detailed quote.
    4. Mention that we may need to ask a few more questions to get the estimate right.
    5. A professional sign-off.

    Keep it concise but helpful.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    });

    return response.choices[0]?.message.content || getDefaultEmail(lead);
  } catch (error) {
    console.error('Error generating email response:', error);
    return getDefaultEmail(lead);
  }
}

async function generateSMSContent(lead: LeadInfo): Promise<string> {
  const prompt = `
    You are a friendly assistant for a home service business (${lead.serviceType}).
    Lead Name: ${lead.name}

    Write a short, friendly SMS message (max 160 characters).
    Include:
    1. A quick hello.
    2. Acknowledgment of their ${lead.serviceType} request.
    3. One quick qualification question related to ${lead.serviceType} (e.g., for roofing: "Roughly how many square feet is your roof?", for plumbing: "Is this an emergency or a routine repair?").

    Keep it very conversational and brief.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    });

    return response.choices[0]?.message.content || getDefaultSMS(lead);
  } catch (error) {
    console.error('Error generating SMS response:', error);
    return getDefaultSMS(lead);
  }
}

function getDefaultEmail(lead: LeadInfo) {
  return `Hi ${lead.name}, thank you for your interest in our ${lead.serviceType} services. We have received your request and will be in touch shortly to discuss next steps.`;
}

function getDefaultSMS(lead: LeadInfo) {
  return `Hi ${lead.name}! Thanks for reaching out about ${lead.serviceType}. Quick question: when are you looking to get this started?`;
}
