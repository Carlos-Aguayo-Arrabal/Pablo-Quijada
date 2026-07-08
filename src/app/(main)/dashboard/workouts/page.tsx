import type { Metadata } from 'next'
import { WorkoutLibrary } from '@/features/workouts/components/workout-library'
import { listWorkoutPlans, getWorkoutStats } from '@/features/workouts/services/actions'

export const metadata: Metadata = {
  title: 'Planes',
}

export default async function WorkoutsPage() {
  const [plans, stats] = await Promise.all([listWorkoutPlans(), getWorkoutStats()])

  return <WorkoutLibrary plans={plans} stats={stats} />
}
