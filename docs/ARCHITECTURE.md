# Architecture

## 1. Pre-existing operational system

The navigation core existed before Build Week and was used in real operational work.

```text
Smartphone / Pixel Watch
        ↓
HTTP Shortcuts
        ↓
Google Apps Script
        ↓
Google Sheets Action Log
        ↓
R/S/Y → NS → Initial HP
HP events + SP events + active-work time decay
        ↓
Sheets HUD and Charts
```

### Main concepts

- **R — Remaining work**
- **S — Setup / accumulated preparation**
- **Y — Yield margin / available room for variation**
- **NS — R + S + Y**
- **HP — current operating capacity**
- **SP — preparation stored as future reserve**

The existing Sheets core records actions, applies configured HP/SP changes, excludes breaks and weekends from time decay, and translates current HP into status bands.

## 2. Build Week Web HUD

```text
Operator
   ↓
Responsive Lighthouse Web HUD
   ├─ Morning Check
   ├─ HP / SP action controls
   ├─ Lighthouse weather and visibility
   ├─ NAVIGATOR AA
   ├─ Adaptive Beacon
   ├─ CUT-IN feedback
   ├─ Trajectory Review / LAST 8
   └─ JUNCTION choice
```

The public Web HUD uses a controlled standalone state. It is not connected to the Google Sheets backend in real time. This makes the judging path repeatable and prevents the public demo from exposing operational write endpoints.

## 3. Human authority boundary

Lighthouse separates observation from judgment. The system may reflect current state, preserve trajectory, and present routes. It does not autonomously determine the optimal action. The operator selects turning points and retains the final decision.
