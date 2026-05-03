declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module 'three' {
  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    set(x: number, y: number): this;
    copy(vector: Vector2): this;
    clone(): Vector2;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
  }

  export class Euler {
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
  }

  export class Scene {
    add(object: unknown): this;
    remove(object: unknown): this;
  }

  export class PerspectiveCamera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    aspect: number;
    fov: number;
    position: Vector3;
    updateProjectionMatrix(): void;
  }

  export class WebGLRenderer {
    constructor(parameters?: Record<string, unknown>);
    domElement: HTMLCanvasElement;
    outputColorSpace: unknown;
    setClearColor(color: number, alpha?: number): void;
    setPixelRatio(value: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
    forceContextLoss(): void;
  }

  export class Texture {
    colorSpace: unknown;
    minFilter: unknown;
    magFilter: unknown;
    generateMipmaps: boolean;
    needsUpdate: boolean;
    dispose(): void;
  }

  export class CanvasTexture extends Texture {
    constructor(canvas: HTMLCanvasElement);
  }

  export class VideoTexture extends Texture {
    constructor(video: HTMLVideoElement);
  }

  export class PlaneGeometry {
    constructor(width?: number, height?: number, widthSegments?: number, heightSegments?: number);
    dispose(): void;
  }

  export class ShaderMaterial {
    constructor(parameters?: Record<string, unknown>);
    dispose(): void;
  }

  export class Mesh<TGeometry = unknown, TMaterial = unknown> {
    constructor(geometry: TGeometry, material: TMaterial);
    geometry: TGeometry;
    material: TMaterial;
    position: Vector3;
    rotation: Euler;
    renderOrder: number;
  }

  export const SRGBColorSpace: unknown;
  export const LinearFilter: unknown;
  export const MathUtils: {
    degToRad(degrees: number): number;
  };
}
