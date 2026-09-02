import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, CanvasTexture, RepeatWrapping } from 'three';
import { Sphere } from '@react-three/drei';

export type BallEdition = 'fuego' | 'obsidiana' | 'oro';

interface BasketballProps {
  edition?: BallEdition;
  scale?: number;
  [key: string]: any;
}

export function Basketball({ edition = 'fuego', scale = 1.2, ...props }: BasketballProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  // Generate procedural high-definition texture for TUKU basketball
  const { diffuseTexture, bumpTexture } = useMemo(() => {
    // 1. Diffuse Color Texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 2. Bump Map Canvas
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 2048;
    bumpCanvas.height = 1024;
    const bumpCtx = bumpCanvas.getContext('2d');

    if (ctx && bumpCtx) {
      const w = canvas.width;
      const h = canvas.height;

      // Color scheme based on edition
      let baseColor = '#d94819';
      let channelColor = '#171717';

      if (edition === 'obsidiana') {
        baseColor = '#1c1917';
        channelColor = '#0c0a09';
      } else if (edition === 'oro') {
        baseColor = '#f8fafc';
        channelColor = '#1e293b';
      }

      // Fill background
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, w, h);

      bumpCtx.fillStyle = '#808080';
      bumpCtx.fillRect(0, 0, w, h);

      // Add pebbled leather grain
      const grainCount = 30000;
      for (let i = 0; i < grainCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const radius = Math.random() * 2.5 + 0.8;
        
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Pebbled bump
        bumpCtx.fillStyle = Math.random() > 0.5 ? '#a0a0a0' : '#606060';
        bumpCtx.beginPath();
        bumpCtx.arc(x, y, radius, 0, Math.PI * 2);
        bumpCtx.fill();
      }

      // Draw Basketball Seams / Grooves
      const drawChannel = (startX: number, startY: number, endX: number, endY: number, width: number, curveOffset = 0) => {
        [ctx, bumpCtx].forEach((c, idx) => {
          if (!c) return;
          c.strokeStyle = idx === 0 ? channelColor : '#000000';
          c.lineWidth = width;
          c.lineCap = 'round';
          c.beginPath();
          c.moveTo(startX, startY);
          if (curveOffset !== 0) {
            c.quadraticCurveTo((startX + endX) / 2 + curveOffset, (startY + endY) / 2, endX, endY);
          } else {
            c.lineTo(endX, endY);
          }
          c.stroke();
        });
      };

      // Horizontal equator seam
      drawChannel(0, h * 0.5, w, h * 0.5, 14);

      // Vertical quadrant seams
      drawChannel(w * 0.25, 0, w * 0.25, h, 14);
      drawChannel(w * 0.5, 0, w * 0.5, h, 14);
      drawChannel(w * 0.75, 0, w * 0.75, h, 14);

      // Curved panel ribs (classic 8-panel arc lines)
      ctx.lineWidth = 14;
      bumpCtx.lineWidth = 14;
      
      // Arc ribs
      for (let panel = 0; panel < 4; panel++) {
        const cx = (w / 4) * panel + (w / 8);
        [ctx, bumpCtx].forEach((c, idx) => {
          if (!c) return;
          c.strokeStyle = idx === 0 ? channelColor : '#000000';
          c.beginPath();
          c.ellipse(cx, h * 0.5, w * 0.08, h * 0.38, 0, 0, Math.PI * 2);
          c.stroke();
        });
      }

      // Seams and ribs are complete. No text or stamps on the ball.
    }

    const diffTex = new CanvasTexture(canvas);
    diffTex.wrapS = RepeatWrapping;
    diffTex.wrapT = RepeatWrapping;
    diffTex.needsUpdate = true;

    const bumpTex = new CanvasTexture(bumpCanvas);
    bumpTex.wrapS = RepeatWrapping;
    bumpTex.wrapT = RepeatWrapping;
    bumpTex.needsUpdate = true;

    return { diffuseTexture: diffTex, bumpTexture: bumpTex };
  }, [edition]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.15;
    }
  });

  return (
    <group ref={groupRef} {...props}>
      {/* Main Basketball Sphere */}
      <Sphere ref={meshRef} args={[1 * scale, 64, 64]}>
        <meshStandardMaterial
          map={diffuseTexture}
          bumpMap={bumpTexture}
          bumpScale={0.03}
          roughness={0.42}
          metalness={edition === 'oro' ? 0.4 : 0.15}
          envMapIntensity={1.3}
        />
      </Sphere>
    </group>
  );
}

