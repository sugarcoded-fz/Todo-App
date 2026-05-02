import { useState, useEffect } from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import TodoForm from './Pages/TodoForm'
import MainPage from './Pages/MainPage'
import { context } from './Pages/context/context'

function App() {
  const [selected, setSelected] = useState()
  const [Todos, setTodos] = useState([]);

  const router = createBrowserRouter([
    {
      path: '/form',
      element: <><TodoForm /></>
    },
    {
      path: '/',
      element: <><MainPage /></>
    }
  ])

  return (
    <div style={{height:"100vh"}}>
      <context.Provider value={{ Todos, setTodos, selected, setSelected }}>
        <RouterProvider router={router} />
      </context.Provider>
    </div>
  )
}

export default App
