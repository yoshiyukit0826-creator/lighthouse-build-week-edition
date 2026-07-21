import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import ts from "typescript";

const moduleCache = new Map();

function resolveTypeScriptModule(specifier, parentFile) {
  const base = resolve(dirname(parentFile), specifier);
  const candidates = [base, `${base}.ts`, `${base}.tsx`];
  const match = candidates.find((candidate) => existsSync(candidate));
  if (!match) throw new Error(`Cannot resolve ${specifier} from ${parentFile}`);
  return match;
}

function loadTypeScriptModule(file) {
  const absoluteFile = resolve(file);
  const cached = moduleCache.get(absoluteFile);
  if (cached) return cached.exports;

  const loadedModule = { exports: {} };
  moduleCache.set(absoluteFile, loadedModule);
  const source = readFileSync(absoluteFile, "utf8");
  const compiled = ts.transpileModule(source, {
    fileName: absoluteFile,
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const execute = runInThisContext(
    `(function (exports, require, module) { ${compiled}\n})`,
    { filename: absoluteFile },
  );
  const localRequire = (specifier) => {
    if (specifier === "react/jsx-runtime") {
      return { Fragment: Symbol.for("react.fragment"), jsx() {}, jsxs() {} };
    }
    if (specifier.startsWith(".")) {
      return loadTypeScriptModule(resolveTypeScriptModule(specifier, absoluteFile));
    }
    throw new Error(`Unsupported test module import: ${specifier}`);
  };
  execute(loadedModule.exports, localRequire, loadedModule);
  return loadedModule.exports;
}

const { readAdaptiveBeacon } = loadTypeScriptModule(
  fileURLToPath(new URL("../app/adaptive-beacon.tsx", import.meta.url)),
);
const { makeRouteCorrection, ROUTE_LABELS } = loadTypeScriptModule(
  fileURLToPath(new URL("../app/trajectory.ts", import.meta.url)),
);

const readingCases = [
  {
    name: "safe ordinary voyage",
    input: { hp: 63, sp: 3, fog: 0, rsy: { r: 2, s: 1, y: 1 }, z: null, statusLabel: "OPTIMAL", vector: "維持", wind: "流れを作れ", recentKind: "recover", recentLabel: "荷揃え完了" },
    expected: {
      tone: "steady",
      position: "HP 63・OPTIMAL。ベクトルは「維持」、風向きは「流れを作れ」。今の針路を選び直せる位置にいます。",
      nextStep: "今の針路を維持しながら、完了条件が見える一件だけ前へ進めてみてもよさそうです。",
      alternateRoute: "状況が変わったら、前進・仕込み・停船のどれに戻っても構いません。今の提案を採用しない選択も残っています。",
      baseRoute: "維持する",
    },
  },
  {
    name: "caution",
    input: { hp: 45, sp: 0, fog: 0, rsy: { r: 1, s: 1, y: 1 }, z: 1, statusLabel: "CAUTION", vector: "安全", wind: "見落としを洗え", recentKind: "recover", recentLabel: "補給" },
    expected: {
      tone: "watch",
      position: "HP 45・CAUTION。ベクトルは「安全」、風向きは「見落としを洗え」。今の針路を選び直せる位置にいます。",
      nextStep: "今の針路を維持しながら、完了条件が見える一件だけ前へ進めてみてもよさそうです。",
      alternateRoute: "小さな引っ掛かりが大きくなった場合は、針路維持をやめて再観測へ戻ることもできます。",
      baseRoute: "維持する",
    },
  },
  {
    name: "danger with stored reserve",
    input: { hp: 20, sp: 2, fog: 1, rsy: { r: 1, s: 1, y: 1 }, z: 1, statusLabel: "DANGER", vector: "立て直し", wind: "残務を吸収せよ", recentKind: "damage", recentLabel: "材料返品" },
    expected: {
      tone: "shelter",
      position: "HP 20・DANGER。直近の「材料返品」を受け、今は仕事量より帰還路を意識したい位置に見えます。",
      nextStep: "目の前の一件へ航路を絞り、必要ならSP 2の一部を使える余白を残してみてもよさそうです。",
      alternateRoute: "負荷が続く場合は、SP 2を温存したまま停船するか、一つ使って再出航するかを後から選べます。",
      baseRoute: "整える",
    },
  },
  {
    name: "high fog",
    input: { hp: 70, sp: 2, fog: 3, rsy: { r: 2, s: 1, y: 1 }, z: 2, statusLabel: "OPTIMAL", vector: "維持", wind: "流れを作れ", recentKind: "damage", recentLabel: "探し物" },
    expected: {
      tone: "shelter",
      position: "HP 70は残っていますが、霧 3/3で判断の見通しが落ちています。力より視界を整えたい局面に見えます。",
      nextStep: "判断を増やさず、段取り整理か荷揃え完了につながる確認を一つだけ選んでみる案があります。",
      alternateRoute: "状況が読みにくいままなら、前進を保留し、段取り整理または荷揃え完了で霧を下げてから選び直す手もあります。",
      baseRoute: "整える",
    },
  },
  {
    name: "low reserve",
    input: { hp: 70, sp: 1, fog: 0, rsy: { r: 1, s: 0, y: 0 }, z: 2, statusLabel: "OPTIMAL", vector: "安全", wind: "見落としを洗え", recentKind: "morning", recentLabel: "朝ナビ 1・0・0" },
    expected: {
      tone: "watch",
      position: "NS 1（R1・S0・Y0）。能力そのものより、残務・段取り・余裕の足場が薄い朝として読めます。",
      nextStep: "日々の段取りを一つ再確認し、見落としを減らす方向から始めてもよさそうです。",
      alternateRoute: "割り込みが増えた場合は、予定の一部を次の観測点へ送り、今日の航路を短くする方法もあります。",
      baseRoute: "整える",
    },
  },
  {
    name: "prepared reserve",
    input: { hp: 85, sp: 4, fog: 0, rsy: { r: 2, s: 2, y: 1 }, z: 2, statusLabel: "SAFE", vector: "攻める", wind: "整えは怠るな", recentKind: "stock", recentLabel: "SPストック" },
    expected: {
      tone: "steady",
      position: "HP 85・NS 5。視界と余力がそろい、選択肢を持ったまま進める現在地に見えます。",
      nextStep: "今の余力を使い切らず、未来の一手をSPへ一つ積んでおく選択もできそうです。",
      alternateRoute: "予定が変わった場合は、SP 4の一部を放出する案と、そのまま未来へ残す案の両方を保てます。",
      baseRoute: "前へ進む",
    },
  },
  {
    name: "unresolved night observation",
    input: { hp: 70, sp: 1, fog: 0, rsy: { r: 2, s: 1, y: 1 }, z: 0, statusLabel: "OPTIMAL", vector: "維持", wind: "流れを作れ", recentKind: "night", recentLabel: "夜ナビ Z0" },
    expected: {
      tone: "watch",
      position: "HP 70・霧 0/3。夜Z0の未回収が残っているため、今日の現在地には翌朝へ持ち越した観測点があります。",
      nextStep: "夜Z0で残った観測点を一つ選び、今朝の事実と変わったかだけ確かめる方法があります。",
      alternateRoute: "未回収が今日の状況と合わなくなった場合は、夜Z0を古い観測として保留し、新しい事実から航路を引き直せます。",
      baseRoute: "維持する",
    },
  },
];

test("characterizes representative Adaptive Beacon readings before extraction", () => {
  for (const { name, input, expected } of readingCases) {
    assert.deepEqual(readAdaptiveBeacon(input), expected, name);
  }
});

test("characterizes the existing JUNCTION labels and one-level corrections", () => {
  assert.deepEqual(ROUTE_LABELS, {
    continue: "このまま進む",
    alternate: "迂回する",
    undecided: "今は決めない",
  });

  const shared = {
    baseRoute: "維持する",
    sourceActionId: "action-7",
    hp: 85,
    fog: 0,
    rsy: { r: 2, s: 2, y: 1 },
    z: 2,
  };
  assert.deepEqual(makeRouteCorrection({ ...shared, choice: "continue" }), {
    choice: "continue",
    baseRoute: "維持する",
    correction: 1,
    nextGuidance: "前へ進む",
    sourceActionId: "action-7",
  });
  assert.deepEqual(makeRouteCorrection({ ...shared, choice: "alternate" }), {
    choice: "alternate",
    baseRoute: "維持する",
    correction: -1,
    nextGuidance: "整える",
    sourceActionId: "action-7",
  });
  assert.deepEqual(makeRouteCorrection({ ...shared, choice: "undecided" }), {
    choice: "undecided",
    baseRoute: "維持する",
    correction: 0,
    nextGuidance: "観測する",
    sourceActionId: "action-7",
  });
});

test("characterizes the existing safety ceiling for a Continue correction", () => {
  const correction = makeRouteCorrection({
    choice: "continue",
    baseRoute: "整える",
    sourceActionId: "action-danger",
    hp: 20,
    fog: 1,
    rsy: { r: 1, s: 1, y: 1 },
    z: 1,
  });
  assert.equal(correction.nextGuidance, "整える");
});
