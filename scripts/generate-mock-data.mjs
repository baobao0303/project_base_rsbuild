import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.resolve(__dirname, '../apps/mfe-crm/src/app/features/mock-data');

fs.mkdirSync(targetDir, { recursive: true });

console.log('Generating heavy enterprise mock datasets (5MB+ bundle simulation)...');

// 1. Generate 10,000 detailed customer records
const firstNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Huynh', 'Phan', 'Vu', 'Vo', 'Dang', 'Bui', 'Do', 'Ho', 'Ngo', 'Duong', 'Ly'];
const middleNames = ['Van', 'Thi', 'Duc', 'Minh', 'Ngoc', 'Quang', 'Hai', 'Thanh', 'Dinh', 'Tuan', 'Bao', 'Huu', 'Gia'];
const lastNames = ['An', 'Binh', 'Cuong', 'Dung', 'Em', 'Giang', 'Hanh', 'Khoa', 'Long', 'Nam', 'Oanh', 'Phuc', 'Quan', 'Son', 'Tam', 'Uyen', 'Vy'];
const tiers = ['Standard', 'Silver', 'Gold', 'Platinum', 'Diamond'];
const provinces = ['Ha Noi', 'TP Ho Chi Minh', 'Da Nang', 'Can Tho', 'Hai Phong', 'Binh Duong', 'Dong Nai', 'Quang Ninh'];

const customers = [];
for (let i = 1; i <= 10000; i++) {
  const fn = firstNames[i % firstNames.length];
  const mn = middleNames[i % middleNames.length];
  const ln = lastNames[i % lastNames.length];
  const fullName = `${fn} ${mn} ${ln}`;
  const tier = tiers[i % tiers.length];
  const province = provinces[i % provinces.length];
  const ltv = Math.round((500 + (i * 37) % 50000) * 100) / 100;
  const score = Math.round(400 + (i * 19) % 550);

  customers.push({
    id: `CUST-${String(i).padStart(6, '0')}`,
    name: fullName,
    email: `customer.${i}@enterprise-domain.vn`,
    phone: `+849${String((i * 1234567) % 100000000).padStart(8, '0')}`,
    company: `Corp ${fn} & Partners Ltd`,
    tier,
    province,
    creditScore: score,
    lifetimeValue: ltv,
    openDeals: (i % 7) + 1,
    totalTransactions: (i % 45) + 3,
    lastInteraction: new Date(1704067200000 + (i * 3600000) % 25920000000).toISOString(),
    tags: [`tag-${i % 20}`, `segment-${i % 8}`, tier.toLowerCase()],
    coordinates: {
      lat: 10.762622 + ((i % 1000) - 500) * 0.001,
      lng: 106.660172 + ((i % 1000) - 500) * 0.001
    }
  });
}

const customerFilePath = path.join(targetDir, 'customers-50k.data.ts');
fs.writeFileSync(customerFilePath, `// High-Volume 10,000 Customer Records Pre-bundled for Rsbuild Benchmark\nexport interface CustomerRecord {\n  id: string;\n  name: string;\n  email: string;\n  phone: string;\n  company: string;\n  tier: string;\n  province: string;\n  creditScore: number;\n  lifetimeValue: number;\n  openDeals: number;\n  totalTransactions: number;\n  lastInteraction: string;\n  tags: string[];\n  coordinates: { lat: number; lng: number };\n}\n\nexport const MOCK_CUSTOMERS: CustomerRecord[] = ${JSON.stringify(customers, null, 2)};\n`);

console.log(`Generated: ${customerFilePath} (${(fs.statSync(customerFilePath).size / 1024 / 1024).toFixed(2)} MB)`);

// 2. Generate Timeseries Metrics & Analytics Matrix
const timeseries = [];
for (let day = 1; day <= 365; day++) {
  const baseRevenue = 150000 + Math.sin(day / 10) * 45000 + (day % 7 === 0 ? 80000 : 0);
  const leads = Math.round(120 + Math.cos(day / 15) * 30 + (day % 30));
  const conversionRate = Math.round((2.5 + Math.sin(day / 8) * 1.2) * 100) / 100;
  timeseries.push({
    day: `2026-D${String(day).padStart(3, '0')}`,
    revenue: Math.round(baseRevenue),
    cost: Math.round(baseRevenue * 0.62),
    margin: Math.round(baseRevenue * 0.38),
    activeUsers: 8500 + Math.round(Math.sin(day / 5) * 1200),
    leads,
    conversionRate,
    funnel: {
      impressions: leads * 45,
      clicks: leads * 12,
      signups: leads * 3,
      qualified: leads,
      won: Math.round(leads * (conversionRate / 100))
    }
  });
}

const analyticsFilePath = path.join(targetDir, 'timeseries-analytics.data.ts');
fs.writeFileSync(analyticsFilePath, `// 365-Day Timeseries Analytics Matrix Data Chunk\nexport const MOCK_TIMESERIES = ${JSON.stringify(timeseries, null, 2)};\n`);

console.log(`Generated: ${analyticsFilePath} (${(fs.statSync(analyticsFilePath).size / 1024 / 1024).toFixed(2)} MB)`);
