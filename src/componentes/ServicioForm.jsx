import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const ServicioForm = ({ fetchServicios }) => {
  const [clientes, setClientes] = useState([]); // Lista completa de clientes
  const [searchQuery, setSearchQuery] = useState(""); // Filtro para buscar clientes
  const [formData, setFormData] = useState({
    fecha_in: "",
    fecha_es: "",
    detalle: "",
    costo: "",
    num_factura: "",
    idCliente: "",
  });

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("cliente")
        .select("id, nombre, apellido")
        .eq("baja", false);
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
    const { error } = await supabase.from("servicio").insert([formData]);
    if (error) {
      console.error("Error al agregar servicio:", error.message);
    } else {
      fetchServicios();
      setFormData({
        fecha_in: "",
        fecha_es: "",
        detalle: "",
        costo: "",
        num_factura: "",
        idCliente: "",
      });
    }
  };

  // Filtrar clientes por nombre o apellido
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            required
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

      {/* Buscador y Select de Clientes */}
      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Buscar Cliente</span>
        </label>
        <input
          type="text"
          placeholder="Buscar por nombre o apellido"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered mb-4"
        />
        <select
          name="idCliente"
          value={formData.idCliente}
          onChange={handleChange}
          className="select select-bordered"
          required
        >
          <option value="">Seleccionar Cliente</option>
          {filteredClientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre} {cliente.apellido}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary w-full mt-4">
        Agregar Servicio
      </button>
    </form>
  );
};

export default ServicioForm;
