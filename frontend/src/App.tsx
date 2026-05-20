import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/home/Home';
// import Cargos from './pages/cargos/Cargos';
import Roles from './pages/roles/Roles';
import BitacoraPage from './pages/bitacora/BitacoraPage';
import Cultivos from './pages/cultivos/Cultivos';
import Animales from './pages/animales/Animales';
import Programas from './pages/programas/Programas';
import Plagas from './pages/plagas/Plagas';
import Enfermedades from './pages/enfermedades/Enfermedades';
import HelpMe from './pages/help/Help';
import Login from './pages/login/Login';
import Solicitudes from './pages/solicitudes/Solicitudes';
import Clientes from './pages/clientes/Clientes';
import Propiedades from './pages/propiedades/Propiedades';
import Empleados from './pages/empleados/Empleados';
import Oficinas from './pages/oficinas/Oficinas';
import Vehiculos from './pages/vehiculos/Vehiculos';


import { ProtectedRoute } from './components/auth/protected-route';
import { PublicRoute } from './components/auth/public-route';
import Error from './pages/error/Error';

import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from './hooks/use-auth';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <TooltipProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path='/' element={<Navigate to="/login" replace />} />
            <Route path='/login' element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path='/home' element={<Layout />}>
              <Route index element={<Home />} />
              {/* <Route path='cargos' element={<Cargos />} /> */}
              <Route path='roles' element={<Roles />} />
              <Route path='bitacora' element={<BitacoraPage />} />
              <Route path='cultivos' element={<Cultivos />} />
              <Route path='animales' element={<Animales />} />
              <Route path='programas' element={<Programas />} />
              <Route path='plagas' element={<Plagas />} />
              <Route path='enfermedades' element={<Enfermedades />} />
              <Route path='solicitudes' element={<Solicitudes />} />
              <Route path='clientes' element={<Clientes />} />
              <Route path='propiedades' element={<Propiedades />} />
              <Route path='empleados' element={<Empleados />} />
              <Route path='oficinas' element={<Oficinas />} />
              <Route path='vehiculos' element={<Vehiculos />} />
              <Route path='help' element={<HelpMe />} />

            </Route>
          </Route>

          <Route path='*' element={<Error />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  )
}

export default App
