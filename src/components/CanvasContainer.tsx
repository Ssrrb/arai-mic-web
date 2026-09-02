import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Float, Lightformer, ContactShadows } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Basketball, BallEdition } from './Basketball';
import { ProjectileBall } from './ProjectileBall';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

interface ActiveProjectile {
  id: number;
  edition: BallEdition;
  startPos: THREE.Vector3;
  controlPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  baseScale: number;
}

interface SceneControllerProps {
  edition: BallEdition;
}

function SceneController({ edition }: SceneControllerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const mainBallWrapperRef = useRef<THREE.Group>(null);
  const mainBallInnerRef = useRef<THREE.Group>(null);

  const [projectiles, setProjectiles] = useState<ActiveProjectile[]>([]);
  const isRespawningRef = useRef(false);

  const { size, camera } = useThree();

  const isMobile = size.width < 768;
  const isTablet = size.width >= 768 && size.width < 1024;

  // Responsive scale tailored to viewport
  let responsiveScale = 1.18;
  if (isMobile) {
    responsiveScale = 0.78;
  } else if (isTablet) {
    responsiveScale = 0.96;
  } else {
    responsiveScale = 1.18;
  }

  const initialY = isMobile ? 0.98 : 0;

  // Calculate 3D world position corresponding to the cart button (#open-cart-btn) on screen
  const getCartTargetPosition = useCallback((): THREE.Vector3 => {
    const cartBtn = document.getElementById('open-cart-btn');
    let screenX = window.innerWidth - 65;
    let screenY = 32;

    if (cartBtn) {
      const rect = cartBtn.getBoundingClientRect();
      screenX = rect.left + rect.width / 2;
      screenY = rect.top + rect.height / 2;
    }

    const ndcX = (screenX / window.innerWidth) * 2 - 1;
    const ndcY = -(screenY / window.innerHeight) * 2 + 1;

    const targetVector = new THREE.Vector3(ndcX, ndcY, 0.5);
    targetVector.unproject(camera);
    const dir = targetVector.sub(camera.position).normalize();
    const targetZ = 0.4;
    const distance = (targetZ - camera.position.z) / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(distance));
  }, [camera]);

  // Main ball throw handler
  const handleThrow = useCallback(
    (throwEdition: BallEdition) => {
      // 1. Get current world position of the main ball
      const startPos = new THREE.Vector3();
      if (mainBallInnerRef.current) {
        mainBallInnerRef.current.getWorldPosition(startPos);
      } else if (groupRef.current) {
        groupRef.current.getWorldPosition(startPos);
      } else {
        startPos.set(0, initialY, 0);
      }

      // 2. Get target position of the cart button
      const targetPos = getCartTargetPosition();

      // 3. Compute control point for high parabolic basketball jumper arc
      const apexY = Math.max(startPos.y, targetPos.y) + (isMobile ? 1.6 : 2.4);
      const controlPos = new THREE.Vector3(
        startPos.x * 0.45 + targetPos.x * 0.55,
        apexY,
        (startPos.z + targetPos.z) / 2 + 0.3
      );

      // 4. Anticipation squash on main ball, then hide it as projectile takes over
      if (mainBallWrapperRef.current) {
        gsap.killTweensOf(mainBallWrapperRef.current.scale);
        gsap.killTweensOf(mainBallWrapperRef.current.position);

        gsap.timeline()
          .to(mainBallWrapperRef.current.scale, {
            y: 0.84,
            x: 1.12,
            z: 1.12,
            duration: 0.08,
            ease: 'power1.in',
          })
          .to(mainBallWrapperRef.current.scale, {
            y: 0,
            x: 0,
            z: 0,
            duration: 0.05,
            ease: 'power2.in',
          });
      }

      // 5. Spawn projectile ball that flies along the arc
      const newId = Date.now() + Math.random();
      setProjectiles((prev) => [
        ...prev,
        {
          id: newId,
          edition: throwEdition,
          startPos,
          controlPos,
          targetPos,
          baseScale: responsiveScale,
        },
      ]);

      // 6. Schedule fresh ball rack feed drop-in
      if (!isRespawningRef.current) {
        isRespawningRef.current = true;
        setTimeout(() => {
          if (mainBallWrapperRef.current) {
            mainBallWrapperRef.current.position.y = 3.2;
            mainBallWrapperRef.current.scale.set(1, 1, 1);

            gsap.to(mainBallWrapperRef.current.position, {
              y: 0,
              duration: 0.65,
              ease: 'bounce.out',
              onComplete: () => {
                isRespawningRef.current = false;
              },
            });
          } else {
            isRespawningRef.current = false;
          }
        }, 550);
      }
    },
    [getCartTargetPosition, initialY, isMobile, responsiveScale]
  );

  const handleProjectileLanded = useCallback((id: number, landedEdition: BallEdition) => {
    // Remove projectile from scene
    setProjectiles((prev) => prev.filter((p) => p.id !== id));

    // Dispatch custom event to notify UI that ball swished into cart
    window.dispatchEvent(
      new CustomEvent('slam-dunk:ball-landed', {
        detail: { edition: landedEdition },
      })
    );
  }, []);

  // Listen for global throw trigger event
  useEffect(() => {
    const onThrowEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ edition: BallEdition }>;
      const targetEd = customEvent.detail?.edition || edition;
      handleThrow(targetEd);
    };

    window.addEventListener('slam-dunk:throw-ball', onThrowEvent);
    return () => {
      window.removeEventListener('slam-dunk:throw-ball', onThrowEvent);
    };
  }, [edition, handleThrow]);

  // ScrollTrigger timeline setup
  useEffect(() => {
    if (!groupRef.current) return;

    ScrollTrigger.refresh();
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

      tl.fromTo(
        groupRef.current.position,
        { x: 0, y: initialY, z: 0 },
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
    <>
      {/* Main Interactive Floating Basketball */}
      <group ref={groupRef} position={[0, initialY, 0]}>
        <group ref={mainBallWrapperRef}>
          <Float
            speed={2.2}
            rotationIntensity={0.5}
            floatIntensity={isMobile ? 0.35 : 0.9}
            floatingRange={isMobile ? [-0.08, 0.08] : [-0.18, 0.18]}
          >
            <group ref={mainBallInnerRef}>
              <Basketball edition={edition} scale={responsiveScale} />
            </group>
          </Float>
        </group>
      </group>

      {/* Active Projectile Balls In Flight */}
      {projectiles.map((p) => (
        <ProjectileBall
          key={p.id}
          id={p.id}
          edition={p.edition}
          startPos={p.startPos}
          controlPos={p.controlPos}
          targetPos={p.targetPos}
          baseScale={p.baseScale}
          onLanded={handleProjectileLanded}
        />
      ))}
    </>
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
      : edition === 'oro'
      ? '#f59e0b'
      : '#64748b';

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      <Canvas
        style={{ pointerEvents: 'none' }}
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
