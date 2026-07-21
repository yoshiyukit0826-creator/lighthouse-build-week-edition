import {
  generateNavigation,
  ROUTE_LABELS,
  type NavigationStateInput,
  type RouteCorrection,
} from "./navigation-engine";

export {
  baseRouteForBeacon,
  readAdaptiveBeacon,
  type BeaconReading,
} from "./navigation-engine";

export type AdaptiveBeaconProps = NavigationStateInput & {
  routeCorrection?: RouteCorrection | null;
};

export default function AdaptiveBeacon(props: AdaptiveBeaconProps) {
  const reading = generateNavigation(props, props.routeCorrection ?? null);
  const ns = props.rsy.r + props.rsy.s + props.rsy.y;
  const correction = props.routeCorrection;

  return (
    <article className={`adaptive-beacon beacon-${reading.tone} instrument-panel`} aria-labelledby="adaptive-beacon-title">
      <header className="beacon-heading">
        <div>
          <span className="panel-label">ADAPTIVE BEACON / v1</span>
          <h2 id="adaptive-beacon-title">灯台から届く、三つの航路候補</h2>
        </div>
        <div className="beacon-signals" aria-label="Beacon参照状態">
          <span>HP {props.hp}</span>
          <span>SP {props.sp}</span>
          <span>NS {ns}</span>
          <span>Z {props.z ?? "航海中"}</span>
          <span>FOG {props.fog}/3</span>
        </div>
      </header>

      <div className="beacon-routes">
        {reading.routes.map((route) => (
          <section key={route.kind}>
            <span>{route.number} / {route.label}</span>
            <h3>{route.title}</h3>
            <p>{route.text}</p>
          </section>
        ))}
      </div>

      {correction && (
        <div className={`beacon-route-correction correction-${correction.choice}`} role="status" aria-live="polite">
          <span>JUNCTION ROUTE / TEMPORARY</span>
          <strong>BASE ROUTE｜{correction.baseRoute}</strong>
          <strong>JUNCTION CHOICE｜{ROUTE_LABELS[correction.choice]}</strong>
          <strong>NEXT GUIDANCE｜{correction.nextGuidance}</strong>
          <small>次のアクションログ入力で消費し、最新状態から通常判定へ戻ります。</small>
        </div>
      )}

      <footer>
        <span aria-hidden="true">◇</span>
        これは命令ではなく、その時点の観測から作った候補です。採用・保留・変更・無視を選べます。
      </footer>
    </article>
  );
}
