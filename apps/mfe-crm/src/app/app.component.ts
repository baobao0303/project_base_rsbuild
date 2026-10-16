import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsDashboardComponent } from './features/analytics/analytics-dashboard.component';
import { CustomerGridComponent } from './features/customers/customer-grid.component';
import { OlapSqlConsoleComponent } from './features/olap-sql/olap-sql-console.component';
import { SpreadsheetMatrixComponent } from './features/spreadsheet/spreadsheet-matrix.component';

@Component({
  selector: 'app-crm-root',
  standalone: true,
  imports: [
    CommonModule,
    AnalyticsDashboardComponent,
    CustomerGridComponent,
    OlapSqlConsoleComponent,
    SpreadsheetMatrixComponent
  ],
  template: `
    <div class="crm-container">
      <div class="header">
        <div class="title-group">
          <h1>CRM & Analytics Enterprise Suite</h1>
          <p>Pre-bundled with 10,000 customers & 25,000 OLAP records (~13.6MB data chunks) for Rsbuild Benchmark</p>
        </div>

        <div class="tab-pills">
          <button
            class="pill-btn"
            [class.active]="activeTab() === 'analytics'"
            (click)="activeTab.set('analytics')"
          >
            <span class="icon">📈</span>
            <span class="label">Analytics Dashboard</span>
          </button>
          <button
            class="pill-btn"
            [class.active]="activeTab() === 'customers'"
            (click)="activeTab.set('customers')"
          >
            <span class="icon">👥</span>
            <span class="label">Customer Grid</span>
          </button>
          <button
            class="pill-btn"
            [class.active]="activeTab() === 'olap'"
            (click)="activeTab.set('olap')"
          >
            <span class="icon">⚡</span>
            <span class="label">In-Browser OLAP SQL (25k)</span>
          </button>
          <button
            class="pill-btn"
            [class.active]="activeTab() === 'spreadsheet'"
            (click)="activeTab.set('spreadsheet')"
          >
            <span class="icon">📑</span>
            <span class="label">Spreadsheet Pivot Matrix</span>
          </button>
        </div>
      </div>

      <div class="tab-content">
        <crm-analytics-dashboard *ngIf="activeTab() === 'analytics'"></crm-analytics-dashboard>
        <crm-customer-grid *ngIf="activeTab() === 'customers'"></crm-customer-grid>
        <crm-olap-sql-console *ngIf="activeTab() === 'olap'"></crm-olap-sql-console>
        <crm-spreadsheet-matrix *ngIf="activeTab() === 'spreadsheet'"></crm-spreadsheet-matrix>
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
      flex-wrap: wrap;
    }
    .pill-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #475569;
      font-size: 12px;
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
      font-size: 14px;
    }
  `]
})
export class CrmRootComponent {
  activeTab = signal<'analytics' | 'customers' | 'olap' | 'spreadsheet'>('analytics');
}
