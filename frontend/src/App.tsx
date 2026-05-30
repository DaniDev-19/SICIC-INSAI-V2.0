import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/home/Home';
import Roles from './pages/roles/Roles';
import Usuarios from './pages/usuarios/Usuarios';
import Instancias from './pages/instancias/Instancias';
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
import Planificaciones from './pages/planificaciones/Planificaciones';
import Inspecciones from './pages/inspecciones/Inspecciones';
import InspeccionesSilos from './pages/inspecciones-silos/InspeccionesSilos';

import { ProtectedRoute } from './components/auth/protected-route';
import { PublicRoute } from './components/auth/public-route';
import { PermissionRoute } from './components/auth/permission-route';
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
              <Route element={<PermissionRoute screen="home" />}>
                <Route index element={<Home />} />
              </Route>
              <Route element={<PermissionRoute screen="roles" />}>
                <Route path='roles' element={<Roles />} />
              </Route>
              <Route element={<PermissionRoute screen="usuarios" />}>
                <Route path='usuarios' element={<Usuarios />} />
              </Route>
              <Route element={<PermissionRoute screen="instancias" />}>
                <Route path='instancias' element={<Instancias />} />
              </Route>
              <Route element={<PermissionRoute screen="bitacora" />}>
                <Route path='bitacora' element={<BitacoraPage />} />
              </Route>
              <Route element={<PermissionRoute screen="cultivos" />}>
                <Route path='cultivos' element={<Cultivos />} />
              </Route>
              <Route element={<PermissionRoute screen="animales" />}>
                <Route path='animales' element={<Animales />} />
              </Route>
              <Route element={<PermissionRoute screen="programas" />}>
                <Route path='programas' element={<Programas />} />
              </Route>
              <Route element={<PermissionRoute screen="plagas" />}>
                <Route path='plagas' element={<Plagas />} />
              </Route>
              <Route element={<PermissionRoute screen="enfermedades" />}>
                <Route path='enfermedades' element={<Enfermedades />} />
              </Route>
              <Route element={<PermissionRoute screen="solicitudes" />}>
                <Route path='solicitudes' element={<Solicitudes />} />
              </Route>
              <Route element={<PermissionRoute screen="planificacion" />}>
                <Route path='planificacion' element={<Planificaciones />} />
              </Route>
              <Route element={<PermissionRoute screen="inspecciones" />}>
                <Route path='inspecciones' element={<Inspecciones />} />
              </Route>
              <Route element={<PermissionRoute screen="acta_silos" />}>
                <Route path='inspecciones-silos' element={<InspeccionesSilos />} />
              </Route>
              <Route element={<PermissionRoute screen="clientes" />}>
                <Route path='clientes' element={<Clientes />} />
              </Route>
              <Route element={<PermissionRoute screen="propiedades" />}>
                <Route path='propiedades' element={<Propiedades />} />
              </Route>
              <Route element={<PermissionRoute screen="empleados" />}>
                <Route path='empleados' element={<Empleados />} />
              </Route>
              <Route element={<PermissionRoute screen="oficinas" />}>
                <Route path='oficinas' element={<Oficinas />} />
              </Route>
              <Route element={<PermissionRoute screen="vehiculos" />}>
                <Route path='vehiculos' element={<Vehiculos />} />
              </Route>
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
