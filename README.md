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

## Troubleshooting

### "It looks like the files didn't make it to Git"
If you only see `README.md` after cloning, you are probably on the default branch that does not contain the latest pages yet. Check out the `work` branch where the layouts live:

```bash
git fetch origin
git checkout work
```

You should now see both `index.html` and `participant.html` when you run `ls` in the repository root.

### "Я вижу в файлах странные стрелочки `<<<<<<<` и `>>>>>>>`"
Это значит, что при обновлении репозитория возник конфликт между вашими локальными правками и свежими изменениями из Git. Времен
ные метки Git показывают два варианта одной и той же строки и предлагают выбрать правильный:

```
<<<<<<< HEAD
padding: 72px 24px 140px;
=======
padding: 72px 24px 148px;
>>>>>>> work
```

Как поправить:

1. Откройте файл в редакторе кода и решите, какая версия строки должна остаться. Для текущей раскладки страниц нужны значения из ветки `work` (в примере это `padding: 72px 24px 148px;`).
2. Удалите строки с маркерами `<<<<<<<`, `=======`, `>>>>>>>`, а также лишнюю версию строки.
3. Сохраните файл и повторите шаги для всех конфликтов, если их несколько. Подсказку, какие файлы затронуты, показывает `git sta
tus`.
4. После этого выполните `git add <имя_файла>` и `git commit`, чтобы зафиксировать объединённый вариант.

Если вы не редактировали файлы локально, проще всего начать с чистого состояния: `git fetch --all && git reset --hard origin/wo
rk`. Эта команда перезапишет локальные изменения версиями из удалённой ветки и уберёт конфликтные маркеры.
