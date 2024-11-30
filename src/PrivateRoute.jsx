/* import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>; // Mostrar un cargando mientras se verifica el estado del usuario
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default PrivateRoute;
 */


import { Navigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const PrivateRoute = ({ children }) => {
  const session = supabase.auth.session();
  return session ? children : <Navigate to="/" />;
};

export default PrivateRoute;