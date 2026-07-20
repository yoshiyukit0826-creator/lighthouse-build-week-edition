export type RouteChoice = "continue" | "alternate" | "undecided";

export type RouteGuidance = "整える" | "維持する" | "前へ進む" | "攻める";

export type BeaconSnapshot = {
  position: string;
  nextStep: string;
  alternateRoute: string;
  baseRoute: RouteGuidance;
};

export type TrajectoryEntry = {
  id: string;
  observedAt: string;
  time: string;
  label: string;
  log: string;
  kind: "recover" | "damage" | "stock" | "morning" | "night";
  delta: number;
  hp: number;
  hpDelta: number;
  sp: number;
  spDelta: number;
  fog: number;
  fogDelta: number;
  fogNote?: string;
  beacon: BeaconSnapshot;
  cutIns: string[];
};

export type RouteCorrection = {
  choice: RouteChoice;
  baseRoute: RouteGuidance;
  correction: -1 | 0 | 1;
  nextGuidance: RouteGuidance | "観測する";
  sourceActionId: string;
};

export const ROUTE_LABELS: Record<RouteChoice, string> = {
  continue: "このまま進む",
  alternate: "迂回する",
  undecided: "今は決めない",
};

export const ROUTE_LEVELS: RouteGuidance[] = ["整える", "維持する", "前へ進む", "攻める"];

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
  rsy: { r: number; s: number; y: number };
  z: number | null;
}): RouteCorrection {
  if (choice === "undecided") {
    return { choice, baseRoute, correction: 0, nextGuidance: "観測する", sourceActionId };
  }

  const ns = rsy.r + rsy.s + rsy.y;
  const baseIndex = ROUTE_LEVELS.indexOf(baseRoute);
  const safetyCeiling = hp < 30 || fog >= 3 || ns <= 1
    ? 0
    : hp < 50 || fog >= 2 || z === 0 || ns <= 2
      ? 1
      : hp < 80
        ? 2
        : 3;
  const correction = choice === "continue" ? 1 : -1;
  const nextIndex = correction > 0
    ? Math.min(baseIndex + 1, safetyCeiling)
    : Math.max(baseIndex - 1, 0);

  return {
    choice,
    baseRoute,
    correction,
    nextGuidance: ROUTE_LEVELS[nextIndex],
    sourceActionId,
  };
}
