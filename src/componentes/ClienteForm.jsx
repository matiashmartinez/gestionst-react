import { useState } from "react";
import { supabase } from "../../supabaseClient";

const ClienteForm = ({ fetchClientes }) => {
  const [formData, setFormData] = useState({
    dni: "",
    apellido: "",
    nombre: "",
    telefono: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("cliente").insert([formData]);
    if (error) {
      console.error("Error al agregar cliente:", error.message);
    } else {
      fetchClientes();
      setFormData({ dni: "", apellido: "", nombre: "", telefono: "" });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-base-100 p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold text-center">Agregar Cliente</h2>

      <div className="form-control">
        <label className="label">
          <span className="label-text">DNI</span>
        </label>
        <input
          type="text"
          name="dni"
          placeholder="Ingrese el DNI"
          value={formData.dni}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Apellido</span>
        </label>
        <input
          type="text"
          name="apellido"
          placeholder="Ingrese el apellido"
          value={formData.apellido}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Nombre</span>
        </label>
        <input
          type="text"
          name="nombre"
          placeholder="Ingrese el nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Teléfono</span>
        </label>
        <input
          type="text"
          name="telefono"
          placeholder="Ingrese el teléfono"
          value={formData.telefono}
          onChange={handleChange}
          required
          className="input input-bordered w-full"
        />
      </div>

      <div className="mt-4">
        <button type="submit" className="btn btn-primary w-full">
          Agregar Cliente
        </button>
      </div>
    </form>
  );
};

export default ClienteForm;
