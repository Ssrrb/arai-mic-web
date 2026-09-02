import { useRef, useEffect } from 'react';
import { Group } from 'three';
import * as THREE from 'three';
import gsap from 'gsap';
import { Basketball, BallEdition } from './Basketball';

interface ProjectileBallProps {
  id: number;
  edition: BallEdition;
  startPos: THREE.Vector3;
  controlPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  baseScale: number;
  onLanded: (id: number, edition: BallEdition) => void;
}

export function ProjectileBall({
  id,
  edition,
  startPos,
  controlPos,
  targetPos,
  baseScale,
  onLanded,
}: ProjectileBallProps) {
  const groupRef = useRef<Group>(null);
  const trailGroupRef = useRef<Group>(null);

  // Trailing particles history
  const trailPositions = useRef<THREE.Vector3[]>([]);

  // Edition accent color
  let trailColor = '#00c2ff';
  if (edition === 'fuego') trailColor = '#ff5722';
  else if (edition === 'oro') trailColor = '#f59e0b';
  else if (edition === 'metal') trailColor = '#cbd5e1';

  useEffect(() => {
    if (!groupRef.current) return;

    // Set initial position
    groupRef.current.position.copy(startPos);
    groupRef.current.scale.setScalar(baseScale);

    const animObj = {
      t: 0,
      scale: baseScale,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
    };

    // Parabolic GSAP timeline
    const tl = gsap.timeline({
      onComplete: () => {
        onLanded(id, edition);
      },
    });

    // Animate progress t from 0 to 1 with smooth trajectory
    tl.to(animObj, {
      t: 1,
      duration: 0.76,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (!groupRef.current) return;

        const t = animObj.t;
        const oneMinusT = 1 - t;

        // Quadratic Bezier interpolation in 3D: B(t) = (1-t)^2 * P0 + 2(1-t)t * P_ctrl + t^2 * P1
        const x =
          oneMinusT * oneMinusT * startPos.x +
          2 * oneMinusT * t * controlPos.x +
          t * t * targetPos.x;
        const y =
          oneMinusT * oneMinusT * startPos.y +
          2 * oneMinusT * t * controlPos.y +
          t * t * targetPos.y;
        const z =
          oneMinusT * oneMinusT * startPos.z +
          2 * oneMinusT * t * controlPos.z +
          t * t * targetPos.z;

        groupRef.current.position.set(x, y, z);

        // Record trailing point for glowing comet tail
        if (trailPositions.current.length > 12) {
          trailPositions.current.shift();
        }
        trailPositions.current.push(new THREE.Vector3(x, y, z));

        // Update trail particles
        if (trailGroupRef.current) {
          const children = trailGroupRef.current.children;
          for (let i = 0; i < children.length; i++) {
            const mesh = children[i] as THREE.Mesh;
            const historyIdx = trailPositions.current.length - 1 - (i + 1);
            if (historyIdx >= 0 && trailPositions.current[historyIdx]) {
              const p = trailPositions.current[historyIdx];
              // Convert world position to relative
              mesh.position.set(p.x - x, p.y - y, p.z - z);
              mesh.visible = true;
              const fade = (1 - (i + 1) / (children.length + 1)) * (1 - t * 0.5);
              mesh.scale.setScalar(baseScale * 0.28 * fade);
            } else {
              mesh.visible = false;
            }
          }
        }

        // Realistic shooter backspin & spiral
        groupRef.current.rotation.x = -Math.PI * 6.5 * t;
        groupRef.current.rotation.y = Math.PI * 2.2 * t;
        groupRef.current.rotation.z = Math.PI * 0.6 * t;

        // Perspective scale: tapers gracefully as it sinks into the cart icon
        let currentScale = baseScale;
        if (t > 0.45) {
          const taperProgress = (t - 0.45) / 0.55;
          currentScale = baseScale * (1 - taperProgress * 0.84);
        }
        if (t >= 0.96) {
          currentScale = baseScale * 0.05 * (1 - (t - 0.96) / 0.04);
        }
        groupRef.current.scale.setScalar(Math.max(0.001, currentScale));
      },
    });

    return () => {
      tl.kill();
    };
  }, [id, edition, startPos, controlPos, targetPos, baseScale, onLanded]);

  return (
    <group ref={groupRef}>
      {/* 3D Flying Basketball */}
      <Basketball edition={edition} scale={1} autoRotate={false} />

      {/* Trailing Comet Particles */}
      <group ref={trailGroupRef}>
        {Array.from({ length: 10 }).map((_, idx) => (
          <mesh key={idx} visible={false}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial
              color={trailColor}
              transparent
              opacity={0.65 - idx * 0.06}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
