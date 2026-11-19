#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

git add -A

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git -c user.name="Julia Carlo" -c user.email="mammihlapinatana@users.noreply.github.com" \
    commit -m "Add portfolio landing for Julia Carlo."
  git branch -M main
  gh repo create julia-carlo --public --source=. --remote=origin --push
else
  git -c user.name="Julia Carlo" -c user.email="mammihlapinatana@users.noreply.github.com" \
    commit -m "Update portfolio: portrait hero and two cases." || {
      echo "Нет новых изменений для коммита."
    }
  git push -u origin HEAD
fi

# Pages (если ещё не включены)
gh api -X POST "repos/mammihlapinatana/julia-carlo/pages" --input - <<'EOF' 2>/dev/null || true
{"build_type":"legacy","source":{"branch":"main","path":"/"}}
EOF

echo ""
echo "Сайт: https://mammihlapinatana.github.io/julia-carlo/"
echo "Репозиторий: https://github.com/mammihlapinatana/julia-carlo"
