"use client";

import { useEffect, useMemo, useState } from "react";
import {
  makeRouteCorrection,
  NAVIGATION_ROUTE_LABELS,
  ROUTE_LABELS,
  type BeaconSnapshot,
  type RouteChoice,
  type RouteCorrection,
} from "./navigation-engine";
import type { TrajectoryEntry } from "./trajectory";

const JUNCTION_MARKER_KEY = "navi-os-build-week:trajectory-junction:v1";
const TRAJECTORY_LIMIT = 8;

type JunctionRsy = { r: number; s: number; y: number };

export type JunctionCurrent = {
  hp: number;
  sp: number;
  rsy: JunctionRsy;
  z: number | null;
  fog: number;
  beacon: BeaconSnapshot;
  recent: {
    label: string;
    delta: number;
    log: string;
    kind: "recover" | "damage" | "stock" | "morning" | "night";
    time: string;
    fogNote?: string;
  };
};

type PauseDraft = {
  openedAt: string;
  flow: TrajectoryEntry[];
  current: JunctionCurrent;
  targetId: string;
};

type JunctionMarker = {
  version: 3;
  markedAt: string;
  flow: TrajectoryEntry[];
  target: TrajectoryEntry;
  current: JunctionCurrent;
  selectedRoute: RouteChoice;
  memo: string;
  baseRoute: RouteCorrection["baseRoute"];
  appliedCorrection: RouteCorrection["correction"];
  nextGuidance: RouteCorrection["nextGuidance"];
  correctionSourceActionId: string;
  subsequentAction: TrajectoryEntry | null;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function copyCurrent(current: JunctionCurrent): JunctionCurrent {
  return {
    ...current,
    rsy: { ...current.rsy },
    beacon: { ...current.beacon },
    recent: { ...current.recent },
  };
}

function isTrajectoryEntry(value: unknown): value is TrajectoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<TrajectoryEntry>;
  return typeof entry.id === "string"
    && typeof entry.observedAt === "string"
    && !Number.isNaN(Date.parse(entry.observedAt))
    && typeof entry.label === "string"
    && typeof entry.hp === "number"
    && typeof entry.hpDelta === "number"
    && typeof entry.sp === "number"
    && typeof entry.spDelta === "number"
    && typeof entry.fog === "number"
    && typeof entry.fogDelta === "number"
    && !!entry.beacon
    && typeof entry.beacon.position === "string"
    && typeof entry.beacon.baseRoute === "string"
    && Array.isArray(entry.cutIns);
}

function isMarker(value: unknown): value is JunctionMarker {
  if (!value || typeof value !== "object") return false;
  const marker = value as Partial<JunctionMarker>;
  return marker.version === 3
    && typeof marker.markedAt === "string"
    && !Number.isNaN(Date.parse(marker.markedAt))
    && Array.isArray(marker.flow)
    && marker.flow.length > 0
    && marker.flow.every(isTrajectoryEntry)
    && isTrajectoryEntry(marker.target)
    && (marker.selectedRoute === "continue" || marker.selectedRoute === "alternate" || marker.selectedRoute === "undecided")
    && typeof marker.memo === "string"
    && typeof marker.correctionSourceActionId === "string"
    && (marker.subsequentAction === null || isTrajectoryEntry(marker.subsequentAction));
}

function persistMarker(marker: JunctionMarker) {
  window.localStorage.setItem(JUNCTION_MARKER_KEY, JSON.stringify(marker));
}

function TrajectoryChart({
  flow,
  markerId,
  selectedId,
  onSelect,
}: {
  flow: TrajectoryEntry[];
  markerId?: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const width = 720;
  const startX = 44;
  const endX = 694;
  const top = 22;
  const hpBottom = 142;
  const deltaBaseline = 178;
  const points = flow.map((entry, index) => {
    const x = flow.length === 1 ? (startX + endX) / 2 : startX + (index / (flow.length - 1)) * (endX - startX);
    const y = hpBottom - (entry.hp / 100) * (hpBottom - top);
    return { entry, x, y };
  });
  const hpPath = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");

  function selectPoint(id: string) {
    if (onSelect) onSelect(id);
  }

  return (
    <div className="trajectory-chart-wrap">
      <div className="trajectory-legend"><span><i className="trajectory-hp-key" />HP</span><span><i className="trajectory-delta-key" />変動値</span><span>■ SP</span><span>FOG 0–3</span><span>◆ CUT-IN</span><span>◇ JUNCTION</span></div>
      <svg className="trajectory-chart" viewBox={`0 0 ${width} 232`} role="img" aria-label="直近アクションのHP、変動値、SP、霧、カットイン、JUNCTION軌跡">
        {[25, 50, 75, 100].map((tick) => {
          const y = hpBottom - (tick / 100) * (hpBottom - top);
          return <g key={tick}><line x1={startX} x2={endX} y1={y} y2={y} className="trajectory-grid" /><text x="4" y={y + 3} className="trajectory-axis-label">{tick}</text></g>;
        })}
        <line x1={startX} x2={endX} y1={deltaBaseline} y2={deltaBaseline} className="trajectory-zero" />
        {points.map(({ entry, x }) => {
          const barHeight = Math.min(30, Math.abs(entry.hpDelta) * 1.3);
          const y = entry.hpDelta >= 0 ? deltaBaseline - barHeight : deltaBaseline;
          const beaconChanged = flow[flow.indexOf(entry) - 1]?.beacon.baseRoute !== entry.beacon.baseRoute;
          return (
            <g key={`detail-${entry.id}`}>
              <rect x={x - 8} y={y} width="16" height={Math.max(2, barHeight)} className={entry.hpDelta < 0 ? "trajectory-delta negative" : "trajectory-delta positive"} />
              <text x={x} y={entry.hpDelta >= 0 ? y - 4 : y + barHeight + 11} textAnchor="middle" className="trajectory-delta-label">{signed(entry.hpDelta)}</text>
              <text x={x} y="206" textAnchor="middle" className="trajectory-sp-label">SP{entry.sp} / F{entry.fog}</text>
              {beaconChanged && <text x={x} y="219" textAnchor="middle" className="trajectory-beacon-label">{entry.beacon.baseRoute}</text>}
              {entry.cutIns.length > 0 && <path d={`M ${x} 9 l 7 7 -7 7 -7 -7 z`} className="trajectory-cutin-marker" />}
              {markerId === entry.id && <path d={`M ${x} ${hpBottom + 9} l 8 8 -8 8 -8 -8 z`} className="trajectory-junction-marker" />}
            </g>
          );
        })}
        <polyline points={hpPath} className="trajectory-hp-line" />
        {points.map(({ entry, x, y }) => (
          <g
            key={`point-${entry.id}`}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={onSelect ? `${entry.time} ${entry.label}を分岐地点に選ぶ` : undefined}
            className={`trajectory-point ${selectedId === entry.id ? "selected" : ""}`}
            onClick={() => selectPoint(entry.id)}
            onKeyDown={(event) => {
              if (onSelect && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                selectPoint(entry.id);
              }
            }}
          >
            <circle cx={x} cy={y} r={selectedId === entry.id ? 7 : 5} />
            <text x={x} y={y - 11} textAnchor="middle">{entry.hp}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function FlowLog({
  flow,
  markerId,
  selectedId,
  onSelect,
}: {
  flow: TrajectoryEntry[];
  markerId?: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <ol className="junction-flow-list">
      {flow.map((entry, index) => {
        const previous = flow[index - 1];
        const beaconChanged = !!previous && previous.beacon.baseRoute !== entry.beacon.baseRoute;
        const isJunction = markerId === entry.id;
        return (
          <li
            key={entry.id}
            className={`${selectedId === entry.id ? "selected" : ""} ${isJunction ? "junction-marked" : ""}`.trim()}
          >
            <button type="button" onClick={() => onSelect?.(entry.id)} disabled={!onSelect}>
              <div className="trajectory-card-head">
                <time>{entry.time}</time>
                <strong>{entry.label}</strong>
                <span className={`trajectory-hp-badge ${entry.hpDelta < 0 ? "negative" : entry.hpDelta > 0 ? "positive" : "neutral"}`}>
                  HP {signed(entry.hpDelta)}
                </span>
              </div>
              <div className="trajectory-card-metrics" aria-label={`SP ${entry.sp}、FOG ${entry.fog}`}>
                <span>SP {entry.sp} <small>{signed(entry.spDelta)}</small></span>
                <span>FOG {entry.fog} <small>{signed(entry.fogDelta)}</small></span>
              </div>
              <p className="trajectory-card-result">{entry.log}</p>
              <div className={`trajectory-card-beacon ${beaconChanged ? "changed" : "stable"}`}>
                <span>BEACON</span>
                <strong>{beaconChanged ? `${previous.beacon.baseRoute} → ${entry.beacon.baseRoute}` : entry.beacon.baseRoute}</strong>
              </div>
              {(entry.cutIns.length > 0 || isJunction) && (
                <div className="trajectory-card-markers">
                  {entry.cutIns.length > 0 && <em>◆ CUT-IN｜{entry.cutIns.join(" / ")}</em>}
                  {isJunction && <b>◇ JUNCTION｜グラフの分岐標識</b>}
                </div>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function BeaconRoutes({ beacon }: { beacon: BeaconSnapshot }) {
  const routes = [
    { ...NAVIGATION_ROUTE_LABELS.currentPosition, text: beacon.position },
    { ...NAVIGATION_ROUTE_LABELS.nextStep, text: beacon.nextStep },
    { ...NAVIGATION_ROUTE_LABELS.alternateRoute, text: beacon.alternateRoute },
  ];
  return (
    <div className="junction-routes">
      {routes.map((route) => <section key={route.label}><span>{route.label}</span><p>{route.text}</p></section>)}
    </div>
  );
}

export default function JunctionPanel({
  current,
  trajectory,
  onRouteCorrection,
}: {
  current: JunctionCurrent;
  trajectory: TrajectoryEntry[];
  onRouteCorrection: (correction: RouteCorrection) => void;
}) {
  const [draft, setDraft] = useState<PauseDraft | null>(null);
  const [marker, setMarker] = useState<JunctionMarker | null>(null);
  const [routeChoice, setRouteChoice] = useState<RouteChoice>("undecided");
  const [memo, setMemo] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("軌跡標識を確認しています。");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(JUNCTION_MARKER_KEY);
        if (!stored) {
          setNotice("流れが変わった可能性があります。少し見渡しますか？");
        } else {
          const parsed: unknown = JSON.parse(stored);
          if (isMarker(parsed)) {
            setMarker(parsed);
            setNotice("記録済みの分岐があります。REVIEWで軌跡を振り返れます。");
          } else {
            setNotice("保存された分岐を読み取れません。現在の航行はそのまま続けられます。");
          }
        }
      } catch {
        setNotice("ブラウザ内記録を利用できません。現在の航行はそのまま続けられます。");
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const latest = trajectory.at(-1);
    if (!marker || marker.subsequentAction || !latest || latest.id === "initial-course" || latest.id === marker.correctionSourceActionId) return;
    if (new Date(latest.observedAt).getTime() <= new Date(marker.markedAt).getTime()) return;
    const updated = { ...marker, subsequentAction: latest };
    const timer = window.setTimeout(() => {
      try {
        persistMarker(updated);
        setMarker(updated);
        setNotice(`JUNCTION後の「${latest.label}」を航路結果として記録しました。補正は消費済みです。`);
      } catch {
        setNotice("JUNCTION後の結果を追記できませんでした。現在の航行には影響しません。");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [marker, trajectory]);

  const selectedTarget = useMemo(() => draft?.flow.find((entry) => entry.id === draft.targetId) ?? null, [draft]);

  function openLogPause() {
    const flow = trajectory.slice(-TRAJECTORY_LIMIT);
    const targetId = flow.at(-1)?.id ?? "";
    setDraft({ openedAt: new Date().toISOString(), flow, current: copyCurrent(current), targetId });
    setRouteChoice("undecided");
    setMemo("");
    setReviewOpen(false);
    setNotice("現在状態は変えず、直近の軌跡だけを開きました。分岐地点は利用者が選べます。");
  }

  function dismiss() {
    setDraft(null);
    setReviewOpen(false);
    setNotice("現在の航行へ戻りました。観測値は変更していません。");
  }

  function markJunction() {
    if (!draft || !selectedTarget) return;
    const correctionSourceActionId = draft.flow.at(-1)?.id ?? selectedTarget.id;
    const correction = makeRouteCorrection({
      choice: routeChoice,
      baseRoute: draft.current.beacon.baseRoute,
      sourceActionId: correctionSourceActionId,
      hp: draft.current.hp,
      fog: draft.current.fog,
      rsy: draft.current.rsy,
      z: draft.current.z,
    });
    const next: JunctionMarker = {
      version: 3,
      markedAt: new Date().toISOString(),
      flow: draft.flow,
      target: selectedTarget,
      current: copyCurrent(draft.current),
      selectedRoute: routeChoice,
      memo: memo.trim().slice(0, 80),
      baseRoute: correction.baseRoute,
      appliedCorrection: correction.correction,
      nextGuidance: correction.nextGuidance,
      correctionSourceActionId,
      subsequentAction: null,
    };

    try {
      persistMarker(next);
      setMarker(next);
      setDraft(null);
      onRouteCorrection(correction);
      setNotice(`JUNCTIONを記録しました。「${ROUTE_LABELS[routeChoice]}」を次のBeaconへ一時反映します。`);
    } catch {
      setNotice("JUNCTIONを記録できませんでした。現在状態は変更していません。");
    }
  }

  function openReview() {
    if (!marker) return;
    setDraft(null);
    setReviewOpen(true);
    setNotice("記録した分岐を表示しています。過去状態の復元は行いません。");
  }

  return (
    <article className="junction-console instrument-panel" aria-labelledby="junction-title">
      <header className="junction-heading">
        <div>
          <span className="panel-label">TRAJECTORY LOG / JUNCTION MARKER v1</span>
          <h2 id="junction-title">軌跡を読む。分岐は自分で記す。</h2>
        </div>
        <div className={`junction-status ${marker ? "junction-active" : ""}`}>
          <i aria-hidden="true" />
          {marker ? `MARKED ${formatDateTime(marker.markedAt)}` : ready ? "NO MARKER" : "SCANNING"}
        </div>
      </header>

      <p className="junction-copy">JUNCTIONは状態を戻す場所ではありません。ログの軌跡を見渡し、「ここで流れが変わった」と自分で印を付ける分岐標識です。</p>

      <div className="junction-actions" aria-label="JUNCTION操作">
        <button className="junction-pause" onClick={openLogPause}><span>Ⅱ</span><strong>LOG PAUSE</strong><small>直近8件の軌跡を見渡す</small></button>
        <button onClick={openReview} disabled={!ready || !marker}><span>◇</span><strong>REVIEW</strong><small>{marker ? "記録した分岐を見る" : "記録された分岐なし"}</small></button>
        <button onClick={dismiss} disabled={!draft && !reviewOpen}><span>↩</span><strong>RETURN</strong><small>現在の航行へ戻る</small></button>
      </div>

      <p className="junction-notice" role="status" aria-live="polite">{notice}</p>

      {draft && selectedTarget && (
        <section className="junction-observation" role="dialog" aria-modal="false" aria-label="LOG PAUSE 軌跡確認">
          <div className="junction-panel-head">
            <div><span className="panel-label">LOG PAUSE / LAST {draft.flow.length}</span><strong>{formatDateTime(draft.openedAt)}</strong></div>
            <button onClick={dismiss} aria-label="現在の航行へ戻る">×</button>
          </div>
          <p className="junction-question">流れが変わった可能性があります。少し見渡しますか？</p>

          <TrajectoryChart flow={draft.flow} selectedId={selectedTarget.id} markerId={marker?.target.id} onSelect={(targetId) => setDraft((value) => value ? { ...value, targetId } : value)} />

          <div className="junction-flow-summary">
            <span>SELECTED POINT｜{selectedTarget.time} {selectedTarget.label}</span>
            <strong>HP {signed(selectedTarget.hpDelta)}</strong><strong>SP {signed(selectedTarget.spDelta)}</strong><strong>FOG {signed(selectedTarget.fogDelta)}</strong>
            <em>{selectedTarget.cutIns.length > 0 ? `CUT-IN ${selectedTarget.cutIns.length}` : "CUT-INなし"}</em>
          </div>

          <div className="junction-log-block"><span className="panel-label">RECENT ACTION LOG｜タップして分岐地点を選択</span><FlowLog flow={draft.flow} markerId={marker?.target.id} selectedId={selectedTarget.id} onSelect={(targetId) => setDraft((value) => value ? { ...value, targetId } : value)} /></div>
          <BeaconRoutes beacon={draft.current.beacon} />

          <fieldset className="junction-route-choice">
            <legend>次のBeaconへ一時反映する航路</legend>
            {(Object.keys(ROUTE_LABELS) as RouteChoice[]).map((choice) => (
              <button type="button" key={choice} className={routeChoice === choice ? "selected" : ""} onClick={() => setRouteChoice(choice)}>{ROUTE_LABELS[choice]}</button>
            ))}
          </fieldset>

          <label className="junction-memo"><span>短いメモ（任意・80文字まで）</span><input value={memo} maxLength={80} onChange={(event) => setMemo(event.target.value)} placeholder="例：材料待ちへ切り替えた地点" /></label>

          <div className="junction-panel-actions">
            <button className="junction-panel-primary" onClick={markJunction}>MARK JUNCTION</button>
            <button onClick={dismiss}>現在の航行へ戻る</button>
          </div>
          <small className="junction-choice-note">航路選択は次のBeaconだけへ反映され、次のログ入力で消費されます。HP・SP・RSY・Z・霧は変更しません。</small>
        </section>
      )}

      {reviewOpen && marker && (
        <section className="junction-observation" role="dialog" aria-modal="false" aria-label="保存したJUNCTIONの振り返り">
          <div className="junction-panel-head">
            <div><span className="panel-label">JUNCTION REVIEW</span><strong>{formatDateTime(marker.markedAt)}</strong></div>
            <button onClick={dismiss} aria-label="現在の航行へ戻る">×</button>
          </div>

          <TrajectoryChart flow={marker.flow} markerId={marker.target.id} selectedId={marker.target.id} />
          <div className="junction-saved-signals" aria-label="記録時の観測値">
            <span>HP {marker.current.hp}</span><span>SP {marker.current.sp}</span><span>RSY {marker.current.rsy.r}・{marker.current.rsy.s}・{marker.current.rsy.y}</span><span>Z {marker.current.z ?? "航海中"}</span><span>FOG {marker.current.fog}/3</span>
          </div>
          <div className="junction-marker-summary">
            <span>MARKED POINT</span><strong>{marker.target.time}｜{marker.target.label}</strong>
            <span>BASE ROUTE</span><strong>{marker.baseRoute}</strong>
            <span>JUNCTION CHOICE</span><strong>{ROUTE_LABELS[marker.selectedRoute]}（{signed(marker.appliedCorrection)}）</strong>
            <span>NEXT GUIDANCE</span><strong>{marker.nextGuidance}</strong>
          </div>
          {marker.memo && <div className="junction-recent"><span>MEMO</span><strong>{marker.memo}</strong></div>}
          <div className="junction-log-block"><span className="panel-label">RECORDED TRAJECTORY</span><FlowLog flow={marker.flow} markerId={marker.target.id} /></div>
          <BeaconRoutes beacon={marker.current.beacon} />
          <div className="junction-recent">
            <span>その後のアクション結果</span>
            <strong>{marker.subsequentAction ? `${marker.subsequentAction.time}｜${marker.subsequentAction.label}` : "次のログを観測中"}</strong>
            <p>{marker.subsequentAction ? `${marker.subsequentAction.log}　HP ${signed(marker.subsequentAction.hpDelta)} / SP ${signed(marker.subsequentAction.spDelta)} / FOG ${signed(marker.subsequentAction.fogDelta)}` : "航路補正は次のログ入力で消費され、その結果がここへ記録されます。"}</p>
          </div>

          <div className="junction-panel-actions junction-panel-actions-single"><button onClick={dismiss}>現在の航行へ戻る</button></div>
          <small className="junction-choice-note">REVIEWは観測記録の振り返りです。過去のHP・SP・RSY・Z・霧・Beaconへ戻しません。</small>
        </section>
      )}
    </article>
  );
}
