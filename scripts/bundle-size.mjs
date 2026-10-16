import * as fs from 'node:fs';
import * as path from 'node:path';
import * as zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distAppsDir = path.resolve(__dirname, '../dist/apps');
const distRootDir = path.resolve(__dirname, '../dist');

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function scanDirectory(dirPath, appName, excludeSubdirs = []) {
  if (!fs.existsSync(dirPath)) return null;

  let totalRaw = 0;
  let totalGzip = 0;
  let fileCount = 0;
  const breakdown = { js: 0, css: 0, html: 0, json: 0, other: 0 };
  const allFiles = [];

  function walk(currentDir) {
    for (const item of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (item.isDirectory() && excludeSubdirs.includes(item.name)) {
        continue;
      }
      const full = path.join(currentDir, item.name);
      if (item.isDirectory()) {
        walk(full);
      } else {
        const buf = fs.readFileSync(full);
        const raw = buf.length;
        const gzipped = zlib.gzipSync(buf).length;
        const ext = path.extname(item.name).toLowerCase().replace('.', '');
        const rel = path.relative(dirPath, full);

        totalRaw += raw;
        totalGzip += gzipped;
        fileCount++;

        if (breakdown[ext] !== undefined) {
          breakdown[ext] += raw;
        } else {
          breakdown.other += raw;
        }

        allFiles.push({ name: rel, raw, gzipped, ext });
      }
    }
  }

  walk(dirPath);
  allFiles.sort((a, b) => b.raw - a.raw);

  return {
    appName,
    totalRaw,
    totalGzip,
    fileCount,
    breakdown,
    topFiles: allFiles.slice(0, 5)
  };
}

let results = [];

// Case 1: Traditional dist/apps layout
if (fs.existsSync(distAppsDir)) {
  results = ['app-shell', 'mfe-crm', 'mfe-cdp']
    .map(name => scanDirectory(path.join(distAppsDir, name), name))
    .filter(Boolean);
} else if (fs.existsSync(distRootDir)) {
  // Case 2: Unified Docker NGINX layout (dist/ contains app-shell, with dist/crm and dist/cdp)
  const shell = scanDirectory(distRootDir, 'app-shell', ['crm', 'cdp']);
  const crm = scanDirectory(path.join(distRootDir, 'crm'), 'mfe-crm');
  const cdp = scanDirectory(path.join(distRootDir, 'cdp'), 'mfe-cdp');
  results = [shell, crm, cdp].filter(Boolean);
} else {
  console.error('❌ Neither dist/apps nor dist/ found. Please build first.');
  process.exit(1);
}

let grandTotalRaw = 0;
let grandTotalGzip = 0;
let grandTotalFiles = 0;

results.forEach(r => {
  grandTotalRaw += r.totalRaw;
  grandTotalGzip += r.totalGzip;
  grandTotalFiles += r.fileCount;
});

console.log('\n===================================================================');
console.log('📦 RSBUILD ENTERPRISE BUNDLE SIZE INSPECTOR & AUDITOR');
console.log('===================================================================\n');

console.table(results.map(r => ({
  'Application': r.appName,
  'Raw Size': formatSize(r.totalRaw),
  'Gzip Size': formatSize(r.totalGzip),
  'Files Count': r.fileCount,
  'JS Chunks': formatSize(r.breakdown.js),
  'CSS': formatSize(r.breakdown.css),
  'Status': r.totalRaw > 3 * 1024 * 1024 ? '🚨 Heavy Bundle (>3MB)' : '✅ Standard'
})));

console.log(`\n🎯 TOTAL WORKSPACE BUNDLE: ${formatSize(grandTotalRaw)} (Gzip: ${formatSize(grandTotalGzip)}) across ${grandTotalFiles} files`);

console.log('\n🔥 TOP 5 HEAVIEST ASSETS IN THE BUNDLE:');
const topAll = results.flatMap(r => r.topFiles.map(f => ({ ...f, app: r.appName })))
  .sort((a, b) => b.raw - a.raw)
  .slice(0, 5);

console.table(topAll.map((f, i) => ({
  '#': i + 1,
  'App': f.app,
  'Filename': f.name,
  'Raw Size': formatSize(f.raw),
  'Gzip Size': formatSize(f.gzipped)
})));

// Generate Markdown for GitHub Step Summary if running in CI
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath) {
  let md = `## 📦 Micro-Frontend Bundle Size Report\n\n`;
  md += `| Application | Raw Bundle Size | Gzip Transfer Size | Total Files | Classification |\n`;
  md += `| :--- | :---: | :---: | :---: | :---: |\n`;
  results.forEach(r => {
    const badge = r.totalRaw > 3 * 1024 * 1024 ? '🔥 **Heavy Enterprise (>3MB)**' : '⚡ **Optimal Lightweight**';
    md += `| **${r.appName}** | \`${formatSize(r.totalRaw)}\` | \`${formatSize(r.totalGzip)}\` | ${r.fileCount} | ${badge} |\n`;
  });
  md += `| **TOTAL WORKSPACE** | **\`${formatSize(grandTotalRaw)}\`** | **\`${formatSize(grandTotalGzip)}\`** | **${grandTotalFiles}** | 🏆 **Rsbuild Target** |\n\n`;

  md += `### 🔍 Top Heaviest Assets in Build Output\n\n`;
  md += `| # | App | File Path | Raw Size | Gzip Size |\n`;
  md += `| :-: | :--- | :--- | :---: | :---: |\n`;
  topAll.forEach((f, i) => {
    md += `| ${i + 1} | \`${f.app}\` | \`${f.name}\` | **${formatSize(f.raw)}** | ${formatSize(f.gzipped)} |\n`;
  });

  fs.appendFileSync(summaryPath, md);
  console.log(`\n✓ Written bundle size report to GITHUB_STEP_SUMMARY`);
}

// Write JSON artifact
const reportFile = path.resolve(__dirname, '../dist/bundle-size-report.json');
fs.writeFileSync(reportFile, JSON.stringify({
  generatedAt: new Date().toISOString(),
  grandTotalRaw,
  grandTotalGzip,
  grandTotalFiles,
  results
}, null, 2));
console.log(`✓ Saved JSON report to: ${reportFile}\n`);
