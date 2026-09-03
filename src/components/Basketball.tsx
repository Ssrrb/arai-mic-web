import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { Sphere } from '@react-three/drei';
import { getBasketballTextures, getCustomBasketballTextures } from '../utils/basketballTextures';
import { CustomBallConfig } from '../types';

export type BallEdition = 'nebula' | 'fuego' | 'oro' | 'metal';

export interface BasketballProps {
  edition?: BallEdition;
  customConfig?: CustomBallConfig;
  scale?: number;
  autoRotate?: boolean;
  [key: string]: any;
}

export const Basketball = forwardRef<Group, BasketballProps>(function Basketball(
  { edition = 'nebula', customConfig, scale = 1.2, autoRotate = true, ...props },
  ref
) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  useImperativeHandle(ref, () => groupRef.current as Group);

  // Retrieve textures for either custom configuration or standard edition
  const { diffuseTexture, bumpTexture } = customConfig
    ? getCustomBasketballTextures(customConfig)
    : getBasketballTextures(edition);

  useFrame((state) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.15;
    }
  });

  const bumpScale = customConfig
    ? customConfig.textureType === 'street'
      ? 0.05
      : customConfig.textureType === 'cross'
      ? 0.04
      : 0.035
    : 0.035;

  const roughness = customConfig
    ? customConfig.textureType === 'street'
      ? 0.55
      : customConfig.textureType === 'tech'
      ? 0.28
      : 0.4
    : edition === 'nebula'
    ? 0.32
    : edition === 'oro'
    ? 0.38
    : 0.44;

  const metalness = customConfig
    ? customConfig.textureType === 'tech'
      ? 0.35
      : 0.15
    : edition === 'oro'
    ? 0.4
    : edition === 'metal'
    ? 0.5
    : 0.18;

  return (
    <group ref={groupRef} {...props}>
      {/* Main Basketball Sphere with high-spec PBR Material */}
      <Sphere ref={meshRef} args={[1 * scale, 64, 64]}>
        <meshStandardMaterial
          map={diffuseTexture}
          bumpMap={bumpTexture}
          bumpScale={bumpScale}
          roughness={roughness}
          metalness={metalness}
          envMapIntensity={1.35}
        />
      </Sphere>
    </group>
  );
});

