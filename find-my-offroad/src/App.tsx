'use client'
import { LiveMap } from '@/components/Map'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

type UserLocation = {
  id: string
  name: string
  lat: number
  lng: number
}

export default function Home() {
  const [socket, setSocket] = useState<any>(null)
  const [groupUsers, setGroupUsers] = useState<UserLocation[]>([])
  const [groupId, setGroupId] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)

    newSocket.on('group-update', (users: UserLocation[]) => {
      setGroupUsers(users)
    })

    return () => { newSocket.disconnect() }
  }, [])

  const joinGroup = () => {
    if (socket && groupId && userName) {
      socket.emit('join-group', groupId, {
        id: socket.id,
        name: userName,
        lat: -15.795,
        lng: -47.891
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Nome do Grupo"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />
        <Input
          placeholder="Seu Nome"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <Button onClick={joinGroup}>Entrar no Grupo</Button>
      </div>

      <LiveMap users={groupUsers} />
    </div>
  )
}