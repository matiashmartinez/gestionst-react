import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const ServicioForm = ({ fetchServicios }) => {
  const [clientes, setClientes] = useState([]); // Lista completa de clientes
  const [searchQuery, setSearchQuery] = useState(""); // Filtro de búsqueda
  const [formData, setFormData] = useState({
    fecha_in: new Date().toISOString().split("T")[0], // Fecha actual
    fecha_es: "",
    detalle: "",
    costo: "",
    num_factura: "",
    idCliente: "",
  });

  // Estados para el paginador
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesPerPage] = useState(5); // Clientes por página

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("cliente")
        .select("id, dni, nombre, apellido, created_at")
        .eq("baja", false)
        .order("created_at", { ascending: false }); // Orden por fecha de creación descendente

      if (error) {
        console.error("Error al cargar clientes:", error.message);
      } else {
        setClientes(data);
      }
    };

    fetchClientes();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.idCliente) {
      alert("Por favor, selecciona un cliente.");
      return;
    }
    const { error } = await supabase.from("servicio").insert([formData]);
    if (error) {
      console.error("Error al agregar servicio:", error.message);
    } else {
      fetchServicios();
      setFormData({
        fecha_in: new Date().toISOString().split("T")[0], // Restablecer fecha de inicio
        fecha_es: "",
        detalle: "",
        costo: "",
        num_factura: "",
        idCliente: "",
      });
    }
  };

  // Filtrar clientes por nombre, apellido o DNI
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.dni.includes(searchQuery)
  );

  // Lógica del paginador
  const indexOfLastCliente = currentPage * clientesPerPage;
  const indexOfFirstCliente = indexOfLastCliente - clientesPerPage;
  const currentClientes = filteredClientes.slice(
    indexOfFirstCliente,
    indexOfLastCliente
  );

  const totalPages = Math.ceil(filteredClientes.length / clientesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <form
      onSubmit={handleSubmit}
      className="card bg-base-200 shadow-lg p-6 max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Agregar Servicio</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Fecha de Inicio</span>
          </label>
          <input
            type="date"
            name="fecha_in"
            value={formData.fecha_in}
            onChange={handleChange}
            className="input input-bordered"
            readOnly
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Fecha de Entrega</span>
          </label>
          <input
            type="date"
            name="fecha_es"
            value={formData.fecha_es}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>

        <div className="form-control col-span-2">
          <label className="label">
            <span className="label-text">Detalle</span>
          </label>
          <textarea
            name="detalle"
            value={formData.detalle}
            onChange={handleChange}
            placeholder="Detalle del servicio"
            className="textarea textarea-bordered"
            required
          ></textarea>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Costo</span>
          </label>
          <input
            type="text"
            name="costo"
            value={formData.costo}
            onChange={handleChange}
            placeholder="Costo del servicio"
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Número de Factura</span>
          </label>
          <input
            type="text"
            name="num_factura"
            value={formData.num_factura}
            onChange={handleChange}
            placeholder="Número de factura"
            className="input input-bordered"
          />
        </div>
      </div>

      {/* Buscador y Tabla de Clientes */}
      <div className="form-control mt-6">
        <label className="label">
          <span className="label-text">Buscar Cliente</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
          <span className="absolute top-2 left-3 text-gray-500">
            <i className="fas fa-search"></i>
          </span>
        </div>
      </div>

      {/* Tabla para seleccionar cliente */}
      <div className="overflow-x-auto mt-4">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {currentClientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nombre}</td>
                <td>{cliente.apellido}</td>
                <td>{cliente.dni}</td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, idCliente: cliente.id })
                    }
                    className={`btn btn-sm ${
                      formData.idCliente === cliente.id
                        ? "btn-success"
                        : "btn-primary"
                    }`}
                  >
                    {formData.idCliente === cliente.id
                      ? "Seleccionado"
                      : "Seleccionar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginador */}
      <div className="mt-4 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
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

      <button type="submit" className="btn btn-primary w-full mt-6">
        Agregar Servicio
      </button>
    </form>
  );
};

export default ServicioForm;
