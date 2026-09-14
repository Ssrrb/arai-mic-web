import React from 'react';

interface ViewportFrameProps {
  color: string;
}

/**
 * ViewportFrame renders a responsive, high-precision outer margin / frame around the
 * entire application viewport, matching the reference editorial design.
 * The frame dynamically adapts its color to the primary tone of the selected basketball model
 * with smooth color transitions and mathematically precise curved inner corners.
 */
export function ViewportFrame({ color }: ViewportFrameProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Top Edge Bar */}
      <div
        className="absolute top-0 left-0 right-0 transition-colors duration-600 ease-out"
        style={{
          height: 'var(--frame-margin, 28px)',
          backgroundColor: color,
        }}
      />

      {/* 2. Bottom Edge Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-colors duration-600 ease-out"
        style={{
          height: 'var(--frame-margin, 28px)',
          backgroundColor: color,
        }}
      />

      {/* 3. Left Edge Bar */}
      <div
        className="absolute top-0 bottom-0 left-0 transition-colors duration-600 ease-out"
        style={{
          width: 'var(--frame-margin, 28px)',
          backgroundColor: color,
        }}
      />

      {/* 4. Right Edge Bar */}
      <div
        className="absolute top-0 bottom-0 right-0 transition-colors duration-600 ease-out"
        style={{
          width: 'var(--frame-margin, 28px)',
          backgroundColor: color,
        }}
      />

      {/* 5. Top-Left Inner Rounded Corner Wedge */}
      <div
        className="absolute"
        style={{
          top: 'var(--frame-margin, 28px)',
          left: 'var(--frame-margin, 28px)',
          width: 'var(--frame-radius, 36px)',
          height: 'var(--frame-radius, 36px)',
        }}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full block"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <path
            d="M 0 0 L 40 0 A 40 40 0 0 0 0 40 Z"
            fill={color}
            style={{ transition: 'fill 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          <path
            d="M 40 0 A 40 40 0 0 0 0 40"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* 6. Top-Right Inner Rounded Corner Wedge */}
      <div
        className="absolute"
        style={{
          top: 'var(--frame-margin, 28px)',
          right: 'var(--frame-margin, 28px)',
          width: 'var(--frame-radius, 36px)',
          height: 'var(--frame-radius, 36px)',
        }}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full block"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <path
            d="M 40 0 L 40 40 A 40 40 0 0 0 0 0 Z"
            fill={color}
            style={{ transition: 'fill 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          <path
            d="M 0 0 A 40 40 0 0 1 40 40"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* 7. Bottom-Left Inner Rounded Corner Wedge */}
      <div
        className="absolute"
        style={{
          bottom: 'var(--frame-margin, 28px)',
          left: 'var(--frame-margin, 28px)',
          width: 'var(--frame-radius, 36px)',
          height: 'var(--frame-radius, 36px)',
        }}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full block"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <path
            d="M 0 40 L 0 0 A 40 40 0 0 0 40 40 Z"
            fill={color}
            style={{ transition: 'fill 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          <path
            d="M 0 0 A 40 40 0 0 0 40 40"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* 8. Bottom-Right Inner Rounded Corner Wedge */}
      <div
        className="absolute"
        style={{
          bottom: 'var(--frame-margin, 28px)',
          right: 'var(--frame-margin, 28px)',
          width: 'var(--frame-radius, 36px)',
          height: 'var(--frame-radius, 36px)',
        }}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full block"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <path
            d="M 40 40 L 40 0 A 40 40 0 0 1 0 40 Z"
            fill={color}
            style={{ transition: 'fill 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          <path
            d="M 40 0 A 40 40 0 0 1 0 40"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* 9. Hairline Inner Border Lines connecting the curved corners */}
      {/* Top line */}
      <div
        className="absolute h-[1px] bg-white/[0.08]"
        style={{
          top: 'var(--frame-margin, 28px)',
          left: 'calc(var(--frame-margin, 28px) + var(--frame-radius, 36px))',
          right: 'calc(var(--frame-margin, 28px) + var(--frame-radius, 36px))',
        }}
      />
      {/* Bottom line */}
      <div
        className="absolute h-[1px] bg-white/[0.08]"
        style={{
          bottom: 'var(--frame-margin, 28px)',
          left: 'calc(var(--frame-margin, 28px) + var(--frame-radius, 36px))',
          right: 'calc(var(--frame-margin, 28px) + var(--frame-radius, 36px))',
        }}
      />
      {/* Left line */}
      <div
        className="absolute w-[1px] bg-white/[0.08]"
        style={{
          left: 'var(--frame-margin, 28px)',
          top: 'calc(var(--frame-margin, 28px) + var(--frame-radius, 36px))',
          bottom: 'calc(var(--frame-margin, 28px) + var(--frame-radius, 36px))',
        }}
      />
      {/* Right line */}
      <div
        className="absolute w-[1px] bg-white/[0.08]"
        style={{
          right: 'var(--frame-margin, 28px)',
          top: 'calc(var(--frame-margin, 28px) + var(--frame-radius, 36px))',
          bottom: 'calc(var(--frame-margin, 28px) + var(--frame-radius, 36px))',
        }}
      />
    </div>
  );
}
