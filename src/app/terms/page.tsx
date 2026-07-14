import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#080C14] p-6 text-white">
      <div className="mx-auto max-w-3xl py-10">
        <Link href="/signup" className="text-sm text-[#FF6A00]">Volver al registro</Link>
        <h1 className="mt-6 text-3xl font-black">Términos de servicio</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#94A3B8]">
          <p>TrainTools es una plataforma para gestionar clientes, planes, mensajes, citas y pagos de un negocio de entrenamiento.</p>
          <p>En una versión comercial, estos términos definirían responsabilidades, condiciones de pago, cancelaciones, uso aceptable y soporte.</p>
          <p>Antes de publicar con clientes reales conviene revisar estos textos con asesoría legal.</p>
        </div>
      </div>
    </main>
  )
}
