#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "Git не найден в PATH. Установите Git и повторите попытку." >&2
  exit 1
fi

current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
working_tree_state="$(git status --porcelain)"

if [[ "$current_branch" != "work" ]]; then
  if [[ -n "$working_tree_state" ]]; then
    echo "⚠️  Обнаружены незакоммиченные изменения. Перед переключением на ветку work сохраните их, коммитните или выполните git stash." >&2
    exit 1
  fi
  echo "→ Переключаемся на ветку work и подтягиваем последние изменения..."
  git fetch origin work
  git switch work
  working_tree_state="$(git status --porcelain)"
elif [[ -z "$working_tree_state" ]]; then
  echo "→ Вы уже на ветке work. Обновляем изменения..."
  git pull --ff-only origin work
else
  echo "→ Вы на ветке work с локальными правками. Пропускаем обновление, чтобы сохранить их." >&2
fi

echo "→ Запускаем локальный сервер на http://localhost:8000/index.html"
python3 -m http.server 8000
