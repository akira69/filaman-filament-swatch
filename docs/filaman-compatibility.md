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

`/spool-reel.js` and `/reel-flange.webp` are optional shared
visual capabilities; discovery and textual links survive their absence.
The shared `/plugin-fonts.css` supplies the same local Space Grotesk UI faces
inside the iframe. Development also proxies it and its `/_astro/` font assets.
FilaMan [PR206](https://github.com/Fire-Devils/filaman-system/pull/206) supplies
`/color-harmonies.js` and `/color-harmonies.css` for the shared detail wheel.
Swatch loads them when a detail view opens and uses its existing wheel on hosts
without these assets. Set `SHARED_HARMONY_DIR` to a built FilaMan static directory
to run the shared-wheel browser test with `npm test`.

No FilaMan database migrations, SpoolmanAPI plugin, external catalog service
or analytics is required by this edition.

## FilaMan Swatch 1.2.0 requirement

This release requires FilaMan 2.4.0 or later. Add color opens the existing
`/filaments/colors/` editor inside a same-origin iframe, retaining the host’s
validation and save behavior. The integration uses the native `btn-new`,
`modal-container`, `modal-form`, and `color-name` elements and waits for form
binding before opening. It does not duplicate native editor fields or POST logic.
Both the existing dialog and the improved RGB/wheel dialog from the Color Library
work were exercised through real saves, refresh, reload, Cancel, and Escape.

## FilaMan Swatch 1.1.1 requirement

Use a FilaMan build with the integration shell and compact catalog endpoint from
[PR204](https://github.com/Fire-Devils/filaman-system/pull/204) and the hosted SVG
installer fix from [PR217](https://github.com/Fire-Devils/filaman-system/pull/217).
FilaMan v2.0.5 includes PR204 and rejects the Swatch ZIP during SVG validation.
The existing shared renderer was merged in core commit
`4d5eabb5142b6a891d78ba7ad9df227d485e43e6`; it is not duplicated here.
