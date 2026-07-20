# Validation Record

Validation date: **2026-07-20 JST**

Validated from the clean GitHub-ready source package with generated caches and dependency directories excluded.

## Environment

- Node.js: `v22.16.0`
- npm: `10.9.2`

## Commands and results

```bash
npm ci
npm run lint
npm test
```

Results:

- dependency installation: passed;
- ESLint: passed;
- verified vinext production build: passed;
- Sites artifact validation: passed;
- rendered-interface tests: **8 passed, 0 failed**.

The tests cover Adaptive Beacon, JUNCTION behavior, no-restoration guarantees, readable trajectory cards, fixed mobile actions, ring-local feedback, NAVIGATOR placement, HP/SP trajectory tracks, and narrow-phone layout behavior.

## Packaging exclusions

The following are intentionally excluded from the public package:

- `node_modules/`;
- `.vinext/` generated cache and font binaries;
- `.next/`, `dist/`, `.wrangler/`, `.sites-runtime/`, and other build outputs;
- environment files and credentials;
- private Google Apps Script endpoints and write tokens.
