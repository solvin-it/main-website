import { describe, expect, it } from "vitest";
import { Euler, Vector3 } from "three";
import { lowestPoint, MARK_FLOOR, stepFallingBody, type FallingBody } from "./mark-physics";

const supports = [-1, 1].flatMap(x => [-0.4, 0.4].flatMap(y => [-0.2, 0.2].map(z => new Vector3(x, y, z))));
function body(): FallingBody {
  return { position: new Vector3(0, 1, 0), rotation: new Euler(0.2, 0.6, 0.1), velocity: new Vector3(0.5, 0, 0), angularVelocity: new Vector3(1, 0.5, 0.3), asleep: false, contacts: 0 };
}

describe("mark gravity", () => {
  it("accelerates downward, bounces, stays above the floor and eventually sleeps", () => {
    const falling = body();
    falling.restRotation = { x: Math.PI / 2, y: 0 };
    let bounced = false;
    stepFallingBody(falling, supports, 1 / 60);
    expect(falling.position.y).toBeLessThan(1);
    for (let frame = 0; frame < 1200; frame++) {
      stepFallingBody(falling, supports, 1 / 60);
      expect(lowestPoint(falling, supports)).toBeGreaterThanOrEqual(MARK_FLOOR - 0.000001);
      if (falling.velocity.y > 0) bounced = true;
    }
    expect(bounced).toBe(true);
    expect(falling.asleep).toBe(true);
    expect(falling.velocity.length()).toBe(0);
    expect(falling.rotation.x).toBeCloseTo(Math.PI / 2, 2);
    expect(falling.rotation.y).toBeCloseTo(0, 2);
  });

  it("bounds large elapsed times and never moves a settled body", () => {
    const falling = body();
    stepFallingBody(falling, supports, 30);
    expect(falling.position.y).toBeGreaterThan(0.9);
    falling.asleep = true;
    const position = falling.position.clone();
    stepFallingBody(falling, supports, 1 / 60);
    expect(falling.position).toEqual(position);
  });

});
