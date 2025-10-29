# heg.ai community pages

Этот репозиторий содержит статический листинг сообщества heg.ai и пример страницы участника.

## Структура

```
assets/
  styles.css                   — общие стили для обеих страниц
index.html                     — список участников
participant-anton-volkov.html  — профиль Антона Волкова
participant-maria-novak.html   — профиль Марии Новак
participant-igor-sinicyn.html  — профиль Игоря Синицына
participant-eva-savitskaya.html — профиль Евы Савицкой
participant-artem-pospelov.html — профиль Артёма Поспелова
participant-kira-selezneva.html — профиль Киры Селезнёвой
participant.html               — шаблон профиля (копия страницы Антона)
```

## Как запустить локально

```bash
python3 -m http.server 8000
```

После запуска сервера страницы будут доступны по адресам:

- http://localhost:8000/index.html — листинг сообщества
- http://localhost:8000/participant.html — профиль участника

Страницы не требуют сборки: их можно открыть напрямую в браузере или редактировать в любом редакторе.

## Если после клонирования файлы не появились

Иногда Git по умолчанию переключает репозиторий на пустую ветку `main`. Чтобы получить актуальные страницы, выполните команды:

```bash
git fetch --all --prune
git checkout work
git pull --ff-only
```

После переключения на ветку `work` файлы `index.html`, `participant.html` и папка `assets/` появятся в рабочей копии. Если изменения всё равно не видны, убедитесь, что вы находитесь внутри папки `codex` перед запуском `python3 -m http.server 8000`.
