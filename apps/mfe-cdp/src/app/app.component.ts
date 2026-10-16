import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer360GraphComponent } from './features/timeline/customer360-graph.component';
import { DigitalTwin3dComponent } from './features/digital-twin/digital-twin-3d.component';
import { WorkflowStudioComponent } from './features/workflow-studio/workflow-studio.component';

@Component({
  selector: 'app-cdp-root',
  standalone: true,
  imports: [
    CommonModule,
    Customer360GraphComponent,
    DigitalTwin3dComponent,
    WorkflowStudioComponent
  ],
  template: `
    <div class="cdp-container">
      <div class="header">
        <div class="title-group">
          <h1>CDP Customer 360 & Spatial Computing Suite</h1>
          <p>Entity Network Graph, 3D WebGL Digital Twin (Three.js) & Workflow Automation Studio</p>
        </div>

        <div class="tab-pills">
          <button
            class="pill-btn"
            [class.active]="activeTab() === 'graph'"
            (click)="activeTab.set('graph')"
          >
            <span class="icon">🌐</span>
            <span class="label">Entity Force Graph</span>
          </button>
          <button
            class="pill-btn"
            [class.active]="activeTab() === 'twin'"
            (click)="activeTab.set('twin')"
          >
            <span class="icon">🔮</span>
            <span class="label">3D WebGL Digital Twin</span>
          </button>
          <button
            class="pill-btn"
            [class.active]="activeTab() === 'workflow'"
            (click)="activeTab.set('workflow')"
          >
            <span class="icon">⚙️</span>
            <span class="label">Workflow Studio</span>
          </button>
        </div>
      </div>

      <div class="tab-content">
        <cdp-customer360-graph *ngIf="activeTab() === 'graph'"></cdp-customer360-graph>
        <cdp-digital-twin-3d *ngIf="activeTab() === 'twin'"></cdp-digital-twin-3d>
        <cdp-workflow-studio *ngIf="activeTab() === 'workflow'"></cdp-workflow-studio>
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
export class CdpRootComponent {
  activeTab = signal<'graph' | 'twin' | 'workflow'>('graph');
}
