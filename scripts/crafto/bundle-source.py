"""Build a private source ZIP; leave the supplied directory untouched."""
import hashlib
import json
import sys
import zipfile
from pathlib import Path

source, output = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
if output.exists() or source == output or source in output.parents:
    raise ValueError("Use a new output file outside the source directory")
output.parent.mkdir(parents=True, exist_ok=True)
files = sorted(p for p in source.rglob("*") if p.is_file() and not p.is_symlink()
               and not any(part in {"node_modules", ".git", "__MACOSX"} or part.startswith("._") for part in p.relative_to(source).parts)
               and p.name != ".DS_Store" and p.suffix.lower() not in {".pem", ".key"} and not p.name.startswith(".env"))
compressed = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".mp4", ".webm", ".mp3", ".woff", ".woff2", ".zip"}
with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=1) as archive:
    for index, file in enumerate(files, 1):
        archive.write(file, file.relative_to(source).as_posix(), compress_type=zipfile.ZIP_STORED if file.suffix.lower() in compressed else zipfile.ZIP_DEFLATED, compresslevel=1)
        if index % 500 == 0:
            print(json.dumps({"bundled": index, "total": len(files)}), flush=True)
with output.open("rb") as stream:
    checksum = hashlib.file_digest(stream, "sha256").hexdigest()
result = {"file": str(output), "files": len(files), "bytes": output.stat().st_size, "sha256": checksum}
output.with_suffix(".json").write_text(json.dumps(result, indent=2), encoding="utf-8")
print(json.dumps(result), flush=True)
