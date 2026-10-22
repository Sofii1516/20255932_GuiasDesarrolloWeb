const pedidos = [];

let filtroPrecioMax = null;

function validarPedido(producto, precio, cantidad) {
  const errores = [];
  if (producto.trim() === "") {
    errores.push("El nombre del producto no puede estar vacío.");
  }
  if (Number.isNaN(precio) || precio <= 0) {
    errores.push("El precio debe ser un número mayor que cero.");
  }
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    errores.push("La cantidad debe ser un número entero positivo.");
  }
  return errores;
}

function crearPedido(producto, precio, cantidad) {
  return { producto: producto.trim(), precio, cantidad };
}

function calcularSubtotal(pedido) {
  return pedido.precio * pedido.cantidad;
}

function filtrarPorPrecioMaximo(lista, precioMax) {
  return lista.filter((pedido) => pedido.precio <= precioMax);
}

function totalUnidades(lista) {
  return lista.reduce((acc, pedido) => acc + pedido.cantidad, 0);
}

function montoTotal(lista) {
  return lista.reduce((acc, pedido) => acc + calcularSubtotal(pedido), 0);
}

function obtenerPedidosVisibles() {
  return filtroPrecioMax === null
    ? pedidos
    : filtrarPorPrecioMaximo(pedidos, filtroPrecioMax);
}

const inputProducto = document.querySelector("#inputProducto");
const inputPrecio = document.querySelector("#inputPrecio");
const inputCantidad = document.querySelector("#inputCantidad");
const inputPrecioMax = document.querySelector("#inputPrecioMax");
const mensajeError = document.querySelector("#mensajeError");
const tbodyPedidos = document.querySelector("#tbodyPedidos");
const spanUnidades = document.querySelector("#totalUnidades");
const spanMonto = document.querySelector("#montoTotal");

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function renderizarTabla(lista) {
  tbodyPedidos.innerHTML = lista
    .map(
      (pedido) => `
      <tr>
        <td>${escaparHTML(pedido.producto)}</td>
        <td class="text-end">$${pedido.precio.toFixed(2)}</td>
        <td class="text-end">${pedido.cantidad}</td>
        <td class="text-end">$${calcularSubtotal(pedido).toFixed(2)}</td>
      </tr>`
    )
    .join("");
}

function renderizarIndicadores(lista) {
  spanUnidades.textContent = totalUnidades(lista);
  spanMonto.textContent = montoTotal(lista).toFixed(2);
}

function actualizarVista() {
  const visibles = obtenerPedidosVisibles();
  renderizarTabla(visibles);
  renderizarIndicadores(visibles);
}

function mostrarErrores(errores) {
  if (errores.length === 0) {
    mensajeError.classList.add("d-none");
    mensajeError.innerHTML = "";
    return;
  }
  mensajeError.innerHTML = errores.map((e) => `<div>${e}</div>`).join("");
  mensajeError.classList.remove("d-none");
}

function agregarPedido() {
  const producto = inputProducto.value;
  const precio = parseFloat(inputPrecio.value);
  const cantidad = Number(inputCantidad.value);

  const errores = validarPedido(producto, precio, cantidad);
  mostrarErrores(errores);
  if (errores.length > 0) return;

  pedidos.push(crearPedido(producto, precio, cantidad));
  inputProducto.value = "";
  inputPrecio.value = "";
  inputCantidad.value = "";
  inputProducto.focus();
  actualizarVista();
}

function filtrarProductos() {
  const precioMax = parseFloat(inputPrecioMax.value);
  if (Number.isNaN(precioMax) || precioMax < 0) {
    mostrarErrores(["Ingrese un precio máximo válido para filtrar."]);
    return;
  }
  mostrarErrores([]);
  filtroPrecioMax = precioMax;
  actualizarVista();
}

function mostrarTodos() {
  filtroPrecioMax = null;
  inputPrecioMax.value = "";
  mostrarErrores([]);
  actualizarVista();
}

function limpiarPedidos() {
  pedidos.length = 0;
  filtroPrecioMax = null;
  inputPrecioMax.value = "";
  mostrarErrores([]);
  actualizarVista();
}

document.querySelector("#btnAgregar").addEventListener("click", agregarPedido);
document.querySelector("#btnFiltrar").addEventListener("click", filtrarProductos);
document.querySelector("#btnMostrarTodos").addEventListener("click", mostrarTodos);
document.querySelector("#btnLimpiar").addEventListener("click", limpiarPedidos);

actualizarVista();