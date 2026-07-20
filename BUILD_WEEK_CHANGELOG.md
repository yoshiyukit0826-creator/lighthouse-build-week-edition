# Lighthouse — Build Week Edition

## Baseline

- Source Sites project: `NAVI-OS 航海HUD`
- Source saved version: `v8`
- Source commit: `0f66f453b400755840de3170289026e1033a6dea`
- Baseline checkpoint name: `Build Week Baseline v1`

## Baseline differences from v8

1. A new Sites project identity is used in `.openai/hosting.json`.
2. The package name and display name identify the Build Week copy.
3. This changelog was added so all later Build Week changes can be recorded.

No HUD fixed data, browser state defaults, event processing, layout, visual
components, or image assets were changed for the baseline.

Adaptive Beacon and Junction save/resume are intentionally not implemented in
this checkpoint.

## Future changes

Record each change below with its checkpoint, affected files, behavior change,
data migration, and verification result.

| Checkpoint | Change | Affected files | Verification |
| --- | --- | --- | --- |
| Build Week Baseline v1 | Independent v8 copy established | Project identity, package metadata, this changelog | Build and automated test passed; v8 HUD core and assets matched |
| Adaptive Beacon v1 | Added a read-only three-route guidance card driven by existing HUD state | `app/adaptive-beacon.tsx`, `app/page.tsx`, `app/globals.css`, tests, this changelog | Build, lint, automated test, desktop render, state transition, and legacy cut-in coexistence passed |
| Junction Save & Resume v1 | Added a browser-local minimal resume point with save, comparison, restore, current-state priority, and clear controls | `app/junction-panel.tsx`, `app/adaptive-beacon.tsx`, `app/page.tsx`, `app/globals.css`, tests, this changelog | Build, lint, artifact validation, and rendered control test passed; browser persistence and responsive interaction remain for deployed smoke testing |
| Junction Day Boundary v1 | Same-day saves remain resumable; saves from a different local calendar date become read-only `PAST BEACON` guidance for the next morning's manual RSY decision | `app/junction-panel.tsx`, `app/junction-day.ts`, tests, this changelog | Build, lint, artifact validation, rendered control test, read-only contract test, and local-calendar boundary test passed |
| Log Pause & Junction Marker v1 | Redefined JUNCTION as a human-confirmed branch marker: pause recent observations, choose continue/alternate/undecided, optionally record, and review without restoring any HUD state | `app/junction-panel.tsx`, `app/page.tsx`, `app/globals.css`, tests, this changelog; removed `app/junction-day.ts` from the active design | Build, lint, artifact validation, rendered controls, route choices, and no-restoration contract verification passed |
| Trajectory Log & Junction Marker v1 | Rebuilt LOG PAUSE around the last eight action events: HP line, HP/SP/fog deltas, Beacon route changes, cut-in points, user-selected junction point, optional memo, and a one-action temporary Beacon route correction. REVIEW remains observation-only and records the next action result without restoring state. | `app/trajectory.ts`, `app/junction-panel.tsx`, `app/adaptive-beacon.tsx`, `app/page.tsx`, `app/globals.css`, tests, this changelog | Build, lint, artifact validation, rendered controls, trajectory contract, temporary correction consumption, and no-restoration assertions passed; deployed smartphone interaction remains for smoke testing |
| Trajectory Log Readability v1 | Replaced narrow trajectory rows with full-width action cards. Each card presents time, action, HP delta, SP/FOG badges, result text, and Beacon route in reading order; Beacon changes, cut-ins, and the graph-linked JUNCTION are visually emphasized. | `app/junction-panel.tsx`, `app/globals.css`, tests, this changelog | Lint, build, artifact validation, and three automated tests passed; production smartphone visual confirmation remains for smoke testing |
| RC Action Feedback v1 | Fixed the existing recovery/damage/stock action bar at the bottom on desktop and mobile, added compact HP-ring feedback plus a persistent last-input readout, and replaced full-screen character cut-ins with one-second non-modal diagonal signal ribbons. Existing trigger thresholds and state calculations remain unchanged; SP stock adds the single new `資産確保` ribbon when stock actually increases. | `app/page.tsx`, `app/globals.css`, tests, this changelog | Lint, build, five automated tests, and desktop agent-preview interaction passed. Confirmed fixed action dock, no page-level horizontal overflow, 18px clearance above the dock at maximum scroll, recover/damage ring feedback without normal-action cut-ins, `構造瓦解` auto-dismiss, and new `資産確保` auto-dismiss. Smartphone source contract passed; deployed-device visual smoke test remains. |
| RC Beacon Core Layout v1 | Reordered the upper HUD around CURRENT CAPABILITY, the single existing NAVIGATOR AA/readout, and LIGHTHOUSE BEACON. Moved the existing vector, wind, sea and fog readings into compact lighthouse instruments and applied lightweight fog/sea visual response using only existing HUD classes and values. | `app/page.tsx`, `app/globals.css`, tests, this changelog | Build, lint, six automated tests, desktop agent-preview layout/state interaction, fixed action dock, one-AA assertion, no horizontal overflow, fog transition, existing `構造瓦解` trigger, and app-console error check passed. Responsive source contract passed; deployed smartphone visual smoke test remains. |
| RC HP SP Trajectory v1 | Rebuilt only the normal HUD graph as three aligned tracks driven by the existing in-browser Trajectory entries: HP CURRENT (0–100), HP DELTA around zero, and SP TRACK (0–5). The current point stays at the right edge, and only existing `SPストック` / `SP使用` labels create `資産確保` / `資産運用` markers. Trajectory Review remains unchanged. | `app/hud-trajectory-chart.tsx`, `app/page.tsx`, `app/globals.css`, tests, this changelog | Build, lint, seven automated tests, desktop agent-preview HP/SP log additions, positive HP bar, current-value marker, SP stock marker and `資産確保` cut-in passed. LOG PAUSE retained its separate detailed chart and MARK JUNCTION controls; no page-level horizontal overflow. Responsive graph source contract passed; deployed smartphone visual smoke test remains. |
| Second RC Polish v1 | Integrated and audited the Beacon Core upper HUD and normal three-track HP/SP trajectory as one release candidate without changing HUD values, calculations, action thresholds, persistence, Adaptive Beacon, Junction logic, or Trajectory Review. | Phase A and Phase B files above; this final audit record | Seven automated tests, lint, verified Sites build, desktop agent-preview visual/interaction regression, single-AA rendering, fixed dock, no page overflow, HP recovery, SP stock, existing cut-in, Adaptive Beacon update, LOG PAUSE and separate Trajectory Review all passed. Responsive CSS contract passed; physical smartphone visual smoke test remains for the deployed candidate. |
| Mobile Capability Density Final v1 | Tightened only the narrow-phone CURRENT CAPABILITY stack: reduced the HP ring from 88% to 80%, removed excess vertical spacing around the ring, LAST INPUT, state band and SP block, and retained all text, tap targets, Navigator formatting and the fixed action dock. Desktop and tablet rules are unchanged. | `app/globals.css`, tests, this changelog | Build, lint and eight automated tests passed. The phone-only CSS contract confirms the fixed dock and Navigator rules were not changed; deployed portrait-device visual and action smoke test remains. |
| Mobile Action Focus Final v1 | Kept the accepted mobile density intact and moved only the narrow-phone post-action viewport landing point 96 CSS pixels farther along the voyage, so NAVIGATOR remains visible above the fixed action dock. Desktop and tablet retain the existing centered HP focus. | `app/page.tsx`, tests, this changelog | Responsive source contract verifies the phone-only offset, desktop fallback, unchanged calculations and unchanged dock dimensions. |
