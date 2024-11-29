import { useState } from "react";
import { supabase } from "../../supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/clientes";
    }
  };

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
        <button type="submit" className="btn btn-primary w-full">
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
