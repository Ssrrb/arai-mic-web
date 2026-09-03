import React from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, Send, Sparkles } from 'lucide-react';
import { CartItem } from '../types';
import { BallEdition } from './Basketball';
import { EDITIONS_LIST } from '../data/editions';
import { playModalCloseSound } from '../utils/audio';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveFromCart: (id: string) => void;
  onCheckout: () => void;
  onAddCurrentEdition?: () => void;
  onSelectEdition?: (edition: BallEdition) => void;
  onOpenCustomizer?: () => void;
  currentEdition?: BallEdition;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveFromCart,
  onCheckout,
  onAddCurrentEdition,
  onSelectEdition,
  onOpenCustomizer,
  currentEdition = 'nebula',
}: CartDrawerProps) {
  if (!isOpen) return null;

  const formatPYG = (amount: number): string => {
    return `₲ ${Math.round(amount).toLocaleString('es-PY')}`;
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const currentEditionData =
    EDITIONS_LIST.find((e) => e.id === currentEdition) || EDITIONS_LIST[0];

  return (
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
              id="close-cart-drawer-btn"
              onClick={() => {
                playModalCloseSound();
                onClose();
              }}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          {cart.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-white mb-1">Tu carrito está vacío</p>
              <p className="text-xs text-zinc-400 mb-6">
                Personaliza tu balón a medida o añade una de nuestras ediciones oficiales:
              </p>

              <div className="space-y-3">
                {onOpenCustomizer && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCustomizer();
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#ff5722] to-[#e64a19] hover:from-[#f4511e] hover:to-[#ff5722] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff5722]/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Personalizar Mi Balón (₲ 360.000)</span>
                  </button>
                )}

                {onAddCurrentEdition && (
                  <button
                    onClick={onAddCurrentEdition}
                    className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#ff5722]" />
                    <span>Añadir {currentEditionData.bgText} ({formatPYG(currentEditionData.price)})</span>
                  </button>
                )}

                <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Ediciones Colección Oficial
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {EDITIONS_LIST.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (onSelectEdition) onSelectEdition(item.id);
                        if (onAddCurrentEdition) onAddCurrentEdition();
                      }}
                      className="p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                    >
                      <span
                        className="w-2 h-2 rounded-full mb-0.5"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[11px] font-bold uppercase leading-tight">
                        {item.bgText}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {formatPYG(item.price)}
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
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                      style={{
                        backgroundColor: item.customConfig?.baseColor || item.color || '#ff5722',
                      }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {item.name}
                      </h4>
                      {item.customConfig ? (
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          <span className="text-[11px] font-black text-[#ff5722] font-mono">
                            {formatPYG(item.price)}
                          </span>
                          <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono">
                            <span className="uppercase text-white font-bold">
                              {item.customConfig.textureType}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span
                                className="w-1.5 h-1.5 rounded-full inline-block"
                                style={{ backgroundColor: item.customConfig.baseColor }}
                              />
                              {item.customConfig.baseColor}
                            </span>
                            {item.customConfig.laserText && (
                              <>
                                <span>•</span>
                                <span className="text-white truncate">
                                  "{item.customConfig.laserText}"
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-medium font-mono">
                          {formatPYG(item.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-white font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer transition-colors"
                      aria-label="Eliminar producto"
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
        {cart.length > 0 && (
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 uppercase tracking-wider font-semibold">
                Envío a Domicilio
              </span>
              <span className="text-emerald-400 font-bold uppercase">Gratis Express</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-300 font-bold uppercase tracking-wider">Total</span>
              <span className="text-xl font-black text-white font-mono">{formatPYG(subtotal)}</span>
            </div>
            <button
              id="proceed-checkout-btn"
              onClick={onCheckout}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-widest rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 fill-zinc-950" />
              <span>Comprar por WhatsApp ({formatPYG(subtotal)})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
