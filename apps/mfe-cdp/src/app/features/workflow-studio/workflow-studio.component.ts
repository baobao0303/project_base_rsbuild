import { Component, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  title: string;
  subtitle: string;
  x: number;
  y: number;
  icon: string;
  color: string;
  status?: 'idle' | 'running' | 'success';
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  active?: boolean;
}

@Component({
  selector: 'cdp-workflow-studio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="studio-card">
      <div class="studio-header">
        <div>
          <h3>Workflow Automation Studio</h3>
          <span class="subtext">Node-based multi-branch flowchart with infinite pan/zoom & live token execution</span>
        </div>
        <div class="controls">
          <button class="btn-tool" (click)="resetView()">🎯 Reset View</button>
          <button class="btn-tool" (click)="addNode()">➕ Add Node</button>
          <button class="btn-simulate" (click)="simulateRun()">▶ Simulate Flow</button>
        </div>
      </div>

      <div class="canvas-viewport"
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (mouseup)="onMouseUp()"
        (wheel)="onWheel($event)">

        <div class="zoom-indicator">Zoom: {{ (scale() * 100).toFixed(0) }}%</div>

        <svg class="flow-svg"
          [style.transform]="'translate(' + panX() + 'px, ' + panY() + 'px) scale(' + scale() + ')'">
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3b82f6" />
              <stop offset="100%" stop-color="#10b981" />
            </linearGradient>
          </defs>

          <!-- Bezier Curves Connecting Nodes -->
          <g *ngFor="let edge of edges()">
            <path
              [attr.d]="computeBezierPath(edge)"
              [class.active-edge]="edge.active"
              class="edge-path" />
            <!-- Edge label -->
            <text *ngIf="edge.label"
              [attr.x]="computeEdgeMid(edge).x"
              [attr.y]="computeEdgeMid(edge).y - 6"
              class="edge-text">
              {{ edge.label }}
            </text>
          </g>

          <!-- Interactive Flowchart Nodes -->
          <g *ngFor="let node of nodes()"
            [attr.transform]="'translate(' + node.x + ',' + node.y + ')'"
            (mousedown)="startDragNode($event, node)"
            class="flow-node">
            <!-- Node Body -->
            <rect
              width="210"
              height="84"
              rx="10"
              [style.stroke]="node.color"
              class="node-rect"
              [class.running]="node.status === 'running'" />

            <!-- Type Accent Bar -->
            <path d="M 0,10 A 10,10 0 0,1 10,0 L 200,0 A 10,10 0 0,1 210,0 L 210,6 L 0,6 Z" [style.fill]="node.color" />

            <!-- Node Icon -->
            <text x="16" y="44" class="node-icon">{{ node.icon }}</text>

            <!-- Node Title & Subtitle -->
            <text x="46" y="38" class="node-title">{{ node.title }}</text>
            <text x="46" y="58" class="node-subtitle">{{ node.subtitle }}</text>

            <!-- Connectors (Pins) -->
            <circle cx="105" cy="0" r="4.5" class="pin input-pin" />
            <circle cx="105" cy="84" r="4.5" class="pin output-pin" />
          </g>
        </svg>
      </div>

      <div class="studio-footer">
        <span>Active Nodes: <strong>{{ nodes().length }}</strong></span>
        <span>Branches: <strong>{{ edges().length }}</strong></span>
        <span>Navigation: <strong>Middle/Right drag to Pan | Scroll wheel to Zoom</strong></span>
      </div>
    </div>
  `,
  styles: [`
    .studio-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .studio-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
    .studio-header h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a; }
    .subtext { font-size: 13px; color: #64748b; }
    .controls { display: flex; gap: 10px; }
    .btn-tool { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; color: #334155; }
    .btn-simulate { background: #10b981; color: #fff; border: none; border-radius: 6px; padding: 6px 16px; font-size: 13px; font-weight: 700; cursor: pointer; }
    .canvas-viewport { position: relative; width: 100%; height: 560px; background: #0f172a; border-radius: 10px; overflow: hidden; border: 1px solid #1e293b; user-select: none; }
    .zoom-indicator { position: absolute; top: 14px; right: 14px; background: rgba(30, 41, 59, 0.85); color: #94a3b8; font-family: monospace; font-size: 12px; padding: 4px 10px; border-radius: 6px; pointer-events: none; }
    .flow-svg { width: 100%; height: 100%; transform-origin: 0 0; }
    .edge-path { fill: none; stroke: #475569; stroke-width: 2.5; stroke-dasharray: 6,4; }
    .edge-path.active-edge { stroke: #10b981; stroke-width: 3.5; stroke-dasharray: none; filter: drop-shadow(0 0 6px #10b981); }
    .edge-text { fill: #94a3b8; font-size: 10px; font-family: monospace; text-anchor: middle; }
    .flow-node { cursor: move; }
    .node-rect { fill: #1e293b; stroke-width: 1.5; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)); }
    .node-rect.running { stroke: #38bdf8 !important; filter: drop-shadow(0 0 12px #38bdf8); }
    .node-icon { font-size: 18px; }
    .node-title { fill: #f8fafc; font-size: 13px; font-weight: 700; font-family: -apple-system, sans-serif; }
    .node-subtitle { fill: #94a3b8; font-size: 10px; font-family: -apple-system, sans-serif; }
    .pin { fill: #38bdf8; stroke: #0f172a; stroke-width: 2; }
    .studio-footer { display: flex; gap: 24px; margin-top: 14px; font-size: 12px; color: #64748b; }
  `]
})
export class WorkflowStudioComponent {
  panX = signal(120);
  panY = signal(60);
  scale = signal(0.95);

  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private draggedNode: WorkflowNode | null = null;
  private nodeOffsetX = 0;
  private nodeOffsetY = 0;

  nodes = signal<WorkflowNode[]>([
    { id: 'n1', type: 'trigger', title: 'Customer Sign Up', subtitle: 'Event: auth.registered', x: 260, y: 40, icon: '⚡', color: '#3b82f6' },
    { id: 'n2', type: 'condition', title: 'Tier Check', subtitle: 'Rule: ltv >= $10,000', x: 260, y: 170, icon: '🔀', color: '#f59e0b' },
    { id: 'n3', type: 'action', title: 'Assign VIP Account Manager', subtitle: 'CRM Action: assign_agent', x: 80, y: 310, icon: '👔', color: '#10b981' },
    { id: 'n4', type: 'action', title: 'Send Standard Welcome Email', subtitle: 'Email Service: template_v1', x: 440, y: 310, icon: '📧', color: '#6366f1' },
    { id: 'n5', type: 'delay', title: 'Wait 3 Days', subtitle: 'Timer: delay_72h', x: 260, y: 440, icon: '⏳', color: '#ec4899' },
  ]);

  edges = signal<WorkflowEdge[]>([
    { id: 'e1', from: 'n1', to: 'n2', label: 'Trigger' },
    { id: 'e2', from: 'n2', to: 'n3', label: 'True (VIP)' },
    { id: 'e3', from: 'n2', to: 'n4', label: 'False (Standard)' },
    { id: 'e4', from: 'n3', to: 'n5' },
    { id: 'e5', from: 'n4', to: 'n5' },
  ]);

  onMouseDown(e: MouseEvent) {
    if (e.target instanceof SVGElement && e.target.closest('.flow-node')) return;
    this.isPanning = true;
    this.panStartX = e.clientX - this.panX();
    this.panStartY = e.clientY - this.panY();
  }

  onMouseMove(e: MouseEvent) {
    if (this.isPanning) {
      this.panX.set(e.clientX - this.panStartX);
      this.panY.set(e.clientY - this.panStartY);
    } else if (this.draggedNode) {
      const s = this.scale();
      this.draggedNode.x = Math.round((e.clientX - this.panX()) / s - this.nodeOffsetX);
      this.draggedNode.y = Math.round((e.clientY - this.panY()) / s - this.nodeOffsetY);
    }
  }

  onMouseUp() {
    this.isPanning = false;
    this.draggedNode = null;
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.max(0.4, Math.min(2.5, this.scale() * zoomFactor));
    this.scale.set(newScale);
  }

  startDragNode(e: MouseEvent, node: WorkflowNode) {
    e.stopPropagation();
    this.draggedNode = node;
    const s = this.scale();
    this.nodeOffsetX = (e.clientX - this.panX()) / s - node.x;
    this.nodeOffsetY = (e.clientY - this.panY()) / s - node.y;
  }

  resetView() {
    this.panX.set(120);
    this.panY.set(60);
    this.scale.set(0.95);
  }

  addNode() {
    const id = `n${this.nodes().length + 1}`;
    const newNode: WorkflowNode = {
      id,
      type: 'action',
      title: `Webhook Notification ${id}`,
      subtitle: 'HTTP: POST /webhook/notify',
      x: 300,
      y: 200,
      icon: '🌐',
      color: '#06b6d4'
    };
    this.nodes.update(list => [...list, newNode]);
  }

  computeBezierPath(edge: WorkflowEdge): string {
    const fromNode = this.nodes().find(n => n.id === edge.from);
    const toNode = this.nodes().find(n => n.id === edge.to);
    if (!fromNode || !toNode) return '';

    const startX = fromNode.x + 105;
    const startY = fromNode.y + 84;
    const endX = toNode.x + 105;
    const endY = toNode.y;

    const dy = Math.abs(endY - startY) * 0.5;
    return `M ${startX},${startY} C ${startX},${startY + dy} ${endX},${endY - dy} ${endX},${endY}`;
  }

  computeEdgeMid(edge: WorkflowEdge): { x: number; y: number } {
    const fromNode = this.nodes().find(n => n.id === edge.from);
    const toNode = this.nodes().find(n => n.id === edge.to);
    if (!fromNode || !toNode) return { x: 0, y: 0 };
    return {
      x: (fromNode.x + toNode.x) / 2 + 105,
      y: (fromNode.y + toNode.y) / 2 + 42
    };
  }

  simulateRun() {
    const sequence = ['n1', 'n2', 'n3', 'n5'];
    let idx = 0;

    const interval = setInterval(() => {
      if (idx >= sequence.length) {
        clearInterval(interval);
        this.nodes().forEach(n => n.status = 'idle');
        this.edges().forEach(e => e.active = false);
        return;
      }

      const activeId = sequence[idx];
      this.nodes().forEach(n => n.status = (n.id === activeId ? 'running' : 'idle'));
      this.edges().forEach(e => e.active = (e.from === sequence[idx - 1] && e.to === activeId));
      idx++;
    }, 700);
  }
}
