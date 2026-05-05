let citas = JSON.parse(localStorage.getItem("sol_radiante_v3")) || [];
let idEliminar = null;

const form = document.getElementById("formCita");
const lista = document.getElementById("listaCitas");
const modal = document.getElementById("modal");
const editIdInput = document.getElementById("editId");
const btnSubmit = document.getElementById("btnSubmit");
const btnCancelarEdit = document.getElementById("btnCancelarEdit");
const formTitle = document.getElementById("formTitle");

function updateDashboard() {
    const hoy = new Date().toISOString().split('T')[0];
    const citasHoy = citas.filter(c => c.fecha === hoy).length;
    const ingresos = citas.reduce((acc, c) => acc + parseFloat(c.anticipo || 0), 0);
    document.getElementById("countCitas").innerText = citasHoy;
    document.getElementById("totalAnticipos").innerText = `$${ingresos.toFixed(0)}`;
    localStorage.setItem("sol_radiante_v3", JSON.stringify(citas));
}

form.onsubmit = (e) => {
    e.preventDefault();
    const id = editIdInput.value;
    const nuevaInfo = {
        nombre: document.getElementById("nombre").value,
        servicio: document.getElementById("servicio").value,
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value,
        anticipo: document.getElementById("anticipo").value || 0
    };

    if (id) {
        citas = citas.map(c => c.id.toString() === id ? { ...c, ...nuevaInfo } : c);
        limpiarFormulario();
    } else {
        citas.push({ id: Date.now(), ...nuevaInfo, estado: "pendiente" });
    }
    form.reset();
    render();
};

function render() {
    lista.innerHTML = "";
    const busqueda = document.getElementById("buscar").value.toLowerCase();
    const filtro = document.getElementById("filtroEstado").value;
    let filtradas = citas.filter(c => c.nombre.toLowerCase().includes(busqueda) && (filtro === "todos" || c.estado === filtro));
    filtradas.sort((a,b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

    filtradas.forEach(c => {
        const li = document.createElement("li");
        li.className = c.estado;
        li.innerHTML = `
            <div class="c-info">
                <strong>${c.nombre}</strong>
                <p><i class="fas fa-magic"></i> ${c.servicio}</p>
                <p><i class="far fa-calendar"></i> ${c.fecha} • <i class="far fa-clock"></i> ${c.hora}</p>
                <div class="c-badge">Anticipo: $${c.anticipo}</div>
            </div>
            <div class="c-btns">
                <button class="btn-edit" onclick="prepararEdicion(${c.id})"><i class="fas fa-pen"></i></button>
                ${c.estado === 'pendiente' ? `<button class="btn-done" onclick="completar(${c.id})"><i class="fas fa-check"></i></button>` : ''}
                <button class="btn-trash" onclick="abrirModal(${c.id})"><i class="fas fa-trash-alt"></i></button>
            </div>`;
        lista.appendChild(li);
    });
    updateDashboard();
}

function prepararEdicion(id) {
    const c = citas.find(cita => cita.id === id);
    editIdInput.value = c.id;
    document.getElementById("nombre").value = c.nombre;
    document.getElementById("servicio").value = c.servicio;
    document.getElementById("fecha").value = c.fecha;
    document.getElementById("hora").value = c.hora;
    document.getElementById("anticipo").value = c.anticipo;
    formTitle.innerText = "Modificar Cita";
    btnSubmit.innerText = "Guardar Cambios";
    btnCancelarEdit.style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limpiarFormulario() {
    editIdInput.value = "";
    formTitle.innerText = "Nueva Cita";
    btnSubmit.innerText = "Confirmar Cita";
    btnCancelarEdit.style.display = "none";
    form.reset();
}

function completar(id) { citas = citas.map(c => c.id === id ? { ...c, estado: 'finalizada' } : c); render(); }
function abrirModal(id) { idEliminar = id; modal.style.display = 'flex'; }
function cerrarModal() { modal.style.display = 'none'; }
document.getElementById("confirmarEliminar").onclick = () => { citas = citas.filter(c => c.id !== idEliminar); render(); cerrarModal(); };
document.getElementById("cancelarEliminar").onclick = cerrarModal;
document.getElementById("buscar").oninput = render;
document.getElementById("filtroEstado").onchange = render;
document.getElementById("toggleDark").onclick = () => { document.body.classList.toggle("dark"); };

render();
