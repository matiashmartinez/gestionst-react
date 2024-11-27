import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const ServicioForm = ({ fetchServicios }) => {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    fecha_in: '',
    fecha_es: '',
    detalle: '',
    costo: '',
    num_factura: '',
    idCliente: '',
  });

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from('cliente')
        .select('id, nombre, apellido')
        .eq('baja', false);
      if (error) console.error('Error al cargar clientes:', error.message);
      else setClientes(data);
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
    const { error } = await supabase.from('servicio').insert([formData]);
    if (error) {
      console.error('Error al agregar servicio:', error.message);
    } else {
      fetchServicios();
      setFormData({
        fecha_in: '',
        fecha_es: '',
        detalle: '',
        costo: '',
        num_factura: '',
        idCliente: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="servicio-form">
      <input
        type="date"
        name="fecha_in"
        placeholder="Fecha de Inicio"
        value={formData.fecha_in}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="fecha_es"
        placeholder="Fecha de Entrega"
        value={formData.fecha_es}
        onChange={handleChange}
      />
      <textarea
        name="detalle"
        placeholder="Detalle"
        value={formData.detalle}
        onChange={handleChange}
        required
      ></textarea>
      <input
        type="text"
        name="costo"
        placeholder="Costo"
        value={formData.costo}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="num_factura"
        placeholder="Número de Factura"
        value={formData.num_factura}
        onChange={handleChange}
        required
      />
      <select
        name="idCliente"
        value={formData.idCliente}
        onChange={handleChange}
        required
      >
        <option value="">Seleccionar Cliente</option>
        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.nombre} {cliente.apellido}
          </option>
        ))}
      </select>
      <button type="submit">Agregar Servicio</button>
    </form>
  );
};

export default ServicioForm;
