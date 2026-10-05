"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode, type MutableRefObject } from "react";
import * as THREE from "three";
import { createBowtieGeometry, createFabricNormalMap } from "@/lib/bowtie-geometry";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useDarkTheme } from "./use-site-theme";

export type SceneMotion = { x: number; active: boolean; pointerX: number; pointerY: number };
type SceneProps = {
  motion: MutableRefObject<SceneMotion>;
  onReady: () => void;
  onFailure: () => void;
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
    scene.environmentIntensity = 1.5;
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
    <meshPhysicalMaterial color={chrome ? "#e0e5de" : "#374641"} metalness={chrome ? 0.95 : 0.78} roughness={chrome ? 0.19 : 0.2} clearcoat={1} />
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
        <meshPhysicalMaterial color="#374641" metalness={0.78} roughness={0.21} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[0, 0, 0.052]} scale={[1.08, 1, 0.065]}>
        <sphereGeometry args={[0.87, 64, 32]} />
        <meshPhysicalMaterial color="#bfd9c8" transparent opacity={0.35} metalness={0.06} roughness={0.08} transmission={0.7} thickness={0.12} ior={1.46} envMapIntensity={0.65} clearcoat={1} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.14]} scale={[1.081, 1, 1]}>
        <torusGeometry args={[0.917, 0.009, 8, 96]} />
        <meshStandardMaterial color="#d9e4d7" metalness={1} roughness={0.23} />
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
  const dark = useDarkTheme();
  const invalidate = useThree(state => state.invalidate);
  const geometry = useMemo(() => createBowtieGeometry(), []);
  const fabric = useMemo(() => createFabricNormalMap(), []);
  useEffect(() => { invalidate(); }, [dark, invalidate]);
  useEffect(() => () => {
    geometry.left.dispose(); geometry.right.dispose(); geometry.knot.dispose(); fabric.dispose();
  }, [geometry, fabric]);
  return <group>
    {Object.entries(geometry).map(([name, surface]) => <mesh key={name} geometry={surface} castShadow>
      <meshPhysicalMaterial
        color={dark ? (name === "knot" ? "#7f8e73" : "#aebd9c") : (name === "knot" ? "#203626" : "#304c39")}
        metalness={0} roughness={0.76} specularIntensity={0.18}
        sheen={0.3} sheenColor={dark ? "#bec9ae" : "#6b805f"} sheenRoughness={0.9}
        normalMap={fabric} normalScale={new THREE.Vector2(0.22, 0.22)}
        anisotropy={0.25} anisotropyRotation={name === "knot" ? Math.PI / 2 : 0}
        envMapIntensity={dark ? 0.45 : 0.3}
      />
    </mesh>)}
  </group>;
}

function FloatingIdentity({ motion, children }: Pick<SceneProps, "motion"> & { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree(state => state.invalidate);
  const target = useRef({ rotation: new THREE.Euler(), position: new THREE.Vector3() });
  const idleTime = useRef(0);
  useEffect(() => {
    const render = () => { if (motion.current.active) invalidate(); };
    window.addEventListener("solvin-scene-change", render);
    return () => window.removeEventListener("solvin-scene-change", render);
  }, [invalidate, motion]);

  useFrame((_, delta) => {
    const object = group.current;
    const current = motion.current;
    if (!object || !current.active) return;
    const dt = Math.min(delta, 0.05);
    // Advance only while visible, so returning to the scene never jumps its pose.
    idleTime.current += dt;
    const time = idleTime.current;
    target.current.rotation.set(
      0.12 + current.pointerY * 0.09 + Math.sin(time * 0.36) * 0.025,
      -0.32 + current.x + current.pointerX * 0.18 + Math.sin(time * 0.28) * 0.04,
      -0.08 + Math.sin(time * 0.3) * 0.018,
    );
    target.current.position.set(current.pointerX * 0.08, -current.pointerY * 0.06 + Math.sin(time * 0.65) * 0.07, 0);
    object.rotation.x = THREE.MathUtils.damp(object.rotation.x, target.current.rotation.x, 6, dt);
    object.rotation.y = THREE.MathUtils.damp(object.rotation.y, target.current.rotation.y, 6, dt);
    object.rotation.z = THREE.MathUtils.damp(object.rotation.z, target.current.rotation.z, 6, dt);
    object.position.lerp(target.current.position, 1 - Math.exp(-6 * dt));
    invalidate();
  });
  return <group ref={group} rotation={[0.12, -0.32, -0.08]}>{children}</group>;
}

export default function GlassesScene({ motion, onReady, onFailure }: SceneProps) {
  return <Canvas
    frameloop="demand"
    dpr={[1, 1.5]}
    camera={{ position: [0, 0.6, 9.5], fov: 35 }}
    gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    fallback={null}
    onCreated={({ gl, camera }) => { camera.lookAt(0, -0.2, 0); gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.1; }}
    style={{ pointerEvents: "none" }}
    aria-hidden="true"
  >
    <StudioEnvironment onReady={onReady} onFailure={onFailure} />
    <ambientLight intensity={0.7} />
    <directionalLight position={[-3, 6, 5]} color="#f2f2e7" intensity={4} />
    <directionalLight position={[4, 1, -3]} color="#c0dac2" intensity={3.5} />
    <directionalLight position={[0, -3, 4]} color="#a4bbb4" intensity={1.2} />
    <FloatingIdentity motion={motion}>
      <group position={[0, 0.65, 0]}><GlassesModel /></group>
      <group position={[0, -1.3, 1.1]}><BowtieModel /></group>
    </FloatingIdentity>
  </Canvas>;
}
