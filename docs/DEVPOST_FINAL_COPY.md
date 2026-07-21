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

Lighthouse began in March 2026 as a Google Sheets navigation system used by one operator in daily field work. It was built to answer a practical question:

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

Its Google Sheets foundation was developed before Build Week through repeated field use and collaboration with earlier GPT model generations. That process helped formalize R/S/Y, NS, HP, SP, time decay, operating bands, action logs, and the original HUD.

During Build Week, GPT-5.6 — called ARK in this project — became the co-designer that moved the system into its next generation.

GPT-5.6 was used to:

- compare months of accumulated operational concepts and constraints;
- distinguish the pre-existing system from Build Week additions;
- preserve continuity across many design decisions;
- challenge contradictions in the navigation model;
- integrate HP, SP, trajectory, Adaptive Beacon, CUT-IN, LOG PAUSE, and JUNCTION;
- design a multiple-route interaction that preserves human authority;
- analyze longitudinal action-log evidence;
- translate a private Google Sheets operating method into a public, judge-testable Web HUD.

The key GPT-5.6 contribution is therefore not a decorative runtime API call. It is the reasoning, continuity, and translation layer that enabled an operating system built with earlier GPT generations to become the coherent Lighthouse experience submitted for Build Week.

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

The deterministic public HUD is an intentional design and judging decision, not an attempt to hide a missing component.

It provides:

1. Reproducibility — judges can observe the same state transitions.
2. Privacy — private workplace logs and credentials are not sent into a public runtime.
3. Reliability — the demo does not depend on API keys, quota, latency, or variable model output.
4. Human authority — Lighthouse remains a quiet decision-support layer rather than becoming an autonomous manager.

A future connected version may use an LLM to personalize language or interpret additional context. The Build Week edition demonstrates the core interaction: current capacity, prepared reserve, immutable trajectory, and human-controlled route selection.

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

Across GPT generations, the system and operator changed together. The operator learned to observe remaining work, preparation, margin, recovery, and turning points more clearly. The AI collaboration learned the vocabulary, constraints, and principles needed to translate those observations into a stable navigation model.

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
