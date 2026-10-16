import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsDashboardComponent } from './features/analytics/analytics-dashboard.component';
import { CustomerGridComponent } from './features/customers/customer-grid.component';

@Component({
  selector: 'app-crm-root',
  standalone: true,
  imports: [CommonModule, AnalyticsDashboardComponent, CustomerGridComponent],
  template: `
    <div class="crm-container">
      <div class="header">
        <div class="title-group">
          <h1>CRM & Analytics Enterprise Suite</h1>
          <p>Pre-bundled with 10,000 live customer records & 365-day timeseries data (Rsbuild Benchmark Target)</p>
        </div>

        <div class="tab-pills">
          <button
            class="pill-btn"
            [class.active]="activeTab() === 'analytics'"
            (click)="activeTab.set('analytics')"
          >
            <span class="icon">📈</span>
            <span class="label">Heavy Analytics Dashboard</span>
          </button>
          <button
            class="pill-btn"
            [class.active]="activeTab() === 'customers'"
            (click)="activeTab.set('customers')"
          >
            <span class="icon">👥</span>
            <span class="label">High-Volume 10,000 Customer Grid</span>
          </button>
        </div>
      </div>

      <div class="tab-content">
        <crm-analytics-dashboard *ngIf="activeTab() === 'analytics'"></crm-analytics-dashboard>
        <crm-customer-grid *ngIf="activeTab() === 'customers'"></crm-customer-grid>
      </div>
    </div>
  `,
  styles: [`
    .crm-container {
      padding: 24px 32px;
      background-color: #f8fafc;
      min-height: calc(100vh - 60px);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
      flex-wrap: wrap;
      gap: 16px;
    }
    .title-group h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
      letter-spacing: -0.02em;
    }
    .title-group p {
      color: #64748b;
      margin: 0;
      font-size: 13px;
    }
    .tab-pills {
      display: inline-flex;
      background: #e2e8f0;
      padding: 4px;
      border-radius: 10px;
      gap: 4px;
    }
    .pill-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #475569;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .pill-btn:hover {
      color: #0f172a;
    }
    .pill-btn.active {
      background: #ffffff;
      color: #2563eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    }
    .pill-btn .icon {
      font-size: 15px;
    }
  `]
})
export class CrmRootComponent {
  activeTab = signal<'analytics' | 'customers'>('analytics');
}
