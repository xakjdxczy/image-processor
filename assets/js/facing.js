export function faceXZ(yaw) {
  return { x: Math.sin(yaw), z: -Math.cos(yaw) };
}

export function rightXZ(yaw) {
  return { x: Math.cos(yaw), z: Math.sin(yaw) };
}

export function moveDelta(yaw, forward, strafe, speed) {
  const face = faceXZ(yaw);
  const right = rightXZ(yaw);
  return {
    x: (face.x * forward + right.x * strafe) * speed,
    z: (face.z * forward + right.z * strafe) * speed
  };
}
