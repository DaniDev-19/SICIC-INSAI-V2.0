import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/home/Home';
import Cargos from './pages/cargos/Cargos';
import Login from './pages/login/Login';
import { ProtectedRoute } from './components/auth/protected-route';
import { PublicRoute } from './components/auth/public-route';

import { Toaster } from 'sonner';
import { useAuth } from './hooks/use-auth';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-emerald-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
          <p className="text-emerald-50/50 text-sm animate-pulse">Cargando SICIC-INSAI...</p>
        </div>
      </div>
    );
  }

  return (
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
          </Route>
        </Route>

        <Route path='*' element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
