import { useState, useEffect } from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import TodoForm from './Pages/TodoForm'
import MainPage from './Pages/MainPage'
import { context } from './Pages/context/context'
import Login from './Pages/Login'
import Register from './Pages/Register'
import ProtectedRoute from './Pages/ProtectedRoute'
import Profile from './Pages/Profile'
import ForgotPassword from './Pages/ForgotPassword'
import ResetPassword from './Pages/ResetPasword'
import VerifyEmail from './Pages/VerifyEmail'

function App() {
  const [selected, setSelected] = useState()
  const [Todos, setTodos] = useState([]);

  const router = createBrowserRouter([
    {
      path: '/form',
      element: <ProtectedRoute><TodoForm /></ProtectedRoute>
    },
    {
      path: '/',
      element: <><MainPage /></>
    },
    {
      path: '/login',
      element: <><Login /></>
    },
    {
      path: '/register',
      element: <><Register /></>
    },
    {
      path: '/profile',
      element: <ProtectedRoute><Profile /></ProtectedRoute>
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />
    },
    {
      path: '/reset-password/:token',
      element: <ResetPassword />
    },
    {
      path: '/verify/:token',
      element: <VerifyEmail />
    }
  ])

  return (
    <div style={{ height: "100vh" }}>
      <context.Provider value={{ Todos, setTodos, selected, setSelected }}>
        <RouterProvider router={router} />
      </context.Provider>
    </div>
  )
}

export default App
