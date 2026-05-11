export const videoPlaneVertexShader = `
  varying vec2 vUv;

  uniform float uBend;
  uniform float uTransitionProgress;
  uniform float uActive;
  uniform float uEdgeCurve;
  uniform float uCurveScale;
  uniform vec2 uPlaneSize;
  uniform vec2 uViewportSize;
  uniform float uStripOffset;

  void main() {
    vUv = uv;

    vec3 transformed = position;
    float localX = position.x * 2.0;
    float unbend = 1.0 - (uTransitionProgress * uActive);
    float bend = uBend * unbend;
    float globalX = (uStripOffset + position.x * uPlaneSize.x) / max(uCurveScale, 1.0);
    float curve = globalX * globalX;

    transformed.x *= uPlaneSize.x;
    transformed.y *= uPlaneSize.y;
    transformed.z += curve * bend;

    float edgeMask = smoothstep(0.32, 0.5, abs(position.y));
    transformed.y += sign(position.y) * curve * uEdgeCurve * edgeMask * unbend;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

export const videoPlaneFragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform sampler2D uNextTexture;
  uniform float uTextureMix;
  uniform float uOpacity;
  uniform float uDarkness;
  uniform float uCornerRadius;
  uniform float uVelocity;
  uniform float uActive;
  uniform float uTransitionProgress;
  uniform vec2 uMediaSize;
  uniform vec2 uNextMediaSize;
  uniform vec2 uObjectPosition;
  uniform vec2 uPlaneSize;

  vec2 coverUv(vec2 uv, vec2 planeSize, vec2 mediaSize, vec2 objectPosition) {
    float planeAspect = max(planeSize.x / max(planeSize.y, 0.001), 0.001);
    float mediaAspect = max(mediaSize.x / max(mediaSize.y, 0.001), 0.001);
    vec2 scale = vec2(1.0);

    if (mediaAspect > planeAspect) {
      scale.x = planeAspect / mediaAspect;
    } else {
      scale.y = mediaAspect / planeAspect;
    }

    vec2 safePosition = clamp(objectPosition, vec2(0.0), vec2(1.0));
    vec2 minUv = safePosition * (1.0 - scale);

    return uv * scale + minUv;
  }

  vec2 containUv(vec2 uv, vec2 planeSize, vec2 mediaSize) {
    float planeAspect = max(planeSize.x / max(planeSize.y, 0.001), 0.001);
    float mediaAspect = max(mediaSize.x / max(mediaSize.y, 0.001), 0.001);
    vec2 displayScale = vec2(1.0);

    if (mediaAspect > planeAspect) {
      displayScale.y = planeAspect / mediaAspect;
    } else {
      displayScale.x = mediaAspect / planeAspect;
    }

    return (uv - 0.5) / displayScale + 0.5;
  }

  float containMask(vec2 uv, vec2 planeSize, vec2 mediaSize) {
    float planeAspect = max(planeSize.x / max(planeSize.y, 0.001), 0.001);
    float mediaAspect = max(mediaSize.x / max(mediaSize.y, 0.001), 0.001);
    vec2 displayScale = vec2(1.0);

    if (mediaAspect > planeAspect) {
      displayScale.y = planeAspect / mediaAspect;
    } else {
      displayScale.x = mediaAspect / planeAspect;
    }

    vec2 mediaMin = 0.5 - displayScale * 0.5;
    vec2 mediaMax = 0.5 + displayScale * 0.5;
    vec2 mask = smoothstep(mediaMin, mediaMin + vec2(0.002), uv) *
      (1.0 - smoothstep(mediaMax - vec2(0.002), mediaMax, uv));

    return mask.x * mask.y;
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
    vec2 motionUv = vUv;
    motionUv.x += (vUv.y - 0.5) * uVelocity * 0.016;

    float openedMix = uActive * uTransitionProgress;
    float containMix = 0.0;
    vec2 coverCurrentUv = coverUv(motionUv, uPlaneSize, uMediaSize, uObjectPosition);
    vec2 coverNextUv = coverUv(motionUv, uPlaneSize, uNextMediaSize, uObjectPosition);
    vec2 containCurrentUv = containUv(motionUv, uPlaneSize, uMediaSize);
    vec2 containNextUv = containUv(motionUv, uPlaneSize, uNextMediaSize);
    vec2 uv = mix(coverCurrentUv, containCurrentUv, containMix);
    vec2 nextUv = mix(coverNextUv, containNextUv, containMix);
    float currentContainMask = mix(1.0, containMask(motionUv, uPlaneSize, uMediaSize), containMix);
    float nextContainMask = mix(1.0, containMask(motionUv, uPlaneSize, uNextMediaSize), containMix);

    vec4 currentColor = texture2D(uTexture, clamp(uv, vec2(0.0), vec2(1.0))) * currentContainMask;
    vec4 nextColor = texture2D(uNextTexture, clamp(nextUv, vec2(0.0), vec2(1.0))) * nextContainMask;
    vec4 color = mix(currentColor, nextColor, uTextureMix);

    float horizontalEdge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    float verticalEdge = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
    float vignette = mix(0.62, 1.0, horizontalEdge * verticalEdge);
    float frameDistance = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float frameEdge = smoothstep(0.0, 0.018, frameDistance);
    float sliderEffects = 1.0 - openedMix;

    color.rgb *= mix(1.0, vignette, sliderEffects);
    color.rgb *= mix(1.0, mix(0.46, 1.0, frameEdge), sliderEffects);
    color.rgb *= 1.0 - (uDarkness * sliderEffects);

    float roundedMask = roundedBoxMask(vUv, uPlaneSize, uCornerRadius);
    gl_FragColor = vec4(color.rgb, color.a * uOpacity * roundedMask);
  }
`;
