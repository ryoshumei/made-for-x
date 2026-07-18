import { MetadataRoute } from 'next';

// AI/LLM crawlers we explicitly welcome (GEO: Generative Engine Optimization).
// They are already covered by the "*" rule, but explicit rules remove any
// ambiguity and document the intent to be indexable by AI search engines.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
  'Amazonbot',
  'DuckAssistBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: AI_CRAWLERS,
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://madeforx.com/sitemap.xml',
    host: 'https://madeforx.com',
  };
}
