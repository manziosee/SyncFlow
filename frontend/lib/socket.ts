import { Socket, Channel } from 'phoenix'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/socket/websocket'

let socket: Socket | null = null

export function getSocket(token: string): Socket {
  if (socket && socket.isConnected()) return socket

  socket = new Socket(WS_URL, { params: { token } })
  socket.connect()
  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}

export function joinChannel(
  topic: string,
  token: string,
  params?: Record<string, unknown>
): Channel {
  const s = getSocket(token)
  const channel = s.channel(topic, params)
  channel.join()
    .receive('ok', () => console.log(`[WS] Joined ${topic}`))
    .receive('error', (e: unknown) => console.error(`[WS] Error joining ${topic}`, e))
  return channel
}

export function leaveChannel(channel: Channel): void {
  channel.leave()
}
