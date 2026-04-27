const SITE_URL = 'https://midsphere.ai';
const SITE_NAME = 'Midsphere';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Open-source framework for shipping AI features. Internal copilots, batch report generators, voice transcribers, agent workflows.',
    logo: `${SITE_URL}/brand/wordmark.svg`,
  };
}

export function blogPostingSchema(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    image: opts.image ?? `${SITE_URL}/brand/mark.svg`,
    url: opts.url,
    datePublished: opts.datePublished,
    ...(opts.dateModified && { dateModified: opts.dateModified }),
    author: {
      '@type': 'Person',
      name: opts.author ?? 'Midsphere Team',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}
