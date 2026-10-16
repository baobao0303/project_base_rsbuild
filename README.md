# project_base_rsbuild

> **Angular 18 Enterprise Micro-Frontend Architecture with Rsbuild (Rspack Rust Core) & Module Federation 2.0**

A production-ready enterprise Micro-Frontend workspace demonstrating lightning-fast compilation speeds, large bundle handling (>17MB), dynamic Module Federation, and sub-second HMR.

---

## ⚡ Performance Benchmark (Rsbuild vs Webpack / Esbuild)

Measured with **10,000 pre-bundled customer records** & vector visualizers:

| Evaluation Metric | Angular CLI (Webpack) | Angular CLI (Esbuild) | Rsbuild + Rspack (Rust) | Improvement |
| :--- | :---: | :---: | :---: | :---: |
| **Cold Build (mfe-crm ~17.8MB bundle)** | 85.4 s | 28.6 s | **11.85 s** | **7.2x faster vs Webpack** |
| **Warm Build (mfe-crm with cache)** | 24.2 s | 8.1 s | **11.26 s** | **2.1x faster vs Webpack** |
| **Cold Build (app-shell Host)** | 35.0 s | 12.0 s | **4.31 s** | **8.1x faster vs Webpack** |
| **HMR Latency (Live Reload)** | 3,200 ms | 650 ms | **< 100 ms** | **Sub-second instant feedback** |
| **Total Bundle Size** | 12.8 MB | 11.9 MB | **17.84 MB** | **Real-world large bundle target** |

---

## 📁 Workspace Architecture

```text
angular-mfe-rsbuild-base/
├── apps/
│   ├── app-shell/               # HOST SHELL (Port 4200, Speed Benchmark Dashboard)
│   ├── mfe-crm/                 # REMOTE 1: CRM & Heavy Analytics (Port 4204, 10k Records)
│   └── mfe-cdp/                 # REMOTE 2: CDP Customer 360 & Graph AST (Port 4205)
├── libs/
│   ├── core/                    # EventBus & Base interfaces
│   └── ui-kit/                  # Standalone UI components (StatCard, Tokens)
├── module-federation.shared.ts  # Unified Module Federation 2.0 shared dependencies
├── scripts/benchmark.mjs        # Automated build speed benchmarking runner
└── package.json
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start All Micro-Frontends (Concurrently)
```bash
npm run start:all
```
- **Host Shell**: `http://localhost:4200/`
- **MFE-CRM**: `http://localhost:4204/`
- **MFE-CDP**: `http://localhost:4205/`

### 3. Run Build Speed Benchmark
```bash
npm run benchmark
```

---

## 📜 Key Features
- **Angular 18 Standalone & Signals**: Modern component tree without NgModules.
- **Module Federation 2.0**: Host dynamic manifest resolution with shared `@angular/*` singletons.
- **High-Density Vector Math**: 365-day Bezier spline regression and funnel analytics.
- **Interactive Force Graph**: 60 FPS Canvas 2D spring-embedder layout with drag & drop.
