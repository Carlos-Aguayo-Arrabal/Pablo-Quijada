import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacidad',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#080C14] p-6 text-white">
      <div className="mx-auto max-w-3xl py-10">
        <Link href="/signup" className="text-sm text-[#FF6A00]">Volver al registro</Link>
        <h1 className="mt-6 text-3xl font-black">Política de privacidad</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#94A3B8]">
          <p>Esta página resume cómo TrainTools trataría los datos de entrenadores y clientes en una versión real.</p>
          <p>Los datos de clientes, planes, mensajes, check-ins y pagos se usarían únicamente para prestar el servicio contratado.</p>
          <p>En producción se añadirían textos legales finales, encargado de tratamiento, derechos ARCO/GDPR, cookies y proveedor de pagos.</p>
        </div>
      </div>
    </main>
  )
}
