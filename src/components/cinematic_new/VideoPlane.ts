import * as THREE from 'three';
import { videoPlaneFragmentShader, videoPlaneVertexShader } from './shaders/videoPlane';

export type VideoPlaneLayout = {
  x: number;
  y: number;
  z: number;
  stripX: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotationY: number;
  bend: number;
  opacity: number;
  darkness: number;
  cornerRadius: number;
  edgeCurve: number;
  velocity: number;
};

export class VideoPlane {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  readonly scaleState = { x: 1, y: 1 };
  readonly uniforms: {
    uTexture: { value: THREE.Texture };
    uNextTexture: { value: THREE.Texture };
    uTextureMix: { value: number };
    uTime: { value: number };
    uBend: { value: number };
    uTransitionProgress: { value: number };
    uActive: { value: number };
    uOpacity: { value: number };
    uDarkness: { value: number };
    uCornerRadius: { value: number };
    uEdgeCurve: { value: number };
    uVelocity: { value: number };
    uViewportSize: { value: THREE.Vector2 };
    uMediaSize: { value: THREE.Vector2 };
    uNextMediaSize: { value: THREE.Vector2 };
    uPlaneSize: { value: THREE.Vector2 };
    uStripOffset: { value: number };
  };

  constructor(texture: THREE.Texture, viewportSize: THREE.Vector2) {
    const geometry = new THREE.PlaneGeometry(1, 1, 144, 20);

    this.uniforms = {
      uTexture: { value: texture },
      uNextTexture: { value: texture },
      uTextureMix: { value: 0 },
      uTime: { value: 0 },
      uBend: { value: 14 },
      uTransitionProgress: { value: 0 },
      uActive: { value: 0 },
      uOpacity: { value: 1 },
      uDarkness: { value: 0.2 },
      uCornerRadius: { value: 16 },
      uEdgeCurve: { value: 12 },
      uVelocity: { value: 0 },
      uViewportSize: { value: viewportSize.clone() },
      uMediaSize: { value: new THREE.Vector2(16, 9) },
      uNextMediaSize: { value: new THREE.Vector2(16, 9) },
      uPlaneSize: { value: new THREE.Vector2(720, 324) },
      uStripOffset: { value: 0 },
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
    this.uniforms.uNextTexture.value = texture;
    this.uniforms.uTextureMix.value = 0;
    this.uniforms.uMediaSize.value.copy(mediaSize);
    this.uniforms.uNextMediaSize.value.copy(mediaSize);
  }

  setNextTexture(texture: THREE.Texture, mediaSize = new THREE.Vector2(16, 9)) {
    this.uniforms.uNextTexture.value = texture;
    this.uniforms.uNextMediaSize.value.copy(mediaSize);
    this.uniforms.uTextureMix.value = 0;
  }

  setActive(isActive: boolean) {
    this.uniforms.uActive.value = isActive ? 1 : 0;
  }

  setScale(scaleX: number, scaleY: number) {
    this.scaleState.x = scaleX;
    this.scaleState.y = scaleY;
    (this.mesh as THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> & { scale: THREE.Vector3 }).scale.set(
      scaleX,
      scaleY,
      1,
    );
  }

  applyLayout(layout: VideoPlaneLayout) {
    this.mesh.position.set(layout.x, layout.y, layout.z);
    this.mesh.rotation.set(0, layout.rotationY, 0);
    this.setScale(layout.scaleX, layout.scaleY);
    this.uniforms.uPlaneSize.value.set(layout.width, layout.height);
    this.uniforms.uStripOffset.value = layout.stripX;
    this.uniforms.uBend.value = layout.bend;
    this.uniforms.uOpacity.value = layout.opacity;
    this.uniforms.uDarkness.value = layout.darkness;
    this.uniforms.uCornerRadius.value = layout.cornerRadius;
    this.uniforms.uEdgeCurve.value = layout.edgeCurve;
    this.uniforms.uVelocity.value = layout.velocity;
  }

  dispose(disposeTexture = false) {
    if (disposeTexture) {
      this.uniforms.uTexture.value.dispose();
    }

    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
