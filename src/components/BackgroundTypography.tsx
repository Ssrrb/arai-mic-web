import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BackgroundTypographyProps {
  modelName: string;
  bgLeft?: string;
  bgRight?: string;
  isCustomizer?: boolean;
  accentColor?: string;
}

export function BackgroundTypography({
  modelName,
  bgLeft,
  bgRight,
  isCustomizer = false,
  accentColor,
}: BackgroundTypographyProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isCustomizer) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        {/* Reference floating orbital dot positioned beside the custom ball */}
        <div className="hidden lg:block absolute left-[54%] top-[34%] w-4 h-4 rounded-full bg-[#525763] opacity-80" />
      </div>
    );
  }

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
      {/* Desktop & Tablet Layout: Ball occupies the center with tightly framing typographic wings */}
      <div className="hidden md:flex w-full items-center justify-center px-4 md:px-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={modelName}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.03, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="w-full max-w-full flex items-center justify-center relative"
          >
            {/* Left Word Wing - Snugly frames the ball with zero obstruction */}
            <div className="flex-1 flex justify-end items-center min-w-0 pr-2 md:pr-3 lg:pr-4 relative">
              <span
                className="font-headline tracking-normal uppercase leading-none select-none text-[clamp(4.5rem,min(13.5vw,40vh),15rem)] lg:text-[clamp(6rem,min(14.5vw,45vh),18rem)] text-right whitespace-nowrap text-[#636875] transition-colors duration-300"
                style={{ textRendering: 'geometricPrecision' }}
              >
                {displayLeft}
              </span>

              {/* Signature decorative accent dot anchored to the left wing baseline as in the reference */}
              <div
                className="hidden lg:block absolute bottom-2 right-12 w-3.5 h-3.5 rounded-full bg-[#555a66] transition-colors duration-300"
                style={{
                  backgroundColor: accentColor ? `${accentColor}99` : '#555a66',
                }}
              />
            </div>

            {/* Central Space Reserved for the 3D Basketball Model - Mathematically matched to the 3D sphere diameter */}
            {/* 3D Ball diameter = 57.9vh on desktop, 47.1vh on tablet. Spacer provides exact 16-20px breath of space */}
            <div
              className="shrink-0 h-4 pointer-events-none relative flex items-center justify-center w-[clamp(280px,calc(47.1vh+10px),440px)] lg:w-[clamp(360px,calc(57.9vh+16px),640px)]"
            />

            {/* Right Word Wing */}
            <div className="flex-1 flex justify-start items-center min-w-0 pl-2 md:pl-3 lg:pl-4 relative">
              <span
                className="font-headline tracking-normal uppercase leading-none select-none text-[clamp(4.5rem,min(13.5vw,40vh),15rem)] lg:text-[clamp(6rem,min(14.5vw,45vh),18rem)] text-left whitespace-nowrap text-[#636875] transition-colors duration-300"
                style={{ textRendering: 'geometricPrecision' }}
              >
                {displayRight}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Layout: Centered readable typography positioned right below the raised 3D ball */}
      <div className="md:hidden flex items-center justify-center w-full px-6 overflow-hidden mt-14 sm:mt-18">
        <AnimatePresence mode="wait">
          <motion.div
            key={`mobile-${modelName}`}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.06, y: -10 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="flex items-center justify-center tracking-tight"
          >
            <span
              className="font-headline uppercase leading-none select-none text-[clamp(4.2rem,18vw,6.5rem)] text-center whitespace-nowrap text-[#636875]"
              style={{ textRendering: 'geometricPrecision' }}
            >
              {modelName}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
