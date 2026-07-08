import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { WorkoutBuilder } from '@/features/workouts/components/workout-builder'

export const metadata: Metadata = {
  title: 'Nuevo plan',
}

export default function NewWorkoutPage() {
  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <Link href="/dashboard/workouts" className="mb-6 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Volver a planes
      </Link>
      <WorkoutBuilder />
    </div>
  )
}
