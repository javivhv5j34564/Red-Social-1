// ===============================
// CONFIGURACIÓN
// ===============================
const API = "http://localhost:8080";

// ===============================
// UTILIDADES
// ===============================
async function apiGet(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error en GET: " + res.status);
    return await res.json();
  } catch (err) {
    console.error(err);
    alert("Error al obtener datos del servidor");
  }
}

async function apiPost(url, data) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error en POST: " + res.status);
    return await res.json();
  } catch (err) {
    console.error(err);
    alert("Error al enviar datos al servidor");
  }
}

async function apiDelete(url) {
  try {
    const res = await fetch(url, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Error en DELETE: " + res.status);
    // DELETE typically doesn't return body or may just return 204 No Content
    return true;
  } catch (err) {
    console.error(err);
    alert("Error al eliminar en el servidor");
    return false;
  }
}

async function apiPut(url, data) {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error en PUT: " + res.status);
    return await res.json();
  } catch (err) {
    console.error(err);
    alert("Error al actualizar datos en el servidor");
  }
}

// ===============================
// CONTENIDOS
// ===============================
async function cargarContenidos() {
  const data = await apiGet(`${API}/contenidos/all`);
  if (data) mostrarContenidos(data);
}

async function crearContenido() {
  const contenido = {
    titulo: document.getElementById("titulo").value,
    descripcion: document.getElementById("descripcion").value
  };

  const data = await apiPost(`${API}/contenidos/create`, contenido);
  if (data) {
      alert("Contenido creado correctamente");
      cargarContenidos();
  }
}

function mostrarContenidos(lista) {
  const div = document.getElementById("contenidos");
  if (!div) return;
  div.innerHTML = lista
    .map(c => `<p><strong>${c.titulo}</strong>: ${c.descripcion}</p>`)
    .join("");
}

// ===============================
// USUARIOS
// ===============================
async function cargarUsuario() {
  const idInput = document.getElementById("userId");
  if (!idInput) return;
  const id = idInput.value;
  const data = await apiGet(`${API}/usuarios/${id}`);
  if (data) mostrarUsuario(data);
}

async function registrarUsuario(usuario) {
  const data = await apiPost(`${API}/usuarios/register`, usuario);
  if (data) {
      alert("Usuario registrado correctamente");
      return data;
  }
}

async function loginUsuario(usuario) {
  const data = await apiPost(`${API}/usuarios/login`, usuario);
  if (data) {
      alert("Login correcto");
      return data;
  }
}

function mostrarUsuario(u) {
  const div = document.getElementById("usuario");
  if (!div) return;
  div.innerHTML = `
    <p><strong>ID:</strong> ${u.id}</p>
    <p><strong>Nombre:</strong> ${u.nombre}</p>
  `;
}

// ===============================
// FEED
// ===============================
async function cargarFeed() {
  const data = await apiGet(`${API}/feed/all`);
  if (data) mostrarFeed(data);
}

async function publicarFeed(post) {
  const data = await apiPost(`${API}/feed/publicar`, post);
  if (data) {
      alert("Publicación creada");
      cargarFeed();
  }
}

function mostrarFeed(lista) {
  const div = document.getElementById("feed");
  if (!div) return;
  div.innerHTML = lista
    .map(f => `<p>${f.texto}</p>`)
    .join("");
}
