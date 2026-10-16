import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'cdp-digital-twin-3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="twin-card">
      <div class="twin-header">
        <div>
          <h3>3D WebGL Spatial Digital Twin & Telemetry Sphere</h3>
          <span class="subtext">Realtime Three.js WebGL scene with 10,000 GPU-accelerated particles & GLSL wave shaders</span>
        </div>
        <div class="stats-badge">
          <span>Active Particles: <strong>10,000</strong></span>
          <span>Engine: <strong>Three.js r{{ threeRevision }} (WebGL2)</strong></span>
        </div>
      </div>

      <div class="canvas-viewport" #container>
        <canvas #canvas></canvas>
        <div class="hud-overlay">
          <div class="hud-item">
            <span class="hud-label">FPS</span>
            <span class="hud-val">{{ fps() }}</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">FOV</span>
            <span class="hud-val">60°</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Shaders</span>
            <span class="hud-val">Custom GLSL</span>
          </div>
        </div>
      </div>

      <div class="twin-footer">
        <span>💡 Left-click drag to rotate camera orbit | Mousewheel to zoom in/out</span>
      </div>
    </div>
  `,
  styles: [`
    .twin-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .twin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
    .twin-header h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a; }
    .subtext { font-size: 13px; color: #64748b; }
    .stats-badge { display: flex; gap: 16px; font-size: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 6px 14px; border-radius: 6px; }
    .canvas-viewport { position: relative; width: 100%; height: 560px; background: #030712; border-radius: 10px; overflow: hidden; border: 1px solid #1f2937; }
    canvas { width: 100%; height: 100%; display: block; cursor: grab; }
    canvas:active { cursor: grabbing; }
    .hud-overlay { position: absolute; top: 16px; left: 16px; display: flex; gap: 12px; pointer-events: none; }
    .hud-item { background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 6px 12px; display: flex; flex-direction: column; }
    .hud-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; }
    .hud-val { font-size: 13px; font-weight: 700; color: #38bdf8; font-family: monospace; }
    .twin-footer { margin-top: 14px; font-size: 12px; color: #64748b; }
  `]
})
export class DigitalTwin3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  threeRevision = THREE.REVISION;
  fps = signal(60);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private particleSystem!: THREE.Points;
  private globeWireframe!: THREE.Mesh;
  private animId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private isDragging = false;
  private prevMouseX = 0;
  private prevMouseY = 0;
  private targetRotationX = 0;
  private targetRotationY = 0;
  private currentRotationX = 0;
  private currentRotationY = 0;

  ngAfterViewInit() {
    this.initThreeScene();
    this.setupInteraction();
  }

  ngOnDestroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.renderer?.dispose();
  }

  private initThreeScene() {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030712, 0.0015);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.z = 240;

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. 10,000 Spatial Particles with Custom GLSL Shader Material
    const particleCount = 10000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const radius = 90;
    for (let i = 0; i < particleCount; i++) {
      // Golden ratio Fibonacci sphere distribution
      const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const r = radius + (Math.random() - 0.5) * 25;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color palette: Cyan, Electric Blue, Amber
      const colorType = i % 3;
      if (colorType === 0) {
        colors[i * 3] = 0.22; colors[i * 3 + 1] = 0.74; colors[i * 3 + 2] = 0.97; // #38bdf8
      } else if (colorType === 1) {
        colors[i * 3] = 0.23; colors[i * 3 + 1] = 0.51; colors[i * 3 + 2] = 0.96; // #3b82f6
      } else {
        colors[i * 3] = 0.96; colors[i * 3 + 1] = 0.62; colors[i * 3 + 2] = 0.04; // #f59e0b
      }

      scales[i] = 2.0 + Math.random() * 3.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Custom GLSL Shader Material
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        uniform float time;
        attribute float scale;
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec3 p = position;
          // Sine wave displacement
          p.x += sin(p.y * 0.05 + time) * 3.0;
          p.y += cos(p.z * 0.05 + time) * 3.0;
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = scale * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          // Circular particle shape with soft glow falloff
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, dist);
          gl_FragColor = vec4(vColor, alpha * 0.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(geometry, shaderMaterial);
    this.scene.add(this.particleSystem);

    // 4. Wireframe Icosahedron Inner Core
    const globeGeo = new THREE.IcosahedronGeometry(70, 4);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    this.globeWireframe = new THREE.Mesh(globeGeo, globeMat);
    this.scene.add(this.globeWireframe);

    // 5. Start Render Loop
    this.startLoop();
  }

  private startLoop() {
    let lastTime = performance.now();
    let frameCount = 0;
    let clock = 0;

    const animate = () => {
      this.animId = requestAnimationFrame(animate);
      clock += 0.015;

      // Update shader uniforms
      const mat = this.particleSystem.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms['time'].value = clock;
      }

      // Smooth inertia rotation
      this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;
      this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;

      this.particleSystem.rotation.y = this.currentRotationX + clock * 0.15;
      this.particleSystem.rotation.x = this.currentRotationY;

      this.globeWireframe.rotation.y = this.currentRotationX + clock * 0.1;
      this.globeWireframe.rotation.x = this.currentRotationY;

      this.renderer.render(this.scene, this.camera);

      // FPS counter
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        this.fps.set(frameCount);
        frameCount = 0;
        lastTime = now;
      }
    };

    animate();
  }

  private setupInteraction() {
    const canvas = this.canvasRef.nativeElement;

    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;

      this.targetRotationX += deltaX * 0.006;
      this.targetRotationY += deltaY * 0.006;

      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camera.position.z = Math.max(120, Math.min(450, this.camera.position.z + e.deltaY * 0.2));
    }, { passive: false });

    // Handle container resize
    this.resizeObserver = new ResizeObserver(() => {
      const container = this.containerRef.nativeElement;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }
}
