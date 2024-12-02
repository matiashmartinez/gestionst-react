/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setIsAuthenticated(true); // Usuario autenticado
        } else {
          setIsAuthenticated(false); // No autenticado
        }
      } catch (error) {
        console.error("Error verificando la sesión:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <div>Cargando...</div>; // Mostrar un spinner o mensaje de carga
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />; // Redirigir al login si no está autenticado
  }

  return children;
};

export default ProtectedRoute;
