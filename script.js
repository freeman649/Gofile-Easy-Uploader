const fs = require('fs');
const path = require('path');
const { Blob } = require('buffer');
const clipboardy = require('clipboardy');
const notifier = require('node-notifier');

const AUTHORIZATION_TOKEN = process.env.GOFILE_TOKEN || 'W8sh6pYR3DLob2IuF7SFA1ZB0BrEDzM9';
const API_BASE = 'https://api.gofile.io';
const TIMEOUT_MS = 30_000;

async function getServer() {
  try {
    const res = await fetch(`${API_BASE}/servers`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (data.status !== 'ok') throw new Error('Gofile server error');

    const server = data.data.servers[0]?.name;
    if (!server) throw new Error('No server available');

    return server;
  } catch (error) {
    throw new Error(`Failed to get server: ${error.message}`);
  }
}

async function uploadFile(filePath, server) {
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);
  const fileName = path.basename(filePath);

  const formData = new FormData();
  formData.append('file', blob, fileName);

  try {
    const res = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${AUTHORIZATION_TOKEN}` },
      body: formData,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || 'Upload failed');

    return data.data.downloadPage;
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

async function copyToClipboard(text) {
  try {
    await clipboardy.write(text);
  } catch {
    console.warn('Clipboard unavailable, but link was uploaded');
  }
}

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node script.js <file-path>');
    process.exit(1);
  }

  try {
    await fs.promises.access(filePath);
  } catch {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  // Avertissement si le fichier est très volumineux (> 500 Mo)
  const { size } = fs.statSync(filePath);
  if (size > 500 * 1024 * 1024) {
    console.warn(`⚠ Warning: file is ${(size / 1024 / 1024).toFixed(0)} MB — this may use a lot of memory`);
  }

  try {
    console.log(`Uploading: ${filePath}`);
    const server = await getServer();
    const downloadLink = await uploadFile(filePath, server);

    await copyToClipboard(downloadLink);

    console.log(`✓ Done: ${downloadLink}`);
    notifier.notify({
      title: 'Upload Complete',
      message: 'Link copied to clipboard',
      sound: true,
    });
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    notifier.notify({
      title: 'Upload Failed',
      message: error.message,
    });
    process.exit(1);
  }
}

main();