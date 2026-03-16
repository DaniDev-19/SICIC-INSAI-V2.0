import { useState } from 'react'
import './index.css'


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className='text-center p-5 '>
        <h1 className='text-white text-7xl mt-55'>Hola desde mi App</h1>

        <div className='mt-10 text-center'>

          <button
            className='bg-amber-50 rounded py-2 px-4 font-bold text-2xl hover:bg-amber-100 transition-all cursor-pointer'
            onClick={() => setCount(count + 1)}
          >
            click aqui • estado que se setea • {count}
          </button>

          <button
            className='bg-amber-50/6  rounded-2xl border-amber-300 border-2 py-5 px-4 mx-5 hover:bg-amber-50 transition-all cursor-pointer text-shadow-amber-50 font-bold text-5xl'
            onClick={() => setCount(0)}
          >
            reseteame a 0
          </button>
        </div>
        <div className='mt-20 bg-black'>
          <p className='text-3xl font-bold text-white border-2 border-white p-10'> Como funciona el estado de react como su nombre indica es reactivo a las acciones del usuario mediante Hooks del mismo react como lo son useState, UseEffect, UseContext entre otro. Permiten asignar un valor inicial y SETEAR ese valor para ir en aumento o decremento dependiendo la funcionalidad que se le quiera dar, haciendo los primeros cambiios en una prueba </p>
        </div>
      </div>

    </>
  )
}

export default App
