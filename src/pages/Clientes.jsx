import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faEdit, faTrash, faClock, faCheckCircle, faClipboardList, faPlus } from "@fortawesome/free-solid-svg-icons";
import ClienteForm from "../componentes/ClienteForm";
import NavMenu from "../componentes/NavMenu";
import { useNavigate } from "react-router-dom";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();

  const fetchClientes = async () => {
    try {
      const { data: clientesData, error: clientesError } = await supabase
        .from("cliente")
        .select("id, nombre, apellido, dni, telefono")
        .eq("baja", false)
        .order("apellido", { ascending: true });

      if (clientesError) throw new Error("Error al cargar clientes.");

      const { data: serviciosData, error: serviciosError } = await supabase
        .from("servicio")
        .select("idCliente, estado");

      if (serviciosError) throw new Error("Error al cargar servicios.");

      const clientesConServicios = clientesData.map((cliente) => {
        const serviciosCliente = serviciosData.filter(
          (servicio) => servicio.idCliente === cliente.id
        );
        return {
          ...cliente,
          totalServicios: serviciosCliente.length,
          serviciosPendientes: serviciosCliente.filter(
            (servicio) => servicio.estado === "pendiente"
          ).length,
          serviciosFinalizados: serviciosCliente.filter(
            (servicio) => servicio.estado === "finalizado"
          ).length,
        };
      });

      setClientes(clientesConServicios);
      setFilteredClientes(clientesConServicios);
    } catch (error) {
      console.error(error.message);
      setNotification({ type: "error", message: error.message });
    }
  };

  const eliminarCliente = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      const { error } = await supabase
        .from("cliente")
        .update({ baja: true })
        .eq("id", id);

      if (error) throw new Error("Error al eliminar cliente.");
      setNotification({ type: "success", message: "Cliente eliminado correctamente." });
      fetchClientes();
    } catch (error) {
      setNotification({ type: "error", message: error.message });
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingCliente(null);
    setShowModal(false);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtrados = clientes.filter((cliente) => {
      const nombre = cliente.nombre?.toLowerCase() || "";
      const apellido = cliente.apellido?.toLowerCase() || "";
      const dni = cliente.dni || "";
      const telefono = cliente.telefono || "";

      return (
        nombre.includes(query) ||
        apellido.includes(query) ||
        dni.includes(query) ||
        telefono.includes(query)
      );
    });
    setFilteredClientes(filtrados);
    setCurrentPage(1);
  }, [searchQuery, clientes]);

  const indexOfLastCliente = currentPage * clientesPerPage;
  const indexOfFirstCliente = indexOfLastCliente - clientesPerPage;
  const currentClientes = filteredClientes.slice(indexOfFirstCliente, indexOfLastCliente);

  const totalPages = Math.ceil(filteredClientes.length / clientesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      <NavMenu />
      <h1 className="text-3xl font-bold text-center my-6 flex items-center justify-center space-x-2">
        <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
        <span>Gestión de Clientes</span>
      </h1>

      {notification && (
        <div
          className={`alert ${notification.type === "success" ? "alert-success" : "alert-error"
            } shadow-lg`}
        >
          <div>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center mb-6 space-x-4">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          className="input input-bordered w-full max-w-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      <div className="card bg-base-200 shadow-lg p-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Lista de Clientes</h2>
        <div className="overflow-hidden">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Servicios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentClientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.apellido}</td>
                  <td>{cliente.dni}</td>
                  <td>{cliente.telefono}</td>
                  <td>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 tooltip" data-tip="Servicios pendientes">
                        <FontAwesomeIcon icon={faClock} className="text-yellow-500" />
                        <span>{cliente.serviciosPendientes}</span>
                      </div>
                      <div className="flex items-center space-x-1 tooltip" data-tip="Servicios finalizados">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                        <span>{cliente.serviciosFinalizados}</span>
                      </div>
                    </div>
                  </td>

                  <td className="flex space-x-2 justify-center">
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="tooltip"
                      data-tip="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-yellow-500" />
                    </button>
                    <button
                      onClick={() => eliminarCliente(cliente.id)}
                      className="tooltip"
                      data-tip="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                    </button>
                    <button
                      onClick={() => navigate(`/servicios/${cliente.id}`)}
                      className="tooltip"
                      data-tip="Ver Servicios"
                    >
                      <FontAwesomeIcon icon={faClipboardList} className="text-blue-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            <ClienteForm
              fetchClientes={fetchClientes}
              cliente={editingCliente}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
