// Central configuration for AI model names
// Supports environment variable overrides for flexibility

// Default model fallback
export const DEFAULT_MODEL = 'gpt-5-mini';

export const AI_MODELS = {
  // OpenAI Models - Core functionality
  CHAT_COMPLETION: process.env.CHAT_MODEL || DEFAULT_MODEL,
  CODE_GENERATION: process.env.CODE_MODEL || DEFAULT_MODEL,
  REASONING: process.env.REASONING_MODEL || DEFAULT_MODEL,

  // Feature-specific models
  MAIL_GENERATOR: process.env.MAIL_MODEL || DEFAULT_MODEL,
  CUSTOMS_CODE: process.env.CUSTOMS_MODEL || DEFAULT_MODEL,
  EMOJI_ENHANCEMENT: process.env.EMOJI_MODEL || DEFAULT_MODEL,
  POLITE_CONVERSION: process.env.POLITE_MODEL || DEFAULT_MODEL,
  MAIL_REPLY: process.env.REPLY_MODEL || DEFAULT_MODEL,

  // Future expansion
  TRANSLATION: process.env.TRANSLATION_MODEL || DEFAULT_MODEL,
  SUMMARIZATION: process.env.SUMMARY_MODEL || DEFAULT_MODEL,
} as const;

// Type definition for type safety
export type ModelName = (typeof AI_MODELS)[keyof typeof AI_MODELS];

// Helper function to get model for specific feature
export function getModelForFeature(feature: keyof typeof AI_MODELS): string {
  return AI_MODELS[feature];
}

// UI display constants
export const UI_CONSTANTS = {
  MODEL_DISPLAY_NAME: 'OpenAI GPT-5 Mini',
  POWERED_BY_TEXT: 'powered by OpenAI GPT-5 Mini',
} as const;
