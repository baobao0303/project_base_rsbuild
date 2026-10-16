import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MOCK_CUSTOMERS, CustomerRecord } from '../mock-data/customers-50k.data';

@Component({
  selector: 'crm-customer-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid-page">
      <div class="toolbar">
        <div class="search-box">
          <input
            type="text"
            placeholder="Search across 10,000 customers (Name, Email, Company, Phone)..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
          />
        </div>
        <div class="filters">
          <select [ngModel]="selectedTier()" (ngModelChange)="selectedTier.set($event)">
            <option value="">All Tiers</option>
            <option value="Standard">Standard</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
            <option value="Diamond">Diamond</option>
          </select>
          <button class="btn-export" (click)="exportCSV()">Export Filtered CSV</button>
        </div>
      </div>

      <div class="metrics-bar">
        <span>Total Dataset: <strong>{{ totalCount | number }}</strong> records</span>
        <span>Matching: <strong>{{ filteredCustomers().length | number }}</strong> records</span>
        <span>Aggregated LTV: <strong>\${{ totalLtv() | number:'1.0-0' }}</strong></span>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Company</th>
              <th>Tier</th>
              <th>Province</th>
              <th>Credit Score</th>
              <th>LTV ($)</th>
              <th>Open Deals</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of paginatedCustomers()">
              <td class="code">{{ item.id }}</td>
              <td class="bold">{{ item.name }}</td>
              <td>{{ item.company }}</td>
              <td>
                <span class="tier-badge" [ngClass]="item.tier.toLowerCase()">{{ item.tier }}</span>
              </td>
              <td>{{ item.province }}</td>
              <td>{{ item.creditScore }}</td>
              <td class="bold">\${{ item.lifetimeValue | number:'1.2-2' }}</td>
              <td>{{ item.openDeals }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button [disabled]="currentPage() === 1" (click)="setPage(currentPage() - 1)">Previous</button>
        <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
        <button [disabled]="currentPage() >= totalPages()" (click)="setPage(currentPage() + 1)">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .grid-page { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
    .toolbar { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
    .search-box { flex: 1; }
    .search-box input { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }
    .filters { display: flex; gap: 10px; }
    .filters select { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; }
    .btn-export { background: #059669; color: #fff; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .metrics-bar { display: flex; gap: 24px; padding: 10px 14px; background: #f8fafc; border-radius: 6px; margin-bottom: 16px; font-size: 13px; color: #475569; }
    .table-container { overflow-x: auto; max-height: 540px; border: 1px solid #e2e8f0; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { position: sticky; top: 0; background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; color: #334155; border-bottom: 1px solid #cbd5e1; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    tr:hover { background: #f8fafc; }
    .bold { font-weight: 600; color: #0f172a; }
    .code { font-family: monospace; color: #64748b; }
    .tier-badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .tier-badge.diamond { background: #ede9fe; color: #6d28d9; }
    .tier-badge.platinum { background: #e0f2fe; color: #0369a1; }
    .tier-badge.gold { background: #fef3c7; color: #b45309; }
    .tier-badge.silver { background: #f1f5f9; color: #475569; }
    .tier-badge.standard { background: #f3f4f6; color: #6b7280; }
    .pagination { display: flex; justify-content: flex-end; align-items: center; gap: 16px; margin-top: 16px; }
    .pagination button { padding: 8px 14px; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class CustomerGridComponent {
  dataset = MOCK_CUSTOMERS;
  totalCount = MOCK_CUSTOMERS.length;

  searchTerm = signal('');
  selectedTier = signal('');
  currentPage = signal(1);
  pageSize = 25;

  filteredCustomers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const tier = this.selectedTier();

    return this.dataset.filter(c => {
      const matchTier = tier ? c.tier === tier : true;
      const matchSearch = !term ||
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.company.toLowerCase().includes(term) ||
        c.phone.includes(term);
      return matchTier && matchSearch;
    });
  });

  totalPages = computed(() => Math.ceil(this.filteredCustomers().length / this.pageSize) || 1);

  paginatedCustomers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredCustomers().slice(start, start + this.pageSize);
  });

  totalLtv = computed(() => {
    return this.filteredCustomers().reduce((sum, c) => sum + c.lifetimeValue, 0);
  });

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  exportCSV() {
    const data = this.filteredCustomers().slice(0, 1000);
    const headers = 'ID,Name,Email,Company,Tier,Province,Score,LTV\n';
    const rows = data.map(d => `"${d.id}","${d.name}","${d.email}","${d.company}","${d.tier}","${d.province}",${d.creditScore},${d.lifetimeValue}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `customers-export-${Date.now()}.csv`);
    a.click();
  }
}
