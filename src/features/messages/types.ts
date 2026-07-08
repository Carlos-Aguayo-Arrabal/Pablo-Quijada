export interface MessageThread {
  clientId: string
  clientName: string
  preview: string
  time: string
  unread: boolean
}

export interface MessageItem {
  id: string
  sender: 'coach' | 'client'
  body: string
  time: string
}
