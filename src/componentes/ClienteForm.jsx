import { useState } from 'react';
import { supabase } from '../../supabaseClient';

const ClienteForm = ({ fetchClientes }) => {
  const [formData, setFormData] = useState({
    dni: '',
    apellido: '',
    nombre: '',
    telefono: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('cliente').insert([formData]);
    if (error) {
      console.error('Error al agregar cliente:', error.message);
    } else {
      fetchClientes();
      setFormData({ dni: '', apellido: '', nombre: '', telefono: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cliente-form">
      <input
        type="text"
        name="dni"
        placeholder="DNI"
        value={formData.dni}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="apellido"
        placeholder="Apellido"
        value={formData.apellido}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="telefono"
        placeholder="Teléfono"
        value={formData.telefono}
        onChange={handleChange}
        required
      />
      <button type="submit">Agregar Cliente</button>
    </form>
  );
};

export default ClienteForm;
