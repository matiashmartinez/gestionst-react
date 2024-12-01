import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCog, faCheckCircle, faEdit, faTrash, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import NavMenu from "../componentes/NavMenu";
import ServicioForm from "../componentes/ServicioForm";
import generarYEnviarPDF from "../utils/exportarReporte";

const Servicios = () => {
  const { clienteId } = useParams();
  const navigate = useNavigate();

  const [servicios, setServicios] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(!clienteId);
  const [selectedCliente, setSelectedCliente] = useState(clienteId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const serviciosPerPage = 5;

  // **Función para obtener servicios**
  const fetchServicios = useCallback(async () => {
    try {
      let query = supabase
        .from("servicio")
        .select(`
          idServicio,
          fecha_in,
          fecha_es,
          detalle,
          costo,
          num_factura,
          estado,
          idCliente,
          cliente (id, nombre, apellido, telefono, dni)
        `)
        .eq("baja", false)
        .order("fecha_in", { ascending: false });

      if (!mostrarTodos && selectedCliente) {
        query = query.eq("idCliente", selectedCliente);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error al cargar servicios:", error.message);
        throw error;
      }

      setServicios(data);
      setFilteredServicios(data);
    } catch (error) {
      setNotification({ type: "error", message: error.message });
    }
  }, [mostrarTodos, selectedCliente]);

  // **Filtro dinámico**
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtrados = servicios.filter((servicio) => {
      const detalle = servicio.detalle?.toLowerCase() || "";
      const clienteNombre = servicio.cliente?.nombre?.toLowerCase() || "";
      const clienteApellido = servicio.cliente?.apellido?.toLowerCase() || "";
      const clienteDni = servicio.cliente?.dni || "";
      const estado = servicio.estado?.toLowerCase() || "";

      return (
        detalle.includes(query) ||
        clienteNombre.includes(query) ||
        clienteApellido.includes(query) ||
        clienteDni.includes(query) ||
        estado.includes(query)
      );
    });
    setFilteredServicios(filtrados);
    setCurrentPage(1); // Reiniciar a la primera página tras el filtro
  }, [searchQuery, servicios]);

  // **Cargar servicios al inicio**
  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  const handleSwitchChange = (checked) => {
    setMostrarTodos(checked);
    if (checked) {
      navigate("/servicios");
    } else if (clienteId) {
      setSelectedCliente(clienteId);
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
    if (!window.confirm("¿Estás seguro de eliminar este servicio?")) return;

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
    }
  };

  // **Paginación**
  const indexOfLastServicio = currentPage * serviciosPerPage;
  const indexOfFirstServicio = indexOfLastServicio - serviciosPerPage;
  const currentServicios = filteredServicios.slice(indexOfFirstServicio, indexOfLastServicio);

  const totalPages = Math.ceil(filteredServicios.length / serviciosPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // **Notificaciones**
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentServicios.map((servicio) => (
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
                <td className="flex justify-center space-x-2">
                  <button
                    onClick={() =>
                      cambiarEstado(
                        servicio.idServicio,
                        servicio.estado === "finalizado" ? "pendiente" : "finalizado"
                      )
                    }
                  >
                    <FontAwesomeIcon
                      icon={servicio.estado === "finalizado" ? faClock : faCheckCircle}
                      title={servicio.estado === "finalizado" ? "Marcar Pendiente" : "Finalizar"}
                      className="text-blue-500"
                    />
                  </button>
                  <button onClick={() => handleEdit(servicio)}>
                    <FontAwesomeIcon icon={faEdit} title="Editar" className="text-yellow-500" />
                  </button>
                  <button onClick={() => handleDelete(servicio.idServicio)}>
                    <FontAwesomeIcon icon={faTrash} title="Eliminar" className="text-red-500" />
                  </button>
                  <button onClick={() => generarYEnviarPDF(servicio)}>
                    <FontAwesomeIcon icon={faFilePdf} title="PDF" className="text-green-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => paginate(page)}
            className={`btn btn-sm ${currentPage === page ? "btn-active" : ""}`}
          >
            {page}
          </button>
        ))}
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
