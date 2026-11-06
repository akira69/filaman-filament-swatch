# Native edition verification

Edition: 1.1.0. Upstream source: 935d3496df98faaec18e38aa4eba18c43d246c2f.

- Native production build, TypeScript check, 33 Node/browser tests and eight
  Python wrapper/package tests pass. Tests include complete paging, 401 login
  versus 403 mode isolation, revoked cache/detail access, per-user host-reload
  restoration, history/query navigation including project-detail return, French bootstrap failure text, RGBA zero, localized money and unknown
  legacy cost, native logos/links/fill, stale-build packaging and updater recovery.
- FilaMan Default, Light and Dark palettes use live host tokens, flat surfaces,
  semantic alpha borders and shared typography/radii. Browser checks cover token
  parity and identical rendered opaque swatch pixels across all three themes;
  RGBA/checkerboard and multicolor behavior remain intact.
- Compact mode controls use bundled icons and the local core UI font. Detail
  headers use native wide logo slots and aligned material/source metadata;
  corner reels meet rounded card edges. A 1,392-color regression verifies the
  compact minimap, reachable final card and scrollable desktop/mobile details.
  Background refresh retains clickable cards; revoked permissions still clear them.
  Wheel Color/Transparency views separate RGB display from alpha preview,
  with checkerboard limited to transparent segments/center and no data mutation.
- Core PR204 is based on upstream devel c8c76c4f97d28c3ea9165f000edcdc756d3228ed:
  19 frontend tests, 24 backend installer tests and static build pass. The existing
  shared renderer is reused; stock released-core compatibility is not claimed.
- Fresh read-only source snapshot: 33 filaments, 38 spools, 1,392 colors. Isolated
  HTTP ZIP installation and upgrade each converged over 16 fresh connections.
  Native inventory/catalog load with SpoolmanAPI inactive. Every photo/profile
  link and spool-event count matches the snapshot; the source instance is unchanged.
- Scoped Ruff passes with N999 excluded only because the source packaging
  directory is named filaman-plugin. Official actionlint passes all four owned
  workflows. New adapter/context/updater scope has zero jscpd clones.
- Live upstream dry-run reports unchanged at the pinned source; it changes no
  fork main or source marker. Local Git fixtures exercise conflict/reconciliation,
  squash ancestry, dependency-only changes, adopted overlap and publication retry.
- One independent whole-branch review identified 16 actionable findings. The
  correction pass fixes permissions, costs, router history, lifecycle and full
  host reloads, catalog/import affordances, semantic themes, native validity,
  type contracts and updater trust/recovery. Saved pre-fix production assets and
  pure regression tests reproduced the material failures before correction.

No feature PR is merged and no release tag is published. Scheduled updates begin
only when the workflow reaches the default branch; a no-change upstream cannot
exercise a real new-source update. Upstream PR53 remains draft/rework, with its
standalone URL regression squash-fixed and all 13 original regressions passing.
Real Spoolman/external-service submission evidence remains outstanding there.

Public PR screenshots use synthetic records; the private inventory snapshot and
all credentials remain outside source commits. Qwen drafted only the README
usage guide; Codex checked commands and corrected it. Token savings unmeasured.
