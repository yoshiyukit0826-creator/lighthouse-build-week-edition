# Devpost Final Copy — Lighthouse

This file is written for direct transfer into the Devpost submission. Adjust only where the form uses different field names.

---

## Project name

Lighthouse — Build Week Edition

## Tagline

A navigation system that grows with its operator — illuminating the next step and another route without taking control.

## One-sentence description

Lighthouse is a responsive personal navigation HUD that turns unfinished work, preparation, unexpected disruption, remaining capacity, and recent actions into visible routes while leaving the final decision with the operator.

---

## Inspiration

Most productivity tools work well when the plan is still intact. Real field operations are different: unfinished work carries over, preparation is uneven, staffing or priorities change, and unexpected events break the expected route.

The hardest moment is often not planning the day. It is recovering orientation after the plan has already begun to collapse.

Lighthouse began as a small CLI-style navigation system already in use by March 1, 2026. Each morning, the operator entered three observations — R for remaining work, S for setup, and Y for yield margin — on a 0–2 scale. A prioritized decision rule then returned exactly one of five route commands, CMD_01 through CMD_05. A sixth exception command was later added for a collapse day.

Those first commands became the ancestors of today's push, maintain, rebuild, over-push warning, omission warning, and do-not-force navigation modes.

The system was built to answer a practical question:

> Can a system show where I am, what reserve I have already prepared, and where I can restart — without managing me or pretending there is one universally correct answer?

The lighthouse metaphor defines the product. A lighthouse does not steer the ship. It stays quiet during ordinary navigation and becomes valuable when the operator needs to recover orientation, inspect the route already taken, or find another way forward.

---

## What it does

The operator starts with a Morning Check using three observations:

- R — Remaining work
- S — Setup and accumulated preparation
- Y — Yield margin for variation and unexpected events

These establish the initial navigation state, NS, and starting HP.

During the day, recovery, decrease, and preparation actions update:

- HP — current operating capacity
- SP — preparation stored as future reserve
- weather, fog, route visibility, and HUD status
- the recent action trajectory

When an unexpected event occurs, accumulated SP can be deliberately released to rebuild HP and the route.

Adaptive Beacon presents multiple possible routes rather than issuing one command. LOG PAUSE / LAST 8 lets the operator inspect the latest trajectory without stopping or rewriting the log. JUNCTION marks a meaningful turning point and records one of three human choices:

- Continue
- Detour
- Decide later

The selected choice temporarily informs the next Beacon guidance. Past HP, SP, R/S/Y values, and logs are never restored or rewritten.

The public submission is a responsive Web HUD for desktop and mobile browsers.

---

## What makes it different

Lighthouse is not an autonomous agent, a task manager, or an optimization oracle.

It is designed around selective attention:

- quiet during ordinary work;
- visible when the operator chooses to reflect;
- event-driven rather than notification-driven;
- multiple-route guidance instead of command-based automation;
- immutable past trajectory;
- human-controlled turning points and final decisions.

This means the system can remain in the background like a lighthouse keeper. When the operator wants to look back, the trajectory is still there and can be recovered as navigation context.

---

## How GPT-5.6 was used

Lighthouse was not created as a one-week prompt-to-app exercise.

Its earliest confirmed form was already operating by March 1, 2026 in another AI environment as a small CLI-style navigator. The operator entered three morning observations — R for remaining work, S for setup, and Y for yield margin — and a prioritized rule returned one of five commands, CMD_01 through CMD_05. A later exception added CMD_06 for a collapse day.

Repeated field use then expanded that command engine into morning warnings, NS, initial HP, HP and SP separation, work-time decay, recovery and decrease events, action logs, operating bands, and the Google Sheets HUD.

During Build Week, GPT-5.6 — called ARK in this project — became the co-designer that moved this accumulated system into its next generation. GPT-5.6 was used to preserve the history and constraints of the earlier system, compare real operating evidence, challenge contradictions, and consolidate the CMD lineage into Adaptive Beacon, Trajectory Review, LOG PAUSE / LAST 8, CUT-IN, and JUNCTION.

The central evolution was from a system that returned one prioritized command into a system that can preserve the route already taken and illuminate multiple next routes without taking control from the operator.

GPT-5.6 therefore served as the reasoning, continuity, and translation layer that enabled a field-used navigation system built with earlier GPT generations to become the coherent Lighthouse experience submitted for Build Week.

---

## How Codex was used

The primary Web HUD was created and iterated in ChatGPT Sites. Codex did not build the majority of the original Sites UI.

The verified Codex publication thread was used to:

- audit the exported source;
- verify package integrity and secret handling;
- install dependencies;
- run lint;
- run eight rendered-interface tests;
- run the production build;
- initialize Git;
- commit the verified package;
- publish the repository to GitHub.

Verified Codex Session ID:

`019f7db6-7ced-7e60-b16f-2628031b0ef7`

At the publication checkpoint:

- lint passed;
- 8 tests passed, 0 failed;
- production build passed;
- secret scan passed.

---

## Why the public demo does not call GPT-5.6 at runtime

The public HUD does not send every R/S/Y input or disruption to GPT-5.6 for an improvised answer at runtime.

That does not mean its guidance was designed without real-time operational context.

The development loop was longitudinal: a real field event occurred, the operator observed it, the event was brought into human–AI dialogue, the rule or wording was revised, and the system returned to operation. This repeated across unfinished work, setup failures, unexpected disruptions, recovery actions, stored preparation, hesitation, and route changes.

In other words, the navigation logic was distilled from real-time work over months rather than generated from scratch after each click.

> The guidance is generated from real operational experience, even when it is not newly improvised by an LLM at every runtime event.

For the Build Week edition, deterministic state transitions provide reproducible judging, stable behavior, no API-key or latency dependency, protection of private workplace data, and less unnecessary interruption during active work.

Lighthouse uses AI as a longitudinal co-designer and reflection layer rather than as a constantly speaking runtime manager. A lighthouse does not steer the ship. It remains quiet until the operator needs the route illuminated.

---

## How we built it

### Pre-existing operational system

Smartphone / Pixel Watch → HTTP Shortcuts → Google Apps Script → Google Sheets action log → R/S/Y, NS, HP, SP, time-decay calculations → Sheets HUD and charts

### Build Week submission

Operator → responsive Lighthouse Web HUD → Morning Check, HP/SP actions, Adaptive Beacon, NAVIGATOR AA, CUT-IN feedback, Trajectory Review, and JUNCTION choice

The public Build Week site uses a controlled standalone state so judges can reproduce the interaction without private Google Sheets access. Real operational time decay is paused in the public demo.

The repository includes the source, screenshots, architecture notes, testing guide, evidence methodology, anonymized aggregate data, provenance, and validation records.

---

## Real-world evidence and impact

A retrospective analysis of the pre-existing Google Sheets action log covered March 8 through May 26, 2026:

- 57 active logging days
- 1,105 valid non-zero HP events
- recorded negative events per active logging day decreased from 10.78 in March to 2.71 in May
- a 74.8% March-to-May decrease
- a more conservative 50.6% April-to-May decrease
- low-load days increased from 8.7% to 64.3%
- recovery-event logging remained essentially stable from April to May

This is not presented as proof that productivity increased by 74.8%, and it does not establish causality. The dataset covers one operator and is not connected to production volume, cycle time, overtime, or defect data.

The accurate claim is narrower:

> Recorded operational friction decreased over time while recovery behavior continued to be observed as the operator and navigation system evolved together.

Full methodology and anonymized aggregates are included in the repository.

---

## Challenges

### Translating lived field language into a public system

The original system used personal operational concepts developed through real work. The Build Week challenge was to preserve their meaning while making the interface understandable and testable by someone seeing it for the first time.

### Preserving human authority

It was easy to make the system sound more advanced by claiming that AI automatically finds the optimal answer. That would contradict the project. Lighthouse had to remain a navigation layer that reveals routes without becoming a manager.

### Separating the past from the next route

JUNCTION needed to influence future guidance without rewriting past values or pretending a different decision had already occurred. The resulting design preserves the trajectory as fact and treats the route choice as a new marker.

### Creating a reproducible public demo

The real operating system contains private data and backend connections. The public Web HUD had to demonstrate the interaction reliably without exposing logs, credentials, or workplace information.

---

## Accomplishments

- Transformed a private, field-used Google Sheets system into a responsive public Web HUD.
- Preserved a clear boundary between pre-existing work and Build Week additions.
- Built Adaptive Beacon, Trajectory Review, LOG PAUSE / LAST 8, CUT-IN, and JUNCTION as one coherent interaction model.
- Demonstrated SP release rebuilding HP and navigation after disruption.
- Preserved past trajectory instead of rewriting history.
- Produced a desktop/mobile demo requiring no login or API key.
- Published a verified, tested, secret-scanned repository through Codex.
- Included longitudinal evidence with explicit limitations rather than overstating impact.

---

## What we learned

The most important result was not that AI should make more decisions.

It was that AI can help preserve context long enough for a person to make a better decision later.

Across GPT generations, the system and operator changed together. The operator learned to observe remaining work, preparation, margin, recovery, and turning points more clearly. The human–AI design process accumulated the vocabulary, constraints, and principles needed to translate those observations into a stable navigation model.

Lighthouse works because the human and AI roles remain distinct:

- AI preserves context, finds patterns, checks contradictions, and illuminates routes.
- The human assigns meaning, chooses turning points, and makes the final decision.

---

## What is next

- Explore adaptation for another operator without erasing individual context.
- Compare operational friction against production volume, cycle time, overtime, and defect data.
- Test how much onboarding is needed for R/S/Y, HP, SP, and JUNCTION.
- Explore optional LLM-assisted language personalization while preserving deterministic core state and human authority.
- Reconnect a private operational version to the existing Google Sheets backend without exposing private data in the public demo.

---

## Built with

- GPT-5.6 / ChatGPT
- Codex
- ChatGPT Sites
- React
- TypeScript
- Vite
- Google Sheets
- Google Apps Script
- HTTP Shortcuts
- GitHub

---

## Public links

- Live demo: https://lighthouse-build-week.yoshiyuki-t-0826.chatgpt.site
- Demo video: https://youtu.be/BaHCZXbj8D0
- Source repository: https://github.com/yoshiyukit0826-creator/lighthouse-build-week-edition

Do not place a `/manage/submissions/` URL into a public-link field. That is the private Devpost editing route. Use Devpost's View/Project page when a public `/software/...` URL becomes available.

---

## Final submission check

- [ ] Submission status shows submitted
- [ ] Live demo opens without login
- [ ] YouTube video opens and is 2:43
- [ ] GitHub repository opens publicly
- [ ] Codex Session ID is entered exactly
- [ ] GPT-5.6 role describes co-design and evolution, not only code generation
- [ ] Deterministic runtime is explained as an intentional design choice
- [ ] 74.8% is described as recorded-event reduction, not productivity improvement
- [ ] N=1 and non-causal limitations remain visible
- [ ] No private `/manage/submissions/` URL is used as a public project link