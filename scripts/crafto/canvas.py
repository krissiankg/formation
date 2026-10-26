"""Prepare the supplied Canvas sources as an additional FORGEIA collection."""
import argparse
import hashlib
import html
import json
import posixpath
import re
import shutil
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlsplit, urlunsplit
from brand import brand_tree
from package import safe_relative

EXTENSIONS = re.compile(r"\.(?:css|js|png|jpe?g|gif|svg|webp|mp4|webm|mp3|mov|ogg|woff2?|ttf|eot|otf|cur|ico)$", re.I)
REFERENCE = re.compile(r'''\b(?:src|href|poster|data-src|data-background|data-thumb|data-large|data-at2x|data-lazyload|data-videomp4|data-videowebm)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^'"\s)]+)["']?\s*\)''', re.I)
MEDIA = {".mp4", ".webm", ".mp3", ".mov", ".ogg"}
ROOT_DIRS = {"images", "demos", "include", "css", "js", "one-page", "saas-page", "forgeia-brand", "thumbnails"}


def extract(archive_file, destination):
    destination = Path(destination).resolve()
    if destination.exists(): raise ValueError("Use a new extraction directory")
    with zipfile.ZipFile(archive_file) as archive:
        items = archive.infolist()
        if len(items) > 20000 or sum(item.file_size for item in items) > 3_000_000_000:
            raise ValueError("Unexpected source package size")
        for item in items:
            safe_relative(item.filename)
            if (item.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError("Source symlinks are not supported")
            if any(part in {"__MACOSX", "node_modules", ".git"} or part.startswith("._") for part in Path(item.filename).parts): continue
            if Path(item.filename).suffix.lower() in {".pem", ".key"} or Path(item.filename).name.startswith(".env"): continue
            archive.extract(item, destination)


def references(text):
    for match in REFERENCE.finditer(text):
        group = 1 if match.group(1) is not None else 2
        yield match.start(group), match.end(group), match.group(group)


def resolve_reference(value, document, files):
    value = html.unescape(value)
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or not parsed.path or not EXTENSIONS.search(parsed.path): return None
    relative = unquote(parsed.path)
    candidates = [posixpath.normpath(posixpath.join(posixpath.dirname(document), relative))]
    if relative.startswith("/") or relative.split("/")[0] in ROOT_DIRS: candidates.insert(0, relative.lstrip("/"))
    for candidate in candidates:
        if candidate in files: return candidate
    return candidates[0] if len(candidates) == 1 else candidates[0]


def repair(root):
    root = Path(root)
    restored = []
    aliases = {
        "include/rs-plugin/js/public/assets/images/transparent.png": "include/rs-plugin/demos/assets/images/transparent.png",
        "include/rs-plugin/js/addons/revolution.addon.whiteboard.min.js": "include/rs-plugin/demos/whiteboard/js/revolution.addon.whiteboard.min.js",
        **{f"demos/home/fonts/revicons/revicons.{ext}": f"include/rs-plugin/fonts/revicons/revicons.{ext}" for ext in ["eot", "woff", "ttf"]},
    }
    for target, source in aliases.items():
        if not (root / target).exists() and (root / source).is_file():
            (root / target).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(root / source, root / target)
            restored.append(target)
    bundle = root / "js/functions.bundle.js"
    if bundle.is_file():
        script = bundle.read_text(encoding="utf-8-sig")
        script = script.replace('var eventChange = new Event("change");', 'if (!input) return;\nvar eventChange = new Event("change");')
        script = script.replace('plus.onclick = function(e)', 'if (plus) plus.onclick = function(e)').replace('minus.onclick = function(e)', 'if (minus) minus.onclick = function(e)')
        bundle.write_text(script, encoding="utf-8")
    whiteboard = root / "include/rs-plugin/js/addons/revolution.addon.whiteboard.min.js"
    if whiteboard.is_file():
        script = whiteboard.read_text(encoding="utf-8-sig")
        script = script.replace('jQuery(this).on("revolution.slide.onloaded",function(){a(e)})', 'jQuery(this).on("revolution.slide.onloaded",function(){var t=jQuery(this).data("opt");t&&a(t)})')
        whiteboard.write_text(script, encoding="utf-8")
    support = Path(__file__).resolve().parents[2] / "assets/website-examples-support/letmescroll"
    (root / "js/plugins.letmescroll.js").write_bytes((support / "letmescroll.js").read_bytes())
    (root / "css/letmescroll.css").write_bytes((support / "letmescroll.css").read_bytes())
    (root / "js/LET-ME-SCROLL-LICENSE.txt").write_bytes((support / "LICENSE").read_bytes())
    restored.append("js/plugins.letmescroll.js")
    magazine = root / "demos/magazine/magazine.css"
    magazine.parent.mkdir(parents=True, exist_ok=True)
    magazine.write_text('''/* FORGEIA: replacement styling for the stylesheet absent from the supplied pack. */
:root{--cnvs-themecolor:#a72d65;--cnvs-themecolor-rgb:167,45,101}
.canvas-custom-scroll{overflow:auto;scrollbar-width:thin}.canvas-custom-scroll .entry{margin:0;border-bottom:1px solid rgba(128,128,128,.15)}
.canvas-custom-scroll .entry h5{font-size:.95rem;line-height:1.35}.canvas-custom-scroll .logo{padding:1.5rem .5rem}
.post-grid-wrap .entry{margin-bottom:1.5rem}.post-grid-wrap .entry-image img{width:100%;object-fit:cover;border-radius:.5rem}
.live-date-time{font-variant-numeric:tabular-nums}.dark .entry-meta{color:#b7bac4}
@media(max-width:767px){.canvas-custom-scroll{max-height:550px}.canvas-custom-scroll.position-sticky{position:relative!important}}
''', encoding="utf-8")
    restored.append("demos/magazine/magazine.css")
    text_files = sorted(p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in {".html", ".css"})
    for file in text_files:
        text = file.read_text(encoding="utf-8-sig", errors="replace")
        text = text.replace("https://bmsvieira.github.io/letmescroll.js/css/letmescroll.css", "css/letmescroll.css")
        if file.name == "demo-magazine.html":
            text = text.replace("selector: element,", "selector: '#' + (element.id || (element.id = 'forgeia-scroll-' + Array.from(document.querySelectorAll('.canvas-custom-scroll')).indexOf(element))),")
        text = text.replace('data-scrollto="intro.html##section-onepage"', '').replace('intro.html##section-onepage', 'intro.html#section-onepage')
        if file.name == "landing-4.html":
            text = text.replace('<script>', '<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script><script>', 1)
        if file.name == "right-hamburger.html":
            text = re.sub(r"<script>\s*jQuery\('\.carousel-widget'\)\.appear\([\s\S]*?</script>", '<script>new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting)jQuery(entry.target).trigger("play.owl.autoplay",[5000]);});},{rootMargin:"120px"}).observe(document.querySelector(".carousel-widget"));</script>', text)
        if file.name == "block-slider-1.html" and not re.search(r'''id=["']slider["']''', text):
            text = re.sub(r'''(<section\b)([^>]*class=["'][^"']*\bslider-element\b)''', r'\1 id="slider"\2', text, count=1)
        def holder(match):
            width, height = match.group(1), match.group(2)
            target = f"forgeia-brand/placeholders/holder-{width}-{height}.svg"
            image = root / target
            image.parent.mkdir(parents=True, exist_ok=True)
            image.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}"><rect width="100%" height="100%" fill="#ebe8e1"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="24" fill="#79756d">{width} × {height}</text></svg>', encoding="utf-8")
            return posixpath.relpath(target, file.relative_to(root).parent.as_posix())
        text = re.sub(r'''(?<![\w/])holder\.js/(\d+)x(\d+)(?:\?[^"'\s<>]+)?''', holder, text)
        if file.suffix == ".html":
            # These stale imports do not implement any selector used by the pages;
            # the gallery and Swiper styles are already supplied inline and in style.css.
            text = re.sub(r'<link\b[^>]*href=["\'](?:css/patterns\.css|saas-page/saas-page\.css)["\'][^>]*>', "", text, flags=re.I)
        file.write_text(text, encoding="utf-8")
    files = {p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_file()}
    lower = {name.lower(): name for name in files}
    replacements, missing_media = {}, set()
    scanned = []
    for file in text_files:
        document = file.relative_to(root).as_posix()
        text = file.read_text(encoding="utf-8")
        scanned.append((file, document, text))
        for _, _, value in references(text):
            ref = resolve_reference(value, document, files)
            if not ref or ref in files or ref.startswith("../"): continue
            if ref.lower() in lower:
                replacements[ref] = lower[ref.lower()]
                continue
            if Path(ref).suffix.lower() in MEDIA:
                missing_media.add(ref)
                continue
            if Path(ref).suffix.lower() in {".css", ".js", ".woff", ".woff2", ".ttf", ".otf", ".eot"}:
                raise ValueError(f"Unresolved required asset: {ref} in {document}")
            # Prefer an existing file when only its image extension is wrong.
            alternate = next((str(Path(ref).with_suffix(ext)).replace("\\", "/") for ext in [".jpg", ".jpeg", ".png", ".svg", ".webp"] if str(Path(ref).with_suffix(ext)).replace("\\", "/") in files), None)
            if alternate:
                replacements[ref] = alternate
                continue
            target = "forgeia-brand/placeholders/" + hashlib.sha256(ref.encode()).hexdigest()[:16] + ".svg"
            placeholder = root / target
            placeholder.parent.mkdir(parents=True, exist_ok=True)
            placeholder.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#ebe8e1"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="25" fill="#79756d">Image à personnaliser</text></svg>', encoding="utf-8")
            replacements[ref] = target
    def rewrite(text, document):
        edits = []
        for start, end, value in references(text):
            ref = resolve_reference(value, document, files)
            if ref in replacements:
                parsed = urlsplit(html.unescape(value))
                target = posixpath.relpath(replacements[ref], posixpath.dirname(document) or ".")
                edits.append((start, end, urlunsplit(("", "", target, parsed.query, parsed.fragment))))
        for start, end, value in reversed(edits): text = text[:start] + value + text[end:]
        return text
    for file, document, text in scanned:
        text = rewrite(text, document)
        if file.suffix == ".html" and missing_media:
            def source_tag(match):
                return "" if any(media in match.group(0) for media in missing_media) else match.group(0)
            text = re.sub(r"<source\b[^>]*>", source_tag, text, flags=re.I)
            for media in missing_media:
                text = re.sub(r'\b(?:data-videomp4|data-videowebm|src)=["\']' + re.escape(media) + r'["\']', '', text)
        file.write_text(text, encoding="utf-8")
    return {"restored": restored, "replacements": replacements, "missingVideosToCustomize": sorted(missing_media)}


def prepare(source, output, preview_url, consume=False):
    source, output = Path(source).resolve(), Path(output).resolve()
    if output.exists() or source == output or source in output.parents: raise ValueError("Use a new build directory outside the source")
    if not (source / "style.css").is_file():
        candidates = [p.parent for p in source.rglob("package.json") if (p.parent / "style.css").is_file() and (p.parent / "index.html").is_file()]
        if len(candidates) != 1: raise ValueError("Cannot identify the template source directory")
        source = candidates[0]
    families = [p.name for p in (source / "demos").iterdir() if p.is_dir() and (source / ("demo-" + p.name + ".html")).is_file()]
    output.mkdir(parents=True)
    root = output / "html"
    if consume:
        extraction = (Path.cwd() / "canvas-original").resolve()
        if source != extraction and not source.is_relative_to(extraction): raise ValueError("Can only consume this job's extracted sources")
        source.rename(root)
    else:
        shutil.copytree(source, root, ignore=shutil.ignore_patterns("__MACOSX", "._*", ".DS_Store", "node_modules", ".git", "*.pem", "*.key", ".env*"))
    report = repair(root)
    from canvas_vendor import localize_vendors
    report["vendorAssets"] = localize_vendors(root)
    pages = sorted(p.name for p in root.glob("*.html") if not p.name.startswith("._"))
    groups, entries, homes = {}, [], {"demo-" + family + ".html" for family in families}
    for page in pages:
        stem = page.removesuffix(".html")
        family = next((f for f in sorted(families, key=len, reverse=True) if stem == "demo-" + f or stem.startswith("demo-" + f + "-")), None)
        group = family or stem
        groups.setdefault(group, []).append(page)
        content = (root / page).read_text(encoding="utf-8")
        title = re.search(r"<title[^>]*>(.*?)</title>", content, re.I | re.S)
        label = html.unescape(title[1]).split("|")[0].strip() if title else stem.replace("-", " ").capitalize()
        if label.lower() in {"canvas", ""}: label = stem.replace("-", " ").capitalize()
        identifier = "f2-" + re.sub(r"[^a-z0-9-]", "-", stem.lower())
        if len(identifier) > 100: identifier = identifier[:90] + "-" + hashlib.sha256(page.encode()).hexdigest()[:8]
        display_page = page
        if not re.search(r"<(?:html|head|body)\b", content, re.I):
            display_page = "forgeia-" + page
            parent = root / ("demo-" + family + ".html" if family else "index.html")
            parent_text = parent.read_text(encoding="utf-8")
            styles = "\n".join(tag for tag in re.findall(r"<link\b[^>]*>", parent_text, re.I) if re.search(r'''rel=["']stylesheet["']''', tag, re.I))
            custom = ".offcanvas{position:relative!important;visibility:visible!important;transform:none!important;inset:auto!important;width:100%!important}.position-fixed[data-bs-target]{display:none!important}" if page == "switcher-html.html" else ""
            (root / display_page).write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(label)} | FORGEIA</title>{styles}<style>{custom}</style></head><body class="stretched"><main class="container py-5"><h1>{html.escape(label)}</h1><div class="row">{content}</div></main><script src="js/plugins.min.js"></script><script src="js/functions.bundle.js"></script></body></html>', encoding="utf-8")
            groups[group].append(display_page)
            report.setdefault("fragmentPreviews", {})[page] = display_page
        entries.append({"id": identifier, "title": label[:200], "category": "sites" if page in homes else "pages" if family else "components", "family": family or "", "page": display_page, "archive": group, "thumbnail": f"thumbnails/{identifier}.jpg", "collection": "forgeia-2"})
    for entry in entries: entry["pageCount"] = len(groups[entry["archive"]])
    recipes = [{"id": group, "family": group if group in families else None, "pages": files, "home": "demo-" + group + ".html" if group in families else files[0]} for group, files in groups.items()]
    for recipe in recipes:
        recipe["home"] = report.get("fragmentPreviews", {}).get(recipe["home"], recipe["home"])
    catalog_file = output / "catalog.json"
    catalog_file.write_text(json.dumps({"version": 1, "entries": entries, "sites": len(homes), "total": len(entries)}, ensure_ascii=False), encoding="utf-8")
    (output / "recipes.json").write_text(json.dumps(recipes), encoding="utf-8")
    (output / "thumbnails").mkdir()
    report["branding"] = brand_tree(root, "canvas", preview_url, catalog_file)
    # Restore optional SCSS tasks while retaining the already compiled stylesheet.
    gulp = root / "gulpfile.js"
    if gulp.exists():
        gulp.write_text("const postcss = require('gulp-postcss');\nconst autoprefixer = require('autoprefixer');\nconst rtlcss = require('gulp-rtlcss');\n" + gulp.read_text(encoding="utf-8-sig"), encoding="utf-8")
    (output / "repair-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"pages": len(entries), "sites": len(homes), "archives": len(recipes), "repairedPaths": len(report["replacements"]), "restoredAssets": len(report["restored"])}), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["extract", "prepare", "archives"])
    parser.add_argument("source")
    parser.add_argument("output")
    parser.add_argument("--preview-url", default="")
    parser.add_argument("--consume-extracted", action="store_true")
    parser.add_argument("--stream", action="store_true")
    args = parser.parse_args()
    if args.mode == "extract": extract(args.source, args.output)
    elif args.mode == "prepare": prepare(args.source, args.output, args.preview_url, args.consume_extracted)
    else:
        from canvas_archives import archives
        archives(args.source, args.output, args.preview_url, args.stream)
