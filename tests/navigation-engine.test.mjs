import assert from "node:assert/strict";
import test from "node:test";
import * as navigationEngine from "../app/navigation-engine.ts";

const {
  consumeRouteCorrection,
  generateNavigation,
  makeRouteCorrection,
  NAVIGATION_ROUTE_LABELS,
  ROUTE_LABELS,
} = navigationEngine;

const ordinaryState = {
  hp: 63,
  sp: 3,
  fog: 0,
  rsy: { r: 2, s: 1, y: 1 },
  z: null,
  statusLabel: "OPTIMAL",
  vector: "維持",
  wind: "流れを作れ",
  recentKind: "recover",
  recentLabel: "荷揃え完了",
};

function correctionFor(choice, state = ordinaryState, baseRoute = "維持する") {
  return makeRouteCorrection({
    choice,
    baseRoute,
    sourceActionId: "action-7",
    hp: state.hp,
    fog: state.fog,
    rsy: state.rsy,
    z: state.z,
  });
}

test("identical navigation input always produces identical output", () => {
  const first = generateNavigation(structuredClone(ordinaryState));
  const second = generateNavigation(structuredClone(ordinaryState));
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});

test("the engine returns exactly CURRENT POSITION, NEXT STEP, and ALTERNATE ROUTE", () => {
  const reading = generateNavigation(ordinaryState);
  assert.equal(reading.routes.length, 3);
  assert.deepEqual(reading.routes.map(({ kind, label }) => ({ kind, label })), [
    { kind: "current-position", label: "CURRENT POSITION" },
    { kind: "next-step", label: "NEXT STEP" },
    { kind: "alternate-route", label: "ALTERNATE ROUTE" },
  ]);
  assert.equal(reading.routes[0].text, reading.position);
  assert.equal(reading.routes[1].text, reading.nextStep);
  assert.equal(reading.routes[2].text, reading.alternateRoute);
});

test("representative safe, caution, danger, high-fog, low-reserve, and prepared-reserve states respect their ceilings", () => {
  const cases = [
    { name: "safe", state: ordinaryState, tone: "steady", baseRoute: "維持する", ceiling: "前へ進む" },
    { name: "caution", state: { ...ordinaryState, hp: 45, statusLabel: "CAUTION" }, tone: "watch", baseRoute: "維持する", ceiling: "維持する" },
    { name: "danger", state: { ...ordinaryState, hp: 20, statusLabel: "DANGER" }, tone: "shelter", baseRoute: "整える", ceiling: "整える" },
    { name: "high fog", state: { ...ordinaryState, hp: 70, fog: 3 }, tone: "shelter", baseRoute: "整える", ceiling: "整える" },
    { name: "low reserve", state: { ...ordinaryState, hp: 70, rsy: { r: 1, s: 0, y: 0 } }, tone: "watch", baseRoute: "整える", ceiling: "整える" },
    { name: "prepared reserve", state: { ...ordinaryState, hp: 85, sp: 4, rsy: { r: 2, s: 2, y: 1 }, z: 2, statusLabel: "SAFE", vector: "攻める", wind: "整えは怠るな", recentKind: "stock", recentLabel: "SPストック" }, tone: "steady", baseRoute: "前へ進む", ceiling: "攻める" },
  ];

  for (const { name, state, tone, baseRoute, ceiling } of cases) {
    const reading = generateNavigation(state);
    assert.equal(reading.tone, tone, `${name} tone`);
    assert.equal(reading.baseRoute, baseRoute, `${name} base route`);
    assert.equal(reading.safetyCeiling, ceiling, `${name} safety ceiling`);
  }
  assert.match(generateNavigation(cases.at(-1).state).nextStep, /未来の一手をSPへ一つ積んでおく/);
});

test("Continue raises only the next guidance by one safe level", () => {
  const correction = correctionFor("continue");
  const reading = generateNavigation(ordinaryState, correction);
  assert.equal(correction.correction, 1);
  assert.equal(correction.nextGuidance, "前へ進む");
  assert.equal(reading.appliedCorrection, correction);
  assert.equal(reading.nextStep, "利用者が選んだ航路を受け、次の一手は「前へ進む」寄りに一段だけ調整します。現在の安全範囲は越えません。");
});

test("Detour lowers only the next guidance by one level", () => {
  const correction = correctionFor("alternate");
  const reading = generateNavigation(ordinaryState, correction);
  assert.equal(correction.correction, -1);
  assert.equal(correction.nextGuidance, "整える");
  assert.equal(reading.appliedCorrection, correction);
  assert.equal(reading.nextStep, "利用者が選んだ航路を受け、次の一手は「整える」寄りに一段だけ慎重にします。観測値は変えません。");
});

test("Decide Later observes without changing guidance level", () => {
  const correction = correctionFor("undecided");
  const reading = generateNavigation(ordinaryState, correction);
  assert.equal(correction.correction, 0);
  assert.equal(correction.nextGuidance, "観測する");
  assert.equal(reading.nextStep, "もう少し状況を見ます。次のアクションログまたは状態変化を待ち、その後に通常判定へ戻ります。");
});

test("a pending correction is consumed by one subsequent action only", () => {
  const correction = correctionFor("continue");
  const sameAction = consumeRouteCorrection(correction, correction.sourceActionId);
  assert.equal(sameAction.appliedCorrection, null);
  assert.equal(sameAction.pendingCorrection, correction);

  const nextAction = consumeRouteCorrection(sameAction.pendingCorrection, "action-8");
  assert.equal(nextAction.appliedCorrection, correction);
  assert.equal(nextAction.pendingCorrection, null);

  const laterAction = consumeRouteCorrection(nextAction.pendingCorrection, "action-9");
  assert.deepEqual(laterAction, { appliedCorrection: null, pendingCorrection: null });
});

test("no correction can raise guidance above the state safety ceiling", () => {
  const cases = [
    { hp: 20, fog: 0, rsy: { r: 2, s: 1, y: 1 }, z: 2, expected: "整える" },
    { hp: 70, fog: 3, rsy: { r: 2, s: 1, y: 1 }, z: 2, expected: "整える" },
    { hp: 45, fog: 0, rsy: { r: 2, s: 1, y: 1 }, z: 2, expected: "維持する" },
    { hp: 70, fog: 0, rsy: { r: 2, s: 1, y: 1 }, z: 2, expected: "前へ進む" },
    { hp: 85, fog: 0, rsy: { r: 2, s: 2, y: 1 }, z: 2, expected: "攻める" },
  ];

  for (const state of cases) {
    const correction = makeRouteCorrection({
      choice: "continue",
      baseRoute: "攻める",
      sourceActionId: "unsafe-request",
      ...state,
    });
    assert.equal(correction.nextGuidance, state.expected);
  }
});

test("navigation generation and correction do not mutate input state", () => {
  const input = structuredClone(ordinaryState);
  Object.freeze(input.rsy);
  Object.freeze(input);
  const before = structuredClone(input);

  const reading = generateNavigation(input);
  makeRouteCorrection({
    choice: "continue",
    baseRoute: reading.baseRoute,
    sourceActionId: "immutable",
    hp: input.hp,
    fog: input.fog,
    rsy: input.rsy,
    z: input.z,
  });

  assert.deepEqual(input, before);
  assert.ok(Object.isFrozen(reading));
  assert.ok(Object.isFrozen(reading.routes));
});

test("past trajectory is ignored and never restored or rewritten", () => {
  const trajectory = Object.freeze([
    Object.freeze({ id: "past-1", hp: 20, sp: 0, fog: 3, log: "immutable past" }),
  ]);
  const before = structuredClone(trajectory);
  const reading = generateNavigation({ ...ordinaryState, trajectory });

  assert.deepEqual(trajectory, before);
  assert.equal("trajectory" in reading, false);
  assert.equal(reading.position.includes("HP 63"), true);
});

test("the navigation engine exposes no resume-from-snapshot or restoration path", () => {
  const forbiddenExports = Object.keys(navigationEngine).filter((name) => /resume|restore|rewind|snapshot/i.test(name));
  assert.deepEqual(forbiddenExports, []);
});

test("route and JUNCTION labels retain the required product semantics", () => {
  assert.deepEqual(ROUTE_LABELS, {
    continue: "このまま進む",
    alternate: "迂回する",
    undecided: "今は決めない",
  });
  assert.deepEqual(Object.values(NAVIGATION_ROUTE_LABELS).map(({ label }) => label), [
    "CURRENT POSITION",
    "NEXT STEP",
    "ALTERNATE ROUTE",
  ]);
});
