/**
 * Interactive SVG 30x60m Ice Hockey Rink Component
 * Renders official markings, goal creases, face-off spots,
 * measurement points with color thresholds, and active point indicator.
 * Fully localized zone titles and point labels.
 */

import React from 'react';
import { PointLocation, ThicknessThresholds } from '../types';
import { getPointColor } from '../services/exportImage';
import { useLanguage } from '../i18n/LanguageContext';

interface HockeyRinkProps {
  points: PointLocation[];
  measurements: Record<number, number>;
  activePointNumber: number | null;
  onSelectPoint: (pointNumber: number) => void;
  onOpenManualInput?: (pointNumber: number) => void;
  thresholds: ThicknessThresholds;
  editMode?: boolean;
  onUpdatePointCoords?: (pointId: string, x: number, y: number) => void;
}

export const HockeyRink: React.FC<HockeyRinkProps> = ({
  points,
  measurements,
  activePointNumber,
  onSelectPoint,
  onOpenManualInput,
  thresholds,
  editMode = false,
  onUpdatePointCoords,
}) => {
  const { t, lang } = useLanguage();

  // Rink geometry in meters (Width: 60m, Height: 30m)
  // Scale viewBox to 600 x 300 for crisp SVG rendering
  const toSvgX = (m: number) => (m / 60) * 600;
  const toSvgY = (m: number) => (m / 30) * 300;

  // Handle click on rink in edit mode
  const handleRinkClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!editMode || !onUpdatePointCoords || activePointNumber === null) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 60;
    const clickY = ((e.clientY - rect.top) / rect.height) * 30;

    const activePoint = points.find((p) => p.number === activePointNumber);
    if (activePoint) {
      onUpdatePointCoords(
        activePoint.id,
        Math.round(Math.max(1, Math.min(59, clickX)) * 10) / 10,
        Math.round(Math.max(1, Math.min(29, clickY)) * 10) / 10
      );
    }
  };

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox="0 0 600 300"
        className="w-full h-auto drop-shadow-md cursor-pointer transition-all"
        onClick={handleRinkClick}
        style={{ touchAction: 'manipulation' }}
      >
        <defs>
          {/* Subtle ice gradient */}
          <linearGradient id="iceSurface" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="50%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>

          {/* Filter for glow / shadows */}
          <filter id="pointShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* --- ICE SURFACE & BOARDS --- */}
        {/* Rink outline with rounded corners (r = 8.5m -> 85 in SVG units) */}
        <clipPath id="rinkClip">
          <rect x="0" y="0" width="600" height="300" rx="85" ry="85" />
        </clipPath>

        {/* Ice surface within rounded boards */}
        <g clipPath="url(#rinkClip)">
          <rect x="0" y="0" width="600" height="300" fill="url(#iceSurface)" />

          {/* Subtle ice scraping lines */}
          <line x1="0" y1="50" x2="600" y2="50" stroke="#bae6fd" strokeWidth="0.5" strokeOpacity="0.5" />
          <line x1="0" y1="100" x2="600" y2="100" stroke="#bae6fd" strokeWidth="0.5" strokeOpacity="0.5" />
          <line x1="0" y1="150" x2="600" y2="150" stroke="#bae6fd" strokeWidth="0.5" strokeOpacity="0.5" />
          <line x1="0" y1="200" x2="600" y2="200" stroke="#bae6fd" strokeWidth="0.5" strokeOpacity="0.5" />
          <line x1="0" y1="250" x2="600" y2="250" stroke="#bae6fd" strokeWidth="0.5" strokeOpacity="0.5" />

          {/* Goal lines (red, 4m from boards -> 40 and 560) */}
          <line x1="40" y1="0" x2="40" y2="300" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="560" y1="0" x2="560" y2="300" stroke="#ef4444" strokeWidth="2.5" />

          {/* Blue lines (22.86m from boards -> ~228.6 and 371.4) */}
          <line x1="228.6" y1="0" x2="228.6" y2="300" stroke="#2563eb" strokeWidth="6" />
          <line x1="371.4" y1="0" x2="371.4" y2="300" stroke="#2563eb" strokeWidth="6" />

          {/* Center red line (at 300) */}
          <line x1="300" y1="0" x2="300" y2="300" stroke="#dc2626" strokeWidth="6" />
          <line
            x1="300"
            y1="0"
            x2="300"
            y2="300"
            stroke="#ffffff"
            strokeWidth="3"
            strokeDasharray="4 6"
          />

          {/* Center Circle (radius 4.5m -> 45 in SVG) */}
          <circle cx="300" cy="150" r="45" stroke="#2563eb" strokeWidth="2.5" fill="none" />
          <circle cx="300" cy="150" r="3" fill="#2563eb" />

          {/* End-Zone Face-Off Circles (4 circles, radius 4.5m -> 45) */}
          {[100, 500].map((fx) =>
            [85, 215].map((fy) => (
              <g key={`faceoff-${fx}-${fy}`}>
                <circle cx={fx} cy={fy} r="45" stroke="#dc2626" strokeWidth="2" fill="none" />
                <circle cx={fx} cy={fy} r="3" fill="#dc2626" />
                <line x1={fx - 45} y1={fy - 6} x2={fx - 45} y2={fy + 6} stroke="#dc2626" strokeWidth="1.5" />
                <line x1={fx + 45} y1={fy - 6} x2={fx + 45} y2={fy + 6} stroke="#dc2626" strokeWidth="1.5" />
                <line x1={fx - 15} y1={fy - 9} x2={fx - 9} y2={fy - 9} stroke="#dc2626" strokeWidth="1.2" />
                <line x1={fx - 9} y1={fy - 9} x2={fx - 9} y2={fy - 15} stroke="#dc2626" strokeWidth="1.2" />
                <line x1={fx + 15} y1={fy - 9} x2={fx + 9} y2={fy - 9} stroke="#dc2626" strokeWidth="1.2" />
                <line x1={fx + 9} y1={fy - 9} x2={fx + 9} y2={fy - 15} stroke="#dc2626" strokeWidth="1.2" />
              </g>
            ))
          )}

          {/* Neutral Zone Face-Off Dots (4 red dots at x: 250, 350; y: 85, 215) */}
          {[250, 350].map((nx) =>
            [85, 215].map((ny) => (
              <circle key={`neutral-dot-${nx}-${ny}`} cx={nx} cy={ny} r="3" fill="#dc2626" />
            ))
          )}

          {/* Goal Creases */}
          <path
            d="M 40,132 A 18 18 0 0 1 40,168 Z"
            fill="rgba(186, 230, 253, 0.7)"
            stroke="#dc2626"
            strokeWidth="2"
          />
          <path
            d="M 560,132 A 18 18 0 0 0 560,168 Z"
            fill="rgba(186, 230, 253, 0.7)"
            stroke="#dc2626"
            strokeWidth="2"
          />

          {/* Goal Nets */}
          <rect x="28" y="141" width="12" height="18" fill="#dc2626" rx="1" />
          <rect x="560" y="141" width="12" height="18" fill="#dc2626" rx="1" />
        </g>

        {/* Boards (Outer frame) */}
        <rect
          x="1.5"
          y="1.5"
          width="597"
          height="297"
          rx="84"
          ry="84"
          fill="none"
          stroke="#0284c7"
          strokeWidth="4"
        />

        {/* Yellow kickplate accent */}
        <rect
          x="4"
          y="4"
          width="592"
          height="292"
          rx="82"
          ry="82"
          fill="none"
          stroke="#facc15"
          strokeWidth="1.5"
        />

        {/* Zone Labels */}
        <text x="120" y="285" fill="#94a3b8" fontSize="9" fontWeight="600" letterSpacing="1">
          {t.defendingZone.toUpperCase()}
        </text>
        <text x="260" y="285" fill="#94a3b8" fontSize="9" fontWeight="600" letterSpacing="1">
          {t.neutralZone.toUpperCase()}
        </text>
        <text x="420" y="285" fill="#94a3b8" fontSize="9" fontWeight="600" letterSpacing="1">
          {t.attackingZone.toUpperCase()}
        </text>

        {/* --- MEASUREMENT POINTS --- */}
        {points.map((p) => {
          const sx = toSvgX(p.x);
          const sy = toSvgY(p.y);
          const pointNum = Number(p.number);
          const val = measurements[pointNum];
          const isActive = pointNum === Number(activePointNumber);
          const colorInfo = getPointColor(val, thresholds, lang);
          const isMeasured = val !== undefined && val !== null;

          return (
            <g
              key={`point-${p.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPoint(pointNum);
                if (!editMode) {
                  onOpenManualInput?.(pointNum);
                }
              }}
              className="cursor-pointer group select-none"
              filter="url(#pointShadow)"
            >
              {/* Active Point Static Accent Ring (No flying or spinning animations) */}
              {isActive && (
                <circle
                  cx={sx}
                  cy={sy}
                  r="13.5"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  opacity="0.95"
                />
              )}

              {/* Point Circle */}
              <circle
                cx={sx}
                cy={sy}
                r={isActive ? 10 : 8}
                fill={colorInfo.border}
                stroke={isActive ? '#38bdf8' : '#ffffff'}
                strokeWidth={isActive ? 2.5 : 1.5}
                className="transition-colors group-hover:stroke-sky-400"
              />
              <circle
                cx={sx}
                cy={sy}
                r={isActive ? 8 : 6.5}
                fill={colorInfo.bg}
              />

              {/* Point Number */}
              <text
                x={sx}
                y={sy + 0.5}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isActive ? '7.5' : '6.5'}
                fontWeight="800"
                fill={colorInfo.text}
              >
                {p.number}
              </text>

              {/* Value Plaque (Compact) */}
              <g
                transform={`translate(${sx}, ${
                  sy > 260 ? sy - 17 : sy + 15
                })`}
              >
                <rect
                  x="-18"
                  y="-6.5"
                  width="36"
                  height="13"
                  rx="3"
                  fill="#0f172a"
                  fillOpacity={isActive ? '0.98' : '0.85'}
                  stroke={isActive ? '#38bdf8' : colorInfo.border}
                  strokeWidth={isActive ? '1.5' : '0.5'}
                  className="transition-all group-hover:stroke-sky-400 group-hover:fill-slate-900"
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="6.5"
                  fontWeight="700"
                  fill={isMeasured ? '#ffffff' : '#94a3b8'}
                >
                  {isMeasured ? `${val.toFixed(1)}` : `№${p.number}`}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
