import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer, ContactShadows } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { Basketball, BallEdition } from './Basketball';
import { ProjectileBall } from './ProjectileBall';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { CustomBallConfig, AppView } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface ActiveProjectile {
  id: number;
  edition: BallEdition | 'custom';
  customConfig?: CustomBallConfig;
  startPos: THREE.Vector3;
  controlPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  baseScale: number;
}

interface SceneControllerProps {
  edition: BallEdition;
  viewMode: AppView;
  customConfig: CustomBallConfig;
  autoRotate: boolean;
}

function SceneController({
  edition,
  viewMode,
  customConfig,
  autoRotate,
}: SceneControllerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rotGroupRef = useRef<THREE.Group>(null);
  const mainBallWrapperRef = useRef<THREE.Group>(null);
  const mainBallInnerRef = useRef<THREE.Group>(null);

  const [projectiles, setProjectiles] = useState<ActiveProjectile[]>([]);
  const isRespawningRef = useRef(false);

  // Drag rotation state
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const rotVelocityRef = useRef({ x: 0, y: 0 });
  const userRotRef = useRef({ x: 0.1, y: 0.35 });

  const { size, camera } = useThree();

  const isMobile = size.width < 768;
  const isTablet = size.width >= 768 && size.width < 1024;

  // Responsive scale tailored to viewport
  let responsiveScale = 1.18;
  if (viewMode === 'customizer') {
    responsiveScale = isMobile ? 0.92 : isTablet ? 1.08 : 1.32;
  } else {
    responsiveScale = isMobile ? 0.78 : isTablet ? 0.96 : 1.18;
  }

  const landingInitialY = isMobile ? 0.98 : 0;
  const customizerTargetPos = isMobile
    ? new THREE.Vector3(0, 1.15, 0)
    : isTablet
    ? new THREE.Vector3(1.05, 0, 0.1)
    : new THREE.Vector3(1.42, -0.05, 0.15);

  // Frame loop: smooth physics damping for interactive drag rotation & gentle auto-rotation
  useFrame((_, delta) => {
    if (!rotGroupRef.current) return;

    if (viewMode === 'customizer') {
      if (isDraggingRef.current) {
        userRotRef.current.y += rotVelocityRef.current.y;
        userRotRef.current.x += rotVelocityRef.current.x;
        rotVelocityRef.current.x *= 0.88;
        rotVelocityRef.current.y *= 0.88;
      } else {
        userRotRef.current.y += rotVelocityRef.current.y;
        userRotRef.current.x += rotVelocityRef.current.x;
        rotVelocityRef.current.x *= 0.92;
        rotVelocityRef.current.y *= 0.92;

        if (autoRotate) {
          userRotRef.current.y += delta * 0.45;
        }
      }

      // Clamp vertical pitch to prevent inversion
      userRotRef.current.x = Math.max(-1.25, Math.min(1.25, userRotRef.current.x));

      rotGroupRef.current.rotation.x = userRotRef.current.x;
      rotGroupRef.current.rotation.y = userRotRef.current.y;
    }
  });

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
    (throwEdition: BallEdition | 'custom', conf?: CustomBallConfig) => {
      const startPos = new THREE.Vector3();
      if (mainBallInnerRef.current) {
        mainBallInnerRef.current.getWorldPosition(startPos);
      } else if (groupRef.current) {
        groupRef.current.getWorldPosition(startPos);
      } else {
        startPos.set(0, landingInitialY, 0);
      }

      const targetPos = getCartTargetPosition();

      // Parabolic jump shot arc
      const apexY = Math.max(startPos.y, targetPos.y) + (isMobile ? 1.6 : 2.4);
      const controlPos = new THREE.Vector3(
        startPos.x * 0.45 + targetPos.x * 0.55,
        apexY,
        (startPos.z + targetPos.z) / 2 + 0.3
      );

      // Anticipation squash on ball
      if (mainBallWrapperRef.current) {
        gsap.killTweensOf(mainBallWrapperRef.current.scale);
        gsap.killTweensOf(mainBallWrapperRef.current.position);

        gsap
          .timeline()
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

      // Spawn projectile ball that flies along the arc
      const newId = Date.now() + Math.random();
      setProjectiles((prev) => [
        ...prev,
        {
          id: newId,
          edition: throwEdition,
          customConfig: conf || (throwEdition === 'custom' ? customConfig : undefined),
          startPos,
          controlPos,
          targetPos,
          baseScale: responsiveScale,
        },
      ]);

      // Schedule fresh ball rack feed drop-in
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
    [getCartTargetPosition, landingInitialY, isMobile, responsiveScale, customConfig]
  );

  const handleProjectileLanded = useCallback(
    (id: number, landedEdition: BallEdition | 'custom') => {
      setProjectiles((prev) => prev.filter((p) => p.id !== id));

      window.dispatchEvent(
        new CustomEvent('tuku:ball-landed', {
          detail: { edition: landedEdition },
        })
      );
    },
    []
  );

  // Listen for global throw trigger event and reset rotation
  useEffect(() => {
    const onThrowEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        edition?: BallEdition | 'custom';
        customConfig?: CustomBallConfig;
      }>;
      const targetEd =
        customEvent.detail?.edition || (viewMode === 'customizer' ? 'custom' : edition);
      const conf =
        targetEd === 'custom'
          ? customEvent.detail?.customConfig || customConfig
          : undefined;
      handleThrow(targetEd, conf);
    };

    const onResetRotation = () => {
      userRotRef.current = { x: 0.1, y: 0.35 };
      rotVelocityRef.current = { x: 0, y: 0 };
    };

    window.addEventListener('tuku:throw-ball', onThrowEvent);
    window.addEventListener('tuku-throw-ball', onThrowEvent);
    window.addEventListener('tuku-reset-rotation', onResetRotation);
    return () => {
      window.removeEventListener('tuku:throw-ball', onThrowEvent);
      window.removeEventListener('tuku-throw-ball', onThrowEvent);
      window.removeEventListener('tuku-reset-rotation', onResetRotation);
    };
  }, [edition, viewMode, customConfig, handleThrow]);

  // Position transition and ScrollTrigger
  useEffect(() => {
    if (!groupRef.current) return;

    if (viewMode === 'customizer') {
      gsap.to(groupRef.current.position, {
        x: customizerTargetPos.x,
        y: customizerTargetPos.y,
        z: customizerTargetPos.z,
        duration: 0.65,
        ease: 'power3.out',
      });
      return;
    }

    // Landing view mode: ScrollTrigger timeline setup
    ScrollTrigger.refresh();
    groupRef.current.position.set(0, landingInitialY, 0);

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
        groupRef.current!.position,
        { x: 0, y: landingInitialY, z: 0 },
        {
          x: xOffset,
          y: isMobile ? -0.35 : -0.8,
          z: zOffset,
          duration: 1,
        }
      )
        .to(groupRef.current!.position, {
          x: -xOffset,
          y: isMobile ? 0.35 : 0.6,
          z: zOffset * 0.75,
          duration: 1,
        })
        .to(groupRef.current!.position, {
          x: xOffset * 0.75,
          y: isMobile ? -0.2 : -0.4,
          z: zOffset * 0.85,
          duration: 1,
        })
        .to(groupRef.current!.position, {
          x: 0,
          y: isMobile ? 0.05 : 0.1,
          z: isMobile ? 1.2 : 2.2,
          duration: 1,
        });

      tl.to(groupRef.current!.rotation, { x: Math.PI * 0.8, y: Math.PI * 2.2, duration: 1 }, 0)
        .to(groupRef.current!.rotation, { x: Math.PI * 1.8, y: Math.PI * 4.4, duration: 1 }, 1)
        .to(groupRef.current!.rotation, { x: Math.PI * 2.6, y: Math.PI * 6.2, duration: 1 }, 2)
        .to(groupRef.current!.rotation, { x: Math.PI * 3.4, y: Math.PI * 8.0, duration: 1 }, 3);
    });

    return () => ctx.revert();
  }, [viewMode, isMobile, isTablet, landingInitialY, customizerTargetPos.x, customizerTargetPos.y, customizerTargetPos.z]);

  // Pointer drag interaction for customizer mode
  useEffect(() => {
    if (viewMode !== 'customizer') return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('a') ||
        target.closest('#open-cart-btn') ||
        target.closest('aside')
      ) {
        return;
      }

      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevPointerRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - prevPointerRef.current.x;
      const deltaY = clientY - prevPointerRef.current.y;

      prevPointerRef.current = { x: clientX, y: clientY };

      rotVelocityRef.current = {
        x: deltaY * 0.005,
        y: deltaX * 0.005,
      };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [viewMode]);

  return (
    <>
      {/* Main Interactive Floating Basketball */}
      <group ref={groupRef} position={[0, landingInitialY, 0]}>
        <group ref={mainBallWrapperRef}>
          <Float
            speed={viewMode === 'customizer' ? 1.4 : 2.2}
            rotationIntensity={viewMode === 'customizer' ? 0.08 : 0.5}
            floatIntensity={isMobile ? 0.3 : 0.8}
            floatingRange={isMobile ? [-0.06, 0.06] : [-0.15, 0.15]}
          >
            <group ref={rotGroupRef}>
              <group ref={mainBallInnerRef}>
                <Basketball
                  edition={edition}
                  customConfig={viewMode === 'customizer' ? customConfig : undefined}
                  scale={responsiveScale}
                  autoRotate={viewMode === 'landing'}
                />
              </group>
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
          customConfig={p.customConfig}
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
  viewMode?: AppView;
  customConfig?: CustomBallConfig;
  autoRotate?: boolean;
}

export function CanvasContainer({
  edition = 'nebula',
  viewMode = 'landing',
  customConfig = {
    baseColor: '#ff5722',
    lineColor: '#111111',
    textureType: 'classic',
  },
  autoRotate = true,
}: CanvasContainerProps) {
  const shadowColor =
    viewMode === 'customizer'
      ? customConfig.baseColor || '#ff5722'
      : edition === 'nebula'
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
        <ambientLight intensity={0.8} />
        <spotLight position={[8, 14, 8]} angle={0.28} penumbra={1} intensity={2.0} castShadow />
        <directionalLight
          position={[-8, -4, -4]}
          intensity={0.65}
          color={
            viewMode === 'customizer'
              ? customConfig.baseColor || '#ff7733'
              : edition === 'nebula'
              ? '#00e5ff'
              : '#ff7733'
          }
        />
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
                color={
                  viewMode === 'customizer'
                    ? customConfig.baseColor || '#ffaa55'
                    : edition === 'nebula'
                    ? '#00e5ff'
                    : '#ffaa55'
                }
              />
              <Lightformer intensity={1.5} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
              <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} color="#ffffff" />
            </group>
          </Environment>

          <SceneController
            edition={edition}
            viewMode={viewMode}
            customConfig={customConfig}
            autoRotate={autoRotate}
          />

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
