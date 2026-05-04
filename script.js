let citas = JSON.parse(localStorage.getItem("glow_citas_pro")) || [];
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
    localStorage.setItem("glow_citas_pro", JSON.stringify(citas));
}

form.onsubmit = (e) => {
    e.preventDefault();
    
    const id = editIdInput.value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;

    const ocupado = citas.some(c => 
        c.fecha === fecha && 
        c.hora === hora && 
        c.estado === 'pendiente' && 
        c.id.toString() !== id
    );

    if (ocupado) {
        alert("¡Aviso! Este horario ya está reservado. Por favor, elige otra hora. ✨");
        return;
    }

    const nuevaInfo = {
        nombre: document.getElementById("nombre").value,
        servicio: document.getElementById("servicio").value,
        fecha: fecha,
        hora: hora,
        anticipo: document.getElementById("anticipo").value || 0
    };

    if (id) {
        citas = citas.map(c => c.id.toString() === id ? { ...c, ...nuevaInfo } : c);
        limpiarFormulario();
    } else {
        citas.push({
            id: Date.now(),
            ...nuevaInfo,
            estado: "pendiente"
        });
    }

    form.reset();
    render();
};

function render() {
    lista.innerHTML = "";
    const busqueda = document.getElementById("buscar").value.toLowerCase();
    const filtro = document.getElementById("filtroEstado").value;

    let filtradas = citas.filter(c => 
        c.nombre.toLowerCase().includes(busqueda) && 
        (filtro === "todos" || c.estado === filtro)
    );

    filtradas.sort((a,b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

    filtradas.forEach(c => {
        const li = document.createElement("li");
        li.className = c.estado;
        if (editIdInput.value === c.id.toString()) li.classList.add("editing");

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
            </div>
        `;
        lista.appendChild(li);
    });
    updateDashboard();
}

function prepararEdicion(id) {
    const cita = citas.find(c => c.id === id);
    if (!cita) return;

    editIdInput.value = cita.id;
    document.getElementById("nombre").value = cita.nombre;
    document.getElementById("servicio").value = cita.servicio;
    document.getElementById("fecha").value = cita.fecha;
    document.getElementById("hora").value = cita.hora;
    document.getElementById("anticipo").value = cita.anticipo;

    formTitle.innerText = "Modificar Cita";
    btnSubmit.innerText = "Guardar Cambios";
    btnSubmit.style.background = "var(--secondary)";
    btnCancelarEdit.style.display = "block";
    
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limpiarFormulario() {
    editIdInput.value = "";
    formTitle.innerText = "Nueva Cita";
    btnSubmit.innerText = "Confirmar Cita";
    btnSubmit.style.background = "var(--primary)";
    btnCancelarEdit.style.display = "none";
    form.reset();
    render();
}

btnCancelarEdit.onclick = limpiarFormulario;

function completar(id) {
    citas = citas.map(c => c.id === id ? { ...c, estado: 'finalizada' } : c);
    render();
}

function abrirModal(id) { idEliminar = id; modal.style.display = 'flex'; }
function cerrarModal() { modal.style.display = 'none'; }

document.getElementById("confirmarEliminar").onclick = () => {
    citas = citas.filter(c => c.id !== idEliminar);
    render();
    cerrarModal();
};

document.getElementById("cancelarEliminar").onclick = cerrarModal;
document.getElementById("buscar").oninput = render;
document.getElementById("filtroEstado").onchange = render;
document.getElementById("toggleDark").onclick = () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    document.getElementById("toggleDark").innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
};

render();