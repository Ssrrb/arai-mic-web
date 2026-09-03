/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { CanvasContainer } from './components/CanvasContainer';
import { Overlay } from './components/Overlay';
import { CustomizerPage, FIXED_CUSTOM_PRICE } from './components/CustomizerPage';
import { BackgroundTypography } from './components/BackgroundTypography';
import { CartSwishEffects } from './components/CartSwishEffects';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppCheckoutModal } from './components/WhatsAppCheckoutModal';
import { BallEdition } from './components/Basketball';
import { EDITIONS_LIST } from './data/editions';
import { CustomBallConfig, AppView, CartItem } from './types';
import {
  toggleSound,
  isSoundMuted,
  playAddToCartLaunchSound,
  playButtonClick,
  playModalOpenSound,
} from './utils/audio';

const AMBIENT_BG: Record<BallEdition, string> = {
  nebula: '#031d2c',
  fuego: '#200b04',
  oro: '#1f1604',
  metal: '#0f141c',
};

const DEFAULT_CUSTOM_CONFIG: CustomBallConfig = {
  baseColor: '#ff5722',
  lineColor: '#111111',
  textureType: 'classic',
  laserText: '',
};

export default function App() {
  const [edition, setEdition] = useState<BallEdition>('nebula');
  const [view, setView] = useState<AppView>('landing');
  const [customConfig, setCustomConfig] = useState<CustomBallConfig>(DEFAULT_CUSTOM_CONFIG);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWhatsAppCheckoutOpen, setIsWhatsAppCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [isMuted, setIsMuted] = useState(isSoundMuted());
  const [isShooting, setIsShooting] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const currentEditionData =
    EDITIONS_LIST.find((e) => e.id === edition) || EDITIONS_LIST[0];

  const handleToggleMute = useCallback(() => {
    const muted = toggleSound();
    setIsMuted(muted);
  }, []);

  const handleOpenCustomizer = useCallback(() => {
    playButtonClick();
    setView('customizer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackToLanding = useCallback(() => {
    playButtonClick();
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleUpdateQuantity = useCallback((id: string, delta: number) => {
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
  }, []);

  const handleRemoveFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Adding an edition ball from Landing
  const handleAddToCartEdition = useCallback(
    (targetEdition?: BallEdition) => {
      const targetId = targetEdition || edition;
      const targetData =
        EDITIONS_LIST.find((e) => e.id === targetId) || EDITIONS_LIST[0];

      setIsShooting(true);
      playAddToCartLaunchSound();

      window.dispatchEvent(
        new CustomEvent('tuku:throw-ball', {
          detail: {
            edition: targetId,
          },
        })
      );

      setCart((prev) => {
        const existing = prev.find((item) => item.id === targetId && !item.customConfig);
        if (existing) {
          return prev.map((item) =>
            item.id === targetId && !item.customConfig
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [
          ...prev,
          {
            id: targetId,
            edition: targetId,
            name: `${targetData.bgText} ${targetData.name}`,
            price: targetData.price,
            quantity: 1,
            color: targetData.color,
          },
        ];
      });

      setTimeout(() => {
        setIsShooting(false);
      }, 1100);
    },
    [edition]
  );

  // Adding a customized ball from Customizer - Strictly 360.000 GS
  const handleAddToCartCustom = useCallback(() => {
    setIsShooting(true);
    playAddToCartLaunchSound();

    window.dispatchEvent(
      new CustomEvent('tuku:throw-ball', {
        detail: {
          edition: 'custom',
          customConfig: { ...customConfig },
          price: FIXED_CUSTOM_PRICE,
        },
      })
    );

    const textureLabel =
      customConfig.textureType === 'classic'
        ? 'Granulado Classic'
        : customConfig.textureType === 'street'
        ? 'Asfalto Rugoso'
        : customConfig.textureType === 'tech'
        ? 'Hexagonal Tech'
        : 'Moleteado Cross';

    const customId = `custom-${customConfig.baseColor}-${customConfig.lineColor}-${customConfig.textureType}-${customConfig.laserText || 'none'}`;
    const customName = `TUKU Custom Lab 29.5" (${textureLabel})`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === customId);
      if (existing) {
        return prev.map((item) =>
          item.id === customId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: customId,
          edition: 'fuego',
          name: customName,
          price: FIXED_CUSTOM_PRICE, // STRICTLY 360.000 GS
          quantity: 1,
          color: customConfig.baseColor,
          customConfig: { ...customConfig },
        },
      ];
    });

    setTimeout(() => {
      setIsShooting(false);
    }, 1100);
  }, [customConfig]);

  const handleCheckoutFromCart = useCallback(() => {
    if (cart.length === 0) return;
    setCheckoutItems([...cart]);
    setIsCartOpen(false);
    playModalOpenSound();
    setIsWhatsAppCheckoutOpen(true);
  }, [cart]);

  const handleResetRotation = useCallback(() => {
    window.dispatchEvent(new CustomEvent('tuku-reset-rotation'));
  }, []);

  // Ambient backdrop color
  const ambientBackground =
    view === 'customizer'
      ? '#09090b'
      : AMBIENT_BG[edition] || '#031d2c';

  return (
    <div
      className="w-full min-h-screen md:p-3 lg:p-5 flex items-center justify-center transition-colors duration-700 font-sans"
      style={{ backgroundColor: ambientBackground }}
    >
      <main className="w-full max-w-[1780px] min-h-screen md:min-h-[96vh] bg-black md:rounded-[28px] text-white relative overflow-hidden border border-white/5 shadow-2xl">
        {/* Background typography behind the 3D ball */}
        <BackgroundTypography
          modelName={view === 'customizer' ? 'CUSTOM' : currentEditionData.bgText}
          bgLeft={view === 'customizer' ? '360.000 GS' : currentEditionData.bgLeft}
          bgRight={view === 'customizer' ? 'LAB' : currentEditionData.bgRight}
          isCustomizer={view === 'customizer'}
        />

        {/* 3D Basketball canvas (interactive WebGL layer with real-time color & texture updates) */}
        <CanvasContainer
          edition={edition}
          viewMode={view}
          customConfig={customConfig}
          autoRotate={autoRotate}
        />

        {/* View switching between Landing Showcase and Customizer Lab */}
        {view === 'landing' ? (
          <Overlay
            edition={edition}
            onSelectEdition={setEdition}
            onOpenCustomizer={handleOpenCustomizer}
            cart={cart}
            setCart={setCart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        ) : (
          <CustomizerPage
            config={customConfig}
            onChangeConfig={setCustomConfig}
            onBackToShop={handleBackToLanding}
            onAddToCart={handleAddToCartCustom}
            cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            onOpenCart={() => {
              playModalOpenSound();
              setIsCartOpen(true);
            }}
            isShooting={isShooting}
            onResetRotation={handleResetRotation}
          />
        )}

        {/* Global Cart Drawer (available in both Landing and Customizer view) */}
        {view === 'customizer' && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveFromCart={handleRemoveFromCart}
            onCheckout={handleCheckoutFromCart}
            onAddCurrentEdition={handleAddToCartCustom}
            onSelectEdition={setEdition}
            onOpenCustomizer={handleOpenCustomizer}
            currentEdition={edition}
          />
        )}

        {/* Global WhatsApp Checkout Modal for Customizer View */}
        {view === 'customizer' && (
          <WhatsAppCheckoutModal
            isOpen={isWhatsAppCheckoutOpen}
            onClose={() => setIsWhatsAppCheckoutOpen(false)}
            items={checkoutItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={() => {
              setCart([]);
              setCheckoutItems([]);
            }}
            accentColor={customConfig.baseColor}
          />
        )}

        {/* Celebratory GSAP Cart Swish Net & Shockwave Effects */}
        <CartSwishEffects />
      </main>
    </div>
  );
}
