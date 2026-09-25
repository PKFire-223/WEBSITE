import { SubmarineSkinId } from '../../../types/typingShark';
import { SUBMARINE_SKINS } from '../../../data/typingSkills';

export function drawSubmarineWithSkin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  skinId: SubmarineSkinId,
  shield: number,
  isInvincible: boolean,
  wingmanCount: number
) {
  const skin = SUBMARINE_SKINS[skinId] || SUBMARINE_SKINS.nautilus;

  ctx.save();
  ctx.translate(x, y);

  // 1. Headlight beam
  const beamGrad = ctx.createRadialGradient(40, 0, 5, 260, 0, 240);
  beamGrad.addColorStop(0, `${skin.glowColor}55`);
  beamGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(35, -10);
  ctx.lineTo(260, -75);
  ctx.lineTo(260, 75);
  ctx.lineTo(35, 10);
  ctx.closePath();
  ctx.fill();

  // 2. Shield Bubble
  if (shield > 0 || isInvincible) {
    ctx.save();
    const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.05;
    ctx.strokeStyle = isInvincible ? '#fde047' : skin.glowColor;
    ctx.lineWidth = isInvincible ? 3.5 : 2.5;
    ctx.shadowColor = isInvincible ? '#eab308' : skin.glowColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(0, 0, 50 * pulse, 36 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = isInvincible ? 'rgba(250, 204, 21, 0.15)' : `${skin.glowColor}18`;
    ctx.fill();
    ctx.restore();
  }

  // 3. Submarine Hull according to Skin
  ctx.fillStyle = skin.bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 38, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = skin.trimColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Conning Tower / Cockpit Dome
  ctx.fillStyle = skin.trimColor;
  ctx.fillRect(-10, -28, 18, 12);
  ctx.fillRect(-4, -34, 6, 8);

  // Cockpit Window (Glowing)
  ctx.fillStyle = skin.glowColor;
  ctx.shadowColor = skin.glowColor;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(16, -2, 7, 0, Math.PI * 2);
  ctx.fill();

  // Decorative Skin Accents
  if (skinId === 'megalodon_armor') {
    // Shark dorsal blade & sharp teeth nose
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(30, -5);
    ctx.lineTo(44, 0);
    ctx.lineTo(30, 5);
    ctx.closePath();
    ctx.fill();
  } else if (skinId === 'dragon_azure') {
    // Frost crystal horns
    ctx.strokeStyle = '#a5f3fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -28);
    ctx.lineTo(-14, -38);
    ctx.stroke();
  } else if (skinId === 'void_leviathan') {
    // Cosmic Orbiting Ring
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    const ringAngle = Date.now() * 0.003;
    ctx.beginPath();
    ctx.ellipse(0, 0, 44, 12, ringAngle, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Propeller at the rear
  ctx.fillStyle = '#94a3b8';
  const propAngle = (Date.now() * 0.02) % (Math.PI * 2);
  ctx.save();
  ctx.translate(-40, 0);
  ctx.rotate(propAngle);
  ctx.fillRect(-2, -11, 4, 22);
  ctx.restore();

  ctx.restore();

  // 4. Draw Support Wingman Mini-Subs if unlocked
  if (wingmanCount > 0) {
    for (let i = 0; i < Math.min(3, wingmanCount); i++) {
      ctx.save();
      const angle = (Date.now() * 0.002) + (i * Math.PI * 2) / 3;
      const wx = x + Math.cos(angle) * 45;
      const wy = y + Math.sin(angle) * 32;
      ctx.translate(wx, wy);

      ctx.fillStyle = skin.trimColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = skin.glowColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mini eye
      ctx.fillStyle = skin.glowColor;
      ctx.beginPath();
      ctx.arc(6, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
