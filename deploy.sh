#!/usr/bin/env bash
# Deploy de TrainTools en el VPS.
# Uso:
#   ./deploy.sh          -> modo PM2 (por defecto, Opción B de HOSTINGER_DEPLOY.md)
#   ./deploy.sh pm2       -> modo PM2 explícito
#   ./deploy.sh docker    -> modo Docker (Opción C de HOSTINGER_DEPLOY.md)
#
# Ejecutar desde la raíz del proyecto en el VPS (donde vive este script).

set -euo pipefail

MODE="${1:-pm2}"
cd "$(dirname "$0")"

echo "==> Actualizando código (git pull)"
git pull

case "$MODE" in
  pm2)
    echo "==> Instalando dependencias"
    npm install
    echo "==> Build de producción"
    npm run build
    echo "==> Reiniciando proceso PM2 'traintools'"
    if pm2 describe traintools > /dev/null 2>&1; then
      pm2 restart traintools
    else
      pm2 start ecosystem.config.js
      pm2 save
    fi
    ;;
  docker)
    echo "==> Reconstruyendo y levantando contenedor"
    docker compose up -d --build
    ;;
  *)
    echo "Modo desconocido: '$MODE'. Usa 'pm2' o 'docker'." >&2
    exit 1
    ;;
esac

echo "==> Deploy completado ($MODE)"
