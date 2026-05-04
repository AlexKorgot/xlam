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

const SLIDER_ASPECT = 16 / 6.6;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;
const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);
const smoothstep = (value: number) => value * value * (3 - 2 * value);

function wrapIndex(index: number, total: number) {
  return ((index % total) + total) % total;
}

function centeredOffset(index: number, position: number, total: number) {
  let offset = index - position;
  const half = total / 2;

  while (offset > half) offset -= total;
  while (offset < -half) offset += total;

  return offset;
}

function drawFallbackPoster(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  color: string,
  index: number,
) {
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#080b0f');
  gradient.addColorStop(0.24, '#16282d');
  gradient.addColorStop(0.52, color);
  gradient.addColorStop(0.74, '#182028');
  gradient.addColorStop(1, '#020202');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 0.18;
  context.fillStyle = '#f3f6e9';

  for (let i = 0; i < 14; i += 1) {
    const x = ((i * 143 + index * 97) % canvas.width) - 70;
    const y = 74 + ((i * 53 + index * 41) % 310);
    const width = 26 + ((i + index) % 4) * 18;
    const height = 150 + ((i + index) % 6) * 38;
    context.fillRect(x, y, width, height);
  }

  context.globalAlpha = 0.55;
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

function createPosterTexture(color: string, index: number): PosterTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 576;

  const context = canvas.getContext('2d');

  if (context) {
    drawFallbackPoster(context, canvas, color, index);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
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
  private activeTextureIndex = 0;
  private slidePosition = 0;
  private slideVelocity = 0;
  private isVisible = true;
  private isDestroyed = false;
  private hasSeededPosterTextures = false;
  private mode: 'slider' | 'sliding' | 'opening' | 'opened' | 'closing' = 'slider';
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
      const posterTexture = createPosterTexture(slide.accent, index);
      const plane = new VideoPlane(index === 0 ? this.activeTexture : posterTexture.texture, this.viewport);

      plane.mesh.renderOrder = index === 0 ? 20 : 5;
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
      this.previous();
      return;
    }

    this.next();
  }

  next() {
    this.slideTo(1);
  }

  previous() {
    this.slideTo(-1);
  }

  open() {
    if (this.mode !== 'slider') {
      return;
    }

    this.mode = 'opening';
    this.callbacks.onOverlayStateChange?.('opening');
    this.timeline?.kill();
    this.capturePosterForIndex(this.activeIndex);
    this.assignActiveTexture(this.activeIndex);
    void this.playActiveVideo();

    const duration = this.reducedMotion ? 0.01 : 1.28;
    const activePlane = this.planes[this.activeIndex];
    activePlane.mesh.renderOrder = 30;

    this.timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut', overwrite: 'auto' },
      onComplete: () => {
        this.mode = 'opened';
        this.callbacks.onOverlayStateChange?.('opened');
      },
    });

    this.planes.forEach((plane, index) => {
      if (index === this.activeIndex) {
        this.timeline?.to(plane.mesh.position, { x: 0, y: 0, z: 0, duration }, 0);
        this.timeline?.to(plane.mesh.rotation, { x: 0, y: 0, z: 0, duration }, 0);
        this.timeline?.to(
          plane.scaleState,
          { x: 1, y: 1, duration, onUpdate: () => plane.setScale(plane.scaleState.x, plane.scaleState.y) },
          0,
        );
        this.timeline?.to(plane.uniforms.uPlaneSize.value, { x: this.viewport.x, y: this.viewport.y, duration }, 0);
        this.timeline?.to(plane.uniforms.uTransitionProgress, { value: 1, duration: duration * 0.86 }, 0);
        this.timeline?.to(plane.uniforms.uBend, { value: 0, duration: duration * 0.7 }, 0);
        this.timeline?.to(plane.uniforms.uCornerRadius, { value: 0, duration: duration * 0.78 }, 0);
        this.timeline?.to(plane.uniforms.uEdgeCurve, { value: 0, duration: duration * 0.68 }, 0);
        this.timeline?.to(plane.uniforms.uDarkness, { value: 0.24, duration }, 0);
        this.timeline?.to(plane.uniforms.uVelocity, { value: 0, duration: duration * 0.7 }, 0);
        this.timeline?.to(plane.uniforms.uBlur, { value: 0, duration: duration * 0.7 }, 0);
        return;
      }

      this.timeline?.to(plane.uniforms.uOpacity, { value: 0, duration: duration * 0.48, ease: 'power2.out' }, 0.08);
      this.timeline?.to(
        plane.mesh.position,
        { x: plane.mesh.position.x * 1.12, y: plane.mesh.position.y, z: -180, duration: duration * 0.74 },
        0,
      );
      this.timeline?.to(plane.uniforms.uDarkness, { value: 0.58, duration: duration * 0.5 }, 0);
    });
  }

  close() {
    if (this.mode !== 'opened') {
      return;
    }

    this.mode = 'closing';
    this.callbacks.onOverlayStateChange?.('closing');
    this.timeline?.kill();

    const duration = this.reducedMotion ? 0.01 : 1.08;
    this.timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut', overwrite: 'auto' },
      onComplete: () => {
        this.mode = 'slider';
        this.callbacks.onOverlayStateChange?.('slider');
        this.applySliderLayout();
      },
    });

    this.planes.forEach((plane, index) => {
      const offset = centeredOffset(index, this.slidePosition, this.slides.length);
      const layout = this.getLayoutForOffset(offset);

      plane.mesh.renderOrder = this.getRenderOrder(offset, index);
      this.timeline?.to(plane.mesh.position, { x: layout.x, y: layout.y, z: layout.z, duration }, 0.06);
      this.timeline?.to(plane.mesh.rotation, { x: 0, y: layout.rotationY, z: 0, duration }, 0.06);
      this.timeline?.to(
        plane.scaleState,
        {
          x: layout.scaleX,
          y: layout.scaleY,
          duration,
          onUpdate: () => plane.setScale(plane.scaleState.x, plane.scaleState.y),
        },
        0.06,
      );
      this.timeline?.to(plane.uniforms.uPlaneSize.value, { x: layout.width, y: layout.height, duration }, 0.06);
      this.timeline?.to(plane.uniforms.uTransitionProgress, { value: 0, duration: duration * 0.72 }, 0.06);
      this.timeline?.to(plane.uniforms.uBend, { value: layout.bend, duration: duration * 0.72 }, 0.12);
      this.timeline?.to(plane.uniforms.uCornerRadius, { value: layout.cornerRadius, duration: duration * 0.72 }, 0.08);
      this.timeline?.to(plane.uniforms.uEdgeCurve, { value: layout.edgeCurve, duration: duration * 0.72 }, 0.12);
      this.timeline?.to(plane.uniforms.uOpacity, { value: layout.opacity, duration: duration * 0.68, ease: 'power2.out' }, 0.16);
      this.timeline?.to(plane.uniforms.uDarkness, { value: layout.darkness, duration }, 0.06);
      this.timeline?.to(plane.uniforms.uVelocity, { value: 0, duration }, 0.06);
      this.timeline?.to(plane.uniforms.uBlur, { value: layout.blur, duration }, 0.06);
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
      activePlane.uniforms.uCornerRadius.value = 0;
      activePlane.uniforms.uEdgeCurve.value = 0;
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

  private slideTo(direction: -1 | 1) {
    if (this.mode !== 'slider') {
      return;
    }

    const from = this.slidePosition;
    const to = from + direction;
    const targetIndex = wrapIndex(Math.round(to), this.slides.length);
    const duration = this.reducedMotion ? 0.01 : 1.24;
    const motion = { position: from, velocity: direction };
    let hasCommittedTarget = false;

    const commitTarget = () => {
      if (hasCommittedTarget) {
        return;
      }

      hasCommittedTarget = true;
      this.capturePosterForIndex(this.activeIndex);
      this.activeIndex = targetIndex;
      this.assignActiveTexture(targetIndex);
      this.callbacks.onActiveSlideChange?.(targetIndex);
    };

    this.mode = 'sliding';
    this.callbacks.onOverlayStateChange?.('sliding');
    this.timeline?.kill();
    this.capturePosterForIndex(this.activeIndex);

    this.timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut', overwrite: 'auto' },
      onComplete: () => {
        commitTarget();
        this.slidePosition = targetIndex;
        this.slideVelocity = 0;
        this.mode = 'slider';
        this.callbacks.onOverlayStateChange?.('slider');
        this.applySliderLayout();
      },
    });

    this.timeline.to(
      motion,
      {
        position: to,
        velocity: 0,
        duration,
        onUpdate: () => {
          this.slidePosition = motion.position;
          this.slideVelocity = motion.velocity;
          this.applySliderLayout();
        },
      },
      0,
    );
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
      this.planes[this.activeTextureIndex]?.setTexture(this.activeTexture, this.mediaSize);
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

  private assignActiveTexture(index: number) {
    const nextSlide = this.slides[index];
    const nextVideoSrc = new URL(nextSlide.videoSrc, window.location.href).href;

    if (this.activeVideo.currentSrc !== nextVideoSrc && this.activeVideo.src !== nextVideoSrc) {
      this.activeVideo.src = nextVideoSrc;
      this.activeVideo.load();
    }

    this.activeTextureIndex = index;

    this.planes.forEach((plane, planeIndex) => {
      const isActive = planeIndex === index;
      plane.setActive(isActive);
      plane.mesh.renderOrder = isActive ? 20 : 5;
      plane.setTexture(
        isActive ? this.activeTexture : this.posterTextures[planeIndex].texture,
        isActive ? this.mediaSize : new THREE.Vector2(16, 9),
      );
    });

    void this.playActiveVideo();
  }

  private capturePosterForIndex(index: number) {
    if (this.activeVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }

    const poster = this.posterTextures[index];

    if (!poster.context) {
      return;
    }

    try {
      drawVideoPoster(poster.context, poster.canvas, this.activeVideo);
      poster.texture.needsUpdate = true;
    } catch {
      // Cross-origin failures are non-fatal; the generated poster remains in place.
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
          return;
        }

        this.activeVideo.pause();
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
      this.seedPosterTexturesFromActiveVideo();
      this.planes.forEach((plane) => {
        plane.uniforms.uTime.value = elapsed;
      });
      this.renderer.render(this.scene, this.camera);
      this.rafId = window.requestAnimationFrame(render);
    };

    this.rafId = window.requestAnimationFrame(render);
  }

  private seedPosterTexturesFromActiveVideo() {
    if (this.hasSeededPosterTextures || this.activeVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }

    this.posterTextures.forEach(({ canvas, context, texture }) => {
      if (!context) {
        return;
      }

      try {
        drawVideoPoster(context, canvas, this.activeVideo);
        texture.needsUpdate = true;
      } catch {
        // Cross-origin failures are non-fatal; the generated poster remains in place.
      }
    });

    this.hasSeededPosterTextures = true;
  }

  private getLayoutForOffset(offset: number): VideoPlaneLayout {
    const width = this.viewport.x;
    const height = this.viewport.y;
    const isMobile = width < 760;
    const absoluteOffset = Math.abs(offset);
    const distance = clamp(absoluteOffset, 0, 1);
    const distanceEase = smoothstep(distance);
    const activeWidth = isMobile ? Math.min(width * 0.76, 540) : Math.min(width * 0.62, 900);
    const activeHeight = activeWidth / SLIDER_ASPECT;
    const sideWidth = activeWidth * (isMobile ? 0.52 : 0.46);
    const sideHeight = activeHeight * 0.92;
    const sideGap = isMobile ? 8 : 14;
    const sideX = activeWidth * 0.5 + sideWidth * 0.38 + sideGap;
    const hiddenX = sideX + sideWidth * 0.72;
    const sideZ = isMobile ? -86 : -135;
    const farZ = isMobile ? -150 : -255;
    const sign = offset < 0 ? -1 : 1;
    const hiddenProgress = clamp(absoluteOffset - 1, 0, 1);
    const hiddenEase = easeOut(hiddenProgress);
    const bandY = isMobile ? -height * 0.015 : -height * 0.025;
    const velocity = Math.abs(this.slideVelocity);

    if (absoluteOffset <= 1) {
      return {
        x: sign * lerp(0, sideX, distanceEase),
        y: bandY,
        z: lerp(0, sideZ, distanceEase),
        width: lerp(activeWidth, sideWidth, distanceEase),
        height: lerp(activeHeight, sideHeight, distanceEase),
        scaleX: 1,
        scaleY: 1,
        rotationY: -sign * lerp(0, isMobile ? 0.34 : 0.5, distanceEase),
        bend: lerp(isMobile ? 7 : 9, isMobile ? 10 : 13, distanceEase),
        opacity: lerp(1, isMobile ? 0.72 : 0.68, distanceEase),
        darkness: lerp(0.04, isMobile ? 0.4 : 0.48, distanceEase),
        velocity: velocity * (1 - absoluteOffset * 0.25),
        blur: lerp(0, 0.06, distanceEase),
        cornerRadius: lerp(isMobile ? 12 : 14, isMobile ? 10 : 11, distanceEase),
        edgeCurve: lerp(isMobile ? 5 : 7, isMobile ? 7 : 9, distanceEase),
      };
    }

    return {
      x: sign * lerp(sideX, hiddenX, hiddenEase),
      y: bandY,
      z: lerp(sideZ, farZ, hiddenEase),
      width: lerp(sideWidth, sideWidth * 0.72, hiddenEase),
      height: lerp(sideHeight, sideHeight * 0.86, hiddenEase),
      scaleX: 1,
      scaleY: 1,
      rotationY: -sign * lerp(isMobile ? 0.34 : 0.5, isMobile ? 0.52 : 0.72, hiddenEase),
      bend: lerp(isMobile ? 8 : 10, isMobile ? 3 : 4, hiddenEase),
      opacity: lerp(isMobile ? 0.24 : 0.28, isMobile ? 0.05 : 0.08, hiddenEase),
      darkness: lerp(isMobile ? 0.5 : 0.58, 0.72, hiddenEase),
      velocity: velocity * 0.35,
      blur: lerp(0.08, 0.16, hiddenEase),
      cornerRadius: lerp(isMobile ? 9 : 10, isMobile ? 6 : 8, hiddenEase),
      edgeCurve: lerp(isMobile ? 5 : 6, 0, hiddenEase),
    };
  }

  private getRenderOrder(offset: number, index: number) {
    const distance = Math.min(Math.abs(offset), 2);
    const activeTextureBoost = index === this.activeTextureIndex ? 2 : 0;

    return Math.max(1, 80 - Math.round(distance * 28) + activeTextureBoost);
  }

  private getCameraZ(height: number) {
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);

    return height / 2 / Math.tan(halfFov);
  }

  private applySliderLayout() {
    this.planes.forEach((plane, index) => {
      const offset = centeredOffset(index, this.slidePosition, this.slides.length);

      plane.applyLayout(this.getLayoutForOffset(offset));
      plane.mesh.renderOrder = this.getRenderOrder(offset, index);
    });
  }
}
