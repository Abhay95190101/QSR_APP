const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to encode RGBA buffer to valid PNG
function createPng(width, height, getPixel) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
  buf.writeUInt32BE(crc >>> 0, 8 + len);
  return buf;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Render icon for SS Cafe & Restaurant
function renderIcon(x, y, w, h, isMaskable = false) {
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;

  // Background: Deep Warm Brand Gradient (#ac2d00 to #d73b00)
  const bgGrad = (ny + 1) / 2;
  let bgR = Math.round(172 + (215 - 172) * bgGrad);
  let bgG = Math.round(45 + (59 - 45) * bgGrad);
  let bgB = Math.round(0);

  if (!isMaskable) {
    const rx = Math.abs(nx);
    const ry = Math.abs(ny);
    // Smooth squircle
    if (Math.pow(rx, 4) + Math.pow(ry, 4) > 0.88) {
      return [0, 0, 0, 0];
    }
  }

  // Safe inner zone
  const sx = nx / 0.65;
  const sy = ny / 0.65;

  // Central Gold Coffee Cup & Gourmet Burger Fusion Emblem
  // Top Bun / Cup Lid dome (sy: -0.55 to -0.15)
  if (sy >= -0.55 && sy <= -0.15) {
    const domeY = (sy + 0.15) / -0.4;
    const halfWidth = 0.72 * Math.sqrt(Math.max(0, 1 - domeY * domeY));
    if (Math.abs(sx) <= halfWidth) {
      return [254, 183, 0, 255]; // Golden Amber
    }
  }

  // Cup Rim / Burger Cheese Melt (sy: -0.15 to 0.05)
  if (sy >= -0.15 && sy <= 0.05 && Math.abs(sx) <= 0.76) {
    if (sy >= 0.0 && Math.sin(sx * 9) > 0.25) {
      return [255, 220, 40, 255]; // Cheese drip / cafe froth
    }
    return [255, 195, 0, 255];
  }

  // Roast / Patty layer (sy: 0.05 to 0.22)
  if (sy >= 0.05 && sy <= 0.22 && Math.abs(sx) <= 0.74) {
    return [68, 28, 14, 255]; // Rich Espresso / Patty Roast
  }

  // Fresh herb / mint garnish (sy: 0.22 to 0.28)
  if (sy >= 0.22 && sy <= 0.28 && Math.abs(sx) <= 0.7) {
    return [56, 161, 105, 255]; // Vibrant Green
  }

  // Bottom Base / Saucer (sy: 0.28 to 0.50)
  if (sy >= 0.28 && sy <= 0.50) {
    const bY = (sy - 0.28) / 0.22;
    const halfWidth = 0.70 * (1 - 0.25 * bY * bY);
    if (Math.abs(sx) <= halfWidth) {
      return [254, 183, 0, 255];
    }
  }

  return [bgR, bgG, bgB, 255];
}

console.log('Generating SS Cafe & Restaurant PWA Icons in /public...');

// 192x192 PNG
const png192 = createPng(192, 192, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// 512x512 PNG
const png512 = createPng(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// 512x512 Maskable PNG
const pngMaskable = createPng(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

// Apple Touch Icon 180x180 PNG
const appleTouch = createPng(180, 180, (x, y, w, h) => renderIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

// Favicon 64x64 PNG
const favicon = createPng(64, 64, (x, y, w, h) => renderIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon);

console.log('All SS Cafe & Restaurant PWA Icons generated successfully!');
