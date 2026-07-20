"use client";

import { useEffect, useMemo, useRef } from "react";
import type { TrajectoryEntry } from "./trajectory";

const WIDTH = 720;
const LEFT = 48;
const RIGHT = 700;
const HP_TOP = 32;
const HP_BOTTOM = 124;
const DELTA_BASELINE = 196;
const DELTA_SPAN = 48;
const SP_TOP = 238;
const SP_BOTTOM = 282;

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function xAt(index: number, count: number) {
  if (count <= 1) return RIGHT;
  return LEFT + (index / (count - 1)) * (RIGHT - LEFT);
}

function hpY(value: number) {
  return HP_BOTTOM - (value / 100) * (HP_BOTTOM - HP_TOP);
}

function spY(value: number) {
  return SP_BOTTOM - (value / 5) * (SP_BOTTOM - SP_TOP);
}

export default function HudTrajectoryChart({ entries }: { entries: TrajectoryEntry[] }) {
  const visible = useMemo(() => entries.slice(-10), [entries]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const deltaExtent = Math.max(10, ...visible.map((entry) => Math.abs(entry.hpDelta)));
  const hpPoints = visible.map((entry, index) => `${xAt(index, visible.length)},${hpY(entry.hp)}`).join(" ");
  const spPoints = visible.map((entry, index) => `${xAt(index, visible.length)},${spY(entry.sp)}`).join(" ");
  const current = visible.at(-1);

  useEffect(() => {
    const frame = scrollRef.current;
    if (frame) frame.scrollLeft = frame.scrollWidth;
  }, [visible.length]);

  return (
    <article className="trail-card instrument-panel">
      <div className="panel-heading hud-trajectory-heading">
        <span>HP / SP 航跡</span>
        <div className="hud-trajectory-legend" aria-label="グラフ凡例">
          <span><i className="legend hp" />HP CURRENT</span>
          <span><i className="legend delta" />HP DELTA</span>
          <span><i className="legend sp" />SP TRACK</span>
        </div>
      </div>
      <div ref={scrollRef} className="hud-trajectory-scroll">
        <svg className="hud-trajectory-chart" viewBox={`0 0 ${WIDTH} 326`} role="img" aria-label="既存アクションログによるHP現在値、HP変動量、SP推移">
          <defs>
            <linearGradient id="hudHpGlow" x1="0" x2="1"><stop stopColor="#73d2de"/><stop offset="1" stopColor="#a8f0d0"/></linearGradient>
          </defs>

          <text x="4" y="20" className="hud-track-title">HP CURRENT</text>
          {[0, 50, 100].map((tick) => {
            const y = hpY(tick);
            return <g key={`hp-${tick}`}><line x1={LEFT} x2={RIGHT} y1={y} y2={y} className="hud-chart-grid"/><text x="8" y={y + 3} className="hud-axis-label">{tick}</text></g>;
          })}
          {visible.length > 1 && <polyline points={hpPoints} className="hud-hp-line" />}

          <text x="4" y="160" className="hud-track-title">HP DELTA</text>
          <line x1={LEFT} x2={RIGHT} y1={DELTA_BASELINE} y2={DELTA_BASELINE} className="hud-delta-zero" />

          <text x="4" y="230" className="hud-track-title">SP TRACK</text>
          {[0, 5].map((tick) => {
            const y = spY(tick);
            return <g key={`sp-${tick}`}><line x1={LEFT} x2={RIGHT} y1={y} y2={y} className="hud-chart-grid"/><text x="18" y={y + 3} className="hud-axis-label">{tick}</text></g>;
          })}
          {visible.length > 1 && <polyline points={spPoints} className="hud-sp-line" />}

          {visible.map((entry, index) => {
            const x = xAt(index, visible.length);
            const deltaHeight = (Math.abs(entry.hpDelta) / deltaExtent) * DELTA_SPAN;
            const deltaY = entry.hpDelta >= 0 ? DELTA_BASELINE - deltaHeight : DELTA_BASELINE;
            const assetLabel = entry.label === "SPストック" ? "資産確保" : entry.label === "SP使用" ? "資産運用" : null;
            return (
              <g key={entry.id}>
                {entry.hpDelta !== 0 && <>
                  <rect x={x - 7} y={deltaY} width="14" height={Math.max(2, deltaHeight)} className={`hud-delta-bar ${entry.hpDelta > 0 ? "positive" : "negative"}`} />
                  <text x={x} y={entry.hpDelta > 0 ? deltaY - 4 : deltaY + deltaHeight + 11} textAnchor="middle" className="hud-delta-label">{signed(entry.hpDelta)}</text>
                </>}
                <circle cx={x} cy={hpY(entry.hp)} r={index === visible.length - 1 ? 5 : 3} className={index === visible.length - 1 ? "hud-hp-point current" : "hud-hp-point"} />
                <circle cx={x} cy={spY(entry.sp)} r="3" className="hud-sp-point" />
                {assetLabel && <text x={x} y="298" textAnchor="middle" className="hud-asset-label">◆ {assetLabel}</text>}
                <text x={x} y="316" textAnchor="middle" className="hud-time-label">{entry.time}</text>
              </g>
            );
          })}

          {current && <>
            <text x={RIGHT - 8} y={Math.max(HP_TOP + 10, hpY(current.hp) - 9)} textAnchor="end" className="hud-current-value">HP {current.hp}</text>
            <text x={RIGHT - 8} y={Math.min(SP_BOTTOM - 7, spY(current.sp) - 7)} textAnchor="end" className="hud-current-sp">SP {current.sp}</text>
          </>}
        </svg>
      </div>
    </article>
  );
}
