"""Package the built hosted app with a manifest matching its release tag."""

import json
import re
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

tag = sys.argv[1] if len(sys.argv) == 2 else ""
match = re.fullmatch(r"filaman-v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)", tag)
if not match:
    raise SystemExit("Expected a release tag of the form filaman-v1.2.3")

version = ".".join(match.groups())
root = Path(__file__).resolve().parents[1]
bundle = root / "dist"
if not (bundle / "index.html").is_file():
    raise SystemExit("Build the hosted app before packaging")

plugin = root / "filaman-plugin"
manifest = json.loads((plugin / "plugin.json").read_text())
manifest["version"] = version
archive_path = root / f"filament-swatch-{version}.zip"
with ZipFile(archive_path, "w", ZIP_DEFLATED) as archive:
    archive.writestr("plugin.json", json.dumps(manifest, indent=2) + "\n")
    for name in ("__init__.py", "router.py"):
        archive.write(plugin / name, name)
    for path in sorted(bundle.rglob("*")):
        if path.is_file() and path.name != ".gitkeep":
            archive.write(path, "static/" + path.relative_to(bundle).as_posix())
print(archive_path.name)
