import * as THREE from "three";

// A gathered cloth loop: its front and back share the same folds, with a thin
// padded cross-section. The outer edge turns back on itself instead of forming
// the thick, flat wall of an extrusion.
function wingPoint(u: number, theta: number, side: number) {
  const v = Math.cos(theta);
  const fullness = Math.pow(Math.max(0, Math.sin(Math.PI * u)), 0.65);
  const halfHeight = 0.17 + 0.4 * Math.pow(Math.sin(u * Math.PI / 2), 0.85);
  const gather = Math.sin(v * Math.PI * 2.5 + u * 0.9 + side * 0.16) * 0.075 * fullness * Math.exp(-u * 1.25);
  const pillow = 0.022 + 0.105 * fullness;
  const x = 0.12 + u * 1.01 - 0.065 * Math.pow(u, 8) * Math.pow(Math.abs(v), 6);
  const y = v * halfHeight * (side === -1 ? 1.035 : 0.98) + 0.025 * Math.sin(u * Math.PI) + side * 0.018 * u;
  const z = gather + Math.sin(theta) * pillow + 0.045 * v * u + side * 0.023 * u * u;
  return new THREE.Vector3(side * x, y, z);
}

function signedPower(value: number, power: number) {
  return Math.sign(value) * Math.pow(Math.abs(value), power);
}

// A softly squared fabric wrap around the gathered center, slightly twisted.
function knotPoint(u: number, theta: number) {
  const latitude = (u - 0.5) * Math.PI;
  const roundness = Math.pow(Math.max(0.00001, Math.cos(latitude)), 0.28);
  const y = 0.285 * signedPower(Math.sin(latitude), 0.72);
  const twist = y * 0.2;
  const x = 0.215 * roundness * signedPower(Math.cos(theta + twist), 0.48);
  const wrapCrease = 0.009 * Math.cos(y * 34 + theta * 0.3) * Math.pow(Math.abs(Math.sin(theta)), 6);
  const z = 0.215 * roundness * signedPower(Math.sin(theta + twist), 0.5) + wrapCrease + 0.065;
  return new THREE.Vector3(x, y, z);
}

function makeSurface(pointAt: (u: number, theta: number) => THREE.Vector3, reverse: boolean, knot = false) {
  const rows = 48;
  const columns = 64;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) {
      const u = row / rows;
      const t = column / columns;
      positions.push(...pointAt(u, t * Math.PI * 2).toArray());
      uvs.push(...(knot ? [t * 0.7, u * 0.5] : [u, t * 0.7]));
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column;
        const b = a + columns + 1;
        if (reverse) indices.push(a, b, a + 1, b, b + 1, a + 1);
        else indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }
  // Close both fabric ends. They remain thin at the turned outer hem.
  for (const row of [0, rows]) {
    const center = new THREE.Vector3();
    for (let column = 0; column < columns; column++) center.add(pointAt(row / rows, column / columns * Math.PI * 2));
    center.divideScalar(columns);
    const index = positions.length / 3;
    positions.push(...center.toArray()); uvs.push(0.5, 0.5);
    for (let column = 0; column < columns; column++) {
      const a = row * (columns + 1) + column;
      if ((row === rows) !== reverse) indices.push(index, a, a + 1);
      else indices.push(index, a + 1, a);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  // Weld the shading along the UV seam without merging the UV coordinates.
  const normals = geometry.getAttribute("normal");
  for (let row = 0; row <= rows; row++) {
    const a = row * (columns + 1), b = a + columns;
    const normal = new THREE.Vector3().fromBufferAttribute(normals, a).add(new THREE.Vector3().fromBufferAttribute(normals, b)).normalize();
    normals.setXYZ(a, normal.x, normal.y, normal.z); normals.setXYZ(b, normal.x, normal.y, normal.z);
  }
  return geometry;
}

export function createBowtieGeometry() {
  return {
    left: makeSurface((u, theta) => wingPoint(u, theta, -1), true),
    right: makeSurface((u, theta) => wingPoint(u, theta, 1), false),
    knot: makeSurface(knotPoint, true, true),
  };
}

export function createFabricNormalMap() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  const height = (x: number, y: number) => {
    const warp = Math.cos(x * Math.PI / 4);
    const weft = Math.cos(y * Math.PI / 4);
    const over = Math.cos(x * Math.PI / 8) * Math.cos(y * Math.PI / 8);
    return (warp * (0.6 + over * 0.2) + weft * (0.6 - over * 0.2)) * 0.35;
  };
  const normal = new THREE.Vector3();
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    normal.set(height(x - 1, y) - height(x + 1, y), height(x, y - 1) - height(x, y + 1), 1).normalize();
    const offset = (y * size + x) * 4;
    data[offset] = Math.round((normal.x * 0.5 + 0.5) * 255);
    data[offset + 1] = Math.round((normal.y * 0.5 + 0.5) * 255);
    data[offset + 2] = Math.round((normal.z * 0.5 + 0.5) * 255);
    data[offset + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 10);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

// Sample the same cloth surfaces for ground contact, including the deeper knot.
export function createBowtieSupports() {
  const points: THREE.Vector3[] = [];
  for (let u = 0; u <= 10; u++) for (let t = 0; t < 24; t++) {
    for (const side of [-1, 1]) points.push(wingPoint(u / 10, t / 24 * Math.PI * 2, side));
    points.push(knotPoint(u / 10, t / 24 * Math.PI * 2));
  }
  return points;
}
