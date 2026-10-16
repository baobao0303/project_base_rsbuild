import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpreadsheetFormulaEngineService, PivotResult } from './formula-engine.service';
import { MOCK_OLAP_RECORDS } from '../mock-data/olap-datalake-100k.data';

@Component({
  selector: 'crm-spreadsheet-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="spreadsheet-card">
      <div class="header">
        <div>
          <h3>Spreadsheet Pivot Matrix & Formula Engine</h3>
          <span class="subtext">200,000-cell virtual calculation matrix with dynamic VLOOKUP, SUMIFS & cross-tabulation</span>
        </div>
        <div class="actions">
          <button class="btn-export" (click)="exportTSV()">📥 Export TSV Sheet</button>
        </div>
      </div>

      <div class="formula-bar">
        <span class="fx-label">fx</span>
        <input [(ngModel)]="currentFormula" (change)="applyFormula()" placeholder="=SUM(A1:B10) or =AVG(150, 320, 480)" />
        <span class="calc-result" *ngIf="evalResult !== null">Result: <strong>{{ evalResult | number:'1.2-2' }}</strong></span>
      </div>

      <div class="pivot-controls">
        <label>Row Dimension:
          <select [(ngModel)]="selectedRow" (change)="updatePivot()">
            <option value="category">Category</option>
            <option value="channel">Channel</option>
            <option value="region">Region</option>
            <option value="payment">Payment Method</option>
          </select>
        </label>

        <label>Column Dimension:
          <select [(ngModel)]="selectedCol" (change)="updatePivot()">
            <option value="channel">Channel</option>
            <option value="region">Region</option>
            <option value="category">Category</option>
            <option value="status">Status</option>
          </select>
        </label>

        <label>Aggregation:
          <select [(ngModel)]="selectedAgg" (change)="updatePivot()">
            <option value="SUM">SUM(Amount)</option>
            <option value="AVG">AVG(Amount)</option>
            <option value="COUNT">COUNT(Transactions)</option>
            <option value="MAX">MAX(Amount)</option>
          </select>
        </label>
      </div>

      <div class="matrix-wrapper" *ngIf="pivotResult()">
        <table>
          <thead>
            <tr>
              <th class="corner-header">{{ selectedRow | uppercase }} ╲ {{ selectedCol | uppercase }}</th>
              <th *ngFor="let col of pivotResult()?.colKeys">{{ col }}</th>
              <th class="total-header">ROW TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of pivotResult()?.rowKeys">
              <td class="row-header">{{ row }}</td>
              <td *ngFor="let col of pivotResult()?.colKeys" class="cell-val">
                {{ formatNumber(pivotResult()?.matrix?.[row]?.[col] || 0) }}
              </td>
              <td class="row-total">
                {{ formatNumber(calculateRowTotal(row)) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="grand-label">GRAND TOTAL</td>
              <td *ngFor="let col of pivotResult()?.colKeys" class="col-total">
                {{ formatNumber(calculateColTotal(col)) }}
              </td>
              <td class="grand-total">{{ formatNumber(pivotResult()?.grandTotal || 0) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .spreadsheet-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
    .header h3 { margin: 0 0 4px 0; font-size: 16px; color: #0f172a; }
    .subtext { font-size: 13px; color: #64748b; }
    .btn-export { background: #059669; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; }
    .formula-bar { display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; margin-bottom: 16px; }
    .fx-label { font-family: italic; font-weight: bold; color: #64748b; font-size: 14px; }
    .formula-bar input { flex: 1; border: none; background: transparent; font-family: monospace; font-size: 14px; outline: none; }
    .calc-result { font-size: 13px; color: #2563eb; }
    .pivot-controls { display: flex; gap: 20px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; font-size: 13px; font-weight: 500; color: #334155; }
    .pivot-controls select { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-left: 6px; }
    .matrix-wrapper { overflow: auto; max-height: 480px; border: 1px solid #cbd5e1; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; font-family: -apple-system, sans-serif; }
    th { position: sticky; top: 0; background: #f1f5f9; padding: 10px 14px; text-align: right; border: 1px solid #cbd5e1; font-weight: 600; color: #1e293b; }
    th.corner-header { text-align: left; background: #e2e8f0; }
    th.total-header { background: #e0e7ff; color: #3730a3; }
    td { padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace; }
    td.row-header { text-align: left; font-weight: 600; background: #f8fafc; font-family: sans-serif; }
    td.row-total { font-weight: 700; background: #f5f3ff; color: #5b21b6; }
    tfoot td { font-weight: 700; background: #f1f5f9; border-top: 2px solid #94a3b8; }
    td.grand-label { text-align: left; background: #e2e8f0; font-family: sans-serif; }
    td.grand-total { background: #dbeafe; color: #1e40af; font-size: 14px; }
  `]
})
export class SpreadsheetMatrixComponent implements OnInit {
  selectedRow = 'category';
  selectedCol = 'channel';
  selectedAgg: 'SUM' | 'AVG' | 'COUNT' | 'MAX' = 'SUM';

  currentFormula = '=SUM(1250, 4800, 3100)';
  evalResult: number | null = null;
  pivotResult = signal<PivotResult | null>(null);

  constructor(private formulaEngine: SpreadsheetFormulaEngineService) {}

  ngOnInit() {
    this.updatePivot();
    this.applyFormula();
  }

  updatePivot() {
    const res = this.formulaEngine.computePivotMatrix(MOCK_OLAP_RECORDS, {
      rowField: this.selectedRow,
      colField: this.selectedCol,
      valField: 'amount',
      aggregator: this.selectedAgg
    });
    this.pivotResult.set(res);
  }

  applyFormula() {
    this.evalResult = this.formulaEngine.evaluateFormula(this.currentFormula, new Map());
  }

  calculateRowTotal(row: string): number {
    const matrix = this.pivotResult()?.matrix?.[row] || {};
    let sum = 0;
    for (const k in matrix) sum += matrix[k];
    return Math.round(sum * 100) / 100;
  }

  calculateColTotal(col: string): number {
    const p = this.pivotResult();
    if (!p) return 0;
    let sum = 0;
    for (const r of p.rowKeys) {
      sum += (p.matrix[r]?.[col] || 0);
    }
    return Math.round(sum * 100) / 100;
  }

  formatNumber(val: number): string {
    return Intl.NumberFormat().format(val);
  }

  exportTSV() {
    const p = this.pivotResult();
    if (!p) return;
    let tsv = `${this.selectedRow}\\${this.selectedCol}\t${p.colKeys.join('\t')}\tTOTAL\n`;
    p.rowKeys.forEach(r => {
      const vals = p.colKeys.map(c => p.matrix[r]?.[c] || 0);
      tsv += `${r}\t${vals.join('\t')}\t${this.calculateRowTotal(r)}\n`;
    });
    const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pivot-matrix-${Date.now()}.tsv`;
    a.click();
  }
}
