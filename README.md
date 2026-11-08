# FilaMan Swatch

FilaMan Swatch is a native FilaMan integration plugin for visual filament discovery, providing discovery-only inventory and catalog views.

## Features

- **Discovery-only modes**: View native FilaMan inventory and color catalog.
- **Native editing**: All edits remain within FilaMan.
- **Host sync**: Language, currency, theme, follow FilaMan.
- **RGBA support**: Full transparency handling.
- **Logos**: Manufacturer logos included where available.
- **Optional reel visuals**: Shared `/spool-reel.js` renderer and `/reel-flange.webp` asset are supported but not required.

## Installation

**FilaMan Swatch 1.1.0 requires a FilaMan build that includes the integration shell and installer from [FilaMan PR204](https://github.com/Fire-Devils/filaman-system/pull/204).** While PR204 is pending, use a build from its branch.

1. Download `filament-swatch-1.1.0.zip` from the [1.1.0 release](https://github.com/akira69/filaman-filament-swatch/releases/tag/filaman-v1.1.0).
2. In FilaMan, open **Admin → Plugins** and upload the ZIP.
3. Open **FilaMan Swatch** from the sidebar.

> No SpoolmanAPI plugin or external services required.

## Requirements

- Authenticated same-origin FilaMan endpoints:
  - `/api/v1/filaments`, `/colors`, `/spools`, `/locations`, `/spools/statuses`, `/me`, `/app-settings/public-info`
- All pages must load correctly; duplicate IDs and auth failures are errors.
- Catalog availability is independent of inventory.

See [compatibility docs](docs/filaman-compatibility.md) for full API details.

## Development

### Setup

```bash
npm ci
```

### Run Dev Server

```bash
FILAMAN_DEV_URL=http://127.0.0.1:8087 \
VITE_HOSTED_MODE=1 \
VITE_BASE_PATH=/plugins/filament-swatch/ \
npm run dev
```

Open in browser:

```
/plugins/filament-swatch/app/swatch?filaman_hosted=1&filaman_hosted_config=/plugins/filament-swatch/hosted-config
```

### Build & Test

```bash
VITE_HOSTED_MODE=1 VITE_BASE_PATH=/plugins/filament-swatch/ npm run build
npm test
# Python environment needs FastAPI and httpx
python -m unittest discover -s tests
```

Color Harmonies uses the shared FilaMan wheel when the host provides it. Pinned palettes are stored in the browser. Use FilaMan to edit filaments and colors.

## Packaging

Release tag must match bundled notes:

```bash
python scripts/package-filaman-plugin.py filaman-v1.1.0
```

## Upstream Updates

- Review PRs manually; never auto-merge.
- Conflicts and adoption require manual reconciliation.
- MIT license and attribution retained.

---

**License**: [MIT](LICENSE)
**Original Project**: [Disane87/spoolman-filament-swatch](https://github.com/Disane87/spoolman-filament-swatch)
**Fork**: [akira69/filaman-filament-swatch](https://github.com/akira69/filaman-filament-swatch)
