import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/home/Home';
import Cargos from './pages/cargos/Cargos';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='cargos' element={<Cargos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
