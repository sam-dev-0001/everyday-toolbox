const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://ais-dev-fhia5cq7rwon7eq7g2r2lz-602736084522.asia-southeast1.run.app';
const currentDate = new Date().toISOString().split('T')[0];

const toolsFile = fs.readFileSync(path.join(__dirname, '../src/data/tools.ts'), 'utf8');

// Extract routes from tools.ts
const routeMatches = [...toolsFile.matchAll(/route:\s*'([^']+)'/g)].map(m => m[1]);
const uniqueRoutes = Array.from(new Set(routeMatches));

const categorySlugs = [
  '/image-tools',
  '/pdf-tools',
  '/text-tools',
  '/developer-tools',
  '/file-tools',
  '/qr-barcode-tools',
  '/everyday-utilities',
];

const staticPages = [
  '/about',
  '/privacy',
  '/terms',
  '/contact',
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Homepage -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

// Categories
categorySlugs.forEach(cat => {
  xml += `  <url>
    <loc>${BASE_URL}${cat}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

// Tools
uniqueRoutes.forEach(r => {
  xml += `  <url>
    <loc>${BASE_URL}${r}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
});

// Static Pages
staticPages.forEach(p => {
  xml += `  <url>
    <loc>${BASE_URL}${p}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
});

xml += `</urlset>\n`;

const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf8');

console.log(`Successfully generated sitemap with ${1 + categorySlugs.length + uniqueRoutes.length + staticPages.length} URLs at ${sitemapPath}`);
