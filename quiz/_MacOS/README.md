# QSS Midterm Drill on macOS

The quiz is the same web app as on Windows (everything lives in the `quiz` folder one level up).
This folder only holds the Mac launcher.

## Start

1. Get the whole `7012_POLS` folder onto the Mac (clone or pull the repo). The quiz reads the
   textbook PDF (`Midterm Prep/QSS Ch1-4.pdf`), the datasets (`Data Sets/…`) and
   `Week 1/INTRO/` from it, so it must stay intact.
2. Double-click **`Start Quiz.command`**. A Terminal window opens (that's the server) and the
   quiz opens in your browser at `http://localhost:8765/Midterm%20Prep/quiz/index.html`.
3. Close the Terminal window when you're done.

## First-time fixes

- **"cannot be opened because it is from an unidentified developer"**: right-click the file →
  **Open** → **Open**. macOS remembers this.
- **"permission denied"** / nothing happens: make it executable once. In Terminal:
  ```bash
  chmod +x "7012_POLS/Midterm Prep/quiz/_MacOS/Start Quiz.command"
  ```
- **"Python 3 is needed"**: install Python 3 from python.org (or `xcode-select --install`).

## Notes

- Use Chrome, Edge, Firefox, or Safari 17+.
- First load needs internet (R-in-the-browser, math typesetting, and the PDF reader load from CDNs).
- Progress is saved in that browser on that Mac; use Progress → Export / Import to move it
  between computers.
- After updating the quiz files, reload with **Cmd+Shift+R**.
- Manual start (same thing the launcher does):
  ```bash
  cd "7012_POLS/Midterm Prep/quiz" && python3 serve.py 8765
  ```
