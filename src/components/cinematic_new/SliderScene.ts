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

type TransitionVideo = {
  index: number;
  video: HTMLVideoElement;
  texture: THREE.VideoTexture;
  mediaSize: THREE.Vector2;
  handleMetadata: () => void;
};

const SLIDER_ASPECT = 16 / 6.6;

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
  private readonly posterMediaSize = new THREE.Vector2(16, 9);
  private readonly startTime = performance.now();
  private readonly planes: VideoPlane[] = [];
  private readonly posterTextures: PosterTexture[] = [];

  private activeVideo: HTMLVideoElement;
  private activeTexture: THREE.VideoTexture;
  private transitionVideo: TransitionVideo | null = null;
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

    this.activeVideo = this.createVideoElement(this.slides[0].videoSrc);
    this.activeVideo.addEventListener('loadedmetadata', this.handleActiveVideoMetadata);
    this.activeVideo.addEventListener('loadeddata', this.handleActiveVideoMetadata);
    this.activeVideo.addEventListener('canplay', this.handleActiveVideoMetadata);
    this.activeTexture = this.createVideoTexture(this.activeVideo);

    this.slides.forEach((slide, index) => {
      const posterTexture = createPosterTexture(slide.accent, index);
      const plane = new VideoPlane(index === 0 ? this.activeTexture : posterTexture.texture, this.viewport);

      plane.mesh.renderOrder = index === 0 ? 30 : 5;
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
    this.disposeTransitionVideo();
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
        this.timeline?.to(plane.uniforms.uDarkness, { value: 0.24, duration }, 0);
        this.timeline?.to(plane.uniforms.uVelocity, { value: 0, duration: duration * 0.7 }, 0);

        return;
      }

      this.timeline?.to(plane.uniforms.uOpacity, { value: 0, duration: duration * 0.48, ease: 'power2.out' }, 0.08);
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

    this.disposeTransitionVideo();

    this.posterTextures.forEach(({ texture }) => texture.dispose());

    this.activeTexture.dispose();
    this.activeVideo.removeEventListener('loadedmetadata', this.handleActiveVideoMetadata);
    this.activeVideo.removeEventListener('loadeddata', this.handleActiveVideoMetadata);
    this.activeVideo.removeEventListener('canplay', this.handleActiveVideoMetadata);
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
    const duration = this.reducedMotion ? 0.01 : 1.45;

    const motion = {
      position: from,
      velocity: direction * 1,
    };

    let hasCommittedTarget = false;

    const commitTarget = () => {
      if (hasCommittedTarget) {
        return;
      }

      hasCommittedTarget = true;
      this.commitIncomingVideo(targetIndex);
    };

    this.mode = 'sliding';
    this.callbacks.onOverlayStateChange?.('sliding');
    this.timeline?.kill();

    this.capturePosterForIndex(this.activeIndex);
    this.prepareIncomingVideo(targetIndex);

    this.timeline = gsap.timeline({
      defaults: { ease: 'power4.inOut', overwrite: 'auto' },
      onComplete: () => {
        commitTarget();

        this.slidePosition = to;
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

  private handleActiveVideoMetadata = () => {
    if (!this.isVideoDrawable(this.activeVideo) && this.activeVideo.readyState < HTMLMediaElement.HAVE_METADATA) {
      return;
    }

    this.mediaSize.set(this.activeVideo.videoWidth || 16, this.activeVideo.videoHeight || 9);
    this.planes[this.activeTextureIndex]?.setTexture(this.activeTexture, this.mediaSize);
  };

  private async playActiveVideo() {
    await this.playVideo(this.activeVideo);
  }

  private async playVideo(video: HTMLVideoElement) {
    try {
      await video.play();
    } catch {
      this.callbacks.onAutoplayBlocked?.();
    }
  }

  private assignActiveTexture(index: number) {
    this.disposeTransitionVideo();

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
      plane.setTexture(
          isActive ? this.activeTexture : this.posterTextures[planeIndex].texture,
          isActive ? this.mediaSize : this.posterMediaSize,
      );
    });

    this.applySliderLayout();
    void this.playActiveVideo();
  }

  private prepareIncomingVideo(index: number) {
    this.disposeTransitionVideo();

    const video = this.createVideoElement(this.slides[index].videoSrc);
    const texture = this.createVideoTexture(video);
    const mediaSize = new THREE.Vector2(16, 9);
    let hasAssignedIncomingTexture = false;

    const assignIncomingTexture = () => {
      if (hasAssignedIncomingTexture) {
        return;
      }

      hasAssignedIncomingTexture = true;
      this.fadePlaneToTexture(index, texture, mediaSize);
    };

    const assignWhenReady = () => {
      if (!this.transitionVideo || this.transitionVideo.index !== index) {
        return;
      }

      if (!this.isVideoDrawable(video)) {
        return;
      }

      mediaSize.set(video.videoWidth || 16, video.videoHeight || 9);
      assignIncomingTexture();
    };

    video.addEventListener('loadedmetadata', assignWhenReady);
    video.addEventListener('loadeddata', assignWhenReady);
    video.addEventListener('canplay', assignWhenReady);
    video.addEventListener('playing', assignWhenReady);
    video.addEventListener('timeupdate', assignWhenReady);

    this.transitionVideo = {
      index,
      video,
      texture,
      mediaSize,
      handleMetadata: assignWhenReady,
    };

    void this.playVideo(video);
  }

  private commitIncomingVideo(index: number) {
    const incoming = this.transitionVideo;

    if (!incoming || incoming.index !== index) {
      this.activeIndex = index;
      this.assignActiveTexture(index);
      this.callbacks.onActiveSlideChange?.(index);
      return;
    }

    const previousIndex = this.activeIndex;
    const previousVideo = this.activeVideo;
    const previousTexture = this.activeTexture;

    this.capturePosterForIndex(previousIndex);

    incoming.video.removeEventListener('loadedmetadata', incoming.handleMetadata);
    incoming.video.removeEventListener('loadeddata', incoming.handleMetadata);
    incoming.video.removeEventListener('canplay', incoming.handleMetadata);
    incoming.video.removeEventListener('playing', incoming.handleMetadata);
    incoming.video.removeEventListener('timeupdate', incoming.handleMetadata);

    previousVideo.removeEventListener('loadedmetadata', this.handleActiveVideoMetadata);
    previousVideo.removeEventListener('loadeddata', this.handleActiveVideoMetadata);
    previousVideo.removeEventListener('canplay', this.handleActiveVideoMetadata);

    this.activeIndex = index;
    this.activeTextureIndex = index;
    this.activeVideo = incoming.video;
    this.activeTexture = incoming.texture;
    this.transitionVideo = null;

    if (this.isVideoDrawable(this.activeVideo) || this.activeVideo.readyState >= HTMLMediaElement.HAVE_METADATA) {
      this.mediaSize.set(this.activeVideo.videoWidth || 16, this.activeVideo.videoHeight || 9);
    } else {
      this.mediaSize.copy(incoming.mediaSize);
    }

    this.activeVideo.addEventListener('loadedmetadata', this.handleActiveVideoMetadata);
    this.activeVideo.addEventListener('loadeddata', this.handleActiveVideoMetadata);
    this.activeVideo.addEventListener('canplay', this.handleActiveVideoMetadata);

    /**
     * Flicker fix:
     * Do NOT reset textures for every plane here.
     * Only old active and new active need texture changes.
     * Other side planes keep their existing poster textures untouched.
     */
    this.planes.forEach((plane) => {
      plane.setActive(false);
    });

    const cleanupPreviousVideo = () => {
      previousVideo.pause();
      previousVideo.removeAttribute('src');
      previousVideo.load();
      previousTexture.dispose();
    };

    this.fadePlaneToTexture(
        previousIndex,
        this.posterTextures[previousIndex].texture,
        this.posterMediaSize,
        cleanupPreviousVideo,
    );

    this.planes[index]?.setActive(true);
    this.planes[index]?.setTexture(this.activeTexture, this.mediaSize);

    this.applySliderLayout();
    void this.playActiveVideo();
    this.callbacks.onActiveSlideChange?.(index);
  }

  private disposeTransitionVideo() {
    if (!this.transitionVideo) {
      return;
    }

    const { index, video, texture, handleMetadata } = this.transitionVideo;
    const plane = this.planes[index];

    if (plane) {
      gsap.killTweensOf(plane.uniforms.uTextureMix);

      if (plane.uniforms.uTexture.value === texture || plane.uniforms.uNextTexture.value === texture) {
        plane.setTexture(this.posterTextures[index].texture, this.posterMediaSize);
      }
    }

    video.removeEventListener('loadedmetadata', handleMetadata);
    video.removeEventListener('loadeddata', handleMetadata);
    video.removeEventListener('canplay', handleMetadata);
    video.removeEventListener('playing', handleMetadata);
    video.removeEventListener('timeupdate', handleMetadata);

    video.pause();
    video.removeAttribute('src');
    video.load();
    texture.dispose();

    this.transitionVideo = null;
  }

  private fadePlaneToTexture(
      index: number,
      texture: THREE.Texture,
      mediaSize: THREE.Vector2,
      onComplete?: () => void,
  ) {
    const plane = this.planes[index];

    if (!plane) {
      onComplete?.();
      return;
    }

    gsap.killTweensOf(plane.uniforms.uTextureMix);
    plane.setNextTexture(texture, mediaSize);

    if (this.reducedMotion) {
      plane.setTexture(texture, mediaSize);
      onComplete?.();
      return;
    }

    gsap.to(plane.uniforms.uTextureMix, {
      value: 1,
      duration: 0.34,
      ease: 'power2.out',
      overwrite: 'auto',
      onComplete: () => {
        plane.setTexture(texture, mediaSize);
        onComplete?.();
      },
    });
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

            if (this.transitionVideo) {
              void this.playVideo(this.transitionVideo.video);
            }

            return;
          }

          this.activeVideo.pause();
          this.transitionVideo?.video.pause();
        },
        { threshold: 0.08 },
    );

    this.intersectionObserver.observe(this.container);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.activeVideo.pause();
      this.transitionVideo?.video.pause();
      return;
    }

    if (this.isVisible) {
      void this.playActiveVideo();

      if (this.transitionVideo) {
        void this.playVideo(this.transitionVideo.video);
      }

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
    const isMobile = width < 760;

    const absOffset = Math.abs(offset);
    const direction = Math.sign(offset) || 1;

    const activeWidth = isMobile
        ? width * 0.84
        : width * 0.64;

    const frameHeight = activeWidth / SLIDER_ASPECT;

    const sideWidth = activeWidth * (isMobile ? 0.58 : 0.54);
    const sideHeight = frameHeight;

    const sideGap = isMobile ? 28 : 80;
    const baseSideX = activeWidth * 0.5 + sideWidth * 0.46 + sideGap;
    const desktopCrop = 117;
    const croppedSideX = width * 0.5 - sideWidth * 0.5 + desktopCrop;
    const sideX = isMobile ? baseSideX : croppedSideX;
    const hiddenX = isMobile ? width * 0.5 + sideWidth : sideX + sideWidth * 0.78;

    const bandY = isMobile ? 0 : 24;

    const sideZ = isMobile ? -42 : -58;
    const farZ = isMobile ? -120 : -170;
    const centerScaleY = isMobile ? 0.96 : 0.95;

    const stableVisibleOpacity = 1.0;
    const visibleDarkness = isMobile ? 0.08 : 0.1;

    if (absOffset <= 1) {
      const t = smoothstep01(absOffset);
      const localVelocity = this.slideVelocity * 0.35 * (1 - absOffset * 0.35);
      const visibleOpacity = isMobile ? 1 - t : stableVisibleOpacity;

      return {
        x: direction * lerp(0, sideX, t),
        y: bandY,
        z: lerp(0, sideZ, t),

        width: lerp(activeWidth, sideWidth, t),
        height: sideHeight,

        scaleX: 1,
        scaleY: lerp(centerScaleY, 1, t),

        rotationY: -direction * lerp(0, isMobile ? 0.1 : 0.14, t),

        bend: lerp(isMobile ? 4 : 5, isMobile ? 5 : 7, t),

        opacity: visibleOpacity,
        darkness: visibleDarkness,

        cornerRadius: lerp(isMobile ? 8 : 10, isMobile ? 7 : 9, t),
        edgeCurve: lerp(isMobile ? 3 : 4, isMobile ? 4 : 6, t),

        velocity: localVelocity,
      };
    }

    const t = smoothstep01(absOffset - 1);
    const localVelocity = this.slideVelocity * 0.16;

    return {
      x: direction * lerp(sideX, hiddenX, t),
      y: bandY,
      z: lerp(sideZ, farZ, t),

      width: lerp(sideWidth, sideWidth * 0.9, t),
      height: sideHeight,

      scaleX: 1,
      scaleY: 1,

      rotationY: -direction * lerp(
          isMobile ? 0.1 : 0.14,
          isMobile ? 0.2 : 0.26,
          t,
      ),

      bend: lerp(isMobile ? 5 : 7, isMobile ? 2 : 3, t),

      opacity: isMobile ? 0 : lerp(stableVisibleOpacity, 0, t),
      darkness: visibleDarkness,

      cornerRadius: lerp(isMobile ? 7 : 9, isMobile ? 5 : 6, t),
      edgeCurve: lerp(isMobile ? 4 : 6, 0, t),

      velocity: localVelocity,
    };
  }

  private getRenderOrder(offset: number) {
    const abs = Math.abs(offset);

    if (abs < 0.45) return 30;
    if (abs < 1.25) return 20;

    return Math.max(1, 12 - Math.round(abs * 3));
  }

  private getCameraZ(height: number) {
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);

    return height / 2 / Math.tan(halfFov);
  }

  private applySliderLayout() {
    this.planes.forEach((plane, index) => {
      const offset = centeredOffset(index, this.slidePosition, this.slides.length);
      const layout = this.getLayoutForOffset(offset);

      plane.applyLayout(layout);
      plane.mesh.renderOrder = this.getRenderOrder(offset);
    });
  }
}
