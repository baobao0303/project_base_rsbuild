import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.resolve(__dirname, '../apps/mfe-crm/src/app/features/mock-data');

console.log('Generating 100,000 OLAP Transaction & Event Rows (Heavy Data Lake Chunk)...');

const channels = ['E-Commerce', 'Retail POS', 'Mobile App', 'Call Center', 'Partner API', 'Affiliate'];
const categories = ['Electronics', 'Home & Living', 'Fashion', 'Health & Beauty', 'Groceries', 'Automotive', 'Software Subscriptions'];
const paymentMethods = ['Credit Card', 'Bank Transfer', 'E-Wallet', 'COD', 'Buy Now Pay Later', 'Crypto'];
const statuses = ['COMPLETED', 'PENDING', 'CANCELLED', 'REFUNDED', 'DISPUTED'];
const regions = ['North', 'Central', 'South', 'Highlands', 'Mekong Delta'];

const records = [];
for (let i = 1; i <= 25000; i++) {
  const amount = Math.round((50 + (i * 73) % 4500) * 100) / 100;
  const cost = Math.round(amount * 0.65 * 100) / 100;
  const profit = Math.round((amount - cost) * 100) / 100;

  records.push({
    txId: `TX-${String(i).padStart(8, '0')}`,
    customerId: `CUST-${String((i * 17) % 10000 + 1).padStart(6, '0')}`,
    channel: channels[i % channels.length],
    category: categories[i % categories.length],
    amount,
    cost,
    profit,
    payment: paymentMethods[i % paymentMethods.length],
    status: statuses[i % statuses.length],
    region: regions[i % regions.length],
    units: (i % 8) + 1,
    discountRate: ((i % 15) * 2),
    timestamp: new Date(1704067200000 + (i * 3600000 * 4)).toISOString()
  });
}

const outFile = path.join(targetDir, 'olap-datalake-100k.data.ts');
fs.writeFileSync(outFile, `// 25,000 Heavy Enterprise OLAP Data Lake Records for In-Browser SQL Engine\nexport interface OlapRecord {\n  txId: string;\n  customerId: string;\n  channel: string;\n  category: string;\n  amount: number;\n  cost: number;\n  profit: number;\n  payment: string;\n  status: string;\n  region: string;\n  units: number;\n  discountRate: number;\n  timestamp: string;\n}\n\nexport const MOCK_OLAP_RECORDS: OlapRecord[] = ${JSON.stringify(records, null, 2)};\n`);

console.log(`Generated: ${outFile} (${(fs.statSync(outFile).size / 1024 / 1024).toFixed(2)} MB)`);
