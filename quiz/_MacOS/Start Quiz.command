#!/bin/bash
# Double-click in Finder to start the QSS Midterm Drill on macOS.
# Keep this Terminal window open while you study; close it (or press Ctrl+C) to stop.

cd "$(dirname "$0")/.." || exit 1          # the quiz folder (serve.py lives there)
PORT=8765
URL="http://localhost:$PORT/Midterm%20Prep/quiz/index.html"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is needed to run the quiz server."
  echo "Install it from https://www.python.org/downloads/macos/ (or run: xcode-select --install),"
  echo "then double-click this file again."
  read -r -p "Press Return to close."
  exit 1
fi

# Already running (e.g. you double-clicked twice)? Just open the page.
if curl -s -o /dev/null "http://localhost:$PORT/Midterm%20Prep/quiz/index.html"; then
  open "$URL"
  exit 0
fi

( sleep 1; open "$URL" ) &
exec python3 serve.py "$PORT"
