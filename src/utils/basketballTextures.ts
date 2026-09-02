import { CanvasTexture, RepeatWrapping } from 'three';
import { BallEdition } from '../components/Basketball';

interface TexturesResult {
  diffuseTexture: CanvasTexture;
  bumpTexture: CanvasTexture;
}

const textureCache = new Map<BallEdition, TexturesResult>();

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
