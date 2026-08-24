const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="et-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7C3AED" />
      <stop offset="50%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>
  </defs>
  
  <!-- Rounded squircle background matching Everyday Toolbox logo -->
  <rect width="512" height="512" rx="120" ry="120" fill="url(#et-gradient)" />
  
  <!-- Centered Sparkles icon from Lucide (scaled to match 5/9 ratio) -->
  <g transform="translate(112, 112) scale(12)" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
    <path d="M20 2v4" />
    <path d="M22 4h-4" />
    <circle cx="4" cy="20" r="2" />
  </g>
</svg>`;

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write favicon.svg
  const svgPath = path.join(publicDir, 'favicon.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log('Generated favicon.svg');

  // 2. Generate PNGs
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 }
  ];

  const svgBuffer = Buffer.from(svgContent);

  for (const item of sizes) {
    const outPath = path.join(publicDir, item.name);
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(outPath);
    console.log(`Generated ${item.name}`);
  }

  // 3. Generate favicon.ico (multi-resolution 16, 32, 48)
  try {
    const icoFn = pngToIco.default || pngToIco;
    const icoBuffer = await icoFn([
      path.join(publicDir, 'favicon-16x16.png'),
      path.join(publicDir, 'favicon-32x32.png'),
      path.join(publicDir, 'favicon-48x48.png')
    ]);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('Generated multi-resolution favicon.ico');
  } catch (e) {
    console.error('Error generating ICO:', e);
  }

  // 4. Create site.webmanifest for PWA / Mobile bookmarking if supported
  const manifest = {
    name: 'Everyday Toolbox',
    short_name: 'Everyday Toolbox',
    description: 'Fast, private client-side utilities and everyday tools.',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    theme_color: '#7C3AED',
    background_color: '#070A14',
    display: 'standalone',
    start_url: '/'
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Generated site.webmanifest');
  console.log('All favicons successfully generated!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
