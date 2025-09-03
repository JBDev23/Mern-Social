import React, { useEffect } from 'react'
import useAuth from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export const Logout = () => {

    const {setAuth, setCounters} = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        // Vaciar localStorage
        localStorage.clear()

        // Setear estados globales
        setAuth({})
        setCounters({})

        // Navigate a login
        navigate("/login")
    })

  return (
    <h1>Cerrando sesion...</h1>
  )
}
