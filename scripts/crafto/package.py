"""Prepare Crafto's supplied sources and build independent student ZIPs."""
import argparse
import hashlib
import html
import json
import re
import shutil
import tarfile
import zipfile
from pathlib import Path, PurePosixPath

DOCS = "https://craftohtml.themezaa.com/documentation/"


def safe_relative(value):
    p = PurePosixPath(value)
    if p.is_absolute() or ".." in p.parts or "\\" in value:
        raise ValueError("Unsafe archive path")
    return p.as_posix()


def label(stem):
    return stem.replace("demo-", "").replace("-", " ").capitalize()


def prepare(source, output):
    source, output = Path(source).resolve(), Path(output).resolve()
    if source == output or source in output.parents or output.exists():
        raise ValueError("Use a new build directory outside the source package")
    output.mkdir(parents=True)
    shutil.copytree(source / "html", output / "html")
    shutil.copytree(source / "documentation", output / "documentation")
    shutil.copy2(source / "start-here.html", output / "start-here.html")
    root = output / "html"
    pages = sorted(p.name for p in root.glob("*.html"))
    start = (source / "start-here.html").read_text(encoding="utf-8-sig")
    homes = dict(re.findall(r'href="html/([^"]+\.html)"[^>]*class="demo-item"[^>]*>([^<]+)', start))
    if "demo-digital-agency-rtl.html" in pages:
        homes["demo-digital-agency-rtl.html"] = "Digital agency RTL"
    families = {file.removeprefix("demo-").removesuffix(".html"): file for file in homes}
    groups = {}
    entries = []
    for file in pages:
        stem = file.removesuffix(".html")
        family = next((f for f in sorted(families, key=len, reverse=True)
                       if stem == "demo-" + f or stem.startswith("demo-" + f + "-")), None)
        if stem.startswith("demo-digital-agency-") and stem.endswith("-rtl"):
            family = "digital-agency-rtl"
        group = family or stem
        groups.setdefault(group, []).append(file)
        category = "sites" if file in homes else ("pages" if family else "components")
        title = html.unescape(homes.get(file, label(stem)))
        entries.append({"id": stem, "title": title, "category": category, "family": family or "",
                        "page": file, "archive": group, "thumbnail": f"thumbnails/{stem}.jpg"})
    # The package is precompiled; provide the missing optional Gulp build command.
    gulp = root / "gulpfile.js"
    gulp.write_text(gulp.read_text(encoding="utf-8-sig") +
                    "\nexports.build = parallel(sassTask, iconTask, vendorsTask, concatVendorsTask, responsiveTask);\n",
                    encoding="utf-8")
    # Keep supplied artwork; external dimension placeholders become local SVGs.
    placeholders = {}
    pattern = re.compile(r"https?://placehold\.co/(\d+)x(\d+)(?:/[a-zA-Z0-9/]+)?(?:\?[^\s\"'<>)]*)?")
    for page in root.glob("*.html"):
        text = page.read_text(encoding="utf-8-sig")
        def replace(match):
            width, height = match.group(1, 2)
            name = f"images/placeholder-{width}x{height}.svg"
            placeholders[name] = (width, height)
            return name
        page.write_text(pattern.sub(replace, text), encoding="utf-8")
    for name, (w, h) in placeholders.items():
        (root / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><rect width="100%" height="100%" fill="#e8e6e0"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="24" fill="#777">{w} × {h}</text></svg>', encoding="utf-8")
    for entry in entries:
        entry["pageCount"] = len(groups[entry["archive"]])
    recipes = [{"id": group, "pages": files, "home": families.get(group, files[0])} for group, files in groups.items()]
    catalog = {"version": 1, "entries": entries, "sites": len(homes), "total": len(entries)}
    (output / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False), encoding="utf-8")
    (output / "recipes.json").write_text(json.dumps(recipes), encoding="utf-8")
    (output / "thumbnails").mkdir()
    for entry in entries:
        thumb = root / "images" / (entry["id"] + ".jpg")
        if entry["category"] == "sites" and thumb.exists():
            shutil.copy2(thumb, output / entry["thumbnail"])
    print(json.dumps({"pages": len(entries), "sites": len(homes), "archives": len(recipes), "output": str(output)}))


ASSET = re.compile(r"(?:\.\./)*(?:images|video)/[a-zA-Z0-9_@%+./-]+\.(?:png|jpe?g|gif|webp|svg|mp4|webm|ogg|mp3)", re.I)


def archives(build, destination, preview_url):
    if not re.fullmatch(r"https://[a-z0-9]+\.cloudfront\.net/[a-z0-9-]+", preview_url):
        raise ValueError("Provide the deployed CloudFront release URL")
    build, destination = Path(build), Path(destination)
    root = build / "html"
    destination.mkdir(parents=True, exist_ok=True)
    recipes = json.loads((build / "recipes.json").read_text(encoding="utf-8"))
    common = [p for p in root.rglob("*") if p.is_file() and p.relative_to(root).parts[0] in
              {"css", "js", "fonts", "sass", "demos", "rtl-css", "revolution", "email-templates"}]
    common += [root / "package.json", root / "gulpfile.js"]
    common_images = set()
    for file in common:
        if file.suffix.lower() in {".css", ".js", ".scss"}:
            common_images.update(m.lstrip("./") for m in ASSET.findall(file.read_text(encoding="utf-8-sig", errors="replace")))
    all_pages = set(p.name for p in root.glob("*.html"))
    for recipe in recipes:
        images = set(common_images)
        rendered = {}
        for page in recipe["pages"]:
            text = (root / page).read_text(encoding="utf-8")
            images.update(m.lstrip("./") for m in ASSET.findall(text))
            # Other demos remain available in the online library, rather than broken links.
            text = re.sub(r'(href=["\'])([^"\'#?]+\.html)',
                          lambda m: m[1] + (preview_url + "/" + m[2] if m[2] in all_pages and m[2] not in recipe["pages"] else m[2]), text)
            rendered[page] = text
        files = {p.relative_to(root).as_posix(): p for p in common}
        for image in images:
            file = root / safe_relative(image)
            if file.is_file():
                files[image] = file
        with zipfile.ZipFile(destination / (recipe["id"] + ".zip"), "w", zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
            for name, file in sorted(files.items()):
                archive.write(file, safe_relative(name))
            for name, text in rendered.items():
                archive.writestr(safe_relative(name), text)
            if "index.html" not in rendered:
                archive.writestr("index.html", rendered[recipe["home"]])
            archive.writestr("LIRE-MOI-FORGEIA.txt", f"FORGEIA — {label(recipe['id'])}\n\nOuvrir index.html dans un navigateur. Pour un serveur local, utiliser npm install puis npm start (Node.js), ou python -m http.server 8080.\n\nLes fichiers HTML/CSS/JS sont déjà compilés. npm run build recompile les styles et scripts partagés avec Gulp.\n\n{len(recipe['pages'])} page(s) du modèle incluses. Les liens vers d'autres modèles ouvrent la bibliothèque en ligne.\n\nIMAGES À PERSONNALISER : le pack original contient des emplacements et non les photographies des vignettes. Les vignettes illustrent le modèle final ; remplacer les images dans images/. Les polices Google, cartes, vidéos et services externes nécessitent Internet.\n\nFORMULAIRES : exemples de présentation. Pour un envoi réel, configurer votre propre serveur PHP et vos paramètres de messagerie dans email-templates/. Ne jamais publier d'identifiants dans les sources. Les démos FORGEIA bloquent l'envoi des formulaires.\n\nAuteur et crédits d'origine : ThemeZaa, Crafto 4.0. Les mentions et les conditions du pack restent applicables. Documentation : {DOCS}\n\nTéléchargement gratuit provisoire pour les étudiants FORGEIA.\n")
        print(json.dumps({"archive": recipe["id"], "bytes": (destination / (recipe["id"] + ".zip")).stat().st_size}), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["prepare", "archives", "bundle"])
    parser.add_argument("source")
    parser.add_argument("output")
    parser.add_argument("--preview-url", default="")
    args = parser.parse_args()
    if args.mode == "prepare":
        prepare(args.source, args.output)
    elif args.mode == "archives":
        archives(args.source, args.output, args.preview_url.rstrip("/"))
    else:
        with tarfile.open(args.output, "w:gz", compresslevel=6) as bundle:
            for file in sorted(Path(args.source).rglob("*")):
                if file.is_file():
                    bundle.add(file, arcname=file.relative_to(args.source).as_posix())
        file = Path(args.output)
        print(json.dumps({"bytes": file.stat().st_size, "sha256": hashlib.file_digest(file.open("rb"), "sha256").hexdigest()}))
