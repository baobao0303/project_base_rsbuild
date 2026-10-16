import { Injectable } from '@angular/core';
import { MOCK_OLAP_RECORDS, OlapRecord } from '../mock-data/olap-datalake-100k.data';

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  totalScanned: number;
  totalMatched: number;
}

@Injectable({
  providedIn: 'root'
})
export class OlapSqlEngineService {
  private dataLake: OlapRecord[] = MOCK_OLAP_RECORDS;

  getDataLakeCount(): number {
    return this.dataLake.length;
  }

  executeQuery(sql: string): SqlQueryResult {
    const t0 = performance.now();
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    let filtered: OlapRecord[] = [...this.dataLake];
    const totalScanned = this.dataLake.length;

    // 1. Basic WHERE Clause Parser
    const whereMatch = cleanSql.match(/WHERE\s+(.+?)(?=\s+(GROUP BY|ORDER BY|LIMIT)|$)/i);
    if (whereMatch) {
      const condition = whereMatch[1].trim();
      filtered = filtered.filter(row => this.evaluateCondition(row, condition));
    }

    const totalMatched = filtered.length;

    // 2. GROUP BY Clause Parser
    const groupByMatch = cleanSql.match(/GROUP BY\s+(.+?)(?=\s+(ORDER BY|LIMIT)|$)/i);
    let rows: Record<string, any>[] = [];
    let columns: string[] = [];

    if (groupByMatch) {
      const groupFields = groupByMatch[1].split(',').map(s => s.trim());
      const groups = new Map<string, OlapRecord[]>();

      filtered.forEach(row => {
        const key = groupFields.map(f => (row as any)[f]).join(' | ');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
      });

      columns = [...groupFields, 'count', 'total_amount', 'avg_profit', 'total_units'];
      groups.forEach((groupRows, key) => {
        const first = groupRows[0] as any;
        const totalAmount = groupRows.reduce((acc, r) => acc + r.amount, 0);
        const totalProfit = groupRows.reduce((acc, r) => acc + r.profit, 0);
        const totalUnits = groupRows.reduce((acc, r) => acc + r.units, 0);

        const rowObj: Record<string, any> = {};
        groupFields.forEach(f => rowObj[f] = first[f]);
        rowObj['count'] = groupRows.length;
        rowObj['total_amount'] = Math.round(totalAmount * 100) / 100;
        rowObj['avg_profit'] = Math.round((totalProfit / groupRows.length) * 100) / 100;
        rowObj['total_units'] = totalUnits;
        rows.push(rowObj);
      });
    } else {
      // Simple SELECT
      columns = ['txId', 'customerId', 'channel', 'category', 'amount', 'profit', 'status', 'region'];
      rows = filtered.map(r => ({
        txId: r.txId,
        customerId: r.customerId,
        channel: r.channel,
        category: r.category,
        amount: r.amount,
        profit: r.profit,
        status: r.status,
        region: r.region
      }));
    }

    // 3. ORDER BY Parser
    const orderByMatch = cleanSql.match(/ORDER BY\s+([\w_]+)\s*(ASC|DESC)?/i);
    if (orderByMatch) {
      const sortField = orderByMatch[1].trim();
      const sortDir = (orderByMatch[2] || 'ASC').toUpperCase();
      rows.sort((a, b) => {
        const va = a[sortField];
        const vb = b[sortField];
        if (typeof va === 'number') {
          return sortDir === 'DESC' ? vb - va : va - vb;
        }
        return sortDir === 'DESC' ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
      });
    }

    // 4. LIMIT Parser
    const limitMatch = cleanSql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      rows = rows.slice(0, limit);
    } else {
      rows = rows.slice(0, 100);
    }

    const t1 = performance.now();
    return {
      columns,
      rows,
      executionTimeMs: Math.round((t1 - t0) * 10) / 10,
      totalScanned,
      totalMatched
    };
  }

  private evaluateCondition(row: OlapRecord, condition: string): boolean {
    const eqMatch = condition.match(/([\w_]+)\s*=\s*'([^']+)'/);
    if (eqMatch) {
      const field = eqMatch[1].trim();
      const val = eqMatch[2].trim();
      return String((row as any)[field]) === val;
    }
    const gtMatch = condition.match(/([\w_]+)\s*>\s*(\d+)/);
    if (gtMatch) {
      const field = gtMatch[1].trim();
      const val = parseFloat(gtMatch[2]);
      return Number((row as any)[field]) > val;
    }
    return true;
  }
}
