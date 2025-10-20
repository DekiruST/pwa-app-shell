const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const routes = {
  "/": renderHome,
  "/productos": renderProductos,
  "/acerca": renderAcerca
};

const menuBtn = $("#menuBtn");
const appNav  = $("#appNav");
const scrim   = $("#scrim");

// Calcula y fija la altura del header como variable CSS y coloca el nav debajo
function setHeaderHeight(){
  const h  = $(".app-header")?.getBoundingClientRect().height || 56;
  const px = Math.ceil(h) + "px";
  document.documentElement.style.setProperty("--headerH", px);
  if (appNav) appNav.style.top = px;
}

// Abrir/cerrar menú + bloquear scroll del fondo
menuBtn?.addEventListener("click", () => {
  const open = appNav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", String(open));
  if (open) setHeaderHeight();
  document.body.classList.toggle("menu-open", open);
  if (scrim){
    scrim.hidden = !open;
    scrim.classList.toggle("show", open);
  }
  if (open) window.scrollTo({ top: 0, behavior: "auto" });
});

// Cerrar al tocar fuera
scrim?.addEventListener("click", () => {
  appNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  scrim.classList.remove("show");
  scrim.hidden = true;
  menuBtn.setAttribute("aria-expanded","false");
});

// Router
window.addEventListener("hashchange", renderRoute);
window.addEventListener("resize", setHeaderHeight);
window.addEventListener("load", setHeaderHeight);
window.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  setHeaderHeight();
  renderRoute();
  registerSW();
});

function renderRoute(){
  const hash = location.hash.replace("#", "");
  const path = hash || "/";
  const routeFn = routes[path] || routes["/"];

  $$(".app-nav a").forEach(a =>
    a.classList.toggle("active", a.getAttribute("href") === `#${path}`)
  );

  routeFn();

  // Cerrar menú al navegar
  appNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  if (scrim){
    scrim.classList.remove("show");
    scrim.hidden = true;
  }
  menuBtn.setAttribute("aria-expanded","false");

  $("#appContent")?.focus();
}

// Vistas
function renderHome(){
  $("#appContent").innerHTML = `
    <section class="card">
      <h2>Bienvenido</h2>
      <p>Este es un <strong>App Shell</strong> para una <strong>PWA</strong> con funcionamiento sin conexión.</p>
      <p class="muted">Explora el menú para ver la lista de productos (datos dinámicos).</p>
      <div class="badge">Offline Ready</div>
    </section>
  `;
}

let cacheBust = 0;
async function renderProductos(){
  $("#appContent").innerHTML = `
    <section>
      <div class="toolbar">
        <input id="q" type="search" placeholder="Buscar producto..." aria-label="Buscar">
        <button class="primary" id="refreshBtn">Actualizar lista</button>
      </div>
      <div id="counter" class="muted"></div>
      <div id="grid" class="grid" role="list"></div>
    </section>
  `;

  $("#refreshBtn").addEventListener("click", () => {
    cacheBust++;
    loadProductos(true);
  });

  $("#q").addEventListener("input", (e) => {
    const term = e.currentTarget.value.toLowerCase();
    $$("#grid .card").forEach(card => {
      const match = card.dataset.name.includes(term);
      card.style.display = match ? "" : "none";
    });
  });

  await loadProductos(false);
}

async function loadProductos(forceRefresh){
  const grid = $("#grid");
  const counter = $("#counter");
  grid.innerHTML = "<p class='muted'>Cargando...</p>";
  try{
    const url = `data/products.json${cacheBust ? `?v=${cacheBust}` : ""}`;
    const res = await fetch(url, { cache: forceRefresh ? "reload" : "default" });
    const data = await res.json();
    grid.innerHTML = "";
    data.products.forEach(p => {
      const card = document.createElement("article");
      card.className = "card";
      card.setAttribute("role","listitem");
      card.dataset.name = (p.name + " " + p.category).toLowerCase();
      card.innerHTML = `
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p><strong>$ ${p.price.toFixed(2)}</strong> — <span class="muted">${p.category}</span></p>
      `;
      grid.appendChild(card);
    });
    counter.textContent = `${data.products.length} productos`;
  }catch(err){
    console.warn("Error cargando productos:", err);
    grid.innerHTML = "<p class='muted'>No se pudo cargar la lista. Revisa tu conexión.</p>";
  }
}

function renderAcerca(){
  $("#appContent").innerHTML = `
    <section class="card">
      <h2>Acerca</h2>
      <p>Ejemplo de App Shell PWA (HTML/CSS/JS puro) con Service Worker y manifest.</p>
      <ul>
        <li>App Shell cacheado (header, menú, footer, estilos y scripts).</li>
        <li>Datos dinámicos (lista de productos desde <code>data/products.json</code>).</li>
        <li>Funciona offline después del primer uso.</li>
      </ul>
    </section>
  `;
}

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = $("#installBtn");
  btn.hidden = false;
  btn.addEventListener("click", async () => {
    btn.hidden = true;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("Instalación:", outcome);
    deferredPrompt = null;
  }, { once:true });
});

// Registro SW
async function registerSW(){
  if ("serviceWorker" in navigator){
    try{
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      console.log("SW registrado:", reg.scope);
    }catch(err){
      console.warn("SW fallo:", err);
    }
  }
}
