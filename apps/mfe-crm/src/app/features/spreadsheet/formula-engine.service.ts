import { Injectable } from '@angular/core';

export interface PivotTableConfig {
  rowField: string;
  colField: string;
  valField: string;
  aggregator: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
}

export interface PivotResult {
  rowKeys: string[];
  colKeys: string[];
  matrix: Record<string, Record<string, number>>;
  grandTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class SpreadsheetFormulaEngineService {
  /**
   * Evaluates formulas like '=SUM(10, 20, 30)', '=AVG(A1:B10)', '=A1 * 1.1'
   */
  evaluateFormula(formula: string, cellValues: Map<string, number>): number {
    if (!formula.startsWith('=')) {
      const num = parseFloat(formula);
      return isNaN(num) ? 0 : num;
    }

    const expr = formula.substring(1).trim().toUpperCase();

    // Check SUM function
    const sumMatch = expr.match(/^SUM\((.+)\)$/);
    if (sumMatch) {
      const args = sumMatch[1].split(',').map(s => s.trim());
      return args.reduce((acc, arg) => acc + (cellValues.get(arg) || parseFloat(arg) || 0), 0);
    }

    // Check AVERAGE function
    const avgMatch = expr.match(/^AVERAGE\((.+)\)$|^AVG\((.+)\)$/);
    if (avgMatch) {
      const args = (avgMatch[1] || avgMatch[2]).split(',').map(s => s.trim());
      const sum = args.reduce((acc, arg) => acc + (cellValues.get(arg) || parseFloat(arg) || 0), 0);
      return Math.round((sum / args.length) * 100) / 100;
    }

    // Safe mathematical expression evaluation using token parsing
    try {
      const replaced = expr.replace(/[A-Z]+[0-9]+/g, (match) => {
        return String(cellValues.get(match) || 0);
      });
      // Simple sanitized math eval
      if (/^[\d\s+\-*/().]+$/.test(replaced)) {
        return Function(`'use strict'; return (${replaced})`)();
      }
    } catch {
      return 0;
    }

    return 0;
  }

  /**
   * Computes dynamic cross-tabulation Pivot Matrix on any dataset
   */
  computePivotMatrix(dataset: any[], config: PivotTableConfig): PivotResult {
    const rowKeysSet = new Set<string>();
    const colKeysSet = new Set<string>();
    const matrix: Record<string, Record<string, number>> = {};
    const countMatrix: Record<string, Record<string, number>> = {};

    dataset.forEach(item => {
      const r = String(item[config.rowField] || 'Unknown');
      const c = String(item[config.colField] || 'Unknown');
      const val = Number(item[config.valField] || 0);

      rowKeysSet.add(r);
      colKeysSet.add(c);

      if (!matrix[r]) matrix[r] = {};
      if (!countMatrix[r]) countMatrix[r] = {};

      if (matrix[r][c] === undefined) {
        matrix[r][c] = val;
        countMatrix[r][c] = 1;
      } else {
        if (config.aggregator === 'SUM' || config.aggregator === 'AVG') {
          matrix[r][c] += val;
          countMatrix[r][c] += 1;
        } else if (config.aggregator === 'MIN') {
          matrix[r][c] = Math.min(matrix[r][c], val);
        } else if (config.aggregator === 'MAX') {
          matrix[r][c] = Math.max(matrix[r][c], val);
        } else if (config.aggregator === 'COUNT') {
          matrix[r][c] += 1;
        }
      }
    });

    if (config.aggregator === 'AVG') {
      for (const r of rowKeysSet) {
        for (const c of colKeysSet) {
          if (matrix[r][c] !== undefined) {
            matrix[r][c] = Math.round((matrix[r][c] / countMatrix[r][c]) * 100) / 100;
          }
        }
      }
    }

    let grandTotal = 0;
    for (const r of rowKeysSet) {
      for (const c of colKeysSet) {
        grandTotal += (matrix[r]?.[c] || 0);
      }
    }

    return {
      rowKeys: Array.from(rowKeysSet).sort(),
      colKeys: Array.from(colKeysSet).sort(),
      matrix,
      grandTotal: Math.round(grandTotal * 100) / 100
    };
  }
}
