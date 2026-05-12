import gsap from 'gsap';
import * as THREE from 'three';
import { VideoPlane, type VideoPlaneLayout } from './VideoPlane';
import type { CinematicSlide, SliderSceneCallbacks } from './types';

type SliderSceneOptions = SliderSceneCallbacks & {
  slides: CinematicSlide[];
  reducedMotion: boolean;
};

type FilmStripSlideRole = 'center' | 'side' | 'buffer' | 'sleeping';

type SlideVideo = {
  index: number;
  video: HTMLVideoElement;
  texture: THREE.VideoTexture;
  handleMetadata: () => void;
  lastRole: FilmStripSlideRole;
};

type FilmStripLayoutConfig = {
  centerWidthRatio: number;
  centerMaxWidthRatio: number;
  centerAspect: number;
  maxHeightRatio: number;
  tallDesktopMinHeight?: {
    minViewportHeight: number;
    height: number;
    maxHeightRatio: number;
  };
  gap: {
    min: number;
    max: number;
    ratio: number;
  };
  sideVisibleRatio: number;
  sideScale: number;
  sideRotationY: number;
  bend: {
    center: number;
    side: number;
    buffer: number;
  };
  edgeCurve: {
    center: number;
    side: number;
    buffer: number;
  };
  hiddenOffset: number;
};

type FilmStripFrameMetrics = {
  config: FilmStripLayoutConfig;
  centerWidth: number;
  centerHeight: number;
  gap: number;
  sideVisibleWidth: number;
  sideWidth: number;
  sideHeight: number;
};

const DESKTOP_FILM_STRIP_LAYOUT: FilmStripLayoutConfig = {
  centerWidthRatio: 0.78,
  centerMaxWidthRatio: 0.82,
  centerAspect: 16 / 6.4,
  maxHeightRatio: 0.54,
  tallDesktopMinHeight: {
    minViewportHeight: 960,
    height: 650,
    maxHeightRatio: 0.64,
  },
  gap: {
    min: 20,
    max: 70,
    ratio: 0.026,
  },
  sideVisibleRatio: 0.34,
  sideScale: 1.02,
  sideRotationY: 0.055,
  bend: {
    center: 56,
    side: 62,
    buffer: 68,
  },
  edgeCurve: {
    center: 14,
    side: 18,
    buffer: 22,
  },
  hiddenOffset: 2.5,
};
const MOBILE_FILM_STRIP_LAYOUT: FilmStripLayoutConfig = {
  centerWidthRatio: 0.9,
  centerMaxWidthRatio: 0.94,
  centerAspect: 16 / 6.2,
  maxHeightRatio: 0.58,
  gap: {
    min: 14,
    max: 28,
    ratio: 0.04,
  },
  sideVisibleRatio: 0.28,
  sideScale: 1,
  sideRotationY: 0.04,
  bend: {
    center: 42,
    side: 52,
    buffer: 58,
  },
  edgeCurve: {
    center: 10,
    side: 14,
    buffer: 16,
  },
  hiddenOffset: 2.5,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

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

function smoothstep01(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function velocityPulse(progress: number) {
  const t = clamp(progress, 0, 1);

  return Math.sin(t * Math.PI);
}

function lerpByStripRole(center: number, side: number, buffer: number, absOffset: number) {
  if (absOffset <= 1) {
    return lerp(center, side, smoothstep01(absOffset));
  }

  return lerp(side, buffer, smoothstep01(absOffset - 1));
}

export class SliderScene {
  private readonly container: HTMLElement;
  private readonly callbacks: SliderSceneOptions;
  private readonly slides: CinematicSlide[];
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(38, 1, 10, 5000);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly viewport = new THREE.Vector2(1, 1);
  private readonly startTime = performance.now();
  private readonly planes: VideoPlane[] = [];
  private readonly slideVideos: SlideVideo[] = [];

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private timeline: gsap.core.Timeline | null = null;
  private rafId: number | null = null;

  private activeIndex = 0;
  private slidePosition = 0;
  private slideProgress = 0;
  private slideVelocity = 0;

  private isVisible = true;
  private isDestroyed = false;
  private mode: 'slider' | 'sliding' | 'opening' | 'opened' | 'closing' = 'slider';
  private readonly reducedMotion: boolean;

  constructor(container: HTMLElement, options: SliderSceneOptions) {
    this.container = container;
    this.callbacks = options;
    this.slides = options.slides;
    this.reducedMotion = options.reducedMotion;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.width = '100%';
    this.container.appendChild(this.renderer.domElement);

    this.slides.forEach((slide, index) => {
      const video = this.createVideoElement(slide.videoSrc);
      const texture = this.createVideoTexture(video);
      const mediaSize = new THREE.Vector2(16, 9);
      let hasPrimedPreview = false;
      const handleMetadata = () => {
        if (!this.isVideoDrawable(video) && video.readyState < HTMLMediaElement.HAVE_METADATA) {
          return;
        }

        mediaSize.set(video.videoWidth || 16, video.videoHeight || 9);
        this.planes[index]?.setTexture(texture, mediaSize);
        texture.needsUpdate = true;

        if (index !== this.activeIndex && !hasPrimedPreview && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
          hasPrimedPreview = true;

          try {
            video.currentTime = Math.min(0.04, Number.isFinite(video.duration) ? Math.max(video.duration - 0.001, 0) : 0.04);
          } catch {
            // Seeking can fail before the browser has enough metadata; the slide will stay paused.
          }
        }
      };
      const plane = new VideoPlane(texture, this.viewport);
      plane.setObjectPosition(slide.videoObjectPosition ?? [0.5, 0.58]);

      video.addEventListener('loadedmetadata', handleMetadata);
      video.addEventListener('loadeddata', handleMetadata);
      video.addEventListener('canplay', handleMetadata);
      video.addEventListener('seeked', handleMetadata);

      plane.mesh.renderOrder = index === 0 ? 30 : 5;
      plane.setActive(index === 0);

      this.slideVideos.push({
        index,
        video,
        texture,
        handleMetadata,
        lastRole: index === 0 ? 'center' : this.getSlideRole(centeredOffset(index, this.slidePosition, this.slides.length)),
      });
      this.planes.push(plane);
      this.scene.add(plane.mesh);
    });

    this.resize();
    this.bindObservers();
    this.start();
    this.pauseInactiveVideos();
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

    if (rect.width < 760) {
      return;
    }

    const leftLayout = this.getLayoutForOffset(-1);
    const rightLayout = this.getLayoutForOffset(1);

    if (this.isPointInsideLayout(x, y, rect, leftLayout)) {
      this.previous();
      return;
    }

    if (this.isPointInsideLayout(x, y, rect, rightLayout)) {
      this.next();
    }
  }

  handlePointerGesture(startX: number, startY: number, endX: number, endY: number) {
    if (this.mode !== 'slider') {
      return;
    }

    const rect = this.container.getBoundingClientRect();
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const isMobile = rect.width < 760;
    const isSwipe = Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35;

    if (isMobile && isSwipe) {
      if (deltaX < 0) {
        this.next();
        return;
      }

      this.previous();
      return;
    }

    if (Math.hypot(deltaX, deltaY) < 10) {
      this.handlePointer(endX, endY);
    }
  }

  next() {
    this.slideTo(1);
  }

  previous() {
    this.slideTo(-1);
  }

  nextOpened() {
    this.shiftOpenedSlide(1);
  }

  previousOpened() {
    this.shiftOpenedSlide(-1);
  }

  open() {
    if (this.mode !== 'slider') {
      return;
    }

    this.mode = 'opening';
    this.callbacks.onOverlayStateChange?.('opening');
    this.timeline?.kill();

    this.activateSlideVideo(this.activeIndex, false);
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
            {
              x: 1,
              y: 1,
              duration,
              onUpdate: () => plane.setScale(plane.scaleState.x, plane.scaleState.y),
            },
            0,
        );

        this.timeline?.to(plane.uniforms.uPlaneSize.value, { x: this.viewport.x, y: this.viewport.y, duration }, 0);
        this.timeline?.to(plane.uniforms.uTransitionProgress, { value: 1, duration: duration * 0.86 }, 0);
        this.timeline?.to(plane.uniforms.uBend, { value: 0, duration: duration * 0.7 }, 0);
        this.timeline?.to(plane.uniforms.uCornerRadius, { value: 0, duration: duration * 0.78 }, 0);
        this.timeline?.to(plane.uniforms.uEdgeCurve, { value: 0, duration: duration * 0.68 }, 0);
        this.timeline?.to(plane.uniforms.uDarkness, { value: 0, duration }, 0);
        this.timeline?.to(plane.uniforms.uVelocity, { value: 0, duration: duration * 0.7 }, 0);

        return;
      }

      this.timeline?.to(plane.uniforms.uOpacity, { value: 0, duration: duration * 0.82, ease: 'power2.out' }, 0.08);
      this.timeline?.to(
          plane.mesh.position,
          { x: plane.mesh.position.x * 1.12, y: plane.mesh.position.y, z: -180, duration: duration * 0.74 },
          0,
      );
      this.timeline?.to(plane.uniforms.uDarkness, { value: 0.58, duration: duration * 0.5 }, 0);
      this.timeline?.to(plane.uniforms.uVelocity, { value: 0, duration: duration * 0.5 }, 0);
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
        this.slideVelocity = 0;
        this.applySliderLayout();
      },
    });

    this.planes.forEach((plane, index) => {
      const offset = centeredOffset(index, this.slidePosition, this.slides.length);
      const layout = this.getLayoutForOffset(offset);

      plane.mesh.renderOrder = this.getRenderOrder(offset);

      this.timeline?.to(plane.mesh.position, { x: layout.x, y: layout.y, z: layout.z, duration }, 0.06);
      this.timeline?.to(plane.mesh.rotation, { x: 0, y: layout.rotationY, z: 0, duration }, 0.06);
      this.timeline?.to(plane.uniforms.uStripOffset, { value: layout.stripX, duration }, 0.06);

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
      this.timeline?.to(plane.uniforms.uCurveScale, { value: layout.curveScale, duration: duration * 0.72 }, 0.12);
      this.timeline?.to(plane.uniforms.uOpacity, { value: layout.opacity, duration: duration * 0.68, ease: 'power2.out' }, 0.16);
      this.timeline?.to(plane.uniforms.uDarkness, { value: layout.darkness, duration }, 0.06);
      this.timeline?.to(plane.uniforms.uVelocity, { value: layout.velocity, duration }, 0.06);
    });
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const isMobile = width < 760;

    const maxDpr = isMobile || this.reducedMotion ? 1.5 : 2;
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
      activePlane.uniforms.uVelocity.value = 0;
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

    this.slideVideos.forEach(({ video, texture, handleMetadata }) => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      video.removeEventListener('loadeddata', handleMetadata);
      video.removeEventListener('canplay', handleMetadata);
      video.removeEventListener('seeked', handleMetadata);
      video.pause();
      video.removeAttribute('src');
      video.load();
      texture.dispose();
    });

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
    const duration = this.reducedMotion ? 0.01 : 1.28;

    const motion = {
      position: from,
      progress: 0,
    };

    let hasNotifiedTarget = false;

    this.mode = 'sliding';
    this.callbacks.onOverlayStateChange?.('sliding');
    this.timeline?.kill();
    this.pauseVideo(this.activeIndex);

    this.timeline = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        if (!hasNotifiedTarget) {
          hasNotifiedTarget = true;
          this.activateSlideVideo(targetIndex, true);
        }

        this.slidePosition = to;
        this.slideProgress = 0;
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
          progress: 1,
          duration,
          ease: 'power2.inOut',
          onUpdate: () => {
            this.slidePosition = motion.position;
            this.slideProgress = motion.progress;
            this.slideVelocity = direction * (0.18 + velocityPulse(motion.progress) * 1.18);
            this.applySliderLayout();

            if (!hasNotifiedTarget && wrapIndex(Math.round(motion.position), this.slides.length) === targetIndex) {
              hasNotifiedTarget = true;
              this.activateSlideVideo(targetIndex, true);
            }
          },
        },
        0,
    );
  }

  private createVideoElement(src: string) {
    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';

    return video;
  }

  private createVideoTexture(video: HTMLVideoElement) {
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return texture;
  }

  private isVideoDrawable(video: HTMLVideoElement) {
    return (
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
    );
  }

  private async playActiveVideo() {
    const activeVideo = this.slideVideos[this.activeIndex]?.video;

    if (activeVideo) {
      await this.playVideo(activeVideo);
    }
  }

  private async playVideo(video: HTMLVideoElement) {
    try {
      await video.play();
    } catch {
      this.callbacks.onAutoplayBlocked?.();
    }
  }

  private activateSlideVideo(index: number, notify: boolean) {
    if (this.activeIndex !== index) {
      this.pauseVideo(this.activeIndex);
    }

    this.activeIndex = index;

    this.planes.forEach((plane, planeIndex) => {
      plane.setActive(planeIndex === index);
    });

    this.pauseInactiveVideos();
    void this.playActiveVideo();

    if (notify) {
      this.callbacks.onActiveSlideChange?.(index);
    }
  }

  private shiftOpenedSlide(direction: -1 | 1) {
    if (this.mode === 'opening') {
      this.timeline?.progress(1);
      this.mode = 'opened';
      this.callbacks.onOverlayStateChange?.('opened');
    }

    if (this.mode !== 'opened') {
      this.slideTo(direction);
      return;
    }

    const targetIndex = wrapIndex(this.activeIndex + direction, this.slides.length);

    this.slidePosition = targetIndex;
    this.slideProgress = 0;
    this.slideVelocity = 0;
    this.activateSlideVideo(targetIndex, true);
    this.applyOpenedLayout(targetIndex);
  }

  private applyOpenedLayout(targetIndex: number) {
    this.planes.forEach((plane, index) => {
      if (index === targetIndex) {
        plane.mesh.renderOrder = 30;
        plane.mesh.position.set(0, 0, 0);
        plane.mesh.rotation.set(0, 0, 0);
        plane.setScale(1, 1);
        plane.uniforms.uPlaneSize.value.copy(this.viewport);
        plane.uniforms.uStripOffset.value = 0;
        plane.uniforms.uTransitionProgress.value = 1;
        plane.uniforms.uBend.value = 0;
        plane.uniforms.uCornerRadius.value = 0;
        plane.uniforms.uEdgeCurve.value = 0;
        plane.uniforms.uDarkness.value = 0;
        plane.uniforms.uVelocity.value = 0;
        plane.uniforms.uOpacity.value = 1;
        return;
      }

      plane.mesh.renderOrder = 1;
      plane.mesh.position.set(plane.mesh.position.x, plane.mesh.position.y, -180);
      plane.uniforms.uOpacity.value = 0;
      plane.uniforms.uTransitionProgress.value = 0;
      plane.uniforms.uVelocity.value = 0;
    });
  }

  private pauseVideo(index: number) {
    this.slideVideos[index]?.video.pause();
  }

  private pauseInactiveVideos() {
    this.slideVideos.forEach(({ video }, index) => {
      if (index !== this.activeIndex) {
        video.pause();
      }
    });
  }

  private resetInactiveVideo(index: number) {
    if (index === this.activeIndex) {
      return;
    }

    const video = this.slideVideos[index]?.video;

    if (!video || video.currentTime === 0) {
      return;
    }

    video.pause();

    try {
      video.currentTime = 0;
    } catch {
      // Some browsers can reject seeking before metadata is available.
    }
  }

  private getFilmStripLayoutConfig() {
    return this.viewport.x < 760 ? MOBILE_FILM_STRIP_LAYOUT : DESKTOP_FILM_STRIP_LAYOUT;
  }

  private getSlideRole(offset: number): FilmStripSlideRole {
    const absOffset = Math.abs(offset);
    const { hiddenOffset } = this.getFilmStripLayoutConfig();

    if (absOffset < 0.5) {
      return 'center';
    }

    if (absOffset < 1.5) {
      return 'side';
    }

    if (absOffset <= hiddenOffset) {
      return 'buffer';
    }

    return 'sleeping';
  }

  private getFilmStripFrameMetrics(): FilmStripFrameMetrics {
    const width = this.viewport.x;
    const height = this.viewport.y;
    const config = this.getFilmStripLayoutConfig();
    const desiredCenterWidth = width * config.centerWidthRatio;
    const maxCenterWidth = width * config.centerMaxWidthRatio;
    const maxCenterHeight = height * config.maxHeightRatio;
    const centerWidthByRatio = Math.min(desiredCenterWidth, maxCenterWidth);
    const centerHeightByRatio = centerWidthByRatio / config.centerAspect;
    let centerHeight = Math.min(centerHeightByRatio, maxCenterHeight);

    if (config.tallDesktopMinHeight && height >= config.tallDesktopMinHeight.minViewportHeight) {
      const tallHeight = Math.min(
        config.tallDesktopMinHeight.height,
        height * config.tallDesktopMinHeight.maxHeightRatio,
        centerHeightByRatio,
      );

      centerHeight = Math.max(centerHeight, tallHeight);
    }

    const centerWidth = centerHeight < centerHeightByRatio ? centerHeight * config.centerAspect : centerWidthByRatio;
    const gap = clamp(width * config.gap.ratio, config.gap.min, config.gap.max);
    const visibleSpaceBesideCenter = Math.max(width / 2 - centerWidth / 2 - gap, 1);
    const sideVisibleWidth = visibleSpaceBesideCenter;
    const sideWidth = centerWidth;
    const sideHeight = centerHeight;

    return {
      config,
      centerWidth,
      centerHeight,
      gap,
      sideVisibleWidth,
      sideWidth,
      sideHeight,
    };
  }

  private getRoleOpacity(role: FilmStripSlideRole, absOffset: number) {
    if (role === 'center' || role === 'side') {
      return 1;
    }

    if (role === 'buffer') {
      return 1 - smoothstep01((absOffset - 1.5) / 0.42);
    }

    return 0;
  }

  private getViewportFadeOpacity(layoutX: number, frameWidth: number) {
    const fadeMargin = Math.max(this.viewport.x * 0.08, 48);
    const outsideDistance = Math.abs(layoutX) - (this.viewport.x / 2 + frameWidth / 2);

    if (outsideDistance <= 0) {
      return 1;
    }

    return 1 - smoothstep01(outsideDistance / fadeMargin);
  }

  private isPointInsideLayout(
    x: number,
    y: number,
    rect: DOMRect,
    layout: Pick<VideoPlaneLayout, 'x' | 'y' | 'width' | 'height'>,
  ) {
    const centerX = rect.width / 2 + layout.x;
    const centerY = rect.height / 2 - layout.y;

    return (
        Math.abs(x - centerX) <= layout.width / 2 &&
        Math.abs(y - centerY) <= layout.height / 2
    );
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

          this.pauseVideo(this.activeIndex);
        },
        { threshold: 0.08 },
    );

    this.intersectionObserver.observe(this.container);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.pauseVideo(this.activeIndex);
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
    const metrics = this.getFilmStripFrameMetrics();

    const absOffset = Math.abs(offset);
    const direction = Math.sign(offset) || 1;
    const role = this.getSlideRole(offset);

    const centerWidth = metrics.centerWidth;
    const centerHeight = metrics.centerHeight;
    const { config } = metrics;
    const transitionPulse = this.mode === 'sliding' ? velocityPulse(this.slideProgress) : 0;
    const transitionGap = metrics.gap * transitionPulse * (isMobile ? 0.18 : 0.32);
    const effectiveGap = metrics.gap + transitionGap;
    const sideX = centerWidth / 2 + effectiveGap + metrics.sideWidth / 2;
    const bufferStep = metrics.sideWidth + effectiveGap;
    const distanceFromCenter = absOffset <= 1 ? absOffset * sideX : sideX + (absOffset - 1) * bufferStep;
    const sideProgress = smoothstep01(absOffset * (1 + transitionPulse * (isMobile ? 0.12 : 0.18)));
    const stripX = direction * distanceFromCenter;
    const localVelocity = this.slideVelocity * (isMobile ? 0.26 : 0.36) * (1 - Math.min(absOffset, 2.1) * 0.12);

    const frameWidth = lerp(centerWidth, metrics.sideWidth, sideProgress);
    const frameHeight = lerp(centerHeight, metrics.sideHeight, sideProgress);
    const curveScale = Math.min(width * 0.5, centerWidth * 0.64);
    const outsideDistance = Math.abs(stripX) - (width / 2 + frameWidth / 2);
    const outsideProgress = smoothstep01(outsideDistance / Math.max(frameWidth * 0.35, 1));
    const viewportOpacity = this.getViewportFadeOpacity(stripX, frameWidth);
    const roleOpacity = this.getRoleOpacity(role, absOffset);
    const bandY = isMobile ? -6 : 10;

    return {
      x: stripX,
      y: bandY - lerp(0, isMobile ? 8 : 24, outsideProgress),
      z: -lerp(0, isMobile ? 92 : 150, outsideProgress),
      stripX,

      width: frameWidth,
      height: frameHeight,

      scaleX: 1,
      scaleY: 1,

      rotationY: -direction * lerpByStripRole(0, config.sideRotationY, config.sideRotationY * 1.24, absOffset),

      bend: lerpByStripRole(config.bend.center, config.bend.side, config.bend.buffer, absOffset),

      opacity: roleOpacity * viewportOpacity,
      darkness: lerpByStripRole(isMobile ? 0.05 : 0.07, isMobile ? 0.1 : 0.12, isMobile ? 0.14 : 0.18, absOffset),

      cornerRadius: lerp(isMobile ? 3 : 4, isMobile ? 2 : 3, sideProgress),
      edgeCurve: lerpByStripRole(config.edgeCurve.center, config.edgeCurve.side, config.edgeCurve.buffer, absOffset),
      curveScale,

      velocity: localVelocity,
    };
  }

  private getRenderOrder(offset: number) {
    const role = this.getSlideRole(offset);
    const direction = Math.sign(offset);
    const velocityDirection = Math.sign(this.slideVelocity);

    if (this.mode === 'sliding' && role === 'center' && direction !== 0 && velocityDirection !== 0) {
      return direction === velocityDirection ? 32 : 16;
    }

    if (role === 'center') return 30;
    if (role === 'side') return 18;
    if (role === 'buffer') return 8;

    return 1;
  }

  private getCameraZ(height: number) {
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);

    return height / 2 / Math.tan(halfFov);
  }

  private applySliderLayout() {
    this.planes.forEach((plane, index) => {
      const offset = centeredOffset(index, this.slidePosition, this.slides.length);
      const role = this.getSlideRole(offset);
      const layout = this.getLayoutForOffset(offset);
      const slideVideo = this.slideVideos[index];

      plane.applyLayout(layout);
      plane.mesh.renderOrder = this.getRenderOrder(offset);

      if (!slideVideo) {
        return;
      }

      if (role === 'sleeping' && slideVideo.lastRole !== 'sleeping') {
        this.resetInactiveVideo(index);
      }

      slideVideo.lastRole = role;
    });
  }
}
