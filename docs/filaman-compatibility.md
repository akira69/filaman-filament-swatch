# Native API compatibility

The edition requires authenticated same-origin FilaMan endpoints: paginated
`/api/v1/filaments`, `/colors`, `/spools` (include_archived/include_metrics),
`/locations`, `/spools/statuses`, `/me`, and `/app-settings/public-info`.
All pages must load; changing totals, duplicate IDs, auth and later-page failures
remain errors. Catalog availability is independent of inventory availability.

Synthetic contracts are in `scripts/fixtures/filaman/contracts.json`. Assignment
order and native IDs are retained; usage_count counts color assignment links.
`metrics.effective_remaining_weight_g` is authoritative even when null or zero;
raw remaining_weight_g is used only when the metric field is absent.
On-hand statuses are new/opened/drying/active; empty and archived are excluded.
Native striped/gradient style is kept separate from upstream direction labels.

The reference source instance is the photo/profile-capable PR182 image
`filaman-ui-test:pr182-da887e5d`, with the independent shell change from core
PR24 (`ae8b8fa2fcacddcc9a7930ad2e10451840db9dbe`). It must not be downgraded
through an older core. Release support is capability-tested, not inferred from
its version string. `/spool-reel.js` and `/reel-flange.webp` are optional shared
visual capabilities; discovery and textual links survive their absence.

No FilaMan database migrations, native editing, SpoolmanAPI plugin, external
catalog service or analytics is required by this edition.
