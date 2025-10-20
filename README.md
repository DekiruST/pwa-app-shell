# PWA — App Shell (HTML/CSS/JS)

Proyecto base **individual** para una **Aplicación Web Progresiva** con **App Shell**:
- **Estructura App Shell**: Header, menú, contenido dinámico (SPA con hash) y footer.
- **Service Worker**: precache de App Shell + runtime caching para datos.
- **Manifest**: nombre, colores, orientación e íconos (maskable).
- **Contenido dinámico**: lista de productos cargada desde `data/products.json`.
- **Responsive**: layout fluido, accesible y usable en móvil/desktop.

---

##  Estructura
```
pwa-app-shell/
├─ index.html
├─ styles.css
├─ app.js
├─ sw.js
├─ manifest.webmanifest
├─ data/
│  └─ products.json
└─ icons/
   ├─ icon-192.png
   ├─ icon-512.png
   ├─ maskable-192.png
   └─ maskable-512.png
```

## Configuración y arquitectura
- **App Shell**: `index.html`, `styles.css`, `app.js` y `sw.js` conforman el marco de la app.
- **Routing**: SPA simple por hash (`#/`, `#/productos`, `#/acerca`).
- **Service Worker (`sw.js`)**:
  - `install`: precache del App Shell e íconos/datos mínimos.
  - `activate`: limpieza de versiones antiguas, `clients.claim()`.
  - `fetch`:
    - **navigate**: devuelve el App Shell (`index.html`) para que funcione como SPA.
    - **/data/**: *cache-first con actualización* (sirve rápido y actualiza en background).
    - otros estáticos: *stale‑while‑revalidate*.
- **Manifest**: `manifest.webmanifest` con `display: standalone`, `orientation: portrait`, `theme_color` y `background_color`.
- **Íconos**: PNG en 192 y 512 (versiones maskable incluidas).
- **Accesibilidad**: foco al contenedor tras navegación, botones y menús con `aria-*`.

## ▶️ Cómo ejecutar
Se requiere un **servidor estático** (por CORS del `fetch`). Opciones rápidas:
- **Python 3**
  cd pwa-app-shell
  python -m http.server 5173
  Abre: http://localhost:5173

- **Node (serve)**
  npx serve -p 5173

- **VS Code Live Server**: click derecho en `index.html` → *Open with Live Server*.

## Cómo probar **sin conexión**
1. Abre la app en `http://localhost:5173` (o el puerto que uses).
2. Espera a que se registre el Service Worker (ver consola del navegador).
3. En DevTools → *Application* → *Service Workers* confirma que está *activated and running*.
4. En *Network* → selecciona *Offline*.
5. Refresca: la app sigue funcionando (App Shell y `data/products.json` vienen de caché).
6. Prueba instalar con el botón **Instalar** (si tu navegador muestra el `beforeinstallprompt`).