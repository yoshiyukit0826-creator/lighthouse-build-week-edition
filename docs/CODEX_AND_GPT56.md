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

The primary UI was built in ChatGPT Sites. The original Sites build thread currently exposes Site, version, source-commit, and deployment identifiers, but it does not expose a Codex `/feedback` Session ID.

This repository must document only verified Codex work. Do not describe a later test conversation as the primary build thread, and do not fabricate a Session ID. Add the official resolution and any concrete Codex tasks here once confirmed.

## Why this distinction matters

Lighthouse is built around faithful observation. Its submission record follows the same rule: evidence is separated from inference, and unresolved identifiers remain explicitly unresolved.


## Repository verification

The exported Sites source was independently packaged and verified with `npm run lint` and `npm test`. This verification confirms that the source builds and that all eight included rendered-interface tests pass. It is recorded as repository validation, not falsely described as the original Codex build thread.
