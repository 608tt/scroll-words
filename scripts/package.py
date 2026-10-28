"""Package only reviewed extension source; no dependencies or user data."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
with ZipFile(root / 'dist/scroll-words-extension.zip', 'w', ZIP_DEFLATED) as archive:
    for source in sorted((root / 'extension').iterdir()):
        if source.is_file() and source.suffix in {'.js', '.css', '.html', '.json'}:
            archive.write(source, 'scroll-words/' + source.name)
