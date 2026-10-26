"""Build independent ZIPs using a shared compressed core and per-example assets."""
import json
import posixpath
import re
import shutil
import sys
import zipfile
from collections import deque
from pathlib import Path
from package import safe_relative

ASSET = re.compile(r'''["'(]([^"'()<>\s]+\.(?:css|js|png|jpe?g|gif|svg|webp|mp4|webm|mp3|ogg|woff2?|ttf|eot|otf|cur|ico|json|html)(?:[?#][^"'()<>\s]*)?)["')]''', re.I)
STORED = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".mp4", ".webm", ".mp3", ".woff", ".woff2", ".zip"}


def dependencies(seeds, root, files, root_pages):
    found, queue = set(), deque(seeds)
    while queue:
        name = queue.popleft()
        if name in found or name not in files: continue
        found.add(name)
        file = files[name]
        if file.suffix.lower() not in {".html", ".css", ".js", ".json"}: continue
        text = file.read_text(encoding="utf-8-sig", errors="replace")
        for value in ASSET.findall(text):
            if re.match(r"^[a-z][a-z0-9+.-]*:|^//|^#", value, re.I): continue
            value = value.split("?")[0].split("#")[0]
            candidates = [posixpath.normpath(posixpath.join(posixpath.dirname(name), value)), value.lstrip("/")]
            ref = next((item for item in candidates if item in files), None)
            if ref and ref not in root_pages and not ref.startswith("../"): queue.append(ref)
    return found


def write_file(archive, name, file):
    archive.write(file, safe_relative(name), compress_type=zipfile.ZIP_STORED if file.suffix.lower() in STORED else zipfile.ZIP_DEFLATED, compresslevel=4)


def archives(build, destination, preview_url, streaming=False):
    if not re.fullmatch(r"https://[a-z0-9]+\.cloudfront\.net/[a-z0-9-]+", preview_url): raise ValueError("Invalid preview URL")
    build, destination = Path(build).resolve(), Path(destination).resolve()
    root = build / "html"
    destination.mkdir(parents=True, exist_ok=True)
    files = {p.relative_to(root).as_posix(): p for p in root.rglob("*") if p.is_file()}
    files.update({p.relative_to(build).as_posix(): p for p in (build / "thumbnails").glob("*.jpg")})
    recipes = json.loads((build / "recipes.json").read_text(encoding="utf-8"))
    root_pages = {p.name for p in root.glob("*.html")}
    core = {name for name in files if name.split("/")[0] in {"css", "js", "sass", "forgeia-brand"}}
    core.update(name for name in files if name in {"style.css", "style-rtl.css", "style.scss", "package.json", "gulpfile.js"})
    core.update(name for name in files if name.startswith("include/") and Path(name).suffix.lower() in {".php", ".json", ".md", ".txt", ".lock"})
    core = dependencies(core, root, files, root_pages)
    base = destination / ".shared.zip"
    try:
        with zipfile.ZipFile(base, "w", zipfile.ZIP_DEFLATED, compresslevel=4) as archive:
            for name in sorted(core): write_file(archive, name, files[name])
        for recipe in recipes:
            chosen = set(recipe["pages"])
            family = recipe.get("family")
            if family: chosen.update(name for name in files if name.startswith(f"demos/{family}/"))
            if any("rs-plugin" in (root / page).read_text(encoding="utf-8") for page in recipe["pages"]):
                chosen.update(name for name in files if name.startswith(("include/rs-plugin/js/", "include/rs-plugin/css/", "include/rs-plugin/fonts/")))
            chosen = dependencies(chosen, root, files, root_pages) | set(recipe["pages"])
            target = destination / (recipe["id"] + ".zip")
            if not target.resolve().is_relative_to(destination): raise ValueError("Unsafe archive destination")
            shutil.copyfile(base, target)
            with zipfile.ZipFile(target, "a", zipfile.ZIP_DEFLATED, compresslevel=4) as archive:
                for name in sorted(chosen - core - root_pages): write_file(archive, name, files[name])
                rendered = {}
                for page in recipe["pages"]:
                    text = (root / page).read_text(encoding="utf-8")
                    text = re.sub(r'(href=["\'])([^"\'#?]+\.html)', lambda match: match[1] + (preview_url + "/" + match[2] if match[2] in root_pages and match[2] not in recipe["pages"] else match[2]), text)
                    rendered[page] = text
                    archive.writestr(safe_relative(page), text)
                if "index.html" not in rendered: archive.writestr("index.html", rendered[recipe["home"]])
                archive.writestr("LIRE-MOI-FORGEIA.txt", f"FORGEIA — {recipe['id']}\n\nOuvrir index.html ou lancer python -m http.server 8080 dans ce dossier. Les fichiers HTML/CSS/JavaScript sont déjà compilés.\n\n{len(recipe['pages'])} page(s) de ce projet et leurs dépendances sont incluses. Les liens vers d'autres exemples ouvrent la bibliothèque en ligne.\n\nLes logos et icônes utilisent FORGEIA (dossier forgeia-brand/). Les images à personnaliser remplacent des visuels absents du pack fourni. Les vidéos non fournies sont remplacées à l'affichage par leur poster : ajouter vos propres sources pour les lire.\n\nLes coordonnées, formulaires, boutiques, paiements et services externes sont des démonstrations à configurer avec votre propre serveur, vos comptes et vos paramètres. Les scripts PHP sont dans include/. Le serveur de prévisualisation FORGEIA sert uniquement les fichiers statiques. Les polices et médias externes nécessitent Internet.\n\nPersonnalisation SCSS : npm install puis npx gulp scsscompile ; les styles compilés restent directement utilisables.\n\nLes fichiers nécessaires à cet exemple sont regroupés pour limiter la taille du téléchargement. Crédits et conditions d'origine : voir LICENCES-SOURCES.txt et les mentions conservées dans les fichiers.\n\nTéléchargement gratuit provisoire pour les étudiants FORGEIA.\nhttps://www.forgeia.site/espace/ressources?tab=sites\n")
                archive.writestr("LICENCES-SOURCES.txt", "Sources : Canvas 7.3, SemiColonWeb. Les droits et conditions du pack et des composants restent applicables.\nLetMeScroll : Bruno Vieira, licence MIT conservée dans js/LET-ME-SCROLL-LICENSE.txt.\nLes photographies et médias fournis restent accompagnés des conditions de leur source.\n")
            with zipfile.ZipFile(target) as archive:
                names = set(archive.namelist())
                if not {"index.html", "forgeia-brand/favicon.svg", "forgeia-brand/brand.css"}.issubset(names): raise ValueError("Incomplete project archive")
                if "forgeia-brand/favicon.svg" not in archive.read("index.html").decode(): raise ValueError("Archive branding missing")
            print(json.dumps({"archive": recipe["id"], "bytes": target.stat().st_size}), flush=True)
            if streaming:
                if sys.stdin.readline().strip() != "ok": raise ValueError("Archive upload was not acknowledged")
    finally:
        base.unlink(missing_ok=True)
