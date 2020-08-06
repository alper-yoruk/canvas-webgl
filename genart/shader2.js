const canvasSketch = require("canvas-sketch");
const createShader = require("canvas-sketch-util/shader");
const glsl = require("glslify");

// Setup our sketch
const settings = {
  dimension: [512, 512],
  duration: 4,
  context: "webgl",
  animate: true,
  fps: 24,
};

// Your glsl code
const frag = glsl(`
  precision highp float;

  uniform float playhead;
  uniform float aspect;
  varying vec2 vUv;

  #pragma glslify: noise = require('glsl-noise/simplex/3d');
  #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

  void main () {
    vec3 colorA = vec3(1.0, 0., 0.5);
    vec3 colorB = vec3(0.1, 1.0, 0.8);

    vec2 center = vUv - 0.5;
    center.x *= aspect;

    float dist = length(center);

    float n = noise(vec3(center * 3.0 * cos(playhead), playhead));

    vec3 color = mix(colorA, colorB, 0.3 * sin(playhead));

    float alpha = smoothstep(0.2503, 0.25, dist);

    gl_FragColor = vec4(color, alpha);
  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
    clearColor: "white",
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      playhead: ({ playhead }) => playhead,
      aspect: ({ width, height }) => width / height,
    },
  });
};

canvasSketch(sketch, settings);
