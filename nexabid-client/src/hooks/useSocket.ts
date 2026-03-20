import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

let globalSocket: Socket | null = null

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (globalSocket) { globalSocket.disconnect(); globalSocket = null }
      return
    }

    // Reuse existing connection
    if (globalSocket?.connected) {
      socketRef.current = globalSocket
      return
    }

    const socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => console.log('[Socket] Connected'))
    socket.on('disconnect', () => console.log('[Socket] Disconnected'))
    socket.on('connect_error', (e) => console.warn('[Socket] Error:', e.message))

    globalSocket = socket
    socketRef.current = socket

    return () => {
      // Don't disconnect on component unmount — keep alive at app level
    }
  }, [isAuthenticated, token])

  return socketRef.current
}

export function getSocket() { return globalSocket }
