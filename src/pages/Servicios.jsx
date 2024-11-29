import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import ServicioForm from "../componentes/ServicioForm";

const Servicios = () => {
  const [servicios, setServicios] = useState([]); // Lista completa de servicios
  const [searchQuery, setSearchQuery] = useState(""); // Buscador por nombre, apellido o DNI
  const [fechaFiltro, setFechaFiltro] = useState(""); // Filtro por fecha
  const [estadoFiltro, setEstadoFiltro] = useState(""); // Filtro por estado (e.g., Pendiente)

  // Obtener servicios desde Supabase
  const fetchServicios = async () => {
    const { data, error } = await supabase
      .from("servicio")
      .select("*, cliente(id, dni, nombre, apellido)")
      .eq("baja", false);

    if (error) {
      console.error("Error al cargar servicios:", error.message);
    } else {
      setServicios(data);
    }
  };

  // Eliminar servicio
  const eliminarServicio = async (id) => {
    const { error } = await supabase
      .from("servicio")
      .update({ baja: true })
      .eq("id", id);

    if (error) {
      console.error("Error al eliminar servicio:", error.message);
    } else {
      fetchServicios();
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  // Filtrar servicios por múltiples criterios
  const filteredServicios = servicios.filter((servicio) => {
    const matchesSearch =
      servicio.cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      servicio.cliente.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      servicio.cliente.dni.includes(searchQuery); // Filtrar por nombre, apellido o DNI

    const matchesFecha = fechaFiltro
      ? servicio.fecha_ingreso && servicio.fecha_ingreso.startsWith(fechaFiltro)
      : true; // Filtrar por fecha si está seleccionada

    const matchesEstado = estadoFiltro
      ? servicio.estado.toLowerCase() === estadoFiltro.toLowerCase()
      : true; // Filtrar por estado si está seleccionado

    return matchesSearch && matchesFecha && matchesEstado;
  });

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center my-6">Gestión de Servicios</h1>

      {/* Formulario para agregar servicios */}
      <div className="card bg-base-200 shadow-lg p-4 mb-6 max-w-4xl mx-auto">
        <ServicioForm fetchServicios={fetchServicios} />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
        {/* Buscador por nombre, apellido o DNI */}
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full"
        />

        {/* Filtro por fecha */}
        <input
          type="date"
          value={fechaFiltro}
          onChange={(e) => setFechaFiltro(e.target.value)}
          className="input input-bordered w-full"
        />

        {/* Filtro por estado */}
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      {/* Lista de servicios */}
      <div className="card bg-base-200 shadow-lg p-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Lista de Servicios</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Detalle</th>
                <th className="text-left">Costo</th>
                <th className="text-left">Cliente</th>
                <th className="text-left">Fecha Ingreso</th>
                <th className="text-left">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredServicios.map((servicio) => (
                <tr key={servicio.id} className="hover">
                  <td>{servicio.detalle}</td>
                  <td>${servicio.costo}</td>
                  <td>
                    {servicio.cliente.nombre} {servicio.cliente.apellido} ({servicio.cliente.dni})
                  </td>
                  <td>{servicio.fecha_ingreso || "Sin fecha"}</td>
                  <td>{servicio.estado || "Sin estado"}</td>
                  <td className="text-center">
                    <button
                      onClick={() => eliminarServicio(servicio.id)}
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
    </div>
  );
};

export default Servicios;
