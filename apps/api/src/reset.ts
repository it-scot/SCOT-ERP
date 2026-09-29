// ============================================================
// SCoT ERP — Reset Script
// ============================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../../data');
const storeFile = path.join(dataDir, 'store.json');

if (fs.existsSync(storeFile)) {
  fs.unlinkSync(storeFile);
  console.log('🗑️  Data store deleted.');
} else {
  console.log('ℹ️  No data store found.');
}

console.log('Run `npm run seed` to create fresh demo data.');
process.exit(0);
