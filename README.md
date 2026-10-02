# QSS Midterm Drill

A study and quiz app for chapters 1 to 4 of *Quantitative Social Science* (Imai, 2017).

## Use it online

Open https://ani-sdhu.github.io/POLS_Midterm/quiz/index.html (Chrome, Edge, Firefox, or Safari 17+).

- **Quiz, study notes, and R code questions** work right away. The book's data sets load from the
  author's public repository ([kosukeimai/qss](https://github.com/kosukeimai/qss)).
- **Definition boxes and book passages** need your own copy of the course's `QSS Ch1-4.pdf`.
  Click **📖 Open textbook PDF** at the top and pick the file. It stays in your browser (nothing is
  uploaded), so you only do this once per browser. The textbook itself is not on the website.
- Progress is saved in your browser. Use Progress → Export / Import to move it between computers.

## Run it from the course folder

See [`quiz/_MacOS/README.md`](quiz/_MacOS/README.md) (Mac) or double-click `quiz/start.bat` (Windows).
When the quiz runs from the full `7012_POLS` folder, it reads the PDF and data sets from there.

## Publishing (repo owner)

Settings → Pages → Build and deployment → Source: **Deploy from a branch**, branch `main`,
folder `/ (root)`, then Save. The site updates a minute or two after each push to `main`.
