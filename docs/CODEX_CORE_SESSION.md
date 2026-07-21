# Codex Core Navigation Session

Session date: **2026-07-21 JST**

## Objective

Rebuild and harden the majority of the Build Week navigation core after the ChatGPT Sites version-13 source export, while preserving the visible desktop and mobile product experience.

## Core functionality rebuilt

The session centralized the following behavior in `app/navigation-engine.ts`:

- deterministic generation of exactly three route outputs: CURRENT POSITION, NEXT STEP, and ALTERNATE ROUTE;
- typed interpretation of HP, SP, R/S/Y, Z, fog, status, vector, wind, and the recent action;
- route guidance levels and state-dependent safety ceilings;
- Continue, Detour, and Decide Later JUNCTION choices;
- temporary correction of only the next action guidance;
- immutable input handling and no trajectory restoration or rewriting.

The existing Adaptive Beacon and JUNCTION components now render or invoke engine output instead of owning independent route-selection rules.

## Files created and changed

Created:

- `app/navigation-engine.ts`
- `tests/navigation-characterization.test.mjs`
- `tests/navigation-engine.test.mjs`
- `docs/CODEX_CORE_SESSION.md`

Changed:

- `app/adaptive-beacon.tsx`
- `app/junction-panel.tsx`
- `app/page.tsx`
- `app/trajectory.ts`
- `tests/rendered-html.test.mjs`
- `package.json`
- `README.md`
- `docs/CODEX_AND_GPT56.md`
- `docs/VALIDATION.md`
- `docs/PROVENANCE.md`

## Key engineering decisions

- Characterize representative exported behavior before extraction, including safe, caution, danger, high-fog, low-reserve, prepared-reserve, and unresolved-Z states.
- Keep visible route copy and route ordering unchanged through a compatibility reading API.
- Represent the three primary route outputs as a fixed tuple so the engine contract cannot silently return fewer or additional routes.
- Apply JUNCTION correction through pure functions and consume it when the next action ID is recorded.
- Clamp correction output to the state safety ceiling even if a caller supplies an inconsistent base route.
- Retain thin re-exports from `app/trajectory.ts` for compatibility while keeping all route decisions in the engine.

## Safety invariants

- Guidance never escalates above the ceiling derived from HP, fog, R/S/Y reserve, and Z.
- A JUNCTION correction affects one subsequent action only.
- Decide Later returns observation guidance without raising the route level.
- Engine inputs are not mutated.
- Past HP, SP, R/S/Y, Z, fog, Beacon readings, trajectory entries, and logs are not restored or rewritten.
- No resume-from-snapshot, rewind, or restoration API exists.
- Operation is deterministic and contains no runtime LLM inference or external API call.

## Test taxonomy

- **3 characterization tests:** representative pre-refactor Beacon readings, JUNCTION labels/corrections, and the danger ceiling.
- **12 navigation-engine behavioral tests:** determinism, three-route tuple, representative states, Continue, Detour, Decide Later, one-action consumption, ceilings, input immutability, immutable past trajectory, no resume path, and label semantics.
- **1 rendered HTML smoke test:** built worker response, Adaptive Beacon, and JUNCTION controls.
- **7 source/CSS contract tests:** existing non-rendered structural and responsive contracts.
- **Total: 23 tests.**

## Verification commands

```powershell
npm.cmd ci
$env:PATH = 'C:\Program Files\Git\usr\bin;' + $env:PATH; npm.cmd run lint
$env:PATH = 'C:\Program Files\Git\usr\bin;' + $env:PATH; npm.cmd test
$env:PATH = 'C:\Program Files\Git\usr\bin;' + $env:PATH; npm.cmd run validate:artifact
```

`npm.cmd test` invoked `npm run build` before running the test files. Git Bash was placed first on `PATH` because the repository validation wrappers are Bash scripts.

Final results:

- dependency installation: passed;
- lint: passed;
- production build: passed;
- tests: 23 passed, 0 failed;
- artifact validation: passed.

## Commit and preservation record

- Branch: `codex/core-navigation-hardening`
- Final core implementation commit SHA: `16cf48d92197f73ddba04c83da285642c7dc4f11`
- Commit message: `Rebuild and test core navigation engine with Codex`
- Visible product behavior preserved: **yes**; no layout, CSS, image, animation, or intentional copy change was made.
- Runtime LLM or external API added: **no**.
- Credentials, raw logs, secrets, or private workplace data added: **no**.

The original Web HUD was created and iterated in ChatGPT Sites. This record describes later Codex work on the exported navigation core and does not claim that Codex created the original Sites UI.
