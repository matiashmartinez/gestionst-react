import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import ClienteForm from "../componentes/ClienteForm";
import NavMenu from "../componentes/NavMenu";

const Clientes = () => {
  const [clientes, setClientes] = useState([]); // Lista de clientes
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [clientesPerPage] = useState(5); // Clientes por página

  // Función para cargar clientes desde Supabase
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

  // Función para eliminar cliente
  const eliminarCliente = async (id) => {
    const { error } = await supabase
      .from("cliente")
      .update({ baja: true })
      .eq("id", id);
    if (error) {
      console.error("Error al eliminar cliente:", error.message);
    } else {
      fetchClientes();
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Lógica para la paginación
  const indexOfLastCliente = currentPage * clientesPerPage;
  const indexOfFirstCliente = indexOfLastCliente - clientesPerPage;
  const currentClientes = clientes.slice(indexOfFirstCliente, indexOfLastCliente);

  const totalPages = Math.ceil(clientes.length / clientesPerPage); // Total de páginas
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginate = (pageNumber) => setCurrentPage(pageNumber); // Cambiar de página

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      <NavMenu />
      <h1 className="text-3xl font-bold text-center my-6">Gestión de Clientes</h1>

      {/* Formulario para agregar clientes */}
      <div className="card bg-base-200 shadow-lg p-4 mb-6 max-w-4xl mx-auto">
        <ClienteForm fetchClientes={fetchClientes} />
      </div>

      {/* Lista de clientes */}
      <div className="card bg-base-200 shadow-lg p-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Lista de Clientes</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Nombre</th>
                <th className="text-left">Apellido</th>
                <th className="text-left">DNI</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentClientes.map((cliente) => (
                <tr key={cliente.id} className="hover">
                  <td>{cliente.nombre}</td>
                  <td>{cliente.apellido}</td>
                  <td>{cliente.dni}</td>
                  <td className="text-center">
                    <button
                      onClick={() => eliminarCliente(cliente.id)}
                      className="btn btn-error btn-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginador */}
      <div className="mt-6 flex justify-center items-center space-x-2">
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
    </div>
  );
};

export default Clientes;
