# Deploy de TrainTools en Hostinger

Dominio de producción: `https://traintools.es`

## App Node.js / Next.js

Configura una aplicación Node.js en hPanel apuntando al repositorio:

- Repository: `Carlos-Aguayo-Arrabal/Pablo-Quijada`
- Branch: `main`
- Node version: `22.x`
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm run start`
- App URL/domain: `traintools.es`

## Variables de entorno

Añade estas variables en Hostinger:

```env
NEXT_PUBLIC_SITE_URL=https://traintools.es
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

No actives `ENABLE_NEXT_MCP` en producción salvo que lo necesites explícitamente.

## Supabase Auth

En Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://traintools.es`
- Redirect URLs:
  - `https://traintools.es/callback`
  - `https://traintools.es/update-password`

Si usas Google OAuth, añade también el callback configurado por Supabase en Google Cloud.

## DNS en Hostinger

Si el dominio está en Hostinger, asígnalo a la app Node desde hPanel. Si el dominio apunta fuera, crea los registros DNS que indique Hostinger para la app:

- `A` o `CNAME` para `traintools.es`
- `CNAME` para `www.traintools.es` si quieres usar `www`

Activa SSL desde hPanel cuando el dominio resuelva correctamente.

## Demo

La app incluye acceso demo completo:

- Email: `demo@traintools.es`
- Contraseña: `Demo2026!`

También aparece el botón `Entrar a demo completa` en login.
