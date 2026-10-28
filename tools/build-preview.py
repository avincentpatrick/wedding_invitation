"""Build a single-file preview (for the claude.ai artifact) from the real site files.
Usage: python3 tools/build-preview.py OUT.html
"""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "assets/style.css").read_text(encoding="utf-8")
cfg = (root / "assets/config.js").read_text(encoding="utf-8")
app = (root / "assets/app.js").read_text(encoding="utf-8")
# keep only what sits between <body> and </body>, plus title and fonts link from head
body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
fonts = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', html).group(0)
body = body.replace('<script src="assets/config.js"></script>', "<script>\n" + cfg + "\n</script>")
body = body.replace('<script src="assets/app.js"></script>', "<script>\n" + app + "\n</script>")
out = ("<title>Vince &amp; Jelai</title>\n"
       '<meta name="claude:viewport-fit-sides" content="cover">\n'
       + fonts + "\n<style>\n" + css + "\n</style>\n" + body)
pathlib.Path(sys.argv[1]).write_text(out, encoding="utf-8")
print("wrote", sys.argv[1], len(out), "bytes")
