import { WordTarget, BossState } from '../../../types/typingShark';

export function drawMonsterShape(ctx: CanvasRenderingContext2D, target: WordTarget) {
  ctx.save();
  ctx.translate(target.x, target.y);

  if (target.type === 'ghost_shark') {
    ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.005) * 0.25;
  }

  // Draw Specific Fish / Monster Variant
  switch (target.type) {
    case 'piranha': {
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      // Sharp teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-12, -2, 3, 4);
      // Tail
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(22, -6 + target.tailAngle * 4);
      ctx.lineTo(22, 6 + target.tailAngle * 4);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'hammerhead': {
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // Hammerhead T-bar
      ctx.fillRect(-22, -14, 8, 28);
      // Tail
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(32, -10 + target.tailAngle * 6);
      ctx.lineTo(32, 10 + target.tailAngle * 6);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'pufferfish': {
      // Pufferfish puffs up when near
      const scale = target.pufferScale || 1.0;
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.arc(0, 0, 15 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Spikes
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 15 * scale, Math.sin(a) * 15 * scale);
        ctx.lineTo(Math.cos(a) * 22 * scale, Math.sin(a) * 22 * scale);
        ctx.stroke();
      }
      break;
    }

    case 'mine': {
      // Spiky naval mine
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Blinking red beacon
      ctx.fillStyle = Math.sin(Date.now() * 0.01) > 0 ? '#fef08a' : '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'squid': {
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.ellipse(-4, 0, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tentacles
      ctx.strokeStyle = target.color;
      ctx.lineWidth = 2;
      for (let i = -6; i <= 6; i += 4) {
        ctx.beginPath();
        ctx.moveTo(10, i);
        ctx.quadraticCurveTo(20, i + target.tailAngle * 5, 28, i);
        ctx.stroke();
      }
      break;
    }

    case 'eel': {
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.quadraticCurveTo(0, target.tailAngle * 9, 20, 0);
      ctx.strokeStyle = target.color;
      ctx.lineWidth = 8;
      ctx.stroke();
      break;
    }

    case 'stingray': {
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(0, -16 + target.tailAngle * 3);
      ctx.lineTo(16, 0);
      ctx.lineTo(0, 16 - target.tailAngle * 3);
      ctx.closePath();
      ctx.fill();
      // Tail whip
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(34, target.tailAngle * 6);
      ctx.stroke();
      break;
    }

    case 'jellyfish': {
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.arc(0, -4, 16, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      // Trailing tentacles
      ctx.strokeStyle = target.color;
      ctx.lineWidth = 1.5;
      for (let i = -10; i <= 10; i += 5) {
        ctx.beginPath();
        ctx.moveTo(i, -2);
        ctx.lineTo(i + Math.sin(Date.now() * 0.008 + i) * 5, 18);
        ctx.stroke();
      }
      break;
    }

    case 'crab': {
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // Pincers
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-18, -12, 6, 8);
      ctx.fillRect(-18, 4, 6, 8);
      break;
    }

    case 'swordfish': {
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      // Long Sharp Bill
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-42, 0);
      ctx.lineTo(-20, 2);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'anglerfish': {
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dangling light
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, -12);
      ctx.quadraticCurveTo(-22, -24, -28, -14);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-28, -14, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'mantis_shrimp': {
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // Punching clubs
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(-16, 2, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'sea_dragon': {
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dragon spine frills
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-15, -12);
      ctx.lineTo(-5, -20);
      ctx.lineTo(5, -12);
      ctx.stroke();
      break;
    }

    case 'barrel': {
      // Mystery Wooden Treasure Barrel
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(-16, -14, 32, 28, 6);
      ctx.fill();
      // Gold rims & sparkling glow
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-14, -6, 28, 12);
      // Mystery Question Mark
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('🎁', 0, 5);
      break;
    }

    case 'elite_miniboss': {
      // Golden Ring Elite Aura
      const pulse = 1 + Math.sin(Date.now() * 0.006) * 0.1;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 28 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Colossal mutant orca body
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 32, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(-8, 5, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    default: {
      // Standard Shark
      ctx.fillStyle = target.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dorsal Fin
      ctx.beginPath();
      ctx.moveTo(-2, -9);
      ctx.lineTo(4, -18);
      ctx.lineTo(10, -9);
      ctx.closePath();
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(28, -9 + target.tailAngle * 5);
      ctx.lineTo(28, 9 + target.tailAngle * 5);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

export function drawWordBadge(
  ctx: CanvasRenderingContext2D,
  target: WordTarget,
  isLocked: boolean
) {
  ctx.save();
  const badgeX = target.x;
  const badgeY = target.y - (target.isElite ? 42 : target.type === 'barrel' ? 32 : 28);

  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  const textWidth = ctx.measureText(target.word).width;
  const badgeW = textWidth + 18;
  const badgeH = 24;

  const isBarrel = target.type === 'barrel';
  const isElite = target.isElite;

  // Background Plate
  if (isBarrel) {
    ctx.fillStyle = 'rgba(120, 53, 15, 0.92)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
  } else if (isElite) {
    ctx.fillStyle = 'rgba(69, 10, 10, 0.95)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
  } else {
    ctx.fillStyle = isLocked ? 'rgba(8, 47, 73, 0.94)' : 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = isLocked ? '#22d3ee' : '#334155';
    ctx.lineWidth = isLocked ? 2 : 1;
  }

  if (isLocked) {
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
  }

  ctx.beginPath();
  ctx.roundRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 6);
  ctx.fill();
  ctx.stroke();

  // Draw Letters
  let currentX = badgeX - textWidth / 2;
  for (let i = 0; i < target.word.length; i++) {
    const char = target.word[i];
    const charWidth = ctx.measureText(char).width;

    if (i < target.typedIndex) {
      ctx.fillStyle = '#34d399'; // Emerald for typed
    } else if (i === target.typedIndex && isLocked) {
      ctx.fillStyle = '#fef08a'; // Golden highlight next char
    } else {
      ctx.fillStyle = isBarrel ? '#fef08a' : '#f8fafc';
    }

    ctx.fillText(char, currentX, badgeY + 5);
    currentX += charWidth;
  }

  // Crosshair
  if (isLocked) {
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawBossEntity(ctx: CanvasRenderingContext2D, currentBoss: BossState) {
  ctx.save();
  ctx.translate(currentBoss.x, currentBoss.y);

  const pulse = 1 + Math.sin(Date.now() * 0.004) * 0.04;

  if (currentBoss.bossId === 'megalodon') {
    // Ancient Megalodon (Red & Bloodthirsty)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 78 * pulse, 40 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Giant Teeth
    ctx.fillStyle = '#ffffff';
    for (let t = -30; t <= 5; t += 7) {
      ctx.fillRect(-58, t, 6, 4);
    }
  } else if (currentBoss.bossId === 'kraken') {
    // Abyssal Kraken (Purple Void)
    ctx.fillStyle = '#581c87';
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 68 * pulse, 46 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyeball
    ctx.fillStyle = '#e879f9';
    ctx.beginPath();
    ctx.arc(-20, 0, 16, 0, Math.PI * 2);
    ctx.fill();
  } else if (currentBoss.bossId === 'dragon') {
    // Ice Dragon (Glacial Azure)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 82 * pulse, 44 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ice Horns
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-35, -28);
    ctx.lineTo(-58, -55);
    ctx.stroke();
  } else if (currentBoss.bossId === 'behemoth') {
    // Poseidon Mech Titan (Gold & Thunder)
    ctx.fillStyle = '#312e81';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 88 * pulse, 48 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cannon Turret
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-65, -8, 24, 16);
  } else {
    // Leviathan Prime Sovereign (Minute 25 Boss - Void Cosmic)
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 95 * pulse, 54 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cosmic Orbiting Singularity Rings
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 78, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  // Boss Health Bar & Word Plates
  ctx.save();
  const hpBarW = 260;
  const hpBarH = 14;
  const hpBarX = currentBoss.x - hpBarW / 2;
  const hpBarY = currentBoss.y - 95;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);

  const hpPercent = Math.max(0, currentBoss.currentHp / currentBoss.maxHp);
  ctx.fillStyle = hpPercent > 0.4 ? '#ef4444' : '#f97316';
  ctx.fillRect(hpBarX, hpBarY, hpBarW * hpPercent, hpBarH);

  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${currentBoss.name} (${currentBoss.currentHp}/${currentBoss.maxHp} HP)`,
    currentBoss.x,
    hpBarY - 6
  );

  // Active Words
  currentBoss.activeWords.forEach((bw) => {
    const wx = currentBoss.x + bw.offsetX;
    const wy = currentBoss.y + bw.offsetY;

    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    const wWidth = ctx.measureText(bw.word).width;
    const bW = wWidth + 18;
    const bH = 24;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(wx - bW / 2, wy - bH / 2, bW, bH, 6);
    ctx.fill();
    ctx.stroke();

    let drawX = wx - wWidth / 2;
    for (let i = 0; i < bw.word.length; i++) {
      const char = bw.word[i];
      const cWidth = ctx.measureText(char).width;
      ctx.fillStyle = i < bw.typedIndex ? '#34d399' : '#ffffff';
      ctx.fillText(char, drawX, wy + 5);
      drawX += cWidth;
    }
  });

  ctx.restore();
}
