import { Euler, Quaternion, Vector3 } from "three";

export const MARK_FLOOR = -2.65;
export type FallingBody = {
  position: Vector3;
  rotation: Euler;
  velocity: Vector3;
  angularVelocity: Vector3;
  asleep: boolean;
  contacts: number;
  restRotation?: { x: number; y: number; z?: number };
  restPosition?: { x: number; z: number };
};

const orientation = new Quaternion();
const point = new Vector3();

/** Lowest sampled point of the actual silhouette, rather than a large bounding box. */
export function lowestPoint(body: FallingBody, supports: readonly Vector3[]) {
  orientation.setFromEuler(body.rotation);
  let bottom = Infinity;
  for (const support of supports) bottom = Math.min(bottom, point.copy(support).applyQuaternion(orientation).y);
  return body.position.y + bottom;
}

/** Stylized gravity with floor contact and authored resting poses; not a general collision engine. */
export function stepFallingBody(body: FallingBody, supports: readonly Vector3[], seconds: number) {
  if (body.asleep) return;
  // Bounded substeps keep a resumed/background tab from tunnelling through the floor.
  const duration = Math.min(Math.max(seconds, 0), 0.05);
  const steps = Math.max(1, Math.ceil(duration / (1 / 120)));
  const dt = duration / steps;
  for (let index = 0; index < steps; index++) {
    body.velocity.y -= 13 * dt;
    body.position.addScaledVector(body.velocity, dt);
    body.rotation.x += body.angularVelocity.x * dt;
    body.rotation.y += body.angularVelocity.y * dt;
    body.rotation.z += body.angularVelocity.z * dt;
    // After impact the thin props rock down onto their broad face instead of
    // stopping implausibly upright on the tips of the glasses' arms.
    if (body.contacts > 0 && body.restRotation) {
      const blend = 1 - Math.exp(-5 * dt);
      body.rotation.x += (body.restRotation.x - body.rotation.x) * blend;
      body.rotation.y += (body.restRotation.y - body.rotation.y) * blend;
      if (body.restRotation.z !== undefined) {
        body.rotation.z += (body.restRotation.z - body.rotation.z) * blend;
        body.angularVelocity.z *= Math.exp(-8 * dt);
      }
      // Separate resting poses keep the final composition free of mesh overlaps.
      if (body.restPosition) {
        body.position.x += (body.restPosition.x - body.position.x) * blend;
        body.position.z += (body.restPosition.z - body.position.z) * blend;
      }
      body.angularVelocity.x *= Math.exp(-8 * dt);
      body.angularVelocity.y *= Math.exp(-8 * dt);
    }
    const bottom = lowestPoint(body, supports);
    if (bottom <= MARK_FLOOR) {
      body.position.y += MARK_FLOOR - bottom;
      if (body.velocity.y < 0) body.velocity.y *= -0.28;
      body.velocity.x *= Math.exp(-12 * dt);
      body.velocity.z *= Math.exp(-12 * dt);
      body.angularVelocity.multiplyScalar(Math.exp(-15 * dt));
      body.contacts++;
      const resting = !body.restRotation || Math.abs(body.rotation.x - body.restRotation.x) + Math.abs(body.rotation.y - body.restRotation.y) + Math.abs(body.rotation.z - (body.restRotation.z ?? body.rotation.z)) < 0.005;
      if (resting && body.contacts > 12 && body.velocity.length() < 0.13 && body.angularVelocity.length() < 0.09) {
        body.asleep = true;
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);
        break;
      }
    }
  }
}
