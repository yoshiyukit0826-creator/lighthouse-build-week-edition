export type RouteChoice = "continue" | "alternate" | "undecided";

export type RouteGuidance = "整える" | "維持する" | "前へ進む" | "攻める";

export type NavigationTone = "steady" | "watch" | "shelter";

export type NavigationRecentKind = "recover" | "damage" | "stock" | "morning" | "night";

export type NavigationRsy = Readonly<{
  r: number;
  s: number;
  y: number;
}>;

export type NavigationStateInput = Readonly<{
  hp: number;
  sp: number;
  fog: number;
  rsy: NavigationRsy;
  z: number | null;
  statusLabel: string;
  vector: string;
  wind: string;
  recentKind: NavigationRecentKind;
  recentLabel: string;
}>;

export type RouteCorrection = Readonly<{
  choice: RouteChoice;
  baseRoute: RouteGuidance;
  correction: -1 | 0 | 1;
  nextGuidance: RouteGuidance | "観測する";
  sourceActionId: string;
}>;

export type BeaconSnapshot = Readonly<{
  position: string;
  nextStep: string;
  alternateRoute: string;
  baseRoute: RouteGuidance;
}>;

export type BeaconReading = BeaconSnapshot & Readonly<{
  tone: NavigationTone;
}>;

export const ROUTE_LABELS: Readonly<Record<RouteChoice, string>> = Object.freeze({
  continue: "このまま進む",
  alternate: "迂回する",
  undecided: "今は決めない",
});

export const ROUTE_LEVELS: readonly RouteGuidance[] = Object.freeze(["整える", "維持する", "前へ進む", "攻める"]);

export const NAVIGATION_ROUTE_LABELS = Object.freeze({
  currentPosition: Object.freeze({ number: "01", label: "CURRENT POSITION", title: "現在地の解釈" }),
  nextStep: Object.freeze({ number: "02", label: "NEXT STEP", title: "無理のない次の一歩" }),
  alternateRoute: Object.freeze({ number: "03", label: "ALTERNATE ROUTE", title: "状況が変わった場合の迂回路" }),
});

export type NavigationRouteOutput = Readonly<{
  kind: "current-position" | "next-step" | "alternate-route";
  number: "01" | "02" | "03";
  label: "CURRENT POSITION" | "NEXT STEP" | "ALTERNATE ROUTE";
  title: string;
  text: string;
}>;

export type NavigationRoutes = readonly [NavigationRouteOutput, NavigationRouteOutput, NavigationRouteOutput];

export type NavigationReading = BeaconReading & Readonly<{
  safetyCeiling: RouteGuidance;
  routes: NavigationRoutes;
  appliedCorrection: RouteCorrection | null;
}>;

export type RouteCorrectionConsumption = Readonly<{
  appliedCorrection: RouteCorrection | null;
  pendingCorrection: RouteCorrection | null;
}>;

function navigationStrength(guidance: RouteGuidance) {
  return ROUTE_LEVELS.indexOf(guidance);
}

function rsyTotal(rsy: NavigationRsy) {
  return rsy.r + rsy.s + rsy.y;
}

export function safetyCeilingForNavigation({ hp, fog, rsy, z }: Pick<NavigationStateInput, "hp" | "fog" | "rsy" | "z">): RouteGuidance {
  const ns = rsyTotal(rsy);
  if (hp < 30 || fog >= 3 || ns <= 1) return "整える";
  if (hp < 50 || fog >= 2 || z === 0 || ns <= 2) return "維持する";
  if (hp < 80) return "前へ進む";
  return "攻める";
}

export function baseRouteForNavigation({ hp, fog, rsy, z }: Pick<NavigationStateInput, "hp" | "fog" | "rsy" | "z">): RouteGuidance {
  const ns = rsyTotal(rsy);
  if (hp < 30 || fog >= 3 || ns <= 1) return "整える";
  if (hp < 50 || fog >= 2 || z === 0 || ns <= 2) return "維持する";
  if (hp >= 80 && fog === 0 && ns >= 5 && z !== 0) return "前へ進む";
  return "維持する";
}

export const baseRouteForBeacon = baseRouteForNavigation;

function interpretCurrentPosition({ hp, fog, rsy, z, statusLabel, vector, wind, recentLabel }: NavigationStateInput) {
  const ns = rsyTotal(rsy);
  if (hp < 10) {
    return `HP ${hp}・${statusLabel}。今は航路を広げるより、動ける範囲を小さく見積もりたい現在地に見えます。`;
  }
  if (fog >= 3) {
    return `HP ${hp}は残っていますが、霧 ${fog}/3で判断の見通しが落ちています。力より視界を整えたい局面に見えます。`;
  }
  if (hp < 30) {
    return `HP ${hp}・${statusLabel}。直近の「${recentLabel}」を受け、今は仕事量より帰還路を意識したい位置に見えます。`;
  }
  if (fog >= 2) {
    return `HP ${hp}を保ちながら、霧 ${fog}/3が判断へ干渉しています。現在地は前進と再確認の境目に見えます。`;
  }
  if (z === 0) {
    return `HP ${hp}・霧 ${fog}/3。夜Z0の未回収が残っているため、今日の現在地には翌朝へ持ち越した観測点があります。`;
  }
  if (ns <= 2) {
    return `NS ${ns}（R${rsy.r}・S${rsy.s}・Y${rsy.y}）。能力そのものより、残務・段取り・余裕の足場が薄い朝として読めます。`;
  }
  if (hp >= 80 && ns >= 5) {
    return `HP ${hp}・NS ${ns}。視界と余力がそろい、選択肢を持ったまま進める現在地に見えます。`;
  }
  return `HP ${hp}・${statusLabel}。ベクトルは「${vector}」、風向きは「${wind}」。今の針路を選び直せる位置にいます。`;
}

function selectNextStep({ hp, sp, fog, rsy, z }: NavigationStateInput) {
  if (hp < 30 && sp > 0) {
    return `目の前の一件へ航路を絞り、必要ならSP ${sp}の一部を使える余白を残してみてもよさそうです。`;
  }
  if (hp < 30) {
    return "新しい仕事を増やす前に、補給か足場確保を一つ選び、次の判断を小さくしてみる案があります。";
  }
  if (fog >= 3) {
    return "判断を増やさず、段取り整理か荷揃え完了につながる確認を一つだけ選んでみる案があります。";
  }
  if (rsy.r === 0) {
    return "残務の所在を一つだけ見える形にすると、立て直しの入口を作れそうです。";
  }
  if (rsy.s === 0) {
    return "日々の段取りを一つ再確認し、見落としを減らす方向から始めてもよさそうです。";
  }
  if (rsy.y === 0) {
    return "予定を足すより、割り込みを受けても崩れにくい余白を一つ確保する案があります。";
  }
  if (z === 0) {
    return "夜Z0で残った観測点を一つ選び、今朝の事実と変わったかだけ確かめる方法があります。";
  }
  if (hp >= 80 && sp < 5) {
    return "今の余力を使い切らず、未来の一手をSPへ一つ積んでおく選択もできそうです。";
  }
  return "今の針路を維持しながら、完了条件が見える一件だけ前へ進めてみてもよさそうです。";
}

function selectAlternateRoute({ hp, sp, fog, rsy, z, recentKind, recentLabel }: NavigationStateInput) {
  if (fog >= 2) {
    return "状況が読みにくいままなら、前進を保留し、段取り整理または荷揃え完了で霧を下げてから選び直す手もあります。";
  }
  if (hp < 50 && sp > 0) {
    return `負荷が続く場合は、SP ${sp}を温存したまま停船するか、一つ使って再出航するかを後から選べます。`;
  }
  if (z === 0) {
    return "未回収が今日の状況と合わなくなった場合は、夜Z0を古い観測として保留し、新しい事実から航路を引き直せます。";
  }
  if (recentKind === "damage") {
    return `「${recentLabel}」が単発で終わらない場合は、回復系の一手へ切り替えるか、何もしない時間を選ぶ余地があります。`;
  }
  if (sp >= 4) {
    return `予定が変わった場合は、SP ${sp}の一部を放出する案と、そのまま未来へ残す案の両方を保てます。`;
  }
  if (rsy.y === 0) {
    return "割り込みが増えた場合は、予定の一部を次の観測点へ送り、今日の航路を短くする方法もあります。";
  }
  if (z === 1) {
    return "小さな引っ掛かりが大きくなった場合は、針路維持をやめて再観測へ戻ることもできます。";
  }
  return "状況が変わったら、前進・仕込み・停船のどれに戻っても構いません。今の提案を採用しない選択も残っています。";
}

function correctedNextStep(nextStep: string, correction: RouteCorrection | null) {
  if (!correction) return nextStep;
  if (correction.choice === "undecided") {
    return "もう少し状況を見ます。次のアクションログまたは状態変化を待ち、その後に通常判定へ戻ります。";
  }
  if (correction.choice === "continue") {
    return `利用者が選んだ航路を受け、次の一手は「${correction.nextGuidance}」寄りに一段だけ調整します。現在の安全範囲は越えません。`;
  }
  return `利用者が選んだ航路を受け、次の一手は「${correction.nextGuidance}」寄りに一段だけ慎重にします。観測値は変えません。`;
}

function navigationRoutes(position: string, nextStep: string, alternateRoute: string): NavigationRoutes {
  return Object.freeze([
    Object.freeze({ kind: "current-position", ...NAVIGATION_ROUTE_LABELS.currentPosition, text: position }),
    Object.freeze({ kind: "next-step", ...NAVIGATION_ROUTE_LABELS.nextStep, text: nextStep }),
    Object.freeze({ kind: "alternate-route", ...NAVIGATION_ROUTE_LABELS.alternateRoute, text: alternateRoute }),
  ]) as NavigationRoutes;
}

export function generateNavigation(input: NavigationStateInput, correction: RouteCorrection | null = null): NavigationReading {
  const ns = rsyTotal(input.rsy);
  const tone: NavigationTone = input.hp < 30 || input.fog >= 3
    ? "shelter"
    : input.hp < 50 || input.fog >= 2 || input.z === 0 || ns <= 2
      ? "watch"
      : "steady";
  const position = interpretCurrentPosition(input);
  const nextStep = correctedNextStep(selectNextStep(input), correction);
  const alternateRoute = selectAlternateRoute(input);
  const baseRoute = baseRouteForNavigation(input);

  return Object.freeze({
    tone,
    position,
    nextStep,
    alternateRoute,
    baseRoute,
    safetyCeiling: safetyCeilingForNavigation(input),
    routes: navigationRoutes(position, nextStep, alternateRoute),
    appliedCorrection: correction,
  });
}

export function readAdaptiveBeacon(input: NavigationStateInput): BeaconReading {
  const { tone, position, nextStep, alternateRoute, baseRoute } = generateNavigation(input);
  return { tone, position, nextStep, alternateRoute, baseRoute };
}

export function makeRouteCorrection({
  choice,
  baseRoute,
  sourceActionId,
  hp,
  fog,
  rsy,
  z,
}: {
  choice: RouteChoice;
  baseRoute: RouteGuidance;
  sourceActionId: string;
  hp: number;
  fog: number;
  rsy: NavigationRsy;
  z: number | null;
}): RouteCorrection {
  if (choice === "undecided") {
    return { choice, baseRoute, correction: 0, nextGuidance: "観測する", sourceActionId };
  }

  const correction = choice === "continue" ? 1 : -1;
  const desiredIndex = navigationStrength(baseRoute) + correction;
  const ceilingIndex = navigationStrength(safetyCeilingForNavigation({ hp, fog, rsy, z }));
  const nextIndex = Math.min(Math.max(desiredIndex, 0), ceilingIndex);

  return {
    choice,
    baseRoute,
    correction,
    nextGuidance: ROUTE_LEVELS[nextIndex],
    sourceActionId,
  };
}

export function consumeRouteCorrection(
  correction: RouteCorrection | null,
  actionId: string,
): RouteCorrectionConsumption {
  if (!correction) return { appliedCorrection: null, pendingCorrection: null };
  if (actionId === correction.sourceActionId) {
    return { appliedCorrection: null, pendingCorrection: correction };
  }
  return { appliedCorrection: correction, pendingCorrection: null };
}
