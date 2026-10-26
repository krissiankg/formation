import json
import tempfile
import unittest
import zipfile
from pathlib import Path
from canvas import extract, prepare
from canvas_archives import archives
from package import safe_relative


class CanvasImportTests(unittest.TestCase):
    def test_fragment_preview_preserves_ajax_source(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            source, build = base / "source", base / "build"
            for name in ["css", "js", "demos/news"]: (source / name).mkdir(parents=True, exist_ok=True)
            (source / "style.css").write_text('body{}')
            (source / "index.html").write_text('<html><head><title>Canvas</title></head><body></body></html>')
            (source / "demo-news.html").write_text('<html><head><title>News</title><link rel="stylesheet" href="style.css"></head><body></body></html>')
            (source / "demo-news-2.html").write_text('<article class="entry">Canvas news</article>')
            prepare(source, build, 'https://d123.cloudfront.net/forgeia-two')
            original = (build / 'html/demo-news-2.html').read_text()
            self.assertNotIn('<head>', original)
            self.assertIn('FORGEIA news', original)
            catalog = json.loads((build / 'catalog.json').read_text())
            entry = next(item for item in catalog['entries'] if item['id'] == 'f2-demo-news-2')
            self.assertEqual(entry['page'], 'forgeia-demo-news-2.html')
            self.assertIn('forgeia-brand/favicon.svg', (build / 'html' / entry['page']).read_text())
            recipes = json.loads((build / 'recipes.json').read_text())
            project = next(item for item in recipes if item['id'] == 'news')
            self.assertIn('demo-news-2.html', project['pages'])
            self.assertIn(entry['page'], project['pages'])

    def test_import_repairs_paths_preserves_originals_and_builds_independent_zip(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            source, build = base / "original", base / "build"
            for name in ["css", "js", "images", "demos/tiny"]:
                (source / name).mkdir(parents=True, exist_ok=True)
            (source / "style.css").write_text("body{color:black}")
            (source / "images/Hero.JPG").write_bytes(b"image")
            (source / "images/unused.jpg").write_bytes(b"unused")
            (source / "demos/tiny/data.json").write_text('{}')
            (source / "index.html").write_text('<html><head><title>Canvas</title></head><body><a href="slider-canvas.html"><img src="images/old.jpg"></a></body></html>')
            page = '<html><head><title>Tiny | Canvas</title><link rel="stylesheet" href="style.css"></head><body><img src="images/hero.jpg"><img src="images/absent.jpg"><video><source src="images/missing.mp4"></video><a href="demo-tiny-contact.html">Contact</a><a href="index.html">Examples</a></body></html>'
            (source / "demo-tiny.html").write_text(page)
            (source / "demo-tiny-contact.html").write_text('<html><head><title>Contact | Canvas</title></head><body>Contact</body></html>')
            (source / "slider-canvas.html").write_text('<html><head><title>Canvas Slider</title></head><body><canvas></canvas></body></html>')
            prepare(source, build, "https://d123.cloudfront.net/forgeia-two")
            catalog = json.loads((build / "catalog.json").read_text())
            self.assertEqual(len(catalog["entries"]), 4)
            slider = next(entry for entry in catalog["entries"] if entry["page"] == "slider-forgeia.html")
            self.assertEqual(slider["id"], "f2-slider-forgeia")
            self.assertIn('thumbnails/f2-slider-forgeia.jpg', (build / "html/index.html").read_text())
            result = (build / "html/demo-tiny.html").read_text()
            self.assertIn("images/Hero.JPG", result)
            self.assertIn("placeholders/", result)
            self.assertNotIn('src="images/missing.mp4"', result)
            self.assertEqual((source / "demo-tiny.html").read_text(), page)
            # Review only this project's archive; it must not contain unrelated pages/media.
            recipes = json.loads((build / "recipes.json").read_text())
            (build / "recipes.json").write_text(json.dumps([next(recipe for recipe in recipes if recipe["id"] == "tiny")]))
            archives(build, base / "archives", "https://d123.cloudfront.net/forgeia-two")
            with zipfile.ZipFile(base / "archives/tiny.zip") as archive:
                self.assertIsNone(archive.testzip())
                self.assertIn("images/Hero.JPG", archive.namelist())
                self.assertIn("demo-tiny-contact.html", archive.namelist())
                self.assertIn("demos/tiny/data.json", archive.namelist())
                self.assertNotIn("images/unused.jpg", archive.namelist())
                self.assertNotIn("slider-forgeia.html", archive.namelist())
                self.assertIn("https://d123.cloudfront.net/forgeia-two/index.html", archive.read("index.html").decode())

    def test_extraction_rejects_zip_traversal_and_windows_drive_paths(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            for index, name in enumerate(["../escape", "C:/escape", "folder\\escape"]):
                with self.assertRaises(ValueError): safe_relative(name)
                # zipfile normalizes backslashes on Windows before writing them.
                if "\\" in name: continue
                file = base / f"source-{index}.zip"
                with zipfile.ZipFile(file, "w") as archive: archive.writestr(name, "bad")
                with self.assertRaises(ValueError): extract(file, base / f"output-{index}")


if __name__ == "__main__":
    unittest.main()
