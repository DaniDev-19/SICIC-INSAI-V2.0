import { useState } from "react";
import "./index.css";

function App() {

  // 1. Separación de la lógica: Extraemos las funciones manejadoras de eventos
  const handleIncrement = () => setCount(count + 1);
  const handleReset = () => setCount(0);

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

export default App;