import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Sphere } from '@react-three/drei';
import { getBasketballTextures } from '../utils/basketballTextures';

export type BallEdition = 'nebula' | 'fuego' | 'oro' | 'metal';

export interface BasketballProps {
  edition?: BallEdition;
  scale?: number;
  autoRotate?: boolean;
  [key: string]: any;
}

export const Basketball = forwardRef<Group, BasketballProps>(function Basketball(
  { edition = 'nebula', scale = 1.2, autoRotate = true, ...props },
  ref
) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  useImperativeHandle(ref, () => groupRef.current as Group);

  // Retrieve or generate cached high-definition texture for this edition
  const { diffuseTexture, bumpTexture } = getBasketballTextures(edition);

  useFrame((state) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.15;
    }
  });

  return (
    <group ref={groupRef} {...props}>
      {/* Main Basketball Sphere with high-spec PBR Material */}
      <Sphere ref={meshRef} args={[1 * scale, 64, 64]}>
        <meshStandardMaterial
          map={diffuseTexture}
          bumpMap={bumpTexture}
          bumpScale={0.035}
          roughness={edition === 'nebula' ? 0.32 : edition === 'oro' ? 0.38 : 0.44}
          metalness={edition === 'oro' ? 0.4 : edition === 'metal' ? 0.5 : 0.18}
          envMapIntensity={edition === 'nebula' ? 1.5 : 1.3}
        />
      </Sphere>
    </group>
  );
});

