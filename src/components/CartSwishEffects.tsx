import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { BallEdition } from './Basketball';
import { playBasketballSwish } from '../utils/audio';

interface SwishSpark {
  id: number;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  scale: number;
}

interface FloatingBadge {
  id: number;
  edition: BallEdition;
  text: string;
  color: string;
  x: number;
  y: number;
}

export function CartSwishEffects() {
  const [sparks, setSparks] = useState<SwishSpark[]>([]);
  const [badges, setBadges] = useState<FloatingBadge[]>([]);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBallLanded = (event: Event) => {
      const customEvent = event as CustomEvent<{ edition: BallEdition }>;
      const edition = customEvent.detail?.edition || 'nebula';

      // 1. Play synthesized physical basketball swish sound
      playBasketballSwish();

      // 2. Determine edition accent color
      let accentColor = '#00c2ff';
      if (edition === 'fuego') accentColor = '#ff5722';
      else if (edition === 'oro') accentColor = '#f59e0b';
      else if (edition === 'metal') accentColor = '#94a3b8';

      // 3. Locate the cart button coordinates
      const cartBtn = document.getElementById('open-cart-btn');
      let targetX = window.innerWidth - 65;
      let targetY = 32;

      if (cartBtn) {
        const rect = cartBtn.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;

        // Animate the cart button itself with GSAP: Net snap & elastic rim spring!
        gsap.killTweensOf(cartBtn);
        gsap.timeline()
          .to(cartBtn, {
            y: 9,
            scale: 1.4,
            rotate: -7,
            duration: 0.12,
            ease: 'power2.out',
          })
          .to(cartBtn, {
            y: -3,
            scale: 1.18,
            rotate: 4,
            duration: 0.14,
            ease: 'power1.inOut',
          })
          .to(cartBtn, {
            y: 0,
            scale: 1.0,
            rotate: 0,
            duration: 0.45,
            ease: 'elastic.out(1.4, 0.35)',
          });
      }

      // 4. Animate expanding shockwave ripple ring
      if (rippleRef.current) {
        gsap.killTweensOf(rippleRef.current);
        gsap.set(rippleRef.current, {
          left: targetX,
          top: targetY,
          scale: 0.4,
          opacity: 1,
          borderColor: accentColor,
        });
        gsap.to(rippleRef.current, {
          scale: 2.8,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
        });
      }

      // 6. Spawn burst of celebratory spark particles
      const newSparks: SwishSpark[] = [];
      const sparkCount = 14;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 55 + 30;
        newSparks.push({
          id: Date.now() + i,
          x: targetX,
          y: targetY,
          color: i % 2 === 0 ? accentColor : '#ffffff',
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          scale: Math.random() * 0.7 + 0.5,
        });
      }
      setSparks((prev) => [...prev, ...newSparks]);

      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => !newSparks.some((ns) => ns.id === s.id)));
      }, 700);
    };

    window.addEventListener('tuku:ball-landed', handleBallLanded);
    return () => {
      window.removeEventListener('tuku:ball-landed', handleBallLanded);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Shockwave expanding net ripple ring */}
      <div
        ref={rippleRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 opacity-0 pointer-events-none"
        style={{ boxShadow: '0 0 20px currentColor' }}
      />

      {/* Floating "+1 SWISH!" badges */}
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="absolute -translate-x-1/2 z-50 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-75 duration-300"
          style={{
            left: badge.x - 30,
            top: badge.y,
            backgroundColor: `${badge.color}25`,
            borderColor: `${badge.color}80`,
            borderWidth: '1px',
            color: '#ffffff',
            boxShadow: `0 0 16px ${badge.color}50`,
          }}
        >
          <span style={{ color: badge.color }}>{badge.text}</span>
        </div>
      ))}

      {/* Burst spark particles */}
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            left: spark.x,
            top: spark.y,
            backgroundColor: spark.color,
            boxShadow: `0 0 8px ${spark.color}`,
            transform: `translate(${spark.vx}px, ${spark.vy}px) scale(${spark.scale})`,
            transition: 'transform 0.65s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.65s ease-out',
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
