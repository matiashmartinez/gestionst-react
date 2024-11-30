import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

const ServicioForm = ({ fetchServicios, onClose, initialData }) => {
  const [clientes, setClientes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    fecha_in: new Date().toISOString().split("T")[0],
    fecha_es: "",
    detalle: "",
    costo: "",
    num_factura: "",
    idCliente: "",
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("cliente")
        .select("id, dni, nombre, apellido, created_at")
        .eq("baja", false)
        .order("created_at", { ascending: false });

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
      setNotification("Por favor, selecciona un cliente.");
      return;
    }
    try {
      if (initialData) {
        // Editar servicio
        const { error } = await supabase
          .from("servicio")
          .update(formData)
          .eq("id", initialData.id);
        if (error) throw new Error(error.message);
      } else {
        // Agregar servicio
        const { error } = await supabase.from("servicio").insert([formData]);
        if (error) throw new Error(error.message);
      }
      setNotification("Servicio guardado exitosamente.");
      fetchServicios();
      onClose(); // Cerrar modal tras éxito
    } catch (error) {
      setNotification(`Error: ${error.message}`);
      console.error(error.message);
    }
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.dni.includes(searchQuery)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold mb-4 text-center">
        {initialData ? "Editar Servicio" : "Agregar Servicio"}
      </h3>
      {notification && (
        <div className="alert alert-info shadow-lg">
          <div>
            <span>{notification}</span>
          </div>
        </div>
      )}

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

      <div className="form-control">
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

      <div className="form-control">
        <label className="label">
          <span className="label-text">Seleccionar Cliente</span>
        </label>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered"
        />
        <div className="overflow-x-auto mt-2">
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
              {filteredClientes.map((cliente) => (
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
      </div>

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onClose} className="btn btn-ghost">
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData ? "Guardar Cambios" : "Agregar Servicio"}
        </button>
      </div>
    </form>
  );
};

export default ServicioForm;
