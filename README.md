# PocketStore · Catálogo Offline con Vanilla JS

Aplicación web de una sola página (PWA) que lista elementos consumidos de una API pública
y **funciona completamente sin internet** gracias a un Service Worker y a la API de Caché.

- **Tecnologías:** HTML, CSS y JavaScript puro (sin frameworks).
- **API:** [JSONPlaceholder](https://jsonplaceholder.typicode.com/) (`/users`).
- **Modalidad:** desarrollo individual.

## Estructura del proyecto

```
/pocket-store
├── index.html      # Vista (App Shell)
├── styles.css      # Estilos del App Shell
├── app.js          # Lógica de la aplicación y registro del SW
├── sw.js           # Service Worker y estrategias de caché
├── manifest.json   # Manifiesto de instalación
├── icons/          # Iconos 192x192 y 512x512
└── docs/img/       # Capturas del proceso de desarrollo
```

![Estructura del proyecto](docs/img/01-estructura.png)

## Proceso de implementación

### 1. Manifiesto (`manifest.json`)
Se escribió a mano con `name`, `short_name`, `start_url`, `display: "standalone"`,
colores corporativos (`#12332e` verde oscuro y acento `#f2b705`) y dos iconos (192 y 512 px).

### 2. App Shell (`index.html` y `styles.css`)
Estructura estática con barra superior (título + indicador En línea / Sin conexión),
contenedor principal (buscador y catálogo) y pie de página. Al guardarse en caché,
carga al instante y funciona como contenedor fijo mientras llega el contenido dinámico.

![App con internet](docs/img/02-app-online.png)

### 3. Service Worker (`sw.js`)
Ciclo de vida completo:

| Evento | Qué hace |
|--------|----------|
| `install` | Precarga el App Shell en `pocketstore-shell-v1`. |
| `activate` | Elimina cachés de versiones anteriores y toma el control. |
| `fetch` | **Shell:** caché primero (con red como respaldo). **API:** red primero, y si falla usa la última copia guardada en `pocketstore-data-v1`. |

![Service Worker activo](docs/img/03-devtools-sw.png)
![Cache Storage](docs/img/04-devtools-cache.png)

### 4. Contenido dinámico (`app.js`)
Registra el Service Worker, usa `fetch()` para pedir los usuarios a JSONPlaceholder,
los pinta como tarjetas, incluye búsqueda por nombre o ciudad y detecta cambios de conexión.

### 5. Prueba sin conexión
1. Abre la app con internet (se llena la caché).
2. DevTools → Application → Service Workers → marca **Offline**.
3. Recarga: el App Shell y el catálogo siguen apareciendo.

![App sin conexión](docs/img/05-app-offline.png)

## Cómo ejecutarlo

Los Service Workers requieren `http://localhost` o HTTPS (no funcionan con `file://`).

- **VS Code:** instala la extensión *Live Server* → clic derecho en `index.html` → *Open with Live Server*.
- **Terminal:** `npx serve .` o `python -m http.server 8080` y abre `http://localhost:8080`.

Para publicarlo: GitHub → *Settings → Pages* → rama `main`, carpeta `/ (root)`.

## Autor
Tu nombre · Matrícula · Grupo
