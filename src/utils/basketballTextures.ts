import { CanvasTexture, RepeatWrapping } from 'three';
import { BallEdition } from '../components/Basketball';
import { CustomBallConfig, GripTextureType } from '../types';

interface TexturesResult {
  diffuseTexture: CanvasTexture;
  bumpTexture: CanvasTexture;
}

const textureCache = new Map<string, TexturesResult>();

export function getCustomBasketballTextures(config: CustomBallConfig): TexturesResult {
  const cacheKey = `custom_${config.baseColor}_${config.lineColor}_${config.textureType}_${config.laserText || ''}_${config.vibeName || ''}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  // Use 1024x512 canvas for blazing fast generation and crisp PBR rendering
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 512;
  const bumpCtx = bumpCanvas.getContext('2d');

  if (ctx && bumpCtx) {
    const w = canvas.width;
    const h = canvas.height;
    const baseColor = config.baseColor || '#ff5722';
    const channelColor = config.lineColor || '#111111';
    const textureType: GripTextureType = config.textureType || 'classic';

    // 1. Fill base tone
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);

    bumpCtx.fillStyle = '#808080';
    bumpCtx.fillRect(0, 0, w, h);

    // 2. Procedural Texture Pattern based on Grip Type
    if (textureType === 'classic') {
      // NBA Official micro-pebbled leather
      const grainCount = 20000;
      for (let i = 0; i < grainCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const radius = Math.random() * 1.5 + 0.6;

        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.09)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        bumpCtx.fillStyle = Math.random() > 0.5 ? '#a3a3a3' : '#595959';
        bumpCtx.beginPath();
        bumpCtx.arc(x, y, radius, 0, Math.PI * 2);
        bumpCtx.fill();
      }
    } else if (textureType === 'street') {
      // Rugged outdoor asphalt grip with coarse irregular granules and micro-cracks
      const grainCount = 14000;
      for (let i = 0; i < grainCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const radius = Math.random() * 2.8 + 0.8;

        const isDark = Math.random() > 0.45;
        ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.22)' : 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        bumpCtx.fillStyle = isDark ? '#404040' : '#b0b0b0';
        bumpCtx.beginPath();
        bumpCtx.arc(x, y, radius, 0, Math.PI * 2);
        bumpCtx.fill();
      }
      // Micro-asphalt surface abrasions
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1;
      for (let j = 0; j < 80; j++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (Math.random() - 0.5) * 18, sy + (Math.random() - 0.5) * 18);
        ctx.stroke();
      }
    } else if (textureType === 'tech') {
      // Futuristic aerodynamic composite hexagonal matrix
      const hexRadius = 8;
      const hexWidth = hexRadius * Math.sqrt(3);
      const hexHeight = hexRadius * 1.5;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      bumpCtx.strokeStyle = '#999999';
      bumpCtx.lineWidth = 1.2;

      for (let y = 0; y < h + hexHeight; y += hexHeight) {
        const rowIndex = Math.floor(y / hexHeight);
        const xOffset = (rowIndex % 2) * (hexWidth / 2);
        for (let x = -hexWidth; x < w + hexWidth; x += hexWidth) {
          const cx = x + xOffset;
          const cy = y;

          // Draw hexagon
          ctx.beginPath();
          bumpCtx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (Math.PI / 3) * a + Math.PI / 6;
            const hx = cx + hexRadius * Math.cos(angle);
            const hy = cy + hexRadius * Math.sin(angle);
            if (a === 0) {
              ctx.moveTo(hx, hy);
              bumpCtx.moveTo(hx, hy);
            } else {
              ctx.lineTo(hx, hy);
              bumpCtx.lineTo(hx, hy);
            }
          }
          ctx.closePath();
          bumpCtx.closePath();
          ctx.stroke();
          bumpCtx.stroke();

          // Center micro-pip
          bumpCtx.fillStyle = '#606060';
          bumpCtx.fillRect(cx - 1, cy - 1, 2, 2);
        }
      }
    } else if (textureType === 'cross') {
      // Diamond knurl cross-weave high-friction grip
      const step = 6;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      bumpCtx.strokeStyle = '#a8a8a8';
      bumpCtx.lineWidth = 1.2;

      for (let x = -h; x < w + h; x += step) {
        ctx.beginPath();
        bumpCtx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        bumpCtx.moveTo(x, 0);
        bumpCtx.lineTo(x + h, h);
        ctx.stroke();
        bumpCtx.stroke();

        ctx.beginPath();
        bumpCtx.beginPath();
        ctx.moveTo(x + h, 0);
        ctx.lineTo(x, h);
        bumpCtx.moveTo(x + h, 0);
        bumpCtx.lineTo(x, h);
        ctx.stroke();
        bumpCtx.stroke();
      }

      // Micro dots for tactile pebble
      bumpCtx.fillStyle = '#4a4a4a';
      for (let y = 0; y < h; y += step * 2) {
        for (let x = 0; x < w; x += step * 2) {
          bumpCtx.fillRect(x, y, 2, 2);
        }
      }
    }

    // 3. Draw Basketball Channels / Seams
    const drawChannel = (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      width: number
    ) => {
      [ctx, bumpCtx].forEach((c, idx) => {
        if (!c) return;
        c.strokeStyle = idx === 0 ? channelColor : '#000000';
        c.lineWidth = width;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(startX, startY);
        c.lineTo(endX, endY);
        c.stroke();
      });
    };

    // Horizontal equator seam
    drawChannel(0, h * 0.5, w, h * 0.5, 9);

    // Vertical quadrant seams
    drawChannel(w * 0.25, 0, w * 0.25, h, 9);
    drawChannel(w * 0.5, 0, w * 0.5, h, 9);
    drawChannel(w * 0.75, 0, w * 0.75, h, 9);

    // Curved panel ribs
    for (let panel = 0; panel < 4; panel++) {
      const cx = (w / 4) * panel + (w / 8);
      [ctx, bumpCtx].forEach((c, idx) => {
        if (!c) return;
        c.strokeStyle = idx === 0 ? channelColor : '#000000';
        c.lineWidth = 9;
        c.beginPath();
        c.ellipse(cx, h * 0.5, w * 0.08, h * 0.38, 0, 0, Math.PI * 2);
        c.stroke();
      });
    }

    // 4. Stamped Brand Logo & Custom Laser Engraving
    const stampX = w * 0.375;
    const stampY = h * 0.5;

    // Detect if base color is bright or dark for contrast
    const isBrightBase = ['#ffffff', '#f8fafc', '#f5f5f4', '#fbbf24', '#86efac', '#4ade80'].includes(
      baseColor.toLowerCase()
    );
    const stampColor = isBrightBase ? '#18181b' : '#ffffff';
    const subColor = isBrightBase ? '#52525b' : '#ff5722';

    ctx.save();
    ctx.font = '900 46px "Bebas Neue", Anton, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = stampColor;
    ctx.fillText('TUKU LAB', stampX, stampY - 18);

    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = subColor;
    ctx.fillText('CUSTOM EDITION 29.5', stampX, stampY + 16);

    // Custom Laser Engraved Text
    if (config.laserText && config.laserText.trim()) {
      ctx.font = '800 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = stampColor;
      ctx.fillText(config.laserText.trim().toUpperCase(), stampX, stampY + 36);
    }
    ctx.restore();

    // Stamped indentation on bump map
    bumpCtx.save();
    bumpCtx.font = '900 46px "Bebas Neue", Anton, sans-serif';
    bumpCtx.textAlign = 'center';
    bumpCtx.textBaseline = 'middle';
    bumpCtx.fillStyle = '#ffffff';
    bumpCtx.fillText('TUKU LAB', stampX, stampY - 18);

    bumpCtx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    bumpCtx.fillText('CUSTOM EDITION 29.5', stampX, stampY + 16);

    if (config.laserText && config.laserText.trim()) {
      bumpCtx.font = '800 15px "Plus Jakarta Sans", sans-serif';
      bumpCtx.fillText(config.laserText.trim().toUpperCase(), stampX, stampY + 36);
    }
    bumpCtx.restore();
  }

  const diffTex = new CanvasTexture(canvas);
  diffTex.wrapS = RepeatWrapping;
  diffTex.wrapT = RepeatWrapping;
  diffTex.needsUpdate = true;

  const bumpTex = new CanvasTexture(bumpCanvas);
  bumpTex.wrapS = RepeatWrapping;
  bumpTex.wrapT = RepeatWrapping;
  bumpTex.needsUpdate = true;

  const result: TexturesResult = { diffuseTexture: diffTex, bumpTexture: bumpTex };
  textureCache.set(cacheKey, result);
  return result;
}

export function getBasketballTextures(edition: BallEdition = 'nebula'): TexturesResult {
  const cached = textureCache.get(edition);
  if (cached) return cached;

  // 1. Diffuse Color Texture
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // 2. Bump Map Canvas
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 2048;
  bumpCanvas.height = 1024;
  const bumpCtx = bumpCanvas.getContext('2d');

  if (ctx && bumpCtx) {
    const w = canvas.width;
    const h = canvas.height;

    // Color scheme based on edition
    let baseColor = '#0f52ba';
    let channelColor = '#00e5ff';
    let secondaryChannelColor = '#e0f7fa';

    if (edition === 'nebula') {
      baseColor = '#1055c8';
      channelColor = '#00d4ff';
      secondaryChannelColor = '#ffffff';
    } else if (edition === 'fuego') {
      baseColor = '#d94819';
      channelColor = '#171717';
      secondaryChannelColor = '#262626';
    } else if (edition === 'oro') {
      baseColor = '#f5f5f4';
      channelColor = '#d97706';
      secondaryChannelColor = '#fbbf24';
    } else if (edition === 'metal') {
      baseColor = '#24272e';
      channelColor = '#475569';
      secondaryChannelColor = '#94a3b8';
    }

    // Fill background
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);

    bumpCtx.fillStyle = '#808080';
    bumpCtx.fillRect(0, 0, w, h);

    // Add rich pebbled leather grain with high-frequency tactile points
    const grainCount = 38000;
    for (let i = 0; i < grainCount; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const radius = Math.random() * 2.2 + 0.8;

      if (edition === 'nebula') {
        const rand = Math.random();
        if (rand > 0.94) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        } else if (rand > 0.8) {
          ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
        } else {
          ctx.fillStyle = rand > 0.4 ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.08)';
        }
      } else {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Pebbled bump
      bumpCtx.fillStyle = Math.random() > 0.5 ? '#9e9e9e' : '#626262';
      bumpCtx.beginPath();
      bumpCtx.arc(x, y, radius, 0, Math.PI * 2);
      bumpCtx.fill();
    }

    // Draw Basketball Seams / Channels
    const drawChannel = (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      width: number,
      curveOffset = 0
    ) => {
      [ctx, bumpCtx].forEach((c, idx) => {
        if (!c) return;
        c.strokeStyle = idx === 0 ? channelColor : '#000000';
        c.lineWidth = width;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(startX, startY);
        if (curveOffset !== 0) {
          c.quadraticCurveTo((startX + endX) / 2 + curveOffset, (startY + endY) / 2, endX, endY);
        } else {
          c.lineTo(endX, endY);
        }
        c.stroke();
      });

      if ((edition === 'nebula' || edition === 'oro') && ctx) {
        ctx.strokeStyle = secondaryChannelColor;
        ctx.lineWidth = Math.max(2, width * 0.28);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        if (curveOffset !== 0) {
          ctx.quadraticCurveTo((startX + endX) / 2 + curveOffset, (startY + endY) / 2, endX, endY);
        } else {
          ctx.lineTo(endX, endY);
        }
        ctx.stroke();
      }
    };

    // 1. Horizontal equator seam
    drawChannel(0, h * 0.5, w, h * 0.5, 14);

    // 2. Vertical quadrant seams
    drawChannel(w * 0.25, 0, w * 0.25, h, 14);
    drawChannel(w * 0.5, 0, w * 0.5, h, 14);
    drawChannel(w * 0.75, 0, w * 0.75, h, 14);

    // 3. Curved panel ribs
    for (let panel = 0; panel < 4; panel++) {
      const cx = (w / 4) * panel + (w / 8);

      [ctx, bumpCtx].forEach((c, idx) => {
        if (!c) return;
        c.strokeStyle = idx === 0 ? channelColor : '#000000';
        c.lineWidth = 14;
        c.beginPath();
        c.ellipse(cx, h * 0.5, w * 0.08, h * 0.38, 0, 0, Math.PI * 2);
        c.stroke();
      });

      if ((edition === 'nebula' || edition === 'oro') && ctx) {
        ctx.strokeStyle = secondaryChannelColor;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(cx, h * 0.5, w * 0.08, h * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 4. Stamped TUKU Brand Logo on front panel
    const stampX = w * 0.375;
    const stampY = h * 0.5;

    ctx.save();
    ctx.font = '900 64px "Bebas Neue", Anton, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle =
      edition === 'oro'
        ? '#ffffff'
        : edition === 'fuego'
        ? '#18181b'
        : edition === 'metal'
        ? '#f1f5f9'
        : '#ffffff';
    ctx.fillText('TUKU', stampX, stampY - 20);

    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle =
      edition === 'oro'
        ? '#d97706'
        : edition === 'fuego'
        ? '#27272a'
        : edition === 'metal'
        ? '#94a3b8'
        : '#00d4ff';
    ctx.fillText('OFICIAL 29.5', stampX, stampY + 28);
    ctx.restore();

    // Stamped indentation on bump map
    bumpCtx.save();
    bumpCtx.font = '900 64px "Bebas Neue", Anton, sans-serif';
    bumpCtx.textAlign = 'center';
    bumpCtx.textBaseline = 'middle';
    bumpCtx.fillStyle = '#ffffff';
    bumpCtx.fillText('TUKU', stampX, stampY - 20);
    bumpCtx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    bumpCtx.fillText('OFICIAL 29.5', stampX, stampY + 28);
    bumpCtx.restore();
  }

  const diffTex = new CanvasTexture(canvas);
  diffTex.wrapS = RepeatWrapping;
  diffTex.wrapT = RepeatWrapping;
  diffTex.needsUpdate = true;

  const bumpTex = new CanvasTexture(bumpCanvas);
  bumpTex.wrapS = RepeatWrapping;
  bumpTex.wrapT = RepeatWrapping;
  bumpTex.needsUpdate = true;

  const result: TexturesResult = { diffuseTexture: diffTex, bumpTexture: bumpTex };
  textureCache.set(edition, result);
  return result;
}
