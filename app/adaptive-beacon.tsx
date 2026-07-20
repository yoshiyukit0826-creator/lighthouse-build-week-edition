import type { RouteCorrection, RouteGuidance } from "./trajectory";

type BeaconRsy = {
  r: number;
  s: number;
  y: number;
};

export type AdaptiveBeaconProps = {
  hp: number;
  sp: number;
  fog: number;
  rsy: BeaconRsy;
  z: number | null;
  statusLabel: string;
  vector: string;
  wind: string;
  recentKind: "recover" | "damage" | "stock" | "morning" | "night";
  recentLabel: string;
  routeCorrection?: RouteCorrection | null;
};

export type BeaconReading = {
  tone: "steady" | "watch" | "shelter";
  position: string;
  nextStep: string;
  alternateRoute: string;
  baseRoute: RouteGuidance;
};

export function baseRouteForBeacon({ hp, fog, rsy, z }: Pick<AdaptiveBeaconProps, "hp" | "fog" | "rsy" | "z">): RouteGuidance {
  const ns = rsy.r + rsy.s + rsy.y;
  if (hp < 30 || fog >= 3 || ns <= 1) return "整える";
  if (hp < 50 || fog >= 2 || z === 0 || ns <= 2) return "維持する";
  if (hp >= 80 && fog === 0 && ns >= 5 && z !== 0) return "前へ進む";
  return "維持する";
}

export function readAdaptiveBeacon({
  hp,
  sp,
  fog,
  rsy,
  z,
  statusLabel,
  vector,
  wind,
  recentKind,
  recentLabel,
}: AdaptiveBeaconProps): BeaconReading {
  const ns = rsy.r + rsy.s + rsy.y;
  const tone = hp < 30 || fog >= 3 ? "shelter" : hp < 50 || fog >= 2 || z === 0 || ns <= 2 ? "watch" : "steady";

  let position: string;
  if (hp < 10) {
    position = `HP ${hp}・${statusLabel}。今は航路を広げるより、動ける範囲を小さく見積もりたい現在地に見えます。`;
  } else if (fog >= 3) {
    position = `HP ${hp}は残っていますが、霧 ${fog}/3で判断の見通しが落ちています。力より視界を整えたい局面に見えます。`;
  } else if (hp < 30) {
    position = `HP ${hp}・${statusLabel}。直近の「${recentLabel}」を受け、今は仕事量より帰還路を意識したい位置に見えます。`;
  } else if (fog >= 2) {
    position = `HP ${hp}を保ちながら、霧 ${fog}/3が判断へ干渉しています。現在地は前進と再確認の境目に見えます。`;
  } else if (z === 0) {
    position = `HP ${hp}・霧 ${fog}/3。夜Z0の未回収が残っているため、今日の現在地には翌朝へ持ち越した観測点があります。`;
  } else if (ns <= 2) {
    position = `NS ${ns}（R${rsy.r}・S${rsy.s}・Y${rsy.y}）。能力そのものより、残務・段取り・余裕の足場が薄い朝として読めます。`;
  } else if (hp >= 80 && ns >= 5) {
    position = `HP ${hp}・NS ${ns}。視界と余力がそろい、選択肢を持ったまま進める現在地に見えます。`;
  } else {
    position = `HP ${hp}・${statusLabel}。ベクトルは「${vector}」、風向きは「${wind}」。今の針路を選び直せる位置にいます。`;
  }

  let nextStep: string;
  if (hp < 30 && sp > 0) {
    nextStep = `目の前の一件へ航路を絞り、必要ならSP ${sp}の一部を使える余白を残してみてもよさそうです。`;
  } else if (hp < 30) {
    nextStep = "新しい仕事を増やす前に、補給か足場確保を一つ選び、次の判断を小さくしてみる案があります。";
  } else if (fog >= 3) {
    nextStep = "判断を増やさず、段取り整理か荷揃え完了につながる確認を一つだけ選んでみる案があります。";
  } else if (rsy.r === 0) {
    nextStep = "残務の所在を一つだけ見える形にすると、立て直しの入口を作れそうです。";
  } else if (rsy.s === 0) {
    nextStep = "日々の段取りを一つ再確認し、見落としを減らす方向から始めてもよさそうです。";
  } else if (rsy.y === 0) {
    nextStep = "予定を足すより、割り込みを受けても崩れにくい余白を一つ確保する案があります。";
  } else if (z === 0) {
    nextStep = "夜Z0で残った観測点を一つ選び、今朝の事実と変わったかだけ確かめる方法があります。";
  } else if (hp >= 80 && sp < 5) {
    nextStep = `今の余力を使い切らず、未来の一手をSPへ一つ積んでおく選択もできそうです。`;
  } else {
    nextStep = "今の針路を維持しながら、完了条件が見える一件だけ前へ進めてみてもよさそうです。";
  }

  let alternateRoute: string;
  if (fog >= 2) {
    alternateRoute = "状況が読みにくいままなら、前進を保留し、段取り整理または荷揃え完了で霧を下げてから選び直す手もあります。";
  } else if (hp < 50 && sp > 0) {
    alternateRoute = `負荷が続く場合は、SP ${sp}を温存したまま停船するか、一つ使って再出航するかを後から選べます。`;
  } else if (z === 0) {
    alternateRoute = "未回収が今日の状況と合わなくなった場合は、夜Z0を古い観測として保留し、新しい事実から航路を引き直せます。";
  } else if (recentKind === "damage") {
    alternateRoute = `「${recentLabel}」が単発で終わらない場合は、回復系の一手へ切り替えるか、何もしない時間を選ぶ余地があります。`;
  } else if (sp >= 4) {
    alternateRoute = `予定が変わった場合は、SP ${sp}の一部を放出する案と、そのまま未来へ残す案の両方を保てます。`;
  } else if (rsy.y === 0) {
    alternateRoute = "割り込みが増えた場合は、予定の一部を次の観測点へ送り、今日の航路を短くする方法もあります。";
  } else if (z === 1) {
    alternateRoute = "小さな引っ掛かりが大きくなった場合は、針路維持をやめて再観測へ戻ることもできます。";
  } else {
    alternateRoute = "状況が変わったら、前進・仕込み・停船のどれに戻っても構いません。今の提案を採用しない選択も残っています。";
  }

  return { tone, position, nextStep, alternateRoute, baseRoute: baseRouteForBeacon({ hp, fog, rsy, z }) };
}

export default function AdaptiveBeacon(props: AdaptiveBeaconProps) {
  const reading = readAdaptiveBeacon(props);
  const ns = props.rsy.r + props.rsy.s + props.rsy.y;
  const correction = props.routeCorrection;
  const correctedNextStep = correction
    ? correction.choice === "undecided"
      ? "もう少し状況を見ます。次のアクションログまたは状態変化を待ち、その後に通常判定へ戻ります。"
      : correction.choice === "continue"
        ? `利用者が選んだ航路を受け、次の一手は「${correction.nextGuidance}」寄りに一段だけ調整します。現在の安全範囲は越えません。`
        : `利用者が選んだ航路を受け、次の一手は「${correction.nextGuidance}」寄りに一段だけ慎重にします。観測値は変えません。`
    : reading.nextStep;

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
        <section>
          <span>01 / CURRENT POSITION</span>
          <h3>現在地の解釈</h3>
          <p>{reading.position}</p>
        </section>
        <section>
          <span>02 / NEXT STEP</span>
          <h3>無理のない次の一歩</h3>
          <p>{correctedNextStep}</p>
        </section>
        <section>
          <span>03 / ALTERNATE ROUTE</span>
          <h3>状況が変わった場合の迂回路</h3>
          <p>{reading.alternateRoute}</p>
        </section>
      </div>

      {correction && (
        <div className={`beacon-route-correction correction-${correction.choice}`} role="status" aria-live="polite">
          <span>JUNCTION ROUTE / TEMPORARY</span>
          <strong>BASE ROUTE｜{correction.baseRoute}</strong>
          <strong>JUNCTION CHOICE｜{correction.choice === "continue" ? "このまま進む" : correction.choice === "alternate" ? "迂回する" : "今は決めない"}</strong>
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
