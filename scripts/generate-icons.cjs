const sharp = require('sharp');
const fs = require('fs');

const SRC = 'assets/icon.svg';
const OUT = 'assets/icon.png';
const ANDROID = 'android/app/src/main/res';
const WEB = 'public/icons';

const ANDROID_ICONS = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

const ADAPTIVE_SIZES = [
  { dir: 'mipmap-mdpi', size: 108 },
  { dir: 'mipmap-hdpi', size: 162 },
  { dir: 'mipmap-xhdpi', size: 216 },
  { dir: 'mipmap-xxhdpi', size: 324 },
  { dir: 'mipmap-xxxhdpi', size: 432 },
];

const WEB_ICONS = [
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
];

async function main() {
  const svg = fs.readFileSync(SRC);
  const buf = await sharp(svg).resize(1024, 1024).png().toBuffer();
  fs.writeFileSync(OUT, buf);
  console.log('icon.png 1024x1024');

  for (const { dir, size } of ANDROID_ICONS) {
    const p = `${ANDROID}/${dir}/ic_launcher.png`;
    await sharp(buf).resize(size, size).png().toFile(p);
    console.log(`${dir}/ic_launcher.png ${size}px`);
  }

  for (const { dir, size } of ADAPTIVE_SIZES) {
    const inner = Math.round(size * 66 / 108);
    const p = `${ANDROID}/${dir}/ic_launcher_foreground.png`;
    await sharp(buf)
      .resize(inner, inner)
      .extend({
        top: Math.round((size - inner) / 2),
        bottom: Math.round((size - inner) / 2),
        left: Math.round((size - inner) / 2),
        right: Math.round((size - inner) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(p);
    console.log(`${dir}/ic_launcher_foreground.png ${size}px`);
  }

  await sharp(buf).resize(512, 512).png().toFile(`${ANDROID}/drawable/splash.png`);
  console.log('splash.png 512px');

  for (const { name, size } of WEB_ICONS) {
    await sharp(buf).resize(size, size).png().toFile(`${WEB}/${name}`);
    console.log(`${name} ${size}px`);
  }

  // Generate a small avatar for the app header
  await sharp(buf).resize(32, 32).png().toFile('public/logo-32.png');
  console.log('logo-32.png 32px');
}

main().catch(console.error);
