# ĐẶC TẢ HƯỚNG DẪN THIẾT LẬP, KIỂM TRA & VIẾT MÃ NGUỒN CHO ANGULAR MICRO-FRONTEND RSBUILD
## (SETUP, CODE AUTHORING & QUALITY CHECKLIST SPECIFICATION)

- **Mã tài liệu**: `docs/spec/rsbuild-angular-setup-checklist-spec.md`
- **Phiên bản**: 1.0.0
- **Đối tượng áp dụng**: Lead Dev, Peer Dev, QC Tester, DevOps Engineer
- **Mục tiêu**: Hướng dẫn chi tiết từng bước (Step-by-step): Thiết lập những gì, Viết những gì vào từng file, và Danh mục Checklist bắt buộc phải kiểm tra trước khi bàn giao.

---

# PHẦN 1: THIẾT LẬP NHỮNG GÌ? (WHAT TO SETUP)

### 1.1 Khởi tạo cấu trúc thư mục chuẩn
Mỗi dự án Micro-Frontend bắt buộc phải có cấu trúc cây thư mục phân tầng rõ ràng giữa Host Shell và các Remote MFEs:

```text
my-mfe-workspace/
├── apps/
│   ├── app-shell/                     # HOST SHELL (Cổng 4200)
│   │   ├── rsbuild.config.ts
│   │   ├── project.json
│   │   ├── public/assets/manifest/
│   │   │   ├── development/module-federation.manifest.json
│   │   │   └── staging/module-federation.manifest.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── index.html
│   │       └── app/
│   │           ├── app.config.ts
│   │           ├── app.component.ts
│   │           └── app.routes.ts      # [Router Bridge nạp Remote]
│   └── mfe-<tên-remote>/              # REMOTE MFE (Cổng 4204+)
│       ├── rsbuild.config.ts          # [Exposes: ./Routes]
│       ├── project.json
│       └── src/
│           ├── main.ts                # Bootstrap chạy độc lập
│           └── app/
│               ├── app.component.ts
│               └── remote-entry/
│                   └── entry.routes.ts # [Xuất khẩu Route cho Host]
├── libs/                              # THƯ VIỆN DÙNG CHUNG
│   ├── core/                          # EventBus, Base Models, Interceptors
│   └── ui-kit/                        # UI Components, Design Tokens
├── module-federation.shared.ts        # [Trọng tâm: Cấu hình tập trung]
├── scripts/
│   ├── build-parallel.mjs             # Script build song song
│   └── bundle-size.mjs                # Script đo đạc kích thước
├── .npmrc                             # [legacy-peer-deps=true]
├── Dockerfile                         # Multi-stage Docker
├── nginx.conf                         # Reverse proxy + CORS headers
└── package.json
```

### 1.2 Cài đặt các gói thư viện bắt buộc (`package.json`)
```bash
# 1. Thư viện cốt lõi của Rsbuild & Module Federation
npm install -D @rsbuild/core @ng-rsbuild/plugin-angular @module-federation/rsbuild-plugin @module-federation/enhanced @rsbuild/plugin-sass sass concurrently --legacy-peer-deps

# 2. Thư viện Runtime của Angular 18
npm install @angular/core @angular/common @angular/router @angular/platform-browser rxjs zone.js --legacy-peer-deps
```

### 1.3 Tạo file `.npmrc` để tránh lỗi xung đột peer dependency
Tạo file `.npmrc` tại thư mục gốc với nội dung duy nhất:
```ini
legacy-peer-deps=true
```

---

# PHẦN 2: VIẾT NHỮNG GÌ VÀO TỪNG FILE? (WHAT TO WRITE)

### 2.1 File Cốt Lõi: `module-federation.shared.ts`
Đây là tệp hạt nhân chứa toàn bộ logic cấu hình đóng gói cho cả Host và tất cả Remotes:

* **Đoạn 1: Danh mục Singleton Shared Dependencies**
  ```typescript
  export function getSharedDependencies(isHost = false) {
    const eager = isHost; // Host nạp sẵn, Remote lazy load
    return {
      '@angular/core': { singleton: true, strictVersion: false, eager, requiredVersion: false },
      '@angular/common': { singleton: true, strictVersion: false, eager, requiredVersion: false },
      '@angular/common/http': { singleton: true, strictVersion: false, eager, requiredVersion: false },
      '@angular/router': { singleton: true, strictVersion: false, eager, requiredVersion: false },
      '@angular/platform-browser': { singleton: true, strictVersion: false, eager, requiredVersion: false },
      '@angular/forms': { singleton: true, strictVersion: false, eager, requiredVersion: false },
      '@angular/cdk': { singleton: true, strictVersion: false, eager, requiredVersion: false },
      'rxjs': { singleton: true, strictVersion: false, eager, requiredVersion: false },
      'zone.js': { singleton: true, strictVersion: false, eager, requiredVersion: false },
    };
  }
  ```

* **Đoạn 2: Hàm Generator tạo cấu hình `createFederatedConfig`**
  ```typescript
  export async function createFederatedConfig(options: RsbuildOptions) {
    const {
      appName,
      isHost = false,
      appDir = `apps/${appName}`,
      port = isHost ? 4200 : 4204,
      env = (options.env || process.env['APP_ENV'] || 'development'),
      remotes = {},
      exposes,
    } = options;

    const uniqueName = appName.replace(/-/g, '_');
    // BẮT BUỘC: Remote phải dùng 'auto' ở Staging/Production để không bị lỗi 404 assets
    const assetPrefix = env === 'development' ? (isHost ? '/' : `http://localhost:${port}/`) : (isHost ? '/' : 'auto');

    return await createConfig({
      options: {
        browser: `./${appDir}/src/main.ts`,
        index: `./${appDir}/src/index.html`,
        tsConfig: `./${appDir}/tsconfig.app.json`,
        outputPath: { base: `dist/${appDir}`, browser: `dist/${appDir}` },
        styles: [`./${appDir}/src/styles.scss`],
        polyfills: ['zone.js'],
        skipTypeChecking: env === 'development', // Bật compile siêu tốc ở dev mode
        deleteOutputPath: true,
        devServer: { port },
      },
      rsbuildConfigOverrides: {
        server: {
          port,
          host: '0.0.0.0',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        },
        output: { assetPrefix, distPath: { root: `dist/${appDir}` }, cleanDistPath: true },
        tools: { rspack: { output: { uniqueName } } },
        plugins: [
          pluginModuleFederation({
            name: uniqueName,
            dts: false,
            shared: getSharedDependencies(isHost),
            ...(isHost
              ? { remotes }
              : {
                  filename: 'remoteEntry.mjs',
                  exposes: exposes ?? {
                    './Routes': `./${appDir}/src/app/remote-entry/entry.routes.ts`,
                  },
                }),
          }),
        ],
      },
    });
  }
  ```

---

### 2.2 File Cấu Hình Từng App Con: `apps/<tên-app>/rsbuild.config.ts`

* **Đối với Host Shell (`apps/app-shell/rsbuild.config.ts`)**:
  ```typescript
  import { createFederatedConfig } from '../../module-federation.shared';

  export default async () => {
    const env = process.env['APP_ENV'] || 'development';
    const isDev = env === 'development';

    return await createFederatedConfig({
      appName: 'app-shell',
      isHost: true,
      port: 4200,
      remotes: {
        // BẮT BUỘC: Trỏ vào mf-manifest.json, KHÔNG trỏ remoteEntry.mjs
        'mfe_crm': isDev ? 'mfe_crm@http://localhost:4204/mf-manifest.json' : 'mfe_crm@/crm/mf-manifest.json',
      },
    });
  };
  ```

* **Đối với Remote MFE (`apps/mfe-crm/rsbuild.config.ts`)**:
  ```typescript
  import { createFederatedConfig } from '../../module-federation.shared';

  export default async () => {
    return await createFederatedConfig({
      appName: 'mfe-crm',
      isHost: false,
      port: 4204,
      exposes: {
        './Routes': './apps/mfe-crm/src/app/remote-entry/entry.routes.ts',
      },
    });
  };
  ```

---

### 2.3 Router Bridge Nạp Động: `apps/app-shell/src/app/app.routes.ts`
Sử dụng `loadRemote` của `@module-federation/enhanced/runtime` để lazy load remote component:

```typescript
import { Routes } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'crm',
  },
  {
    path: 'crm',
    loadChildren: () =>
      loadRemote<any>('mfe_crm/Routes').then((m) => m.routes),
  },
];
```

---

### 2.4 File Cấu Hình NGINX: `nginx.conf`
Phục vụ Host Shell và tất cả Remotes trên một cổng duy nhất, bảo đảm CORS:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # CORS Headers bắt buộc cho Module Federation
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, HEAD' always;
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

    # Endpoint kiểm tra sức khỏe
    location = /healthz {
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # Phân luồng Remote MFE CRM
    location /crm/ {
        alias /usr/share/nginx/html/crm/;
        try_files $uri $uri/ /crm/index.html;

        # Không cache manifest và remote entry
        location ~* (mf-manifest\.json|remoteEntry\.mjs)$ {
            add_header Cache-Control "no-cache, no-store, must-revalidate" always;
            add_header Access-Control-Allow-Origin * always;
        }
    }

    # Phân luồng Host Shell (Root SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

# PHẦN 3: CHECKLIST KIỂM TRA TRƯỚC KHI BÀN GIAO (WHAT TO CHECK)

| STT | Hạng Mục Kiểm Tra | Điều Kiện Đạt Chuẩn (Acceptance Criteria) | Lệnh / Cách Kiểm Tra |
| :-: | :--- | :--- | :--- |
| **1** | **Chạy độc lập từng Remote** | Từng Remote tự chạy được trên cổng của mình mà không cần Host Shell. | `npm run start:crm` ➔ Mở `http://localhost:4204/` xem UI hiển thị bình thường. |
| **2** | **Chạy tích hợp trên Host Shell** | Host Shell tại cổng 4200 tải được component của Remote khi bấm vào menu chuyển tab. | `npm run start:all` ➔ Mở `http://localhost:4200/crm` kiểm tra nội dung hiển thị. |
| **3** | **Kiểm tra Định dạng Manifest URL** | Khai báo trong `remotes` phải kết thúc bằng `mf-manifest.json`. | Mở `apps/app-shell/rsbuild.config.ts`, xác nhận không còn chữ `remoteEntry.mjs`. |
| **4** | **Kiểm tra Lỗi Trùng lặp Singleton** | Không xuất hiện 2 phiên bản `@angular/core` hoặc lỗi injector crash trên Console. | Mở DevTools Console, gõ: `ng.version` và kiểm tra tab Network không nạp 2 lần angular chunk. |
| **5** | **Kiểm tra Lỗi CORS & Assets 404** | Toàn bộ font, icon SVG, hình ảnh của Remote nạp qua Host không bị lỗi đỏ 404. | Mở tab Network trên Host (4200), lọc `status-code:404` ➔ Kết quả phải bằng 0. |
| **6** | **Kiểm tra Tốc độ Biên dịch Song song** | Lệnh build chạy song song (Parallel) tất cả app, thời gian hoàn thành dưới 30 giây. | Chạy `node scripts/build-parallel.mjs` ➔ Xem tổng thời gian in ra ở cuối. |
| **7** | **Kiểm tra Đo lường Dung lượng Bundle** | Script phân tích bóc tách chính xác Raw Size, Gzip Size và Chunk nặng nhất. | Chạy `npm run bundle:size` ➔ Xem bảng kết quả in ra terminal. |
| **8** | **Kiểm tra Đóng gói Docker Local** | Docker build thành công và container vượt qua kiểm tra `/healthz`. | `docker build -t test-app . && docker run -d -p 4299:80 test-app && curl http://localhost:4299/healthz` ➔ Trả về `OK`. |
| **9** | **Kiểm tra File .dockerignore** | Không sao chép nhầm `node_modules` hay `dist` vào build context. | Chạy `docker build` ➔ dung lượng transferring context phải `< 100KB`. |
| **10**| **Kiểm tra Trạng thái Git & CI/CD** | Git repo sạch, không chứa file rác, GitHub Actions chạy xanh 100%. | Chạy `git status` ➔ `working tree clean`. |
