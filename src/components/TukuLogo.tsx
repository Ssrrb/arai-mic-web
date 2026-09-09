import React from 'react';

interface TukuLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  tagline?: string;
  idPrefix?: string;
}

export function TukuLogo({
  size = 40,
  className = '',
  showWordmark = false,
  tagline,
  idPrefix = 'tuku-logo',
}: TukuLogoProps) {
  const blueGradId = `${idPrefix}-blue`;
  const sheenId = `${idPrefix}-sheen`;
  const orangeFrontId = `${idPrefix}-orange-front`;
  const orangeDepthId = `${idPrefix}-orange-depth`;
  const shadowId = `${idPrefix}-shadow`;
  const indentId = `${idPrefix}-indent`;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official TUKU 3D Cushion Emblem with Orange Typography */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105 select-none"
        style={{ filter: 'drop-shadow(0 4px 14px rgba(0, 114, 206, 0.4))' }}
      >
        <defs>
          {/* Blue 3D Sphere / Cushion Gradient */}
          <radialGradient id={blueGradId} cx="36%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#38a5ff" />
            <stop offset="35%" stopColor="#0e83ea" />
            <stop offset="72%" stopColor="#0063cc" />
            <stop offset="100%" stopColor="#003c88" />
          </radialGradient>

          {/* Top Sheen */}
          <radialGradient id={sheenId} cx="50%" cy="14%" r="46%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.55)" />
            <stop offset="65%" stopColor="rgba(255, 255, 255, 0.06)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>

          {/* Front Face Orange */}
          <linearGradient id={orangeFrontId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff9a34" />
            <stop offset="40%" stopColor="#ff6f00" />
            <stop offset="100%" stopColor="#e65100" />
          </linearGradient>

          {/* Extruded Depth */}
          <linearGradient id={orangeDepthId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c43e06" />
            <stop offset="100%" stopColor="#822000" />
          </linearGradient>

          {/* Pillow indentation behind letters */}
          <filter id={indentId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#00265c" floodOpacity="0.75" />
          </filter>

          {/* 3D Extrusion Shadow */}
          <filter id={shadowId} x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#701800" floodOpacity="0.8" />
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#00183b" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Circular Blue Cushion */}
        <circle cx="250" cy="250" r="236" fill={`url(#${blueGradId})`} />
        {/* Soft glossy top highlight */}
        <circle cx="250" cy="250" r="236" fill={`url(#${sheenId})`} />

        {/* Pillow indentation groove */}
        <g filter={`url(#${indentId})`}>
          <ellipse cx="250" cy="265" rx="192" ry="68" fill="#00469b" opacity="0.45" />
        </g>

        {/* 3D Extruded Depth Layer (Orange Shadow/Sides) */}
        <g filter={`url(#${shadowId})`}>
          {/* T */}
          <path
            d="M 72 216 Q 72 204 84 204 L 148 204 Q 160 204 160 216 Q 160 228 148 228 L 126 228 L 126 298 Q 126 312 116 312 Q 106 312 106 298 L 106 228 L 84 228 Q 72 228 72 216 Z"
            transform="translate(0, 8)"
            fill={`url(#${orangeDepthId})`}
          />
          {/* U */}
          <path
            d="M 174 216 Q 174 204 186 204 Q 198 204 198 216 L 198 274 Q 198 296 214 296 Q 230 296 230 274 L 230 216 Q 230 204 242 204 Q 254 204 254 216 L 254 274 Q 254 314 214 314 Q 174 314 174 274 Z"
            transform="translate(0, 8)"
            fill={`url(#${orangeDepthId})`}
          />
          {/* K */}
          <path
            d="M 270 216 Q 270 204 282 204 Q 294 204 294 216 L 294 298 Q 294 312 282 312 Q 270 312 270 298 Z
               M 292 258 L 334 214 Q 343 205 352 214 Q 361 223 352 232 L 314 272 L 354 300 Q 363 306 357 317 Q 351 324 341 318 L 292 284 Z"
            transform="translate(0, 8)"
            fill={`url(#${orangeDepthId})`}
          />
          {/* U (Second) */}
          <path
            d="M 374 216 Q 374 204 386 204 Q 398 204 398 216 L 398 274 Q 398 296 414 296 Q 430 296 430 274 L 430 216 Q 430 204 442 204 Q 454 204 454 216 L 454 274 Q 454 314 414 314 Q 374 314 374 274 Z"
            transform="translate(0, 8)"
            fill={`url(#${orangeDepthId})`}
          />
        </g>

        {/* Crisp Vibrant Orange Front Faces */}
        <g>
          {/* T */}
          <path
            d="M 72 216 Q 72 204 84 204 L 148 204 Q 160 204 160 216 Q 160 228 148 228 L 126 228 L 126 298 Q 126 312 116 312 Q 106 312 106 298 L 106 228 L 84 228 Q 72 228 72 216 Z"
            fill={`url(#${orangeFrontId})`}
          />
          <path d="M 86 208 L 146 208" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />

          {/* U */}
          <path
            d="M 174 216 Q 174 204 186 204 Q 198 204 198 216 L 198 274 Q 198 296 214 296 Q 230 296 230 274 L 230 216 Q 230 204 242 204 Q 254 204 254 216 L 254 274 Q 254 314 214 314 Q 174 314 174 274 Z"
            fill={`url(#${orangeFrontId})`}
          />
          <ellipse cx="186" cy="207" rx="6" ry="2.5" fill="rgba(255,255,255,0.45)" />
          <ellipse cx="242" cy="207" rx="6" ry="2.5" fill="rgba(255,255,255,0.45)" />

          {/* K */}
          <path
            d="M 270 216 Q 270 204 282 204 Q 294 204 294 216 L 294 298 Q 294 312 282 312 Q 270 312 270 298 Z
               M 292 258 L 334 214 Q 343 205 352 214 Q 361 223 352 232 L 314 272 L 354 300 Q 363 306 357 317 Q 351 324 341 318 L 292 284 Z"
            fill={`url(#${orangeFrontId})`}
          />
          <ellipse cx="282" cy="207" rx="6" ry="2.5" fill="rgba(255,255,255,0.45)" />

          {/* U (Second) */}
          <path
            d="M 374 216 Q 374 204 386 204 Q 398 204 398 216 L 398 274 Q 398 296 414 296 Q 430 296 430 274 L 430 216 Q 430 204 442 204 Q 454 204 454 216 L 454 274 Q 454 314 414 314 Q 374 314 374 274 Z"
            fill={`url(#${orangeFrontId})`}
          />
          <ellipse cx="386" cy="207" rx="6" ry="2.5" fill="rgba(255,255,255,0.45)" />
          <ellipse cx="442" cy="207" rx="6" ry="2.5" fill="rgba(255,255,255,0.45)" />
        </g>
      </svg>

      {/* Optional Wordmark and Tagline */}
      {showWordmark && (
        <div className="flex flex-col text-left">
          <span className="font-headline text-2xl sm:text-3xl lg:text-[30px] tracking-[0.2em] font-black uppercase text-white leading-none drop-shadow-sm">
            TUKU
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#ff6f00] mt-0.5">
            {tagline || 'Desarrollada por Arai'}
          </span>
        </div>
      )}
    </div>
  );
}
