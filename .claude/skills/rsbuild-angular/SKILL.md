---
name: rsbuild-angular
description: "Rsbuild + Angular 18+ Enterprise Micro-Frontend Skill: Rspack Rust compiler, Module Federation 2.0, shared singletons, high-speed build benchmarks, and Docker/Jenkins CI/CD."
version: 1.0.0
author: BaoLTB, Supervisor SLPC
license: MIT
platforms: [linux, macos, windows]
metadata:
  tags: [rsbuild, rspack, angular18, micro-frontend, module-federation-v2, benchmark, docker, jenkins]
---

# Rsbuild Angular Micro-Frontend Skill (`rsbuild-angular`)

Kỹ năng chuyên sâu về thiết kế, cấu hình, tối ưu hóa hiệu năng biên dịch và vận hành kiến trúc **Angular 18+ Micro-Frontend** sử dụng engine **Rsbuild (Rspack Core viết bằng Rust)** kết hợp **Module Federation 2.0**.

---

## 1. When to Use
Kích hoạt skill này khi:
- **Khởi tạo hoặc migrate dự án Angular**: Chuyển đổi từ Webpack / Angular CLI sang Rsbuild để tăng tốc độ build từ 10x đến 25x.
- **Cấu hình Module Federation 2.0**: Thiết lập Host Shell nạp động các Remote MFEs qua `mf-manifest.json` và chia sẻ singleton `@angular/*`, `rxjs`, `zone.js`.
- **Đo kiểm Benchmark hiệu năng**: Chạy kịch bản so sánh Cold Build, Warm Cache Build, HMR latency, và dung lượng bundle với `@rsdoctor/rspack-plugin`.
- **Đóng gói Docker & CI/CD**: Cấu hình Docker multi-stage (Node 20 Alpine + Nginx Alpine), Jenkinsfile tham số hóa `APP_ENV=staging`, và GitHub Actions publish image lên GHCR.

---

## 2. Kiến Trúc Cốt Lõi (Core Architecture)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HOST SHELL (apps/app-shell)                           │
│  • Cổng 4200 (Dev) / Production NGINX Gateway                               │
│  • Dynamic Manifest Loader: nạp mf-manifest.json từ các Remotes            │
│  • Shared Singletons (Eager: true): @angular/core, @angular/router, rxjs    │
└───────────────────────┬─────────────────────────────┬───────────────────────┘
                        │                             │
       (Dynamic Remote Load: /crm/*)        (Dynamic Remote Load: /cdp/*)
                        │                             │
┌───────────────────────▼─────────────┐ ┌─────────────▼───────────────────────┐
│     REMOTE MFE: CRM (apps/mfe-crm)  │ │     REMOTE MFE: CDP (apps/mfe-cdp)  │
│  • Cổng 4204 (Dev)                  │ │  • Cổng 4205 (Dev)                  │
│  • Exposes:                         │ │  • Exposes:                         │
│    './Routes' -> entry.routes.ts    │ │    './Routes' -> entry.routes.ts    │
│  • Shared Singletons (Eager: false) │ │  • Shared Singletons (Eager: false) │
└─────────────────────────────────────┘ └─────────────────────────────────────┘
```

---

## 3. Quy Tắc Shared Dependencies (Singleton Rules)

Hạt nhân quản lý trong `module-federation.shared.ts`:

```typescript
export function getSharedDependencies(isHost = false): Record<string, SharedDependencyConfig> {
  const eager = isHost; // Eager: true với Host, false với Remotes

  return {
    // 1. Framework Singletons (Bắt buộc singleton: true để không crash injector)
    '@angular/core': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/common': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/common/http': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/router': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/platform-browser': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/platform-browser/animations': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/animations': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/forms': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    '@angular/cdk': { singleton: true, strictVersion: false, eager, requiredVersion: false },

    // 2. Reactive Singletons
    'rxjs': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    'rxjs/operators': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    'zone.js': { singleton: true, strictVersion: false, eager, requiredVersion: false },
  };
}
```

---

## 4. Các Công Thức Thực Chiến (Cookbook Recipes)

### Recipe A: Cấu hình Host nạp Remote Module
Trong Module Federation 2.0, Host khai báo `remotes` trỏ tới **`mf-manifest.json`** (KHÔNG trỏ trực tiếp `remoteEntry.mjs` vì parser cần metadata JSON):
```typescript
remotes: {
  'mfe_crm': isDev ? 'mfe_crm@http://localhost:4204/mf-manifest.json' : 'mfe_crm@/crm/mf-manifest.json',
  'mfe_cdp': isDev ? 'mfe_cdp@http://localhost:4205/mf-manifest.json' : 'mfe_cdp@/cdp/mf-manifest.json',
}
```

Routing nạp động tại Host (`apps/app-shell/src/app/app.routes.ts`):
```typescript
import { Routes } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';

export const routes: Routes = [
  {
    path: 'crm',
    loadChildren: () => loadRemote<any>('mfe_crm/Routes').then(m => m.routes),
  },
  {
    path: 'cdp',
    loadChildren: () => loadRemote<any>('mfe_cdp/Routes').then(m => m.routes),
  }
];
```

### Recipe B: Cấu hình Remote Expose
Tại Remote MFE (`apps/mfe-crm/rsbuild.config.ts`):
```typescript
export default createFederatedConfig({
  appName: 'mfe-crm',
  isHost: false,
  port: 4204,
  exposes: {
    './Routes': './apps/mfe-crm/src/app/remote-entry/entry.routes.ts',
  },
});
```

### Recipe C: NGINX Reverse Proxy & CORS cho Module Federation
File `nginx.conf` bắt buộc cấu hình CORS headers và tắt cache manifest:
```nginx
# CORS bắt buộc cho Micro-Frontend
add_header Access-Control-Allow-Origin * always;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, HEAD' always;
add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

# Không cache manifest và remoteEntry
location ~* (mf-manifest\.json|remoteEntry\.mjs)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    add_header Access-Control-Allow-Origin * always;
}
```

---

## 5. Danh Mục Lệnh CLI Nhanh

```bash
# 1. Khởi chạy toàn bộ hệ thống (Host + CRM + CDP đồng thời)
npm run start:all

# 2. Chạy riêng từng service độc lập
npm run start:shell  # Cổng 4200
npm run start:crm    # Cổng 4204
npm run start:cdp    # Cổng 4205

# 3. Đo tốc độ biên dịch Benchmark tự động
npm run benchmark

# 4. Kiểm tra kích thước và phân rã các chunk nặng (>3MB)
npm run bundle:size

# 5. Build Staging Docker Image
npm run docker:build
npm run docker:run
```

---

## 6. Các Lỗi Phổ Biến & Cách Khắc Phục (Troubleshooting)

| Lỗi Gặp Phải | Nguyên Nhân | Cách Xử Lý |
| :--- | :--- | :--- |
| `SyntaxError: Unexpected token 'v', "var mfe_crm"... is not valid JSON` | Remotes trỏ vào `remoteEntry.mjs` thay vì `mf-manifest.json` trong MF v2. | Sửa URL remote thành: `http://localhost:4204/mf-manifest.json`. |
| `npm error ERESOLVE unable to resolve dependency tree` | `@ng-rsbuild/plugin-angular@21` yêu cầu Angular 19+ trong khi dự án dùng Angular 18. | Thêm file `.npmrc` với `legacy-peer-deps=true` hoặc chạy `npm i --legacy-peer-deps`. |
| `sh: 1: rsbuild: not found` trong CI runner | Runner thiếu binary hoặc lockfile chứa đường dẫn local symlink. | Chuyển sang build trực tiếp qua Docker (`Dockerfile`), hoặc dùng `npx rsbuild`. |
| Trùng lặp instance `@angular/core` | Thuộc tính `singleton` bị `false` ở một trong các remote. | Luôn kế thừa danh mục cấu hình qua `getSharedDependencies()` trong `module-federation.shared.ts`. |
| Assets (SVG, ảnh, font) của remote bị lỗi 404 trên Host | Thuộc tính `assetPrefix` bị hardcode `/`. | Đặt `assetPrefix: 'auto'` đối với tất cả Remote MFEs trong môi trường staging/production. |
