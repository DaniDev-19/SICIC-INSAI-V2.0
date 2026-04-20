import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/home/Home';
import Cargos from './pages/cargos/Cargos';
import Roles from './pages/roles/Roles';
import BitacoraPage from './pages/bitacora/BitacoraPage';
import Login from './pages/login/Login';
import { ProtectedRoute } from './components/auth/protected-route';
import { PublicRoute } from './components/auth/public-route';

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
              <Route path='cargos' element={<Cargos />} />
              <Route path='roles' element={<Roles />} />
              <Route path='bitacora' element={<BitacoraPage />} />
            </Route>
          </Route>

          <Route path='*' element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  )
}

export default App
