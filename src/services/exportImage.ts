/**
 * High-Resolution Canvas Exporter for Ice Thickness Arena Scheme
 * Exports official PNG report with 30x60m hockey rink markings,
 * numbered measurement points, mm values, color-coded status,
 * summary statistics, and legend.
 * Supports localized labels (LV, EN, RU).
 */

import { ArenaSettings, PointLocation, SessionStatistics } from '../types';
import { translations, Language } from '../i18n/translations';

export function getPointColor(
  value: number | undefined,
  thresholds: ArenaSettings['thresholds'],
  lang: Language = 'ru'
): { bg: string; border: string; text: string; label: string } {
  const t = translations[lang] || translations.ru;

  if (value === undefined || value === null) {
    return { bg: '#e2e8f0', border: '#94a3b8', text: '#64748b', label: t.notMeasured };
  }
  if (value < thresholds.criticalMin) {
    return { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c', label: t.criticallyThin };
  }
  if (value < thresholds.warningMin) {
    return { bg: '#fef3c7', border: '#f59e0b', text: '#b45309', label: t.belowNormal };
  }
  if (value <= thresholds.warningMax) {
    return { bg: '#dcfce7', border: '#10b981', text: '#047857', label: t.optimal };
  }
  return { bg: '#e0e7ff', border: '#6366f1', text: '#4338ca', label: t.criticallyThick };
}

export function calculateStatistics(
  measurements: Record<number, number>,
  points: PointLocation[],
  thresholds: ArenaSettings['thresholds']
): SessionStatistics {
  const values: { point: number; val: number }[] = [];
  points.forEach((p) => {
    const v = measurements[p.number];
    if (v !== undefined && v !== null && !isNaN(v)) {
      values.push({ point: p.number, val: v });
    }
  });

  if (values.length === 0) {
    return {
      count: 0,
      totalPoints: points.length,
      min: null,
      minPoint: null,
      max: null,
      maxPoint: null,
      avg: null,
      delta: null,
      optimalPercentage: 0,
    };
  }

  let minVal = values[0].val;
  let minPt = values[0].point;
  let maxVal = values[0].val;
  let maxPt = values[0].point;
  let sum = 0;
  let optimalCount = 0;

  for (const item of values) {
    if (item.val < minVal) {
      minVal = item.val;
      minPt = item.point;
    }
    if (item.val > maxVal) {
      maxVal = item.val;
      maxPt = item.point;
    }
    sum += item.val;
    if (item.val >= thresholds.warningMin && item.val <= thresholds.warningMax) {
      optimalCount++;
    }
  }

  const avg = Math.round((sum / values.length) * 100) / 100;
  const delta = Math.round((maxVal - minVal) * 100) / 100;
  const optimalPercentage = Math.round((optimalCount / values.length) * 100);

  return {
    count: values.length,
    totalPoints: points.length,
    min: minVal,
    minPoint: minPt,
    max: maxVal,
    maxPoint: maxPt,
    avg,
    delta,
    optimalPercentage,
  };
}

export async function generateArenaPng(
  settings: ArenaSettings,
  points: PointLocation[],
  measurements: Record<number, number>,
  dateStr: string,
  lang: Language = 'ru'
): Promise<string> {
  const t = translations[lang] || translations.ru;
  const width = 1600;
  const height = 1100;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas 2d context');

  // Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // Top Card / Header Bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, 120);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
  ctx.fillText(settings.arenaName || 'Arena', 50, 52);

  const subHeader =
    lang === 'lv'
      ? `LEDUS BIEZUMA SHĒMA UN PROTOKOLS (30 × 60 m) • Datums: ${dateStr}`
      : lang === 'en'
      ? `ICE THICKNESS DIAGRAM & PROTOCOL (30 × 60 m) • Date: ${dateStr}`
      : `ПРОТОКОЛ И КАРТА ТОЛЩИНЫ ЛЬДА (30 × 60 м) • Дата: ${dateStr}`;

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(subHeader, 50, 90);

  // Status badge on right
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(width - 320, 30, 270, 60, 12);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.fillText(lang === 'lv' ? 'LEDUS KONTROLES SISTĒMA' : lang === 'en' ? 'ICE CONTROL SYSTEM' : 'СИСТЕМА КОНТРОЛЯ ЛЬДА', width - 300, 55);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText('Bluetooth BLE Caliper', width - 300, 75);

  // --- RINK DRAWING DIMENSIONS ---
  // Hockey rink: 60m x 30m (ratio 2:1)
  const rinkX = 70;
  const rinkY = 160;
  const rinkW = 1460;
  const rinkH = 730;
  const scale = rinkW / 60; // pixels per meter
  const cornerRadius = 8.5 * scale;

  // Ice surface background with subtle ice texture / gradient
  const iceGrad = ctx.createLinearGradient(rinkX, rinkY, rinkX, rinkY + rinkH);
  iceGrad.addColorStop(0, '#f0f9ff');
  iceGrad.addColorStop(0.5, '#e0f2fe');
  iceGrad.addColorStop(1, '#f0f9ff');

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(rinkX, rinkY, rinkW, rinkH, cornerRadius);
  ctx.clip();

  // Draw ice
  ctx.fillStyle = iceGrad;
  ctx.fillRect(rinkX, rinkY, rinkW, rinkH);

  // Ice faint grid / reflection lines
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
  ctx.lineWidth = 1;
  for (let gx = rinkX; gx <= rinkX + rinkW; gx += 40) {
    ctx.beginPath();
    ctx.moveTo(gx, rinkY);
    ctx.lineTo(gx, rinkY + rinkH);
    ctx.stroke();
  }

  // --- Official Rink Markings ---
  // Red Goal Lines (4.0m from each end)
  const goalLineLeftX = rinkX + 4.0 * scale;
  const goalLineRightX = rinkX + (60 - 4.0) * scale;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(goalLineLeftX, rinkY);
  ctx.lineTo(goalLineLeftX, rinkY + rinkH);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(goalLineRightX, rinkY);
  ctx.lineTo(goalLineRightX, rinkY + rinkH);
  ctx.stroke();

  // Blue Lines (22.86m from ends / attacking zone borders)
  const blueLeftX = rinkX + 22.86 * scale;
  const blueRightX = rinkX + (60 - 22.86) * scale;
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 6;

  ctx.beginPath();
  ctx.moveTo(blueLeftX, rinkY);
  ctx.lineTo(blueLeftX, rinkY + rinkH);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(blueRightX, rinkY);
  ctx.lineTo(blueRightX, rinkY + rinkH);
  ctx.stroke();

  // Center Red Line (at 30m) with dashed pattern
  const centerLineX = rinkX + 30 * scale;
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(centerLineX, rinkY);
  ctx.lineTo(centerLineX, rinkY + rinkH);
  ctx.stroke();

  // Center line white dashes overlay
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(centerLineX, rinkY);
  ctx.lineTo(centerLineX, rinkY + rinkH);
  ctx.stroke();
  ctx.setLineDash([]); // reset dash

  // Center Faceoff Circle (R = 4.5m) and dot (at 30m, 15m)
  const centerY = rinkY + 15 * scale;
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerLineX, centerY, 4.5 * scale, 0, Math.PI * 2);
  ctx.stroke();

  // Center Blue Spot (30cm diameter dot)
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(centerLineX, centerY, 0.45 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 4 Zone Faceoff Circles & Spots (R = 4.5m)
  // Distance from end board = 10m, from side board = 8.5m
  const zoneSpotXLeft = rinkX + 10 * scale;
  const zoneSpotXRight = rinkX + 50 * scale;
  const zoneSpotYTop = rinkY + 8.5 * scale;
  const zoneSpotYBottom = rinkY + 21.5 * scale;
  const spots = [
    { x: zoneSpotXLeft, y: zoneSpotYTop },
    { x: zoneSpotXLeft, y: zoneSpotYBottom },
    { x: zoneSpotXRight, y: zoneSpotYTop },
    { x: zoneSpotXRight, y: zoneSpotYBottom },
  ];

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2.5;
  spots.forEach((sp) => {
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 4.5 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Red spot
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 0.4 * scale, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4 Neutral Zone Faceoff Dots
  const neutralDots = [
    { x: rinkX + 25 * scale, y: zoneSpotYTop },
    { x: rinkX + 25 * scale, y: zoneSpotYBottom },
    { x: rinkX + 35 * scale, y: zoneSpotYTop },
    { x: rinkX + 35 * scale, y: zoneSpotYBottom },
  ];
  ctx.fillStyle = '#dc2626';
  neutralDots.forEach((np) => {
    ctx.beginPath();
    ctx.arc(np.x, np.y, 0.4 * scale, 0, Math.PI * 2);
    ctx.fill();
  });

  // Goal Creases (light blue semi-circle at goal line)
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2;

  // Goal crease left
  ctx.beginPath();
  ctx.arc(goalLineLeftX, centerY, 1.8 * scale, -Math.PI / 2, Math.PI / 2, false);
  ctx.fill();
  ctx.stroke();

  // Goal crease right
  ctx.beginPath();
  ctx.arc(goalLineRightX, centerY, 1.8 * scale, Math.PI / 2, -Math.PI / 2, false);
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // restore clipping

  // Boards (Dashed outer border + yellow kick-plate)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(rinkX, rinkY, rinkW, rinkH, cornerRadius);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Inner yellow kickplate
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Zone text markers in rink corners
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText(t.defendingZone.toUpperCase(), rinkX + 25, rinkY + 30);
  ctx.fillText(t.attackingZone.toUpperCase(), rinkX + rinkW - 160, rinkY + 30);
  ctx.fillText(t.neutralZone.toUpperCase(), centerLineX - 45, rinkY + 30);

  // --- DRAW MEASUREMENT POINTS & VALUES ---
  points.forEach((p) => {
    const px = rinkX + p.x * scale;
    const py = rinkY + p.y * scale;
    const val = measurements[p.number];
    const colorInfo = getPointColor(val, settings.thresholds, lang);

    // Outer circle
    const badgeR = 17;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = colorInfo.border;
    ctx.beginPath();
    ctx.arc(px, py, badgeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colorInfo.bg;
    ctx.beginPath();
    ctx.arc(px, py, badgeR - 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Point number inside circle
    ctx.fillStyle = colorInfo.text;
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${p.number}`, px, py);

    // Value label plaque above or below point
    const valueText = val !== undefined ? `${val.toFixed(2)} mm` : '—';
    const tagY = py > rinkY + rinkH - 45 ? py - 32 : py + 32;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(px - 38, tagY - 12, 76, 24, 6);
    ctx.fill();

    ctx.fillStyle = colorInfo.border;
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(valueText, px, tagY);
  });

  // --- BOTTOM STATISTICS & LEGEND BAR ---
  const stats = calculateStatistics(measurements, points, settings.thresholds);
  const bottomY = 920;

  // Stats Card
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(70, bottomY, 860, 150, 16);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Stats Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(t.statistics.toUpperCase(), 95, bottomY + 36);

  // Stats Columns
  const statItems = [
    { label: t.progress, value: `${stats.count} / ${stats.totalPoints}` },
    { label: t.average, value: stats.avg !== null ? `${stats.avg.toFixed(2)} mm` : '—' },
    { label: t.minimum, value: stats.min !== null ? `${stats.min.toFixed(2)} mm (№${stats.minPoint})` : '—' },
    { label: t.maximum, value: stats.max !== null ? `${stats.max.toFixed(2)} mm (№${stats.maxPoint})` : '—' },
    { label: t.delta, value: stats.delta !== null ? `${stats.delta.toFixed(2)} mm` : '—' },
    { label: t.optimalIce, value: `${stats.optimalPercentage}%` },
  ];

  statItems.forEach((item, idx) => {
    const colX = 95 + (idx % 3) * 260;
    const rowY = bottomY + 70 + Math.floor(idx / 3) * 45;

    ctx.fillStyle = '#64748b';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.fillText(item.label, colX, rowY);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(item.value, colX, rowY + 20);
  });

  // Legend Card
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(950, bottomY, 580, 150, 16);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
  ctx.fillText(t.legend.toUpperCase(), 975, bottomY + 36);

  const legendItems = [
    { color: '#ef4444', label: `< ${settings.thresholds.criticalMin} mm`, desc: t.criticallyThin },
    { color: '#f59e0b', label: `${settings.thresholds.criticalMin}–${settings.thresholds.warningMin} mm`, desc: t.belowNormal },
    { color: '#10b981', label: `${settings.thresholds.warningMin}–${settings.thresholds.warningMax} mm`, desc: t.optimal },
    { color: '#6366f1', label: `> ${settings.thresholds.warningMax} mm`, desc: t.criticallyThick },
  ];

  legendItems.forEach((lg, idx) => {
    const lx = 975 + (idx % 2) * 260;
    const ly = bottomY + 68 + Math.floor(idx / 2) * 40;

    ctx.fillStyle = lg.color;
    ctx.beginPath();
    ctx.arc(lx + 8, ly + 8, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText(lg.label, lx + 26, ly + 12);

    ctx.fillStyle = '#64748b';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.fillText(`(${lg.desc})`, lx + 125, ly + 12);
  });

  return canvas.toDataURL('image/png');
}
