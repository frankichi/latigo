#!/usr/bin/env bash
# ---------------------------------------------------------------
# Sube (o actualiza) El Látigo en GitHub. Vercel se actualiza solo.
# Uso:
#   ./scripts/subir-github.sh https://github.com/TU_USUARIO/el-latigo.git
#   ./scripts/subir-github.sh            (para actualizar, ya configurado)
#   ./scripts/subir-github.sh "" "Cambié los colores"   (con mensaje)
# Requiere: git  (https://git-scm.com)
# ---------------------------------------------------------------
set -e
cd "$(dirname "$0")/.."

REPO="$1"
MSG="${2:-Actualización $(date '+%Y-%m-%d %H:%M')}"

command -v git >/dev/null || { echo "❌ Instala git primero: https://git-scm.com"; exit 1; }

if [ ! -d .git ]; then
  echo "📁 Preparando el repositorio por primera vez…"
  git init -q
  git checkout -q -b main 2>/dev/null || git branch -M main
fi

if [ -n "$REPO" ]; then
  if git remote get-url origin >/dev/null 2>&1; then git remote set-url origin "$REPO"; else git remote add origin "$REPO"; fi
fi

git remote get-url origin >/dev/null 2>&1 || {
  echo "❌ Falta la dirección del repositorio. Ejemplo:"
  echo "   ./scripts/subir-github.sh https://github.com/TU_USUARIO/el-latigo.git"
  exit 1
}

git add -A
if git diff --cached --quiet; then
  echo "ℹ️  No hay cambios nuevos para subir."
else
  git commit -q -m "$MSG"
  echo "📝 Cambios guardados: $MSG"
fi

git push -u origin main
echo "✅ Listo. Si el proyecto está conectado a Vercel, en ~1 minuto la web estará actualizada."
