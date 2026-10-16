import { spawn } from 'node:child_process';

console.log('⚡ Running Rsbuild PARALLEL multi-app compilation (3 projects simultaneously)...');

const apps = [
  { name: 'app-shell', config: 'apps/app-shell/rsbuild.config.ts' },
  { name: 'mfe-crm', config: 'apps/mfe-crm/rsbuild.config.ts' },
  { name: 'mfe-cdp', config: 'apps/mfe-cdp/rsbuild.config.ts' },
];

function runBuild(app) {
  return new Promise((resolve, reject) => {
    const p = spawn('npx', ['rsbuild', 'build', '--config', app.config], {
      stdio: 'inherit',
      env: process.env
    });
    p.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${app.name} failed with code ${code}`));
    });
  });
}

const start = performance.now();
await Promise.all(apps.map(runBuild));
const duration = ((performance.now() - start) / 1000).toFixed(2);
console.log(`\n🎉 All 3 Rsbuild Micro-Frontends compiled in PARALLEL in ${duration}s!`);
