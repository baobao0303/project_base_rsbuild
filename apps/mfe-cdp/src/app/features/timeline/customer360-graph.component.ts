import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GraphNode {
  id: string;
  label: string;
  sublabel: string;
  type: 'customer' | 'deal' | 'invoice' | 'ticket';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isDragging?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

@Component({
  selector: 'cdp-customer360-graph',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="graph-card">
      <div class="graph-header">
        <div>
          <h3>Customer 360 Entity Relationship Force-Directed Graph</h3>
          <span class="subtext">Widescreen distributed topology with interactive drag & drop physics</span>
        </div>
        <div class="legend">
          <span class="legend-badge customer"><i class="dot"></i> Customer</span>
          <span class="legend-badge deal"><i class="dot"></i> Deals</span>
          <span class="legend-badge invoice"><i class="dot"></i> Invoices</span>
          <span class="legend-badge ticket"><i class="dot"></i> Tickets</span>
        </div>
      </div>

      <div class="canvas-wrapper">
        <canvas #canvas
          (mousedown)="onMouseDown($event)"
          (mousemove)="onMouseMove($event)"
          (mouseup)="onMouseUp()"
          (mouseleave)="onMouseUp()">
        </canvas>
        <div class="canvas-hint">💡 Drag any entity node to interact</div>
      </div>

      <div class="graph-footer">
        <div class="stats-item">
          <span class="stat-num">{{ nodes().length }}</span>
          <span class="stat-label">Entities</span>
        </div>
        <div class="stats-item">
          <span class="stat-num">{{ links().length }}</span>
          <span class="stat-label">Relations</span>
        </div>
        <div class="stats-item">
          <span class="stat-num">Widescreen Elliptical</span>
          <span class="stat-label">Topology</span>
        </div>
        <div class="stats-item">
          <span class="stat-num">Interactive</span>
          <span class="stat-label">Drag & Physics</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .graph-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .graph-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .graph-header h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    .subtext { font-size: 13px; color: #64748b; }
    .legend { display: flex; gap: 8px; flex-wrap: wrap; }
    .legend-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 20px;
      background: #f1f5f9;
      color: #334155;
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .legend-badge.customer .dot { background: #3b82f6; }
    .legend-badge.deal .dot { background: #10b981; }
    .legend-badge.invoice .dot { background: #f97316; }
    .legend-badge.ticket .dot { background: #ef4444; }

    .canvas-wrapper {
      border: 1px solid #1e293b;
      border-radius: 12px;
      overflow: hidden;
      background: #090d16;
      box-shadow: inset 0 2px 10px rgba(0,0,0,0.7);
      width: 100%;
      height: 600px;
      position: relative;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: grab;
    }
    canvas:active {
      cursor: grabbing;
    }
    .canvas-hint {
      position: absolute;
      bottom: 16px;
      right: 16px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      font-size: 11px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 6px;
      pointer-events: none;
    }
    .graph-footer {
      display: flex;
      gap: 36px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }
    .stats-item { display: flex; flex-direction: column; }
    .stat-num { font-size: 14px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
  `]
})
export class Customer360GraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  nodes = signal<GraphNode[]>([]);
  links = signal<GraphLink[]>([]);
  private draggedNode: GraphNode | null = null;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private animTime = 0;

  ngAfterViewInit() {
    this.setupCanvasSize();
    this.initGraphData();
    this.startSimulation();
  }

  ngOnDestroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  setupCanvasSize() {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    const setSize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      this.initGraphData(); // Re-center and re-spread nicely on window resize
    };

    setSize();
    this.resizeObserver = new ResizeObserver(() => setSize());
    this.resizeObserver.observe(parent);
  }

  initGraphData() {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr || 1200;
    const h = canvas.height / dpr || 600;
    const cx = w / 2;
    const cy = h / 2;

    // Use full width & height for widescreen distribution
    const rx = Math.min(w * 0.38, 520);
    const ry = Math.min(h * 0.34, 190);

    const rawNodes: GraphNode[] = [
      { id: 'c1', label: 'Vingroup Corp', sublabel: 'Enterprise VIP', type: 'customer', x: cx, y: cy, vx: 0, vy: 0, radius: 32, color: '#3b82f6' },
      // Top left
      { id: 'd1', label: 'ERP Upgrade', sublabel: '$1,200,000', type: 'deal', x: cx - rx * 0.72, y: cy - ry * 0.78, vx: 0, vy: 0, radius: 24, color: '#10b981' },
      // Top right
      { id: 'd2', label: 'Cloud Migration', sublabel: '$450,000', type: 'deal', x: cx + rx * 0.72, y: cy - ry * 0.78, vx: 0, vy: 0, radius: 24, color: '#10b981' },
      // Far left
      { id: 'i1', label: 'INV-2026-0819', sublabel: 'Paid $600K', type: 'invoice', x: cx - rx * 0.95, y: cy + ry * 0.1, vx: 0, vy: 0, radius: 22, color: '#f97316' },
      // Bottom left (ample clearance from bottom)
      { id: 'i2', label: 'INV-2026-0902', sublabel: 'Pending $450K', type: 'invoice', x: cx - rx * 0.48, y: cy + ry * 0.75, vx: 0, vy: 0, radius: 22, color: '#f97316' },
      // Bottom right (ample clearance from bottom)
      { id: 't1', label: 'API Gateway Timeout', sublabel: 'P1 Escalated', type: 'ticket', x: cx + rx * 0.48, y: cy + ry * 0.75, vx: 0, vy: 0, radius: 22, color: '#ef4444' },
      // Far right
      { id: 't2', label: 'SSO Auth Sync Error', sublabel: 'Resolved', type: 'ticket', x: cx + rx * 0.95, y: cy + ry * 0.1, vx: 0, vy: 0, radius: 22, color: '#ef4444' },
    ];

    const rawLinks: GraphLink[] = [
      { source: 'c1', target: 'd1', label: 'Contract' },
      { source: 'c1', target: 'd2', label: 'Contract' },
      { source: 'c1', target: 'i1', label: 'Billed' },
      { source: 'c1', target: 'i2', label: 'Billed' },
      { source: 'c1', target: 't1', label: 'Incident' },
      { source: 'c1', target: 't2', label: 'Incident' },
      { source: 'd1', target: 'i1', label: 'Milestone 1' },
      { source: 'd2', target: 't2', label: 'Integration' },
    ];

    this.nodes.set(rawNodes);
    this.links.set(rawLinks);
  }

  onMouseDown(e: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const hit = this.nodes().find(n => {
      const dx = n.x - mx;
      const dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 8;
    });

    if (hit) {
      this.draggedNode = hit;
      hit.isDragging = true;
    }
  }

  onMouseMove(e: MouseEvent) {
    if (!this.draggedNode) return;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.draggedNode.x = Math.max(80, Math.min(rect.width - 80, e.clientX - rect.left));
    this.draggedNode.y = Math.max(60, Math.min(rect.height - 60, e.clientY - rect.top));
  }

  onMouseUp() {
    if (this.draggedNode) {
      this.draggedNode.isDragging = false;
      this.draggedNode = null;
    }
  }

  startSimulation() {
    const canvas = this.canvasRef.nativeElement;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const ctx = canvas.getContext('2d');

      if (!ctx || w === 0 || h === 0) {
        this.animationFrameId = requestAnimationFrame(render);
        return;
      }

      this.animTime += 0.02;
      ctx.clearRect(0, 0, w, h);

      // Subtle high-tech grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const currentNodes = this.nodes();
      const nodeMap = new Map(currentNodes.map(n => [n.id, n]));

      // Draw connection links with animated traveling pulses
      this.links().forEach((link, idx) => {
        const s = nodeMap.get(link.source);
        const t = nodeMap.get(link.target);
        if (!s || !t) return;

        // Base line
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Traveling pulse particle along line
        const progress = (this.animTime * 0.8 + idx * 0.3) % 1;
        const px = s.x + (t.x - s.x) * progress;
        const py = s.y + (t.y - s.y) * progress;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa';
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Pill badge for relationship label
        const mx = (s.x + t.x) / 2;
        const my = (s.y + t.y) / 2;
        const text = link.label;
        ctx.font = '500 10px sans-serif';
        const metrics = ctx.measureText(text);
        const padX = 6;
        const padY = 3;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(mx - metrics.width / 2 - padX, my - 7 - padY, metrics.width + padX * 2, 14 + padY * 2, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, mx, my);
      });

      // Draw nodes
      currentNodes.forEach(node => {
        // Enforce safe boundary
        node.x = Math.max(90, Math.min(w - 90, node.x));
        node.y = Math.max(70, Math.min(h - 70, node.y));

        // Center customer pulsing aura rings
        if (node.type === 'customer') {
          const aura1 = node.radius + 8 + Math.sin(this.animTime * 2) * 5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, aura1, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          const aura2 = node.radius + 16 + Math.sin(this.animTime * 2 + 1) * 6;
          ctx.beginPath();
          ctx.arc(node.x, node.y, aura2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Node sphere with neon glow
        ctx.save();
        ctx.shadowColor = node.color;
        ctx.shadowBlur = node.isDragging ? 22 : 14;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = node.isDragging ? 3.5 : 2.5;
        ctx.stroke();
        ctx.restore();

        // Node label positioning (always inside safe canvas area)
        const labelY = node.y > h - 90 ? node.y - node.radius - 20 : node.y + node.radius + 16;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(node.label, node.x, labelY);

        if (node.sublabel) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '500 10px sans-serif';
          ctx.fillText(node.sublabel, node.x, labelY + 13);
        }
        ctx.shadowBlur = 0;
      });

      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }
}
