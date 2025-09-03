import React, { useEffect, useState } from 'react'
import { Global } from '../../helpers/Global'
import { UserList } from './UserList'

export const People = () => {

  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [more, setMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState([])

  useEffect(() => {
    getUsers(1)
  }, [])

  const getUsers = async (nextPage = 1) => {
    setLoading(true)
    //Hacer peticion de usuarios

    const request = await fetch(Global.url + "user/list/" + nextPage, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token")
      }
    })

    const data = await request.json()

    if (data.status == "success" && data.users) {

      let newUsers = data.users

      if (users.length >= 1) {
        newUsers = [
          ...users,
          ...data.users
        ]
      }

      setUsers(newUsers)
      setFollowing(data.user_following)
      setLoading(false)

      if (users.length >= (data.total - data.users.length)) {
        setMore(false)
      }
    }
  }

  return (
    <>
      <header className="content__header">
        <h1 className="content__title">Gente</h1>
      </header>

      <UserList users={users} getUsers={getUsers} following={following} setFollowing={setFollowing} more={more} loading={loading} page={page} setPage={setPage} />

    </>
  )
}
