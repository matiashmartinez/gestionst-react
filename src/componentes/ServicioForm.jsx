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

  useEffect(() => {
    if (initialData) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        ...initialData,
        fecha_in: new Date().toISOString().split("T")[0],
      }));
    }
  }, [initialData]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        let query = supabase
          .from("cliente")
          .select("id, dni, nombre, apellido, created_at")
          .eq("baja", false);

        if (searchQuery.trim()) {
          const terms = searchQuery.trim().toLowerCase().split(/\s+/);
          const filters = terms.map(
            (term) =>
              `nombre.ilike.%${term}%` +
              `,apellido.ilike.%${term}%` +
              `,dni.ilike.%${term}%`
          );
          query = query.or(filters.join(","));
        }

        query = query.order("created_at", { ascending: false }).limit(5); // Limitar a 10 resultados

        const { data, error } = await query;

        if (error) throw error;

        setClientes(data);
      } catch (error) {
        console.error("Error al buscar clientes:", error.message);
      }
    };

    fetchClientes();
  }, [searchQuery]);

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
        const { error } = await supabase
          .from("servicio")
          .update({
            fecha_es: formData.fecha_es,
            detalle: formData.detalle,
            costo: formData.costo,
            num_factura: formData.num_factura,
            idCliente: formData.idCliente,
            estado: formData.estado,
            fecha_in: new Date().toISOString().split("T")[0],
          })
          .eq("idServicio", initialData.idServicio);

        if (error) throw new Error("Error al editar el servicio.");
      } else {
        const { error } = await supabase.from("servicio").insert([formData]);
        if (error) throw new Error("Error al agregar el servicio.");
      }

      setNotification({ type: "success", message: "Servicio guardado exitosamente." });
      fetchServicios();
      onClose();
    } catch (error) {
      console.error("Error al guardar servicio:", error.message);
      setNotification({ type: "error", message: `Error: ${error.message}` });
    }
  };

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
          readOnly
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
            <div className="overflow-y-auto max-h-[200px] mt-2 border border-gray-300 rounded">
              <table className="table w-full text-sm">
                <thead>
                  <tr>
                    <th className="py-1 px-2">Nombre</th>
                    <th className="py-1 px-2">Apellido</th>
                    <th className="py-1 px-2">DNI</th>
                    <th className="py-1 px-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td className="py-1 px-2">{cliente.nombre}</td>
                      <td className="py-1 px-2">{cliente.apellido}</td>
                      <td className="py-1 px-2">{cliente.dni}</td>
                      <td className="py-1 px-2">
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

      <div className="form-control">
        <label className="label">
          <span className="label-text font-bold text-gray-700">Estado</span>
        </label>
        <select
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          className="select select-bordered"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en progreso">En Progreso</option>
          <option value="finalizado">Finalizado</option>
        </select>
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
