import { invokeLLM } from "./_core/llm";
import type { KnowledgeBase } from "../drizzle/schema";

export interface GeneratedEmail {
  sequenceNumber: number;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  previewText: string;
}

/**
 * Generate a sequence of 10 emails using AI based on knowledge base
 */
export async function generateEmailSequence(
  knowledgeBase: KnowledgeBase,
  campaignName: string
): Promise<GeneratedEmail[]> {
  const prompt = buildEmailGenerationPrompt(knowledgeBase, campaignName);
  
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert email marketing copywriter specialized in creating high-converting email sequences for businesses. You understand the importance of storytelling, value delivery, and building relationships through email."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "email_sequence",
        strict: true,
        schema: {
          type: "object",
          properties: {
            emails: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sequenceNumber: { type: "integer", description: "Email number in sequence (1-10)" },
                  subject: { type: "string", description: "Email subject line" },
                  previewText: { type: "string", description: "Preview text shown in inbox" },
                  bodyText: { type: "string", description: "Plain text version of email body" },
                  bodyHtml: { type: "string", description: "HTML version of email body with proper formatting" },
                },
                required: ["sequenceNumber", "subject", "previewText", "bodyText", "bodyHtml"],
                additionalProperties: false,
              },
            },
          },
          required: ["emails"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No content generated from LLM");
  }

  const result = JSON.parse(content);
  return result.emails as GeneratedEmail[];
}

/**
 * Build the prompt for email generation based on knowledge base
 */
function buildEmailGenerationPrompt(kb: KnowledgeBase, campaignName: string): string {
  return `
Generate a sequence of 10 marketing emails for a campaign called "${campaignName}".

**Business Information:**
${kb.businessContext || "Not provided"}

**Products/Services:**
${kb.products || "Not provided"}
${kb.services || "Not provided"}

**Target Audience:**
${kb.targetAudience || "Not provided"}

**Campaign Goals:**
${kb.campaignGoals || "Not provided"}

**Tone of Voice:**
${kb.toneOfVoice || "Professional and friendly"}

**Additional Context:**
${kb.additionalInfo || "None"}

**Requirements:**
1. Create a cohesive 10-email sequence that builds a relationship with the audience
2. Each email should provide value and move the reader closer to the campaign goal
3. Use the specified tone of voice consistently
4. Include clear calls-to-action in each email
5. Make each email engaging and personalized
6. Follow this general structure:
   - Email 1: Introduction and value proposition
   - Email 2-3: Education and problem awareness
   - Email 4-5: Solution presentation
   - Email 6-7: Social proof and testimonials
   - Email 8-9: Urgency and special offers
   - Email 10: Final call-to-action

**Format:**
- Subject lines should be compelling and under 60 characters
- Preview text should complement the subject line
- Body text should be conversational and scannable
- HTML should include proper formatting with headings, paragraphs, and links
- Each email should be 150-300 words

Generate the complete sequence now.
  `.trim();
}

/**
 * Regenerate a single email in the sequence
 */
export async function regenerateEmail(
  knowledgeBase: KnowledgeBase,
  sequenceNumber: number,
  previousEmail?: string,
  nextEmail?: string
): Promise<GeneratedEmail> {
  const prompt = `
Regenerate email #${sequenceNumber} in a 10-email marketing sequence.

**Business Information:**
${knowledgeBase.businessContext || "Not provided"}

**Products/Services:**
${knowledgeBase.products || "Not provided"}
${knowledgeBase.services || "Not provided"}

**Target Audience:**
${knowledgeBase.targetAudience || "Not provided"}

**Campaign Goals:**
${knowledgeBase.campaignGoals || "Not provided"}

**Tone of Voice:**
${knowledgeBase.toneOfVoice || "Professional and friendly"}

${previousEmail ? `**Previous Email (for context):**\n${previousEmail}\n` : ""}
${nextEmail ? `**Next Email (for context):**\n${nextEmail}\n` : ""}

Generate a fresh version of email #${sequenceNumber} that fits well in the sequence.
  `.trim();

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert email marketing copywriter."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "single_email",
        strict: true,
        schema: {
          type: "object",
          properties: {
            sequenceNumber: { type: "integer" },
            subject: { type: "string" },
            previewText: { type: "string" },
            bodyText: { type: "string" },
            bodyHtml: { type: "string" },
          },
          required: ["sequenceNumber", "subject", "previewText", "bodyText", "bodyHtml"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No content generated from LLM");
  }

  return JSON.parse(content) as GeneratedEmail;
}
