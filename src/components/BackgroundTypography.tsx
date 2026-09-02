import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BackgroundTypographyProps {
  modelName: string;
  bgLeft?: string;
  bgRight?: string;
}

export function BackgroundTypography({
  modelName,
  bgLeft,
  bgRight,
}: BackgroundTypographyProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute fade out and parallax effect based on scroll
  const opacity = Math.max(0, 1 - scrollY / 320);
  const translateY = scrollY * 0.22;

  if (opacity <= 0.01) return null;

  // Resolve left and right segments for short names (e.g. NEB / ULA, FUE / GO, O / RO, MET / AL)
  const displayLeft =
    bgLeft ||
    (modelName.length > 3
      ? modelName.slice(0, Math.ceil(modelName.length / 2))
      : modelName);
  const displayRight =
    bgRight ||
    (modelName.length > 3
      ? modelName.slice(Math.ceil(modelName.length / 2))
      : '');

  return (
    <div
      className="fixed inset-0 z-0 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden transition-opacity duration-150"
      style={{
        opacity,
        transform: `translateY(-${translateY}px)`,
      }}
      aria-hidden="true"
    >
      {/* Desktop & Tablet Layout: Ball occupies the center with flanking typographic wings */}
      <div className="hidden md:flex w-full items-center justify-center px-4 md:px-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={modelName}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04, y: -10 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="w-full max-w-full flex items-center justify-center relative"
          >
            {/* Left Word Wing */}
            <div className="flex-1 flex justify-end items-center overflow-hidden min-w-0 pr-2 lg:pr-4">
              <span
                className="font-headline font-black text-[#484d56] tracking-tight uppercase leading-none select-none text-[clamp(4.5rem,14.5vw,14.5rem)] text-right whitespace-nowrap"
                style={{ textRendering: 'geometricPrecision' }}
              >
                {displayLeft}
              </span>
            </div>

            {/* Central Space Reserved for the 3D Basketball Model */}
            <div className="shrink-0 w-[clamp(180px,26vw,340px)] h-4 pointer-events-none relative flex items-center justify-center">
              {/* Subtle accent dot next to the ball as seen in the reference */}
              <div className="absolute -top-14 -right-2 lg:-right-4 w-3.5 h-3.5 rounded-full bg-[#525763] opacity-80" />
            </div>

            {/* Right Word Wing */}
            <div className="flex-1 flex justify-start items-center overflow-hidden min-w-0 pl-2 lg:pl-4">
              <span
                className="font-headline font-black text-[#484d56] tracking-tight uppercase leading-none select-none text-[clamp(4.5rem,14.5vw,14.5rem)] text-left whitespace-nowrap"
                style={{ textRendering: 'geometricPrecision' }}
              >
                {displayRight}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Layout: Centered readable typography positioned right below the raised 3D ball */}
      {/* Since the ball model on mobile is placed at y: 0.98 (~top 26%), this text is completely unblocked! */}
      <div className="md:hidden flex items-center justify-center w-full px-6 overflow-hidden mt-12 sm:mt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={`mobile-${modelName}`}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.06, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex items-center justify-center tracking-tight"
          >
            <span
              className="font-headline font-black text-[#484d56] tracking-tight uppercase leading-none select-none text-[clamp(3.8rem,17vw,5.6rem)] text-center whitespace-nowrap"
              style={{ textRendering: 'geometricPrecision' }}
            >
              {displayLeft} {displayRight}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
