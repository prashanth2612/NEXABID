import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
let currentToken: string | null = null

export const getSocket = (token: string): Socket => {
  // If token changed, disconnect old socket
  if (socket && currentToken !== token) {
    socket.disconnect()
    socket = null
  }

  if (!socket) {
    currentToken = token
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id)
    })

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })
  }

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    currentToken = null
  }
}

export const getExistingSocket = (): Socket | null => socket
