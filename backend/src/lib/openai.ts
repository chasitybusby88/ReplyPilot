import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LeadInfo {
  name: string;
  serviceType: string;
  message?: string | null;
}

export async function generateEmailResponse(lead: LeadInfo): Promise<string> {
  const prompt = `
    You are a professional assistant for a home service business.
    We just received a new lead for ${lead.serviceType}.
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

    return response.choices[0]?.message.content || "Thank you for your interest! We'll be in touch soon.";
  } catch (error) {
    console.error('Error generating email response:', error);
    return `Hi ${lead.name}, thank you for your interest in our ${lead.serviceType} services. We have received your request and will be in touch shortly.`;
  }
}

export async function generateSMSResponse(lead: LeadInfo): Promise<string> {
  const prompt = `
    You are a friendly assistant for a home service business.
    We just received a new lead for ${lead.serviceType}.
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

    return response.choices[0]?.message.content || `Hi ${lead.name}! Thanks for reaching out about ${lead.serviceType}. Quick question: when are you looking to get this started?`;
  } catch (error) {
    console.error('Error generating SMS response:', error);
    return `Hi ${lead.name}! Thanks for your interest in our ${lead.serviceType} services. Quick question: when would be a good time to discuss your project?`;
  }
}
