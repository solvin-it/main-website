"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode, type MutableRefObject } from "react";
import * as THREE from "three";
import { MARK_FLOOR, stepFallingBody, type FallingBody } from "@/lib/mark-physics";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type SceneMotion = { x: number; y: number; active: boolean; dropped: boolean; resetId: number; zoom: number; pointerX: number; pointerY: number };
type SceneProps = {
  motion: MutableRefObject<SceneMotion>;
  onReady: () => void;
  onFailure: () => void;
  onLanded: () => void;
};

function StudioEnvironment({ onReady, onFailure }: Pick<SceneProps, "onReady" | "onFailure">) {
  const { gl, scene, invalidate } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    // Three.js owns this mutable scene; environment setup is an imperative renderer operation.
    /* eslint-disable react-hooks/immutability */
    scene.environment = environment.texture;
    scene.environmentIntensity = 1.2;
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener("webglcontextlost", lost);
    invalidate();
    onReady();
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      scene.environment = null;
      environment.dispose();
      room.dispose();
      pmrem.dispose();
    };
    /* eslint-enable react-hooks/immutability */
  }, [gl, scene, invalidate, onReady, onFailure]);
  return null;
}

function Curve({ points, radius = 0.04, chrome = false }: { points: number[][]; radius?: number; chrome?: boolean }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point))), [points]);
  return <mesh castShadow receiveShadow>
    <tubeGeometry args={[curve, 48, radius, 10, false]} />
    <meshPhysicalMaterial color={chrome ? "#b9c2cf" : "#151a22"} metalness={chrome ? 0.95 : 0.65} roughness={chrome ? 0.19 : 0.22} clearcoat={1} />
  </mesh>;
}

function GlassesModel() {
  const ring = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 1.06, 0.98, 0, Math.PI * 2, false, 0);
    const hole = new THREE.Path();
    hole.absellipse(0, 0, 0.946, 0.866, 0, Math.PI * 2, true, 0);
    shape.holes.push(hole);
    return shape;
  }, []);

  return <group scale={0.82}><group position={[0, 0, 1.35]}>
    {[-1, 1].map(side => <group key={side} position={[side * 1.18, 0, 0]}>
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[ring, { depth: 0.11, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.025, bevelThickness: 0.025, curveSegments: 64 }]} />
        <meshPhysicalMaterial color="#151a22" metalness={0.64} roughness={0.21} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[0, 0, 0.052]} scale={[1.08, 1, 0.065]}>
        <sphereGeometry args={[0.87, 64, 32]} />
        <meshPhysicalMaterial color="#d5e9ef" transparent opacity={0.3} metalness={0.06} roughness={0.08} transmission={0.7} thickness={0.12} ior={1.46} envMapIntensity={0.65} clearcoat={1} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.14]} scale={[1.081, 1, 1]}>
        <torusGeometry args={[0.917, 0.009, 8, 96]} />
        <meshStandardMaterial color="#b4bdca" metalness={1} roughness={0.23} />
      </mesh>
      <mesh castShadow position={[side * 1.025, 0.22, -0.012]}>
        <boxGeometry args={[0.2, 0.115, 0.14]} />
        <meshStandardMaterial color="#58616d" metalness={0.9} roughness={0.19} />
      </mesh>
      {[0, 0.075].map(offset => <mesh key={offset} position={[side * (0.984 + offset), 0.22, 0.085]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.018, 12]} />
        <meshStandardMaterial color="#dde1e8" metalness={1} roughness={0.18} />
      </mesh>)}
    </group>)}
    <Curve points={[[-0.23, 0.25, 0.045], [-0.13, 0.34, 0.075], [0, 0.38, 0.085], [0.13, 0.34, 0.075], [0.23, 0.25, 0.045]]} radius={0.052} />
    {[-1, 1].map(side => <group key={side}>
      <Curve points={[[side * 2.2, 0.22, 0], [side * 2.28, 0.2, -0.3], [side * 2.21, 0.15, -1.3], [side * 2.04, 0.11, -2.25], [side * 1.85, -0.1, -2.75], [side * 1.8, -0.35, -2.88]]} radius={0.047} />
      <Curve points={[[side * 2.16, 0.14, -1.7], [side * 2.04, 0.11, -2.25], [side * 1.85, -0.1, -2.75], [side * 1.8, -0.35, -2.88]]} radius={0.062} />
      <Curve points={[[side * 0.31, -0.1, -0.04], [side * 0.35, -0.14, -0.15], [side * 0.35, -0.24, -0.18]]} radius={0.018} chrome />
      <mesh position={[side * 0.34, -0.24, -0.18]} rotation={[0, 0, side * -0.22]} scale={[0.063, 0.13, 0.045]}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshPhysicalMaterial color="#dde4ec" transparent opacity={0.58} roughness={0.22} />
      </mesh>
    </group>)}
  </group></group>;
}

function BowtieModel() {
  const wing = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.15, 0.2);
    shape.bezierCurveTo(0.4, 0.3, 0.88, 0.62, 1.04, 0.57);
    shape.bezierCurveTo(1.13, 0.3, 1.13, -0.3, 1.04, -0.57);
    shape.bezierCurveTo(0.88, -0.62, 0.4, -0.3, 0.15, -0.2);
    shape.closePath();
    return shape;
  }, []);
  return <group>
    {[-1, 1].map(side => <group key={side} rotation={[0, side === -1 ? Math.PI : 0, 0]}>
      <mesh castShadow receiveShadow position={[0, 0, -0.1]}>
        <extrudeGeometry args={[wing, { depth: 0.2, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: 0.07, bevelThickness: 0.08, curveSegments: 24 }]} />
        <meshPhysicalMaterial color="#161c24" roughness={0.48} metalness={0.12} sheen={1} sheenColor="#647080" sheenRoughness={0.55} />
      </mesh>
      {/* Raised folds catch the studio lights like gathered satin. */}
      {[-1, 1].map(fold => <mesh key={fold} position={[0.48, fold * 0.15, side * 0.14]} rotation={[0, 0, fold * 0.25]} scale={[0.38, 0.036, 0.032]}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshPhysicalMaterial color="#242b36" roughness={0.55} sheen={1} sheenColor="#788293" />
      </mesh>)}
    </group>)}
    <mesh castShadow scale={[0.23, 0.31, 0.23]}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshPhysicalMaterial color="#171e28" roughness={0.42} sheen={1} sheenColor="#727d90" sheenRoughness={0.5} />
    </mesh>
  </group>;
}

const glassSupports: THREE.Vector3[] = [];
for (const side of [-1, 1]) {
  for (let index = 0; index < 48; index++) {
    const angle = index / 48 * Math.PI * 2;
    for (const z of [1.32, 1.51]) glassSupports.push(new THREE.Vector3(side * 1.18 + Math.cos(angle) * 1.09, Math.sin(angle) * 1.01, z).multiplyScalar(0.82));
  }
  for (const [x, y, z] of [[2.28, 0.2, -0.3], [2.21, 0.15, -1.3], [2.04, 0.11, -2.25], [1.8, -0.35, -2.88]]) {
    for (const edge of [-0.065, 0.065]) glassSupports.push(new THREE.Vector3(side * x, y + edge, z + 1.35).multiplyScalar(0.82));
  }
}
const tieSupports = [-1.12, 1.12].flatMap(x => [-0.64, 0.64].flatMap(y => [-0.18, 0.18].map(z => new THREE.Vector3(x, y, z))));
const glassHome = new THREE.Vector3(0, 0.65, 0);
const tieHome = new THREE.Vector3(0, -1.35, 1.1);

function FloatingProp({ motion, home, supports, kind, onLanded, children }: Pick<SceneProps, "motion" | "onLanded"> & {
  home: THREE.Vector3; supports: THREE.Vector3[]; kind: "glasses" | "tie"; children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<FallingBody | null>(null);
  const resetId = useRef(motion.current.resetId);
  const invalidate = useThree(state => state.invalidate);
  const targetRef = useRef({ rotation: new THREE.Euler(), position: new THREE.Vector3() });
  useEffect(() => {
    const render = () => { if (motion.current.active) invalidate(); };
    window.addEventListener("solvin-scene-change", render);
    return () => window.removeEventListener("solvin-scene-change", render);
  }, [invalidate, motion]);

  useFrame((_, delta) => {
    const target = targetRef.current;
    const object = group.current;
    const current = motion.current;
    if (!object || !current.active) return;
    if (resetId.current !== current.resetId) {
      body.current = null; resetId.current = current.resetId;
      object.rotation.set(...[object.rotation.x, object.rotation.y, object.rotation.z].map(angle => Math.atan2(Math.sin(angle), Math.cos(angle))) as [number, number, number]);
    }
    if (current.dropped) {
      if (!body.current) body.current = {
        position: object.position.clone(), rotation: object.rotation.clone(),
        velocity: new THREE.Vector3(kind === "glasses" ? -0.35 : 0.8, 0.5, 0),
        angularVelocity: new THREE.Vector3(kind === "glasses" ? 1.4 : 2.4, 0.4, kind === "glasses" ? 0.65 : -1.5),
        asleep: false, contacts: 0,
        restPosition: kind === "glasses" ? { x: -0.35, z: -0.75 } : { x: 1, z: 1.3 },
        restRotation: {
          x: Math.PI / 2 + Math.round((object.rotation.x - Math.PI / 2) / (Math.PI * 2)) * Math.PI * 2,
          y: Math.round(object.rotation.y / (Math.PI * 2)) * Math.PI * 2,
          z: kind === "glasses" ? 0.12 : -0.15,
        },
      };
      const wasAsleep = body.current.asleep;
      stepFallingBody(body.current, supports, delta);
      object.position.copy(body.current.position);
      object.rotation.copy(body.current.rotation);
      if (!body.current.asleep) invalidate();
      else if (!wasAsleep) onLanded();
      return;
    }
    target.rotation.set(0.16 + current.y + current.pointerY * 0.22, -0.38 + current.x + current.pointerX * 0.5, -0.08);
    target.position.copy(home).applyEuler(target.rotation);
    target.position.x += current.pointerX * 0.35;
    target.position.y -= current.pointerY * 0.18;
    const dt = Math.min(delta, 0.05);
    object.rotation.x = THREE.MathUtils.damp(object.rotation.x, target.rotation.x, 7, dt);
    object.rotation.y = THREE.MathUtils.damp(object.rotation.y, target.rotation.y, 7, dt);
    object.rotation.z = THREE.MathUtils.damp(object.rotation.z, target.rotation.z, 7, dt);
    object.position.lerp(target.position, 1 - Math.exp(-7 * dt));
    if (object.position.distanceTo(target.position) + Math.abs(object.rotation.x - target.rotation.x) + Math.abs(object.rotation.y - target.rotation.y) + Math.abs(object.rotation.z - target.rotation.z) > 0.001) invalidate();
  });
  return <group ref={group} position={home}>{children}</group>;
}

function SceneZoom({ motion }: Pick<SceneProps, "motion">) {
  const focusY = useRef(-0.75);
  useFrame(({ camera, invalidate }, delta) => {
    if (!motion.current.active) return;
    const difference = motion.current.zoom - camera.zoom;
    const targetY = -0.75 + (motion.current.zoom - 1) / 0.65 * (motion.current.dropped ? -0.45 : 0.55);
    if (Math.abs(difference) + Math.abs(focusY.current - targetY) < 0.001) return;
    focusY.current = THREE.MathUtils.damp(focusY.current, targetY, 9, Math.min(delta, 0.05));
    camera.lookAt(0, focusY.current, 0);
    camera.zoom = THREE.MathUtils.damp(camera.zoom, motion.current.zoom, 9, Math.min(delta, 0.05));
    camera.updateProjectionMatrix();
    invalidate();
  });
  return null;
}

function StudioFloor() {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    const update = () => {
      material.current?.color.set(document.documentElement.dataset.theme === "dark" ? "#354540" : "#dce2dd");
      invalidate();
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [invalidate]);
  return <mesh position={[0, MARK_FLOOR - 0.07, 0]} receiveShadow>
    <cylinderGeometry args={[3.1, 3.1, 0.14, 96]} />
    <meshStandardMaterial ref={material} color="#dce2dd" roughness={0.86} metalness={0.05} />
  </mesh>;
}

export default function GlassesScene({ motion, onReady, onFailure, onLanded }: SceneProps) {
  return <Canvas
    frameloop="demand"
    dpr={[1, 1.5]}
    shadows={{ type: THREE.PCFShadowMap }}
    camera={{ position: [0, 1.1, 10.5], fov: 35 }}
    gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    fallback={null}
    onCreated={({ gl, camera }) => { camera.lookAt(0, -0.75, 0); gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
    style={{ pointerEvents: "none" }}
    aria-hidden="true"
  >
    <StudioEnvironment onReady={onReady} onFailure={onFailure} />
    <ambientLight intensity={0.65} />
    <directionalLight position={[-3, 6, 5]} intensity={3.5} castShadow shadow-mapSize={[1024, 1024]} shadow-normalBias={0.025} shadow-radius={5} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
    <directionalLight position={[4, 2, -3]} color="#a8c5ff" intensity={3} />
    <FloatingProp motion={motion} home={glassHome} supports={glassSupports} kind="glasses" onLanded={onLanded}><GlassesModel /></FloatingProp>
    <FloatingProp motion={motion} home={tieHome} supports={tieSupports} kind="tie" onLanded={onLanded}><BowtieModel /></FloatingProp>
    <StudioFloor />
    <SceneZoom motion={motion} />
  </Canvas>;
}
