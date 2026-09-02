import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Float, Lightformer, ContactShadows } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import { Basketball, BallEdition } from './Basketball';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

interface SceneControllerProps {
  edition: BallEdition;
}

function SceneController({ edition }: SceneControllerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();

  const isMobile = size.width < 768;
  const isTablet = size.width >= 768 && size.width < 1024;

  // Responsive scale: tailored to viewport so ball complements typography and UI
  let responsiveScale = 1.18;
  if (isMobile) {
    // Keep ball compact on mobile so it sits elegantly in the upper third
    responsiveScale = 0.78;
  } else if (isTablet) {
    responsiveScale = 0.96;
  } else {
    responsiveScale = 1.18;
  }

  const initialY = isMobile ? 0.98 : 0;

  useEffect(() => {
    if (!groupRef.current) return;

    // Refresh ScrollTrigger calculations
    ScrollTrigger.refresh();

    // Set initial position
    groupRef.current.position.set(0, initialY, 0);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        },
      });

      const xOffset = isMobile ? 0.75 : isTablet ? 1.4 : 2.2;
      const zOffset = isMobile ? 0.9 : 1.8;

      // Section 1: Hero -> Section 1 (Right position)
      // Section 2: Section 1 -> Section 2 (Left position)
      // Section 3: Section 2 -> Section 3 (Slight Right & Forward)
      // Section 4: Section 3 -> Final CTA (Centered Dramatic View)
      tl.fromTo(
        groupRef.current.position,
        {
          x: 0,
          y: initialY,
          z: 0,
        },
        {
          x: xOffset,
          y: isMobile ? -0.35 : -0.8,
          z: zOffset,
          duration: 1,
        }
      )
        .to(groupRef.current.position, {
          x: -xOffset,
          y: isMobile ? 0.35 : 0.6,
          z: zOffset * 0.75,
          duration: 1,
        })
        .to(groupRef.current.position, {
          x: xOffset * 0.75,
          y: isMobile ? -0.2 : -0.4,
          z: zOffset * 0.85,
          duration: 1,
        })
        .to(groupRef.current.position, {
          x: 0,
          y: isMobile ? 0.05 : 0.1,
          z: isMobile ? 1.2 : 2.2,
          duration: 1,
        });

      tl.to(groupRef.current.rotation, { x: Math.PI * 0.8, y: Math.PI * 2.2, duration: 1 }, 0)
        .to(groupRef.current.rotation, { x: Math.PI * 1.8, y: Math.PI * 4.4, duration: 1 }, 1)
        .to(groupRef.current.rotation, { x: Math.PI * 2.6, y: Math.PI * 6.2, duration: 1 }, 2)
        .to(groupRef.current.rotation, { x: Math.PI * 3.4, y: Math.PI * 8.0, duration: 1 }, 3);
    });

    return () => ctx.revert();
  }, [isMobile, isTablet, initialY]);

  return (
    <group ref={groupRef} position={[0, initialY, 0]}>
      <Float
        speed={2.2}
        rotationIntensity={0.5}
        floatIntensity={isMobile ? 0.35 : 0.9}
        floatingRange={isMobile ? [-0.08, 0.08] : [-0.18, 0.18]}
      >
        <Basketball edition={edition} scale={responsiveScale} />
      </Float>
    </group>
  );
}

interface CanvasContainerProps {
  edition?: BallEdition;
}

export function CanvasContainer({ edition = 'nebula' }: CanvasContainerProps) {
  const shadowColor =
    edition === 'nebula'
      ? '#00c2ff'
      : edition === 'fuego'
      ? '#ff5722'
      : edition === 'golden'
      ? '#f59e0b'
      : '#64748b';

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.75} />
        <spotLight position={[8, 14, 8]} angle={0.28} penumbra={1} intensity={2.0} castShadow />
        <directionalLight position={[-8, -4, -4]} intensity={0.6} color={edition === 'nebula' ? '#00e5ff' : '#ff7733'} />
        <directionalLight position={[0, 7, 5]} intensity={0.7} color="#ffffff" />

        <Suspense fallback={null}>
          <Environment resolution={256}>
            <group rotation={[-Math.PI / 4, -0.3, 0]}>
              <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
              <Lightformer
                intensity={2.5}
                rotation-y={Math.PI / 2}
                position={[-5, 1, -1]}
                scale={[20, 0.2, 1]}
                color={edition === 'nebula' ? '#00e5ff' : '#ffaa55'}
              />
              <Lightformer intensity={1.5} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
              <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} color="#ffffff" />
            </group>
          </Environment>

          <SceneController edition={edition} />

          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.55}
            scale={20}
            blur={2.4}
            far={4.5}
            color={shadowColor}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
