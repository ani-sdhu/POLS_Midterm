"""Serve the 7012_POLS folder for the quiz, telling the browser never to cache files
(so updated quiz code always loads). Usage: python serve.py [port]"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]      # the 7012_POLS folder


class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print(f"Quiz: http://localhost:{port}/Midterm%20Prep/quiz/index.html  (Ctrl+C to stop)")
    ThreadingHTTPServer(("127.0.0.1", port), partial(NoCache, directory=str(ROOT))).serve_forever()
