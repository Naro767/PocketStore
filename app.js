"use strict";

const API_URL = "https://jsonplaceholder.typicode.com/users";

const catalogEl = document.getElementById("catalog");
const messageEl = document.getElementById("message");
const statusEl = document.getElementById("status");
const searchEl = document.getElementById("search");
const refreshEl = document.getElementById("refresh");

let items = [];

/* ---------- 1. Registro del Service Worker ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("[App] Service Worker registrado. Alcance:", reg.scope))
      .catch((err) => console.error("[App] Error al registrar el SW:", err));
  });
}

/* ---------- 2. Estado de conexión ---------- */
function updateStatus() {
  const online = navigator.onLine;
  statusEl.textContent = online ? "En línea" : "Sin conexión";
  statusEl.className = "status " + (online ? "is-online" : "is-offline");
}
window.addEventListener("online", () => { updateStatus(); loadCatalog(); });
window.addEventListener("offline", updateStatus);

/* ---------- 3. Consumo de la API ---------- */
async function loadCatalog() {
  showMessage("");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("HTTP " + response.status);
    items = await response.json();
    render();
  } catch (error) {
    console.error("[App] No se pudo cargar el catálogo:", error);
    if (items.length === 0) {
      catalogEl.innerHTML = "";
      showMessage("No hay datos guardados todavía. Conéctate a internet una vez para descargar el catálogo.", true);
    }
  }
}

/* ---------- 4. Render ---------- */
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function render() {
  const term = searchEl.value.trim().toLowerCase();
  const filtered = items.filter((u) =>
    (u.name + " " + u.address.city).toLowerCase().includes(term)
  );

  if (filtered.length === 0) {
    catalogEl.innerHTML = '<p class="message">No se encontraron resultados.</p>';
    return;
  }

  catalogEl.innerHTML = filtered.map((u) => `
    <article class="item">
      <div class="item__head">
        <div class="item__avatar" aria-hidden="true">${escapeHTML(initials(u.name))}</div>
        <div>
          <h2 class="item__name">${escapeHTML(u.name)}</h2>
          <p class="item__user">@${escapeHTML(u.username)}</p>
        </div>
      </div>
      <p class="item__row"><b>Correo:</b> ${escapeHTML(u.email)}</p>
      <p class="item__row"><b>Teléfono:</b> ${escapeHTML(u.phone)}</p>
      <p class="item__row"><b>Ciudad:</b> ${escapeHTML(u.address.city)}</p>
      <p class="item__row"><b>Empresa:</b> ${escapeHTML(u.company.name)}</p>
    </article>
  `).join("");
}

function showMessage(text, isError = false) {
  messageEl.hidden = !text;
  messageEl.textContent = text;
  messageEl.className = "message" + (isError ? " is-error" : "");
}

/* ---------- 5. Eventos ---------- */
searchEl.addEventListener("input", render);
refreshEl.addEventListener("click", loadCatalog);

updateStatus();
loadCatalog();
