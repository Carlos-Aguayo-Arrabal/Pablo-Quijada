# Deploy de TrainTools en Hostinger

Dominio de producción: `https://traintools.es`

Repositorio: `Carlos-Aguayo-Arrabal/Pablo-Quijada` · Rama: `main` · Node: `22.x`

Hay tres formas de desplegar, de más a menos gestionada. Elige una.

## Opción A — App Node.js gestionada por hPanel

Configura una aplicación Node.js en hPanel apuntando al repositorio:

- Repository: `Carlos-Aguayo-Arrabal/Pablo-Quijada`
- Branch: `main`
- Node version: `22.x`
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm run start`
- App URL/domain: `traintools.es`

hPanel gestiona el proceso y el proxy interno por ti. No necesitas Nginx ni PM2 manual.

## Opción B — VPS con Nginx + PM2 (control total)

Requiere un VPS de Hostinger con acceso SSH (no el hosting compartido de hPanel).

**1. Preparar el servidor (una sola vez):**

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2
```

**2. Clonar y construir la app:**

```bash
cd /var/www
sudo git clone https://github.com/Carlos-Aguayo-Arrabal/Pablo-Quijada.git traintools
cd traintools
npm install
cp .env.local.example .env.local   # completa las variables, ver más abajo
npm run build
```

**3. Arrancar con PM2** (usa `ecosystem.config.js`, ya incluido en el repo):

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # sigue las instrucciones que imprime para que arranque solo tras reiniciar el VPS
```

La app queda escuchando en `127.0.0.1:3000`.

**4. Configurar Nginx como reverse proxy** (plantilla incluida en `deploy/nginx/traintools.conf`):

```bash
sudo cp deploy/nginx/traintools.conf /etc/nginx/sites-available/traintools.conf
sudo ln -s /etc/nginx/sites-available/traintools.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**5. Activar SSL:**

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d traintools.es -d www.traintools.es
```

**Actualizar la app tras cambios (redeploy):**

```bash
cd /var/www/traintools
./deploy.sh
```

## Opción C — Docker en el VPS

El repo incluye `Dockerfile` y `docker-compose.yml`.

```bash
cd /var/www/traintools
cp .env.local.example .env.local   # completa las variables, ver más abajo
docker compose up -d --build
```

La app queda escuchando en `127.0.0.1:3000`. Configura Nginx igual que en la Opción B (pasos 4 y 5) para el reverse proxy y el SSL — Docker no reemplaza esa parte.

Para actualizar tras cambios:

```bash
cd /var/www/traintools
./deploy.sh docker
```

## Variables de entorno

Estas tres variables son necesarias en cualquiera de las tres opciones:

```env
NEXT_PUBLIC_SITE_URL=https://traintools.es
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

- **Opción A (hPanel):** añádelas en la sección de variables de entorno de la app Node en hPanel.
- **Opciones B y C (VPS):** ponlas en `.env.local` en la raíz del proyecto (parte de `cp .env.local.example .env.local`).

No actives `ENABLE_NEXT_MCP` en producción salvo que lo necesites explícitamente.

## Supabase Auth

En Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://traintools.es`
- Redirect URLs:
  - `https://traintools.es/callback`
  - `https://traintools.es/update-password`

Si usas Google OAuth, añade también el callback configurado por Supabase en Google Cloud.

## DNS en Hostinger

- **Opción A (hPanel):** si el dominio está en Hostinger, asígnalo a la app Node desde hPanel; si apunta fuera, crea los registros DNS que indique hPanel para la app. Activa SSL desde hPanel cuando el dominio resuelva correctamente.
- **Opciones B y C (VPS):** crea un registro `A` para `traintools.es` (y otro para `www.traintools.es` si lo usas) apuntando a la IP pública del VPS. El SSL se activa con `certbot` (ver Opción B, paso 5), no desde hPanel.

## Demo

La app incluye acceso demo completo:

- Email: `demo@traintools.es`
- Contraseña: `Demo2026!`

También aparece el botón `Entrar a demo completa` en login.
