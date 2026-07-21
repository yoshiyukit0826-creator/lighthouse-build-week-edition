# Codex and GPT-5.6 Collaboration Record

## GPT-5.6 / ARK

ARK is the working name given to the GPT-5.6 collaborator used throughout the Lighthouse project.

The human operator contributed real field experience, operational language, constraints, values, and final judgment. ARK supported:

- conversion of repeated field experience into system concepts;
- comparison of pre-existing behavior and Build Week additions;
- integration of HP, SP, trajectory, Beacon, and JUNCTION;
- interaction design and wording;
- contradiction checks and continuity across iterations;
- translation of a private operating method into a public, testable Web HUD.

ARK did not act as an autonomous manager and Lighthouse does not claim that GPT-5.6 chooses a real-time optimal route. The collaboration model preserves human authority over meaning, turning points, and final decisions.

## Codex disclosure

The primary UI was built in ChatGPT Sites. Codex did not build the majority of that original Sites UI. The original Sites build thread exposes Site, version, source-commit, and deployment identifiers; those remain separate from later repository work.

After the version-13 source export, a core-engineering Codex session rebuilt the Build Week navigation core as a pure TypeScript engine, added characterization and behavioral tests, and wired the existing Adaptive Beacon and JUNCTION UI to that engine. This was a post-export implementation and hardening session, not the creation of the original ChatGPT Sites experience.

The rebuilt engine deterministically produces CURRENT POSITION, NEXT STEP, and ALTERNATE ROUTE; applies Continue, Detour, and Decide Later as one-action corrections; enforces safety ceilings; and does not restore or rewrite past HP, SP, R/S/Y, Z, fog, trajectory, or logs. It adds no runtime LLM inference, external API, credentials, or private workplace data.

## Why this distinction matters

Lighthouse is built around faithful observation. Its submission record follows the same rule: evidence is separated from inference, and unresolved identifiers remain explicitly unresolved.


## Repository verification

The exported Sites source and rebuilt navigation core are independently verified with `npm run lint`, `npm test`, and `npm run validate:artifact`. The 23-test suite contains 3 characterization tests, 12 navigation-engine behavioral tests, 1 rendered HTML smoke test, and 7 source/CSS contract tests. This is repository and post-export core validation, not a claim that Codex built the original Sites UI.
