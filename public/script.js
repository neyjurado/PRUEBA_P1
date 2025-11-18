//inicio del script
//para listar juegos desde CheapShark, búsqueda local, paginación y detalles.

let grid, estadoCarga, mensajeError, btnVerMas, inputBusqueda, modalDetalles, btnCerrarModal;
let btnBuscar, selectPlataforma, selectOrdenar;

let paginaActual = 0;
const juegosPorPagina = 12;
let juegosEnCache = [];
let juegosActuales = [];
let busquedaActiva = false;

// Abre la información del juego
function abrirModal(juego) {
    const titulo = juego.title || juego.external || "Juego";
    const thumb = juego.thumb || juego.thumbnail || "";
    const normal = typeof juego.normalPrice !== 'undefined' ? juego.normalPrice : "-";
    const oferta = typeof juego.salePrice !== 'undefined' ? juego.salePrice : (juego.cheapest ?? "-");
    const ahorro = juego.savings ? Math.round(Number(juego.savings)) : "-";

    const elTitulo = document.querySelector('#modal-titulo');
    const elImagen = document.querySelector('#modal-imagen');
    const elPrecioNormal = document.querySelector('#modal-precio-normal');
    const elPrecioOferta = document.querySelector('#modal-precio-oferta');
    const elAhorro = document.querySelector('#modal-ahorro');
    const elEnlace = document.querySelector('#modal-enlace-tienda');

    if (elTitulo) elTitulo.textContent = titulo;
    if (elImagen) {
        elImagen.src = thumb || '';
        elImagen.alt = titulo;
    }
    if (elPrecioNormal) elPrecioNormal.textContent = normal !== "-" ? `$${normal}` : "No disponible";
    if (elPrecioOferta) elPrecioOferta.textContent = oferta !== "-" ? `$${oferta}` : "No disponible";
    if (elAhorro) elAhorro.textContent = ahorro !== "-" ? `${ahorro}%` : "No disponible";

    let enlaceURL = "#";
    if (juego.gameID) {
        enlaceURL = `https://www.cheapshark.com/api/redirect/steam?appID=${juego.gameID}`;
    } else if (juego.dealID) {
        enlaceURL = `https://www.cheapshark.com/redirect?dealID=${juego.dealID}`;
    }
    if (elEnlace) elEnlace.href = enlaceURL;

    if (modalDetalles) modalDetalles.classList.remove('hidden');
}