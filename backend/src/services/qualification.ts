import OpenAI from 'openai';
import dotenv from 'dotenv';
import prisma from '../lib/prisma';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedQualification {
  propertyDetails?: Record<string, any>;
  urgency?: string;
  budgetRange?: string;
  serviceNeeded?: string;
}

/**
 * Uses LLM to extract qualification data from a lead's message or reply.
 */
export async function extractQualificationData(serviceType: string, text: string): Promise<ExtractedQualification | null> {
  const prompt = `
    You are an AI assistant helping a home service business (${serviceType}) qualify a lead.
    The lead just sent the following message:
    "${text}"

    Your task is to extract the following information if present:
    1. Property details (e.g., roof square footage, number of rooms, type of property, etc.)
    2. Urgency or timeline (e.g., "ASAP", "next month", "emergency")
    3. Budget range if mentioned.
    4. Specific service needed if more detail than "${serviceType}" is provided.

    Return the data in the following JSON format:
    {
      "propertyDetails": { ... },
      "urgency": "string or null",
      "budgetRange": "string or null",
      "serviceNeeded": "string or null"
    }

    Only include fields that you can reasonably extract from the text. Return an empty object if no information is found.
    Respond ONLY with the JSON.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message.content;
    if (!content) return null;

    console.log(`Extracted data for ${serviceType}: ${content}`);
    return JSON.parse(content) as ExtractedQualification;
  } catch (error) {
    console.error('Error extracting qualification data (using fallback):', error);
    
    // Simple Regex Fallback
    const result: ExtractedQualification = {
        propertyDetails: {},
        urgency: null,
        budgetRange: null
    };

    // Try to find sq ft
    const sqFtMatch = text.match(/(\d+)\s*sq\s*ft/i);
    if (sqFtMatch) {
        result.propertyDetails = { ...result.propertyDetails, sqFt: sqFtMatch[1] };
    }

    // Try to find urgency
    if (text.toLowerCase().includes('asap') || text.toLowerCase().includes('immediately') || text.toLowerCase().includes('right now')) {
        result.urgency = 'High';
    }

    // Try to find budget
    const budgetMatch = text.match(/\$(\d+[\d,]*)/);
    if (budgetMatch) {
        result.budgetRange = budgetMatch[0];
    }

    return result;
  }
}

/**
 * Updates a lead's qualification data and status.
 */
export async function processLeadReply(leadId: string, replyText: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  // 1. Log the reply
  await prisma.response.create({
    data: {
      leadId,
      type: 'REPLY',
      content: replyText,
    },
  });

  // 2. Extract data
  const extracted = await extractQualificationData(lead.serviceType, replyText);
  
  if (extracted) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return;

    // Merge property details
    const currentDetails = (lead.propertyDetails as Record<string, any>) || {};
    const newDetails = { ...currentDetails, ...(extracted.propertyDetails || {}) };

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        propertyDetails: newDetails,
        urgency: extracted.urgency || lead.urgency,
        budgetRange: extracted.budgetRange || lead.budgetRange,
      },
    });

    // 3. Check if qualified
    const isQualified = checkQualification(updatedLead);
    
    if (isQualified && updatedLead.qualificationStatus !== 'QUALIFIED') {
      await prisma.lead.update({
        where: { id: leadId },
        data: { 
          qualificationStatus: 'QUALIFIED',
          status: 'QUALIFIED' 
        },
      });
      console.log(`[NOTIFICATION] Business owner notified: Lead ${updatedLead.name} (${updatedLead.id}) is now QUALIFIED and ready for an estimate.`);
    } else if (!isQualified) {
        await prisma.lead.update({
            where: { id: leadId },
            data: { qualificationStatus: 'PARTIAL' },
        });
    }
  }
}

function checkQualification(lead: any): boolean {
  // Logic to determine if a lead is "ready for estimate"
  // For now, let's say they need at least propertyDetails and urgency
  const hasPropertyDetails = lead.propertyDetails && Object.keys(lead.propertyDetails as object).length > 0;
  const hasUrgency = !!lead.urgency;
  
  return !!(hasPropertyDetails && hasUrgency);
}
