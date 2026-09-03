/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CanvasContainer } from './components/CanvasContainer';
import { Overlay } from './components/Overlay';
import { BackgroundTypography } from './components/BackgroundTypography';
import { CartSwishEffects } from './components/CartSwishEffects';
import { BallEdition } from './components/Basketball';
import { EDITIONS_LIST } from './data/editions';

const AMBIENT_BG: Record<BallEdition, string> = {
  nebula: '#031d2c',
  fuego: '#200b04',
  oro: '#1f1604',
  metal: '#0f141c',
};

export default function App() {
  const [edition, setEdition] = useState<BallEdition>('nebula');

  const currentEditionData = EDITIONS_LIST.find((e) => e.id === edition) || EDITIONS_LIST[0];

  return (
    <div
      className="w-full min-h-screen md:p-3 lg:p-5 flex items-center justify-center transition-colors duration-700"
      style={{ backgroundColor: AMBIENT_BG[edition] || '#031d2c' }}
    >
      <main className="w-full max-w-[1780px] min-h-screen md:min-h-[96vh] bg-black md:rounded-[28px] text-white relative overflow-hidden border border-white/5 shadow-2xl">
        {/* Background typography behind the 3D ball */}
        <BackgroundTypography
          modelName={currentEditionData.bgText}
          bgLeft={currentEditionData.bgLeft}
          bgRight={currentEditionData.bgRight}
        />

        {/* 3D Basketball canvas (transparent WebGL layer) */}
        <CanvasContainer edition={edition} />

        {/* Foreground UI controls, overlays and sections */}
        <Overlay edition={edition} onSelectEdition={setEdition} />

        {/* Celebratory GSAP Cart Swish Net & Shockwave Effects */}
        <CartSwishEffects />
      </main>
    </div>
  );
}

