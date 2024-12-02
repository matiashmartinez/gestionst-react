import { useState } from "react";
import { supabase } from "../../supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0); // Contador de intentos fallidos
  const [isLocked, setIsLocked] = useState(false); // Estado de bloqueo
  const [lockTime, setLockTime] = useState(null); // Tiempo en que el bloqueo termina

  const handleLogin = async (e) => {
    e.preventDefault();

    // Bloqueo temporal si se excede el límite de intentos
    if (isLocked) {
      setError("Demasiados intentos fallidos. Inténtelo más tarde.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginAttempts((prev) => prev + 1); // Incrementar contador
      setError("Credenciales incorrectas. Intentos restantes: " + (5 - loginAttempts - 1));

      // Bloquear el formulario después de 5 intentos fallidos
      if (loginAttempts + 1 >= 5) {
        setIsLocked(true);
        setLockTime(Date.now() + 300000); // Bloquear por 5 minutos
        setError("Demasiados intentos fallidos. Bloqueado por 5 minutos.");
      }
    } else {
      // Restablecer intentos y redirigir
      setLoginAttempts(0);
      setError("");
      window.location.href = "/clientes"; // Redirige al área protegida
    }
  };

  // Desbloqueo automático después del tiempo establecido
  if (isLocked && lockTime && Date.now() > lockTime) {
    setIsLocked(false);
    setLoginAttempts(0);
    setError(""); // Limpiar errores después del desbloqueo
  }

  return (
    <div className="flex justify-center items-center h-screen bg-base-100">
      <form
        onSubmit={handleLogin}
        className="card bg-base-200 shadow-lg p-6 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Iniciar Sesión</h2>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingrese su email"
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Contraseña</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su contraseña"
            className="input input-bordered w-full"
            required
          />
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {isLocked && (
          <p className="text-red-500 text-center mb-4">
            El formulario está bloqueado temporalmente. Inténtelo más tarde.
          </p>
        )}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLocked} // Deshabilitar el botón durante el bloqueo
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
