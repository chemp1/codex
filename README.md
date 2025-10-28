# heg.ai community pages

This repository contains two static HTML pages:

- `index.html` — community member listing.
- `participant.html` — detailed profile layout.

## How to get the files locally

### Using Git
1. Open a terminal and move to the folder where you want to store the project, for example:
   ```bash
   cd ~/Projects
   ```
2. Clone the repository:
   ```bash
   git clone https://github.com/chemp1/codex.git
   ```
3. Go into the project folder that was created:
   ```bash
   cd codex
   ```

### Downloading a ZIP archive
1. On the repository page click **Code → Download ZIP**.
2. Extract the archive and open the resulting `codex` folder.

## Preview the pages in a browser
To serve the files locally, you need to run the HTTP server from **inside** the `codex` folder:

```bash
python3 -m http.server 8000
```

Then open the following URLs in your browser:
- [http://localhost:8000/index.html](http://localhost:8000/index.html) — participants listing.
- [http://localhost:8000/participant.html](http://localhost:8000/participant.html) — individual profile.

> 💡 If you accidentally start the server from the parent folder (for example, after cloning into `~/Downloads/codex` but staying in `~/Downloads`), the pages will respond with **404 Not Found**. Just stop the server (`Ctrl+C`), run `cd codex`, and start it again so that the site root contains `index.html`.

## Directly opening the files
Because the pages are static, you can also open `index.html` or `participant.html` directly by double-clicking them in your file manager. Running a local server is optional but helps mimic deployment conditions.
