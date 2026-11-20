/**
 * Gamehendge 3D PSX Post-Processor & Vertex Jitter Engine
 * Emulates PlayStation 1 Affine Polygon Jitter, 320x240 Framebuffer & 16-bit Bayer Dithering
 */

import * as THREE from '../vendor/three.module.js';

export const PSX_CONFIG = {
  baseWidth: 320,
  baseHeight: 240,
  snapX: 160.0,
  snapY: 120.0,
  colorDepth: 32.0, // 5 bits per channel (RGB555)
  ditherStrength: 1.0
};

export const BAYER_4X4 = [
  0.0 / 16.0,  8.0 / 16.0,  2.0 / 16.0, 10.0 / 16.0,
 12.0 / 16.0,  4.0 / 16.0, 14.0 / 16.0,  6.0 / 16.0,
  3.0 / 16.0, 11.0 / 16.0,  1.0 / 16.0,  9.0 / 16.0,
 15.0 / 16.0,  7.0 / 16.0, 13.0 / 16.0,  5.0 / 16.0
];

export function computeInternalResolution(screenWidth, screenHeight) {
  const aspect = screenWidth / screenHeight;
  if (aspect >= 1.5) {
    // 16:9 widescreen PSX mode (e.g. 384x216)
    return { width: 384, height: 216 };
  }
  // Standard 4:3 PSX mode (320x240)
  return { width: 320, height: 240 };
}

/**
 * Injects subpixel vertex grid snapping into Three.js materials to recreate PS1 polygon wobble
 */
export function applyPSXVertexJitter(material, snapX = PSX_CONFIG.snapX, snapY = PSX_CONFIG.snapY) {
  if (!material) return;

  const previousHook = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    if (previousHook) previousHook(shader, renderer);

    const snapSnippet = `
      // PS1 Affine Subpixel Vertex Jitter
      vec4 psxPos = gl_Position;
      psxPos.xyz /= psxPos.w;
      psxPos.xy = floor(psxPos.xy * vec2(${snapX.toFixed(1)}, ${snapY.toFixed(1)})) / vec2(${snapX.toFixed(1)}, ${snapY.toFixed(1)});
      psxPos.xyz *= psxPos.w;
      gl_Position = psxPos;
    `;

    if (shader.vertexShader.includes('#include <project_vertex>')) {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        `#include <project_vertex>\n${snapSnippet}`
      );
    } else {
      const lastBrace = shader.vertexShader.lastIndexOf('}');
      if (lastBrace !== -1) {
        shader.vertexShader = shader.vertexShader.slice(0, lastBrace) + snapSnippet + '\n}';
      }
    }
  };
}

/**
 * PSX Post-Processor: Low-res render target & 16-bit Bayer dithering shader pass
 */
export class PSXPostProcessor {
  constructor(renderer, width = 320, height = 240) {
    this.renderer = renderer;
    this.targetWidth = width;
    this.targetHeight = height;

    this.renderTarget = new THREE.WebGLRenderTarget(this.targetWidth, this.targetHeight, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      depthBuffer: true
    });

    // Fullscreen Orthographic Scene for Dither Quad
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.postScene = new THREE.Scene();

    const ditherShader = {
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        resolution: { value: new THREE.Vector2(this.targetWidth, this.targetHeight) },
        colorDepth: { value: PSX_CONFIG.colorDepth },
        ditherStrength: { value: PSX_CONFIG.ditherStrength }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float colorDepth;
        uniform float ditherStrength;
        varying vec2 vUv;

        const mat4 bayer = mat4(
           0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
          12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
           3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
          15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
        );

        void main() {
          vec4 col = texture2D(tDiffuse, vUv);
          
          // Compute screen pixel coords
          int x = int(mod(gl_FragCoord.x, 4.0));
          int y = int(mod(gl_FragCoord.y, 4.0));
          float dither = bayer[x][y] - 0.5;

          // 15-bit RGB555 quantization with dither dispersion
          vec3 dithered = col.rgb + (dither / colorDepth) * ditherStrength;
          dithered = floor(dithered * colorDepth) / colorDepth;

          gl_FragColor = vec4(dithered, col.a);
        }
      `
    };

    this.postMaterial = new THREE.ShaderMaterial(ditherShader);
    this.postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMaterial);
    this.postScene.add(this.postQuad);
  }

  setSize(screenWidth, screenHeight) {
    const res = computeInternalResolution(screenWidth, screenHeight);
    this.targetWidth = res.width;
    this.targetHeight = res.height;

    this.renderTarget.setSize(this.targetWidth, this.targetHeight);
    if (this.postMaterial && this.postMaterial.uniforms) {
      this.postMaterial.uniforms.resolution.value.set(this.targetWidth, this.targetHeight);
    }
  }

  render(scene, camera) {
    if (!this.renderer) return;

    // 1. Render main 3D scene to low-res target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.clear();
    this.renderer.render(scene, camera);

    // 2. Render dither quad to screen canvas
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);
  }

  dispose() {
    this.renderTarget.dispose();
    this.postMaterial.dispose();
    this.postQuad.geometry.dispose();
  }
}
