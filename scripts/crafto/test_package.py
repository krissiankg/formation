import importlib.util
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

spec = importlib.util.spec_from_file_location("crafto_package", Path(__file__).with_name("package.py"))
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)


class PackageTests(unittest.TestCase):
    def test_no_archive_traversal(self):
        for value in ["../secret", "/root/file", "images/../../secret", "a\\b"]:
            with self.assertRaises(ValueError):
                package.safe_relative(value)

    def test_site_zip_includes_pages_assets_and_working_entrypoint(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            html = root / "build" / "html"
            (html / "images").mkdir(parents=True)
            (html / "css").mkdir()
            (html / "css/style.css").write_text("body{}")
            (html / "package.json").write_text("{}")
            (html / "gulpfile.js").write_text("")
            (html / "images/hero.svg").write_text("<svg/>")
            (html / "demo-test.html").write_text('<img src="images/hero.svg"><a href="demo-test-contact.html">Contact</a><a href="other.html">Other</a>')
            (html / "demo-test-contact.html").write_text("Contact page")
            (html / "other.html").write_text("Other demo")
            (root / "build/recipes.json").write_text(json.dumps([{"id": "test", "home": "demo-test.html", "pages": ["demo-test.html", "demo-test-contact.html"]}]))
            package.archives(root / "build", root / "zips", "https://d123.cloudfront.net/crafto-v1")
            with zipfile.ZipFile(root / "zips/test.zip") as archive:
                self.assertIsNone(archive.testzip())
                self.assertIn("images/hero.svg", archive.namelist())
                self.assertIn("demo-test-contact.html", archive.namelist())
                self.assertIn("demo-test-contact.html", archive.read("index.html").decode())
                self.assertIn("https://d123.cloudfront.net/crafto-v1/other.html", archive.read("index.html").decode())
                self.assertNotIn("other.html", archive.namelist())
                self.assertIn("IMAGES À PERSONNALISER", archive.read("LIRE-MOI-FORGEIA.txt").decode())


if __name__ == "__main__":
    unittest.main()
