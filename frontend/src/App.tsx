import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/home/Home';
import Cargos from './pages/cargos/Cargos';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/home'
          element={
            <Layout>
              <Home />
            </Layout >
          }
        />
        <Route
          path='/cargos'
          element={
            <Layout>
              <Cargos />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
