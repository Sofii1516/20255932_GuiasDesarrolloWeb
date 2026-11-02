const encabezados = document.querySelectorAll(".encabezado-guia");

encabezados.forEach((encabezado) => {
  encabezado.addEventListener("click", () => {
    encabezado.parentElement.classList.toggle("abierta");
  });
});