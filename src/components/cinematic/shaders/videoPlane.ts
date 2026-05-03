export const videoPlaneVertexShader = `
  varying vec2 vUv;

  uniform float uTime;
  uniform float uBend;
  uniform float uTransitionProgress;
  uniform float uActive;
  uniform float uVelocity;
  uniform vec2 uPlaneSize;

  void main() {
    vUv = uv;

    vec3 transformed = position;
    float localX = position.x * 2.0;
    float unbend = 1.0 - (uTransitionProgress * uActive);
    float bend = uBend * unbend;

    transformed.x *= uPlaneSize.x;
    transformed.y *= uPlaneSize.y;
    transformed.z -= localX * localX * bend;
    transformed.y += sin((localX + uTime * 0.28) * 1.5707963) * uVelocity * 8.0 * unbend;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

export const videoPlaneFragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uDarkness;
  uniform float uVelocity;
  uniform vec2 uMediaSize;
  uniform vec2 uPlaneSize;

  vec2 coverUv(vec2 uv, vec2 planeSize, vec2 mediaSize) {
    float planeAspect = max(planeSize.x / max(planeSize.y, 0.001), 0.001);
    float mediaAspect = max(mediaSize.x / max(mediaSize.y, 0.001), 0.001);
    vec2 scale = vec2(1.0);

    if (mediaAspect > planeAspect) {
      scale.x = planeAspect / mediaAspect;
    } else {
      scale.y = mediaAspect / planeAspect;
    }

    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv, uPlaneSize, uMediaSize);
    uv.x += sin(vUv.y * 3.14159) * uVelocity * 0.004;

    vec4 color = texture2D(uTexture, uv);
    float edge = smoothstep(0.0, 0.16, vUv.x) * smoothstep(1.0, 0.84, vUv.x);
    float verticalEdge = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
    float vignette = mix(0.74, 1.0, edge * verticalEdge);

    color.rgb *= vignette;
    color.rgb *= 1.0 - uDarkness;
    gl_FragColor = vec4(color.rgb, color.a * uOpacity);
  }
`;

