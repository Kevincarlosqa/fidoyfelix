// Modo demo: sin DATABASE_URL (o con DEMO_MODE=true) la app usa una base Postgres
// en memoria con datos de ejemplo. Sirve para ver el sitio y el dashboard sin configurar nada.
// Los cambios no son permanentes: cada instancia del servidor arranca con datos nuevos.
export const DEMO_MODE = process.env.DEMO_MODE === "true" || !process.env.DATABASE_URL;
