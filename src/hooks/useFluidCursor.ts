interface SingleFBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}
interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: SingleFBO;
  write: SingleFBO;
  swap: () => void;
  setRead: (value: SingleFBO) => void;
  setWrite: (value: SingleFBO) => void;
}

interface ExtFormats {
  formatRGBA: { internalFormat: number; format: number } | null;
  formatRG: { internalFormat: number; format: number } | null;
  formatR: { internalFormat: number; format: number } | null;
  halfFloatTexType: number | undefined;
  supportLinearFiltering: boolean | undefined;
}

function initFluidCursor(): void {
  const canvas = document.getElementById("fluid") as HTMLCanvasElement | null;
  if (!canvas) {
    console.error("Canvas with id 'fluid' not found");
    return;
  }
  resizeCanvas();

  const config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1440,
    CAPTURE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 10.0,
    VELOCITY_DISSIPATION: 2.5,
    PRESSURE: 0.1,
    PRESSURE_ITERATIONS: 20,
    CURL: 2.0,
    SPLAT_RADIUS: 0.1,
    SPLAT_FORCE: 1000,
    SHADING: true,
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false,
    BACK_COLOR: { r: 0.5, g: 0, b: 0 },
    TRANSPARENT: true,
  };

  type Pointer = {
    id: number;
    texcoordX: number;
    texcoordY: number;
    prevTexcoordX: number;
    prevTexcoordY: number;
    deltaX: number;
    deltaY: number;
    down: boolean;
    moved: boolean;
    color: { r: number; g: number; b: number };
  };

  function pointerPrototype(this: Pointer) {
    this.id = -1;
    this.texcoordX = 0;
    this.texcoordY = 0;
    this.prevTexcoordX = 0;
    this.prevTexcoordY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.down = false;
    this.moved = false;
    this.color = { r: 0, g: 0, b: 0 };
  }

  const pointers: Pointer[] = [];
  pointers.push(new (pointerPrototype as unknown as { new (): Pointer })());

  const { gl, ext } = getWebGLContext(canvas);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array([0, 1, 2, 2, 3, 0]),
    gl.STATIC_DRAW
  );

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]),
    gl.STATIC_DRAW
  );

  function setPositionAttribute(program: WebGLProgram) {
    const posLoc = gl.getAttribLocation(program, "aPosition");
    if (posLoc !== -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    }
  }

  if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 256;
    config.SHADING = false;
  }

  function getWebGLContext(canvas: HTMLCanvasElement): {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    ext: ExtFormats;
  } {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null =
      canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
    if (!gl)
      gl = (canvas.getContext("webgl", params) ||
        canvas.getContext(
          "experimental-webgl",
          params
        )) as WebGLRenderingContext | null;
    if (!gl) {
      throw new Error("WebGL not supported");
    }
    const isWebGL2 = gl instanceof WebGL2RenderingContext;
    let halfFloat: { HALF_FLOAT_OES: number } | null = null;
    let supportLinearFiltering: boolean | undefined = undefined;
    if (isWebGL2) {
      (gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
      supportLinearFiltering = !!(gl as WebGL2RenderingContext).getExtension(
        "OES_texture_float_linear"
      );
    } else {
      halfFloat = (gl as WebGLRenderingContext).getExtension(
        "OES_texture_half_float"
      ) as { HALF_FLOAT_OES: number };
      supportLinearFiltering = !!(gl as WebGLRenderingContext).getExtension(
        "OES_texture_half_float_linear"
      );
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    const halfFloatTexType = isWebGL2
      ? (gl as WebGL2RenderingContext).HALF_FLOAT
      : halfFloat?.HALF_FLOAT_OES;
    if (halfFloatTexType === undefined) {
      throw new Error(
        "halfFloatTexType is undefined, required WebGL extension is not supported"
      );
    }
    let formatRGBA: { internalFormat: number; format: number } | null = null;
    let formatRG: { internalFormat: number; format: number } | null = null;
    let formatR: { internalFormat: number; format: number } | null = null;
    if (isWebGL2) {
      formatRGBA = getSupportedFormat(
        gl as WebGL2RenderingContext,
        (gl as WebGL2RenderingContext).RGBA16F,
        (gl as WebGL2RenderingContext).RGBA,
        halfFloatTexType
      );
      formatRG = getSupportedFormat(
        gl as WebGL2RenderingContext,
        (gl as WebGL2RenderingContext).RG16F,
        (gl as WebGL2RenderingContext).RG,
        halfFloatTexType
      );
      formatR = getSupportedFormat(
        gl as WebGL2RenderingContext,
        (gl as WebGL2RenderingContext).R16F,
        (gl as WebGL2RenderingContext).RED,
        halfFloatTexType
      );
    } else {
      formatRGBA = getSupportedFormat(
        gl as WebGLRenderingContext,
        (gl as WebGLRenderingContext).RGBA,
        (gl as WebGLRenderingContext).RGBA,
        halfFloatTexType
      );
      formatRG = getSupportedFormat(
        gl as WebGLRenderingContext,
        (gl as WebGLRenderingContext).RGBA,
        (gl as WebGLRenderingContext).RGBA,
        halfFloatTexType
      );
      formatR = getSupportedFormat(
        gl as WebGLRenderingContext,
        (gl as WebGLRenderingContext).RGBA,
        (gl as WebGLRenderingContext).RGBA,
        halfFloatTexType
      );
    }
    return {
      gl,
      ext: {
        formatRGBA,
        formatRG,
        formatR,
        halfFloatTexType,
        supportLinearFiltering,
      },
    };
  }

  function getSupportedFormat(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    internalFormat: GLenum,
    format: GLenum,
    type: GLenum
  ) {
    const R16F = 0x822d;
    const RG16F = 0x822f;
    const RGBA16F = 0x881a;
    const RG = 0x8227;
    const RGBA = 0x1908;
    if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
      switch (internalFormat) {
        case R16F:
          return getSupportedFormat(gl, RG16F, RG, type);
        case RG16F:
          return getSupportedFormat(gl, RGBA16F, RGBA, type);
        default:
          return null;
      }
    }
    return {
      internalFormat,
      format,
    };
  }

  function supportRenderTextureFormat(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    internalFormat: GLenum,
    format: GLenum,
    type: GLenum
  ) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      4,
      4,
      0,
      format,
      type,
      null
    );
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, 0x8ce0, gl.TEXTURE_2D, texture, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status == gl.FRAMEBUFFER_COMPLETE;
  }

  class Material {
    vertexShader: WebGLShader;
    fragmentShaderSource: string;
    programs: { [hash: number]: WebGLProgram };
    activeProgram: WebGLProgram | null;
    uniforms: Record<string, WebGLUniformLocation | null>;
    constructor(vertexShader: WebGLShader, fragmentShaderSource: string) {
      this.vertexShader = vertexShader;
      this.fragmentShaderSource = fragmentShaderSource;
      this.programs = {};
      this.activeProgram = null;
      this.uniforms = {};
    }
    setKeywords(keywords: string[]) {
      let hash = 0;
      for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);
      let program = this.programs[hash];
      if (program == null) {
        const fragmentShader = compileShader(
          gl.FRAGMENT_SHADER,
          this.fragmentShaderSource,
          keywords
        );
        program = createProgram(this.vertexShader, fragmentShader);
        this.programs[hash] = program;
      }
      if (program == this.activeProgram) return;
      this.uniforms = getUniforms(program);
      this.activeProgram = program;
    }
    bind() {
      if (this.activeProgram) {
        gl.useProgram(this.activeProgram);
        setPositionAttribute(this.activeProgram);
      }
    }
  }

  class Program {
    uniforms: Record<string, WebGLUniformLocation | null>;
    program: WebGLProgram;
    constructor(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      this.program = createProgram(vertexShader, fragmentShader);
      this.uniforms = getUniforms(this.program);
    }
    bind() {
      gl.useProgram(this.program);
      setPositionAttribute(this.program);
    }
  }

  function createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      console.trace(gl.getProgramInfoLog(program));

    return program;
  }

  function getUniforms(
    program: WebGLProgram
  ): Record<string, WebGLUniformLocation | null> {
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const uniformName = gl.getActiveUniform(program, i)?.name;
      if (uniformName) {
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
      }
    }
    return uniforms;
  }

  function compileShader(
    type: GLenum,
    source: string,
    keywords: string[] = []
  ): WebGLShader {
    source = addKeywords(source, keywords);
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Failed to create shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      console.trace(gl.getShaderInfoLog(shader));
    return shader;
  }

  function addKeywords(source: string, keywords: string[]) {
    if (keywords == null) return source;
    let keywordsString = "";
    keywords.forEach((keyword) => {
      keywordsString += "#define " + keyword + "\n";
    });

    return keywordsString + source;
  }

  const baseVertexShader = compileShader(
    gl.VERTEX_SHADER,
    `
         precision highp float;
     
         attribute vec2 aPosition;
         varying vec2 vUv;
         varying vec2 vL;
         varying vec2 vR;
         varying vec2 vT;
         varying vec2 vB;
         uniform vec2 texelSize;
     
         void main () {
             vUv = aPosition * 0.5 + 0.5;
             vL = vUv - vec2(texelSize.x, 0.0);
             vR = vUv + vec2(texelSize.x, 0.0);
             vT = vUv + vec2(0.0, texelSize.y);
             vB = vUv - vec2(0.0, texelSize.y);
             gl_Position = vec4(aPosition, 0.0, 1.0);
         }
     `,
    []
  );

  const copyShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
         precision mediump float;
         precision mediump sampler2D;
     
         varying highp vec2 vUv;
         uniform sampler2D uTexture;
     
         void main () {
             gl_FragColor = texture2D(uTexture, vUv);
         }
     `,
    []
  );

  const clearShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
         precision mediump float;
         precision mediump sampler2D;
     
         varying highp vec2 vUv;
         uniform sampler2D uTexture;
         uniform float value;
     
         void main () {
             gl_FragColor = value * texture2D(uTexture, vUv);
         }
     `,
    []
  );

  const displayShaderSource = `
         precision highp float;
         precision highp sampler2D;
     
         varying vec2 vUv;
         varying vec2 vL;
         varying vec2 vR;
         varying vec2 vT;
         varying vec2 vB;
         uniform sampler2D uTexture;
         uniform sampler2D uDithering;
         uniform vec2 ditherScale;
         uniform vec2 texelSize;
     
         vec3 linearToGamma (vec3 color) {
             color = max(color, vec3(0));
             return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
         }
     
         void main () {
             vec3 c = texture2D(uTexture, vUv).rgb;
     
         #ifdef SHADING
             vec3 lc = texture2D(uTexture, vL).rgb;
             vec3 rc = texture2D(uTexture, vR).rgb;
             vec3 tc = texture2D(uTexture, vT).rgb;
             vec3 bc = texture2D(uTexture, vB).rgb;
     
             float dx = length(rc) - length(lc);
             float dy = length(tc) - length(bc);
     
             vec3 n = normalize(vec3(dx, dy, length(texelSize)));
             vec3 l = vec3(0.0, 0.0, 1.0);
     
             float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
             c *= diffuse;
         #endif
     
             float a = max(c.r, max(c.g, c.b));
             gl_FragColor = vec4(c, a);
         }
     `;

  const splatShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
          precision highp float;
          precision highp sampler2D;
      
          varying vec2 vUv;
          uniform sampler2D uTarget;
          uniform float aspectRatio;
          uniform vec3 color;
          uniform vec2 point;
          uniform float radius;
      
          void main () {
              vec2 p = vUv - point.xy;
              p.x *= aspectRatio;
              // Уменьшаем коэффициент до 0.4
              vec3 splat = 0.4 * exp(-dot(p, p) / radius) * color;
              vec3 base = texture2D(uTarget, vUv).xyz;
              gl_FragColor = vec4(base + splat, 1.0);
          }
      `,
    []
  );

  const advectionShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
         precision highp float;
         precision highp sampler2D;
     
         varying vec2 vUv;
         uniform sampler2D uVelocity;
         uniform sampler2D uSource;
         uniform vec2 texelSize;
         uniform vec2 dyeTexelSize;
         uniform float dt;
         uniform float dissipation;
     
         vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
             vec2 st = uv / tsize - 0.5;
     
             vec2 iuv = floor(st);
             vec2 fuv = fract(st);
     
             vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
             vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
             vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
             vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
     
             return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
         }
     
         void main () {
         #ifdef MANUAL_FILTERING
             vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
             vec4 result = bilerp(uSource, coord, dyeTexelSize);
         #else
             vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
             vec4 result = texture2D(uSource, coord);
         #endif
             float decay = 1.0 + dissipation * dt;
             gl_FragColor = result / decay;
         }`,
    ext.supportLinearFiltering ? [] : ["MANUAL_FILTERING"]
  );

  const divergenceShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
         precision mediump float;
         precision mediump sampler2D;
     
         varying highp vec2 vUv;
         varying highp vec2 vL;
         varying highp vec2 vR;
         varying highp vec2 vT;
         varying highp vec2 vB;
         uniform sampler2D uVelocity;
     
         void main () {
             float L = texture2D(uVelocity, vL).x;
             float R = texture2D(uVelocity, vR).x;
             float T = texture2D(uVelocity, vT).y;
             float B = texture2D(uVelocity, vB).y;
     
             vec2 C = texture2D(uVelocity, vUv).xy;
             if (vL.x < 0.0) { L = -C.x; }
             if (vR.x > 1.0) { R = -C.x; }
             if (vT.y > 1.0) { T = -C.y; }
             if (vB.y < 0.0) { B = -C.y; }
     
             float div = 0.5 * (R - L + T - B);
             gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
         }
     `,
    []
  );

  const curlShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
         precision mediump float;
         precision mediump sampler2D;
     
         varying highp vec2 vUv;
         varying highp vec2 vL;
         varying highp vec2 vR;
         varying highp vec2 vT;
         varying highp vec2 vB;
         uniform sampler2D uVelocity;
     
         void main () {
             float L = texture2D(uVelocity, vL).y;
             float R = texture2D(uVelocity, vR).y;
             float T = texture2D(uVelocity, vT).x;
             float B = texture2D(uVelocity, vB).x;
             float vorticity = R - L - T + B;
             gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
         }
     `,
    []
  );

  const vorticityShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
         precision highp float;
         precision highp sampler2D;
     
         varying vec2 vUv;
         varying vec2 vL;
         varying vec2 vR;
         varying vec2 vT;
         varying vec2 vB;
         uniform sampler2D uVelocity;
         uniform sampler2D uCurl;
         uniform float curl;
         uniform float dt;
     
         void main () {
             float L = texture2D(uCurl, vL).x;
             float R = texture2D(uCurl, vR).x;
             float T = texture2D(uCurl, vT).x;
             float B = texture2D(uCurl, vB).x;
             float C = texture2D(uCurl, vUv).x;
     
             vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
             force /= length(force) + 0.0001;
             force *= curl * C;
             force.y *= -1.0;
     
             vec2 velocity = texture2D(uVelocity, vUv).xy;
             velocity += force * dt;
             velocity = min(max(velocity, -1000.0), 1000.0);
             gl_FragColor = vec4(velocity, 0.0, 1.0);
         }
     `,
    []
  );

  const pressureShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
         precision mediump float;
         precision mediump sampler2D;
     
         varying highp vec2 vUv;
         varying highp vec2 vL;
         varying highp vec2 vR;
         varying highp vec2 vT;
         varying highp vec2 vB;
         uniform sampler2D uPressure;
         uniform sampler2D uDivergence;
     
         void main () {
             float L = texture2D(uPressure, vL).x;
             float R = texture2D(uPressure, vR).x;
             float T = texture2D(uPressure, vT).x;
             float B = texture2D(uPressure, vB).x;
             float C = texture2D(uPressure, vUv).x;
             float divergence = texture2D(uDivergence, vUv).x;
             float pressure = (L + R + B + T - divergence) * 0.25;
             gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
         }
     `,
    []
  );

  const gradientSubtractShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
         precision mediump float;
         precision mediump sampler2D;
     
         varying highp vec2 vUv;
         varying highp vec2 vL;
         varying highp vec2 vR;
         varying highp vec2 vT;
         varying highp vec2 vB;
         uniform sampler2D uPressure;
         uniform sampler2D uVelocity;
     
         void main () {
             float L = texture2D(uPressure, vL).x;
             float R = texture2D(uPressure, vR).x;
             float T = texture2D(uPressure, vT).x;
             float B = texture2D(uPressure, vB).x;
             vec2 velocity = texture2D(uVelocity, vUv).xy;
             velocity.xy -= vec2(R - L, T - B);
             gl_FragColor = vec4(velocity, 0.0, 1.0);
         }
     `,
    []
  );

  const blit = (target: SingleFBO | null, clear = false) => {
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    if (clear) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };

  let dye: DoubleFBO;
  let velocity: DoubleFBO;
  let divergence: SingleFBO;
  let curl: SingleFBO;
  let pressure: DoubleFBO;

  const copyProgram = new Program(baseVertexShader, copyShader);
  const clearProgram = new Program(baseVertexShader, clearShader);
  const splatProgram = new Program(baseVertexShader, splatShader);
  const advectionProgram = new Program(baseVertexShader, advectionShader);
  const divergenceProgram = new Program(baseVertexShader, divergenceShader);
  const curlProgram = new Program(baseVertexShader, curlShader);
  const vorticityProgram = new Program(baseVertexShader, vorticityShader);
  const pressureProgram = new Program(baseVertexShader, pressureShader);
  const gradienSubtractProgram = new Program(
    baseVertexShader,
    gradientSubtractShader
  );

  const displayMaterial = new Material(baseVertexShader, displayShaderSource);

  function initFramebuffers() {
    const simRes = getResolution(config.SIM_RESOLUTION);
    const dyeRes = getResolution(config.DYE_RESOLUTION);
    const texType = ext.halfFloatTexType;
    if (texType === undefined)
      throw new Error(
        "halfFloatTexType is undefined, required WebGL extension is not supported"
      );
    const rgba = ext.formatRGBA;
    const rg = ext.formatRG;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    gl.disable(gl.BLEND);
    if (!rgba || !rg || !r) throw new Error("Framebuffer format not supported");
    if (dye == null)
      dye = createDoubleFBO(
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    else
      dye = resizeDoubleFBO(
        dye,
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    if (velocity == null)
      velocity = createDoubleFBO(
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );
    else
      velocity = resizeDoubleFBO(
        velocity,
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );
    divergence = createFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
    curl = createFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
    pressure = createDoubleFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
  }

  function createFBO(
    w: number,
    h: number,
    internalFormat: GLenum,
    format: GLenum,
    type: GLenum,
    param: GLenum
  ) {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      w,
      h,
      0,
      format,
      type,
      null
    );
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, 0x8ce0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const texelSizeX = 1.0 / w;
    const texelSizeY = 1.0 / h;
    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX,
      texelSizeY,
      attach(id: number) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  function createDoubleFBO(
    w: number,
    h: number,
    internalFormat: GLenum,
    format: GLenum,
    type: GLenum,
    param: GLenum
  ): DoubleFBO {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = createFBO(w, h, internalFormat, format, type, param);

    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() {
        return fbo1;
      },
      setRead(value: SingleFBO) {
        fbo1 = value;
      },
      get write() {
        return fbo2;
      },
      setWrite(value: SingleFBO) {
        fbo2 = value;
      },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      },
    };
  }

  function resizeFBO(
    target: SingleFBO,
    w: number,
    h: number,
    internalFormat: GLenum,
    format: GLenum,
    type: GLenum,
    param: GLenum
  ) {
    const newFBO = createFBO(w, h, internalFormat, format, type, param);
    copyProgram.bind();
    gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
    blit(newFBO);
    return newFBO;
  }

  function resizeDoubleFBO(
    target: DoubleFBO,
    w: number,
    h: number,
    internalFormat: GLenum,
    format: GLenum,
    type: GLenum,
    param: GLenum
  ): DoubleFBO {
    if (target.width == w && target.height == h) return target;
    target.setRead(
      resizeFBO(target.read, w, h, internalFormat, format, type, param)
    );
    target.setWrite(createFBO(w, h, internalFormat, format, type, param));
    target.width = w;
    target.height = h;
    target.texelSizeX = 1.0 / w;
    target.texelSizeY = 1.0 / h;
    return target;
  }

  function updateKeywords() {
    const displayKeywords = [];
    if (config.SHADING) displayKeywords.push("SHADING");
    displayMaterial.setKeywords(displayKeywords);
  }

  updateKeywords();
  initFramebuffers();

  let lastUpdateTime = Date.now();
  let colorUpdateTimer = 0.0;

  function update() {
    const dt = calcDeltaTime();
    if (resizeCanvas()) initFramebuffers();
    updateColors(dt);
    applyInputs();
    step(dt);
    render(null);
    requestAnimationFrame(update);
  }

  function calcDeltaTime() {
    const now = Date.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastUpdateTime = now;
    return dt;
  }

  function resizeCanvas() {
    if (!canvas) return false;
    const width = scaleByPixelRatio(canvas.clientWidth);
    const height = scaleByPixelRatio(canvas.clientHeight);
    if (canvas.width != width || canvas.height != height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  function updateColors(dt: number) {
    colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorUpdateTimer >= 1) {
      colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
      pointers.forEach((p) => {
        p.color = generateColor();
      });
    }
  }

  function applyInputs() {
    pointers.forEach((p) => {
      if (p.moved) {
        p.moved = false;
        splatPointer(p);
      }
    });
  }

  function step(dt: number) {
    gl.disable(gl.BLEND);

    curlProgram.bind();
    gl.uniform2f(
      curlProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    vorticityProgram.bind();
    gl.uniform2f(
      vorticityProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    divergenceProgram.bind();
    gl.uniform2f(
      divergenceProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    pressureProgram.bind();
    gl.uniform2f(
      pressureProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    gradienSubtractProgram.bind();
    gl.uniform2f(
      gradienSubtractProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    gl.uniform1i(
      gradienSubtractProgram.uniforms.uPressure,
      pressure.read.attach(0)
    );
    gl.uniform1i(
      gradienSubtractProgram.uniforms.uVelocity,
      velocity.read.attach(1)
    );
    blit(velocity.write);
    velocity.swap();

    advectionProgram.bind();
    gl.uniform2f(
      advectionProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
    if (!ext.supportLinearFiltering)
      gl.uniform2f(
        advectionProgram.uniforms.dyeTexelSize,
        velocity.texelSizeX,
        velocity.texelSizeY
      );
    const velocityId = velocity.read.attach(0);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
    gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(
      advectionProgram.uniforms.dissipation,
      config.VELOCITY_DISSIPATION
    );
    blit(velocity.write);
    velocity.swap();

    if (!ext.supportLinearFiltering)
      gl.uniform2f(
        advectionProgram.uniforms.dyeTexelSize,
        dye.texelSizeX,
        dye.texelSizeY
      );
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(
      advectionProgram.uniforms.dissipation,
      config.DENSITY_DISSIPATION
    );
    blit(dye.write);
    dye.swap();
  }

  function render(target: SingleFBO | null) {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    drawDisplay(target);
  }

  function drawDisplay(target: SingleFBO | null) {
    const width = target == null ? gl.drawingBufferWidth : target.width;
    const height = target == null ? gl.drawingBufferHeight : target.height;

    displayMaterial.bind();
    if (config.SHADING)
      gl.uniform2f(
        displayMaterial.uniforms.texelSize,
        1.0 / width,
        1.0 / height
      );
    gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
    blit(target);
  }

  function splatPointer(pointer: Pointer) {
    const dx = pointer.deltaX * config.SPLAT_FORCE;
    const dy = pointer.deltaY * config.SPLAT_FORCE;
    splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
  }

  function clickSplat(pointer: Pointer) {
    const color = generateColor();

    color.r *= 2.0;
    color.g *= 2.0;
    color.b *= 2.0;
    const dx = 10 * (Math.random() - 0.5);
    const dy = 30 * (Math.random() - 0.5);
    splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
  }

  function splat(
    x: number,
    y: number,
    dx: number,
    dy: number,
    color: { r: number; g: number; b: number }
  ) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    const aspectRatio =
      canvas && canvas.height !== 0 ? canvas.width / canvas.height : 1;
    gl.uniform1f(splatProgram.uniforms.aspectRatio, aspectRatio);
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(
      splatProgram.uniforms.radius,
      correctRadius(config.SPLAT_RADIUS / 100.0, canvas)
    );
    blit(velocity.write);
    velocity.swap();
    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(dye.write);
    dye.swap();
  }

  function correctRadius(radius: number, canvas: HTMLCanvasElement | null) {
    const c = canvas;
    if (!c) return radius;
    if (c.height === 0) return radius;
    const aspectRatio = c.width / c.height;
    if (aspectRatio > 1) radius *= aspectRatio;
    return radius;
  }

  window.addEventListener("mousedown", (e) => {
    const pointer = pointers[0];
    const posX = scaleByPixelRatio(e.clientX);
    const posY = scaleByPixelRatio(e.clientY);
    updatePointerDownData(pointer, -1, posX, posY);
    clickSplat(pointer);
  });

  window.addEventListener("mousemove", (e) => {
    const pointer = pointers[0];
    const posX = scaleByPixelRatio(e.clientX);
    const posY = scaleByPixelRatio(e.clientY);
    const color = pointer.color;
    updatePointerMoveData(pointer, posX, posY, color);
  });

  window.addEventListener("touchstart", (e) => {
    const touches = e.targetTouches;
    const pointer = pointers[0];
    for (let i = 0; i < touches.length; i++) {
      const posX = scaleByPixelRatio(touches[i].clientX);
      const posY = scaleByPixelRatio(touches[i].clientY);
      updatePointerDownData(pointer, touches[i].identifier, posX, posY);
    }
  });

  window.addEventListener(
    "touchmove",
    (e) => {
      const touches = e.targetTouches;
      const pointer = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        const posX = scaleByPixelRatio(touches[i].clientX);
        const posY = scaleByPixelRatio(touches[i].clientY);
        updatePointerMoveData(pointer, posX, posY, pointer.color);
      }
    },
    false
  );

  window.addEventListener("touchend", (e) => {
    const touches = e.changedTouches;
    const pointer = pointers[0];
    for (let i = 0; i < touches.length; i++) {
      updatePointerUpData(pointer);
    }
  });

  function updatePointerDownData(
    pointer: Pointer,
    id: number,
    posX: number,
    posY: number
  ) {
    pointer.id = id;
    pointer.down = true;
    pointer.moved = false;
    if (!canvas) return;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = generateColor();
  }

  function updatePointerMoveData(
    pointer: Pointer,
    posX: number,
    posY: number,
    color: { r: number; g: number; b: number }
  ) {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    if (!canvas) return;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved =
      Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    pointer.color = color;
  }

  function updatePointerUpData(pointer: Pointer) {
    pointer.down = false;
  }

  function correctDeltaX(delta: number) {
    if (!canvas) return delta;
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
  }

  function correctDeltaY(delta: number) {
    if (!canvas) return delta;
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
  }

  function generateColor(): { r: number; g: number; b: number } {
    const c = HSVtoRGB(Math.random(), 1.0, 1.0);
    return {
      r: c.r ?? 0,
      g: c.g ?? 0,
      b: c.b ?? 0,
    };
  }

  function HSVtoRGB(
    h: number,
    s: number,
    v: number
  ): { r: number; g: number; b: number } {
    let r = 0,
      g = 0,
      b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
    }
    return { r, g, b };
  }

  function wrap(value: number, min: number, max: number) {
    const range = max - min;
    if (range == 0) return min;
    return ((value - min) % range) + min;
  }

  function getResolution(resolution: number) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);

    if (gl.drawingBufferWidth > gl.drawingBufferHeight)
      return { width: max, height: min };
    else return { width: min, height: max };
  }

  function scaleByPixelRatio(input: number) {
    const pixelRatio = window.devicePixelRatio || 1;
    return Math.floor(input * pixelRatio);
  }

  function hashCode(s: string) {
    if (s.length == 0) return 0;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  update();
}

export default initFluidCursor;
