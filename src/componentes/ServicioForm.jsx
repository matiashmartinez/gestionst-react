import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import PropTypes from "prop-types";

const ServicioForm = ({ fetchServicios, onClose, initialData, setNotification }) => {
  const [clientes, setClientes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    fecha_in: new Date().toISOString().split("T")[0], // Fecha actual por defecto
    fecha_es: "",
    detalle: "",
    costo: "",
    num_factura: "",
    idCliente: "",
    estado: "pendiente",
  });

  // Actualizar formData al recibir initialData (edición)
  useEffect(() => {
    if (initialData) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        ...initialData,
        fecha_in: new Date().toISOString().split("T")[0], // Actualizamos a la fecha actual al editar
      }));
    }
  }, [initialData]);

  // Cargar lista de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from("cliente")
        .select("id, dni, nombre, apellido")
        .eq("baja", false)
        .order("apellido", { ascending: true });

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
      setNotification({ type: "error", message: "Por favor, selecciona un cliente." });
      return;
    }

    try {
      if (initialData) {
        // Editar servicio
        const { error } = await supabase
          .from("servicio")
          .update({
            fecha_es: formData.fecha_es,
            detalle: formData.detalle,
            costo: formData.costo,
            num_factura: formData.num_factura,
            idCliente: formData.idCliente,
            estado: formData.estado,
            fecha_in: new Date().toISOString().split("T")[0], // Fecha actual al editar
          })
          .eq("idServicio", initialData.idServicio);

        if (error) throw new Error("Error al editar el servicio.");
      } else {
        // Agregar servicio
        const { error } = await supabase.from("servicio").insert([formData]);

        if (error) throw new Error("Error al agregar el servicio.");
      }

      setNotification({ type: "success", message: "Servicio guardado exitosamente." });
      fetchServicios();
      onClose(); // Cerrar modal tras éxito
    } catch (error) {
      console.error("Error al guardar servicio:", error.message);
      setNotification({ type: "error", message: `Error: ${error.message}` });
    }
  };

  // Filtrar clientes por búsqueda
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

      <div className="form-control">
        <label className="label">
          <span className="label-text font-bold text-gray-700">Fecha de Ingreso</span>
        </label>
        <input
          type="date"
          name="fecha_in"
          value={formData.fecha_in || ""}
          className="input input-bordered bg-gray-100 cursor-not-allowed"
          readOnly // Campo de solo lectura
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-bold text-gray-700">Fecha de Entrega</span>
        </label>
        <input
          type="date"
          name="fecha_es"
          value={formData.fecha_es}
          onChange={handleChange}
          className="input input-bordered"
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-bold text-gray-700">Detalle</span>
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
          <span className="label-text font-bold text-gray-700">Costo</span>
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
          <span className="label-text font-bold text-gray-700">Número de Factura</span>
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
          <span className="label-text font-bold text-gray-700">Cliente</span>
        </label>
        {initialData ? (
          <div className="bg-gray-100/80 text-gray-600 font-semibold cursor-not-allowed p-2 rounded">
          {initialData.clienteNombre} {initialData.clienteApellido} - {initialData.clienteDni}
        </div>
        ) : (
          <>
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
                            formData.idCliente === cliente.id ? "btn-success" : "btn-primary"
                          }`}
                        >
                          {formData.idCliente === cliente.id ? "Seleccionado" : "Seleccionar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
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

ServicioForm.propTypes = {
  fetchServicios: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  setNotification: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    idServicio: PropTypes.number,
    fecha_in: PropTypes.string,
    fecha_es: PropTypes.string,
    detalle: PropTypes.string,
    costo: PropTypes.string,
    num_factura: PropTypes.string,
    idCliente: PropTypes.number,
    clienteNombre: PropTypes.string,
    clienteApellido: PropTypes.string,
    clienteDni: PropTypes.string,
    estado: PropTypes.string,
  }),
};

export default ServicioForm;
