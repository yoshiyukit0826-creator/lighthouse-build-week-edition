# Validation Record

Validation date: **2026-07-21 JST**

Validated from the clean GitHub-ready source package with generated caches and dependency directories excluded.

## Environment

- Node.js: `v24.18.0`
- npm: `11.16.0`

## Commands and results

```bash
npm ci
npm run lint
npm test
npm run validate:artifact
```

Results:

- dependency installation: passed;
- ESLint: passed;
- verified vinext production build: passed;
- Sites artifact validation: passed;
- tests: **23 passed, 0 failed**.

Test taxonomy:

- **3 characterization tests** preserve representative pre-refactor Adaptive Beacon and JUNCTION behavior;
- **12 navigation-engine behavioral tests** cover determinism, exactly three routes, representative state classes, all three JUNCTION choices, one-action consumption, safety ceilings, input immutability, trajectory non-restoration, absence of resume paths, and required labels;
- **1 rendered HTML smoke test** verifies the built worker response and core visible controls;
- **7 source/CSS contract tests** cover JUNCTION persistence contracts, trajectory cards, fixed mobile actions, ring feedback, NAVIGATOR placement, HP/SP tracks, and narrow-phone layout.

## Packaging exclusions

The following are intentionally excluded from the public package:

- `node_modules/`;
- `.vinext/` generated cache and font binaries;
- `.next/`, `dist/`, `.wrangler/`, `.sites-runtime/`, and other build outputs;
- environment files and credentials;
- private Google Apps Script endpoints and write tokens.
