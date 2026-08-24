import { faceXZ, rightXZ, moveDelta } from "../assets/js/facing.js";

function almost(a, b, eps = 1e-9) {
  if (Math.abs(a - b) > eps) throw new Error(`expected ${b}, got ${a}`);
}

const north = faceXZ(0);
almost(north.x, 0);
almost(north.z, -1);

const east = faceXZ(Math.PI / 2);
almost(east.x, 1);
almost(east.z, 0);

const south = faceXZ(Math.PI);
almost(south.x, 0);
almost(south.z, 1);

const west = faceXZ(-Math.PI / 2);
almost(west.x, -1);
almost(west.z, 0);

const rightWhenNorth = rightXZ(0);
almost(rightWhenNorth.x, 1);
almost(rightWhenNorth.z, 0);

const stepEast = moveDelta(Math.PI / 2, 1, 0, 2);
almost(stepEast.x, 2);
almost(stepEast.z, 0);

const stepNorth = moveDelta(0, 1, 0, 2);
almost(stepNorth.x, 0);
almost(stepNorth.z, -2);

const backWhenEast = moveDelta(Math.PI / 2, -1, 0, 1.6);
almost(backWhenEast.x, -1.6);
almost(backWhenEast.z, 0);

const afterLookWest = moveDelta(-1.2, 1, 0, 1);
const face = faceXZ(-1.2);
almost(afterLookWest.x, face.x);
almost(afterLookWest.z, face.z);
if (afterLookWest.x >= 0) throw new Error("looking west should walk toward -X");

console.log("ok facing matches camera look after turn");
