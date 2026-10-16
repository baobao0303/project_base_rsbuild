---
name: mfe-angular-build
description: "Build, orchestrate, benchmark, and audit Angular 18 Micro-Frontend with Rsbuild & Module Federation 2.0 via multi-agent workflow."
version: 1.0.0
author: Supervisor SLPC
license: MIT
platforms: [linux, macos, windows]
metadata:
  tags: [angular18, rsbuild, micro-frontend, module-federation-v2, benchmark, bundle-audit, workflow]
---

# MFE Angular Build Skill (`mfe-angular-build`)

Kỹ năng điều phối vòng đời build, benchmark tốc độ và audit dung lượng bundle cho hệ thống **Angular 18+ Micro-Frontend** sử dụng engine **Rsbuild (Rspack Rust)** và **Module Federation 2.0**.

---

## 1. When to Use
Kích hoạt skill này khi:
- **Build toàn bộ Workspace**: Cần biên dịch đồng thời Host Shell và các Remote MFEs (CRM, CDP) ở chế độ song song thực sự (`scripts/build-parallel.mjs`).
- **Benchmark Tốc Độ Build**: Cần so sánh chính xác Cold Build, Warm Cache Build và HMR latency giữa Rsbuild và Webpack / Native Angular CLI.
- **Audit Kích Thước Bundle**: Đo đạc Raw Size, Gzip Size, phân tích các chunk nặng (>3MB), và xuất báo cáo tự động cho GitHub Actions (`GITHUB_STEP_SUMMARY`) hoặc Jenkins.
- **Kiểm tra Chuẩn Kiến trúc MF v2**: Rà soát các lỗi kinh điển như cấu hình sai URL manifest (`mf-manifest.json`), thiếu `assetPrefix: 'auto'`, hoặc rò rỉ singleton `@angular/core`.

---

## 2. Quy Trình Vận Hành 4 Giai Đoạn (4-Stage Pipeline)

```text
[Stage 1: Pre-flight Validation]
  • Rà soát module-federation.shared.ts & port mapping (4200, 4204, 4205)
  • Xác nhận cấu hình manifest-first (mf-manifest.json)
         │
         ▼
[Stage 2: Parallel Compilation]
  • Kích hoạt scripts/build-parallel.mjs (Promise.all đa tiến trình)
  • Biên dịch đồng thời: app-shell (Host) + mfe-crm + mfe-cdp (<25s cho gói 51MB)
         │
         ▼
[Stage 3: Bundle Sizing Audit]
  • Chạy scripts/bundle-size.mjs
  • Trích xuất Raw Size, Gzip Transfer Size, Top 5 heaviest chunks
         │
         ▼
[Stage 4: Verification & Smoke Test]
  • Smoke test HTTP endpoints (/healthz, /, /crm, /cdp)
  • Xác nhận không có cảnh báo CORS hoặc duplicate Angular instance
```

---

## 3. Danh Mục Lệnh Thực Thi Nhanh

### A. Khởi chạy toàn bộ hệ thống
```bash
npm run start:all
# Host Shell: http://localhost:4200/
# MFE CRM   : http://localhost:4204/
# MFE CDP   : http://localhost:4205/
```

### B. Biên dịch song song đa luồng (Rsbuild Engine)
```bash
# Biên dịch môi trường Staging
npm run build:staging

# Hoặc chạy trực tiếp script song song
node scripts/build-parallel.mjs
```

### C. Đo kiểm tốc độ Benchmark
```bash
npm run benchmark
```

### D. Kiểm tra và Audit kích thước Bundle
```bash
npm run bundle:size
```

### E. Đóng gói và chạy Docker Container
```bash
npm run docker:build
npm run docker:run
# Kiểm tra: curl http://localhost:4200/healthz
```

---

## 4. Các Quy Chuẩn Bắt Buộc Cần Ghi Nhớ

1. **Manifest-First**: Luôn dùng `mf-manifest.json` trong `remotes: {}` thay vì `remoteEntry.mjs`.
2. **Asset Prefix**: Remote bắt buộc đặt `assetPrefix: 'auto'` trong môi trường staging/production để không bị lỗi 404 hình ảnh/assets khi chạy qua Host.
3. **Singleton Enforcement**: `@angular/*`, `rxjs`, `zone.js` bắt buộc đặt `singleton: true` trong `module-federation.shared.ts`.
