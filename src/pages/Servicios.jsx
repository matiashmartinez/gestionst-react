import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import ServicioForm from '../componentes/ServicioForm';

const Servicios = () => {
  const [servicios, setServicios] = useState([]);

  const fetchServicios = async () => {
    const { data, error } = await supabase
      .from('servicio')
      .select('*, cliente(id, nombre, apellido)')
      .eq('baja', false);
    if (error) {
      console.error('Error al cargar servicios:', error.message);
    } else {
      setServicios(data);
    }
  };

  const eliminarServicio = async (id) => {
    const { error } = await supabase
      .from('servicio')
      .update({ baja: true })
      .eq('id', id);
    if (error) {
      console.error('Error al eliminar servicio:', error.message);
    } else {
      fetchServicios();
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  return (
    <div className="servicios">
      <h1>Gestión de Servicios</h1>
      <ServicioForm fetchServicios={fetchServicios} />
      <ul>
        {servicios.map((servicio) => (
          <li key={servicio.id}>
            {servicio.detalle} - {servicio.costo} - Cliente: {servicio.cliente.nombre} {servicio.cliente.apellido}
            <button onClick={() => eliminarServicio(servicio.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Servicios;
