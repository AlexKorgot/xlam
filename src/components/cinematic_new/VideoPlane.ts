import * as THREE from 'three';
import { videoPlaneFragmentShader, videoPlaneVertexShader } from './shaders/videoPlane';

export type VideoPlaneLayout = {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  rotationY: number;
  bend: number;
  opacity: number;
  darkness: number;
  velocity: number;
  cornerRadius: number;
  edgeCurve: number;
};

export class VideoPlane {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  readonly uniforms: {
    uTexture: { value: THREE.Texture };
    uTime: { value: number };
    uBend: { value: number };
    uTransitionProgress: { value: number };
    uActive: { value: number };
    uOpacity: { value: number };
    uDarkness: { value: number };
    uVelocity: { value: number };
    uCornerRadius: { value: number };
    uEdgeCurve: { value: number };
    uViewportSize: { value: THREE.Vector2 };
    uMediaSize: { value: THREE.Vector2 };
    uPlaneSize: { value: THREE.Vector2 };
  };

  constructor(texture: THREE.Texture, viewportSize: THREE.Vector2) {
    const geometry = new THREE.PlaneGeometry(1, 1, 144, 20);

    this.uniforms = {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uBend: { value: 14 },
      uTransitionProgress: { value: 0 },
      uActive: { value: 0 },
      uOpacity: { value: 1 },
      uDarkness: { value: 0.2 },
      uVelocity: { value: 0 },
      uCornerRadius: { value: 22 },
      uEdgeCurve: { value: 12 },
      uViewportSize: { value: viewportSize.clone() },
      uMediaSize: { value: new THREE.Vector2(16, 9) },
      uPlaneSize: { value: new THREE.Vector2(720, 405) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: videoPlaneVertexShader,
      fragmentShader: videoPlaneFragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geometry, material);
  }

  setTexture(texture: THREE.Texture, mediaSize = new THREE.Vector2(16, 9)) {
    this.uniforms.uTexture.value = texture;
    this.uniforms.uMediaSize.value.copy(mediaSize);
  }

  setActive(isActive: boolean) {
    this.uniforms.uActive.value = isActive ? 1 : 0;
  }

  applyLayout(layout: VideoPlaneLayout) {
    this.mesh.position.set(layout.x, layout.y, layout.z);
    this.mesh.rotation.set(0, layout.rotationY, 0);
    this.uniforms.uPlaneSize.value.set(layout.width, layout.height);
    this.uniforms.uBend.value = layout.bend;
    this.uniforms.uOpacity.value = layout.opacity;
    this.uniforms.uDarkness.value = layout.darkness;
    this.uniforms.uVelocity.value = layout.velocity;
    this.uniforms.uCornerRadius.value = layout.cornerRadius;
    this.uniforms.uEdgeCurve.value = layout.edgeCurve;
  }

  dispose(disposeTexture = false) {
    if (disposeTexture) {
      this.uniforms.uTexture.value.dispose();
    }

    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
