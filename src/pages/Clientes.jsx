import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import ClienteForm from "../componentes/ClienteForm";
import NavMenu from "../componentes/NavMenu";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesPerPage] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);

  const navigate = useNavigate();

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from("cliente")
      .select("*")
      .eq("baja", false);

    if (error) {
      console.error("Error al cargar clientes:", error.message);
    } else {
      setClientes(data);
    }
  };

  const eliminarCliente = async (id) => {
    const { error } = await supabase.from("cliente").update({ baja: true }).eq("id", id);
    if (error) {
      console.error("Error al eliminar cliente:", error.message);
    } else {
      fetchClientes();
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

  const indexOfLastCliente = currentPage * clientesPerPage;
  const indexOfFirstCliente = indexOfLastCliente - clientesPerPage;
  const currentClientes = clientes.slice(indexOfFirstCliente, indexOfLastCliente);

  const totalPages = Math.ceil(clientes.length / clientesPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      <NavMenu />
      <h1 className="text-3xl font-bold text-center my-6">Gestión de Clientes</h1>

      <div className="flex justify-end mb-4">
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
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`btn btn-sm ${currentPage === number ? "btn-active" : ""}`}
          >
            {number}
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
