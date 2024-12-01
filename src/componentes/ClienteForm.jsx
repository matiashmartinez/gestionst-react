/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

const ClienteForm = ({ fetchClientes, cliente, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (cliente) {
      setFormData(cliente);
    } else {
      setFormData({ nombre: "", apellido: "", dni: "", telefono: "" });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validaciones específicas
    if (name === "dni" || name === "telefono") {
      if (!/^\d*$/.test(value)) return; // Permitir solo números
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = async () => {
    const { nombre, apellido, dni, telefono } = formData;

    if (!nombre || !apellido || !dni || !telefono) {
      setErrorMessage("Todos los campos son obligatorios.");
      return false;
    }

    if (dni.length < 7 || dni.length > 10) {
      setErrorMessage("El DNI debe tener entre 7 y 10 números.");
      return false;
    }

    if (telefono.length < 8 || telefono.length > 15) {
      setErrorMessage("El teléfono debe tener entre 8 y 15 números.");
      return false;
    }

    // Verificar si el DNI ya existe en la base de datos
    const { data, error } = await supabase
      .from("cliente")
      .select("id")
      .eq("dni", dni);

    if (error) {
      setErrorMessage("Error al validar el DNI.");
      return false;
    }

    if (data.length > 0 && (!cliente || data[0].id !== cliente.id)) {
      setErrorMessage("El DNI ya está registrado.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isValid = await validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (cliente) {
        // Editar cliente
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
        const { error } = await supabase.from("cliente").insert([formData]);
        if (error) throw error;
        setSuccessMessage("Cliente creado correctamente.");
      }
      fetchClientes();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error al guardar cliente:", error.message);
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
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

      {errorMessage && (
        <p className="text-red-500 font-semibold">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="text-green-500 font-semibold">{successMessage}</p>
      )}

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
