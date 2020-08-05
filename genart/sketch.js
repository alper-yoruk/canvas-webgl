const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");
const { getRandomSeed } = require("canvas-sketch-util/random");

random.setSeed(random.getRandomSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: [2048, 2048],
};

const sketch = () => {
  const palette = random.pick(palettes);

  const createGrid = () => {
    const points = [];
    const count = 30;

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        const radius = Math.abs(random.noise2D(u, v) * 0.05);
        points.push({
          color: random.pick(palette),
          // radius: Math.abs(random.value() * 0.02),
          radius,
          position: [u, v],
          rotation: random.noise2D(u, v),
        });
      }
    }
    return points;
  };

  //random.setSeed(555);
  const points = createGrid().filter(() => random.gaussian() > 0.5);
  const margin = 140;

  return ({ context, width, height }) => {
    context.fillStyle = palette[Math.floor(1, 6)];
    context.fillRect(0, 0, width, height / 2);

    points.forEach((data) => {
      const { position, radius, color, rotation } = data;

      const [u, v] = position;

      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      context.beginPath();
      context.rotate(3);
      context.arc(x, y, radius * width, 0, Math.PI * 2, false);
      context.fillStyle = color;
      context.fill();

      // context.save();
      // context.fillStyle = color;
      // context.font = `${radius * width}px "Arial"`;
      // context.translate(x, y);
      // context.rotate(rotation);
      // context.fillText("=", 0, 0);

      // context.restore();
    });
  };
};

canvasSketch(sketch, settings);
