import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCenter } from '@/features/messages/components/message-center'
import { listThreads, listMessages } from '@/features/messages/services/actions'

export const metadata: Metadata = {
  title: 'Mensajes',
}

export default async function MessagesPage() {
  const threads = await listThreads()
  const initialMessages = threads[0] ? await listMessages(threads[0].clientId) : []

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mensajes</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">Conversaciones con contexto de planes, check-ins y pagos.</p>
        </div>
        <Link href="/client" className="btn-secondary w-fit text-sm">Ver portal cliente</Link>
      </div>

      <MessageCenter threads={threads} initialMessages={initialMessages} />
    </div>
  )
}
