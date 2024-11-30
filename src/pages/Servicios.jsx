import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCog, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import NavMenu from "../componentes/NavMenu";
import ServicioForm from "../componentes/ServicioForm";

const Servicios = () => {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(!clienteId);
  const [selectedCliente, setSelectedCliente] = useState(clienteId || "");
  const [searchCliente, setSearchCliente] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);

  const fetchServicios = async () => {
    let query = supabase.from("servicio").select("*, cliente(id, nombre, apellido, telefono)");
    if (!mostrarTodos && selectedCliente) {
      query = query.eq("idCliente", selectedCliente);
    }
    query = query.eq("baja", false);
    const { data, error } = await query;

    if (error) {
      console.error("Error al cargar servicios:", error.message);
    } else {
      setServicios(data);
    }
  };

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from("cliente")
      .select("id, nombre, apellido, telefono")
      .order("apellido", { ascending: true });

    if (error) {
      console.error("Error al cargar clientes:", error.message);
    } else {
      setClientes(data);
    }
  };

  useEffect(() => {
    fetchServicios();
    fetchClientes();
  }, [clienteId, mostrarTodos, selectedCliente]);

  const handleSwitchChange = (checked) => {
    setMostrarTodos(checked);
    if (checked) {
      navigate("/servicios");
      setSelectedCliente("");
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (servicio) => {
    setEditingService(servicio);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Estás seguro de eliminar este servicio?");
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from("servicio")
        .update({ baja: true })
        .eq("id", id);

      if (error) throw new Error("No se pudo eliminar el servicio.");

      setNotification({ type: "success", message: "Servicio eliminado correctamente." });
      fetchServicios();
    } catch (err) {
      setNotification({ type: "error", message: err.message });
      console.error(err.message);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from("servicio")
        .update({ estado: nuevoEstado })
        .eq("id", id);

      if (error) throw new Error("Error al cambiar estado.");

      setServicios((prevServicios) =>
        prevServicios.map((servicio) =>
          servicio.id === id ? { ...servicio, estado: nuevoEstado } : servicio
        )
      );
    } catch (err) {
      console.error(err.message);
    }
  };

  const generarYEnviarPDF = (servicio) => {
    const doc = new jsPDF();
    doc.text("Reporte de Servicio", 14, 20);

    doc.autoTable({
      startY: 30,
      head: [["Campo", "Detalle"]],
      body: [
        ["Cliente", `${servicio.cliente.nombre} ${servicio.cliente.apellido}`],
        ["Teléfono", servicio.cliente.telefono],
        ["Detalle", servicio.detalle],
        ["Costo", `$${servicio.costo}`],
        ["Estado", servicio.estado],
      ],
    });

    doc.save(`Servicio_${servicio.id}.pdf`);

    const mensaje = `
    Servicio Técnico:
    - Cliente: ${servicio.cliente.nombre} ${servicio.cliente.apellido}
    - Teléfono: ${servicio.cliente.telefono}
    - Detalle: ${servicio.detalle}
    - Costo: $${servicio.costo}
    - Estado: ${servicio.estado}
    `;
    const url = `https://wa.me/${servicio.cliente.telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const serviciosFiltrados = servicios.filter((servicio) => {
    const detalle = servicio.detalle?.toLowerCase() || "";
    const clienteNombre = servicio.cliente?.nombre?.toLowerCase() || "";
    const clienteApellido = servicio.cliente?.apellido?.toLowerCase() || "";
    const estado = servicio.estado?.toLowerCase() || "";

    return (
      detalle.includes(searchQuery) ||
      clienteNombre.includes(searchQuery) ||
      clienteApellido.includes(searchQuery) ||
      estado.includes(searchQuery)
    );
  });

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchCliente.toLowerCase())
  );

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      <NavMenu />
      <h1 className="text-3xl font-bold text-center mb-6">Gestión de Servicios</h1>

      {/* Notificaciones */}
      {notification && (
        <div
          className={`alert ${
            notification.type === "success" ? "alert-success" : "alert-error"
          } shadow-lg`}
        >
          <div>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="btn btn-sm btn-ghost">
              X
            </button>
          </div>
        </div>
      )}

      {/* Switch y Filtros */}
      <div className="flex justify-between items-center mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={mostrarTodos}
            onChange={(e) => handleSwitchChange(e.target.checked)}
          />
          <span>{mostrarTodos ? "Ver Todos los Servicios" : "Ver Servicios del Cliente"}</span>
        </label>

        {!mostrarTodos && (
          <div className="form-control w-full max-w-xs">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
              className="input input-bordered"
            />
            <ul className="bg-white shadow-lg rounded mt-2">
              {clientesFiltrados.map((cliente) => (
                <li
                  key={cliente.id}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => setSelectedCliente(cliente.id)}
                >
                  {cliente.nombre} {cliente.apellido}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-control w-full max-w-xs">
          <input
            type="text"
            placeholder="Buscar servicios..."
            className="input input-bordered"
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          Nuevo Servicio
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Detalle</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {serviciosFiltrados.map((servicio) => (
              <tr key={servicio.id}>
                <td>{servicio.detalle}</td>
                <td>
                  {servicio.cliente.nombre} {servicio.cliente.apellido}
                </td>
                <td>
                  <FontAwesomeIcon
                    icon={
                      servicio.estado === "pendiente"
                        ? faClock
                        : servicio.estado === "en progreso"
                        ? faCog
                        : faCheckCircle
                    }
                    className={`${
                      servicio.estado === "pendiente"
                        ? "text-gray-500"
                        : servicio.estado === "en progreso"
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  />
                </td>
                <td className="flex space-x-2">
                  <button className="btn btn-warning btn-sm" onClick={() => handleEdit(servicio)}>
                    Editar
                  </button>
                  <button className="btn btn-error btn-sm" onClick={() => handleDelete(servicio.id)}>
                    Eliminar
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => generarYEnviarPDF(servicio)}
                  >
                    WhatsApp + PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <ServicioForm
              initialData={editingService}
              onSubmit={() => {
                fetchServicios();
                setShowModal(false);
              }}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicios;
