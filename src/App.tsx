/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CanvasContainer } from './components/CanvasContainer';
import { Overlay } from './components/Overlay';
import { BallEdition } from './components/Basketball';

export default function App() {
  const [edition, setEdition] = useState<BallEdition>('fuego');

  return (
    <main className="w-full min-h-screen bg-[#09090b] text-white selection:bg-[#ff5722] selection:text-white">
      <CanvasContainer edition={edition} />
      <Overlay edition={edition} onSelectEdition={setEdition} />
    </main>
  );
}

