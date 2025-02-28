const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

const groups = new Map()

io.on('connection', (socket) => {
  socket.on('join-group', (groupId, user) => {
    socket.join(groupId)
    
    if (!groups.has(groupId)) {
      groups.set(groupId, new Map())
    }
    
    const group = groups.get(groupId)
    group.set(socket.id, user)
    io.to(groupId).emit('group-update', Array.from(group.values()))
  })

  socket.on('update-location', (groupId, location) => {
    const group = groups.get(groupId)
    if (group) {
      const user = group.get(socket.id)
      if (user) {
        user.lat = location.lat
        user.lng = location.lng
        io.to(groupId).emit('group-update', Array.from(group.values()))
      }
    }
  })

  socket.on('disconnect', () => {
    groups.forEach((group, groupId) => {
      if (group.delete(socket.id)) {
        io.to(groupId).emit('group-update', Array.from(group.values()))
      }
    })
  })
})

server.listen(3001, () => {
  console.log('Servidor Socket.io rodando na porta 3001')
})