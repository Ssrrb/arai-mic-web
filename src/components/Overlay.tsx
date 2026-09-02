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
  Rotate3d,
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

gsap.registerPlugin(ScrollTrigger);

interface OverlayProps {
  edition: BallEdition;
  onSelectEdition: (ed: BallEdition) => void;
}

export function Overlay({ edition, onSelectEdition }: OverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isPromoVideoOpen, setIsPromoVideoOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Customize modal state
  const [customTexture, setCustomTexture] = useState('Pebbled Pro');
  const [customChannel, setCustomChannel] = useState('Negro Profundo');
  const [customText, setCustomText] = useState('');

  // Video modal state
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // Contact modal state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lang, setLang] = useState<'ru' | 'en' | 'es'>('ru');

  // Checkout flow state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');

  const currentEditionData = EDITIONS_LIST.find((e) => e.id === edition) || EDITIONS_LIST[0];

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const addToCart = (edId: BallEdition) => {
    const itemData = EDITIONS_LIST.find((e) => e.id === edId) || EDITIONS_LIST[0];
    const itemId = edId;

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

    showToast(`Añadido al carrito: ${itemData.bgText} ${itemData.name} ($${itemData.price.toFixed(2)})`);
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
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail) return;
    setOrderCompleted(true);
  };

  const handlePrevEdition = () => {
    const currentIndex = EDITIONS_LIST.findIndex((e) => e.id === edition);
    const prevIndex = (currentIndex - 1 + EDITIONS_LIST.length) % EDITIONS_LIST.length;
    onSelectEdition(EDITIONS_LIST[prevIndex].id);
  };

  const handleNextEdition = () => {
    const currentIndex = EDITIONS_LIST.findIndex((e) => e.id === edition);
    const nextIndex = (currentIndex + 1) % EDITIONS_LIST.length;
    onSelectEdition(EDITIONS_LIST[nextIndex].id);
  };

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

      {/* Header - Matching reference design */}
      <header className="fixed top-0 left-0 w-full px-6 sm:px-12 py-5 flex justify-between items-center z-40 backdrop-blur-md bg-[#08080a]/40 border-b border-white/5 text-white">
        {/* Brand Logo with SLAM DUNK icon */}
        <button
          id="brand-logo-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full border-[2px] border-white flex items-center justify-center relative overflow-hidden group-hover:border-[#00c2ff] transition-colors">
            {/* Center horizontal minus line icon */}
            <div className="w-4 h-[2px] bg-white group-hover:bg-[#00c2ff] transition-colors rounded-full" />
          </div>
          <div className="text-left font-black uppercase text-xs leading-none tracking-wider text-white group-hover:text-[#00c2ff] transition-colors font-headline">
            <div>SLAM</div>
            <div>DUNK</div>
          </div>
        </button>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-wider">
          <a
            href="#ediciones"
            className="text-[#ff5500] hover:text-[#ff7043] transition-colors font-bold"
          >
            Products
          </a>
          <button
            id="nav-customize-btn"
            onClick={() => setIsCustomizeOpen(true)}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Customize
          </button>
          <button
            id="nav-contacts-btn"
            onClick={() => setIsContactOpen(true)}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Contacts
          </button>
        </nav>

        {/* Right Actions: User Profile & Cart */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            id="user-profile-btn"
            onClick={() => setIsUserModalOpen(true)}
            className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Perfil de usuario"
          >
            <User className="w-5 h-5" />
          </button>

          <button
            id="open-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer relative"
            aria-label="Carrito de compras"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartItems > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#00c2ff] text-zinc-950 text-[10px] font-black flex items-center justify-center animate-scale">
                {totalCartItems}
              </span>
            )}
          </button>

          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white cursor-pointer"
            aria-label="Menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 w-full bg-zinc-950/95 border-b border-zinc-800 p-6 flex flex-col gap-4 z-30 md:hidden backdrop-blur-xl">
          <a
            href="#ediciones"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs uppercase tracking-widest text-[#ff5500] font-bold py-2"
          >
            Products
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsCustomizeOpen(true);
            }}
            className="text-left text-xs uppercase tracking-widest text-zinc-300 hover:text-[#00c2ff] py-2 cursor-pointer"
          >
            Customize
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsContactOpen(true);
            }}
            className="text-left text-xs uppercase tracking-widest text-zinc-300 hover:text-[#00c2ff] py-2 cursor-pointer"
          >
            Contacts
          </button>
        </div>
      )}

      {/* Hero Section - Matching the Reference Design with Adaptive Responsiveness */}
      <section className="min-h-[100dvh] w-full relative flex flex-col justify-between px-4 sm:px-8 md:px-12 pt-24 sm:pt-28 pb-6 sm:pb-8 pointer-events-none">
        {/* Top-Left: Promotion Video Button */}
        <div className="w-full flex justify-between items-start">
          <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3">
            <button
              id="open-promo-video-btn"
              onClick={() => setIsPromoVideoOpen(true)}
              aria-label="Reproducir video promocional"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-zinc-700/80 bg-zinc-900/70 hover:bg-zinc-800/90 text-white flex items-center justify-center transition-all cursor-pointer group shadow-lg active:scale-95"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white ml-0.5 group-hover:scale-110 transition-transform" />
            </button>
            <div className="text-left text-[11px] sm:text-xs font-medium text-zinc-300 leading-tight">
              Promotion<br />video
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
              <div className="text-4xl lg:text-5xl font-mono font-normal text-[#00c2ff] tracking-tight leading-none">
                ${currentEditionData.price.toFixed(2)}
              </div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mt-2">
                SIZE: <span className="text-white">29.5"</span> • OFFICIAL
              </div>
              <button
                onClick={() => setLang((l) => (l === 'ru' ? 'en' : l === 'en' ? 'es' : 'ru'))}
                className="text-xs text-zinc-500 hover:text-white font-semibold mt-3 tracking-wider uppercase transition-colors cursor-pointer"
              >
                {lang === 'ru' ? 'Ru' : lang === 'en' ? 'En' : 'Es'}
              </button>
            </div>

            {/* Bottom Center: ADD TO CART Button */}
            <div className="flex flex-col items-center justify-end pb-1">
              <button
                id="hero-add-to-cart-btn"
                onClick={() => addToCart(edition)}
                className="px-12 lg:px-16 py-3.5 lg:py-4 bg-[#00c2ff] hover:bg-[#38bdf8] active:scale-95 text-black font-black text-xs lg:text-sm tracking-widest uppercase rounded-md shadow-2xl shadow-[#00c2ff]/40 transition-all cursor-pointer whitespace-nowrap"
              >
                ADD TO CART
              </button>
            </div>

            {/* Bottom Right: Prev / Next Navigation Arrows */}
            <div className="flex items-center justify-end gap-3 pb-1">
              <button
                id="prev-edition-btn"
                onClick={handlePrevEdition}
                aria-label="Balón anterior"
                className="w-12 h-12 rounded-lg border border-zinc-700/80 bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
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
          <div className="md:hidden flex flex-col items-center text-center gap-6 w-full pb-2">
            {/* Centered Price and Size */}
            <div className="flex flex-col items-center">
              <div className="text-4xl sm:text-5xl font-mono font-normal text-[#00c2ff] tracking-tight leading-none">
                ${currentEditionData.price.toFixed(2)}
              </div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mt-2">
                SIZE: <span className="text-white">29.5"</span> • OFFICIAL
              </div>
            </div>

            {/* ADD TO CART full width button for optimal thumb ergonomics */}
            <button
              id="mobile-hero-add-to-cart-btn"
              onClick={() => addToCart(edition)}
              className="w-full py-4 bg-[#00c2ff] hover:bg-[#38bdf8] active:scale-[0.98] text-black font-black text-xs tracking-widest uppercase rounded-lg shadow-xl shadow-[#00c2ff]/35 transition-all cursor-pointer text-center"
            >
              ADD TO CART
            </button>
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
          <div className="w-[2px] h-5 bg-[#00c2ff] absolute top-1 -left-[0.5px]" />
        </div>
        <span className="text-[10px] font-bold text-[#00c2ff] tracking-widest [writing-mode:vertical-lr] rotate-180">
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
            onClick={() => setIsTechModalOpen(true)}
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
              addToCart(edition);
              setIsCartOpen(true);
            }}
            className="flex items-center gap-2 text-[#ff5722] font-bold text-xs uppercase tracking-wider hover:text-white transition-colors cursor-pointer justify-end w-full"
          >
            Comprar Ahora <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Section 3: EDICIONES / COLECCIÓN */}
      <section id="ediciones" className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-20">
        <div className="section-animate max-w-3xl w-full text-center mb-10">
          <h2 className="font-display text-5xl sm:text-7xl font-black text-white uppercase tracking-tight">
            Colección Pro
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Selecciona para previsualizar en 3D o añade directamente a tu carrito:
          </p>
        </div>

        <div className="section-animate grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full">
          {EDITIONS_LIST.map((item) => {
            const isSelected = edition === item.id;
            return (
              <div
                key={item.id}
                id={`card-${item.id}`}
                onClick={() => onSelectEdition(item.id)}
                className={`p-5 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden backdrop-blur-lg cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900/90 border-[#ff5722] ring-1 ring-[#ff5722]/50 shadow-xl shadow-[#ff5722]/10'
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {item.subtitle}
                  </span>
                  <span className="text-sm font-black text-white font-mono">
                    ${item.price.toFixed(2)} USD
                  </span>
                </div>

                <h3 className="text-2xl font-bold font-display uppercase tracking-wide text-white mb-1">
                  {item.bgText} {item.name}
                </h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  {item.desc}
                </p>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                  <button
                    id={`view-3d-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEdition(item.id);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Rotate3d className="w-3.5 h-3.5 text-[#ff5722]" /> 3D
                  </button>

                  <button
                    id={`add-btn-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item.id);
                    }}
                    className="flex-1 py-1.5 bg-[#ff5722] hover:bg-white text-zinc-950 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Carrito
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Final Minimal CTA */}
      <section className="min-h-[60vh] w-full flex flex-col items-center justify-center px-6 text-center py-20 relative">
        <div className="section-animate max-w-xl">
          <h2 className="font-display text-6xl sm:text-8xl font-black mb-4 text-white uppercase tracking-tighter">
            DOMINA LA DUELA
          </h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
            Balón oficial reglamentario 29.5" con despacho express directo a tu puerta.
          </p>

          <button
            id="cta-add-to-cart-btn"
            onClick={() => {
              addToCart(edition);
              setIsCartOpen(true);
            }}
            className="px-8 py-3.5 bg-[#ff5000] text-white rounded-[2px] text-sm font-black uppercase tracking-widest hover:bg-white hover:text-zinc-950 active:scale-95 transition-all shadow-2xl shadow-[#ff5000]/30 cursor-pointer inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Comprar {currentEditionData.bgText} • ${currentEditionData.price.toFixed(2)} USD</span>
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-900 px-6 py-8 text-center text-xs text-zinc-500">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="font-black tracking-widest uppercase text-white">
            SLAM DUNK
          </span>
          <span className="text-zinc-700">•</span>
          <span>Official 29.5" Basketball Equipment</span>
        </div>
        <p>© {new Date().getFullYear()} SLAM DUNK. Todos los derechos reservados.</p>
      </footer>

      {/* MODAL: Promotion Video Modal */}
      {isPromoVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl">
            <button
              id="close-promo-video-btn"
              onClick={() => setIsPromoVideoOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5722] animate-pulse" />
              <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                SLAM DUNK — Official Promo Showcase
              </h3>
            </div>

            {/* Video Player Mockup / Dynamic Canvas */}
            <div className="relative w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 flex flex-col justify-between p-6">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span className="font-bold text-white uppercase tracking-wider">
                    Model: {currentEditionData.bgText} 29.5" Official
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
                    Precision In Motion
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
              <span>Tamaño Reglamentario NBA: 29.5 pulgadas (75 cm)</span>
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

      {/* MODAL: Customize Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl">
            <button
              id="close-customize-modal-btn"
              onClick={() => setIsCustomizeOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-[#ff5722]" />
              <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                Personalización Custom
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mb-5">
              Configura las especificaciones a medida para tu balón SLAM DUNK:
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold uppercase tracking-wider mb-2">
                  Edición Base
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {EDITIONS_LIST.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelectEdition(item.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        edition === item.id
                          ? 'border-[#ff5722] bg-[#ff5722]/10 text-white font-bold'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.bgText}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold uppercase tracking-wider mb-2">
                  Textura de Piel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Pebbled Pro', 'Asphalt Grip', 'Soft Court'].map((tex) => (
                    <button
                      key={tex}
                      onClick={() => setCustomTexture(tex)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        customTexture === tex
                          ? 'border-[#ff5722] bg-zinc-800 text-white font-bold'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tex}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold uppercase tracking-wider mb-2">
                  Color de Canales
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Negro Profundo', 'Naranja Neón', 'Oro Metálico'].map((chan) => (
                    <button
                      key={chan}
                      onClick={() => setCustomChannel(chan)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        customChannel === chan
                          ? 'border-[#ff5722] bg-zinc-800 text-white font-bold'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {chan}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold uppercase tracking-wider mb-2">
                  Grabado Láser Personalizado (Opcional)
                </label>
                <input
                  type="text"
                  maxLength={20}
                  placeholder="Ej: KOBE #24 o TU NOMBRE"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5722]"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setIsCustomizeOpen(false);
                showToast(`Personalización guardada: ${currentEditionData.bgText} (${customTexture})`);
              }}
              className="mt-6 w-full py-3 bg-[#ff5722] hover:bg-white text-zinc-950 font-black uppercase tracking-wider rounded-xl text-xs transition-colors cursor-pointer"
            >
              Guardar y Aplicar
            </button>
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
              onClick={() => setIsUserModalOpen(false)}
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
                  SLAM Member
                </h3>
                <span className="text-[11px] text-[#ff5722] font-semibold uppercase tracking-wider">
                  Pro Baller Tier
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
              onClick={() => setIsTechModalOpen(false)}
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
              onClick={() => setIsTechModalOpen(false)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* DRAWER: Shopping Cart */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col justify-between p-6 shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#ff5722]" />
                  <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                    Carrito ({totalCartItems})
                  </h3>
                </div>
                <button
                  id="close-cart-btn"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckingOut(false);
                    setOrderCompleted(false);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Content */}
              {orderCompleted ? (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7" />
                  </div>
                  <h4 className="font-display text-3xl font-black uppercase text-white mb-2">
                    ¡Orden Confirmada!
                  </h4>
                  <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                    Hemos procesado tu compra por <strong className="text-white">${subtotal.toFixed(2)} USD</strong>. Te enviamos los detalles de despacho express a <span className="text-[#ff5722]">{buyerEmail}</span>.
                  </p>
                  <button
                    id="finish-order-btn"
                    onClick={() => {
                      setCart([]);
                      setIsCheckingOut(false);
                      setOrderCompleted(false);
                      setIsCartOpen(false);
                    }}
                    className="w-full py-3 bg-[#ff5722] text-zinc-950 font-black uppercase tracking-wider rounded-xl text-xs hover:bg-white transition-colors cursor-pointer"
                  >
                    Seguir Comprando
                  </button>
                </div>
              ) : isCheckingOut ? (
                <form onSubmit={handleCheckoutSubmit} className="py-4 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Datos de Envío
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y Apellidos"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5722]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5722]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Dirección de Entrega
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Calle, Ciudad, Código Postal"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5722]"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="w-1/3 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase tracking-wider rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      id="submit-checkout-btn"
                      type="submit"
                      className="w-2/3 py-2.5 bg-[#ff5722] hover:bg-white text-zinc-950 font-black uppercase tracking-wider rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Pagar ${subtotal.toFixed(2)} USD
                    </button>
                  </div>
                </form>
              ) : cart.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">Tu carrito está vacío</p>
                  <p className="text-xs text-zinc-400 mb-6">
                    Añade la edición actual que estás visualizando o elige tu favorita:
                  </p>

                  <div className="space-y-3">
                    <button
                      id="empty-cart-add-current-btn"
                      onClick={() => {
                        addToCart(edition);
                      }}
                      className="w-full py-3 px-4 bg-[#ff5722] hover:bg-white text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff5722]/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir {currentEditionData.bgText} (${currentEditionData.price.toFixed(2)} USD)</span>
                    </button>

                    <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Otras Ediciones Disponibles
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {EDITIONS_LIST.map((item) => (
                        <button
                          key={item.id}
                          id={`empty-cart-add-${item.id}-btn`}
                          onClick={() => {
                            onSelectEdition(item.id);
                            addToCart(item.id);
                          }}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            edition === item.id
                              ? 'bg-zinc-900 border-[#ff5722]/60 text-white'
                              : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full mb-0.5"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[11px] font-bold uppercase leading-tight">
                            {item.bgText}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            ${item.price.toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-zinc-400 font-medium">
                            ${item.price.toFixed(2)} USD
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer / Checkout CTA */}
            {!orderCompleted && cart.length > 0 && !isCheckingOut && (
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 uppercase tracking-wider font-semibold">Envío Express</span>
                  <span className="text-emerald-400 font-bold uppercase">Gratis</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-300 font-bold uppercase tracking-wider">Total</span>
                  <span className="text-xl font-black text-white font-mono">${subtotal.toFixed(2)} USD</span>
                </div>
                <button
                  id="proceed-checkout-btn"
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-3.5 bg-[#ff5722] hover:bg-white text-zinc-950 font-black uppercase tracking-widest rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-[#ff5722]/20"
                >
                  Continuar al Pago
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
