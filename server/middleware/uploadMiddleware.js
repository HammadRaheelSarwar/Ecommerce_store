import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '..', 'uploads', 'products');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const slugify = (value) =>
  String(value || 'product')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'product';

const parseImageDataUrl = (dataUrl) => {
  const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;

  const mime = match[1];
  const base64 = match[2];
  const extensionMap = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
    'image/svg+xml': '.svg',
  };

  return {
    buffer: Buffer.from(base64, 'base64'),
    ext: extensionMap[mime] || '.jpg',
  };
};

export const saveProductImages = (req, imagePayloads = [], productName = 'product') => {
  if (!imagePayloads.length) return [];

  ensureDir(uploadsRoot);

  const folderName = `${Date.now()}-${slugify(productName)}`;
  const folderPath = path.join(uploadsRoot, folderName);
  ensureDir(folderPath);

  const host = `${req.protocol}://${req.get('host')}`;
  const savedImages = [];

  imagePayloads.forEach((payload, index) => {
    if (typeof payload !== 'string') return;

    if (payload.startsWith('http://') || payload.startsWith('https://')) {
      savedImages.push(payload);
      return;
    }

    const parsed = parseImageDataUrl(payload);
    if (!parsed) return;

    const fileName = `image-${index + 1}-${Date.now()}${parsed.ext}`;
    fs.writeFileSync(path.join(folderPath, fileName), parsed.buffer);
    savedImages.push(`${host}/uploads/products/${folderName}/${fileName}`);
  });

  return savedImages;
};
