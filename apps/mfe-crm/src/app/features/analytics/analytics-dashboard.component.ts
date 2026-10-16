import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_TIMESERIES } from '../mock-data/timeseries-analytics.data';
import { StatCardComponent } from '@libs/ui-kit';

@Component({
  selector: 'crm-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  template: `
    <div class="analytics-page">
      <div class="kpi-grid">
        <ui-stat-card title="Total Revenue (YTD)" [value]="'$' + formatNumber(totalRevenue())" subtitle="+18.4% vs last year" accentColor="#10b981"></ui-stat-card>
        <ui-stat-card title="Net Operating Margin" [value]="formatNumber(averageMargin()) + '%'" subtitle="Healthy SaaS metric" accentColor="#3b82f6"></ui-stat-card>
        <ui-stat-card title="Total Qualified Leads" [value]="formatNumber(totalLeads())" subtitle="Pipeline conversion 4.2%" accentColor="#f59e0b"></ui-stat-card>
        <ui-stat-card title="Deals Won" [value]="formatNumber(totalWonDeals())" subtitle="ARR Impact $4.2M" accentColor="#8b5cf6"></ui-stat-card>
      </div>

      <div class="chart-panel">
        <div class="panel-header">
          <div>
            <h3>365-Day Revenue & Margin Regression Spline</h3>
            <span class="subtext">Smoothed moving average with polynomial spline interpolation</span>
          </div>
          <div class="legend-tags">
            <span class="legend-item"><i class="dot blue"></i> Revenue Spline</span>
            <span class="legend-item"><i class="dot red"></i> Linear Trendline</span>
          </div>
        </div>

        <div class="svg-container">
          <svg viewBox="0 0 1000 320" class="vector-chart" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.02"/>
              </linearGradient>
            </defs>

            <!-- Gridlines -->
            <line x1="50" y1="50" x2="980" y2="50" stroke="#f1f5f9" stroke-width="1" />
            <line x1="50" y1="120" x2="980" y2="120" stroke="#f1f5f9" stroke-width="1" />
            <line x1="50" y1="190" x2="980" y2="190" stroke="#f1f5f9" stroke-width="1" />
            <line x1="50" y1="260" x2="980" y2="260" stroke="#e2e8f0" stroke-width="1.5" />

            <!-- Y Axis labels -->
            <text x="40" y="55" text-anchor="end" class="axis-text">$250k</text>
            <text x="40" y="125" text-anchor="end" class="axis-text">$200k</text>
            <text x="40" y="195" text-anchor="end" class="axis-text">$150k</text>
            <text x="40" y="265" text-anchor="end" class="axis-text">$100k</text>

            <!-- Spline Area & Stroke -->
            <path [attr.d]="svgAreaPath()" fill="url(#revenueGrad)" />
            <path [attr.d]="svgLinePath()" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" />
            <path [attr.d]="svgTrendlinePath()" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,6" />

            <!-- Data Point Circles for Samples -->
            <g *ngFor="let pt of sampledPoints()">
              <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" fill="#ffffff" stroke="#2563eb" stroke-width="2" />
            </g>
          </svg>
        </div>
      </div>

      <div class="conversion-funnel">
        <div class="panel-header">
          <div>
            <h3>Enterprise Sales Funnel Conversion Stages</h3>
            <span class="subtext">End-to-end full funnel throughput from marketing impressions to closed deals</span>
          </div>
        </div>

        <div class="funnel-bars">
          <div class="funnel-row" *ngFor="let stage of funnelStages()">
            <div class="stage-label">{{ stage.name }}</div>
            <div class="bar-container">
              <div class="bar-fill" [style.width.%]="stage.pct"></div>
              <div class="bar-label-wrapper">
                <span class="bar-count">{{ stage.count | number }}</span>
                <span class="bar-pct">({{ stage.pct }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page { display: flex; flex-direction: column; gap: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .chart-panel { background: #fff; padding: 24px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .panel-header h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a; }
    .subtext { font-size: 13px; color: #64748b; }
    .legend-tags { display: flex; gap: 16px; align-items: center; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #475569; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot.blue { background: #2563eb; }
    .dot.red { background: #ef4444; }
    .svg-container { width: 100%; height: 300px; margin-top: 10px; }
    .vector-chart { width: 100%; height: 100%; overflow: visible; }
    .axis-text { font-size: 11px; fill: #94a3b8; font-family: monospace; }
    .conversion-funnel { background: #fff; padding: 24px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .funnel-bars { display: flex; flex-direction: column; gap: 14px; margin-top: 12px; }
    .funnel-row { display: flex; align-items: center; gap: 20px; }
    .stage-label { width: 160px; font-size: 13px; font-weight: 600; color: #334155; }
    .bar-container { flex: 1; position: relative; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; height: 36px; overflow: hidden; display: flex; align-items: center; }
    .bar-fill { background: linear-gradient(90deg, #3b82f6, #60a5fa); height: 100%; transition: width 0.4s ease; min-width: 4px; }
    .bar-label-wrapper { position: absolute; left: 16px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #0f172a; text-shadow: 0 0 3px rgba(255,255,255,0.8); }
    .bar-count { color: #0f172a; }
    .bar-pct { color: #2563eb; font-weight: 600; font-size: 12px; }
  `]
})
export class AnalyticsDashboardComponent implements OnInit {
  rawSeries = MOCK_TIMESERIES;

  totalRevenue = computed(() => this.rawSeries.reduce((acc, curr) => acc + curr.revenue, 0));
  averageMargin = computed(() => {
    const totalRev = this.totalRevenue();
    const totalMargin = this.rawSeries.reduce((acc, curr) => acc + curr.margin, 0);
    return Math.round((totalMargin / totalRev) * 1000) / 10;
  });
  totalLeads = computed(() => this.rawSeries.reduce((acc, curr) => acc + curr.leads, 0));
  totalWonDeals = computed(() => this.rawSeries.reduce((acc, curr) => acc + curr.funnel.won, 0));

  funnelStages = computed(() => {
    const totalImpressions = this.rawSeries.reduce((a, b) => a + b.funnel.impressions, 0);
    const totalClicks = this.rawSeries.reduce((a, b) => a + b.funnel.clicks, 0);
    const totalSignups = this.rawSeries.reduce((a, b) => a + b.funnel.signups, 0);
    const totalQualified = this.rawSeries.reduce((a, b) => a + b.funnel.qualified, 0);
    const totalWon = this.rawSeries.reduce((a, b) => a + b.funnel.won, 0);

    return [
      { name: 'Impressions', count: totalImpressions, pct: 100 },
      { name: 'Ad Clicks', count: totalClicks, pct: Math.round((totalClicks / totalImpressions) * 1000) / 10 },
      { name: 'Signups', count: totalSignups, pct: Math.round((totalSignups / totalImpressions) * 1000) / 10 },
      { name: 'Qualified Leads', count: totalQualified, pct: Math.round((totalQualified / totalImpressions) * 1000) / 10 },
      { name: 'Won Deals', count: totalWon, pct: Math.round((totalWon / totalImpressions) * 1000) / 10 },
    ];
  });

  svgLinePath = signal<string>('');
  svgAreaPath = signal<string>('');
  svgTrendlinePath = signal<string>('');
  sampledPoints = signal<{ x: number; y: number }[]>([]);

  ngOnInit() {
    this.calculateSmoothSpline();
  }

  calculateSmoothSpline() {
    // 1. Group 365 days into 24 smoothed intervals (~15 days each) for clean spline
    const groupSize = 15;
    const points: { x: number; y: number }[] = [];
    const minVal = 100000;
    const maxVal = 260000;
    const range = maxVal - minVal;

    for (let i = 0; i < this.rawSeries.length; i += groupSize) {
      const chunk = this.rawSeries.slice(i, i + groupSize);
      const avg = chunk.reduce((s, c) => s + c.revenue, 0) / chunk.length;
      const x = 60 + (i / (this.rawSeries.length - 1)) * 910;
      const y = 260 - ((avg - minVal) / range) * 210;
      points.push({ x: Math.round(x), y: Math.round(y) });
    }

    this.sampledPoints.set(points);

    // 2. Generate smooth Bezier curve path
    if (points.length < 2) return;

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x},${p2.y}`;
    }

    this.svgLinePath.set(path);
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    this.svgAreaPath.set(`${path} L ${lastX},260 L ${firstX},260 Z`);

    // Trendline
    this.svgTrendlinePath.set(`M ${firstX},220 L ${lastX},90`);
  }

  formatNumber(val: number): string {
    return Intl.NumberFormat().format(val);
  }
}
