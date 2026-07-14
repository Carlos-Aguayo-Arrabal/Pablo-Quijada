import Link from 'next/link'

export function ClientDemoGate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080C14] px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-white">Portal del cliente</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Inicia sesión con la cuenta que te dio tu entrenador para ver tu plan, tus check-ins y tus mensajes.
        </p>

        <div className="mt-8">
          <Link href="/login" className="btn-primary w-full justify-center py-3 text-sm">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
