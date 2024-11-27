import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Servicios from './pages/Servicios';
import NavMenu from './componentes/NavMenu';

function App() {
  return (
    <BrowserRouter>
      <NavMenu />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/servicios" element={<Servicios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
