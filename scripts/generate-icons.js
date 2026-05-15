const sharp = require("sharp");
const path = require("path");

const assetsDir = path.join(__dirname, "../assets");

function makeSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.37;
  const dotR = size * 0.05;
  const gap = size * 0.125;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FBF8F3"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#C4956A"/>
  <circle cx="${cx - gap}" cy="${cy - size * 0.02}" r="${dotR}" fill="white"/>
  <circle cx="${cx}" cy="${cy - size * 0.02}" r="${dotR}" fill="white"/>
  <circle cx="${cx + gap}" cy="${cy - size * 0.02}" r="${dotR}" fill="white" opacity="0.4"/>
  <path d="M ${cx - gap * 1.4} ${cy + size * 0.09} Q ${cx} ${cy + size * 0.19} ${cx + gap * 1.4} ${cy + size * 0.09}"
    stroke="white" stroke-width="${size * 0.018}" fill="none" stroke-linecap="round" opacity="0.55"/>
</svg>`;
}

function makeSplashSvg(w, h) {
  const cx = w / 2;
  const cy = h * 0.44;
  const r = Math.min(w, h) * 0.22;
  const dotR = r * 0.14;
  const gap = r * 0.34;

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#FBF8F3"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#C4956A"/>
  <circle cx="${cx - gap}" cy="${cy - r * 0.05}" r="${dotR}" fill="white"/>
  <circle cx="${cx}" cy="${cy - r * 0.05}" r="${dotR}" fill="white"/>
  <circle cx="${cx + gap}" cy="${cy - r * 0.05}" r="${dotR}" fill="white" opacity="0.4"/>
  <path d="M ${cx - gap * 1.4} ${cy + r * 0.25} Q ${cx} ${cy + r * 0.52} ${cx + gap * 1.4} ${cy + r * 0.25}"
    stroke="white" stroke-width="${r * 0.048}" fill="none" stroke-linecap="round" opacity="0.55"/>
</svg>`;
}

async function generate() {
  // App icon
  await sharp(Buffer.from(makeSvg(1024))).png().toFile(`${assetsDir}/icon.png`);
  console.log("✓ icon.png");

  // Android adaptive icon (foreground, no background)
  await sharp(Buffer.from(makeSvg(1024))).png().toFile(`${assetsDir}/adaptive-icon.png`);
  console.log("✓ adaptive-icon.png");

  // Splash icon
  await sharp(Buffer.from(makeSplashSvg(1284, 2778))).png().toFile(`${assetsDir}/splash-icon.png`);
  console.log("✓ splash-icon.png");

  // Favicon
  await sharp(Buffer.from(makeSvg(48))).png().toFile(`${assetsDir}/favicon.png`);
  console.log("✓ favicon.png");

  console.log("\nAll icons generated!");
}

generate().catch(console.error);
