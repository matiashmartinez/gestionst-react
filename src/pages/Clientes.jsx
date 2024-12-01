import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import ClienteForm from "../componentes/ClienteForm";
import NavMenu from "../componentes/NavMenu";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesPerPage] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("cliente")
        .select("*")
        .eq("baja", false)
        .order("apellido", { ascending: true });

      if (error) throw new Error("Error al cargar clientes.");
      setClientes(data);
      setFilteredClientes(data);
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
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingCliente(null);
    setShowForm(false);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
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
    setCurrentPage(1); // Reiniciar a la primera página tras el filtro
  }, [searchQuery, clientes]);

  const indexOfLastCliente = currentPage * clientesPerPage;
  const indexOfFirstCliente = indexOfLastCliente - clientesPerPage;
  const currentClientes = filteredClientes.slice(indexOfFirstCliente, indexOfLastCliente);

  const totalPages = Math.ceil(filteredClientes.length / clientesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      <NavMenu />
      <h1 className="text-3xl font-bold text-center my-6">Gestión de Clientes</h1>

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
        <input
          type="text"
          placeholder="Buscar por nombre, apellido, DNI o teléfono"
          className="input input-bordered w-full max-w-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={() => {
            setEditingCliente(null);
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          Nuevo Cliente
        </button>
      </div>

      <div className="card bg-base-200 shadow-lg p-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Lista de Clientes</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Teléfono</th>
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
                  <td className="space-x-2">
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="btn btn-warning btn-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarCliente(cliente.id)}
                      className="btn btn-error btn-xs"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => navigate(`/servicios/${cliente.id}`)}
                      className="btn btn-info btn-xs"
                    >
                      Servicios
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

      {showForm && (
        <div className="card bg-base-200 shadow-lg p-4 mt-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">
            {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <ClienteForm
            fetchClientes={fetchClientes}
            cliente={editingCliente}
            onClose={handleCloseForm}
          />
        </div>
      )}
    </div>
  );
};

export default Clientes;
