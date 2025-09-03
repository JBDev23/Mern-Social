import React, { useState, useEffect, createContext } from 'react'
import { Global } from '../helpers/Global'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    const [auth, setAuth] = useState({})
    const [counters, setCounters] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        authUser()
    }, [])

    const authUser = async() => {
        // Sacar datos usuario identificado del localStorage
        const token = localStorage.getItem("token")
        const user = localStorage.getItem("user")

        if(!token || !user) {
            setLoading(false)
            return false
        }

        // Comprobar si llega token y user
        const userObj = JSON.parse(user)
        const userId = userObj.id

        
        
        try{
            // Comprobar token  
            const request = await fetch(Global.url + "user/profile/" + userId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            })

            // Devolver datos del usuario
            const data = await request.json()

            // Peticion de los contadores
            const requestCounters = await fetch(Global.url + "user/counters/" + userId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            })

            // Devolver datos del usuario
            const dataCounters = await requestCounters.json()

            // Setear el estado de auth
            setAuth(data.user)
            setCounters(dataCounters)
            setLoading(false)

        } catch (error) {
            console.log(error)
        }
        
    }

    return (
        <AuthContext.Provider value={{ auth, counters, loading, setAuth, setCounters, setLoading }}>{children}</AuthContext.Provider>
    )
}

export default AuthContext