import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Clientes from "./pages/Clientes";
import Servicios from "./pages/Servicios";

import ProtectedRoute from "./ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
    
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/servicios"
          element={
            <ProtectedRoute>
              <Servicios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/servicios/:clienteId"
          element={
            <ProtectedRoute>
              <Servicios />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
