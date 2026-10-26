"""Keep the pack's CDN libraries usable on the isolated preview origin."""
import hashlib
import html
import json
import posixpath
import re
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen

HOSTS = {"cdn.jsdelivr.net", "cdnjs.cloudflare.com", "code.jquery.com", "unpkg.com", "maxcdn.bootstrapcdn.com", "stackpath.bootstrapcdn.com"}
CSS_URL = re.compile(r'''url\(\s*(["']?)([^'"\s)]+)\1\s*\)''', re.I)


def localize_vendors(root):
    root = Path(root)
    destination = root / "forgeia-vendor"
    downloaded = {}

    def mirror(url, extension):
        url = "https:" + url if url.startswith("//") else html.unescape(url)
        if urlsplit(url).hostname not in HOSTS: return None
        if url in downloaded: return downloaded[url]["file"]
        name = hashlib.sha256(url.encode()).hexdigest()[:20] + extension
        with urlopen(Request(url, headers={"User-Agent": "FORGEIA source importer"}), timeout=40) as response:
            if urlsplit(response.url).hostname not in HOSTS: raise ValueError("Unexpected vendor redirect")
            content = response.read(10_000_001)
        if len(content) > 10_000_000: raise ValueError("Unexpected vendor size")
        downloaded[url] = {"file": name, "sha256": hashlib.sha256(content).hexdigest()}
        if extension == ".css":
            text = content.decode("utf-8-sig")
            def resource(match):
                value = match.group(2)
                if value.startswith(("data:", "#")): return match.group(0)
                absolute = urljoin(url, value)
                suffix = Path(urlsplit(absolute).path).suffix.lower()
                local = mirror(absolute, suffix) if suffix in {".css", ".woff2", ".woff", ".ttf", ".eot", ".svg", ".png", ".gif"} else None
                return f'url("{local}")' if local else match.group(0)
            content = CSS_URL.sub(resource, text).encode("utf-8")
        destination.mkdir(exist_ok=True)
        (destination / name).write_bytes(content)
        return name

    for file in sorted(root.rglob("*.html")):
        text = file.read_text(encoding="utf-8")
        def tag(match):
            value = match.group(0)
            script = value.lower().startswith("<script")
            if not script and not re.search(r'''rel=["']stylesheet["']''', value, re.I): return value
            attribute = re.search(r'''\b(?:src|href)=(["'])([^"']+)\1''', value, re.I)
            if not attribute: return value
            name = mirror(attribute.group(2), ".js" if script else ".css")
            if not name: return value
            relative = posixpath.relpath("forgeia-vendor/" + name, file.relative_to(root).parent.as_posix())
            # An integrity hash for the original CDN response no longer applies to mirrored CSS.
            value = value[:attribute.start(2)] + relative + value[attribute.end(2):]
            return re.sub(r'''\s+(?:integrity|crossorigin)=(["'])[^"']*\1''', "", value, flags=re.I)
        text = re.sub(r"<script\b[^>]*>|<link\b[^>]*>", tag, text, flags=re.I)
        file.write_text(text, encoding="utf-8")
    if downloaded:
        (destination / "sources.json").write_text(json.dumps(downloaded, indent=2), encoding="utf-8")
    return downloaded
