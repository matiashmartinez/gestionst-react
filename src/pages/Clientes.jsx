import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import ClienteForm from '../componentes/ClienteForm';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('baja', false);
    if (error) {
      console.error('Error al cargar clientes:', error.message);
    } else {
      setClientes(data);
    }
  };

  const eliminarCliente = async (id) => {
    const { error } = await supabase
      .from('cliente')
      .update({ baja: true })
      .eq('id', id);
    if (error) {
      console.error('Error al eliminar cliente:', error.message);
    } else {
      fetchClientes();
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <div className="clientes">
      <h1>Gestión de Clientes</h1>
      <ClienteForm fetchClientes={fetchClientes} />
      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            {cliente.nombre} {cliente.apellido} - {cliente.dni}
            <button onClick={() => eliminarCliente(cliente.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Clientes;
