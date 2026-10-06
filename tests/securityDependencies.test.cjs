const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const xcode = require('xcode');
const { getAssetData, getAssetSize } = require('../node_modules/metro/src/Assets.js');

test('patched UUID preserves xcode project identifier generation', () => {
  const project = xcode.project('validation.pbxproj');
  project.hash = { project: { objects: {} } };
  const ids = new Set();
  for (let i = 0; i < 1000; i++) {
    const id = project.generateUuid();
    assert.match(id, /^[0-9A-F]{24}$/);
    assert(!ids.has(id));
    ids.add(id);
  }
});

test('image-size supports Metro byte and file-path image parsing', async () => {
  const root = path.join(__dirname, '../assets');
  const files = fs.readdirSync(root, { recursive: true });
  const images = files.filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(file));
  assert(images.length > 0);
  for (const file of images) {
    const imagePath = path.join(root, file);
    const size = getAssetSize(path.extname(file).slice(1), fs.readFileSync(imagePath), imagePath);
    assert(size.width > 0 && size.height > 0, file);
    const data = await getAssetData(imagePath, file, [], 'android', '/assets');
    assert(data.width > 0 && data.height > 0, file);
  }
});
