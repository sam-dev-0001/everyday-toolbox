import React, { useEffect } from 'react';
import { Tool, CategoryInfo } from '../types';

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  keywords?: string[];
  tool?: Tool;
  category?: CategoryInfo;
  isHome?: boolean;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalUrl,
  keywords,
  tool,
  category,
  isHome,
}) => {
  useEffect(() => {
    // Determine effective metadata
    const siteName = 'Everyday Toolbox';
    const origin = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') ? window.location.origin : 'https://everydaytool.pages.dev';
    
    let metaTitle = title || 'Everyday Toolbox – 60+ Free Online Web Tools & Utilities';
    let metaDesc = description || '60+ free, fast, client-side tools for images, PDFs, text, file management, developer utilities, and QR codes. 100% private in-browser processing.';
    let metaKeywords = keywords ? keywords.join(', ') : 'online tools, image compressor, pdf merger, word counter, json formatter, qr code generator, free web utilities';
    let effectiveCanonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : origin);

    if (tool) {
      metaTitle = tool.seoTitle || `${tool.name} – Free Online Tool | ${siteName}`;
      metaDesc = tool.seoDescription || tool.description;
      metaKeywords = tool.keywords.join(', ');
      effectiveCanonical = `${origin}${tool.route}`;
    } else if (category && category.id !== 'all') {
      metaTitle = category.seoTitle || `${category.name} Tools – Free Online Utilities | ${siteName}`;
      metaDesc = category.seoDescription || `Free online ${category.name.toLowerCase()} tools running directly in your browser.`;
      effectiveCanonical = `${origin}${category.slug || `/?category=${category.id}`}`;
    } else if (isHome) {
      metaTitle = 'Everyday Toolbox – 60+ Free, Fast & Private Online Web Tools';
      metaDesc = 'Free, lightning-fast online tools for images, PDFs, text manipulation, developer utilities, QR codes, and calculators. 100% private client-side processing.';
      effectiveCanonical = origin;
    }

    // Set Document Title
    document.title = metaTitle;

    // Helper to set or create meta tag
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    setMetaTag('meta[name="description"]', 'name', 'description', metaDesc);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', metaKeywords);

    // Canonical link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', effectiveCanonical);

    // Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', metaTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDesc);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', effectiveCanonical);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', tool ? 'article' : 'website');
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', `${origin}/og-image.png`);

    // Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', metaTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDesc);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', `${origin}/og-image.png`);

    // Build Schema.org Structured Data
    const structuredData: any[] = [];

    // 1. WebSite Schema (Homepage or global)
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: origin,
      description: 'Free client-side online tools for images, PDFs, text, file utilities, and developers.',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });

    // 2. Organization Schema
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: origin,
      logo: `${origin}/apple-touch-icon.png`,
    });

    // 3. WebApplication / SoftwareApplication Schema (For Tool Pages)
    if (tool) {
      const appSchema: any = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: tool.name,
        headline: tool.h1 || tool.name,
        url: `${origin}${tool.route}`,
        description: tool.seoDescription || tool.description,
        applicationCategory: tool.applicationCategory || 'UtilitiesApplication',
        operatingSystem: tool.operatingSystem || 'Web Browser',
        browserRequirements: 'Requires modern web browser with HTML5 and JavaScript support',
        softwareVersion: '1.0',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      };

      if (tool.howToUse && tool.howToUse.length > 0) {
        appSchema.step = tool.howToUse.map((step) => ({
          '@type': 'HowToStep',
          position: step.step,
          name: step.title,
          text: step.desc,
        }));
      }

      structuredData.push(appSchema);

      // BreadcrumbList Schema for Tool
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: origin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: tool.category.charAt(0).toUpperCase() + tool.category.slice(1),
            item: `${origin}/category/${tool.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.name,
            item: `${origin}${tool.route}`,
          },
        ],
      });

      // FAQPage Schema if FAQs exist
      if (tool.faq && tool.faq.length > 0) {
        structuredData.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: tool.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        });
      }
    } else if (category) {
      // BreadcrumbList for Category Page
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: origin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: category.name,
            item: `${origin}${category.slug || `/?category=${category.id}`}`,
          },
        ],
      });
    }

    // Inject Schema.org JSON-LD Script tag
    let schemaScript = document.getElementById('everyday-toolbox-schema-jsonld') as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'everyday-toolbox-schema-jsonld';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(structuredData);

  }, [title, description, canonicalUrl, keywords, tool, category, isHome]);

  return null;
};
