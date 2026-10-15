/* DecayCard, adapted from the React Bits component supplied for Real Piece.
   The original simplex-noise shaders are retained; image mapping uses contain. */
(() => {
  'use strict';

  const VERTEX = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
  gl_Position = vec4(position, 0.0, 1.0);
}`;
  const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uImage;
uniform vec2 uSize;
uniform vec2 uImageSize;
uniform float uUnit;
uniform float uScale;
uniform float uIdle;
uniform float uFrequency;
uniform int uOctaves;
uniform float uSeed;
uniform float uRadius;
uniform float uTime;
uniform float uFlow;
uniform float uChroma;
uniform float uGray;
uniform float uReady;
in vec2 vUv;
out vec4 fragColor;

vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n = 1.0 / 7.0;
  vec3 ns = n * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float turbulence(vec2 p, float z) {
  float sum = 0.0;
  float amp = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= uOctaves) break;
    sum += abs(snoise(vec3(p, z))) * amp;
    p = p * 2.0 + 19.19;
    amp *= 0.5;
  }
  return clamp(sum * 0.45 + 0.231, 0.0, 1.0);
}

float roundedBox(vec2 p, vec2 extent, float r) {
  vec2 q = abs(p) - extent + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec3 sampleImage(vec2 view) {
  vec2 uv = view / vec2(600.0, 750.0);
  float card = 600.0 / 750.0;
  float image = uImageSize.x / max(1.0, uImageSize.y);
  vec2 scale = card > image ? vec2(card / image, 1.0) : vec2(1.0, image / card);
  return texture(uImage, (uv - 0.5) * scale + 0.5).rgb;
}

void main() {
  vec2 view = vec2(300.0, 375.0) + (vUv * uSize - uSize * 0.5) / uUnit;
  float inside = min(min(view.x, 600.0 - view.x), min(view.y, 750.0 - view.y));
  float rim = 1.0 - smoothstep(0.0, 160.0, inside);
  float drift = snoise(vec3(view * 0.004 + uSeed * 0.37, uTime * 0.12)) * 0.5 + 0.5;
  float idle = uIdle * mix(smoothstep(0.55, 0.95, drift) * 0.5, 0.25 + 0.75 * smoothstep(0.3, 0.8, drift), rim);
  float scale = uScale * mix(0.2, 1.0, rim) + idle * 120.0;
  vec2 offset = vec2(0.0);
  if (scale > 0.01) {
    vec2 p = view * uFrequency + vec2(uSeed * 17.31, uSeed * 9.17);
    float z = uTime * (uFlow * 0.35 + uIdle * 0.5) + uSeed * 3.1;
    float red = turbulence(p, z);
    float blue = turbulence(p + vec2(31.7, 47.3), z + 5.3);
    offset = scale * (vec2(red, blue) - 0.5);
  }
  vec2 source = view + offset;
  float imageAspect = uImageSize.x / max(1.0, uImageSize.y);
  vec2 imageExtent = imageAspect < 0.8 ? vec2(375.0 * imageAspect, 375.0) : vec2(300.0, 300.0 / imageAspect);
  float edge = roundedBox(source - vec2(300.0, 375.0), imageExtent, uRadius);
  float alpha = (1.0 - smoothstep(-0.75 / uUnit, 0.75 / uUnit, edge)) * uReady;
  vec3 color = sampleImage(source);
  if (uChroma > 0.0) {
    vec2 split = offset * uChroma * 0.08 + vec2(uChroma * min(scale, 200.0) * 0.012, 0.0);
    color.r = sampleImage(source + split).r;
    color.b = sampleImage(source - split).b;
  }
  color = mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), uGray);
  fragColor = vec4(color * alpha, alpha);
}`;
  const instances = new Map();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function createCard(root) {
    const image = root.querySelector('.decay-card__fallback');
    const canvas = root.querySelector('.decay-card__canvas');
    if (!image || !canvas) return null;
    let gl;
    try {
      gl = canvas.getContext('webgl2', {
        alpha: true, premultipliedAlpha: true, antialias: false,
        powerPreference: 'low-power'
      });
    } catch {
      return null;
    }
    if (!gl) return null;

    let program;
    let texture;
    let buffer;
    let vertex;
    let fragment;
    let alive = true;
    let raf = 0;
    let lastTime = 0;
    const uniforms = {};
    const state = {
      visible: true, ready: false, hovered: false,
      cursorX: 0, cursorY: 0, lastX: 0, lastY: 0,
      nx: 0, ny: 0, x: 0, y: 0, rotate: 0, level: 0, time: 0,
      imageWidth: 1, imageHeight: 1
    };

    function showFallback() {
      root.classList.remove('is-decay-ready');
      root.style.removeProperty('transform');
    }

    function release() {
      cancelAnimationFrame(raf);
      raf = 0;
      if (texture) gl.deleteTexture(texture);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      texture = buffer = program = vertex = fragment = null;
    }

    function compile(type, source) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Shader unavailable');
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error('Shader compilation failed');
      }
      return shader;
    }

    try {
      vertex = compile(gl.VERTEX_SHADER, VERTEX);
      fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
      program = gl.createProgram();
      if (!program) throw new Error('Program unavailable');
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.bindAttribLocation(program, 0, 'position');
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program linking failed');
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      vertex = fragment = null;
      buffer = gl.createBuffer();
      texture = gl.createTexture();
      if (!buffer || !texture) throw new Error('WebGL resource unavailable');
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      for (const name of ['uImage', 'uSize', 'uImageSize', 'uUnit', 'uScale', 'uIdle',
        'uFrequency', 'uOctaves', 'uSeed', 'uRadius', 'uTime', 'uFlow', 'uChroma', 'uGray', 'uReady']) {
        uniforms[name] = gl.getUniformLocation(program, name);
      }
    } catch {
      release();
      showFallback();
      return null;
    }

    function draw() {
      if (!alive || !state.ready || !program || gl.isContextLost()) return false;
      const width = canvas.width;
      const height = canvas.height;
      if (!width || !height) return false;
      // The image occupies the root; the 124% canvas leaves room for the torn edges.
      const unit = Math.min(width / (600 * 1.24), height / (750 * 1.24));
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.uImage, 0);
      gl.uniform2f(uniforms.uSize, width, height);
      gl.uniform2f(uniforms.uImageSize, state.imageWidth, state.imageHeight);
      gl.uniform1f(uniforms.uUnit, unit);
      gl.uniform1f(uniforms.uScale, state.level * 0.4 * 440);
      gl.uniform1f(uniforms.uIdle, 0);
      gl.uniform1f(uniforms.uFrequency, 0.003 + 0.25 * 0.047);
      gl.uniform1i(uniforms.uOctaves, 5);
      gl.uniform1f(uniforms.uSeed, 4);
      gl.uniform1f(uniforms.uRadius, 0);
      gl.uniform1f(uniforms.uTime, state.time);
      gl.uniform1f(uniforms.uFlow, 0);
      gl.uniform1f(uniforms.uChroma, 0);
      gl.uniform1f(uniforms.uGray, 0);
      gl.uniform1f(uniforms.uReady, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return true;
    }

    function frame(now) {
      raf = 0;
      if (!alive || !state.visible || document.hidden || !state.ready) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      state.time += dt;
      const speed = Math.hypot(state.cursorX - state.lastX, state.cursorY - state.lastY) / dt;
      state.lastX = state.cursorX;
      state.lastY = state.cursorY;
      const targetX = state.hovered ? state.nx * 8 : 0;
      const targetY = state.hovered ? state.ny * 8 : 0;
      const targetRotate = state.hovered ? state.nx * 3 : 0;
      const follow = 1 - Math.exp(-dt / 0.16);
      state.x += (targetX - state.x) * follow;
      state.y += (targetY - state.y) * follow;
      state.rotate += (targetRotate - state.rotate) * follow;
      const wanted = state.hovered ? Math.max(0.02, clamp(speed / 1455, 0, 1) ** 2) : 0;
      const recovery = wanted > state.level ? 0.08 : 0.65;
      state.level += (wanted - state.level) * (1 - Math.exp(-dt / recovery));
      const settling = Math.abs(targetX - state.x) + Math.abs(targetY - state.y) +
        Math.abs(targetRotate - state.rotate) > 0.04 || Math.abs(wanted - state.level) > 0.001;
      if (!settling) {
        state.x = targetX;
        state.y = targetY;
        state.rotate = targetRotate;
        state.level = wanted;
      }
      root.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) rotate(${state.rotate.toFixed(3)}deg)`;
      draw();
      if (settling || speed > 1) raf = requestAnimationFrame(frame);
    }

    function wake() {
      if (raf || !alive || !state.ready || !state.visible || document.hidden) return;
      lastTime = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function resize() {
      if (!alive) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      draw();
    }

    function loadImage() {
      if (!alive || !image.complete || !image.naturalWidth) return;
      try {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        state.imageWidth = image.naturalWidth;
        state.imageHeight = image.naturalHeight;
        state.ready = true;
        resize();
        if (draw() && gl.getError() === gl.NO_ERROR) {
          root.classList.add('is-decay-ready');
        } else {
          state.ready = false;
          showFallback();
        }
      } catch {
        state.ready = false;
        showFallback();
      }
    }

    function move(event) {
      if (event.pointerType === 'touch') return;
      const rect = root.getBoundingClientRect();
      if (!state.hovered) {
        state.lastX = event.clientX;
        state.lastY = event.clientY;
      }
      state.hovered = true;
      state.cursorX = event.clientX;
      state.cursorY = event.clientY;
      state.nx = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      state.ny = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
      wake();
    }

    function leave() {
      state.hovered = false;
      state.lastX = state.cursorX;
      state.lastY = state.cursorY;
      wake();
    }

    function pageVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
        state.hovered = false;
        state.lastX = state.cursorX;
        state.lastY = state.cursorY;
      } else wake();
    }

    function contextLost(event) {
      event.preventDefault();
      state.ready = false;
      cancelAnimationFrame(raf);
      raf = 0;
      showFallback();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    const visibilityObserver = new IntersectionObserver(entries => {
      state.visible = entries.some(entry => entry.isIntersecting);
      if (state.visible) wake();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
        state.hovered = false;
        state.lastX = state.cursorX;
        state.lastY = state.cursorY;
      }
    });
    visibilityObserver.observe(root);
    root.addEventListener('pointerenter', move, { passive: true });
    root.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('pointerleave', leave, { passive: true });
    root.addEventListener('pointercancel', leave, { passive: true });
    canvas.addEventListener('webglcontextlost', contextLost);
    image.addEventListener('load', loadImage);
    document.addEventListener('visibilitychange', pageVisibility);
    resize();
    loadImage();

    return {
      destroy() {
        alive = false;
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        root.removeEventListener('pointerenter', move);
        root.removeEventListener('pointermove', move);
        root.removeEventListener('pointerleave', leave);
        root.removeEventListener('pointercancel', leave);
        canvas.removeEventListener('webglcontextlost', contextLost);
        image.removeEventListener('load', loadImage);
        document.removeEventListener('visibilitychange', pageVisibility);
        showFallback();
        release();
      }
    };
  }

  function refresh() {
    for (const [root, instance] of instances) {
      if (!root.isConnected || reducedMotion.matches || !finePointer.matches) {
        instance?.destroy();
        instances.delete(root);
      }
    }
    if (reducedMotion.matches || !finePointer.matches || !window.ResizeObserver || !window.IntersectionObserver) return;
    document.querySelectorAll('[data-decay-card]').forEach(root => {
      if (!instances.has(root)) instances.set(root, createCard(root));
    });
  }

  reducedMotion.addEventListener('change', refresh);
  finePointer.addEventListener('change', refresh);
  window.refreshDecayCards = refresh;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true });
  else refresh();
})();
