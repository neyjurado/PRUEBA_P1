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

// Cierra el modal
function cerrarModal() {
    if (modalDetalles) modalDetalles.classList.add('hidden');
}

// Crea y devuelve una card DOM para un juego
function crearCard(juego) {
    const card = document.createElement('article');
    card.className = 'bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col';

    const titulo = juego.title || juego.external || "Juego";
    const thumb = juego.thumb || juego.thumbnail || "";
    const precioOferta = juego.salePrice ?? juego.cheapest ?? "-";
    const precioNormal = juego.normalPrice ?? "-";
    const ahorro = juego.savings ? `${Math.round(Number(juego.savings))}%` : null;
    const rating = juego.rating ?? juego.steamRating ?? "N/A";

    card.innerHTML = `
        <img src="${thumb}" alt="${titulo}" class="h-40 w-full object-cover" />
        <div class="p-4 flex flex-col gap-2 flex-1">
            <h3 class="text-md font-semibold text-slate-900">${titulo}</h3>
            <p class="text-xs text-slate-500">
                ${precioNormal !== "-" ? `<s>$${precioNormal}</s>` : ""}
                ${precioOferta !== "-" ? ` <span class="font-bold text-green-900">$${precioOferta}</span>` : ""}
                ${ahorro ? ` · Ahorra ${ahorro}` : ""}
            </p>
            <p class="text-sm text-slate-600 flex-1">${juego.description || juego.shortDescription || ""}</p>
            <div class="mt-4 flex items-center justify-between">
                <span class="text-yellow-500 font-semibold">⭐ ${rating}</span>
                <button class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 btn-detalles">Ver detalles</button>
            </div>
        </div>
    `.trim();

    const btn = card.querySelector('.btn-detalles');
    if (btn) btn.addEventListener('click', () => abrirModal(juego));

    return card;
}


// Renderiza una lista de juegos (los agrega al grid)
function renderizarVideojuegos(lista, limpiar = false) {
    if (!Array.isArray(lista) || !grid) return;
    if (limpiar) grid.innerHTML = '';

    for (const juego of lista) {
        const card = crearCard(juego);
        grid.appendChild(card);
    }
}