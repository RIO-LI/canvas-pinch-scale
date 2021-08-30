import "./styles.css";
import AlloyFinger from "alloyfinger";
const $canvas = document.getElementById("canvas");
const ctx = $canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

// 矩形的坐标，相对于canvas变换之后的原点
const rectPoints = [
  [200, 200],
  [200, -200],
  [-200, -200],
  [-200, 200]
];

let isTouch = false;
let startPoint = null;
let scaleMatrix = [
  [1, 0],
  [0, 1]
];

function vectorMultiply(v1, v2) {
  const vector = [];
  if (v1[0].length !== v2.length) {
    throw new Error(`这两个矩阵之间的乘法无意义！`);
  }
  const rowSize = v1.length;
  const colSize = v2[0].length;
  for (let i = 0; i < rowSize; i++) {
    vector.push([]);
    for (let j = 0; j < colSize; j++) {
      let dotProduct = 0;
      for (let k = 0; k < colSize; k++) {
        dotProduct += v1[i][k] * v2[k][j];
      }
      vector[vector.length - 1].push(dotProduct);
    }
  }
  return vector;
}

function scale(originMatrix, scaleMatrix) {
  return vectorMultiply(originMatrix, scaleMatrix);
}

function buildPath(scaleMatrix) {
  const _rectPoints = scale(rectPoints, scaleMatrix);
  ctx.beginPath(_rectPoints[0][0], _rectPoints[0][1]);
  for (let i = 0; i < _rectPoints.length; i++) {
    ctx.lineTo(_rectPoints[i][0], _rectPoints[i][1]);
  }
  ctx.closePath();
}

function draw(scaleMatrix, fillStyle = "skyblue") {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  buildPath(scaleMatrix);
  ctx.fill();
  ctx.restore();
}

function getScaleMatrix(vector, k = 1) {
  const [nx, ny] = vector;
  return [
    [1 + (k - 1) * nx ** 2, (k - 1) * nx * ny],
    [(k - 1) * nx * ny, 1 + (k - 1) * ny ** 2]
  ];
}

new AlloyFinger($canvas, {
  touchStart(evt) {
    startPoint = evt.targetTouches[0];
    if (ctx.isPointInPath(startPoint.clientX, startPoint.clientY)) {
      isTouch = true;
      draw(scaleMatrix, "green");
    }
  },
  touchEnd() {
    isTouch = false;
  },
  touchCancel() {
    isTouch = false;
  },
  pinch(evt) {
    if (isTouch) {
      const [v1, v2] = evt.targetTouches;
      const angle = Math.atan2(
        v2.clientY - v1.clientY,
        v2.clientX - v1.clientX
      );
      scaleMatrix = getScaleMatrix(
        [Math.cos(angle), Math.sin(angle)],
        evt.zoom
      );
      draw(scaleMatrix, "red");
    }
  }
});

draw(scaleMatrix);
