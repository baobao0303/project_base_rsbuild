export const meta = {
  name: 'mfe-angular-build',
  description: 'Automated multi-stage workflow to validate, compile, benchmark, and audit Angular 18 Micro-Frontend with Rsbuild',
  phases: [
    { title: 'Pre-flight Validation' },
    { title: 'Parallel Compilation' },
    { title: 'Bundle Sizing Audit' },
    { title: 'Verification Gate' }
  ],
};

// ============================================================================
// Stage 1: Pre-flight Dependency & Configuration Check
// ============================================================================
await phase('Pre-flight Validation', async () => {
  return await agent(
    `Kiểm tra cấu trúc thư mục, file cấu hình module-federation.shared.ts, package.json, và các port (4200, 4204, 4205) của dự án Angular MFE Rsbuild. Đảm bảo rule manifest-first (mf-manifest.json) và assetPrefix auto đã được tuân thủ nghiêm ngặt.`,
    {
      label: 'audit:preflight-check',
      schema: {
        type: 'object',
        properties: {
          isValid: { type: 'boolean' },
          appsFound: { type: 'array', items: { type: 'string' } },
          sharedDepsReady: { type: 'boolean' },
          notes: { type: 'string' }
        },
        required: ['isValid', 'appsFound', 'sharedDepsReady']
      }
    }
  );
});

// ============================================================================
// Stage 2: Parallel Compilation of Host and Remotes
// ============================================================================
await phase('Parallel Compilation', async () => {
  const apps = ['app-shell', 'mfe-crm', 'mfe-cdp'];
  return await parallel(
    apps.map(appName => () =>
      agent(
        `Thực thi biên dịch Rsbuild cho ứng dụng: ${appName}. Đo lường thời gian biên dịch và kiểm tra trạng thái sinh mã của remoteEntry.mjs hoặc index.html.`,
        {
          label: `build:${appName}`,
          schema: {
            type: 'object',
            properties: {
              app: { type: 'string' },
              success: { type: 'boolean' },
              buildDurationSec: { type: 'number' },
              outputDirectory: { type: 'string' }
            },
            required: ['app', 'success', 'buildDurationSec']
          }
        }
      )
    )
  );
});

// ============================================================================
// Stage 3: Bundle Sizing & Chunk Breakdown Audit
// ============================================================================
await phase('Bundle Sizing Audit', async () => {
  return await agent(
    `Chạy script đo kích thước bundle (scripts/bundle-size.mjs). Xác định Raw Size, Gzip Size, số lượng file, và top 5 assets nặng nhất trong dist/apps/.`,
    {
      label: 'audit:bundle-size',
      schema: {
        type: 'object',
        properties: {
          totalRawMb: { type: 'number' },
          totalGzipMb: { type: 'number' },
          totalFilesCount: { type: 'number' },
          isTargetHeavy: { type: 'boolean' },
          heaviestChunk: { type: 'string' }
        },
        required: ['totalRawMb', 'totalGzipMb', 'totalFilesCount', 'isTargetHeavy']
      }
    }
  );
});

// ============================================================================
// Stage 4: Independent Verification Gate (SLPC QC)
// ============================================================================
const verification = await phase('Verification Gate', async () => {
  return await agent(
    `Thực hiện kiểm thử chấp thuận độc lập (Smoke Test): Kiểm tra tính toàn vẹn của HTTP endpoints (/healthz, /, /crm, /cdp), xác nhận không có xung đột singleton của @angular/core trong console, và đảm bảo thời gian build đạt chuẩn SLA (< 30s).`,
    {
      label: 'qc:acceptance-verification',
      schema: {
        type: 'object',
        properties: {
          passed: { type: 'boolean' },
          singletonCheck: { type: 'string', enum: ['PASSED', 'FAILED'] },
          slaCheck: { type: 'string', enum: ['MET', 'EXCEEDED'] },
          finalVerdict: { type: 'string' }
        },
        required: ['passed', 'singletonCheck', 'slaCheck', 'finalVerdict']
      }
    }
  );
});

return {
  status: verification.passed ? 'SUCCESS' : 'FAILED',
  summary: verification.finalVerdict
};
