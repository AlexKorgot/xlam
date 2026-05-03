import gsap from 'gsap';
import * as THREE from 'three';
import { VideoPlane, type VideoPlaneLayout } from './VideoPlane';
import type { CinematicSlide, SliderSceneCallbacks } from './types';

type SliderSceneOptions = SliderSceneCallbacks & {
  slides: CinematicSlide[];
  reducedMotion: boolean;
};

type PosterTexture = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  texture: THREE.Texture;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const SLIDER_ASPECT = 16 / 9;

function wrapIndex(index: number, total: number) {
  return (index + total) % total;
}

function shortestOffset(index: number, activeIndex: number, total: number) {
  let offset = index - activeIndex;
  const half = Math.floor(total / 2);

  if (offset > half) offset -= total;
  if (offset < -half) offset += total;

  return offset;
}

function drawFallbackPoster(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, color: string, index: number) {
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#151c21');
  gradient.addColorStop(0.3, '#24313a');
  gradient.addColorStop(0.56, color);
  gradient.addColorStop(0.78, '#19161f');
  gradient.addColorStop(1, '#030303');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.2;
  context.fillStyle = '#fff5d0';

  for (let i = 0; i < 10; i += 1) {
    const x = ((i * 151 + index * 109) % canvas.width) - 80;
    const h = 170 + ((i + index) % 5) * 54;
    context.fillRect(x, 90 + ((i * 47) % 220), 28 + ((i + index) % 3) * 20, h);
  }

  context.globalAlpha = 0.36;
  context.fillStyle = '#000000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 1;
}

function drawVideoPoster(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  const videoWidth = video.videoWidth || 16;
  const videoHeight = video.videoHeight || 9;
  const scale = Math.max(canvas.width / videoWidth, canvas.height / videoHeight);
  const width = videoWidth * scale;
  const height = videoHeight * scale;
  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) / 2;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(video, x, y, width, height);
}

function createPosterTexture(THREERef: typeof THREE, color: string, index: number): PosterTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 576;

  const context = canvas.getContext('2d');

  if (context) {
    drawFallbackPoster(context, canvas, color, index);
  }

  const texture = new THREERef.CanvasTexture(canvas);
  texture.colorSpace = THREERef.SRGBColorSpace;
  texture.minFilter = THREERef.LinearFilter;
  texture.magFilter = THREERef.LinearFilter;
  texture.generateMipmaps = false;

  return { canvas, context, texture };
}

export class SliderScene {
  private readonly container: HTMLElement;
  private readonly callbacks: SliderSceneOptions;
  private readonly slides: CinematicSlide[];
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(38, 1, 10, 5000);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly viewport = new THREE.Vector2(1, 1);
  private readonly mediaSize = new THREE.Vector2(16, 9);
  private readonly startTime = performance.now();
  private readonly planes: VideoPlane[] = [];
  private readonly posterTextures: PosterTexture[] = [];
  private readonly activeVideo: HTMLVideoElement;
  private readonly activeTexture: THREE.VideoTexture;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private timeline: gsap.core.Timeline | null = null;
  private rafId: number | null = null;
  private activeIndex = 0;
  private isVisible = true;
  private isDestroyed = false;
  private hasCapturedVideoPosters = false;
  private mode: 'slider' | 'opening' | 'opened' | 'closing' = 'slider';
  private readonly reducedMotion: boolean;

  constructor(container: HTMLElement, options: SliderSceneOptions) {
    this.container = container;
    this.callbacks = options;
    this.slides = options.slides;
    this.reducedMotion = options.reducedMotion;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.width = '100%';
    this.container.appendChild(this.renderer.domElement);

    this.activeVideo = this.createActiveVideo(this.slides[0].videoSrc);
    this.activeTexture = new THREE.VideoTexture(this.activeVideo);
    this.activeTexture.colorSpace = THREE.SRGBColorSpace;
    this.activeTexture.minFilter = THREE.LinearFilter;
    this.activeTexture.magFilter = THREE.LinearFilter;
    this.activeTexture.generateMipmaps = false;

    this.slides.forEach((slide, index) => {
      const posterTexture = createPosterTexture(THREE, slide.accent, index);
      const plane = new VideoPlane(index === 0 ? this.activeTexture : posterTexture.texture, this.viewport);

      plane.mesh.renderOrder = index === 0 ? 10 : 1;
      plane.setActive(index === 0);
      this.posterTextures.push(posterTexture);
      this.planes.push(plane);
      this.scene.add(plane.mesh);
    });

    this.resize();
    this.bindObservers();
    this.start();
    void this.playActiveVideo();
  }

  getCanvasElement() {
    return this.renderer.domElement;
  }

  getActiveIndex() {
    return this.activeIndex;
  }

  handlePointer(clientX: number, clientY: number) {
    if (this.mode !== 'slider') {
      return;
    }

    const rect = this.container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const layout = this.getLayoutForOffset(0);
    const centerX = rect.width / 2 + layout.x;
    const centerY = rect.height / 2 - layout.y;
    const insideActive =
      Math.abs(x - centerX) <= layout.width / 2 &&
      Math.abs(y - centerY) <= layout.height / 2;

    if (insideActive) {
      this.open();
      return;
    }

    if (x < rect.width / 2) {
      this.setActiveIndex(this.activeIndex - 1);
    } else {
      this.setActiveIndex(this.activeIndex + 1);
    }
  }

  setActiveIndex(index: number) {
    if (this.mode !== 'slider') {
      return;
    }

    this.activeIndex = wrapIndex(index, this.slides.length);
    this.assignActiveTexture();
    this.callbacks.onActiveSlideChange?.(this.activeIndex);
    this.animateSliderLayout();
  }

  next() {
    this.setActiveIndex(this.activeIndex + 1);
  }

  previous() {
    this.setActiveIndex(this.activeIndex - 1);
  }

  open() {
    if (this.mode !== 'slider') {
      return;
    }

    this.mode = 'opening';
    this.callbacks.onOverlayStateChange?.('opening');
    this.timeline?.kill();
    void this.playActiveVideo();

    const duration = this.reducedMotion ? 0.01 : 1.35;
    const activePlane = this.planes[this.activeIndex];
    activePlane.mesh.renderOrder = 20;

    this.timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut', overwrite: 'auto' },
      onComplete: () => {
        this.mode = 'opened';
        this.callbacks.onOverlayStateChange?.('opened');
      },
    });

    this.planes.forEach((plane, index) => {
      if (index === this.activeIndex) {
        this.timeline?.to(
          plane.mesh.position,
          { x: 0, y: 0, z: 0, duration },
          0,
        );
        this.timeline?.to(
          plane.mesh.rotation,
          { x: 0, y: 0, z: 0, duration },
          0,
        );
        this.timeline?.to(
          plane.uniforms.uPlaneSize.value,
          { x: this.viewport.x, y: this.viewport.y, duration },
          0,
        );
        this.timeline?.to(
          plane.uniforms.uTransitionProgress,
          { value: 1, duration: duration * 0.82 },
          0,
        );
        this.timeline?.to(
          plane.uniforms.uBend,
          { value: 0, duration: duration * 0.68 },
          0,
        );
        this.timeline?.to(
          plane.uniforms.uDarkness,
          { value: 0.22, duration },
          0,
        );
        return;
      }

      this.timeline?.to(
        plane.uniforms.uOpacity,
        { value: 0, duration: duration * 0.54, ease: 'power2.out' },
        0.06,
      );
      this.timeline?.to(
        plane.mesh.position,
        { x: plane.mesh.position.x * 1.08, z: -180, duration: duration * 0.74 },
        0,
      );
    });
  }

  close() {
    if (this.mode !== 'opened') {
      return;
    }

    this.mode = 'closing';
    this.callbacks.onOverlayStateChange?.('closing');
    this.timeline?.kill();

    const duration = this.reducedMotion ? 0.01 : 1.18;
    this.timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut', overwrite: 'auto' },
      onComplete: () => {
        this.mode = 'slider';
        this.callbacks.onOverlayStateChange?.('slider');
        this.applySliderLayout();
      },
    });

    this.planes.forEach((plane, index) => {
      const offset = shortestOffset(index, this.activeIndex, this.slides.length);
      const layout = this.getLayoutForOffset(offset);

      plane.mesh.renderOrder = offset === 0 ? 10 : 5 - Math.abs(offset);
      this.timeline?.to(plane.mesh.position, { x: layout.x, y: layout.y, z: layout.z, duration }, 0.08);
      this.timeline?.to(plane.mesh.rotation, { x: 0, y: layout.rotationY, z: 0, duration }, 0.08);
      this.timeline?.to(plane.uniforms.uPlaneSize.value, { x: layout.width, y: layout.height, duration }, 0.08);
      this.timeline?.to(plane.uniforms.uTransitionProgress, { value: 0, duration: duration * 0.72 }, 0.08);
      this.timeline?.to(plane.uniforms.uBend, { value: layout.bend, duration: duration * 0.72 }, 0.16);
      this.timeline?.to(plane.uniforms.uOpacity, { value: layout.opacity, duration: duration * 0.7, ease: 'power2.out' }, 0.18);
      this.timeline?.to(plane.uniforms.uDarkness, { value: layout.darkness, duration }, 0.08);
      this.timeline?.to(plane.uniforms.uVelocity, { value: layout.velocity, duration }, 0.08);
    });
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const isMobile = width < 760;
    const maxDpr = isMobile || this.reducedMotion ? 1.25 : 1.75;
    const dpr = clamp(window.devicePixelRatio || 1, 1, maxDpr);

    this.viewport.set(width, height);
    this.camera.aspect = width / height;
    this.camera.position.set(0, 0, this.getCameraZ(height));
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);

    this.planes.forEach((plane) => {
      plane.uniforms.uViewportSize.value.copy(this.viewport);
    });

    if (this.mode === 'opened' || this.mode === 'opening') {
      const activePlane = this.planes[this.activeIndex];
      activePlane.uniforms.uPlaneSize.value.copy(this.viewport);
      activePlane.mesh.position.set(0, 0, 0);
      activePlane.mesh.rotation.set(0, 0, 0);
      return;
    }

    this.applySliderLayout();
  }

  dispose() {
    this.isDestroyed = true;
    this.timeline?.kill();

    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
    }

    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    this.planes.forEach((plane) => {
      this.scene.remove(plane.mesh);
      plane.dispose(false);
    });
    this.posterTextures.forEach(({ texture }) => texture.dispose());
    this.activeTexture.dispose();
    this.activeVideo.pause();
    this.activeVideo.removeAttribute('src');
    this.activeVideo.load();
    this.renderer.dispose();
    this.renderer.forceContextLoss();

    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }

  private createActiveVideo(src: string) {
    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';

    video.addEventListener('loadedmetadata', () => {
      this.mediaSize.set(video.videoWidth || 16, video.videoHeight || 9);
      this.planes[this.activeIndex]?.setTexture(this.activeTexture, this.mediaSize);
    });

    return video;
  }

  private async playActiveVideo() {
    try {
      await this.activeVideo.play();
    } catch {
      this.callbacks.onAutoplayBlocked?.();
    }
  }

  private assignActiveTexture() {
    this.planes.forEach((plane, index) => {
      const isActive = index === this.activeIndex;
      plane.setActive(isActive);
      plane.mesh.renderOrder = isActive ? 10 : 1;
      plane.setTexture(isActive ? this.activeTexture : this.posterTextures[index].texture, isActive ? this.mediaSize : new THREE.Vector2(16, 9));
    });
  }

  private captureVideoPosters() {
    if (this.hasCapturedVideoPosters || this.activeVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }

    try {
      this.posterTextures.forEach(({ canvas, context, texture }) => {
        if (!context) {
          return;
        }

        drawVideoPoster(context, canvas, this.activeVideo);
        texture.needsUpdate = true;
      });
      this.hasCapturedVideoPosters = true;
    } catch {
      this.hasCapturedVideoPosters = true;
    }
  }

  private bindObservers() {
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.container);

    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.isVisible = entry?.isIntersecting ?? true;

        if (this.isVisible) {
          this.start();
          void this.playActiveVideo();
        } else {
          this.activeVideo.pause();
        }
      },
      { threshold: 0.08 },
    );
    this.intersectionObserver.observe(this.container);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.activeVideo.pause();
      return;
    }

    if (this.isVisible) {
      void this.playActiveVideo();
      this.start();
    }
  };

  private start() {
    if (this.rafId !== null || this.isDestroyed) {
      return;
    }

    const render = () => {
      if (this.isDestroyed) {
        return;
      }

      if (!this.isVisible || document.hidden) {
        this.rafId = null;
        return;
      }

      const elapsed = (performance.now() - this.startTime) * 0.001;
      this.captureVideoPosters();
      this.planes.forEach((plane) => {
        plane.uniforms.uTime.value = elapsed;
      });
      this.renderer.render(this.scene, this.camera);
      this.rafId = window.requestAnimationFrame(render);
    };

    this.rafId = window.requestAnimationFrame(render);
  }

  private getLayoutForOffset(offset: number): VideoPlaneLayout {
    const width = this.viewport.x;
    const isMobile = width < 760;
    const absOffset = Math.abs(offset);
    const activeWidth = isMobile ? width * 0.78 : Math.min(width * 0.62, 980);
    const activeHeight = activeWidth / SLIDER_ASPECT;
    const sideWidth = activeWidth * (isMobile ? 0.68 : 0.62);
    const sideHeight = sideWidth / SLIDER_ASPECT;
    const bandY = isMobile ? -8 : -18;

    if (offset === 0) {
      return {
        x: 0,
        y: bandY,
        z: 0,
        width: activeWidth,
        height: activeHeight,
        rotationY: 0,
        bend: isMobile ? 10 : 16,
        opacity: 1,
        darkness: 0,
        velocity: 0,
      };
    }

    if (absOffset === 1) {
      const direction = Math.sign(offset);
      const sideX = direction * (activeWidth * 0.5 + sideWidth * (isMobile ? 0.08 : 0.04));

      return {
        x: sideX,
        y: bandY + (isMobile ? 2 : -6),
        z: isMobile ? -34 : -58,
        width: sideWidth,
        height: sideHeight,
        rotationY: direction * -0.12,
        bend: isMobile ? 8 : 12,
        opacity: isMobile ? 0.62 : 0.74,
        darkness: 0.32,
        velocity: 0,
      };
    }

    return {
      x: Math.sign(offset) * (activeWidth * 0.86 + sideWidth),
      y: bandY,
      z: -220,
      width: sideWidth,
      height: sideHeight,
      rotationY: 0,
      bend: 0,
      opacity: 0,
      darkness: 0.6,
      velocity: 0,
    };
  }

  private getCameraZ(height: number) {
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);

    return height / 2 / Math.tan(halfFov);
  }

  private applySliderLayout() {
    this.planes.forEach((plane, index) => {
      const offset = shortestOffset(index, this.activeIndex, this.slides.length);
      plane.applyLayout(this.getLayoutForOffset(offset));
      plane.mesh.renderOrder = offset === 0 ? 10 : 5 - Math.abs(offset);
    });
  }

  private animateSliderLayout() {
    this.timeline?.kill();
    this.timeline = gsap.timeline({
      defaults: {
        duration: this.reducedMotion ? 0.01 : 0.82,
        ease: 'power3.inOut',
        overwrite: 'auto',
      },
    });

    this.planes.forEach((plane, index) => {
      const offset = shortestOffset(index, this.activeIndex, this.slides.length);
      const layout = this.getLayoutForOffset(offset);
      plane.mesh.renderOrder = offset === 0 ? 10 : 5 - Math.abs(offset);
      this.timeline?.to(plane.mesh.position, { x: layout.x, y: layout.y, z: layout.z }, 0);
      this.timeline?.to(plane.mesh.rotation, { y: layout.rotationY }, 0);
      this.timeline?.to(plane.uniforms.uPlaneSize.value, { x: layout.width, y: layout.height }, 0);
      this.timeline?.to(plane.uniforms.uBend, { value: layout.bend }, 0);
      this.timeline?.to(plane.uniforms.uOpacity, { value: layout.opacity }, 0);
      this.timeline?.to(plane.uniforms.uDarkness, { value: layout.darkness }, 0);
      this.timeline?.to(plane.uniforms.uVelocity, { value: layout.velocity }, 0);
    });
  }
}
