const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://everydaytool.pages.dev';

const toolsFilePath = path.join(__dirname, '../src/data/tools.ts');
const toolsFileContent = fs.readFileSync(toolsFilePath, 'utf8');

// Dynamically extract category slugs from tools.ts
const categoryMatches = [...toolsFileContent.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
// Filter out /tools if homepage already covers all tools or keep unique non-home slugs
const uniqueCategorySlugs = Array.from(new Set(categoryMatches)).filter(slug => slug !== '/tools' && slug.startsWith('/'));

// Dynamically extract tool routes from tools.ts
const routeMatches = [...toolsFileContent.matchAll(/route:\s*'([^']+)'/g)].map(m => m[1]);
const uniqueToolRoutes = Array.from(new Set(routeMatches));

// Real static pages in the project (defined in App.tsx / StaticPages.tsx)
const staticPages = [
  '/about',
  '/privacy',
  '/terms',
  '/contact',
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
  </url>
`;

// Categories
uniqueCategorySlugs.forEach(catSlug => {
  xml += `  <url>
    <loc>${BASE_URL}${catSlug}</loc>
  </url>
`;
});

// Tools
uniqueToolRoutes.forEach(route => {
  xml += `  <url>
    <loc>${BASE_URL}${route}</loc>
  </url>
`;
});

// Static Pages
staticPages.forEach(page => {
  xml += `  <url>
    <loc>${BASE_URL}${page}</loc>
  </url>
`;
});

xml += `</urlset>\n`;

const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf8');

const totalUrls = 1 + uniqueCategorySlugs.length + uniqueToolRoutes.length + staticPages.length;
console.log(`Successfully generated sitemap with ${totalUrls} URLs at ${sitemapPath}`);
