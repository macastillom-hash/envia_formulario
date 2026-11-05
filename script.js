
const formulario = document.getElementById("formulario");
const selectorArchivos = document.getElementById("archivos");
const listaArchivos = document.getElementById("lista-archivos");
const botonEnviar = document.getElementById("btnEnviar");
const estado = document.getElementById("estado");

const MAX_ARCHIVOS = 5;
const MAX_TAMANO = 3 * 1024 * 1024;

const FORMATOS_PERMITIDOS = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
];

const EXTENSIONES_PERMITIDAS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp"
];

// Mostrar mensajes al visitante
function mostrarEstado(mensaje, tipo) {
  estado.textContent = mensaje;
  estado.className = "estado " + tipo;
}

// Validar archivos seleccionados
function validarArchivos(archivos) {
  if (archivos.length > MAX_ARCHIVOS) {
    return "Puedes seleccionar máximo 5 archivos.";
  }

  let pesoTotal = 0;

  for (const archivo of archivos) {
    const extension = archivo.name
      .substring(archivo.name.lastIndexOf("."))
      .toLowerCase();

    if (
      !EXTENSIONES_PERMITIDAS.includes(extension) ||
      !FORMATOS_PERMITIDOS.includes(archivo.type)
    ) {
      return "Archivo no permitido: " + archivo.name;
    }

    pesoTotal += archivo.size;
  }

  if (pesoTotal > MAX_TAMANO) {
    return "Los archivos superan el límite de 3 MB.";
  }

  return null;
}

// Mostrar archivos seleccionados
selectorArchivos.addEventListener("change", function () {
  const archivos = Array.from(this.files);

  listaArchivos.innerHTML = "";

  const error = validarArchivos(archivos);

  if (error) {
    this.value = "";
    mostrarEstado(error, "error");
    return;
  }

  estado.className = "estado";

  archivos.forEach((archivo) => {
    const elemento = document.createElement("div");
    elemento.className = "archivo-item";

    const nombre = document.createElement("span");
    nombre.textContent = "📎 " + archivo.name;

    const peso = document.createElement("strong");
    peso.textContent =
      (archivo.size / 1024).toFixed(1) + " KB";

    elemento.appendChild(nombre);
    elemento.appendChild(peso);

    listaArchivos.appendChild(elemento);
  });
});

// Enviar formulario
formulario.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!formulario.reportValidity()) {
    return;
  }

  const archivos = Array.from(selectorArchivos.files);
  const error = validarArchivos(archivos);

  if (error) {
    mostrarEstado(error, "error");
    return;
  }

  const datos = new FormData(formulario);

  botonEnviar.disabled = true;
  botonEnviar.textContent = "Enviando...";
  mostrarEstado("Estamos enviando tu solicitud. Espera un momento.", "info");

  try {
    const respuesta = await fetch("/api/enviar", {
      method: "POST",
      body: datos
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok || !resultado.success) {
      throw new Error(
        resultado.message || "No se pudo enviar el formulario."
      );
    }

    mostrarEstado(
      "¡Excelente! Tu formulario fue enviado correctamente.",
      "exito"
    );

    formulario.reset();
    listaArchivos.innerHTML = "";

  } catch (error) {
    mostrarEstado(
      error.message || "Ocurrió un error al enviar el formulario. Inténtalo nuevamente.",
      "error"
    );

  } finally {
    botonEnviar.disabled = false;
    botonEnviar.textContent = "Enviar formulario";
  }
});
