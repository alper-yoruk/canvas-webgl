const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");
const eases = require("eases");
const BezierEasing = require("bezier-easing");
const glslify = require("glslify");

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const settings = {
  dimensions: [512, 512],
  fps: 24,
  duration: 4,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  // Turn on MSAA
  attributes: { antialise: true },
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  });
  const palette = random.pick(palettes);

  // WebGL background color
  renderer.setClearColor(palette[1], 1);

  // Setup a camera, we will update its settings on resize
  const camera = new THREE.OrthographicCamera();

  // Setup your scene
  const scene = new THREE.Scene();

  const fragmentShader = `
    varying vec2 vUv;
    uniform vec3 color;

    void main() {
        gl_FragColor = vec4(vec3(color * vUv.x), 1.0);
    }
  `;

  const vertexShader = glslify(`
    varying vec2 vUv;
    uniform float time;
    
    #pragma glslify: noise = require('glsl-noise/simplex/4d');

    void main() {
        vUv = uv;
        vec3 pos = position.xyz;
        pos += noise(vec4(position.xyz, sin(time)));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `);

  const box = new THREE.BoxGeometry(1, 1, 1);
  const meshes = [];
  for (let i = 0; i < 30; i++) {
    const mesh = new THREE.Mesh(
      box,
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          color: { value: new THREE.Color(random.pick(palette)) },
          time: { value: 0 },
        },
      })
    );
    mesh.position.set(
      random.range(-1, 1),
      random.range(-1, 1),
      random.range(-1, 1)
    );
    mesh.scale.set(
      random.range(-1, 1),
      random.range(-1, 1),
      random.range(-1, 1)
    );
    mesh.scale.multiplyScalar(0.25);
    scene.add(mesh);
    meshes.push(mesh);
  }

  scene.add(new THREE.AmbientLight("hsl(1, 10%, 50%)"));

  const light = new THREE.DirectionalLight("white", 1);
  light.position.set(0, 4, 0);
  scene.add(light);

  const easeFn = BezierEasing(0.81, 0.25, 0.69, 0.78);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      const aspect = viewportWidth / viewportHeight;

      // Ortho zoom
      const zoom = 1.0;

      // Bounds
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      // Near/Far
      camera.near = -100;
      camera.far = 100;

      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      // Update the camera
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ playhead, time }) {
      const t = Math.sin(playhead * Math.PI * 2);
      scene.rotation.z = easeFn(t);

      meshes.forEach((mesh) => {
        mesh.material.uniforms.time.value = time;
      });

      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      renderer.dispose();
    },
  };
};

canvasSketch(sketch, settings);