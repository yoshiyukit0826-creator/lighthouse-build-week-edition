import type { BeaconSnapshot } from "./navigation-engine";

export {
  makeRouteCorrection,
  ROUTE_LABELS,
  ROUTE_LEVELS,
} from "./navigation-engine";
export type {
  BeaconSnapshot,
  RouteChoice,
  RouteCorrection,
  RouteGuidance,
} from "./navigation-engine";

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
