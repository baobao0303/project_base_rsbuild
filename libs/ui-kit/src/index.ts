import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [style.border-left-color]="accentColor">
      <div class="stat-title">{{ title }}</div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-sub" *ngIf="subtitle">{{ subtitle }}</div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #3b82f6;
      border-radius: 8px;
      padding: 16px 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      min-width: 200px;
    }
    .stat-title { font-size: 13px; color: #64748b; font-weight: 500; text-transform: uppercase; }
    .stat-value { font-size: 26px; font-weight: 700; color: #0f172a; margin: 4px 0; }
    .stat-sub { font-size: 12px; color: #10b981; }
  `]
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitle = '';
  @Input() accentColor = '#3b82f6';
}
