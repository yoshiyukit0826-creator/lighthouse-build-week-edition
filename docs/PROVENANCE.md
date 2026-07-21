# Build Provenance

## Public artifact

- GitHub repository: `https://github.com/yoshiyukit0826-creator/lighthouse-build-week-edition`
- Site name: `Lighthouse — Build Week Edition`
- Site ID: `appgprj_6a5c143957bc81918fdd6ff56138d827`
- Site slug: `lighthouse-build-week`
- Public URL: `https://lighthouse-build-week.yoshiyuki-t-0826.chatgpt.site`
- Site state: `active`
- Visibility: `public`

## Saved and deployed state

- Latest version: `13`
- Saved version ID: `appgprj_6a5c143957bc81918fdd6ff56138d827~appgver_a5e63da282c8819188425d55ec32aea2`
- Checkpoint: `Mobile Action Focus Final v1`
- Source commit SHA: `26c61af276f6ddedcd80f78516cb9fb63e8eeebb`
- Platform-reported archive SHA-256: `2fbe72c075a5cfb8f1950cce89ea653b2315d2af1a651922134397b91c4a3e30`
- Received source-export ZIP SHA-256: `f0d618fd063c3ff9c46a20b9645a2f6275491b463efb84ff5ed4cb563044aba7`
- Deployment ID: `appgdep_6a5ccb2ec5448191be89c4fdd6b3c9bf`
- Provider deployment ID: `yoshiyuki-t-0826--lighthouse-build-week`
- Deployment status: `succeeded`
- Published target: version `13`
- Public verification: approximately July 19, 2026, 22:04 JST

## Session-ID note

The original ChatGPT Sites build thread can expose the artifact identifiers above, but it does not expose Session ID, Conversation ID, Chat ID, Thread ID, or Feedback ID. Running `/feedback` opens the general feedback interface rather than returning the required Codex Session ID. Official clarification has been requested. No substitute identifier is presented as a Codex Session ID without confirmation.


## Source-export handling

The received export contains the version-13 project identity in `.openai/hosting.json`, the final `Mobile Action Focus Final v1` checkpoint in `BUILD_WEEK_CHANGELOG.md`, and the expected Lighthouse application files.

The received ZIP hash does not match the platform-reported archive hash, so the two values are recorded separately. This can occur when an export is repackaged or regenerated. The repository does not claim that the received ZIP is byte-for-byte identical to the platform archive.

## Post-export core hardening

On 2026-07-21 JST, a Codex core-engineering session rebuilt and hardened the Build Week navigation core after the version-13 source export. The work introduced `app/navigation-engine.ts`, added pre-refactor characterization and engine behavioral tests, and wired the existing Adaptive Beacon and JUNCTION components to the tested engine.

This later repository work did not create or redesign the original ChatGPT Sites UI. It preserved the visible product experience and added no runtime LLM inference, external API, credentials, raw logs, or private workplace data.

- Branch: `codex/core-navigation-hardening`
- Final core implementation commit SHA: `16cf48d92197f73ddba04c83da285642c7dc4f11`
- Validation: 23 tests (3 characterization, 12 navigation-engine, 1 rendered HTML smoke, 7 source/CSS contracts)
