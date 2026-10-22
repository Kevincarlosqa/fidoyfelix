# Fido&Felix — Servicio de mascotas · *Beyond grooming.*

Landing animada + reservas por WhatsApp con IA + dashboard de gestión y métricas.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind 4 · Motion + Lenis · Prisma 7 + PostgreSQL (Supabase) · Claude (`claude-opus-5-5`) · WhatsApp Cloud API.

## Qué incluye

| Parte | Ruta | Detalle |
|---|---|---|
| Landing | `/` | Hero con parallax, cintas animadas, servicios filtrables, demo de chat que avanza con el scroll, rastro de huellas que se pinta al hacer scroll, indicador de progreso con huellas, "Stay tuned", formulario de reserva con disponibilidad real. Scroll suave con Lenis. |
| API pública | `GET /api/services`, `GET /api/availability?date=&serviceId=`, `POST /api/bookings` | Reservas web con validación y control de capacidad. |
| Webhook WhatsApp | `GET/POST /api/whatsapp/webhook` | Verificación de Meta, firma `X-Hub-Signature-256`, deduplicación de reintentos, respuesta en segundo plano con `after()`. |
| Asistente IA | `src/lib/ai-agent.ts` | Claude con herramientas: consultar disponibilidad, crear/listar/cancelar reservas y transferir a un humano. |
| Dashboard | `/dashboard` | Métricas (KPIs vs periodo anterior, ingresos, reservas por canal, servicios top, horas pico), reservas (filtros, estados, asignación, reprogramar, notas, alta manual), agenda por día, clientes, bandeja de WhatsApp (tomar control de la IA y responder), simulador del bot, servicios y usuarios. |
| Acceso | `/login` | Solo usuarios creados por un admin. Roles **ADMIN** (todo) y **STAFF** (sin servicios ni usuarios). |

## Puesta en marcha

```bash
npm install
cp .env.example .env        # y completa los valores (ver abajo)
npx prisma migrate deploy   # crea las tablas en Supabase
npm run db:seed             # servicios + admin inicial
npm run db:seed:demo        # (opcional) clientes, reservas y chats de ejemplo
npm run dev
```

Entra a `http://localhost:3000/login` con `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` y **cambia la contraseña** en *Mi cuenta*.

### 1. Supabase

1. Crea un proyecto en supabase.com.
2. *Project Settings → Database → Connection string*:
   - `DATABASE_URL`: **Transaction pooler** (puerto 6543) — la usa la app.
   - `DIRECT_URL`: **Session pooler / directa** (puerto 5432) — la usan las migraciones.

### 2. Claude (IA)

Crea una API key en console.anthropic.com y ponla en `ANTHROPIC_API_KEY`. El modelo por defecto es `claude-opus-5-5` (cámbialo con `AI_MODEL`). Las peticiones usan `fallbacks: "default"`: si un clasificador de seguridad rechaza un mensaje, la API reintenta con el modelo de respaldo recomendado. Prueba el bot sin WhatsApp desde **Dashboard → Simulador IA**.

### 3. WhatsApp Cloud API

1. developers.facebook.com → crea una app tipo *Business* → agrega **WhatsApp**.
2. En *API Setup* copia el **Phone number ID** (`WHATSAPP_PHONE_NUMBER_ID`) y genera un **token permanente** con un *System User* (`WHATSAPP_TOKEN`).
3. *App Settings → Basic* → **App Secret** (`WHATSAPP_APP_SECRET`).
4. *WhatsApp → Configuration → Webhook*:
   - Callback URL: `https://TU-DOMINIO/api/whatsapp/webhook`
   - Verify token: el mismo valor de `WHATSAPP_VERIFY_TOKEN`
   - Suscríbete al campo **messages**.

En local expón el puerto con un túnel (ngrok, cloudflared) para recibir el webhook.

### 4. Deploy (Vercel)

Importa el repo, copia las variables de `.env` y ejecuta `npx prisma migrate deploy` contra Supabase. El webhook declara `maxDuration = 60` para dar tiempo a la IA.

## Configuración del negocio

`src/lib/config.ts`: horario por día, capacidad simultánea, intervalo de horarios, anticipación mínima, días máximos de reserva, dirección y redes. Los servicios y precios se editan desde **Dashboard → Servicios** (la web y la IA los leen de la base de datos).

## Scripts

| Script | Uso |
|---|---|
| `npm run dev` | Desarrollo |
| `npm run build` / `start` | Producción |
| `npm run typecheck` | Tipos (genera los tipos de rutas antes) |
| `npm run db:migrate` | Nueva migración en desarrollo |
| `npm run db:deploy` | Aplica migraciones (producción) |
| `npm run db:seed` / `db:seed:demo` | Datos iniciales / de demostración |
| `npm run db:studio` | Explorador de la base de datos |
