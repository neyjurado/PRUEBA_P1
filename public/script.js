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

//llamado de juegos 
// Carga inicial: trae muchos resultados para búsqueda local y muestra primeros juegosPorPagina
async function cargarVideojuegosInicial() {
    if (estadoCarga) estadoCarga.classList.remove("hidden");
    if (mensajeError) mensajeError.classList.add("hidden");
    if (grid) grid.innerHTML = '';
    paginaActual = 0;
    juegosEnCache = [];
    juegosActuales = [];
    busquedaActiva = false;

    try {
        const url = 'https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60&pageNumber=0';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Respuesta ${res.status}`);
        const data = await res.json();
        juegosEnCache = data;
        juegosActuales = data;
        renderizarVideojuegos(data.slice(0, juegosPorPagina), false);
        paginaActual++;
    } catch (e) {
        console.error("Error al cargar Cheapshark", e);
        if (mensajeError) {
            mensajeError.textContent = "Error al cargar los juegos. Revisa la consola o CORS.";
            mensajeError.classList.remove('hidden');
        }
    } finally {
        if (estadoCarga) estadoCarga.classList.add('hidden');
    }
}

// juegos desde la API
async function cargarMasJuegos() {
    if (estadoCarga) estadoCarga.classList.remove("hidden");
    if (mensajeError) mensajeError.classList.add("hidden");
    if (btnVerMas) btnVerMas.disabled = true;

    try {
        const url = `https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=${juegosPorPagina}&pageNumber=${paginaActual}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Respuesta ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            if (mensajeError) {
                mensajeError.textContent = "No hay más juegos disponibles";
                mensajeError.classList.remove('hidden');
            }
            if (btnVerMas) btnVerMas.disabled = false;
            return;
        }

        juegosEnCache = juegosEnCache.concat(data);
        juegosActuales = juegosActuales.concat(data);
        renderizarVideojuegos(data, false);
        paginaActual++;
        if (btnVerMas) btnVerMas.disabled = false;
    } catch (e) {
        console.error("Error al cargar más juegos", e);
        if (mensajeError) mensajeError.classList.remove('hidden');
        if (btnVerMas) btnVerMas.disabled = false;
    } finally {
        if (estadoCarga) estadoCarga.classList.add('hidden');
    }
}


// Filtrado y ordenamiento
function aplicarFiltros() {
    const termino = inputBusqueda ? inputBusqueda.value.trim().toLowerCase() : "";
    const plataforma = selectPlataforma ? selectPlataforma.value : "";

    let resultados = juegosEnCache.filter(juego => {
        const titulo = (juego.title || juego.external || "").toLowerCase();
        const cumpleBusqueda = termino === "" || titulo.includes(termino);
        // actualmente no filtramos por plataforma porque la API no devuelve plataforma consistente
        return cumpleBusqueda;
    });

    const ordenar = selectOrdenar ? selectOrdenar.value : "";
    if (ordenar === "rating") {
        resultados.sort((a, b) => (b.metacriticScore || 0) - (a.metacriticScore || 0));
    } else if (ordenar === "recent") {
        resultados.sort((a, b) => (b.steamRatingCount || 0) - (a.steamRatingCount || 0));
    } else if (ordenar === "name") {
        resultados.sort((a, b) => (a.title || a.external || "").localeCompare(b.title || b.external || ""));
    }

    juegosActuales = resultados;
    return resultados;
}

function ejecutarBusqueda() {
    if (estadoCarga) estadoCarga.classList.remove("hidden");
    if (grid) grid.innerHTML = '';
    const resultados = aplicarFiltros();
    if (!resultados || resultados.length === 0) {
        if (mensajeError) {
            mensajeError.textContent = "No se encontraron videojuegos con ese criterio.";
            mensajeError.classList.remove('hidden');
        }
    } else {
        if (mensajeError) mensajeError.classList.add('hidden');
        renderizarVideojuegos(resultados, true);
    }
    if (estadoCarga) estadoCarga.classList.add('hidden');
}

// Esperar a que el DOM esté listo antes de obtener elementos y asignar listeners
document.addEventListener('DOMContentLoaded', () => {
    grid = document.querySelector('#grid-videogames');
    estadoCarga = document.querySelector('#estado-de-carga');
    mensajeError = document.querySelector('#mensaje-de-error');
    btnVerMas = document.querySelector('#btn-ver-mas');
    inputBusqueda = document.querySelector('#input-busqueda');
    modalDetalles = document.querySelector('#modal-detalles');
    btnCerrarModal = document.querySelector('#btn-cerrar-modal');
    btnBuscar = document.querySelector('#btn-buscar');
    selectPlataforma = document.querySelector('#select-plataforma');
    selectOrdenar = document.querySelector('#select-ordenar');

    if (btnVerMas) btnVerMas.addEventListener('click', cargarMasJuegos);
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (modalDetalles) {
        modalDetalles.addEventListener('click', (e) => {
            if (e.target === modalDetalles) cerrarModal();
        });
    }
    if (btnBuscar) btnBuscar.addEventListener('click', ejecutarBusqueda);
    if (inputBusqueda) {
        let debounceTimer = null;
        inputBusqueda.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                ejecutarBusqueda();
            }, 300);
        });
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') ejecutarBusqueda();
        });
    }
    if (selectPlataforma) selectPlataforma.addEventListener('change', ejecutarBusqueda);
    if (selectOrdenar) selectOrdenar.addEventListener('change', ejecutarBusqueda);

    cargarVideojuegosInicial();
});



    
