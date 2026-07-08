import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { InviteClientForm } from '@/features/clients/components/invite-client-form'

export const metadata: Metadata = {
  title: 'Invitar cliente',
}

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <Link href="/dashboard/clients" className="mb-6 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Volver a clientes
      </Link>
      <InviteClientForm />
    </div>
  )
}
