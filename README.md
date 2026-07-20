# Lighthouse — Build Week Edition

> **A navigation system that grows with its operator.**

Lighthouse is a responsive personal navigation HUD for moments when unfinished work, preparation gaps, unexpected events, and limited capacity make the next decision difficult.

It does not manage people or prescribe a single correct answer. It reflects the operator’s current state, preserves the trajectory of recent actions, and illuminates possible next routes while leaving the final decision to the person.

**Live demo:** https://lighthouse-build-week.yoshiyuki-t-0826.chatgpt.site

**Source repository:** https://github.com/yoshiyukit0826-creator/lighthouse-build-week-edition

---


## Screenshots

### Desktop overview

![Lighthouse desktop overview](assets/screenshots/desktop-overview.png)

### Adaptive Beacon and JUNCTION

![Adaptive Beacon and JUNCTION](assets/screenshots/adaptive-beacon-junction.png)

### Trajectory Review

![Trajectory Review](assets/screenshots/trajectory-review.png)

### Mobile experience

<p align="center">
  <img src="assets/screenshots/mobile-morning-check.png" alt="Mobile Morning Check" width="31%">
  <img src="assets/screenshots/mobile-hp.png" alt="Mobile HP display" width="31%">
  <img src="assets/screenshots/mobile-junction.png" alt="Mobile JUNCTION choice" width="31%">
</p>

## Why Lighthouse Exists

When pressure rises, people often try to hold everything in their head at once:

- What work is still unfinished?
- What preparation has already been completed?
- What might change unexpectedly?
- How much capacity is actually left?
- Should I continue, detour, or wait before deciding?

That makes the first decision more emotional and less observable.

Lighthouse creates a shared visual language for current capacity, future reserve, operational weather, and trajectory. Its purpose is not to replace judgment. Its purpose is to restore visibility before judgment is made.

---

## Core Navigation Model

### Morning Check: R / S / Y

The operator begins the day by entering three observations:

- **R — Remaining work:** unfinished work, carryover, or missing preparation
- **S — Setup:** the strength of current preparation and accumulated readiness
- **Y — Yield margin:** available room for unexpected events, staffing changes, delays, or variation

These values form the initial navigation state for the day.

### HP — Current Operating Capacity

HP represents the operator’s current ability to continue operating effectively. It is not a medical measurement.

The pre-existing calculation core uses:

```text
Current HP =
clamp(
  Initial HP
  + Recovery
  - Decrease
  - Time Decay,
  0,
  100
)
```

Time decay is counted only during active work periods. Breaks and weekends are excluded.

HP is translated into visible operating bands such as SAFE, OPTIMAL, CAUTION, DANGER, and CRITICAL.

### SP — Future Reserve

SP represents value created through preparation.

It is not displayed as extra HP. HP is current capacity; SP is a future reserve that can be stored and deliberately released when needed.

### Weather, Fog, and Visibility

Lighthouse translates operational conditions into navigation language: weather, wind, fog, route visibility, and beacon strength.

These are not decorative metaphors. They are a visual translation of the operator’s current environment and recent trajectory.

---

## How It Works

1. **Morning Check** establishes the initial state from R, S, and Y.
2. **Recovery, Decrease, and Preparation actions** update HP and SP during the day.
3. The HUD translates those changes into rings, state bands, weather, navigator messages, cut-ins, and trajectory.
4. **Adaptive Beacon** presents multiple possible next routes instead of issuing one command.
5. **Trajectory Review** allows the operator to pause the current flow and inspect the latest eight events.
6. **JUNCTION** allows the operator to mark a turning point and choose:
   - Continue
   - Detour
   - Decide later
7. The selected JUNCTION choice temporarily informs the next Beacon guidance.

Past HP, SP, R/S/Y values, and logs are never restored or rewritten by a JUNCTION choice.

---

## Key Features

### Adaptive Beacon

Adaptive Beacon presents route candidates when the operator’s view has narrowed.

Its role is to make alternatives visible, not to choose on the operator’s behalf.

### NAVIGATOR AA

The navigator message is positioned near the top of the HUD so the current interpretation is visible before the operator reaches the action controls.

### Fixed Action Controls

The action board remains available on desktop and mobile, allowing the operator to record recovery, decrease, and preparation without leaving the main navigation view.

### Ring Feedback and CUT-IN

HP changes are translated into immediate visual feedback. Important events can appear as CUT-IN moments so that meaningful changes are not lost inside a passive log.

### Trajectory Review

`LOG PAUSE` does not stop recording. It temporarily pauses the visual flow and opens `LAST 8`, allowing the operator to inspect the most recent trajectory without rewriting the past.

### JUNCTION

The operator selects a meaningful turning point from recent history and records a route choice.

JUNCTION preserves human authority: the system can illuminate routes, but the person decides whether to continue, detour, or postpone the decision.

### Responsive Web HUD

The Build Week edition is designed for desktop and smartphone browsers. It is a Web HUD, not a native Wear OS application.

---

## Existing Foundation vs. Build Week Work

Lighthouse evolved from a navigation system that had already been used in real operational work since March 2026.

| Area | Existing before Build Week | Added or evolved during Build Week |
|---|---|---|
| Morning state | R/S/Y input, NS, and initial HP | Responsive Morning Check interface |
| Action input | Smartphone and Pixel Watch input through HTTP Shortcuts | Fixed action controls inside the Web HUD |
| Data path | HTTP Shortcuts → Google Apps Script → Google Sheets action log | Standalone public Web HUD for reproducible judging |
| HP | Recovery, decrease, time decay, status bands | HP ring, effects, recent input, and responsive state presentation |
| SP | Preparation reserve and controlled release | Dedicated SP stock and use presentation |
| Navigation | State bands and navigator wording | Adaptive Beacon with multiple route candidates |
| Trajectory | Action log and HP graph | Trajectory Review, LOG PAUSE, LAST 8, CUT-IN and JUNCTION markers |
| Turning points | Not present | JUNCTION choice and temporary reflection into the next guidance |
| Interface | Google Sheets HUD | Public desktop/mobile Lighthouse Web HUD |

The public Build Week site is not connected to the Google Sheets backend in real time. It uses a controlled standalone state so judges can reproduce the interaction reliably.

---

## ARK — The GPT-5.6 Co-Designer

**ARK** is the working name given to the GPT-5.6 collaborator used throughout this project.

ARK was not treated as an autonomous manager or an oracle that decides the optimal route. It acted as a co-designer, navigator, and continuity layer.

The human operator contributed lived field experience, operational language, constraints, values, and final judgment. ARK helped:

- turn repeated field experience into system concepts;
- compare existing behavior with Build Week additions;
- structure HP, SP, trajectory, Beacon, and JUNCTION as one navigation model;
- refine interaction design and interface language;
- challenge contradictions and preserve design principles across iterations;
- translate a personal operating method into a public, testable Web HUD.

This collaboration mirrors the philosophy of Lighthouse itself:

> AI can help preserve context, reveal patterns, and illuminate routes.  
> The human remains responsible for meaning, turning points, and the final decision.

ARK is therefore not merely a mascot in the project. It represents the GPT-5.6 collaboration model through which Lighthouse was observed, questioned, rebuilt, and refined together with its operator.

---

## Technical Architecture

### Pre-existing operational system

```text
Smartphone / Pixel Watch
        ↓
HTTP Shortcuts
        ↓
Google Apps Script
        ↓
Google Sheets Action Log
        ↓
R/S/Y, NS, HP, SP, Time-Decay Calculations
        ↓
Sheets HUD and Charts
```

### Build Week submission

```text
Operator
   ↓
Responsive Lighthouse Web HUD
   ├─ Morning Check
   ├─ HP / SP actions
   ├─ Adaptive Beacon
   ├─ NAVIGATOR AA
   ├─ CUT-IN feedback
   ├─ Trajectory Review
   └─ JUNCTION choice
```

The Build Week edition transforms the existing operating logic into a standalone public experience for desktop and mobile browsers.

---


## Run Locally

### Requirements

- Node.js `22.13.0` or newer
- npm

### Install and start

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite in your browser.

The standalone public-demo state does not require API keys or private Google Sheets credentials.

### Verify the repository

```bash
npm run lint
npm test
```

`npm test` performs the verified production build and runs the rendered-interface test suite. You can also validate the generated Sites artifact directly:

```bash
npm run validate:artifact
```

---

## Try the Demo

1. Open the public Web HUD.
2. Complete the Morning Check.
3. Try Recovery, Decrease, and Preparation actions.
4. Observe HP, SP, ring feedback, weather, and navigator responses.
5. Open `LOG PAUSE / LAST 8`.
6. Review the recent trajectory.
7. Mark a JUNCTION.
8. Choose Continue, Detour, or Decide Later.
9. Observe how the next Beacon guidance reflects that route choice.

No login is required.

---

## Design Principles

Lighthouse follows five rules:

1. **Reflect before directing.**
2. **Present routes instead of forcing one answer.**
3. **Preserve the past instead of rewriting it.**
4. **Keep the final decision with the operator.**
5. **Grow through repeated use and shared observation.**

---

## Limitations

- The public Web HUD does not synchronize with the Google Sheets backend in real time.
- It uses a controlled standalone state for reproducible judging.
- It is not a medical, safety-critical, or autonomous decision system.
- It does not claim to calculate a universally optimal route.
- Pixel Watch operation belongs to the pre-existing HTTP Shortcuts workflow; the public submission is a browser-based Web HUD.
- The system is currently designed around one operator’s real workflow. Future work will explore how the model can be adapted without erasing individual context.

---

## Build Provenance

The primary Build Week Web HUD was created and iterated in ChatGPT Sites.

- **Site ID:** `appgprj_6a5c143957bc81918fdd6ff56138d827`
- **Site slug:** `lighthouse-build-week`
- **Published version:** `13`
- **Saved version ID:** `appgprj_6a5c143957bc81918fdd6ff56138d827~appgver_a5e63da282c8819188425d55ec32aea2`
- **Checkpoint:** `Mobile Action Focus Final v1`
- **Source commit SHA:** `26c61af276f6ddedcd80f78516cb9fb63e8eeebb`
- **Deployment ID:** `appgdep_6a5ccb2ec5448191be89c4fdd6b3c9bf`
- **Deployment status:** `succeeded`

The original Web HUD was created and iterated in ChatGPT Sites. Codex did not build the majority of that original Sites UI. This Codex thread was used to audit the exported source, verify integrity and secret handling, install dependencies, run lint, tests, and the production build, initialize Git, commit the verified package, and publish it to GitHub.

### Verified Codex publication evidence

- **Codex Session ID:** `019f7db6-7ced-7e60-b16f-2628031b0ef7`
- **Final publication commit SHA:** `33afd0ea912c41bb5f87aa4e50a8a1c242c5b08d`
- **Committed files:** `61`
- **Lint:** passed
- **Tests:** 8 passed, 0 failed
- **Production build:** passed
- **Secret scan:** passed

---


## Repository Contents

```text
app/                              Lighthouse Web HUD application
public/                           Lighthouse and CUT-IN image assets
worker/                           Sites/Cloudflare worker entry point
build/                            Sites build integration
scripts/                          Install, build, and artifact validation scripts
tests/                            Rendered-interface behavior tests
BUILD_WEEK_CHANGELOG.md           Checkpoint-by-checkpoint Build Week record
README.md                         English project README
README.ja.md                      Japanese reference translation
LICENSE                           MIT License
docs/ARCHITECTURE.md              Existing and Build Week architecture
docs/BUILD_WEEK_SCOPE.md          Existing foundation vs. new work
docs/TESTING_GUIDE.md             Judge testing path
docs/PROVENANCE.md                Site/version/deployment evidence
docs/CODEX_AND_GPT56.md           Transparent collaboration record
docs/VALIDATION.md                Clean-package verification result
docs/SOURCE_EXPORT.md             Export and sanitization record
docs/DEMO_VIDEO_PLAN.md           Under-three-minute demo plan
docs/SUBMISSION_CHECKLIST.md      Final submission ledger
assets/screenshots/               Desktop and mobile evidence images
```

The application source exported from ChatGPT Sites version 13 is included at the repository root. Generated caches, dependency directories, and exported font binaries are intentionally excluded. The application source files and Build Week changelog are otherwise preserved; the project README and submission documentation were added for the public repository.

## Project Status

- Public Web HUD: complete
- Desktop and mobile interaction: complete
- Original ChatGPT Sites source export: included
- Clean source package: linted, built, and tested
- Eight rendered-interface tests: passed
- Existing Google Sheets evidence copy: prepared separately
- Build Week comparison record: prepared
- English submission narrative: prepared
- Demo video: in preparation
- Public GitHub repository: published
- Codex Session ID: verified (`019f7db6-7ced-7e60-b16f-2628031b0ef7`)
- GitHub publication evidence: verified (`33afd0ea912c41bb5f87aa4e50a8a1c242c5b08d`, 61 files)

---

## Closing Thought

Lighthouse began as a practical way to make daily operational capacity visible.

During Build Week, it became something broader:

A system that does not tell a person what to do, but helps them recover their view of the sea.

**It does not manage people. It reflects where they are and illuminates the next step and another route.**
