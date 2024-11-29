import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

const ClienteForm = ({ fetchClientes, cliente, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de envío
  const [successMessage, setSuccessMessage] = useState(""); // Mensaje de éxito

  useEffect(() => {
    if (cliente) {
      setFormData(cliente); // Rellenar datos al editar
    } else {
      setFormData({ nombre: "", apellido: "", dni: "", telefono: "" }); // Limpiar datos al crear
    }
  }, [cliente]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Mostrar estado de envío
    try {
      if (cliente) {
        // Editar cliente
        console.log("Actualizando cliente con datos:", formData);
        const { error } = await supabase
          .from("cliente")
          .update({
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            telefono: formData.telefono,
          })
          .eq("id", cliente.id);
        if (error) throw error;
        setSuccessMessage("Cliente actualizado correctamente.");
      } else {
        // Crear nuevo cliente
        console.log("Creando nuevo cliente con datos:", formData);
        const { error } = await supabase.from("cliente").insert([formData]);
        if (error) throw error;
        setSuccessMessage("Cliente creado correctamente.");
      }
      fetchClientes(); // Actualizar lista
      setTimeout(() => {
        onClose(); // Cerrar formulario después de un pequeño delay
      }, 1000);
    } catch (error) {
      console.error("Error al guardar cliente:", error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Finalizar estado de envío
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Nombre</span>
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre del cliente"
          className="input input-bordered"
          required
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Apellido</span>
        </label>
        <input
          type="text"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          placeholder="Apellido del cliente"
          className="input input-bordered"
          required
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">DNI</span>
        </label>
        <input
          type="text"
          name="dni"
          value={formData.dni}
          onChange={handleChange}
          placeholder="DNI del cliente"
          className="input input-bordered"
          required
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Teléfono</span>
        </label>
        <input
          type="text"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="Teléfono del cliente"
          className="input input-bordered"
          required
        />
      </div>
      {/* Mensaje de éxito */}
      {successMessage && (
        <p className="text-green-500 font-semibold">{successMessage}</p>
      )}
      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
        >
          {cliente ? "Guardar Cambios" : "Agregar Cliente"}
        </button>
      </div>
    </form>
  );
};

export default ClienteForm;
