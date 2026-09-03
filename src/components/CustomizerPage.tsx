import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Check,
  ShoppingBag,
  Volume2,
  VolumeX,
  RotateCcw,
  Sliders,
  Type,
  Send,
  Zap,
} from 'lucide-react';
import { CustomBallConfig, GripTextureType } from '../types';
import { playButtonClick, playAddToCartLaunchSound } from '../utils/audio';

export const FIXED_CUSTOM_PRICE = 360000;

interface CustomizerPageProps {
  config: CustomBallConfig;
  onChangeConfig: (updater: (prev: CustomBallConfig) => CustomBallConfig) => void;
  onBackToShop: () => void;
  onAddToCart: () => void;
  cartCount: number;
  onOpenCart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isShooting: boolean;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onResetRotation: () => void;
}

// Curated base colors matching the reference screenshot exactly + custom picker
const BASE_COLORS = [
  { id: 'orange', label: 'Naranja Clásico', hex: '#ff5722' },
  { id: 'forest', label: 'Verde Bosque', hex: '#056434' },
  { id: 'blue', label: 'Azul Eléctrico', hex: '#0284c7' },
  { id: 'crimson', label: 'Rojo Carmesí', hex: '#991b1b' },
  { id: 'pink', label: 'Rosa Neón', hex: '#ec4899' },
  { id: 'black', label: 'Carbono Mate', hex: '#18181b' },
  { id: 'white', label: 'Blanco Puro', hex: '#ffffff' },
];

// Curated channel/line colors matching the reference screenshot exactly + custom picker
const LINE_COLORS = [
  { id: 'black', label: 'Negro Profundo', hex: '#111111' },
  { id: 'white', label: 'Blanco Nieve', hex: '#ffffff' },
  { id: 'gold', label: 'Oro Campeonato', hex: '#f59e0b' },
  { id: 'lime', label: 'Verde Lima', hex: '#4ade80' },
  { id: 'cyan', label: 'Cian Neón', hex: '#00f0ff' },
];

const GRIP_TEXTURES: {
  id: GripTextureType;
  label: string;
  sub: string;
  desc: string;
}[] = [
  {
    id: 'classic',
    label: 'CLÁSICA',
    sub: 'Microgranulado NBA',
    desc: 'Textura de micrograno oficial para canchas profesionales techadas.',
  },
  {
    id: 'street',
    label: 'CALLEJERA',
    sub: 'Asfalto Furtivo',
    desc: 'Compuesto abrasivo ultra-rugoso para máximo agarre en cemento y asfalto.',
  },
  {
    id: 'tech',
    label: 'TÉCNICA',
    sub: 'Matriz Hexagonal',
    desc: 'Estructura aeroespacial en panal de abeja con disipación de humedad.',
  },
  {
    id: 'cross',
    label: 'CRUZADA',
    sub: 'Moleteado Diamante',
    desc: 'Patrón cruzado tipo moleteado olímpico para control biomecánico total.',
  },
];

const AI_VIBES = [
  {
    name: 'Cyberpunk Neon',
    base: '#ec4899',
    line: '#00f0ff',
    texture: 'tech' as GripTextureType,
    vibe: 'Cyberpunk neon tiger con acentos cian holográficos',
  },
  {
    name: '90s Miami Vice',
    base: '#0284c7',
    line: '#ffffff',
    texture: 'classic' as GripTextureType,
    vibe: '90s Miami Vice retro vaporwave estético',
  },
  {
    name: 'Volcanic Magma',
    base: '#ff5722',
    line: '#111111',
    texture: 'street' as GripTextureType,
    vibe: 'Magma volcánico caliente con canales de obsidiana',
  },
  {
    name: 'Golden Trophy',
    base: '#ffffff',
    line: '#f59e0b',
    texture: 'cross' as GripTextureType,
    vibe: 'Trofeo de campeonato de oro y marfil',
  },
  {
    name: 'Midnight Stealth',
    base: '#18181b',
    line: '#4ade80',
    texture: 'street' as GripTextureType,
    vibe: 'Operaciones nocturnas con acentos verde radar',
  },
];

export function CustomizerPage({
  config,
  onChangeConfig,
  onBackToShop,
  onAddToCart,
  cartCount,
  onOpenCart,
  isMuted,
  onToggleMute,
  isShooting,
  autoRotate,
  onToggleAutoRotate,
  onResetRotation,
}: CustomizerPageProps) {
  const [vibePrompt, setVibePrompt] = useState('');
  const [isApplyingVibe, setIsApplyingVibe] = useState(false);
  const [customBasePickerOpen, setCustomBasePickerOpen] = useState(false);
  const [customLinePickerOpen, setCustomLinePickerOpen] = useState(false);

  const formatPYG = (amount: number): string => {
    return `₲ ${Math.round(amount).toLocaleString('es-PY')}`;
  };

  const handleApplyVibe = (vibeText: string) => {
    setIsApplyingVibe(true);
    playButtonClick('pop');

    // Smart semantic parser for vibe text
    const lower = vibeText.toLowerCase();
    let selectedBase = '#ff5722';
    let selectedLine = '#111111';
    let selectedTexture: GripTextureType = 'classic';

    if (lower.includes('cyber') || lower.includes('neon') || lower.includes('tiger')) {
      selectedBase = '#ec4899';
      selectedLine = '#00f0ff';
      selectedTexture = 'tech';
    } else if (lower.includes('miami') || lower.includes('vice') || lower.includes('ocean')) {
      selectedBase = '#0284c7';
      selectedLine = '#ffffff';
      selectedTexture = 'classic';
    } else if (lower.includes('magma') || lower.includes('volcan') || lower.includes('fuego')) {
      selectedBase = '#ff5722';
      selectedLine = '#111111';
      selectedTexture = 'street';
    } else if (lower.includes('oro') || lower.includes('gold') || lower.includes('trophy')) {
      selectedBase = '#ffffff';
      selectedLine = '#f59e0b';
      selectedTexture = 'cross';
    } else if (lower.includes('stealth') || lower.includes('midnight') || lower.includes('black') || lower.includes('dark')) {
      selectedBase = '#18181b';
      selectedLine = '#4ade80';
      selectedTexture = 'street';
    } else if (lower.includes('green') || lower.includes('forest') || lower.includes('celtics')) {
      selectedBase = '#056434';
      selectedLine = '#ffffff';
      selectedTexture = 'cross';
    } else {
      // Dynamic generative color mapping based on string hash
      let hash = 0;
      for (let i = 0; i < vibeText.length; i++) {
        hash = vibeText.charCodeAt(i) + ((hash << 5) - hash);
      }
      const c1 = (hash & 0x00ffffff).toString(16).padStart(6, '0');
      selectedBase = `#${c1}`;
      selectedLine = '#ffffff';
      selectedTexture = hash % 2 === 0 ? 'tech' : 'cross';
    }

    setTimeout(() => {
      onChangeConfig((prev) => ({
        ...prev,
        baseColor: selectedBase,
        lineColor: selectedLine,
        textureType: selectedTexture,
        vibeName: vibeText.trim(),
      }));
      setIsApplyingVibe(false);
    }, 400);
  };

  return (
    <div className="relative z-30 w-full min-h-screen text-white flex flex-col pointer-events-none">
      {/* Top Floating Bar for Customizer */}
      <header className="fixed top-0 left-0 w-full px-5 sm:px-8 lg:px-12 py-3.5 flex justify-between items-center z-40 backdrop-blur-md bg-zinc-950/40 border-b border-white/[0.05] pointer-events-auto">
        <button
          id="customizer-back-btn"
          onClick={() => {
            playButtonClick('nav');
            onBackToShop();
          }}
          className="flex items-center gap-2.5 text-zinc-400 hover:text-white group transition-colors cursor-pointer text-xs font-semibold tracking-wider uppercase"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a la tienda</span>
        </button>

        {/* Brand center emblem */}
        <div className="flex items-center gap-2">
          <span className="font-headline text-2xl tracking-[0.25em] font-black uppercase text-white leading-none drop-shadow-sm">
            TUKU
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#ff5722] bg-[#ff5722]/10 px-2 py-0.5 rounded-full border border-[#ff5722]/30">
            Lab
          </span>
        </div>

        {/* Right tools: 3D auto-rotate toggle, audio toggle, and cart */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              playButtonClick('subtle');
              onToggleAutoRotate();
            }}
            className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
              autoRotate
                ? 'border-[#ff5722]/50 bg-[#ff5722]/15 text-[#ff5722]'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white'
            }`}
            title={autoRotate ? 'Pausar auto-rotación' : 'Activar auto-rotación 3D'}
            aria-label={autoRotate ? 'Pausar rotación automática 3D' : 'Activar rotación automática 3D'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playButtonClick('subtle');
              onToggleMute();
            }}
            className="w-9 h-9 rounded-full border border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-[#ff5722]" />}
          </button>

          <button
            id="open-cart-btn"
            onClick={() => {
              playButtonClick('nav');
              onOpenCart();
            }}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.09] text-white transition-all duration-200 cursor-pointer"
            aria-label="Ver Carrito de Compras"
          >
            <ShoppingBag className="w-4 h-4 text-[#ff5722]" />
            <span className="text-xs font-bold font-mono">
              {cartCount > 0 ? (
                <span
                  id="cart-count-badge"
                  className="bg-[#ff5722] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full inline-block min-w-[18px] text-center"
                >
                  {cartCount}
                </span>
              ) : (
                <span className="text-zinc-400">0</span>
              )}
            </span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="w-full flex-1 pt-16 pb-28 md:pb-6 flex flex-col md:flex-row justify-between items-start">
        {/* Left Customization Control Panel - Exactly styled like the user reference screenshot */}
        <aside
          className="w-full md:w-[460px] lg:w-[490px] xl:w-[510px] pointer-events-auto bg-black/85 md:bg-black/80 backdrop-blur-2xl p-6 sm:p-8 md:min-h-[calc(100vh-4rem)] flex flex-col justify-between border-r border-white/[0.08] shadow-2xl relative z-30"
          style={{ willChange: 'transform' }}
        >
          <div className="space-y-7">
            <div>
              {/* Big, powerful headline from reference */}
              <h1 className="font-headline font-black text-4xl sm:text-5xl lg:text-[54px] uppercase tracking-tight text-white leading-[0.92] drop-shadow-md">
                CREA TU LEGADO
              </h1>
              <p className="text-zinc-400 text-sm mt-2 font-medium">
                Una pelota hecha para vos.
              </p>
            </div>

            {/* SECTION 1: BASE COLOR */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                  COLOR BASE
                </span>
                <span className="text-[11px] font-mono text-zinc-500 uppercase">
                  {config.baseColor}
                </span>
              </div>

              {/* Color Swatch Circles */}
              <div className="flex items-center flex-wrap gap-3">
                {BASE_COLORS.map((c) => {
                  const isSelected = config.baseColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        playButtonClick('pop');
                        onChangeConfig((prev) => ({ ...prev, baseColor: c.hex }));
                      }}
                      title={c.label}
                      className={`w-9 h-9 rounded-full transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110 shadow-lg'
                          : 'opacity-85 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={c.label}
                    />
                  );
                })}

                {/* Custom Color Input Trigger */}
                <label
                  title="Elegir color personalizado"
                  className="w-9 h-9 rounded-full border border-dashed border-zinc-600 hover:border-white flex items-center justify-center cursor-pointer transition-all hover:scale-105 relative bg-zinc-900/60"
                >
                  <Sliders className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
                  <input
                    type="color"
                    value={config.baseColor}
                    onChange={(e) => {
                      onChangeConfig((prev) => ({ ...prev, baseColor: e.target.value }));
                    }}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* SECTION 2: LINE COLOR */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                  COLOR DE LÍNEAS
                </span>
                <span className="text-[11px] font-mono text-zinc-500 uppercase">
                  {config.lineColor}
                </span>
              </div>

              {/* Line Color Swatch Circles */}
              <div className="flex items-center flex-wrap gap-3">
                {LINE_COLORS.map((c) => {
                  const isSelected = config.lineColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        playButtonClick('pop');
                        onChangeConfig((prev) => ({ ...prev, lineColor: c.hex }));
                      }}
                      title={c.label}
                      className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110 shadow-lg'
                          : 'opacity-85 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      aria-label={c.label}
                    />
                  );
                })}

                {/* Custom Line Color Input Trigger */}
                <label
                  title="Color de líneas personalizado"
                  className="w-8 h-8 rounded-full border border-dashed border-zinc-600 hover:border-white flex items-center justify-center cursor-pointer transition-all hover:scale-105 relative bg-zinc-900/60"
                >
                  <Sliders className="w-3 h-3 text-zinc-400 hover:text-white" />
                  <input
                    type="color"
                    value={config.lineColor}
                    onChange={(e) => {
                      onChangeConfig((prev) => ({ ...prev, lineColor: e.target.value }));
                    }}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* SECTION 3: GRIP TEXTURE - 2x2 Grid exactly as in screenshot */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                  TEXTURA DE AGARRE
                </span>
                <span className="text-[11px] font-semibold text-[#ff5722] uppercase">
                  {GRIP_TEXTURES.find((texture) => texture.id === config.textureType)?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {GRIP_TEXTURES.map((tex) => {
                  const isSelected = config.textureType === tex.id;
                  return (
                    <button
                      key={tex.id}
                      onClick={() => {
                        playButtonClick('subtle');
                        onChangeConfig((prev) => ({ ...prev, textureType: tex.id }));
                      }}
                      className={`py-3 px-4 rounded-lg font-headline tracking-[0.14em] text-sm uppercase transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center ${
                        isSelected
                          ? 'bg-white text-black font-black shadow-lg scale-[1.02]'
                          : 'bg-zinc-950/70 border border-zinc-800/90 text-zinc-400 hover:text-white hover:border-zinc-700 font-bold'
                      }`}
                    >
                      <span>{tex.label}</span>
                      <span
                        className={`text-[9px] tracking-normal font-sans font-medium mt-0.5 ${
                          isSelected ? 'text-zinc-700' : 'text-zinc-500'
                        }`}
                      >
                        {tex.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 5: LASER ENGRAVING (Custom laser text stamped in 3D) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-zinc-500" />
                  <span>GRABADO LÁSER (OPCIONAL)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                  Gratis
                </span>
              </div>
              <input
                type="text"
                maxLength={20}
                value={config.laserText || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onChangeConfig((prev) => ({ ...prev, laserText: val }));
                }}
                placeholder="Ej: KOBE #24 o TU NOMBRE"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#ff5722] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none uppercase font-mono tracking-wider transition-colors"
              />
            </div>
          </div>

          {/* Sticky Bottom CTA Button - Fixed Price 360.000 Gs matching reference */}
          <div className="pt-6 mt-6 border-t border-white/[0.08] space-y-2">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Precio fijo personalizado
              </span>
              <span className="text-xl font-black font-mono text-white">
                {formatPYG(FIXED_CUSTOM_PRICE)}
              </span>
            </div>

            <button
              id="custom-add-to-cart-btn"
              disabled={isShooting}
              onClick={() => {
                onAddToCart();
              }}
              className="w-full py-4 px-6 bg-[#ff5722] hover:bg-[#f4511e] active:scale-[0.98] text-white font-headline text-lg sm:text-xl tracking-[0.16em] uppercase rounded-xl transition-all duration-200 cursor-pointer shadow-xl shadow-[#ff5722]/30 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              {/* Subtle light shimmer sweep on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

              <span className="font-black">AÑADIR A LA COLECCIÓN</span>
            </button>

            <p className="text-center text-[11px] text-zinc-500 font-medium">
              Envío exprés gratis a domicilio en todo Paraguay
            </p>
          </div>
        </aside>

        {/* Right side floating helper prompt for 3D inspection */}
        <div className="hidden lg:flex fixed bottom-8 right-12 z-20 items-center gap-3 bg-zinc-950/75 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-auto select-none shadow-xl">
          <div className="w-2 h-2 rounded-full bg-[#ff5722] animate-pulse" />
          <span className="text-xs text-zinc-300 font-medium">
            Haz clic y arrastra sobre el balón para rotar 360° en 3D
          </span>
          <button
            onClick={onResetRotation}
            className="text-[11px] text-[#ff5722] hover:underline font-bold uppercase tracking-wider ml-1 cursor-pointer"
          >
            Centrar
          </button>
        </div>
      </div>
    </div>
  );
}
