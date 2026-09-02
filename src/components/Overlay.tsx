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
  Sparkles
} from 'lucide-react';
import { BallEdition } from './Basketball';

gsap.registerPlugin(ScrollTrigger);

export interface CartItem {
  id: string;
  edition: BallEdition;
  name: string;
  price: number;
  quantity: number;
  color: string;
}

interface OverlayProps {
  edition: BallEdition;
  onSelectEdition: (ed: BallEdition) => void;
}

export function Overlay({ edition, onSelectEdition }: OverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout flow state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');

  const editionsData = [
    {
      id: 'fuego' as BallEdition,
      name: 'Fuego',
      subtitle: 'Classic High-Vis',
      desc: 'Naranja volcánico de máxima visibilidad y contraste.',
      price: 69,
      color: '#ff5722',
    },
    {
      id: 'obsidiana' as BallEdition,
      name: 'Obsidiana',
      subtitle: 'Stealth Asphalt',
      desc: 'Negro carbón mate con canales profundos antideslizantes.',
      price: 69,
      color: '#71717a',
    },
    {
      id: 'oro' as BallEdition,
      name: 'Oro',
      subtitle: 'Championship Pro',
      desc: 'Blanco perla de duela con grabados dorados reflectivos.',
      price: 79,
      color: '#f59e0b',
    },
  ];

  const currentEditionData = editionsData.find((e) => e.id === edition) || editionsData[0];

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const addToCart = (edId: BallEdition) => {
    const itemData = editionsData.find((e) => e.id === edId) || editionsData[0];
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
          name: `TUKU ${itemData.name}`,
          price: itemData.price,
          quantity: 1,
          color: itemData.color,
        },
      ];
    });

    showToast(`Añadido al carrito: TUKU ${itemData.name}`);
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-title',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power4.out', stagger: 0.1 }
      );

      gsap.fromTo(
        '.hero-sub',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.25 }
      );

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
    <div ref={containerRef} className="relative z-10 w-full no-scrollbar">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-zinc-900 border border-[#ff5722]/50 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4 text-[#ff5722]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center z-40 backdrop-blur-md bg-zinc-950/70 border-b border-white/5 text-white">
        <button
          id="brand-logo-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <span className="font-display text-3xl md:text-4xl font-black tracking-widest uppercase text-white group-hover:text-[#ff5722] transition-colors">
            TUKU
          </span>
        </button>

        {/* Minimal Navigation */}
        <nav className="hidden md:flex gap-8 text-xs font-semibold tracking-widest uppercase text-zinc-400">
          <a href="#ingenieria" className="hover:text-white transition-colors">
            Ingeniería
          </a>
          <a href="#rendimiento" className="hover:text-white transition-colors">
            Rendimiento
          </a>
          <a href="#ediciones" className="hover:text-white transition-colors">
            Ediciones
          </a>
        </nav>

        {/* Cart Button */}
        <div className="flex items-center gap-3">
          <button
            id="open-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-[#ff5722] text-white hover:text-zinc-950 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Carrito</span>
            {totalCartItems > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#ff5722] group-hover:bg-zinc-950 text-zinc-950 group-hover:text-[#ff5722] text-[10px] font-black flex items-center justify-center -mr-1">
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
            href="#ingenieria"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs uppercase tracking-widest text-zinc-300 hover:text-[#ff5722] py-2"
          >
            Ingeniería
          </a>
          <a
            href="#rendimiento"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs uppercase tracking-widest text-zinc-300 hover:text-[#ff5722] py-2"
          >
            Rendimiento
          </a>
          <a
            href="#ediciones"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs uppercase tracking-widest text-zinc-300 hover:text-[#ff5722] py-2"
          >
            Ediciones
          </a>
        </div>
      )}

      {/* Hero Section */}
      <section className="h-screen w-full flex flex-col items-center justify-center text-center px-4 relative pointer-events-none">
        <div className="overflow-hidden">
          <h1 className="hero-title font-display text-7xl sm:text-9xl md:text-[11rem] leading-none font-black tracking-tighter text-white uppercase">
            EL FUTURO
          </h1>
        </div>
        <div className="overflow-hidden -mt-2 sm:-mt-5 md:-mt-7">
          <h1 className="hero-title font-display text-7xl sm:text-9xl md:text-[11rem] leading-none font-black tracking-tighter text-[#ff5722] uppercase">
            DEL JUEGO
          </h1>
        </div>

        {/* Quick Add Action */}
        <div className="mt-6 pointer-events-auto flex items-center gap-3">
          <button
            id="hero-add-cart-btn"
            onClick={() => addToCart(edition)}
            className="px-6 py-2.5 bg-[#ff5722] hover:bg-white text-zinc-950 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#ff5722]/20 cursor-pointer flex items-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Añadir</span>
          </button>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-500 animate-bounce">
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400">
            Explora
          </span>
          <MoveRight className="w-3.5 h-3.5 rotate-90 text-[#ff5722]" />
        </div>
      </section>

      {/* Section 1: INGENIERÍA */}
      <section id="ingenieria" className="min-h-screen w-full flex items-center justify-start px-6 md:px-24 py-20">
        <div className="section-animate max-w-md bg-zinc-950/70 p-6 sm:p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
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
              <span className="block text-2xl font-black font-display text-white">0.8 mm</span>
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
        <div className="section-animate max-w-md text-right bg-zinc-950/70 p-6 sm:p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#f59e0b] bg-[#f59e0b]/10 mb-3 justify-end">
            <Sparkles className="w-3 h-3" /> TUKU-Core™
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-bold mb-3 text-white uppercase leading-none">
            Respuesta
          </h2>
          <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
            Núcleo reactivo que maximiza el retorno elástico y mantiene la esfericidad tras miles de impactos intensos.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800">
              <span className="block text-2xl font-black font-display text-[#ff5722]">+32%</span>
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

      {/* Section 3: EDICIONES */}
      <section id="ediciones" className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-20">
        <div className="section-animate max-w-3xl w-full text-center mb-10">
          <h2 className="font-display text-5xl sm:text-7xl font-black text-white uppercase tracking-tight">
            Colección
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Selecciona para previsualizar en 3D o añade directamente a tu carrito:
          </p>
        </div>

        <div className="section-animate grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
          {editionsData.map((item) => {
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
                    ${item.price} USD
                  </span>
                </div>

                <h3 className="text-2xl font-bold font-display uppercase tracking-wide text-white mb-1">
                  {item.name}
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
      <section className="min-h-[70vh] w-full flex flex-col items-center justify-center px-6 text-center py-20 relative">
        <div className="section-animate max-w-xl">
          <h2 className="font-display text-6xl sm:text-8xl font-black mb-4 text-white uppercase tracking-tighter">
            DOMINA
          </h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
            Balón TUKU de alta precisión listo para despacho directo.
          </p>

          <button
            id="cta-add-to-cart-btn"
            onClick={() => {
              addToCart(edition);
              setIsCartOpen(true);
            }}
            className="px-8 py-3.5 bg-[#ff5722] text-zinc-950 rounded-full text-sm font-black uppercase tracking-widest hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#ff5722]/20 cursor-pointer inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Comprar TUKU • ${currentEditionData.price} USD</span>
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-900 px-6 py-8 text-center text-xs text-zinc-500">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="font-display text-2xl font-black tracking-widest uppercase text-white">
            TUKU
          </span>
          <span className="text-zinc-700">•</span>
          <span>Balones de Alta Precisión</span>
        </div>
        <p>© {new Date().getFullYear()} TUKU Sports. Todos los derechos reservados.</p>
      </footer>

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
              Especificaciones
            </h3>

            <div className="space-y-3 text-xs mb-6">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-semibold uppercase">Material Exterior</span>
                <span className="text-white font-bold">Poliuretano Micro-Pebbled</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-semibold uppercase">Estructura</span>
                <span className="text-white font-bold">2.400m Bobinado Nylon</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-semibold uppercase">Cámara</span>
                <span className="text-white font-bold">Butilo Hermético Pro</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-semibold uppercase">Presión Nominal</span>
                <span className="text-white font-bold">7.5 - 8.5 PSI</span>
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

      {/* DRAWER: Shopping Cart (Carrito de Compras) */}
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
                    Hemos procesado tu compra por <strong className="text-white">${subtotal} USD</strong>. Te enviamos los detalles de despacho a <span className="text-[#ff5722]">{buyerEmail}</span>.
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
                      Pagar ${subtotal} USD
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
                      <span>Añadir TUKU {currentEditionData.name} (${currentEditionData.price} USD)</span>
                    </button>

                    <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Otras Ediciones Disponibles
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {editionsData.map((item) => (
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
                            {item.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            ${item.price}
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
                            ${item.price} USD
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
                  <span className="text-zinc-400 uppercase tracking-wider font-semibold">Envío</span>
                  <span className="text-emerald-400 font-bold uppercase">Gratis</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-300 font-bold uppercase tracking-wider">Total</span>
                  <span className="text-xl font-black text-white font-mono">${subtotal} USD</span>
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
