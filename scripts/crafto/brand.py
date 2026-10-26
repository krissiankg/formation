"""Apply FORGEIA's presentation without changing template APIs or source licences."""
import argparse
import base64
import html
import json
import posixpath
import re
import struct
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit

BRAND_WORD = re.compile(r"\b(?:canvas|crafto|themezaa|semicolonweb)\b", re.I)
OWNER_URL = "https://www.forgeia.site/espace/ressources?tab=sites"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
PROTECTED = {"script", "style", "code", "pre", "canvas"}


def brand_text(value):
    value = re.sub(r"[\w.+-]+@(?:canvas|crafto)\.[a-z]+", "contact@forgeia.site", value, flags=re.I)
    value = re.sub(r"(?:https?://)?(?:www\.)?(?:craftohtml\.themezaa\.com|canvastemplate\.com|canvas\.com|themezaa\.com|semicolonweb\.com)", "www.forgeia.site", value, flags=re.I)
    return BRAND_WORD.sub("FORGEIA", value)


def owner_link(value):
    parsed = urlsplit(value)
    host = parsed.hostname or ""
    if any(name in host.lower() for name in ("themezaa", "semicolonweb", "canvastemplate", "craftohtml")) or host.lower().removeprefix("www.") == "canvas.com":
        return OWNER_URL
    if host.lower().endswith("themeforest.net") and re.search(r"canvas|crafto", value, re.I):
        return OWNER_URL
    if value.lower().startswith("mailto:") and re.search(r"@(?:canvas|crafto)\.", value, re.I):
        return "mailto:contact@forgeia.site"
    return value


class BrandHTML(HTMLParser):
    def __init__(self, page, pack, canonical="", known_pages=(), source_root=None, page_map=None):
        super().__init__(convert_charrefs=False)
        self.page, self.pack, self.canonical = page, pack, canonical
        self.known_pages = set(known_pages)
        self.source_root = Path(source_root).resolve() if source_root else None
        self.page_map = {a: b for a, b in (page_map or {}).items() if a != b}
        self.stack, self.out = [], []
        self.logos = 0
        self.title_start = 0

    def asset(self, name):
        return posixpath.relpath("forgeia-brand/" + name, posixpath.dirname(self.page) or ".")

    def write_tag(self, tag, attrs, closing=False):
        rendered = "".join(" " + key + ("=\"" + html.escape(str(value), quote=True) + "\"" if value is not None else "") for key, value in attrs)
        self.out.append("<" + tag + rendered + (" /" if closing else "") + ">")

    def handle_starttag(self, tag, attrs):
        self.start(tag, attrs, False)

    def handle_startendtag(self, tag, attrs):
        self.start(tag, attrs, True)

    def start(self, tag, attrs, closing):
        data = dict(attrs)
        if tag == "link" and ("icon" in (data.get("rel") or "").lower() or data.get("href", "").endswith("forgeia-brand/brand.css")):
            return
        if tag == "link" and data.get("rel", "").lower() == "canonical":
            return
        if tag == "meta" and data.get("name", "").lower() == "application-name":
            return
        context = " ".join((item[1].get("id") or "") + " " + (item[1].get("class") or "") for item in self.stack)
        src = data.get("src") or data.get("srcset") or ""
        base = posixpath.basename(src.split(",")[0].split(" ")[0]).lower()
        own_logo = (tag in {"img", "source"} and (
            re.search(r"(?:^|\s)(?:navbar-brand|logo|brand-logo)(?:\s|$)", context)
            or re.search(r"canvas\s*logo|crafto\s*logo", data.get("alt", ""), re.I)
            or (not re.search(r"client|partner|payment|visa|paypal|stripe|award", base)
                and re.fullmatch(r"(?:(?:footer-)?logo|demo-.+-logo)(?:[-_](?:black|white|light|dark|color|gradient))?(?:@2x)?\.(?:png|svg|jpe?g|webp)", base))
        ))
        if own_logo:
            is_light = (data["data-forgeia-logo"] == "light") if "data-forgeia-logo" in data else bool(re.search(r"white|light", base) or (self.pack == "canvas" and re.search(r"logo[-_]?dark", base)))
            layout = data.get("data-forgeia-layout", "wordmark")
            if self.source_root and "data-forgeia-layout" not in data and not urlsplit(src).scheme:
                original = (self.source_root / posixpath.dirname(self.page) / src.split(",")[0].split(" ")[0]).resolve()
                if original.is_relative_to(self.source_root) and original.is_file() and original.suffix.lower() == ".png":
                    with original.open("rb") as image:
                        header = image.read(24)
                    if header[:8] == b"\x89PNG\r\n\x1a\n":
                        width, height = struct.unpack(">II", header[16:24])
                        if height and width / height <= 1.35: layout = "symbol"
            variant = "light" if is_light else "dark"
            target = self.asset(("mark-" if layout == "symbol" else "logo-") + variant + ".svg")
            for key in ["src", "srcset", "data-src", "data-srcset", "data-at2x", "data-sticky-logo", "data-mobile-logo"]:
                if key in data or key == "src": data[key] = target
            if "data-dark-logo" in data: data["data-dark-logo"] = self.asset("logo-light.svg")
            data["alt"] = "FORGEIA"
            data["data-forgeia-logo"] = "light" if is_light else "dark"
            data["data-forgeia-layout"] = layout
            data["class"] = " ".join(dict.fromkeys(data.get("class", "").split() + ["forgeia-brand-logo"]))
            data["width"], data["height"] = ("44" if layout == "symbol" else "165"), "44"
            self.logos += 1
        for key in ["alt", "title", "aria-label", "placeholder"]:
            if data.get(key): data[key] = brand_text(data[key])
        if tag == "meta" and data.get("content"):
            if data.get("property", "").lower() == "og:url" and self.canonical:
                data["content"] = self.canonical
            elif (data.get("property") or data.get("name") or "").lower() in {"og:image", "twitter:image"} and self.canonical:
                data["content"] = urljoin(self.canonical, self.asset("apple-icon.png"))
            else:
                data["content"] = brand_text(data["content"])
        if tag == "a" and data.get("href"):
            data["href"] = owner_link(data["href"])
            parsed = urlsplit(data["href"])
            if not parsed.scheme and not parsed.netloc and parsed.path:
                original = posixpath.normpath(parsed.path.lstrip("/") if parsed.path.startswith("/") else posixpath.join(posixpath.dirname(self.page), parsed.path))
                if original in self.page_map:
                    target = "/" + self.page_map[original] if parsed.path.startswith("/") else posixpath.relpath(self.page_map[original], posixpath.dirname(self.page) or ".")
                    data["href"] = urlunsplit(("", "", target, parsed.query, parsed.fragment))
        # Marketing pages show screenshots of the rebranded examples.
        if tag == "img" and self.page == "index.html" and not own_logo:
            linked = next((item[1].get("href") for item in reversed(self.stack) if item[0] == "a"), "")
            if linked in self.known_pages and linked != self.page:
                thumbnail = "thumbnails/" + linked.removesuffix(".html") + ".jpg"
                data["src"] = thumbnail
                for key in ["data-src", "srcset", "data-srcset"]:
                    if key in data: data[key] = thumbnail
        self.write_tag(tag, list(data.items()), closing)
        if tag == "title": self.title_start = len(self.out)
        if not closing and tag not in VOID: self.stack.append((tag, data))

    def handle_endtag(self, tag):
        if tag == "title" and "FORGEIA" not in "".join(self.out[self.title_start:]).upper():
            self.out.append(" | FORGEIA")
        if tag == "head":
            self.out.append('<!-- FORGEIA:brand-start -->'
                            f'<link rel="icon" type="image/svg+xml" href="{self.asset("favicon.svg")}">\n'
                            f'<link rel="apple-touch-icon" href="{self.asset("apple-icon.png")}">\n'
                            f'<link rel="stylesheet" href="{self.asset("brand.css")}">\n'
                            '<meta name="application-name" content="FORGEIA">\n')
            if self.canonical: self.out.append(f'<link rel="canonical" href="{html.escape(self.canonical, quote=True)}">\n')
            self.out.append('<!-- FORGEIA:brand-end -->')
        self.out.append("</" + tag + ">")
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, value):
        if any(tag == "script" for tag, _ in self.stack):
            for original, target in self.page_map.items():
                if original != target: value = value.replace(original, target)
        self.out.append(value if any(tag in PROTECTED for tag, _ in self.stack) else brand_text(value))

    def handle_entityref(self, name): self.out.append("&" + name + ";")
    def handle_charref(self, name): self.out.append("&#" + name + ";")
    def handle_comment(self, value): self.out.append("<!--" + value + "-->")
    def handle_decl(self, value): self.out.append("<!" + value + ">")
    def handle_pi(self, value): self.out.append("<?" + value + ">")


def brand_html(text, page, pack, canonical="", known_pages=(), source_root=None, page_map=None):
    text = re.sub(r"<!-- FORGEIA:brand-start -->.*?<!-- FORGEIA:brand-end -->", "", text, flags=re.S)
    parser = BrandHTML(page, pack, canonical, known_pages, source_root, page_map)
    parser.feed(text)
    parser.close()
    return "".join(parser.out), parser.logos


def make_assets(root):
    source = Path(__file__).resolve().parents[2] / "assets" / "website-branding"
    dest = root / "forgeia-brand"
    dest.mkdir(parents=True, exist_ok=True)
    for name, colour in [("dark", "#171c18"), ("light", "#ffffff")]:
        image = base64.b64encode((source / (name + ".png")).read_bytes()).decode()
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80" viewBox="0 0 300 80" role="img" aria-label="FORGEIA"><svg width="80" height="80" viewBox="220 70 840 920"><image width="1280" height="1280" href="data:image/png;base64,{image}"/></svg><text x="88" y="54" fill="{colour}" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="35" letter-spacing="1">FORGEIA</text></svg>'
        (dest / ("logo-" + name + ".svg")).write_text(svg, encoding="utf-8")
        (dest / ("mark-" + name + ".svg")).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="220 70 840 920" role="img" aria-label="FORGEIA"><image width="1280" height="1280" href="data:image/png;base64,{image}"/></svg>', encoding="utf-8")
    image = base64.b64encode((source / "colour.png").read_bytes()).decode()
    (dest / "favicon.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="220 70 840 840"><image width="1280" height="1280" href="data:image/png;base64,{image}"/></svg>', encoding="utf-8")
    (dest / "apple-icon.png").write_bytes((source / "colour.png").read_bytes())
    (dest / "brand.css").write_text('.forgeia-brand-logo{width:165px!important;height:44px!important;max-width:100%!important;object-fit:contain!important;object-position:left center}#logo .forgeia-brand-logo{max-height:100%} @media(max-width:575px){.forgeia-brand-logo{width:145px!important;height:40px!important}} .forgeia-brand-logo[data-forgeia-layout="symbol"]{width:44px!important;height:44px!important}', encoding="utf-8")


def brand_tree(root, pack, base_url="", catalog_file=None, source_root=None):
    root = Path(root).resolve()
    make_assets(root)
    pages = sorted(p for p in root.rglob("*.html") if not any(part.startswith(".") for part in p.relative_to(root).parts))
    # The off-canvas component name is a framework term; slider names are branding.
    page_map = {p.relative_to(root).as_posix(): re.sub(r"(?<!off-)\b(?:canvas|crafto)\b", "forgeia", p.relative_to(root).as_posix(), flags=re.I) for p in pages}
    known = {page_map[p.name] for p in pages if p.parent == root}
    logos = 0
    for file in pages:
        page = file.relative_to(root).as_posix()
        target = root / page_map[page]
        if target != file and target.exists(): raise ValueError("Branding page name collision")
        content, count = brand_html(file.read_text(encoding="utf-8-sig"), page, pack, base_url.rstrip("/") + "/" + page_map[page] if base_url else "", known, source_root or root, page_map)
        if target != file: file.rename(target)
        target.write_text(content, encoding="utf-8")
        logos += count
    if catalog_file:
        catalog_file = Path(catalog_file)
        catalog = json.loads(catalog_file.read_text(encoding="utf-8"))
        for entry in catalog["entries"]:
            entry["title"] = brand_text(entry["title"])
            if entry["page"] in page_map and page_map[entry["page"]] != entry["page"]:
                entry["page"] = page_map[entry["page"]]
                entry["id"] = entry["page"].removesuffix(".html")
                entry["thumbnail"] = "thumbnails/" + entry["id"] + ".jpg"
            entry["archive"] = re.sub(r"(?<!off-)\b(?:canvas|crafto)\b", "forgeia", entry["archive"], flags=re.I)
        catalog["branding"] = "FORGEIA"
        catalog_file.write_text(json.dumps(catalog, ensure_ascii=False), encoding="utf-8")
        recipes_file = catalog_file.parent / "recipes.json"
        if recipes_file.exists():
            recipes = json.loads(recipes_file.read_text(encoding="utf-8"))
            for recipe in recipes:
                recipe["id"] = re.sub(r"(?<!off-)\b(?:canvas|crafto)\b", "forgeia", recipe["id"], flags=re.I)
                recipe["home"] = page_map.get(recipe["home"], recipe["home"])
                recipe["pages"] = [page_map.get(page, page) for page in recipe["pages"]]
            recipes_file.write_text(json.dumps(recipes), encoding="utf-8")
    return {"brandedPages": len(pages), "logos": logos, "brand": "FORGEIA", "renamedPages": {a: b for a, b in page_map.items() if a != b}}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("root")
    parser.add_argument("--pack", choices=["crafto", "canvas"], required=True)
    parser.add_argument("--base-url", default="")
    parser.add_argument("--catalog")
    parser.add_argument("--source-root")
    args = parser.parse_args()
    print(json.dumps(brand_tree(args.root, args.pack, args.base_url, args.catalog, args.source_root)))
