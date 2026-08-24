const sharp = require('sharp');
const path = require('path');

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#070A14"/>
          <stop offset="50%" stop-color="#0D1224"/>
          <stop offset="100%" stop-color="#150D2A"/>
        </linearGradient>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7C3AED"/>
          <stop offset="50%" stop-color="#8B5CF6"/>
          <stop offset="100%" stop-color="#3B82F6"/>
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="40" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
      
      <!-- Subtle ambient glow -->
      <circle cx="200" cy="180" r="180" fill="#7C3AED" opacity="0.15" filter="url(#glow)"/>
      <circle cx="1000" cy="450" r="220" fill="#3B82F6" opacity="0.12" filter="url(#glow)"/>

      <!-- App Logo Icon -->
      <g transform="translate(100, 140)">
        <rect width="110" height="110" rx="30" fill="url(#brandGrad)"/>
        <!-- Sparkle Icon -->
        <path d="M55,20 L61,44 L85,50 L61,56 L55,80 L49,56 L25,50 L49,44 Z" fill="#FFFFFF"/>
        <path d="M78,25 L81,35 L91,38 L81,41 L78,51 L75,41 L65,38 L75,35 Z" fill="#FFFFFF" opacity="0.8"/>
      </g>

      <!-- Brand Name -->
      <text x="240" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="64" fill="#FFFFFF" letter-spacing="-1">
        Everyday<tspan fill="#A78BFA">Toolbox</tspan>
      </text>

      <!-- Headline -->
      <text x="100" y="340" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="46" fill="#F8FAFC" letter-spacing="-0.5">
        60+ Free, Fast &amp; Private Web Utilities
      </text>

      <!-- Subtitle -->
      <text x="100" y="410" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="26" fill="#94A3B8">
        Image Compression, PDF Tools, JSON Formatter, QR Codes, and Calculators.
      </text>

      <!-- Privacy Badge -->
      <g transform="translate(100, 480)">
        <rect width="460" height="54" rx="18" fill="#10B981" fill-opacity="0.15" stroke="#10B981" stroke-opacity="0.3" stroke-width="2"/>
        <circle cx="30" cy="27" r="10" fill="#10B981"/>
        <path d="M26,27 L29,30 L35,24" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="52" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="20" fill="#6EE7B7">
          100% Client-Side • Zero Server Uploads
        </text>
      </g>
    </svg>
  `;

  const outputPath = path.join(__dirname, '../public/og-image.png');
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`Generated og-image.png at ${outputPath}`);
}

generateOgImage().catch(console.error);
