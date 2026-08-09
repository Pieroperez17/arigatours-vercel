# ArigaTours — despliegue en Vercel

Copia de ArigaTours que corre **entera en Vercel**, con su propia base de
datos. Es un proyecto independiente del que vive en el VPS: comparten origen
pero no comparten nada en ejecución, ni datos ni imágenes.

| | VPS (`arigatours.sevtech.cloud`) | Vercel (este repo) |
|---|---|---|
| Web | Nginx sirviendo el build | CDN de Vercel |
| API | Express en un contenedor Docker | Función serverless |
| Base de datos | PostgreSQL propio en Dokploy | Neon (Postgres serverless) |
| Imágenes subidas | Carpeta en un volumen de Docker | Vercel Blob |

**Los datos son independientes.** Un tour creado aquí no aparece en el VPS, ni
al revés. Son dos bases distintas que arrancaron con la misma semilla.

## Cómo está montado

```
api/[...ruta].js   → punto de entrada de Vercel; reexporta la app de Express
backend/           → la API tal cual (rutas, controladores, modelos)
frontend/          → la web en React + Vite
vercel.json        → compila el frontend y manda lo demás a index.html
```

El nombre `[...ruta].js` es lo que hace que Vercel enrute a esa función
**todo** lo que empiece por `/api`. Con un `index.js` normal solo llegaría
`/api` a secas.

`backend/servidor.js` exporta la aplicación armada pero **sin llamar a
`listen`**: en serverless no hay un proceso esperando en un puerto, la
plataforma invoca la app una vez por petición. Sigue pudiendo arrancar como
servidor normal con `npm run dev`, porque comprueba si se le ejecutó
directamente antes de abrir el puerto.

## Lo que cambia respecto al VPS

Solo tres archivos difieren de verdad:

- **`backend/servidor.js`** — exporta la app en vez de arrancarla, y ya no
  sirve `/api/subidas` desde disco.
- **`backend/intermedios/subirImagenes.js`** — multer guarda en memoria y un
  segundo middleware sube los buffers a Vercel Blob. En serverless el disco es
  efímero: lo que se escriba se pierde al terminar la invocación.
- **`backend/configuracion/baseDatos.js`** — SSL obligatorio para Neon y un
  pool de 1 conexión cuando corre en Vercel, porque hay muchas instancias a la
  vez y cada una abriría su propio pool.

Los modelos, controladores y rutas están **sin tocar**: Neon es PostgreSQL, así
que el mismo `esquema.sql`, los mismos `LEFT JOIN` y las mismas transacciones
funcionan igual.

## Puesta en marcha

### 1. Crear la base de datos

En el panel de Vercel: **Storage → Create Database → Neon**. Al conectarla al
proyecto se inyectan varias variables (`DATABASE_URL`, `POSTGRES_URL`…).

### 2. Crear el almacenamiento de imágenes

**Storage → Create → Blob**. Al conectarlo aparece `BLOB_READ_WRITE_TOKEN`
solo. Sin esa variable, subir una imagen desde el panel responde un error
explícito en vez de fallar en silencio.

### 3. Cargar las variables

En **Settings → Environment Variables**, con `.env.ejemplo` como referencia.
Las imprescindibles:

- `BD_URL` — copia el valor de `DATABASE_URL` que creó Neon. Usa la cadena
  *pooled* (la del host con `-pooler`).
- `JWT_SECRETO` — genera uno con `openssl rand -base64 48`.
- `ADMIN_CORREO` y `ADMIN_CLAVE` — el administrador que crea la siembra.

### 4. Crear las tablas y los datos

Desde tu máquina, con `BD_URL` apuntando a Neon en un `.env` local:

```bash
npm install
npm run preparar
```

`preparar` aplica `backend/basedatos/esquema.sql` y luego siembra tours, blogs
y el usuario administrador. El SQL es idempotente: se puede repetir sin romper
nada.

## Desarrollo en local

```bash
npm install
npm run dev
```

Levanta la API en el puerto 4020 contra la base que diga tu `.env`. Para la
web, en otra terminal:

```bash
npm run --prefix frontend dev
```

Vite escucha en el 5180 y reenvía `/api` al 4020.

## Limitaciones conocidas

- **Las funciones de Vercel tienen un tiempo máximo de ejecución.** La siembra
  y la migración se corren desde tu máquina, no desde la web, justamente por
  eso.
- **Cada invocación abre su propia conexión a la base.** Con el plan gratuito
  de Neon y tráfico alto se puede topar con el límite de conexiones; la cadena
  *pooled* es lo que lo evita.
- **Las imágenes ya subidas en el VPS no están aquí.** Viven en el disco de
  aquel servidor. Esta copia arranca solo con las imágenes de la semilla, que
  son archivos estáticos del frontend.
