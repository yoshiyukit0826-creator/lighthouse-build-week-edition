import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("rendered HTML smoke: development metadata, Adaptive Beacon, and Trajectory Junction controls", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /ADAPTIVE BEACON \/ v1/);
  assert.match(html, /CURRENT POSITION/);
  assert.match(html, /NEXT STEP/);
  assert.match(html, /ALTERNATE ROUTE/);
  assert.match(html, /採用・保留・変更・無視を選べます/);
  assert.match(html, /TRAJECTORY LOG \/ JUNCTION MARKER v1/);
  assert.match(html, /軌跡を読む。分岐は自分で記す。/);
  assert.match(html, /LOG PAUSE/);
  assert.match(html, /REVIEW/);
  assert.match(html, /現在の航行へ戻る/);
});

test("source contract: records a trajectory marker and a one-action Beacon correction without a state restoration path", async () => {
  const panelSource = await readFile(new URL("../app/junction-panel.tsx", import.meta.url), "utf8");
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const beaconSource = await readFile(new URL("../app/adaptive-beacon.tsx", import.meta.url), "utf8");
  const engineSource = await readFile(new URL("../app/navigation-engine.ts", import.meta.url), "utf8");
  assert.match(panelSource, /流れが変わった可能性があります。少し見渡しますか？/);
  assert.match(panelSource, /TrajectoryChart/);
  assert.match(panelSource, /hpDelta/);
  assert.match(panelSource, /spDelta/);
  assert.match(panelSource, /fogDelta/);
  assert.match(panelSource, /cutIns/);
  assert.match(panelSource, /短いメモ/);
  assert.match(panelSource, /MARK JUNCTION/);
  assert.match(engineSource, /このまま進む/);
  assert.match(engineSource, /迂回する/);
  assert.match(engineSource, /今は決めない/);
  assert.match(panelSource, /BASE ROUTE/);
  assert.match(panelSource, /NEXT GUIDANCE/);
  assert.match(panelSource, /その後のアクション結果/);
  assert.match(panelSource, /過去のHP・SP・RSY・Z・霧・Beaconへ戻しません/);
  assert.match(beaconSource, /JUNCTION ROUTE \/ TEMPORARY/);
  assert.match(beaconSource, /generateNavigation/);
  assert.match(engineSource, /もう少し状況を見ます/);
  assert.match(pageSource, /consumeRouteCorrection/);
  assert.doesNotMatch(panelSource, /onResume|resumeFromSnapshot|SAVE JUNCTION|RESUME POINT/);
  assert.doesNotMatch(pageSource, /resumeJunction|JunctionSnapshot|onResume=/);
  assert.doesNotMatch(engineSource, /resumeFromSnapshot|restoreTrajectory|rewriteTrajectory/);
});

test("source/CSS contract: renders trajectory entries as readable cards with Beacon and JUNCTION markers", async () => {
  const panelSource = await readFile(new URL("../app/junction-panel.tsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(panelSource, /trajectory-card-head/);
  assert.match(panelSource, /trajectory-card-metrics/);
  assert.match(panelSource, /trajectory-card-result/);
  assert.match(panelSource, /trajectory-card-beacon/);
  assert.match(panelSource, /◇ JUNCTION｜グラフの分岐標識/);
  assert.match(cssSource, /\.junction-flow-list \{[^}]*grid-template-columns: repeat\(2/);
  assert.match(cssSource, /@media \(max-width: 780px\)[\s\S]*\.junction-flow-list \{ grid-template-columns: 1fr; \}/);
  assert.match(cssSource, /word-break: normal/);
});

test("source/CSS contract: keeps the three-way action input fixed and returns attention to the HP ring", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(pageSource, /aria-label="アクション入力"/);
  assert.match(pageSource, /回復/);
  assert.match(pageSource, /減少/);
  assert.match(pageSource, /仕込み/);
  assert.match(pageSource, /window\.matchMedia\("\(max-width: 440px\)"\)\.matches/);
  assert.match(pageSource, /const centeredTop = window\.scrollY \+ box\.top - Math\.max\(0, \(window\.innerHeight - box\.height\) \/ 2\);/);
  assert.match(pageSource, /window\.scrollTo\(\{ top: centeredTop \+ 96, behavior: "smooth" \}\)/);
  assert.match(pageSource, /scrollIntoView\(\{ behavior: "smooth", block: "center" \}\)/);
  assert.match(pageSource, /hp-action-readout/);
  assert.match(cssSource, /\.action-dock \{ position: fixed;/);
  assert.match(cssSource, /\.navi-shell \{[\s\S]*padding: 18px 18px 132px;/);
  assert.match(cssSource, /\.action-sheet \{[^}]*bottom: 116px;/);
  assert.match(cssSource, /@media \(max-width: 780px\)[\s\S]*\.action-dock \{[^}]*width: auto;[^}]*transform: none;/);
});

test("source/CSS contract: uses ring-local feedback and auto-dismissing non-modal cut-in ribbons", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(pageSource, /showHpFeedback\("recover"/);
  assert.match(pageSource, /showHpFeedback\(action\.kind, nextHp - hp\)/);
  assert.match(pageSource, /window\.setTimeout\([\s\S]*setCutIns\(\(current\) => current\.slice\(1\)\);[\s\S]*1000/);
  assert.match(pageSource, /current\.some\(\(item\) => item\.event === next\.event\)/);
  assert.match(pageSource, /title: "航路確認"/);
  assert.match(pageSource, /title: "舵輪確保"/);
  assert.match(pageSource, /title: "構造瓦解"/);
  assert.match(pageSource, /title: "資産運用"/);
  assert.match(pageSource, /title: "資産確保"/);
  assert.match(pageSource, /stockEstablished/);
  assert.match(cssSource, /\.hp-feedback-recover/);
  assert.match(cssSource, /\.hp-feedback-damage/);
  assert.match(cssSource, /\.cutin-ribbon \{[^}]*position: fixed;[^}]*max-height: 24vh;[^}]*pointer-events: none;/);
  assert.match(cssSource, /animation: cutin-ribbon-pass 1s/);
  assert.doesNotMatch(pageSource, /cutin-art|cutin-scan|cutin-copy|cutIn\.image|cutIn\.speaker/);
  assert.doesNotMatch(cssSource, /\.cutin \{ position: fixed;[^}]*inset: 0/);
});

test("source/CSS contract: promotes the single Navigator and compacts existing environment readings into the lighthouse", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.equal((pageSource.match(/className="navigator-card instrument-panel"/g) ?? []).length, 1);
  assert.match(pageSource, /LIGHTHOUSE BEACON/);
  assert.match(pageSource, /status-stack environment-instruments/);
  assert.match(pageSource, /<span>ベクトル<\/span><strong>\{vector\}<\/strong>/);
  assert.match(pageSource, /<span>風向き<\/span><strong>\{wind\}<\/strong>/);
  assert.match(pageSource, /<span>海況<\/span><strong>\{seaState\}<\/strong>/);
  assert.match(pageSource, /<span>霧<\/span><strong>\{fogLabel\}<\/strong>/);
  assert.match(cssSource, /"hp navigator sea"/);
  assert.match(cssSource, /@media \(max-width: 780px\)[\s\S]*\.navigator-card \{ order: 2;/);
  assert.match(cssSource, /\.sea-window \{[^}]*order: 3;/);
  assert.match(cssSource, /\.adaptive-beacon \{ order: 4;/);
  assert.match(cssSource, /\.aa \{[^}]*min-width: max-content;[^}]*white-space: pre;[^}]*word-break: keep-all;/);
  assert.match(cssSource, /\.fog-collapse-severe \.beacon-light/);
  assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\)/);
});

test("source/CSS contract: renders the normal HUD trajectory as aligned HP current, HP delta, and SP tracks", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const chartSource = await readFile(new URL("../app/hud-trajectory-chart.tsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(pageSource, /<HudTrajectoryChart entries=\{trajectory\} \/>/);
  assert.match(chartSource, /entries\.slice\(-10\)/);
  assert.match(chartSource, /HP CURRENT/);
  assert.match(chartSource, /HP DELTA/);
  assert.match(chartSource, /SP TRACK/);
  assert.match(chartSource, /entry\.hpDelta/);
  assert.match(chartSource, /entry\.sp/);
  assert.match(chartSource, /entry\.label === "SPストック" \? "資産確保"/);
  assert.match(chartSource, /entry\.label === "SP使用" \? "資産運用"/);
  assert.match(chartSource, /frame\.scrollLeft = frame\.scrollWidth/);
  assert.match(cssSource, /\.hud-trajectory-scroll \{[^}]*overflow-x: auto;[^}]*overflow-y: hidden;/);
  assert.match(cssSource, /\.hud-trajectory-chart \{[^}]*min-width: 640px;/);
  assert.doesNotMatch(chartSource, /chart\.js|recharts|d3|setInterval|fetch\(/i);
});

test("source/CSS contract: compresses only the narrow-phone capability stack without changing the fixed action dock", async () => {
  const cssSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const phoneBlock = cssSource.match(/@media \(max-width: 440px\) \{([\s\S]*?)\n\}/)?.[1] ?? "";

  assert.match(phoneBlock, /\.hp-console \{ min-height: 0; padding: 14px 20px 10px; \}/);
  assert.match(phoneBlock, /\.hp-dial \{ width: 80%; margin: 0 auto -42px; \}/);
  assert.match(phoneBlock, /\.hp-action-readout \{ margin: 2px auto 7px; padding: 8px 11px; \}/);
  assert.match(phoneBlock, /\.capability-status \{ margin: 10px auto 7px;/);
  assert.match(phoneBlock, /\.sp-console \{ grid-template-columns: auto auto; gap: 10px; padding: 11px 14px; \}/);
  assert.match(phoneBlock, /\.core-caption \{ margin-top: 7px; \}/);
  assert.match(cssSource, /@media \(max-width: 780px\)[\s\S]*\.action-dock \{ left: 7px; right: 7px; bottom: 7px;[^}]*\}/);
  assert.doesNotMatch(phoneBlock, /\.action-dock|\.action-trigger|\.navigator-card \{[^}]*order|font-size: 62px/);
});
