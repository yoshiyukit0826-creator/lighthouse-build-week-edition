# Navigation Evolution: From Three Inputs and Five Commands to Lighthouse

## Historical origin

Lighthouse did not begin as a generative chatbot or as a one-week prompt-to-app prototype.

By **1 March 2026**, its earliest confirmed form was already being used in another AI environment as a small CLI-style navigation system.

The operator entered three morning observations, each scored from 0 to 2:

- **R — Remaining work:** carryover, unfinished work, or missing preparation
- **S — Setup:** readiness and accumulated preparation
- **Y — Yield margin:** available room for disruption, variation, staffing changes, or delay

The system then evaluated that state and returned exactly one of five navigation commands.

This is the accurate origin of the phrase sometimes informally remembered as “the first five checks”: they were not five input questions. They were **five possible route commands produced from three observations**.

---

## The original five commands

### CMD_01 — Basic confirmation

> Always confirm deadlines and shortages.  
> Use available margin for preparation.

### CMD_02 — Margin available

> Confirm preparation.  
> Move ahead of the work and secure stable footing.

### CMD_03 — No remaining work

> Prioritize startup.  
> Absorb remaining work.

The second line is historically ambiguous when read literally. The original intent appears to have been that any light or absorbable carryover should be handled during startup. The wording is retained here as a historical artifact rather than silently rewritten.

### CMD_04 — Setup insufficient

> Bias toward safety.  
> Search for overlooked items.

### CMD_05 — Push day

Original wording:

> Merge work below five sets.  
> Today is a day you can push.

Later adjusted wording:

> Clear work below five sets and existing stagnation.  
> Today is a day you can push, but do not neglect preparation.

---

## Approximate decision order in early March 2026

The rule order documented around **8 March 2026** was:

```text
if NS >= 5     -> CMD_05
else if S == 0 -> CMD_04
else if R == 0 -> CMD_03
else if Y == 2 -> CMD_02
else           -> CMD_01
```

Here, **NS = R + S + Y**.

The order mattered. The result was not a collection of independent tips; it was a prioritized state evaluation that returned one route command.

A later exception was added:

```text
if R == 0 and S == 0 -> CMD_06
```

### CMD_06 — Collapse day

> The route is breaking down. Prioritize rebuilding.  
> Do not force the situation.

This was the first explicit exception state for a day that should not be treated as ordinary operation.

---

## Evolution path

The historical sequence is:

```text
Three morning observations: R / S / Y
        ↓
Five prioritized route commands: CMD_01–CMD_05
        ↓
Exception state: CMD_06 for a collapse day
        ↓
Morning navigation command, warning forecast, NS, and initial HP
        ↓
HP / SP separation, recovery, decrease, preparation, and work-time decay
        ↓
Action logs, operating bands, weather, fog, and HUD visualization
        ↓
Adaptive Beacon, Trajectory Review, LOG PAUSE / LAST 8, CUT-IN, and JUNCTION
```

The current navigation modes — push, maintain, rebuild, avoid over-pushing, check for omissions, and do not force the situation — are descendants of the original CMD family.

---

## What changed conceptually

The earliest system returned one directive selected from a small command set.

Repeated field use exposed a limitation: a single command can describe the current posture, but it cannot fully represent the operator’s recent path, stored preparation, a meaningful turning point, or the fact that more than one next route may be valid.

The system therefore evolved in three important ways:

1. **From posture to capacity**  
   R/S/Y and NS developed into initial HP, ongoing HP change, and SP as stored preparation.

2. **From command to trajectory**  
   Individual events became an immutable action history that could be inspected later rather than disappearing after a command was shown.

3. **From one instruction to multiple routes**  
   Adaptive Beacon and JUNCTION replaced the assumption that the system should choose one correct answer. The system can now illuminate Continue, Detour, or Decide Later while preserving human authority.

The original CMD engine was not discarded. It became the ancestor of the current navigation logic.

---

## Where the real-time intelligence came from

Lighthouse does not call GPT-5.6 after every runtime event in the public demo.

However, its navigation model was not designed in isolation from real-time work.

The actual development loop was longitudinal:

```text
field event
   ↓
operator observation
   ↓
human–AI dialogue and interpretation
   ↓
rule, wording, or model revision
   ↓
continued field use
   ↓
new evidence and further revision
```

Over months, real unfinished work, setup failures, unexpected events, recovery actions, stored preparation, hesitation, and route changes were repeatedly returned to the design conversation.

Earlier GPT generations helped formalize the operational foundation. During Build Week, GPT-5.6 — called ARK in this project — preserved the accumulated context, compared the old and new systems, challenged contradictions, and helped consolidate the command lineage into Adaptive Beacon, Trajectory Review, LOG PAUSE, and JUNCTION.

The public Web HUD is therefore the stable execution layer of accumulated human–AI reasoning.

> **The guidance is generated from real operational experience, even when it is not newly improvised by an LLM at every runtime event.**

---

## Why the runtime remains deterministic

A runtime LLM could generate more varied wording, but variation alone is not the product goal.

For the Build Week edition, deterministic state transitions provide:

- reproducible judging;
- stable behavior under the same conditions;
- no dependency on API keys, latency, quota, or connectivity;
- no transfer of private workplace logs into a public runtime;
- less interruption during active work;
- preservation of human responsibility for route choice.

Lighthouse uses AI as a longitudinal co-designer and reflection layer rather than as a constantly speaking runtime manager.

A lighthouse does not steer the ship. It remains available until the operator needs the route illuminated.
