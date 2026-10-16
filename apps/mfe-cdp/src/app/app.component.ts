import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer360GraphComponent } from './features/timeline/customer360-graph.component';

@Component({
  selector: 'app-cdp-root',
  standalone: true,
  imports: [CommonModule, Customer360GraphComponent],
  template: `
    <div class="cdp-container">
      <div class="header">
        <div class="title-group">
          <h1>CDP Customer 360 & Relationship Graph</h1>
          <p>Dynamic Entity Graph with Force-Directed Physics Simulation (Rsbuild MFE Benchmark)</p>
        </div>
      </div>

      <div class="content">
        <cdp-customer360-graph></cdp-customer360-graph>
      </div>
    </div>
  `,
  styles: [`
    .cdp-container {
      padding: 24px 32px;
      background-color: #f8fafc;
      min-height: calc(100vh - 60px);
    }
    .header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
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
  `]
})
export class CdpRootComponent {}
