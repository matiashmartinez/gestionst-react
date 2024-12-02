import { createClient } from '@supabase/supabase-js';

// Usa las variables de entorno definidas en .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
    persistSession: true,  // Habilita persistencia de la sesión
    autoRefreshToken: true,  // Auto-renueva el token cuando expire
});
