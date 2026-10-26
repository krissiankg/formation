"""Extract the original private ZIP safely and prepare the build on CI."""
import sys
import zipfile
from pathlib import Path
import importlib.util

spec = importlib.util.spec_from_file_location("crafto_package", Path(__file__).with_name("package.py"))
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)
target = Path(sys.argv[2]).resolve()
with zipfile.ZipFile(sys.argv[1]) as archive:
    if len(archive.infolist()) > 6000 or sum(f.file_size for f in archive.infolist()) > 500_000_000:
        raise ValueError("Unexpected source package size")
    for info in archive.infolist():
        package.safe_relative(info.filename)
        if (info.external_attr >> 16) & 0o170000 == 0o120000:
            raise ValueError("Source symlinks are not supported")
    for info in archive.infolist():
        parts = Path(info.filename).parts
        if any(part == "__MACOSX" or part == ".DS_Store" or part.startswith("._") for part in parts):
            continue
        archive.extract(info, target)
candidates = [p.parent for p in target.rglob("start-here.html") if (p.parent / "html" / "package.json").is_file()]
if len(candidates) != 1:
    raise ValueError("Cannot identify the Crafto source directory")
package.prepare(candidates[0], Path(sys.argv[3]))
