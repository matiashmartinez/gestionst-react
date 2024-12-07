import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faPlus } from "@fortawesome/free-solid-svg-icons";
import NavMenu from "../componentes/NavMenu";
import ServicioForm from "../componentes/ServicioForm";
import generarYEnviarPDF from "../utils/exportarReporte";
import TablaServicios from "../componentes/TablaServicios";

const Servicios = () => {
  const { clienteId } = useParams();
  const [servicios, setServicios] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalDetails, setModalDetails] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(!clienteId);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "fecha_in",
    direction: "desc",
  });
  const serviciosPerPage = 5;

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
        .eq("baja", false);

      if (!mostrarTodos && clienteId) {
        query = query.eq("idCliente", clienteId);
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
  }, [mostrarTodos, clienteId]);

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
    setCurrentPage(1);
  }, [searchQuery, servicios]);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });

    const sortedData = [...filteredServicios].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredServicios(sortedData);
  };

  const handleAdd = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (servicio) => {
    setEditingService({
      ...servicio,
      clienteNombre: servicio.cliente.nombre,
      clienteApellido: servicio.cliente.apellido,
      clienteDni: servicio.cliente.dni,
    });
    setShowModal(true);
  };

  const handleViewDetails = (servicio) => {
    setModalDetails(servicio);
  };

  const handleDelete = async (idServicio) => {
    if (!window.confirm("¿Estás seguro de eliminar este servicio?")) return;

    try {
      const { error } = await supabase
        .from("servicio")
        .update({ baja: true })
        .eq("idServicio", idServicio);

      if (error) throw new Error("No se pudo eliminar el servicio.");

      setNotification({
        type: "success",
        message: "Servicio eliminado correctamente.",
      });
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
          servicio.idServicio === idServicio
            ? { ...servicio, estado: nuevoEstado }
            : servicio
        )
      );
      setNotification({
        type: "success",
        message: "Estado actualizado correctamente.",
      });
    } catch (err) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const indexOfLastServicio = currentPage * serviciosPerPage;
  const indexOfFirstServicio = indexOfLastServicio - serviciosPerPage;
  const currentServicios = filteredServicios.slice(
    indexOfFirstServicio,
    indexOfLastServicio
  );

  const totalPages = Math.ceil(filteredServicios.length / serviciosPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      <NavMenu />
      <h1 className="text-3xl font-bold text-center my-6 flex items-center justify-center space-x-2">
        <FontAwesomeIcon icon={faClipboardList} className="text-green-500" />
        <span>Gestión de Servicios</span>
      </h1>

      {notification && (
        <div className="alert alert-info shadow-lg mb-4 max-w-lg mx-auto">
          <div>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={mostrarTodos}
            onChange={(e) => setMostrarTodos(e.target.checked)}
          />
          <span>
            {mostrarTodos
              ? "Ver Todos los Servicios"
              : "Ver Servicios del Cliente"}
          </span>
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
        <button
          onClick={handleAdd}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      <TablaServicios
        servicios={currentServicios}
        onSort={handleSort}
        onViewDetails={handleViewDetails}
        onChangeState={cambiarEstado}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onGeneratePDF={generarYEnviarPDF}
        sortConfig={sortConfig}
      />

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
              setNotification={setNotification}
            />
          </div>
        </div>
      )}

      {modalDetails && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-xl font-bold mb-4">Detalles del Servicio</h2>
            <p>
              <strong>Detalle:</strong> {modalDetails.detalle}
            </p>
            <p>
              <strong>Cliente:</strong> {modalDetails.cliente.nombre}{" "}
              {modalDetails.cliente.apellido}
            </p>
            <p>
              <strong>Teléfono:</strong> {modalDetails.cliente.telefono}
            </p>
            <p>
              <strong>Fecha Ingreso:</strong>{" "}
              {modalDetails.fecha_in}
            </p>
            <p>
              <strong>Fecha Estimada:</strong>{" "}
              {modalDetails.fecha_es}
            </p>
            <p>
              <strong>Costo:</strong> ${modalDetails.costo}
            </p>
            <p>
              <strong>Estado:</strong> {modalDetails.estado}
            </p>
            <div className="modal-action">
              <button
                onClick={() => setModalDetails(null)}
                className="btn btn-sm btn-ghost"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicios;
