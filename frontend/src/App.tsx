import { useState } from "react";
import "./index.css";

function App() {
  const [count, setCount] = useState(0);

  // 1. Separación de la lógica: Extraemos las funciones manejadoras de eventos
  const handleIncrement = () => setCount(count + 1);
  const handleReset = () => setCount(0);

  return (
    // 2. Eliminamos el Fragmento vacío <> </> que era redundante
    <div className="p-5 text-center">
      <h1 className="mt-55 text-7xl text-white">
        Hola desde mi App de React 🚀
      </h1>

      <div className="mt-10 text-center">
        <button
          onClick={handleIncrement}
          className="px-4 py-2 text-2xl font-bold transition-all rounded cursor-pointer bg-amber-50 hover:bg-amber-100"
        >
          click aqui • estado que se setea • {count}
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-5 mx-5 text-5xl font-bold transition-all border-2 rounded-2xl cursor-pointer bg-amber-50/6 border-amber-300 hover:bg-amber-50 text-shadow-amber-50"
        >
          reseteame a 0
        </button>
      </div>

      <div className="mt-20 bg-black">
        {/* 3. Corrección de pequeños errores ortográficos en el texto */}
        <p className="p-10 border-2 border-white text-3xl font-bold text-white">
          Como funciona el estado de React: como su nombre indica, es reactivo a las acciones del usuario mediante Hooks del mismo React, como lo son useState, useEffect, useContext, entre otros. Permiten asignar un valor inicial y SETEAR ese valor para ir en aumento o decremento dependiendo de la funcionalidad que se le quiera dar, haciendo los primeros cambios en una prueba.
        </p>
      </div>
    </div>
  );
}

export default App;