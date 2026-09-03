import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Send,
  Truck,
  MapPin,
  Phone,
  User,
  Banknote,
  Check,
  Copy,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { CartItem } from '../types';
import { playButtonClick, playModalCloseSound } from '../utils/audio';

interface WhatsAppCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemoveItem?: (id: string) => void;
  onClearCart?: () => void;
  accentColor?: string;
}

// Configurable store WhatsApp number
export const STORE_WHATSAPP_NUMBER = '595981885885'; // Formato internacional
export const STORE_WHATSAPP_DISPLAY = '+595 981 885 885';

export function WhatsAppCheckoutModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  accentColor = '#ff5722',
}: WhatsAppCheckoutModalProps) {
  // Form state: Solamente datos para envío y pago contra entrega
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [referencias, setReferencias] = useState('');
  const [formaAbono, setFormaAbono] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [pagaCon, setPagaCon] = useState('');
  
  // Validation state
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  // Order Details
  const [orderId, setOrderId] = useState('');

  // Generate unique order ID on open
  useEffect(() => {
    if (isOpen && !orderId) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setOrderId(`TK-${randomNum}`);
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const formatPYG = (amount: number): string => {
    return `₲ ${Math.round(amount).toLocaleString('es-PY')}`;
  };

  const total = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

  // Generación limpia del mensaje para WhatsApp con solamente Envío y Pago Contra Entrega
  const generateWhatsAppMessage = () => {
    const lines: string[] = [];
    lines.push(`🏀 *NUEVO PEDIDO TUKU #${orderId}*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🛒 *PRODUCTOS:*`);

    items.forEach((it) => {
      lines.push(`• *${it.quantity}x* ${it.name} - ${formatPYG(it.price * it.quantity)}`);
      if (it.customConfig) {
        lines.push(`   🎨 Base: ${it.customConfig.baseColor} | Líneas: ${it.customConfig.lineColor}`);
        lines.push(`   ⚡ Textura: ${it.customConfig.textureType?.toUpperCase() || 'CLASSIC'}`);
        if (it.customConfig.laserText) {
          lines.push(`   ✒️ Grabado Láser: "${it.customConfig.laserText.toUpperCase()}"`);
        }
        if (it.customConfig.vibeName) {
          lines.push(`   ✨ Vibe: ${it.customConfig.vibeName}`);
        }
      }
    });

    lines.push(`\n💰 *TOTAL A PAGAR: ${formatPYG(total)}*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🚚 *DATOS DE ENVÍO (A Domicilio):*`);
    lines.push(`• *Cliente:* ${nombre.trim() || 'No especificado'}`);
    lines.push(`• *Teléfono:* ${telefono.trim() || 'No especificado'}`);
    lines.push(`• *Dirección:* ${direccion.trim() || 'No especificada'}`);
    if (referencias.trim()) {
      lines.push(`• *Referencias:* ${referencias.trim()}`);
    }
    lines.push(`• *Tipo de Envío:* Express a Domicilio (Gratis)`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`💵 *MÉTODO DE PAGO:*`);
    lines.push(`• *Pago Contra Entrega* (Se abona al recibir el pedido)`);
    if (formaAbono === 'efectivo') {
      lines.push(
        `• Modalidad: *Efectivo* ${pagaCon.trim() ? `(Abona con: ${pagaCon.trim()})` : ''}`
      );
    } else {
      lines.push(`• Modalidad: *Transferencia SIPAP al recibir en mano*`);
    }
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`¡Hola TUKU! Quiero confirmar este pedido con pago contra entrega.`);

    return lines.join('\n');
  };

  const whatsappMessage = generateWhatsAppMessage();
  const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAttempt(true);

    if (!nombre.trim() || !telefono.trim() || !direccion.trim() || items.length === 0) {
      return;
    }

    playButtonClick('success');
    setOrderSent(true);

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    if (onClearCart) {
      // Optional slight delay so user sees state before clearing
      setTimeout(() => {
        onClearCart();
      }, 800);
    }
  };

  const isFormValid = nombre.trim() !== '' && telefono.trim() !== '' && direccion.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col relative shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white leading-none tracking-wide flex items-center gap-2">
                Pedir por WhatsApp
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium mt-1">
                Envío a Domicilio • Pago Contra Entrega • Pedido #{orderId}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playModalCloseSound();
              onClose();
            }}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-zinc-200 text-xs">
          {orderSent ? (
            /* Order Sent Confirmation View */
            <div className="py-6 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h4 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                  ¡Pedido Enviado a WhatsApp!
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  Se abrió la conversación oficial de TUKU ({STORE_WHATSAPP_DISPLAY}) con los datos de tu pedido y pago contra entrega.
                </p>
              </div>

              {/* Summary box */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between font-bold text-white pb-1 border-b border-zinc-800">
                  <span>Pedido #{orderId}</span>
                  <span className="font-mono text-emerald-400">{formatPYG(total)}</span>
                </div>
                <p className="text-zinc-300">
                  <strong>Destinatario:</strong> {nombre} ({telefono})
                </p>
                <p className="text-zinc-300 truncate">
                  <strong>Entrega:</strong> {direccion}
                </p>
                <p className="text-zinc-400 text-[11px]">
                  <strong>Pago:</strong> Contra Entrega al recibir ({formaAbono === 'efectivo' ? 'Efectivo' : 'Transferencia al recibir'})
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4 fill-zinc-950" />
                  <span>Volver a Abrir WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold"
                >
                  {copiedMsg ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">¡Texto Copiado al Portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto del Pedido</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrderSent(false);
                    onClose();
                  }}
                  className="text-zinc-500 hover:text-zinc-300 text-xs font-semibold pt-1 cursor-pointer"
                >
                  Cerrar Ventana
                </button>
              </div>
            </div>
          ) : (
            /* Main Simplified Form */
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* 1. Items Preview (Compact) */}
              <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400 pb-1 border-b border-zinc-800">
                  <span className="flex items-center gap-1.5 text-white">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#ff5722]" /> Tu Pedido
                  </span>
                  <span className="font-mono text-zinc-400">
                    {items.reduce((acc, it) => acc + it.quantity, 0)} {items.reduce((acc, it) => acc + it.quantity, 0) === 1 ? 'unidad' : 'unidades'}
                  </span>
                </div>

                {items.length === 0 ? (
                  <p className="text-zinc-500 text-center py-2">No hay productos en el pedido</p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 py-1"
                      >
                        <div className="flex flex-col truncate">
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: item.customConfig?.baseColor || item.color,
                              }}
                            />
                            <span className="font-bold text-white text-xs truncate uppercase">
                              {item.name}
                            </span>
                          </div>
                          {item.customConfig && (
                            <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 mt-0.5 font-mono">
                              <span className="uppercase text-[#ff5722] font-bold">
                                {item.customConfig.textureType}
                              </span>
                              <span>•</span>
                              <span>{item.customConfig.baseColor}</span>
                              {item.customConfig.laserText && (
                                <>
                                  <span>•</span>
                                  <span className="text-white truncate">"{item.customConfig.laserText}"</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {onUpdateQuantity && (
                            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded px-1">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="px-1 py-0.5 text-zinc-400 hover:text-white font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-1 text-xs font-mono font-bold text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="px-1 py-0.5 text-zinc-400 hover:text-white font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          )}
                          <span className="font-mono font-bold text-white text-xs min-w-[70px] text-right">
                            {formatPYG(item.price * item.quantity)}
                          </span>
                          {onRemoveItem && (
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              className="text-zinc-600 hover:text-red-400 p-1 cursor-pointer transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-wider">
                    Total a Pagar:
                  </span>
                  <span className="font-mono text-base font-black text-white">
                    {formatPYG(total)}
                  </span>
                </div>
              </div>

              {/* 2. Simplified Shipping Fields (Solamente Envío a Domicilio) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" /> Datos de Envío (A Domicilio)
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Envío Gratis
                  </span>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-zinc-500" />
                    <span>Tu Nombre y Apellido *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Rodrigo Benítez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={`w-full bg-zinc-900/90 border rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none text-xs transition-colors ${
                      submittedAttempt && !nombre.trim()
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-800 focus:border-emerald-500'
                    }`}
                  />
                  {submittedAttempt && !nombre.trim() && (
                    <span className="text-[10px] text-red-400 mt-1 block">
                      Por favor ingresa tu nombre.
                    </span>
                  )}
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-zinc-500" />
                    <span>Teléfono de Contacto / WhatsApp *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 0981 123 456"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className={`w-full bg-zinc-900/90 border rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none text-xs transition-colors ${
                      submittedAttempt && !telefono.trim()
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-800 focus:border-emerald-500'
                    }`}
                  />
                  {submittedAttempt && !telefono.trim() && (
                    <span className="text-[10px] text-red-400 mt-1 block">
                      Por favor ingresa tu número telefónico para la entrega.
                    </span>
                  )}
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span>Dirección de Entrega (Ciudad, Barrio, Calle y N°) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Barrio Carmelitas, Calle España 1234 c/ Brasil, Asunción"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className={`w-full bg-zinc-900/90 border rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none text-xs transition-colors ${
                      submittedAttempt && !direccion.trim()
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-800 focus:border-emerald-500'
                    }`}
                  />
                  {submittedAttempt && !direccion.trim() && (
                    <span className="text-[10px] text-red-400 mt-1 block">
                      Ingresa la dirección donde llevaremos tu balón.
                    </span>
                  )}
                </div>

                {/* Referencias opcionales */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Referencias o Indicaciones (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Portón negro, timbre 2, entregar por la tarde..."
                    value={referencias}
                    onChange={(e) => setReferencias(e.target.value)}
                    className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl px-3.5 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
                  />
                </div>
              </div>

              {/* 3. Pago Contra Entrega (Fijo y Simplificado) */}
              <div className="bg-zinc-900/70 border border-emerald-500/40 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Banknote className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                        Pago Contra Entrega
                      </h5>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        Pagas al recibir tu balón en la puerta
                      </span>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </span>
                </div>

                {/* Modalidad de abono contra entrega */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                    ¿Cómo abonarás al recibir?
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormaAbono('efectivo')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                        formaAbono === 'efectivo'
                          ? 'bg-zinc-900 border-emerald-500 text-white shadow-sm'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-xs block">Efectivo</span>
                      <span className="text-[10px] text-zinc-500">En mano al repartidor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormaAbono('transferencia')}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                        formaAbono === 'transferencia'
                          ? 'bg-zinc-900 border-emerald-500 text-white shadow-sm'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-xs block">Transferencia</span>
                      <span className="text-[10px] text-zinc-500">Al recibir el paquete</span>
                    </button>
                  </div>

                  {formaAbono === 'efectivo' && (
                    <div className="mt-2.5">
                      <label className="block text-[10px] text-zinc-400 font-semibold mb-1">
                        ¿Con cuánto pagarás? (Opcional, para llevarte el vuelto exacto)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 500.000 o monto exacto"
                        value={pagaCon}
                        onChange={(e) => setPagaCon(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: Enviar a WhatsApp */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={items.length === 0}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 fill-zinc-950" />
                  <span>Enviar Pedido a WhatsApp</span>
                </button>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                  <span>Atención oficial: {STORE_WHATSAPP_DISPLAY}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Check className="w-3 h-3" /> Despacho Express
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
