import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile


class PackageTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        (self.root / "scripts").mkdir()
        shutil.copy(
            Path(__file__).parents[1] / "scripts/package-filaman-plugin.py",
            self.root / "scripts",
        )
        plugin = self.root / "filaman-plugin"
        plugin.mkdir()
        (plugin / "plugin.json").write_text(
            json.dumps({"plugin_key": "filament_swatch", "version": "1.0.0"})
        )
        (plugin / "router.py").write_text("# router")
        (plugin / "__init__.py").write_text("")
        (self.root / "dist/assets").mkdir(parents=True)
        (self.root / "dist/index.html").write_text("<main>Swatch</main>")
        (self.root / "dist/assets/app.js").write_text('console.log("Swatch")')
        (self.root / "dist/.gitkeep").touch()

    def package(self, tag):
        return subprocess.run(
            [sys.executable, str(self.root / "scripts/package-filaman-plugin.py"), tag],
            cwd=self.root,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_release_version_and_bundle_match_the_tag(self):
        result = self.package("filaman-v1.0.1")
        self.assertEqual(result.returncode, 0, result.stderr)
        with ZipFile(self.root / "filament-swatch-1.0.1.zip") as archive:
            self.assertEqual(
                json.loads(archive.read("plugin.json"))["version"], "1.0.1"
            )
            self.assertEqual(
                archive.read("static/assets/app.js"), b'console.log("Swatch")'
            )
            self.assertEqual(
                set(archive.namelist()),
                {
                    "plugin.json",
                    "router.py",
                    "__init__.py",
                    "static/index.html",
                    "static/assets/app.js",
                },
            )
        self.assertEqual(
            json.loads((self.root / "filaman-plugin/plugin.json").read_text())[
                "version"
            ],
            "1.0.0",
        )

    def test_invalid_release_tags_do_not_create_packages(self):
        for tag in (
            "v1.0.1",
            "filaman-vgarbage",
            "filaman-v1.2",
            "filaman-v01.2.3",
            "filaman-v1.2.3/extra",
        ):
            with self.subTest(tag=tag):
                self.assertNotEqual(self.package(tag).returncode, 0)
        self.assertEqual(list(self.root.glob("*.zip")), [])


if __name__ == "__main__":
    unittest.main()
