import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import ClienteForm from "../componentes/ClienteForm";
import NavMenu from "../componentes/NavMenu";

const Clientes = () => {
  const [clientes, setClientes] = useState([]); // Lista de clientes
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [clientesPerPage] = useState(5); // Cantidad de clientes por página

  // Función para obtener clientes desde Supabase
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

  // Función para eliminar cliente (actualizar campo `baja` en Supabase)
  const eliminarCliente = async (id) => {
    const { error } = await supabase
      .from("cliente")
      .update({ baja: true })
      .eq("id", id);
    if (error) {
      console.error("Error al eliminar cliente:", error.message);
    } else {
      fetchClientes(); // Recargar la lista de clientes
    }
  };

  // Efecto para cargar clientes al inicializar el componente
  useEffect(() => {
    fetchClientes();
  }, []);

  // ** Lógica para la paginación **
  const indexOfLastCliente = currentPage * clientesPerPage; // Último índice del cliente en la página actual
  const indexOfFirstCliente = indexOfLastCliente - clientesPerPage; // Primer índice del cliente en la página actual
  const currentClientes = clientes.slice(indexOfFirstCliente, indexOfLastCliente); // Clientes en la página actual

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generar botones para la paginación
  const totalPages = Math.ceil(clientes.length / clientesPerPage); // Total de páginas
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (

    <div className="p-6 bg-base-100 min-h-screen ">
      <NavMenu />
      <h1 className="text-3xl font-bold text-center my-4">Gestión de Clientes</h1>

      {/* Formulario para agregar clientes */}
      <div className="card bg-base-200 shadow-xl p-4 mb-6">
        <ClienteForm fetchClientes={fetchClientes} />
      </div>

      {/* Lista de clientes */}
      <div className="card bg-base-200 shadow-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Lista de Clientes</h2>
        <ul className="list-none space-y-2">
          {currentClientes.map((cliente) => (
            <li
              key={cliente.id}
              className="flex justify-between items-center bg-base-100 p-3 rounded-lg shadow-md hover:bg-base-300 transition"
            >
              <span>
                {cliente.nombre} {cliente.apellido} - {cliente.dni}
              </span>
              <button
                onClick={() => eliminarCliente(cliente.id)}
                className="btn btn-error btn-sm"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Paginador */}
      <div className="mt-6 flex justify-center items-center space-x-2">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`btn btn-sm ${
              currentPage === number ? "btn-active" : ""
            }`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Clientes;
