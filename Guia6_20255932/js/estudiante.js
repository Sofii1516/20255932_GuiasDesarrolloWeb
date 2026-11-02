const inputCarnet = document.getElementById("idTxtCarnet");
const inputNombreCompleto = document.getElementById("idTxtNombreCompleto");
const inputDui = document.getElementById("idTxtDui");
const inputNit = document.getElementById("idTxtNit");
const inputFecha = document.getElementById("idTxtFecha");
const inputCorreo = document.getElementById("idTxtCorreo");
const inputEdad = document.getElementById("idTxtEdad");

const buttonValidar = document.getElementById("idBtnValidar");
const buttonLimpiar = document.getElementById("idBtnLimpiarEstudiante");
const resultado = document.getElementById("idResultadoEstudiante");

const expresiones = {
  carnet: /^[A-Z]{2}[0-9]{3}$/,
  nombre: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/,
  dui: /^[0-9]{8}-[0-9]$/,
  nit: /^[0-9]{4}-[0-9]{6}-[0-9]{3}-[0-9]$/,
  fecha: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/[0-9]{4}$/,
  correo: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  edad: /^[0-9]+$/,
};

const campos = [
  { input: inputCarnet, regex: expresiones.carnet, etiqueta: "Carnet" },
  { input: inputNombreCompleto, regex: expresiones.nombre, etiqueta: "Nombre completo" },
  { input: inputDui, regex: expresiones.dui, etiqueta: "DUI" },
  { input: inputNit, regex: expresiones.nit, etiqueta: "NIT" },
  { input: inputFecha, regex: expresiones.fecha, etiqueta: "Fecha de nacimiento" },
  { input: inputCorreo, regex: expresiones.correo, etiqueta: "Correo electrónico" },
  { input: inputEdad, regex: expresiones.edad, etiqueta: "Edad" },
];

const fechaExiste = (fecha) => {
  const [dia, mes, anio] = fecha.split("/").map(Number);
  const objetoFecha = new Date(anio, mes - 1, dia);
  return (
    objetoFecha.getFullYear() == anio &&
    objetoFecha.getMonth() == mes - 1 &&
    objetoFecha.getDate() == dia &&
    objetoFecha <= new Date()
  );
};

const validarCampo = (campo) => {
  const valor = campo.input.value.trim();
  let esValido = campo.regex.test(valor);

  if (esValido && campo.input == inputFecha) {
    esValido = fechaExiste(valor);
  }

  campo.input.classList.toggle("is-valid", esValido);
  campo.input.classList.toggle("is-invalid", !esValido);
  return esValido;
};

const validarFormulario = () => {
  inputCarnet.value = inputCarnet.value.trim().toUpperCase();

  let formularioValido = true;
  campos.forEach((campo) => {
    if (!validarCampo(campo)) formularioValido = false;
  });

  if (formularioValido) {
    let $tabla = `<div class="table-responsive">
                    <table class="table table-striped table-hover table-bordered">`;
    campos.forEach((campo) => {
      $tabla += `<tr>
                    <th scope="row" class="w-25">${campo.etiqueta}</th>
                    <td>${campo.input.value.trim()}</td>
                 </tr>`;
    });
    $tabla += `</table></div>`;
    resultado.innerHTML = $tabla;
    alert("Todos los datos son válidos");
  } else {
    resultado.innerHTML = "Ninguno";
    alert("Hay campos con formato incorrecto, revise los mensajes en rojo");
  }
};

const limpiarFormulario = () => {
  campos.forEach((campo) => {
    campo.input.value = "";
    campo.input.classList.remove("is-valid", "is-invalid");
  });
  resultado.innerHTML = "Ninguno";
  inputCarnet.focus();
};

campos.forEach((campo) => {
  campo.input.addEventListener("input", () => {
    if (campo.input.classList.contains("is-invalid")) validarCampo(campo);
  });
});

inputEdad.addEventListener("keypress", (e) => {
  if (!/^[0-9]$/.test(e.key)) e.preventDefault();
});

buttonValidar.onclick = () => {
  validarFormulario();
};

buttonLimpiar.onclick = () => {
  limpiarFormulario();
};

limpiarFormulario();