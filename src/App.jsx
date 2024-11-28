import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Servicios from './pages/Servicios';
import { useEffect } from 'react';

function App() {



  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/servicios" element={<Servicios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
