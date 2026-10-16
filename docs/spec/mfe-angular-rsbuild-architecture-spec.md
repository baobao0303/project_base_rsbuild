# ĐẶC TẢ KỸ THUẬT: ANGULAR 18+ MICRO-FRONTEND VỚI RSBUILD & MODULE FEDERATION 2.0
## (MFE ANGULAR RSBUILD ARCHITECTURAL & OPERATIONAL SPECIFICATION)

- **Mã tài liệu**: `docs/spec/mfe-angular-rsbuild-architecture-spec.md`
- **Phiên bản**: 3.0.0 (Chuẩn hóa toàn diện Enterprise Toolchain)
- **Tác giả**: Supervisor SLPC / Lead Architect
- **Phân loại**: Core Architecture / Enterprise Build System
- **Công nghệ áp dụng**:
  - Framework: Angular 18+ (Standalone Components, Signals, Router Bridge)
  - Engine: Rsbuild 1.3+ / Rspack (Rust Compiler Core)
  - Kiến trúc Micro-Frontend: Module Federation 2.0 (`@module-federation/rsbuild-plugin`)
  - Runtime Fallback: NGINX 1.27 Alpine Reverse Proxy & Multi-Stage Docker

---

# 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (SYSTEM OVERVIEW)

Hệ thống Micro-Frontend giải quyết triệt để 3 bài toán lớn của các ứng dụng Angular Enterprise nguyên khối:
1. **Thời gian build/serve chậm**: Webpack tốn từ 2 đến 10 phút để compile; Rsbuild + Rspack (Rust) rút ngắn xuống **vài giây** nhờ xử lý đa luồng Rayon.
2. **Xung đột phiên bản & bộ nhớ**: Đảm bảo các thư viện lõi (`@angular/core`, `rxjs`, `zone.js`) chỉ chạy **1 instance duy nhất (Singleton)** giữa Host Shell và tất cả Remote MFEs.
3. **Độc lập triển khai (Independent Deployment)**: Host nạp động Remote qua runtime manifest (`mf-manifest.json`), không cần build lại Host khi Remote deploy phiên bản mới.

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           HOST SHELL (apps/app-shell)                             │
│  • Cổng 4200 (Dev) / Production NGINX Gateway                                      │
│  • Dynamic Manifest Loader: Nạp http://localhost:420x/mf-manifest.json           │
│  • Router Bridge: Ánh xạ route tới exposed module của Remote                       │
│  • Shared Singletons (Eager: true): @angular/core, @angular/router, rxjs, zone.js  │
└─────────────────────────┬─────────────────────────────────┬───────────────────────┘
                          │                                 │
             (/crm/* Dynamic Remote Load)       (/cdp/* Dynamic Remote Load)
                          │                                 │
┌─────────────────────────▼───────────────┐ ┌───────────────▼───────────────────────┐
│       REMOTE 1: CRM (apps/mfe-crm)      │ │       REMOTE 2: CDP (apps/mfe-cdp)    │
│  • Cổng 4204 (Dev)                      │ │  • Cổng 4205 (Dev)                    │
│  • Exposes: './Routes'                  │ │  • Exposes: './Routes'                │
│  • Shared Singletons (Eager: false)     │ │  • Shared Singletons (Eager: false)   │
│  • In-Browser OLAP SQL & Big Data Chunks│ │  • 3D WebGL Digital Twin (Three.js)   │
└─────────────────────────────────────────┘ └───────────────────────────────────────┘
```

---

# 2. QUY CHUẨN CẤU TRÚC THƯ MỤC CHUẨN HOÁ

```text
angular-mfe-rsbuild/
├── apps/
│   ├── app-shell/                                # HOST SHELL
│   │   ├── rsbuild.config.ts                     # Cấu hình Host Rsbuild
│   │   ├── project.json / package.json
│   │   ├── public/assets/manifest/               # Manifest động theo môi trường
│   │   └── src/app/app.routes.ts                 # Router Bridge lazy loading
│   ├── mfe-crm/                                  # REMOTE MFE 1
│   │   ├── rsbuild.config.ts                     # Exposes: ./Routes
│   │   └── src/app/remote-entry/entry.routes.ts  # Exposed Route Entrypoint
│   └── mfe-cdp/                                  # REMOTE MFE 2
│       ├── rsbuild.config.ts
│       └── src/app/remote-entry/entry.routes.ts
├── libs/
│   ├── core/                                     # Base models, EventBus, HTTP Interceptors
│   └── ui-kit/                                   # Standalone UI components, tokens
├── module-federation.shared.ts                   # TRỌNG TÂM: Factory cấu hình tập trung
├── scripts/
│   ├── build-parallel.mjs                        # Script compile song song tất cả apps
│   ├── benchmark.mjs                             # Runner đo đạc tốc độ Cold / Warm build
│   └── bundle-size.mjs                           # Inspector đo đạc kích thước bundle
├── Dockerfile                                    # Multi-stage Dockerfile (Node 20 + Nginx)
├── nginx.conf                                    # Reverse proxy tích hợp CORS MF v2
├── Jenkinsfile                                   # Declarative CI/CD pipeline
└── package.json
```

---

# 3. QUY TẮC CỐT LÕI (CORE RULES & INVARIANTS)

### Rule 1: Manifest-First Resolution (Không trỏ trực tiếp `remoteEntry.mjs`)
Trong Module Federation 2.0, Host Shell khai báo remotes bắt buộc phải trỏ vào tệp **`mf-manifest.json`**.
* ❌ `mfe_crm@http://localhost:4204/remoteEntry.mjs` (Lỗi: `SyntaxError: Unexpected token 'v'`).
* ✅ `mfe_crm@http://localhost:4204/mf-manifest.json` (Chuẩn MF v2 metadata).

### Rule 2: Asset URL Resolution (`assetPrefix: 'auto'`)
* Trong môi trường Development: Host dùng `/`, Remote dùng `http://localhost:${port}/`.
* Trong môi trường Staging/Production: Tất cả Remote bắt buộc dùng **`assetPrefix: 'auto'`** để trình duyệt tự động nạp assets (ảnh SVG, font, lazy chunks) theo đúng URL nguồn của Remote, tránh lỗi 404 khi chạy lồng trong Host Shell.

### Rule 3: Eager Singletons Phân Tầng
* **Host Shell**: Khai báo `eager: true` cho `@angular/*`, `rxjs`, `zone.js` để nạp sẵn trong initial chunk.
* **Remote MFEs**: Khai báo `eager: false` để giảm thiểu kích thước file `remoteEntry.mjs` (chỉ còn < 85KB).

---

# 4. KỊCH BẢN BENCHMARK VÀ CHỈ SỐ CAM KẾT (SLO/SLA)

| Tiêu chí | Angular CLI (Webpack) | Rsbuild + Rspack (Rust) | Cam kết SLA |
| :--- | :---: | :---: | :---: |
| **Cold Build (3 apps song song)** | 85.4 s | **23.36 s** | < 30 s |
| **Warm Build (Có Cache)** | 24.2 s | **0.90 s** | < 2 s |
| **HMR Rebuild (Hot Reload)** | 650 ms - 3200 ms | **< 100 ms** | < 150 ms |
| **Thời gian CI/CD Pipeline Docker** | 2m 30s | **39 s** | < 60 s |
| **Bộ nhớ RAM tiêu thụ khi compile** | 1.8 GB - 2.4 GB | **650 MB** | Tiết kiệm > 60% RAM |
