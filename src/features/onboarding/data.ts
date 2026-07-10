export type OnboardingTaskId = 'crearCuenta' | 'invitarCliente' | 'crearPlan' | 'configurarHorario' | 'generarResumenIA'

export type OnboardingTask = {
  id: OnboardingTaskId
  label: string
  description: string
  href: string
  completada: boolean
}

export type OnboardingStatus = {
  tasks: OnboardingTask[]
  completedCount: number
  totalCount: number
}

export const ONBOARDING_TASK_META: Record<OnboardingTaskId, { label: string; description: string; href: string }> = {
  crearCuenta: {
    label: 'Crea tu cuenta',
    description: 'Ya tienes tu espacio de trabajo listo.',
    href: '/dashboard/profile',
  },
  invitarCliente: {
    label: 'Invita a tu primer cliente',
    description: 'Dale acceso a su propio portal para ver su plan y hablar contigo.',
    href: '/dashboard/clients/new',
  },
  crearPlan: {
    label: 'Crea tu primer plan de entrenamiento',
    description: 'Diseña una rutina lista para asignar a un cliente.',
    href: '/dashboard/workouts/new',
  },
  configurarHorario: {
    label: 'Configura tu horario de citas',
    description: 'Deja que tus clientes reserven cita ellos mismos desde su portal.',
    href: '/dashboard/history?tab=horario',
  },
  generarResumenIA: {
    label: 'Genera tu primer resumen con IA',
    description: 'Abre la ficha de un cliente y pide un resumen de su estado.',
    href: '/dashboard/clients',
  },
}

export const ONBOARDING_TASK_ORDER: OnboardingTaskId[] = [
  'crearCuenta',
  'invitarCliente',
  'crearPlan',
  'configurarHorario',
  'generarResumenIA',
]
