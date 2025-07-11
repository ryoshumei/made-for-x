// Central configuration for AI model names
// Supports environment variable overrides for flexibility

export const AI_MODELS = {
  // OpenAI Models - Core functionality
  CHAT_COMPLETION: process.env.CHAT_MODEL || 'o4-mini',
  CODE_GENERATION: process.env.CODE_MODEL || 'o4-mini',
  REASONING: process.env.REASONING_MODEL || 'o4-mini',

  // Feature-specific models
  MAIL_GENERATOR: process.env.MAIL_MODEL || 'o4-mini',
  CUSTOMS_CODE: process.env.CUSTOMS_MODEL || 'o4-mini',
  EMOJI_ENHANCEMENT: process.env.EMOJI_MODEL || 'o4-mini',
  POLITE_CONVERSION: process.env.POLITE_MODEL || 'o4-mini',
  MAIL_REPLY: process.env.REPLY_MODEL || 'o4-mini',

  // Future expansion
  TRANSLATION: process.env.TRANSLATION_MODEL || 'o4-mini',
  SUMMARIZATION: process.env.SUMMARY_MODEL || 'o4-mini',
} as const;

// Type definition for type safety
export type ModelName = (typeof AI_MODELS)[keyof typeof AI_MODELS];

// Helper function to get model for specific feature
export function getModelForFeature(feature: keyof typeof AI_MODELS): string {
  return AI_MODELS[feature];
}

// Default model fallback
export const DEFAULT_MODEL = 'o4-mini';
