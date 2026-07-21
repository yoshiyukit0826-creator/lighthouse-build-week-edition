"use client";

import { useEffect, useRef, useState } from "react";
import AdaptiveBeacon from "./adaptive-beacon";
import HudTrajectoryChart from "./hud-trajectory-chart";
import JunctionPanel from "./junction-panel";
import {
  consumeRouteCorrection,
  readAdaptiveBeacon,
  type RouteCorrection,
} from "./navigation-engine";
import type { TrajectoryEntry } from "./trajectory";

type ActionKind = "recover" | "damage" | "stock";

type NavAction = {
  label: string;
  delta: number;
  kind: ActionKind;
  log: string;
};

type RecentAction = {
  label: string;
  delta: number;
  log: string;
  kind: ActionKind | "morning" | "night";
  time: string;
  fogNote?: string;
};

type TrajectoryOverrides = {
  rsy?: { r: number; s: number; y: number };
  z?: number | null;
  vector?: string;
  wind?: string;
  cutIns?: string[];
};

type CutIn = {
  event: "course-check" | "helm-secured" | "structure-collapse" | "asset-operation" | "asset-secured";
  kicker: string;
  title: string;
  quote: string;
  tone: "storm" | "ark" | "josef" | "donkel" | "stock";
};

type HpFeedback = {
  sequence: number;
  kind: "recover" | "damage";
  intensity: "soft" | "medium" | "strong";
};

const HP_ACTIONS: NavAction[] = [
  { label: "補給", delta: 5, kind: "recover", log: "補給を行った。" },
  { label: "荷揃え完了", delta: 10, kind: "recover", log: "発見・回収に成功した。" },
  { label: "段取り整理", delta: 10, kind: "recover", log: "航路を整え直した。" },
  { label: "足場確保", delta: 20, kind: "recover", log: "退路と足場を確保した。" },
  { label: "昼休み", delta: 10, kind: "recover", log: "停泊して英気を養った。" },
  { label: "段取り崩れ", delta: -15, kind: "damage", log: "航路が乱れた。" },
  { label: "雑用", delta: -5, kind: "damage", log: "横風に足を取られた。" },
  { label: "探し物", delta: -10, kind: "damage", log: "霧の中で探索を開始した。" },
  { label: "材料返品", delta: -30, kind: "damage", log: "積荷の組み直しが発生した。" },
  { label: "ミス", delta: -15, kind: "damage", log: "手戻りを確認。針路を再計算する。" },
];

const HP_MAP: Record<number, number> = {
  0: 10,
  1: 20,
  2: 30,
  3: 45,
  4: 60,
  5: 70,
  6: 80,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function nowLabel() {
  return new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

function fogAfter(action: NavAction, current: number) {
  if (action.label === "荷揃え完了") return 0;
  if (action.label === "段取り整理") return clamp(current - 2, 0, 3);
  if (action.label === "足場確保") return clamp(current - 1, 0, 3);
  if (action.label === "材料返品") return clamp(current + 2, 0, 3);
  if (action.kind === "damage") return clamp(current + 1, 0, 3);
  return current;
}

function fogNoteFor(action: NavAction) {
  if (action.label === "荷揃え完了") return "霧 RESET";
  if (action.label === "段取り整理") return "霧 −2";
  if (action.label === "足場確保") return "霧 −1";
  if (action.label === "材料返品") return "霧 +2";
  if (action.kind === "damage") return "霧 +1";
  return "霧 KEEP";
}

function statusFor(hp: number) {
  if (hp >= 80) return { label: "SAFE", tone: "safe", title: "航行余力あり", diagnosis: "攻められる。ただし余白は残せ。" };
  if (hp >= 50) return { label: "OPTIMAL", tone: "optimal", title: "通常航行", diagnosis: "現在の針路を維持できる。" };
  if (hp >= 30) return { label: "CAUTION", tone: "caution", title: "能力低下", diagnosis: "判断を絞り、足場を確認せよ。" };
  if (hp >= 10) return { label: "DANGER", tone: "danger", title: "航行危険", diagnosis: "新しい仕事を抱えるな。帰還路優先。" };
  return { label: "CRITICAL", tone: "critical", title: "航行限界", diagnosis: "停船。回復するまで操船を増やすな。" };
}

function guidanceFor(hp: number, fog: number) {
  if (hp < 10) return "停船も立派な操船。まず足場を確保。";
  if (hp < 30) return "無理するな。狭い航路を一つずつ。";
  if (fog >= 3) return "灯台捕捉。判断を増やさず帰還優先。";
  if (hp < 50) return "視界を欲張るな。確認してから一手。";
  if (hp < 80) return "順風ヨシ。余白は仕込みへ。";
  return "視界良好。攻め過ぎだけ注意。";
}

function aaFor(hp: number, fog: number) {
  if (hp < 10) return ["  /\\_/\\", " ( ×ω× )", "  /   づ⚓"];
  if (fog >= 3) return ["  /\\_/\\", " ( •̀ω•́ )", "  /つ🔭  灯台！"];
  if (hp < 30) return ["  /\\_/\\", " ( ﾟдﾟ )ｸﾜｯ", "  / づ づ"];
  return ["  /\\_/\\", " ( •ω• )ゞ", "  / づ🔭"];
}

function vectorFor(r: number, s: number, y: number) {
  const ns = r + s + y;
  if (ns >= 5) return { vector: "攻める", wind: "整えは怠るな" };
  if (r === 0) return { vector: "立て直し", wind: "残務を吸収せよ" };
  if (s === 0) return { vector: "安全", wind: "見落としを洗え" };
  if (y === 2) return { vector: "維持", wind: "足場を先に作れ" };
  return { vector: "維持", wind: "流れを作れ" };
}

export default function Home() {
  const [hp, setHp] = useState(63);
  const [sp, setSp] = useState(3);
  const [fog, setFog] = useState(0);
  const [time, setTime] = useState<Date | null>(null);
  const [vector, setVector] = useState("維持");
  const [wind, setWind] = useState("流れを作れ");
  const [recent, setRecent] = useState<RecentAction>({ label: "荷揃え完了", delta: 10, log: "発見・回収に成功した。", kind: "recover", time: "10:02", fogNote: "霧 RESET" });
  const [actionPanel, setActionPanel] = useState<ActionKind | null>(null);
  const [morningOpen, setMorningOpen] = useState(false);
  const [rsy, setRsy] = useState({ r: 2, s: 1, y: 1 });
  const [nightOpen, setNightOpen] = useState(false);
  const [nightChoice, setNightChoice] = useState(2);
  const [zResult, setZResult] = useState<number | null>(null);
  const [flash, setFlash] = useState<ActionKind | null>(null);
  const [damageStreak, setDamageStreak] = useState(0);
  const [cutIns, setCutIns] = useState<CutIn[]>([]);
  const [hpFeedback, setHpFeedback] = useState<HpFeedback | null>(null);
  const [trajectory, setTrajectory] = useState<TrajectoryEntry[]>(() => {
    const initialBeacon = readAdaptiveBeacon({
      hp: 63,
      sp: 3,
      fog: 0,
      rsy: { r: 2, s: 1, y: 1 },
      z: null,
      statusLabel: statusFor(63).label,
      vector: "維持",
      wind: "流れを作れ",
      recentKind: "recover",
      recentLabel: "荷揃え完了",
    });
    return [{
      id: "initial-course",
      observedAt: new Date().toISOString(),
      time: "10:02",
      label: "荷揃え完了",
      log: "発見・回収に成功した。",
      kind: "recover",
      delta: 10,
      hp: 63,
      hpDelta: 0,
      sp: 3,
      spDelta: 0,
      fog: 0,
      fogDelta: 0,
      fogNote: "霧 RESET",
      beacon: initialBeacon,
      cutIns: [],
    }];
  });
  const [routeCorrection, setRouteCorrection] = useState<RouteCorrection | null>(null);
  const trajectorySequence = useRef(0);
  const feedbackSequence = useRef(0);
  const feedbackTimer = useRef<number | null>(null);
  const hpConsoleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const immediate = window.setTimeout(() => setTime(new Date()), 0);
    const timer = window.setInterval(() => setTime(new Date()), 30_000);
    return () => {
      window.clearTimeout(immediate);
      window.clearInterval(timer);
    };
  }, []);

  const activeCutInEvent = cutIns[0]?.event;
  useEffect(() => {
    if (!activeCutInEvent) return;
    const timer = window.setTimeout(() => {
      setCutIns((current) => current.slice(1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [activeCutInEvent]);

  useEffect(() => () => {
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current);
  }, []);

  const status = statusFor(hp);
  const fogLabel = fog >= 3 ? "濃霧" : fog >= 2 ? "深い" : fog >= 1 ? "薄い" : "CLEAR";
  const seaState = hp < 30 ? "荒天" : hp < 50 ? "向かい風" : hp >= 80 ? "快晴" : "順風";
  const beaconReading = readAdaptiveBeacon({
    hp,
    sp,
    fog,
    rsy,
    z: zResult,
    statusLabel: status.label,
    vector,
    wind,
    recentKind: recent.kind,
    recentLabel: recent.label,
  });

  function showCutIn(next: CutIn) {
    setCutIns((current) => current.some((item) => item.event === next.event) ? current : [...current, next]);
  }

  function showHpFeedback(kind: "recover" | "damage", delta: number) {
    const magnitude = Math.abs(delta);
    const intensity = magnitude >= 20 ? "strong" : magnitude >= 10 ? "medium" : "soft";
    feedbackSequence.current += 1;
    setHpFeedback({ sequence: feedbackSequence.current, kind, intensity });
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setHpFeedback(null), 1050);
    window.requestAnimationFrame(() => {
      const hpConsole = hpConsoleRef.current;
      if (!hpConsole) return;
      if (window.matchMedia("(max-width: 440px)").matches) {
        const box = hpConsole.getBoundingClientRect();
        const centeredTop = window.scrollY + box.top - Math.max(0, (window.innerHeight - box.height) / 2);
        window.scrollTo({ top: centeredTop + 96, behavior: "smooth" });
        return;
      }
      hpConsole.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function appendTrajectoryEntry(
    nextHp: number,
    nextSp: number,
    nextFog: number,
    nextRecent: RecentAction,
    overrides: TrajectoryOverrides = {},
  ) {
    const nextRsy = overrides.rsy ?? rsy;
    const nextZ = overrides.z === undefined ? zResult : overrides.z;
    const nextVector = overrides.vector ?? vector;
    const nextWind = overrides.wind ?? wind;
    const nextBeacon = readAdaptiveBeacon({
      hp: nextHp,
      sp: nextSp,
      fog: nextFog,
      rsy: nextRsy,
      z: nextZ,
      statusLabel: statusFor(nextHp).label,
      vector: nextVector,
      wind: nextWind,
      recentKind: nextRecent.kind,
      recentLabel: nextRecent.label,
    });

    trajectorySequence.current += 1;
    const id = `action-${trajectorySequence.current}`;
    setTrajectory((current) => {
      const previous = current.at(-1);
      const entry: TrajectoryEntry = {
        id,
        observedAt: new Date().toISOString(),
        time: nextRecent.time,
        label: nextRecent.label,
        log: nextRecent.log,
        kind: nextRecent.kind,
        delta: nextRecent.delta,
        hp: nextHp,
        hpDelta: previous ? nextHp - previous.hp : 0,
        sp: nextSp,
        spDelta: previous ? nextSp - previous.sp : 0,
        fog: nextFog,
        fogDelta: previous ? nextFog - previous.fog : 0,
        fogNote: nextRecent.fogNote,
        beacon: nextBeacon,
        cutIns: overrides.cutIns ?? [],
      };
      return [...current.slice(-9), entry];
    });
    setRouteCorrection((current) => consumeRouteCorrection(current, id).pendingCorrection);
  }

  function register(action: NavAction) {
    const nextHp = clamp(hp + action.delta, 0, 100);
    const nextFog = fogAfter(action, fog);
    const nextRecent: RecentAction = { ...action, time: nowLabel(), fogNote: fogNoteFor(action) };
    const firedCutIns: string[] = [];
    setHp(nextHp);
    setRecent(nextRecent);
    setFog(nextFog);
    if (action.kind === "damage") {
      const nextDamageStreak = damageStreak + 1;
      setDamageStreak(nextDamageStreak >= 3 ? 0 : nextDamageStreak);
      if (nextDamageStreak >= 3) {
        firedCutIns.push("ヨーゼフ｜連続HP減少");
        showCutIn({ event: "course-check", kicker: "CONTINUOUS HP LOSS", title: "航路確認", quote: "HP減少が三度です。個別の事故ではなく、航路そのものを見直してください。", tone: "josef" });
      }
    } else {
      setDamageStreak(0);
    }
    if (action.label === "材料返品") {
      firedCutIns.push("緊急航海警報｜材料返品");
      showCutIn({ event: "structure-collapse", kicker: "STRUCTURAL BREAK", title: "構造瓦解", quote: "予定・段取り・時間構造が飛んだ。まず被害範囲を確定せよ。", tone: "storm" });
    }
    if (fog >= 2 && nextFog === 0 && (action.label === "段取り整理" || action.label === "荷揃え完了")) {
      firedCutIns.push("ドンケル｜航路回復");
      showCutIn({ event: "helm-secured", kicker: "COURSE RECOVERED", title: "舵輪確保", quote: "舵は戻った。現在地を見て、もう一度進める。", tone: "donkel" });
    }
    if (action.kind === "recover" || action.kind === "damage") showHpFeedback(action.kind, nextHp - hp);
    appendTrajectoryEntry(nextHp, sp, nextFog, nextRecent, { cutIns: firedCutIns });
    setActionPanel(null);
  }

  function stockSp() {
    const nextSp = clamp(sp + 1, 0, 5);
    const nextRecent: RecentAction = { label: "SPストック", delta: 1, log: "未来用の積荷を一つ確保した。", kind: "stock", time: nowLabel(), fogNote: "霧 KEEP" };
    setSp(nextSp);
    setRecent(nextRecent);
    setFlash("stock");
    const stockEstablished = nextSp > sp;
    if (stockEstablished) {
      showCutIn({ event: "asset-secured", kicker: "SP STOCK SECURED", title: "資産確保", quote: "未来へ回せる余力を、一つ確保しました。", tone: "stock" });
    }
    appendTrajectoryEntry(hp, nextSp, fog, nextRecent, { cutIns: stockEstablished ? ["NAVI-OS｜SPストック成立"] : [] });
    window.setTimeout(() => setFlash(null), 520);
    setActionPanel(null);
  }

  function releaseSp() {
    if (sp === 0) return;
    const nextSp = sp - 1;
    const nextRecent: RecentAction = { label: "SP放出", delta: -1, log: "準備済みの積荷を生産へ放出した。", kind: "stock", time: nowLabel(), fogNote: "霧 KEEP" };
    setSp(nextSp);
    setRecent(nextRecent);
    appendTrajectoryEntry(hp, nextSp, fog, nextRecent);
    setActionPanel(null);
  }

  function useSp() {
    if (sp === 0) return;
    const nextSp = sp - 1;
    const nextHp = clamp(hp + 50, 0, 100);
    const nextRecent: RecentAction = { label: "SP使用", delta: 50, log: "蓄えを使い、再出航の準備を整えた。", kind: "recover", time: nowLabel(), fogNote: "霧 RESET" };
    setSp(nextSp);
    setHp(nextHp);
    setFog(0);
    setRecent(nextRecent);
    showCutIn({ event: "asset-operation", kicker: "SP RECOVERY", title: "資産運用", quote: "積んでおいた未来を、今ここへ。再出航の余白を作ります。", tone: "ark" });
    showHpFeedback("recover", nextHp - hp);
    appendTrajectoryEntry(nextHp, nextSp, 0, nextRecent, { cutIns: ["アーク｜SP回復"] });
    setActionPanel(null);
  }

  function startMorning() {
    const ns = rsy.r + rsy.s + rsy.y;
    const nextHp = HP_MAP[ns];
    const nextGuide = vectorFor(rsy.r, rsy.s, rsy.y);
    const nextRecent: RecentAction = { label: `朝ナビ ${rsy.r}・${rsy.s}・${rsy.y}`, delta: 0, log: `NS ${ns}。本日の航海を開始した。`, kind: "morning", time: nowLabel(), fogNote: "霧 RESET" };
    setHp(nextHp);
    setVector(nextGuide.vector);
    setWind(nextGuide.wind);
    setFog(0);
    setDamageStreak(0);
    setRecent(nextRecent);
    appendTrajectoryEntry(nextHp, sp, 0, nextRecent, { rsy, vector: nextGuide.vector, wind: nextGuide.wind });
    setMorningOpen(false);
  }

  function closeVoyage() {
    const reports = {
      0: "不安要素あり。明朝、最初に再観測する。",
      1: "軽微な引っ掛かりあり。針路は維持可能。",
      2: "引き継ぎ良好。明朝は迷わず出航できる。",
    } as const;
    const nextRecent: RecentAction = { label: `夜ナビ Z${nightChoice}`, delta: 0, log: reports[nightChoice as keyof typeof reports], kind: "night", time: nowLabel(), fogNote: "霧 KEEP" };
    setZResult(nightChoice);
    setRecent(nextRecent);
    appendTrajectoryEntry(hp, sp, fog, nextRecent, { z: nightChoice });
    setNightOpen(false);
  }

  const recoverActions = HP_ACTIONS.filter((item) => item.kind === "recover");
  const damageActions = HP_ACTIONS.filter((item) => item.kind === "damage");
  const cutIn = cutIns[0] ?? null;

  return (
    <main className={`navi-shell tone-${status.tone} fog-collapse-${fog >= 3 ? "severe" : fog >= 2 ? "unstable" : fog >= 1 ? "warning" : "clear"} ${flash ? `flash-${flash}` : ""}`}>
      <div className="sea-backdrop" aria-hidden="true" />
      <div className={`fog fog-${fogLabel === "CLEAR" ? "low" : fogLabel === "薄い" ? "mid" : "high"}`} aria-hidden="true" />
      {fog >= 2 && <div className="fog-alarm" role="status">FOG INTERFERENCE // HUD SIGNAL {fog >= 3 ? "COLLAPSING" : "UNSTABLE"}</div>}

      <header className="topbar instrument-panel">
        <div className="brand-block">
          <span className="eyebrow">NAVIGATION SYSTEM / 航海HUD</span>
          <h1>NAVI-OS</h1>
        </div>
        <div className="clock" aria-label="現在時刻">
          <span>{time ? time.toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit", weekday: "short" }) : "--/--"}</span>
          <strong>{time ? time.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }) : "--:--"}</strong>
        </div>
        <div className="system-lights" aria-label="システム状態">
          <span><i /> SYS</span>
          <span><i /> LOG</span>
          <span className="link-off"><i /> LINK</span>
          <button className="morning-button" onClick={() => setMorningOpen(true)}>朝ナビ</button>
          <button className="night-button" onClick={() => setNightOpen(true)}>夜Z {zResult ?? "−"}</button>
        </div>
      </header>

      <section className="bridge-grid" aria-label="ナビゲーションHUD">
        <article ref={hpConsoleRef} className="hp-console instrument-panel">
          <div className="panel-label">CURRENT CAPABILITY</div>
          <div
            key={hpFeedback?.sequence ?? 0}
            className={`hp-dial ${hpFeedback ? `hp-feedback-${hpFeedback.kind} feedback-${hpFeedback.intensity}` : ""}`}
            style={{ "--hp": hp } as React.CSSProperties}
          >
            <div className="dial-ticks" />
            <div className="dial-breach" aria-hidden="true"><i /><i /><i /><i /></div>
            {hpFeedback && <div className="hp-feedback-wave" aria-hidden="true" />}
            <div className="hp-core">
              <span>HP</span>
              <strong data-value={hp}>{hp}</strong>
              <em>{status.label}</em>
            </div>
          </div>
          <div className={`hp-action-readout latest-action-${recent.kind}`} aria-live="polite">
            <span>LAST INPUT｜{recent.time}</span>
            <strong>{recent.label}</strong>
            <em className={recent.delta < 0 ? "negative" : ""}>{recent.delta > 0 ? "+" : ""}{recent.delta}</em>
            <p>{recent.log}</p>
          </div>
          <div className="capability-status" role="status">
            <span>{status.label}</span>
            <strong>{status.title}</strong>
            <p>{status.diagnosis}</p>
          </div>
          <div className="sp-console">
            <span>SP</span>
            <strong>{sp}<small>/5</small></strong>
            <div className="sp-cells" aria-label={`SP ${sp} / 5`}>
              {[0, 1, 2, 3, 4].map((cell) => <i key={cell} className={cell < sp ? "filled" : ""} />)}
            </div>
          </div>
          <p className="core-caption">HP＝今、本当に動かせる力　／　SP＝未来へ積んだ余力</p>
        </article>

        <article className="navigator-card instrument-panel">
          <div className="aa" aria-hidden="true">{aaFor(hp, fog).map((line) => <span key={line}>{line}</span>)}</div>
          <div>
            <span className="panel-label">NAVIGATOR</span>
            <strong>{guidanceFor(hp, fog)}</strong>
            <p>数字は正確に。意味は一目で。空気は航海として返す。</p>
          </div>
        </article>

        <article className="sea-window instrument-panel">
          {/* The Sites preview worker serves this local art directly; image optimization is unavailable there. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sea-art" src="/lighthouse-sea.png" alt="" aria-hidden="true" />
          <div className="beacon-light" aria-hidden="true" />
          <div className="sea-horizon" aria-hidden="true" />
          <div className="radar" aria-hidden="true">
            <i className="radar-line one" /><i className="radar-line two" /><i className="radar-line three" />
            <i className="radar-cross horizontal" /><i className="radar-cross vertical" />
            <i className="radar-sweep" />
          </div>
          <div className="sea-readout">
            <span className="panel-label">LIGHTHOUSE BEACON</span>
            <div>
            <span className="weather-chip">{seaState}</span>
            <span className="fog-chip">霧 {fogLabel}</span>
            <span className="z-chip">Z {zResult ?? "航海中"}</span>
            </div>
            <p>LIGHTHOUSE：{fog >= 3 ? "捕捉・帰還路を確保" : "遠距離・待機"}</p>
          </div>
          <div className="status-stack environment-instruments" aria-label="航行環境">
            <div className="status-card instrument-panel"><span>ベクトル</span><strong>{vector}</strong><i>針路</i></div>
            <div className="status-card instrument-panel"><span>風向き</span><strong>{wind}</strong><i>操船</i></div>
            <div className="status-card instrument-panel"><span>海況</span><strong>{seaState}</strong><i>流れ</i></div>
            <div className="status-card instrument-panel"><span>霧</span><strong>{fogLabel}</strong><i>{fog}/3</i></div>
          </div>
        </article>

        <article className={`recent-card latest-action-${recent.kind} instrument-panel`}>
          <div className="recent-meta"><span className="panel-label">直近アクション</span><span className="action-kind">{recent.kind === "recover" ? "RECOVER" : recent.kind === "damage" ? "LOAD" : recent.kind === "stock" ? "SP" : recent.kind === "morning" ? "MORNING" : "NIGHT"}</span>{recent.fogNote && <span className="fog-change">{recent.fogNote}</span>}<time>{recent.time}</time></div>
          <strong>{recent.label}</strong>
          <span className={recent.delta < 0 ? "delta negative" : "delta"}>{recent.delta > 0 ? "+" : ""}{recent.delta}</span>
          <p>{recent.log}</p>
          <small>現実の入力を、航海記録へ翻訳</small>
        </article>

        <HudTrajectoryChart entries={trajectory} />

        <AdaptiveBeacon
          hp={hp}
          sp={sp}
          fog={fog}
          rsy={rsy}
          z={zResult}
          statusLabel={status.label}
          vector={vector}
          wind={wind}
          recentKind={recent.kind}
          recentLabel={recent.label}
          routeCorrection={routeCorrection}
        />
      </section>

      <JunctionPanel
        trajectory={trajectory}
        onRouteCorrection={setRouteCorrection}
        current={{
          hp,
          sp,
          rsy,
          z: zResult,
          fog,
          beacon: beaconReading,
          recent,
        }}
      />

      <nav className="action-dock instrument-panel" aria-label="アクション入力">
        <button className="action-trigger recover" onClick={() => setActionPanel(actionPanel === "recover" ? null : "recover")}><span>＋</span><strong>回復</strong><small>未来を軽くする</small></button>
        <button className="action-trigger damage" onClick={() => setActionPanel(actionPanel === "damage" ? null : "damage")}><span>↓</span><strong>減少</strong><small>負荷を記録する</small></button>
        <button className="action-trigger stock" onClick={() => setActionPanel(actionPanel === "stock" ? null : "stock")}><span>▣</span><strong>仕込み</strong><small>未来へ積む</small></button>
      </nav>

      {actionPanel && (
        <div className="action-sheet" role="dialog" aria-label="アクション選択">
          <div className="sheet-head"><strong>{actionPanel === "recover" ? "回復を記録" : actionPanel === "damage" ? "負荷を記録" : "SPを運用"}</strong><button onClick={() => setActionPanel(null)} aria-label="閉じる">×</button></div>
          <div className="action-options">
            {actionPanel === "recover" && recoverActions.map((action) => <button key={action.label} onClick={() => register(action)}><span>{action.label}</span><strong>+{action.delta}</strong><small>{fogNoteFor(action)}</small></button>)}
            {actionPanel === "damage" && damageActions.map((action) => <button key={action.label} onClick={() => register(action)}><span>{action.label}</span><strong>{action.delta}</strong><small>{fogNoteFor(action)}</small></button>)}
            {actionPanel === "stock" && <>
              <button onClick={stockSp}><span>SPストック</span><strong>+1</strong><small>未来用を作成</small></button>
              <button onClick={releaseSp} disabled={sp === 0}><span>SP放出</span><strong>-1</strong><small>生産へ渡す</small></button>
              <button onClick={useSp} disabled={sp === 0}><span>SP使用</span><strong>HP +50</strong><small>再出航へ変換</small></button>
            </>}
          </div>
        </div>
      )}

      {morningOpen && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="朝ナビ入力">
          <section className="morning-modal instrument-panel">
            <div className="sheet-head"><div><span className="panel-label">MORNING CHECK</span><strong>今朝の海況を入力</strong></div><button onClick={() => setMorningOpen(false)} aria-label="閉じる">×</button></div>
            <p>前日から引き継いだ状況を観測します。能力や気分の採点ではありません。</p>
            {(["r", "s", "y"] as const).map((key) => {
              const labels = { r: ["R 残務", "前日からの残り・準備不足"], s: ["S 段取り", "日々の積み重ねと業務状態"], y: ["Y 余裕", "突発・人員・予定のズレ"] }[key];
              return <div className="rsy-row" key={key}><div><strong>{labels[0]}</strong><small>{labels[1]}</small></div><div>{[0,1,2].map((value) => <button key={value} className={rsy[key] === value ? "selected" : ""} onClick={() => setRsy((current) => ({ ...current, [key]: value }))}>{value}</button>)}</div></div>;
            })}
            <div className="morning-result"><span>NS {rsy.r + rsy.s + rsy.y}</span><strong>初期HP {HP_MAP[rsy.r + rsy.s + rsy.y]}</strong><em>{vectorFor(rsy.r, rsy.s, rsy.y).vector}｜{vectorFor(rsy.r, rsy.s, rsy.y).wind}</em></div>
            <button className="depart-button" onClick={startMorning}>本日の航海を開始</button>
          </section>
        </div>
      )}

      {nightOpen && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="夜ナビ入力">
          <section className="morning-modal night-modal instrument-panel">
            <div className="sheet-head"><div><span className="panel-label">NIGHT CHECK</span><strong>明日の俺へバトンを渡す</strong></div><button onClick={() => setNightOpen(false)} aria-label="閉じる">×</button></div>
            <p>Zは今日の採点ではなく、未回収の仕事や不安が明朝へどれだけ残るかの記録です。</p>
            <div className="z-options">
              {[
                [0, "要再観測", "不安や未回収が残る"],
                [1, "小さな引っ掛かり", "軽微な残りはある"],
                [2, "引き継ぎ良好", "明朝は迷わず動ける"],
              ].map(([value, title, detail]) => (
                <button key={value} className={nightChoice === value ? "selected" : ""} onClick={() => setNightChoice(Number(value))}>
                  <strong>Z{value}</strong><span>{title}</span><small>{detail}</small>
                </button>
              ))}
            </div>
            <button className="depart-button night-close-button" onClick={closeVoyage}>航海日誌を閉じる</button>
          </section>
        </div>
      )}

      {cutIn && (
        <div className={`cutin-ribbon cutin-${cutIn.tone}`} role="status" aria-live="assertive" aria-label={`${cutIn.title}のカットイン`}>
          <div className="cutin-ribbon-scan" aria-hidden="true" />
          <section className="cutin-ribbon-copy">
            <span>{cutIn.kicker}</span>
            <h2>{cutIn.title}</h2>
            <p>{cutIn.quote}</p>
          </section>
        </div>
      )}
    </main>
  );
}
