import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// Crear el contexto
const AuthContext = createContext();

// Hook para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor de contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener el usuario al cargar la aplicación
    const session = supabase.auth.getSession();
    setUser(session?.data?.user || null);
    setLoading(false);

    // Escuchar cambios de autenticación
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => listener?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
