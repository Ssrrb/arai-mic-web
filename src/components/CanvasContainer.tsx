import { Canvas } from '@react-three/fiber';
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
  
  useEffect(() => {
    if (!groupRef.current) return;

    const ctx = gsap.context(() => {
      // Timeline connected to overall scroll position
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        }
      });

      // Section 1: Hero -> Section 1 (Right position)
      // Section 2: Section 1 -> Section 2 (Left position)
      // Section 3: Section 2 -> Section 3 (Slight Right & Forward)
      // Section 4: Section 3 -> Final CTA (Centered Dramatic View)
      tl.to(groupRef.current.position, { x: 2.2, y: -0.8, z: 1.8, duration: 1 })
        .to(groupRef.current.position, { x: -2.2, y: 0.6, z: 1.2, duration: 1 })
        .to(groupRef.current.position, { x: 1.8, y: -0.4, z: 1.6, duration: 1 })
        .to(groupRef.current.position, { x: 0, y: 0.1, z: 2.2, duration: 1 });
        
      tl.to(groupRef.current.rotation, { x: Math.PI * 0.8, y: Math.PI * 2.2, duration: 1 }, 0)
        .to(groupRef.current.rotation, { x: Math.PI * 1.8, y: Math.PI * 4.4, duration: 1 }, 1)
        .to(groupRef.current.rotation, { x: Math.PI * 2.6, y: Math.PI * 6.2, duration: 1 }, 2)
        .to(groupRef.current.rotation, { x: Math.PI * 3.4, y: Math.PI * 8.0, duration: 1 }, 3);
    });

    return () => ctx.revert();
  }, []);

  return (
    <group ref={groupRef}>
      <Float
        speed={2.2} 
        rotationIntensity={0.6}
        floatIntensity={1.2}
        floatingRange={[-0.25, 0.25]}
      >
        <Basketball edition={edition} scale={1.25} />
      </Float>
    </group>
  );
}

interface CanvasContainerProps {
  edition?: BallEdition;
}

export function CanvasContainer({ edition = 'fuego' }: CanvasContainerProps) {
  const shadowColor = edition === 'obsidiana' ? '#ff5722' : edition === 'oro' ? '#f59e0b' : '#ff5722';

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <color attach="background" args={['#09090b']} />
        
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 12, 10]} angle={0.2} penumbra={1} intensity={1.4} castShadow />
        <directionalLight position={[-10, -5, -5]} intensity={0.4} color="#ff7733" />
        
        <Suspense fallback={null}>
          <Environment resolution={256}>
            <group rotation={[-Math.PI / 4, -0.3, 0]}>
              <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
              <Lightformer intensity={2.5} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.2, 1]} color="#ffaa55" />
              <Lightformer intensity={1.5} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
              <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} color="#ffffff" />
            </group>
          </Environment>

          <SceneController edition={edition} />

          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.6}
            scale={20}
            blur={2.2}
            far={4.5}
            color={shadowColor}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

