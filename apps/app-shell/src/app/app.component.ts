import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-shell-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shell-layout">
      <header class="navbar">
        <div class="brand">
          <span class="logo">⚡</span>
          <strong>Angular 18 Enterprise Micro-Frontend (Rsbuild)</strong>
        </div>
        <nav class="nav-links">
          <a routerLink="/benchmark" routerLinkActive="active">📊 Speed Benchmark</a>
          <a routerLink="/crm" routerLinkActive="active">💼 CRM & Big Data (5MB+)</a>
          <a routerLink="/cdp" routerLinkActive="active">🌐 CDP & Customer 360</a>
        </nav>
      </header>

      <main class="content-area">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell-layout { display: flex; flex-direction: column; min-height: 100vh; }
    .navbar {
      height: 60px;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      color: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .brand { display: flex; align-items: center; gap: 10px; font-size: 16px; }
    .logo { font-size: 20px; }
    .nav-links { display: flex; gap: 16px; }
    .nav-links a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: #ffffff;
      background: #1e293b;
    }
    .content-area { flex: 1; }
  `]
})
export class AppShellComponent {}
