#!/usr/bin/env bash
# ---------------------------------------------------------------
# OPCIONAL · Sube apps-script/Code.gs a tu Apps Script sin copiar y pegar,
# usando clasp (herramienta oficial de Google).
#
# Antes, una sola vez:
#   1. Activa la API: https://script.google.com/home/usersettings  → "API de Google Apps Script": Activado
#   2. En Apps Script de Látigo_BD: ⚙️ Configuración del proyecto → copia el "ID de la secuencia de comandos"
#      y pégalo en apps-script/.clasp.json (campo scriptId).
#
# Uso:
#   ./scripts/actualizar-apps-script.sh                 → sube el código y crea una implementación nueva
#   ./scripts/actualizar-apps-script.sh AKfycb...       → sube y actualiza ESA implementación (la URL /exec no cambia)
# El ID de implementación está en Implementar → Administrar implementaciones.
# Requiere Node.js: https://nodejs.org
# ---------------------------------------------------------------
set -e
cd "$(dirname "$0")/../apps-script"

command -v node >/dev/null || { echo "❌ Instala Node.js primero: https://nodejs.org"; exit 1; }
command -v clasp >/dev/null || { echo "📦 Instalando clasp…"; npm install -g @google/clasp; }

if grep -q "PEGA_AQUI" .clasp.json; then
  echo "❌ Falta el scriptId en apps-script/.clasp.json (ver instrucciones arriba)."; exit 1
fi

[ -f "$HOME/.clasprc.json" ] || { echo "🔐 Inicia sesión con tu cuenta de Google…"; clasp login; }

echo "⬆️  Subiendo código…"
clasp push -f

DESC="El Látigo $(date '+%Y-%m-%d %H:%M')"
if [ -n "$1" ]; then
  clasp deploy -i "$1" -d "$DESC"
  echo "✅ Implementación actualizada. La URL /exec sigue siendo la misma."
else
  clasp deploy -d "$DESC"
  echo "✅ Implementación creada. Copia su ID de arriba; la URL es:"
  echo "   https://script.google.com/macros/s/<ID>/exec"
fi
echo "ℹ️  Si es la primera vez, ejecuta 'setup' una vez desde el editor de Apps Script para autorizar y crear la clave."
