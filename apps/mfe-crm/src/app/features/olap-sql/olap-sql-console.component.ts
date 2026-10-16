import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OlapSqlEngineService, SqlQueryResult } from './sql-engine.service';

@Component({
  selector: 'crm-olap-sql-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sql-console-card">
      <div class="header">
        <div>
          <h3>In-Browser OLAP SQL Query Engine</h3>
          <span class="subtext">Executing realtime relational queries across 25,000 in-memory enterprise event records</span>
        </div>
        <div class="data-badge">
          Data Lake: <strong>{{ totalRecords | number }} rows (8.5MB Chunk)</strong>
        </div>
      </div>

      <div class="presets-bar">
        <span class="preset-label">Query Presets:</span>
        <button (click)="loadPreset(1)">Channel Revenue (GROUP BY)</button>
        <button (click)="loadPreset(2)">Category Profit Matrix</button>
        <button (click)="loadPreset(3)">High-Value Transactions (WHERE amount > 3000)</button>
        <button (click)="loadPreset(4)">Regional Performance</button>
      </div>

      <div class="editor-wrapper">
        <textarea [(ngModel)]="sqlQuery" rows="4" placeholder="Enter SQL Query (SELECT, WHERE, GROUP BY, ORDER BY, LIMIT)..."></textarea>
        <button class="btn-run" (click)="runQuery()">⚡ Execute Query</button>
      </div>

      <div class="telemetry-bar" *ngIf="queryResult()">
        <span>⏱ Latency: <strong>{{ queryResult()?.executionTimeMs }} ms</strong></span>
        <span>🔍 Scanned: <strong>{{ queryResult()?.totalScanned | number }}</strong></span>
        <span>🎯 Matched: <strong>{{ queryResult()?.totalMatched | number }}</strong></span>
        <span>📄 Output Rows: <strong>{{ queryResult()?.rows?.length }}</strong></span>
      </div>

      <div class="table-container" *ngIf="queryResult()">
        <table>
          <thead>
            <tr>
              <th *ngFor="let col of queryResult()?.columns">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of queryResult()?.rows">
              <td *ngFor="let col of queryResult()?.columns">
                {{ formatCell(row[col]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .sql-console-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
    .header h3 { margin: 0 0 4px 0; font-size: 16px; color: #0f172a; }
    .subtext { font-size: 13px; color: #64748b; }
    .data-badge { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 12px; padding: 6px 12px; border-radius: 6px; }
    .presets-bar { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; flex-wrap: wrap; }
    .preset-label { font-size: 12px; font-weight: 600; color: #64748b; }
    .presets-bar button { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 10px; font-size: 12px; cursor: pointer; color: #334155; }
    .presets-bar button:hover { background: #e2e8f0; }
    .editor-wrapper { position: relative; margin-bottom: 16px; }
    textarea { width: 100%; box-sizing: border-box; background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 14px; padding: 14px; border-radius: 8px; border: 1px solid #1e293b; resize: vertical; }
    .btn-run { position: absolute; right: 14px; bottom: 16px; background: #2563eb; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; }
    .btn-run:hover { background: #1d4ed8; }
    .telemetry-bar { display: flex; gap: 24px; padding: 10px 16px; background: #f8fafc; border-radius: 6px; font-size: 13px; color: #475569; margin-bottom: 14px; }
    .table-container { max-height: 480px; overflow: auto; border: 1px solid #e2e8f0; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { position: sticky; top: 0; background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; color: #334155; border-bottom: 1px solid #cbd5e1; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-family: monospace; }
    tr:hover { background: #f8fafc; }
  `]
})
export class OlapSqlConsoleComponent implements OnInit {
  sqlQuery = "SELECT channel, category, count, total_amount, avg_profit FROM transactions WHERE status = 'COMPLETED' GROUP BY channel, category ORDER BY total_amount DESC LIMIT 50";
  queryResult = signal<SqlQueryResult | null>(null);
  totalRecords = 0;

  constructor(private sqlEngine: OlapSqlEngineService) {}

  ngOnInit() {
    this.totalRecords = this.sqlEngine.getDataLakeCount();
    this.runQuery();
  }

  runQuery() {
    const res = this.sqlEngine.executeQuery(this.sqlQuery);
    this.queryResult.set(res);
  }

  loadPreset(idx: number) {
    if (idx === 1) {
      this.sqlQuery = "SELECT channel, count, total_amount, avg_profit FROM transactions WHERE status = 'COMPLETED' GROUP BY channel ORDER BY total_amount DESC LIMIT 20";
    } else if (idx === 2) {
      this.sqlQuery = "SELECT category, count, total_amount, avg_profit FROM transactions GROUP BY category ORDER BY avg_profit DESC LIMIT 20";
    } else if (idx === 3) {
      this.sqlQuery = "SELECT txId, customerId, channel, amount, profit, status FROM transactions WHERE amount > 3000 ORDER BY amount DESC LIMIT 50";
    } else if (idx === 4) {
      this.sqlQuery = "SELECT region, count, total_amount, avg_profit FROM transactions GROUP BY region ORDER BY total_amount DESC LIMIT 20";
    }
    this.runQuery();
  }

  formatCell(val: any): string {
    if (typeof val === 'number') {
      return Intl.NumberFormat().format(val);
    }
    return String(val ?? '');
  }
}
