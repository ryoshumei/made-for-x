import Script from 'next/script';

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
    <Script
      id={`structured-data-${name.replace(/\s+/g, '-').toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
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

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
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

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
