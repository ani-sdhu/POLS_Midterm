@echo off
rem Starts the quiz server (no browser caching) and opens the quiz. Close this window to stop.
cd /d "%~dp0"
start "" "http://localhost:8765/quiz/index.html"
python serve.py 8765
