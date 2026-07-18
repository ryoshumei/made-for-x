// JSON-LD is rendered as an inline <script> in the server HTML (not via next/script)
// so that crawlers that don't execute JavaScript — including most AI crawlers like
// GPTBot, ClaudeBot, and PerplexityBot — can read the structured data.
function JsonLd({ id, data }: { id: string; data: Record<string, unknown> }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // Escape "<" to prevent the payload from closing the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

interface ServiceStructuredDataProps {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  provider: {
    name: string;
    url: string;
  };
  serviceType?: string;
  areaServed?: string | string[];
}

export function ServiceStructuredData({
  name,
  description,
  url,
  applicationCategory,
  operatingSystem = 'Web',
  offers,
  provider,
  serviceType,
  areaServed,
}: ServiceStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': serviceType ? 'Service' : 'WebApplication',
    name,
    description,
    url,
    inLanguage: 'ja',
    isAccessibleForFree: true,
    applicationCategory,
    operatingSystem,
    ...(offers && { offers: { '@type': 'Offer', ...offers } }),
    provider: {
      '@type': 'Organization',
      ...provider,
    },
    ...(areaServed && { areaServed }),
    ...(serviceType && { serviceType }),
  };

  return (
    <JsonLd
      id={`structured-data-${name.replace(/\s+/g, '-').toLowerCase()}`}
      data={structuredData}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd id="breadcrumb-structured-data" data={structuredData} />;
}

interface OrganizationStructuredDataProps {
  name: string;
  url: string;
  description: string;
  logo?: string;
  sameAs?: string[];
}

export function OrganizationStructuredData({
  name,
  url,
  description,
  logo,
  sameAs,
}: OrganizationStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    description,
    ...(logo && { logo }),
    ...(sameAs && { sameAs }),
  };

  return <JsonLd id="organization-structured-data" data={structuredData} />;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQStructuredDataProps {
  items: FAQItem[];
  id?: string;
}

export function FAQStructuredData({ items, id = 'faq-structured-data' }: FAQStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'ja',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <JsonLd id={id} data={structuredData} />;
}

interface WebSiteStructuredDataProps {
  name: string;
  url: string;
  description: string;
  inLanguage?: string;
  publisher?: {
    name: string;
    url: string;
  };
}

export function WebSiteStructuredData({
  name,
  url,
  description,
  inLanguage = 'ja-JP',
  publisher,
}: WebSiteStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    inLanguage,
    ...(publisher && {
      publisher: {
        '@type': 'Organization',
        ...publisher,
      },
    }),
  };

  return <JsonLd id="website-structured-data" data={structuredData} />;
}
