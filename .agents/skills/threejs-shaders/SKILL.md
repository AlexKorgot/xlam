---
name: threejs-shaders
description: Project-specific ShaderMaterial and GLSL guidance for the Next 16 WebGL video slider with curved video planes, unbend transition, fullscreen morph, and DOM overlay.
---

# Three.js Shaders for WebGL Video Slider

Use this skill only for the project WebGL video slider:

curved video slider → selected video plane unbends → fullscreen video background → DOM overlay.

## Use for

- `THREE.ShaderMaterial`
- GLSL vertex and fragment shaders
- video plane deformation
- `THREE.VideoTexture` sampling
- GSAP-driven shader uniforms
- curved plane bend
- unbend transition
- fullscreen morph
- video cover/crop
- inactive slide dimming
- subtle velocity/motion distortion

## Do not use for

- generic shader demos
- ShaderToy ports
- Fresnel/rim lighting demos
- dissolve effects unless explicitly requested
- particles
- instanced shader examples
- lighting/PBR materials
- postprocessing
- procedural art unrelated to the slider
- rendering text or UI in WebGL
- replacing DOM UI with canvas UI
- `RawShaderMaterial` unless explicitly required
- `onBeforeCompile` unless modifying an existing built-in material is explicitly required

## ShaderMaterial rules

Use `ShaderMaterial` for video planes.

Prefer simple, explicit uniforms over complex material abstraction.

Required shader responsibilities:

- bend the plane in the vertex shader
- reduce bend during opening transition
- morph the selected slide to fullscreen
- preserve correct video aspect ratio
- dim inactive slides
- support opacity transitions
- support optional velocity distortion

## Recommended uniforms

Use project-specific names consistently:

- `uTexture`
- `uTime`
- `uBend`
- `uTransitionProgress`
- `uActive`
- `uOpacity`
- `uDarkness`
- `uVelocity`
- `uViewportSize`
- `uMediaSize`
- `uPlaneSize`

Optional only if needed:

- `uVignette`
- `uGrain`
- `uMouse`
- `uReducedMotion`

## Vertex shader guidance

Vertex shader should control:

- curved slider shape
- unbend transition
- scale/fullscreen morph
- subtle motion deformation
- perspective-friendly displacement

Keep vertex deformation predictable and easy to drive from GSAP.

Avoid random/noise-driven geometry unless explicitly requested.

## Fragment shader guidance

Fragment shader should control:

- video texture sampling
- object-fit cover behavior
- dimming
- opacity
- optional vignette/darkness
- optional very light grain/noise only if cheap

Avoid expensive loops, heavy noise, complex branching, and postprocessing-style effects.

## Video cover/crop

The shader must support CSS-like `object-fit: cover` behavior for video texture sampling.

Use viewport/media/plane aspect ratio uniforms instead of hardcoded crop values.

Do not stretch video.

## Performance rules

- Keep uniforms minimal and grouped where practical.
- Avoid heavy branching in fragment shader.
- Prefer `mix`, `step`, and `smoothstep` over complex `if/else`.
- Move calculations to JavaScript when they do not need to run per-pixel.
- Avoid heavy noise in fragment shader.
- Avoid postprocessing in the first implementation.
- Avoid transparent overdraw where possible.
- Test on mobile Safari.
- Do not use shader effects that require all videos to play simultaneously.

## Integration rules

- GSAP may animate uniforms.
- Three.js owns rendering.
- React/DOM owns text and UI.
- Do not use React Three Fiber unless explicitly requested.
- Do not use Editframe/render-to-video patterns.
- Do not call `gl.finish()`.
- Do not require `preserveDrawingBuffer: true`.

## Debugging rules

For debugging, prefer temporary visual outputs:

- UV debug
- crop debug
- opacity debug
- transition progress debug
- bend amount debug

Remove debug shader outputs before final implementation.