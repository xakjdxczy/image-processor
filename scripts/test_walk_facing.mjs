import * as THREE from "../assets/vendor/three/three.module.js";
import { faceXZ, rightXZ, moveDelta } from "../assets/js/facing.js";

function almost(a, b, eps = 1e-6) {
  if (Math.abs(a - b) > eps) throw new Error(`expected ${b}, got ${a}`);
}

const cam = new THREE.PerspectiveCamera(76, 1, 0.1, 50);
cam.rotation.order = "YXZ";
const world = new THREE.Vector3();

function cameraFlat(yaw, pitch = 0) {
  cam.rotation.y = yaw;
  cam.rotation.x = pitch;
  cam.updateMatrixWorld();
  cam.getWorldDirection(world);
  world.y = 0;
  world.normalize();
  return { x: world.x, z: world.z };
}

for (const yaw of [0, 0.4, 1.18, Math.PI / 2, Math.PI, -1.2, -Math.PI / 2]) {
  const look = cameraFlat(yaw);
  const face = faceXZ(yaw);
  almost(face.x, look.x);
  almost(face.z, look.z);
  const step = moveDelta(yaw, 1, 0, 1);
  almost(step.x, look.x);
  almost(step.z, look.z);
}

const eastLook = cameraFlat(Math.PI / 2);
almost(eastLook.x, -1);
almost(eastLook.z, 0);
const westStep = moveDelta(Math.PI / 2, 1, 0, 2);
almost(westStep.x, -2);
almost(westStep.z, 0);

const north = faceXZ(0);
almost(north.x, 0);
almost(north.z, -1);
const rightNorth = rightXZ(0);
almost(rightNorth.x, 1);
almost(rightNorth.z, 0);

const rightWhenLookingWest = rightXZ(Math.PI / 2);
almost(rightWhenLookingWest.x, 0);
almost(rightWhenLookingWest.z, -1);

console.log("ok facing matches Three.js camera.getWorldDirection");
