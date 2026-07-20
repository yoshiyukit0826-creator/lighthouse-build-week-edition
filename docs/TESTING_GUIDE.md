# Testing Guide

## Fastest judging path

1. Open the live demo: `https://lighthouse-build-week.yoshiyuki-t-0826.chatgpt.site`
2. Complete **Morning Check** using any R/S/Y values.
3. Start the day and observe the initial HP band.
4. Use **Recovery**, **Decrease**, and **Preparation** actions.
5. Confirm changes in HP, SP, recent action, weather/visibility, and navigator wording.
6. Scroll to **Adaptive Beacon** and compare the current position, next step, and alternate route.
7. Open **LOG PAUSE / LAST 8**. Recording is not stopped; only the current visual flow is paused for review.
8. Select a recent trajectory point and mark a **JUNCTION**.
9. Choose **Continue**, **Detour**, or **Decide later**.
10. Confirm that the next Beacon guidance temporarily reflects the selected route.

## Expected behavior

- The system offers routes rather than issuing a single mandatory command.
- JUNCTION does not restore or rewrite past HP, SP, R/S/Y, or log entries.
- The public demo works in desktop and smartphone browsers without login.
- The public demo does not write to the private Google Sheets backend.

## Known limitations

- The public Web HUD uses a standalone state and does not synchronize with Sheets in real time.
- It is not a medical, safety-critical, or autonomous decision system.
- Pixel Watch belongs to the pre-existing HTTP Shortcuts workflow; the Build Week submission is a Web HUD.
