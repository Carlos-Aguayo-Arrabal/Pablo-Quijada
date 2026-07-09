'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { login } from '@/actions/auth'
import { DEMO_CREDENTIALS } from '@/features/demo/auth'

export function HeroDemoLink({ className }: { className?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    await login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <button type="button" onClick={handleClick} disabled={isLoading} className={className}>
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      Ver demo
    </button>
  )
}
