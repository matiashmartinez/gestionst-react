import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCog, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import NavMenu from "../componentes/NavMenu";
import ServicioForm from "../componentes/ServicioForm";
import generarYEnviarPDF from "../utils/exportarReporte";

const Servicios = () => {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(!clienteId);
  const [selectedCliente, setSelectedCliente] = useState(clienteId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);

  // Memoizar fetchServicios con useCallback
  const fetchServicios = useCallback(async () => {
    try {
      let query = supabase
        .from("servicio")
        .select("*, cliente(id, nombre, apellido, telefono, dni)");

      if (!mostrarTodos && selectedCliente) {
        query = query.eq("idCliente", selectedCliente);
      }

      query = query.eq("baja", false);

      const { data, error } = await query;

      if (error) {
        console.error("Error al cargar servicios:", error.message);
        throw error;
      }
      setServicios(data);
    } catch (error) {
      console.error("Error en fetchServicios:", error.message);
    }
  }, [mostrarTodos, selectedCliente]);

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from("cliente")
      .select("id, nombre, apellido, telefono, dni")
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
  }, [clienteId, mostrarTodos, selectedCliente, fetchServicios]);

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

  const handleDelete = async (idServicio) => {
    const confirm = window.confirm("¿Estás seguro de eliminar este servicio?");
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from("servicio")
        .update({ baja: true })
        .eq("idServicio", idServicio);

      if (error) throw new Error("No se pudo eliminar el servicio.");

      setNotification({ type: "success", message: "Servicio eliminado correctamente." });
      fetchServicios();
    } catch (err) {
      setNotification({ type: "error", message: err.message });
      console.error(err.message);
    }
  };

  const cambiarEstado = async (idServicio, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from("servicio")
        .update({ estado: nuevoEstado })
        .eq("idServicio", idServicio);

      if (error) throw new Error("Error al cambiar estado.");

      setServicios((prevServicios) =>
        prevServicios.map((servicio) =>
          servicio.idServicio === idServicio ? { ...servicio, estado: nuevoEstado } : servicio
        )
      );
      setNotification({ type: "success", message: "Estado actualizado correctamente." });
    } catch (err) {
      setNotification({ type: "error", message: err.message });
      console.error(err.message);
    }
  };

  const serviciosFiltrados = servicios.filter((servicio) => {
    const detalle = servicio.detalle?.toLowerCase() || "";
    const clienteNombre = servicio.cliente?.nombre?.toLowerCase() || "";
    const clienteApellido = servicio.cliente?.apellido?.toLowerCase() || "";
    const clienteDni = servicio.cliente?.dni || "";
    const estado = servicio.estado?.toLowerCase() || "";

    return (
      detalle.includes(searchQuery) ||
      clienteNombre.includes(searchQuery) ||
      clienteApellido.includes(searchQuery) ||
      clienteDni.includes(searchQuery) ||
      estado.includes(searchQuery)
    );
  });

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      <NavMenu />
      <h1 className="text-3xl font-bold text-center mb-6">Gestión de Servicios</h1>

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

        <div className="form-control w-full max-w-xs">
          <input
            type="text"
            placeholder="Buscar por detalle, cliente o DNI"
            className="input input-bordered"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          Nuevo Servicio
        </button>
      </div>

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
              <tr key={servicio.idServicio}>
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
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      cambiarEstado(
                        servicio.idServicio,
                        servicio.estado === "finalizado" ? "pendiente" : "finalizado"
                      )
                    }
                  >
                    {servicio.estado === "finalizado" ? "Marcar Pendiente" : "Finalizar"}
                  </button>
                  <button className="btn btn-warning btn-sm" onClick={() => handleEdit(servicio)}>
                    Editar
                  </button>
                  <button className="btn btn-error btn-sm" onClick={() => handleDelete(servicio.idServicio)}>
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

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <ServicioForm
              fetchServicios={fetchServicios}
              onClose={() => setShowModal(false)}
              initialData={editingService}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicios;
