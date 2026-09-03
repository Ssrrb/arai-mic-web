import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  MoveRight,
  Zap,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  Menu,
  Sparkles,
  Play,
  User,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Mail,
  Send,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { BallEdition } from './Basketball';
import { EDITIONS_LIST } from '../data/editions';
import { CartItem } from '../types';
import { WhatsAppCheckoutModal } from './WhatsAppCheckoutModal';
import { CartDrawer } from './CartDrawer';
import {
  playButtonClick,
  playEditionSound,
  playModalOpenSound,
  playModalCloseSound,
  playAddToCartLaunchSound,
  isSoundMuted,
  toggleSound,
  initGlobalButtonSoundListener,
} from '../utils/audio';

gsap.registerPlugin(ScrollTrigger);

interface OverlayProps {
  edition: BallEdition;
  onSelectEdition: (ed: BallEdition) => void;
  onOpenCustomizer: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function Overlay({
  edition,
  onSelectEdition,
  onOpenCustomizer,
  cart,
  setCart,
  isCartOpen,
  setIsCartOpen,
  isMuted,
  onToggleMute,
}: OverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isPromoVideoOpen, setIsPromoVideoOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Monitor active scroll section for intelligent, dynamic header navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 260;
      const ingEl = document.getElementById('ingenieria');

      if (ingEl && scrollPos >= ingEl.offsetTop) {
        setActiveSection('ingenieria');
      } else {
        setActiveSection(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Video modal state
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // Contact modal state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const [lang, setLang] = useState<'es'>('es');

  // WhatsApp Checkout Modal state
  const [isWhatsAppCheckoutOpen, setIsWhatsAppCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  const currentEditionData = EDITIONS_LIST.find((e) => e.id === edition) || EDITIONS_LIST[0];

  const formatPYG = (amount: number): string => {
    return `₲ ${Math.round(amount).toLocaleString('es-PY')}`;
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const [isShooting, setIsShooting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Listen for 3D ball landed event to celebrate swish with net snap and sound
  useEffect(() => {
    const handleBallLanded = (e: Event) => {
      const customEvent = e as CustomEvent<{ edition: BallEdition }>;
      const landedEdition = customEvent.detail?.edition || edition;
      const itemData = EDITIONS_LIST.find((item) => item.id === landedEdition) || EDITIONS_LIST[0];

      showToast(`🏀 ¡SWISH! ${itemData.bgText} encestado en el carrito`);

      // Punch cart count badge with GSAP
      const badge = document.getElementById('cart-count-badge');
      if (badge) {
        gsap.killTweensOf(badge);
        gsap.fromTo(
          badge,
          { scale: 2.2, backgroundColor: '#ffffff', color: '#000000' },
          {
            scale: 1.0,
            backgroundColor: itemData.color,
            color: '#09090b',
            duration: 0.5,
            ease: 'back.out(3.5)',
          }
        );
      }
    };

    window.addEventListener('tuku:ball-landed', handleBallLanded);
    return () => {
      window.removeEventListener('tuku:ball-landed', handleBallLanded);
    };
  }, [edition]);

  const addToCart = (edId: BallEdition) => {
    // Play energetic jump-shot release sound
    playAddToCartLaunchSound();

    const itemData = EDITIONS_LIST.find((item) => item.id === edId) || EDITIONS_LIST[0];
    const itemId = edId;

    // Immediately add item to cart state for instant responsiveness
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === itemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: itemId,
          edition: edId,
          name: `${itemData.bgText} ${itemData.name}`,
          price: itemData.price,
          quantity: 1,
          color: itemData.color,
        },
      ];
    });

    showToast(`🏀 ${itemData.bgText} añadido al carrito (${formatPYG(itemData.price)})`);

    // 1. GSAP button tactile press & spring bounce
    const activeBtn = document.activeElement as HTMLElement | null;
    if (activeBtn && activeBtn.tagName === 'BUTTON') {
      gsap.killTweensOf(activeBtn);
      gsap.timeline()
        .to(activeBtn, { scale: 0.92, duration: 0.08, ease: 'power2.in' })
        .to(activeBtn, { scale: 1.05, duration: 0.16, ease: 'back.out(2.2)' })
        .to(activeBtn, { scale: 1.0, duration: 0.12 });
    }

    // 2. Set shooting state for interactive visual feedback on the button
    setIsShooting(true);
    setTimeout(() => setIsShooting(false), 900);

    // 3. Dispatch GSAP 3D ball throw into the cart
    window.dispatchEvent(
      new CustomEvent('tuku:throw-ball', {
        detail: { edition: edId },
      })
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );

    setCheckoutItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    setCheckoutItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenBuyFlow = (targetEdition?: BallEdition) => {
    const targetId = targetEdition || edition;
    const itemData = EDITIONS_LIST.find((e) => e.id === targetId) || EDITIONS_LIST[0];

    // If cart has no items, start buy flow with this ball
    if (cart.length === 0) {
      const singleItem: CartItem = {
        id: targetId,
        edition: targetId,
        name: `${itemData.bgText} ${itemData.name}`,
        price: itemData.price,
        quantity: 1,
        color: itemData.color,
      };
      setCheckoutItems([singleItem]);
      // Also add to cart for seamlessness
      setCart([singleItem]);
    } else {
      // If ball not in cart, add it
      const exists = cart.find((i) => i.id === targetId);
      if (!exists) {
        const newItem: CartItem = {
          id: targetId,
          edition: targetId,
          name: `${itemData.bgText} ${itemData.name}`,
          price: itemData.price,
          quantity: 1,
          color: itemData.color,
        };
        const updated = [...cart, newItem];
        setCart(updated);
        setCheckoutItems(updated);
      } else {
        setCheckoutItems([...cart]);
      }
    }

    playModalOpenSound();
    setIsCartOpen(false);
    setIsWhatsAppCheckoutOpen(true);
  };

  const handleCheckoutFromCart = () => {
    if (cart.length === 0) return;
    setCheckoutItems([...cart]);
    setIsCartOpen(false);
    playModalOpenSound();
    setIsWhatsAppCheckoutOpen(true);
  };

  const handlePrevEdition = () => {
    const currentIndex = EDITIONS_LIST.findIndex((e) => e.id === edition);
    const prevIndex = (currentIndex - 1 + EDITIONS_LIST.length) % EDITIONS_LIST.length;
    const targetEdition = EDITIONS_LIST[prevIndex].id;
    playEditionSound(targetEdition);
    onSelectEdition(targetEdition);
  };

  const handleNextEdition = () => {
    const currentIndex = EDITIONS_LIST.findIndex((e) => e.id === edition);
    const nextIndex = (currentIndex + 1) % EDITIONS_LIST.length;
    const targetEdition = EDITIONS_LIST[nextIndex].id;
    playEditionSound(targetEdition);
    onSelectEdition(targetEdition);
  };

  // Mount global tactile button audio listener
  useEffect(() => {
    const cleanup = initGlobalButtonSoundListener();
    return cleanup;
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.section-animate');
      sections.forEach((section: any) => {
        gsap.fromTo(
          section,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative z-20 w-full no-scrollbar">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 bg-zinc-900/95 border border-[#ff5722]/60 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200 backdrop-blur-md">
          <Check className="w-4 h-4 text-[#ff5722]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header - Expert UI/Front-End Implementation */}
      <header className="fixed top-0 left-0 w-full px-5 sm:px-10 lg:px-14 py-3.5 sm:py-4 flex justify-between items-center z-40 backdrop-blur-xl bg-zinc-950/75 border-b border-white/[0.08] text-white transition-all duration-300">
        {/* Brand Logo with TUKU icon */}
        <button
          id="brand-logo-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3.5 group cursor-pointer text-left focus:outline-none"
          aria-label="Ir al inicio de TUKU"
        >
          {/* Refined Basketball Emblem */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/30 group-hover:border-white/80 flex items-center justify-center relative overflow-hidden transition-all duration-300 bg-white/[0.04] group-hover:bg-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.06)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] group-hover:scale-105">
            {/* Center horizontal seam */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[1.5px] bg-white/60 group-hover:bg-white transition-colors" />
            </div>
            {/* Center vertical seam */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-[1.5px] bg-white/60 group-hover:bg-white transition-colors" />
            </div>
            {/* Curved channel ellipse */}
            <div className="absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 group-hover:border-white/50 transition-colors" />
          </div>

          {/* Prominent, authoritative TUKU wordmark */}
          <div className="flex flex-col">
            <span className="font-headline text-2xl sm:text-3xl lg:text-[32px] tracking-[0.22em] font-black uppercase text-white leading-none group-hover:text-white transition-colors drop-shadow-sm">
              TUKU
            </span> 
          </div>
        </button>

        {/* Center Navigation - Normal neutral styling by default */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-11 text-xs font-semibold tracking-wider">
          <a
            href="#ingenieria"
            className={`uppercase tracking-[0.16em] transition-all duration-200 py-1.5 relative group ${
              activeSection === 'ingenieria'
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-white font-medium'
            }`}
          >
            <span>Ingeniería</span>
            {activeSection === 'ingenieria' ? (
              <span
                className="absolute bottom-0 left-0 w-full h-[2px] rounded-full transition-colors duration-300"
                style={{ backgroundColor: currentEditionData.color }}
              />
            ) : (
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white/70 transition-all duration-200 group-hover:w-full" />
            )}
          </a>
          <button
            id="nav-customize-btn"
            onClick={() => {
              playButtonClick('nav');
              onOpenCustomizer();
            }}
            className="uppercase tracking-[0.16em] text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer py-1.5 relative group"
          >
            <span>Personalizar</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white/70 transition-all duration-200 group-hover:w-full" />
          </button>
          <button
            id="nav-contacts-btn"
            onClick={() => {
              playModalOpenSound();
              setIsContactOpen(true);
            }}
            className="uppercase tracking-[0.16em] text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer py-1.5 relative group"
          >
            <span>Contacto</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white/70 transition-all duration-200 group-hover:w-full" />
          </button>
        </nav>

        {/* Right Actions: Audio Toggle, User Profile & Cart */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            id="user-profile-btn"
            onClick={() => {
              playModalOpenSound();
              setIsUserModalOpen(true);
            }}
            className="w-10 h-10 rounded-full border border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95"
            aria-label="Perfil de usuario"
          >
            <User className="w-4 h-4" />
          </button>

          <button
            id="open-cart-btn"
            onClick={() => {
              playModalOpenSound();
              setIsCartOpen(true);
            }}
            className="w-10 h-10 rounded-full border border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95 relative group"
            aria-label="Carrito de compras"
          >
            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {totalCartItems > 0 && (
              <span
                id="cart-count-badge"
                style={{ backgroundColor: currentEditionData.color }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-zinc-950 text-[10px] font-black flex items-center justify-center animate-scale transition-colors duration-300 shadow-md font-mono"
              >
                {totalCartItems}
              </span>
            )}
          </button>

          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full border border-white/10 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-all flex md:hidden items-center justify-center cursor-pointer active:scale-95"
            aria-label="Menú"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-[68px] sm:top-[74px] left-0 w-full bg-zinc-950/95 border-b border-white/10 p-6 flex flex-col gap-3.5 z-30 md:hidden backdrop-blur-2xl shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <a
            href="#ingenieria"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-xs uppercase tracking-widest py-2.5 transition-colors border-b border-white/5 ${
              activeSection === 'ingenieria'
                ? 'text-white font-bold'
                : 'text-zinc-300 hover:text-white font-medium'
            }`}
          >
            Ingeniería
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCustomizer();
            }}
            className="text-left text-xs uppercase tracking-widest text-zinc-300 hover:text-white py-2.5 cursor-pointer font-medium border-b border-white/5"
          >
            Personalizar (360.000 Gs)
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsContactOpen(true);
            }}
            className="text-left text-xs uppercase tracking-widest text-zinc-300 hover:text-white py-2.5 cursor-pointer font-medium"
          >
            Contacto
          </button>
        </div>
      )}

      {/* Hero Section - Matching the Reference Design with Adaptive Responsiveness */}
      <section className="min-h-[100dvh] w-full relative flex flex-col justify-between px-4 sm:px-8 md:px-12 pt-24 sm:pt-28 pb-6 sm:pb-8">
        {/* Top-Left: Promotion Video Button */}
        <div className="w-full flex justify-between items-start">
          <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3">
            <button
              id="open-promo-video-btn"
              onClick={() => {
                playModalOpenSound();
                setIsPromoVideoOpen(true);
              }}
              aria-label="Reproducir video promocional"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-zinc-700/80 bg-zinc-900/70 hover:bg-zinc-800/90 text-white flex items-center justify-center transition-all cursor-pointer group shadow-lg active:scale-95"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white ml-0.5 group-hover:scale-110 transition-transform" />
            </button>
            <div className="text-left text-[11px] sm:text-xs font-medium text-zinc-300 leading-tight">
              Video<br />promocional
            </div>
          </div>
        </div>

        {/* Mobile Vertically Stacked Navigation Arrows adjacent to the centered typography */}
        <div className="md:hidden pointer-events-auto absolute right-4 top-[48%] -translate-y-1/2 flex flex-col gap-2.5 z-30">
          <button
            id="mobile-prev-edition-btn"
            onClick={handlePrevEdition}
            aria-label="Balón anterior"
            className="w-11 h-11 rounded-full border border-zinc-700/80 bg-zinc-950/90 hover:bg-zinc-800 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            id="mobile-next-edition-btn"
            onClick={handleNextEdition}
            aria-label="Balón siguiente"
            className="w-11 h-11 rounded-full border border-zinc-700/80 bg-zinc-950/90 hover:bg-zinc-800 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Center Space: The 3D basketball floats here */}
        <div className="flex-1 min-h-[140px] pointer-events-none" />

        {/* Bottom Bar: Responsive across mobile, tablet, and desktop */}
        <div className="w-full pointer-events-auto">
          {/* Desktop & Tablet Layout (md and up) */}
          <div className="hidden md:grid grid-cols-3 items-end w-full">
            {/* Bottom Left: Price & Size */}
            <div className="flex flex-col items-start justify-end">
              <div
                id="hero-price-display"
                className="text-4xl lg:text-5xl font-mono font-normal tracking-tight leading-none transition-colors duration-300"
                style={{ color: currentEditionData.color }}
              >
                {formatPYG(currentEditionData.price)}
              </div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mt-2">
                TALLA: <span className="text-white">29.5"</span> • OFICIAL
              </div>
              <div className="text-xs text-zinc-500 font-semibold mt-3 tracking-wider uppercase flex items-center gap-1.5">
              </div>
            </div>

            {/* Bottom Center: AÑADIR AL CARRITO Button */}
            <div className="flex items-center justify-center pb-1">
              <button
                id="hero-add-to-cart-btn"
                onClick={() => addToCart(edition)}
                disabled={isShooting}
                style={{
                  backgroundColor: currentEditionData.color,
                  boxShadow: `0 18px 36px -8px ${currentEditionData.glow || `${currentEditionData.color}50`}`,
                }}
                className="px-10 lg:px-14 py-3.5 lg:py-4 active:scale-95 text-black font-black text-xs lg:text-sm tracking-widest uppercase rounded-md transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 hover:brightness-110"
              >
                {isShooting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-black" />
                    <span>¡LANZANDO AL ARO! 🏀</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-black" />
                    <span>AÑADIR AL CARRITO</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom Right: Prev / Next Navigation Arrows & Quick Edition Switcher */}
            <div className="flex items-center justify-end gap-3 pb-1">
              <div className="flex items-center gap-1.5 mr-2">
                {EDITIONS_LIST.map((item) => {
                  const isActive = item.id === edition;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        playEditionSound(item.id);
                        onSelectEdition(item.id);
                      }}
                      aria-label={`Seleccionar edición ${item.name}`}
                      className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        borderColor: isActive ? item.color : 'rgba(255,255,255,0.12)',
                        backgroundColor: isActive ? `${item.color}25` : 'rgba(10,10,12,0.6)',
                        color: isActive ? '#ffffff' : '#a1a1aa',
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="hidden xl:inline">{item.name}</span>
                    </button>
                  );
                })}
              </div>
              <button
                id="prev-edition-btn"
                onClick={handlePrevEdition}
                aria-label="Balón anterior"
                className="w-12 h-12 rounded-full border border-zinc-700/80 bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                id="next-edition-btn"
                onClick={handleNextEdition}
                aria-label="Balón siguiente"
                className="w-12 h-12 rounded-full border border-zinc-700/80 bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Screen Layout (< md) */}
          <div className="md:hidden flex flex-col items-center text-center gap-5 w-full pb-2">
            {/* Quick edition switch chips for mobile */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {EDITIONS_LIST.map((item) => {
                const isActive = item.id === edition;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playEditionSound(item.id);
                      onSelectEdition(item.id);
                    }}
                    aria-label={`Seleccionar edición ${item.name}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      borderColor: isActive ? item.color : 'rgba(255,255,255,0.12)',
                      backgroundColor: isActive ? `${item.color}25` : 'rgba(10,10,12,0.6)',
                      color: isActive ? '#ffffff' : '#71717a',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Centered Price and Size */}
            <div className="flex flex-col items-center">
              <div
                id="mobile-hero-price-display"
                className="text-4xl sm:text-5xl font-mono font-normal tracking-tight leading-none transition-colors duration-300"
                style={{ color: currentEditionData.color }}
              >
                {formatPYG(currentEditionData.price)}
              </div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mt-2">
                TALLA: <span className="text-white">29.5"</span> • OFICIAL
              </div>
            </div>

            {/* Single AÑADIR AL CARRITO button */}
            <div className="w-full">
              <button
                id="mobile-hero-add-to-cart-btn"
                onClick={() => addToCart(edition)}
                disabled={isShooting}
                style={{
                  backgroundColor: currentEditionData.color,
                  boxShadow: `0 14px 28px -6px ${currentEditionData.glow || `${currentEditionData.color}40`}`,
                }}
                className="w-full py-3.5 sm:py-4 active:scale-[0.98] text-black font-black text-xs tracking-widest uppercase rounded-lg transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-2 hover:brightness-110 shadow-lg"
              >
                {isShooting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-black" />
                    <span>¡LANZANDO! 🏀</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-black" />
                    <span>AÑADIR AL CARRITO</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll hint indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-zinc-600 pointer-events-none opacity-40">
          <MoveRight className="w-3 h-3 rotate-90" />
        </div>
      </section>

      {/* Right Vertical Rail Indicator (as seen in the reference screenshot) */}
      <div className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-3 pointer-events-none z-20">
        <div className="w-[1px] h-14 bg-zinc-800 relative">
          <div
            className="w-[2px] h-5 absolute top-1 -left-[0.5px] transition-colors duration-300"
            style={{ backgroundColor: currentEditionData.color }}
          />
        </div>
        <span
          className="text-[10px] font-bold tracking-widest [writing-mode:vertical-lr] rotate-180 transition-colors duration-300"
          style={{ color: currentEditionData.color }}
        >
          90/10
        </span>
      </div>

      {/* Section 1: INGENIERÍA */}
      <section id="ingenieria" className="min-h-screen w-full flex items-center justify-start px-6 md:px-24 py-20">
        <div className="section-animate max-w-md bg-zinc-950/80 p-6 sm:p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#ff5722] bg-[#ff5722]/10 mb-3">
            <Zap className="w-3 h-3" /> Superficie
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-bold mb-3 text-white uppercase leading-none">
            Ingeniería
          </h2>
          <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
            Microtextura de grano profundo con canales de 0.8 mm para un agarre consistente bajo cualquier condición de juego.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
              <span className="block text-2xl font-black font-display text-white">{currentEditionData.specChannel}</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Canales</span>
            </div>
            <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
              <span className="block text-2xl font-black font-display text-emerald-400">100%</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Hermético</span>
            </div>
          </div>

          <button
            id="tech-modal-btn"
            onClick={() => {
              playModalOpenSound();
              setIsTechModalOpen(true);
            }}
            className="flex items-center gap-2 text-[#ff5722] font-bold text-xs uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
          >
            Ver Especificaciones <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Section 2: RENDIMIENTO */}
      <section id="rendimiento" className="min-h-screen w-full flex items-center justify-end px-6 md:px-24 py-20">
        <div className="section-animate max-w-md text-right bg-zinc-950/80 p-6 sm:p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#f59e0b] bg-[#f59e0b]/10 mb-3 justify-end">
            <Sparkles className="w-3 h-3" /> Core™ Reactor
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-bold mb-3 text-white uppercase leading-none">
            Respuesta
          </h2>
          <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
            Núcleo reactivo que maximiza el retorno elástico y mantiene la esfericidad tras miles de impactos intensos.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
              <span className="block text-2xl font-black font-display text-[#ff5722]">{currentEditionData.bounceRate}</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Retorno</span>
            </div>
            <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
              <span className="block text-2xl font-black font-display text-white">99.4%</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Esfericidad</span>
            </div>
          </div>

          <button
            id="add-cart-perf-btn"
            onClick={() => {
              handleOpenBuyFlow(edition);
            }}
            className="flex items-center gap-2 text-[#ff5722] font-bold text-xs uppercase tracking-wider hover:text-white transition-colors cursor-pointer justify-end w-full"
          >
            Comprar {currentEditionData.name} por WhatsApp <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Section 4: Final Minimal CTA */}
      <section className="min-h-[60vh] w-full flex flex-col items-center justify-center px-6 text-center py-20 relative">
        <div className="section-animate max-w-xl">
          <h2 className="font-display text-6xl sm:text-8xl font-black mb-4 text-white uppercase tracking-tighter">
            DOMINA LA DUELA
          </h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
            Balón oficial reglamentario 29.5" con despacho express directo a tu puerta y atención por WhatsApp.
          </p>

          <button
            id="cta-add-to-cart-btn"
            onClick={() => {
              handleOpenBuyFlow(edition);
            }}
            className="px-8 py-3.5 bg-[#ff5000] text-white rounded-[2px] text-sm font-black uppercase tracking-widest hover:bg-white hover:text-zinc-950 active:scale-95 transition-all shadow-2xl shadow-[#ff5000]/30 cursor-pointer inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Comprar {currentEditionData.bgText} • {formatPYG(currentEditionData.price)}</span>
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-900 px-6 py-8 text-center text-xs text-zinc-500">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="font-black tracking-widest uppercase text-white">
            TUKU
          </span>
          <span className="text-zinc-700">•</span>
          <span>Equipamiento Oficial de Baloncesto 29.5"</span>
        </div>
        <p>© {new Date().getFullYear()} TUKU. Todos los derechos reservados.</p>
      </footer>

      {/* MODAL: Promotion Video Modal */}
      {isPromoVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl">
            <button
              id="close-promo-video-btn"
              onClick={() => {
                playModalCloseSound();
                setIsPromoVideoOpen(false);
              }}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5722] animate-pulse" />
              <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                TUKU — Muestra Oficial en Video
              </h3>
            </div>

            {/* Video Player Mockup / Dynamic Canvas */}
            <div className="relative w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span className="font-bold text-white uppercase tracking-wider">
                    Modelo: {currentEditionData.bgText} 29.5" Oficial
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-400 font-mono text-[10px] font-bold uppercase">
                    HD 4K 60FPS
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center text-center my-auto">
                  <div className="w-16 h-16 rounded-full bg-[#ff5722] flex items-center justify-center text-white mb-3 shadow-lg shadow-[#ff5722]/30">
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </div>
                  <p className="text-white text-base font-bold uppercase tracking-wider mb-1">
                    Precisión en Movimiento
                  </p>
                  <p className="text-zinc-400 text-xs max-w-xs">
                    Test de impacto balístico, calibración de canales 0.8mm y rebote elástico sobre duela profesional.
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span className="font-mono">01:24 / 02:45</span>
                  <button
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isVideoMuted ? 'Silenciado' : 'Audio Activo'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
              <span>Tamaño Reglamentario Oficial: 29.5 pulgadas (75 cm)</span>
              <button
                onClick={() => {
                  setIsPromoVideoOpen(false);
                  addToCart(edition);
                }}
                className="px-4 py-2 bg-[#ff5722] hover:bg-white text-zinc-950 font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Comprar Este Modelo
              </button>
            </div>
          </div>
        </div>
      )}



      {/* MODAL: Contacts Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              id="close-contact-modal-btn"
              onClick={() => {
                playModalCloseSound();
                setIsContactOpen(false);
                setContactSent(false);
              }}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-[#ff5722]" />
              <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                Contacto & Soporte
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mb-5">
              Ponte en contacto con nuestro equipo de ingeniería deportiva:
            </p>

            {contactSent ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-display text-2xl font-black uppercase text-white mb-1">
                  ¡Mensaje Enviado!
                </h4>
                <p className="text-xs text-zinc-400 mb-4">
                  Te responderemos a <strong>{contactEmail}</strong> en menos de 24 horas.
                </p>
                <button
                  onClick={() => setIsContactOpen(false)}
                  className="px-6 py-2 bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!contactName || !contactEmail) return;
                  playButtonClick('success');
                  setContactSent(true);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ff5722]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">
                    Correo
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ff5722]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">
                    Mensaje o Consulta
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Escribe tu consulta..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ff5722]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#ff5722] hover:bg-white text-zinc-950 font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 pt-2"
                >
                  <Send className="w-4 h-4" /> Enviar Mensaje
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: User Profile Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 relative shadow-2xl">
            <button
              id="close-user-modal-btn"
              onClick={() => {
                playModalCloseSound();
                setIsUserModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#ff5722]/20 border border-[#ff5722]/40 text-[#ff5722] flex items-center justify-center font-black text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black uppercase text-white leading-tight">
                  Miembro TUKU
                </h3>
                <span className="text-[11px] text-[#ff5722] font-semibold uppercase tracking-wider">
                  Nivel Baloncestista Pro
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs mb-6">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Puntos Recompensa</span>
                <span className="text-white font-mono font-bold">1,250 PTS</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Garantía Activa</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 2 Años Oficial
                </span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Envíos Gratuitos</span>
                <span className="text-white font-bold">Ilimitados</span>
              </div>
            </div>

            <button
              onClick={() => setIsUserModalOpen(false)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Especificaciones Técnicas */}
      {isTechModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              id="close-tech-modal-btn"
              onClick={() => {
                playModalCloseSound();
                setIsTechModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display text-3xl font-black uppercase text-white mb-4">
              Especificaciones Técnicas
            </h3>

            <div className="space-y-3 text-xs mb-6">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-semibold uppercase">Material Exterior</span>
                <span className="text-white font-bold">Poliuretano Micro-Pebbled Compuesto</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-semibold uppercase">Estructura</span>
                <span className="text-white font-bold">2.400m Bobinado Nylon Pro</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-semibold uppercase">Cámara</span>
                <span className="text-white font-bold">Butilo Hermético de Retención</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-semibold uppercase">Presión Nominal</span>
                <span className="text-white font-bold">7.5 - 8.5 PSI Oficial NBA</span>
              </div>
            </div>

            <button
              id="tech-modal-close-action"
              onClick={() => {
                playModalCloseSound();
                setIsTechModalOpen(false);
              }}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* DRAWER: Shopping Cart */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveFromCart={removeFromCart}
        onCheckout={handleCheckoutFromCart}
        onAddCurrentEdition={() => addToCart(edition)}
        onSelectEdition={onSelectEdition}
        onOpenCustomizer={onOpenCustomizer}
        currentEdition={edition}
      />

      {/* WHATSAPP CHECKOUT MODAL */}
      <WhatsAppCheckoutModal
        isOpen={isWhatsAppCheckoutOpen}
        onClose={() => setIsWhatsAppCheckoutOpen(false)}
        items={checkoutItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={() => {
          setCart([]);
          setCheckoutItems([]);
        }}
        accentColor={currentEditionData.color}
      />
    </div>
  );
}
