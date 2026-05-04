export const videoPlaneVertexShader = `
  varying vec2 vUv;

  uniform float uTime;
  uniform float uBend;
  uniform float uTransitionProgress;
  uniform float uActive;
  uniform float uVelocity;
  uniform float uEdgeCurve;
  uniform vec2 uPlaneSize;

  void main() {
    vUv = uv;

    vec3 transformed = position;
    float localX = position.x * 2.0;
    float unbend = 1.0 - (uTransitionProgress * uActive);
    float bend = uBend * unbend;

    transformed.x *= uPlaneSize.x;
    transformed.y *= uPlaneSize.y;
    transformed.z += localX * localX * bend;

    float edgeMask = smoothstep(0.32, 0.5, abs(position.y));
    transformed.y += sign(position.y) * localX * localX * uEdgeCurve * edgeMask * unbend;
    transformed.y += sin((localX + uTime * 0.2) * 1.5707963) * uVelocity * 10.0 * unbend;

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
  uniform float uBlur;
  uniform float uCornerRadius;
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

  float roundedBoxMask(vec2 uv, vec2 size, float radius) {
    vec2 halfSize = size * 0.5;
    float safeRadius = min(radius, min(halfSize.x, halfSize.y) - 1.0);
    vec2 position = (uv - 0.5) * size;
    vec2 q = abs(position) - (halfSize - vec2(safeRadius));
    float distanceToEdge = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - safeRadius;

    return 1.0 - smoothstep(0.0, 1.6, distanceToEdge);
  }

  void main() {
    vec2 uv = coverUv(vUv, uPlaneSize, uMediaSize);
    uv.x += sin(vUv.y * 3.14159) * uVelocity * 0.005;

    float blurRadius = uBlur * 0.012;
    vec4 color = texture2D(uTexture, uv) * 0.52;
    color += texture2D(uTexture, uv + vec2(blurRadius, 0.0)) * 0.12;
    color += texture2D(uTexture, uv - vec2(blurRadius, 0.0)) * 0.12;
    color += texture2D(uTexture, uv + vec2(0.0, blurRadius)) * 0.12;
    color += texture2D(uTexture, uv - vec2(0.0, blurRadius)) * 0.12;

    float horizontalEdge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    float verticalEdge = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
    float vignette = mix(0.62, 1.0, horizontalEdge * verticalEdge);

    color.rgb *= vignette;
    color.rgb *= 1.0 - uDarkness;

    float roundedMask = roundedBoxMask(vUv, uPlaneSize, uCornerRadius);
    gl_FragColor = vec4(color.rgb, color.a * uOpacity * roundedMask);
  }
`;
