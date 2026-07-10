import type { CheckInRecord } from '@/features/checkins/data'
import type { ClientRecord } from '@/features/clients/data'
import type { MessageItem, MessageThread } from '@/features/messages/types'
import type { PaymentRecord } from '@/features/payments/types'
import type { WorkoutPlan } from '@/features/workouts/data'
import type { AvailabilitySlot, SessionRecord, SessionType } from '@/features/agenda/data'

export const demoClientIds = {
  laura: '11111111-1111-4111-8111-111111111111',
  carlos: '22222222-2222-4222-8222-222222222222',
  marta: '33333333-3333-4333-8333-333333333333',
  javier: '44444444-4444-4444-8444-444444444444',
  ana: '55555555-5555-4555-8555-555555555555',
  diego: '66666666-6666-4666-8666-666666666666',
} as const

const demoCheckInIds = {
  laura: '10101010-1010-4010-8010-101010101010',
  carlos: '20202020-2020-4020-8020-202020202020',
  marta: '30303030-3030-4030-8030-303030303030',
  javier: '40404040-4040-4040-8040-404040404040',
  diego: '50505050-5050-4050-8050-505050505050',
} as const

const demoPaymentIds = {
  laura: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  carlos: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  marta: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  javier: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  ana: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  diego: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
} as const

const demoPlanIds = {
  strength: '77777777-7777-4777-8777-777777777777',
  hypertrophy: '88888888-8888-4888-8888-888888888888',
  recomposition: '99999999-9999-4999-8999-999999999999',
} as const

const demoClients: ClientRecord[] = [
  {
    id: demoClientIds.laura,
    name: 'Laura Martín',
    initials: 'LM',
    email: 'laura.martin@example.com',
    phone: '+34 611 234 901',
    service: 'Fuerza 12 semanas',
    goal: 'Ganar fuerza sin molestias de hombro y consolidar técnica en básicos.',
    status: 'Activo',
    adherence: 92,
    workouts: '3/4 esta semana',
    checkIns: '4/4 check-ins',
    nextAction: 'Revisar check-in',
    nextActionType: 'checkin',
    revenue: '149 €/mes',
    startedAt: '12 mayo 2026',
    lastSeen: 'Hace 12 min',
    weight: '64.8 kg',
    bodyFat: '22%',
    energy: '8/10',
    notes: 'Está progresando bien. Mantener foco en press con tempo y control escapular.',
    risks: [],
    tags: ['Premium', 'Fuerza', 'Técnica'],
  },
  {
    id: demoClientIds.carlos,
    name: 'Carlos Ruiz',
    initials: 'CR',
    email: 'carlos.ruiz@example.com',
    phone: '+34 622 451 118',
    service: 'Recomposición corporal',
    goal: 'Bajar grasa manteniendo rendimiento en entrenamientos de tarde.',
    status: 'Riesgo',
    adherence: 43,
    workouts: '1/4 esta semana',
    checkIns: '2/4 check-ins',
    nextAction: 'Responder alerta',
    nextActionType: 'message',
    revenue: '119 €/mes',
    startedAt: '3 junio 2026',
    lastSeen: 'Hace 2 días',
    weight: '82.1 kg',
    bodyFat: '26%',
    energy: '4/10',
    notes: 'Semana complicada por viajes. Conviene ajustar volumen y simplificar objetivos nutricionales.',
    risks: ['Adherencia baja', 'Sueño bajo', 'Pago pendiente'],
    tags: ['Riesgo', 'Viajes', 'Nutrición'],
  },
  {
    id: demoClientIds.marta,
    name: 'Marta Vega',
    initials: 'MV',
    email: 'marta.vega@example.com',
    phone: '+34 633 980 204',
    service: 'Hipertrofia glúteo/pierna',
    goal: 'Aumentar masa muscular con 4 sesiones semanales y control de fatiga.',
    status: 'Pendiente',
    adherence: 68,
    workouts: '2/4 esta semana',
    checkIns: '1/4 check-ins',
    nextAction: 'Activar primer plan',
    nextActionType: 'plan',
    revenue: '129 €/mes',
    startedAt: '1 julio 2026',
    lastSeen: 'Hace 5 h',
    weight: '59.2 kg',
    bodyFat: '21%',
    energy: '7/10',
    notes: 'Cliente recién incorporada. Falta confirmar horarios y bloquear días de entrenamiento.',
    risks: ['Onboarding incompleto'],
    tags: ['Nueva', 'Hipertrofia', 'Glúteo'],
  },
  {
    id: demoClientIds.javier,
    name: 'Javier Molina',
    initials: 'JM',
    email: 'javier.molina@example.com',
    phone: '+34 644 120 388',
    service: 'Readaptación rodilla',
    goal: 'Volver a correr 5 km sin dolor y recuperar confianza en pierna izquierda.',
    status: 'Activo',
    adherence: 86,
    workouts: '3/3 esta semana',
    checkIns: '3/3 check-ins',
    nextAction: 'Ajustar plan',
    nextActionType: 'plan',
    revenue: '179 €/mes',
    startedAt: '20 abril 2026',
    lastSeen: 'Hace 34 min',
    weight: '76.5 kg',
    bodyFat: '18%',
    energy: '8/10',
    notes: 'Tolera bien carga unilateral. Siguiente paso: introducir cambios de dirección suaves.',
    risks: [],
    tags: ['Readaptación', 'Rodilla', 'Premium'],
  },
  {
    id: demoClientIds.ana,
    name: 'Ana Torres',
    initials: 'AT',
    email: 'ana.torres@example.com',
    phone: '+34 655 710 642',
    service: 'Acondicionamiento',
    goal: 'Recuperar rutina tras pausa laboral y mejorar resistencia general.',
    status: 'Pausado',
    adherence: 58,
    workouts: '0/3 esta semana',
    checkIns: '0/3 check-ins',
    nextAction: 'Reactivar pago',
    nextActionType: 'payment',
    revenue: '89 €/mes',
    startedAt: '8 febrero 2026',
    lastSeen: 'Hace 9 días',
    weight: '68.3 kg',
    bodyFat: '24%',
    energy: '5/10',
    notes: 'Pausada por agenda. Tiene intención de volver con dos sesiones por semana.',
    risks: ['Suscripción pausada'],
    tags: ['Pausado', 'Acondicionamiento'],
  },
  {
    id: demoClientIds.diego,
    name: 'Diego Núñez',
    initials: 'DN',
    email: 'diego.nunez@example.com',
    phone: '+34 666 031 774',
    service: 'Potencia y rendimiento',
    goal: 'Mejorar salto, sprint corto y fuerza máxima para temporada de pádel.',
    status: 'Activo',
    adherence: 78,
    workouts: '2/3 esta semana',
    checkIns: '2/3 check-ins',
    nextAction: 'Enviar renovación',
    nextActionType: 'payment',
    revenue: '159 €/mes',
    startedAt: '15 marzo 2026',
    lastSeen: 'Hace 1 h',
    weight: '73.9 kg',
    bodyFat: '15%',
    energy: '7/10',
    notes: 'Buen rendimiento, pero sube fatiga cuando acumula partidos. Ajustar semana de descarga.',
    risks: ['Fatiga moderada'],
    tags: ['Rendimiento', 'Potencia', 'Pádel'],
  },
]

const demoCheckIns: CheckInRecord[] = [
  {
    id: demoCheckInIds.laura,
    client: 'Laura Martín',
    clientId: demoClientIds.laura,
    date: 'Hoy, 09:12',
    status: 'Pendiente',
    risk: 'Bajo',
    weight: '64.8 kg',
    weightChange: '-0.2 kg',
    energy: 8,
    sleep: 7,
    hunger: 5,
    steps: '9.840',
    adherence: 92,
    workouts: '3/4',
    nutrition: '90%',
    comment: 'Me noto fuerte. En press banca mantuve técnica, pero la última serie fue RPE 9.',
    alert: 'RPE alto puntual en empuje horizontal.',
    suggestedReply: 'Buen trabajo, Laura. Mantén el peso en press esta semana y busca cerrar todas las series en RPE 8 antes de subir.',
  },
  {
    id: demoCheckInIds.carlos,
    client: 'Carlos Ruiz',
    clientId: demoClientIds.carlos,
    date: 'Hoy, 08:41',
    status: 'Requiere respuesta',
    risk: 'Alto',
    weight: '82.1 kg',
    weightChange: '+1.1 kg',
    energy: 4,
    sleep: 4,
    hunger: 8,
    steps: '4.200',
    adherence: 43,
    workouts: '1/4',
    nutrition: '45%',
    comment: 'Viaje toda la semana. Dormí mal y no llegué a las comidas planificadas.',
    alert: 'Baja adherencia, sueño bajo y aumento de hambre.',
    suggestedReply: 'Vamos a simplificar: dos entrenos cortos esta semana, proteína mínima y 7.000 pasos. No busques compensar de golpe.',
  },
  {
    id: demoCheckInIds.marta,
    client: 'Marta Vega',
    clientId: demoClientIds.marta,
    date: 'Ayer, 20:16',
    status: 'Pendiente',
    risk: 'Medio',
    weight: '59.2 kg',
    weightChange: 'Sin cambio',
    energy: 7,
    sleep: 6,
    hunger: 6,
    steps: '7.100',
    adherence: 68,
    workouts: '2/4',
    nutrition: '70%',
    comment: 'Me cuesta encajar el entreno del viernes. Prefiero moverlo al sábado por la mañana.',
    alert: 'Onboarding con agenda todavía sin cerrar.',
    suggestedReply: 'Perfecto, movemos viernes a sábado. Te dejo una sesión algo más larga y ajusto descanso del domingo.',
  },
  {
    id: demoCheckInIds.javier,
    client: 'Javier Molina',
    clientId: demoClientIds.javier,
    date: 'Ayer, 10:04',
    status: 'Aprobado',
    risk: 'Bajo',
    weight: '76.5 kg',
    weightChange: '-0.1 kg',
    energy: 8,
    sleep: 8,
    hunger: 4,
    steps: '8.600',
    adherence: 86,
    workouts: '3/3',
    nutrition: '85%',
    comment: 'Sin dolor en zancadas. El step-down costó, pero la rodilla respondió bien.',
    alert: 'Sin alerta activa.',
    suggestedReply: 'Muy buena señal. La próxima semana subimos un poco la exigencia unilateral manteniendo control.',
  },
  {
    id: demoCheckInIds.diego,
    client: 'Diego Núñez',
    clientId: demoClientIds.diego,
    date: 'Lun, 19:33',
    status: 'Requiere respuesta',
    risk: 'Medio',
    weight: '73.9 kg',
    weightChange: '+0.3 kg',
    energy: 6,
    sleep: 5,
    hunger: 5,
    steps: '10.200',
    adherence: 78,
    workouts: '2/3',
    nutrition: '82%',
    comment: 'Partido largo el domingo. Gemelos cargados y salto peor en calentamiento.',
    alert: 'Fatiga de tren inferior antes de sesión de potencia.',
    suggestedReply: 'Cambiamos potencia por movilidad y fuerza técnica. Si los gemelos bajan mañana, reintroducimos saltos suaves.',
  },
]

const demoMessageThreads: MessageThread[] = [
  {
    clientId: demoClientIds.carlos,
    clientName: 'Carlos Ruiz',
    preview: 'Esta semana estoy de viaje, ¿puedo hacer solo dos sesiones?',
    time: 'Hace 18 min',
    unread: true,
  },
  {
    clientId: demoClientIds.laura,
    clientName: 'Laura Martín',
    preview: 'En press banca noté el hombro estable con el tempo nuevo.',
    time: 'Hace 1 h',
    unread: true,
  },
  {
    clientId: demoClientIds.marta,
    clientName: 'Marta Vega',
    preview: 'Me viene mejor entrenar sábado en lugar de viernes.',
    time: 'Ayer',
    unread: false,
  },
  {
    clientId: demoClientIds.diego,
    clientName: 'Diego Núñez',
    preview: 'Tengo partido el domingo, ¿mantengo la sesión de potencia?',
    time: 'Ayer',
    unread: false,
  },
]

const demoMessagesByClientId: Record<string, MessageItem[]> = {
  [demoClientIds.carlos]: [
    { id: 'msg-carlos-1', sender: 'client', body: 'Esta semana estoy de viaje, ¿puedo hacer solo dos sesiones?', time: '08:52' },
    { id: 'msg-carlos-2', sender: 'coach', body: 'Sí. Priorizamos full body A y caminatas. Te bajo el volumen para que sea realista.', time: '09:04' },
    { id: 'msg-carlos-3', sender: 'client', body: 'Perfecto. También dormí poco y tengo más hambre por la noche.', time: '09:18' },
  ],
  [demoClientIds.laura]: [
    { id: 'msg-laura-1', sender: 'coach', body: 'Hoy usa tempo 3-1-1 en press y deja dos repeticiones en recámara.', time: '10:11' },
    { id: 'msg-laura-2', sender: 'client', body: 'En press banca noté el hombro estable con el tempo nuevo.', time: '11:02' },
  ],
  [demoClientIds.marta]: [
    { id: 'msg-marta-1', sender: 'client', body: 'Me viene mejor entrenar sábado en lugar de viernes.', time: 'Ayer 20:21' },
    { id: 'msg-marta-2', sender: 'coach', body: 'Lo muevo a sábado y dejo el domingo solo con movilidad ligera.', time: 'Ayer 20:35' },
  ],
  [demoClientIds.diego]: [
    { id: 'msg-diego-1', sender: 'client', body: 'Tengo partido el domingo, ¿mantengo la sesión de potencia?', time: 'Ayer 17:10' },
    { id: 'msg-diego-2', sender: 'coach', body: 'La mantenemos, pero quitamos los saltos de alta intensidad si notas gemelo cargado.', time: 'Ayer 17:24' },
  ],
}

const demoPayments: PaymentRecord[] = [
  {
    id: demoPaymentIds.laura,
    clientId: demoClientIds.laura,
    clientName: 'Laura Martín',
    concept: 'Fuerza 12 semanas - julio',
    amount: 149,
    currency: 'EUR',
    status: 'Pagado',
    paymentLink: 'https://buy.stripe.com/demo-laura',
    dueDate: '2026-07-01',
    statusLabel: 'Pagado',
  },
  {
    id: demoPaymentIds.carlos,
    clientId: demoClientIds.carlos,
    clientName: 'Carlos Ruiz',
    concept: 'Recomposición corporal - julio',
    amount: 119,
    currency: 'EUR',
    status: 'Pendiente',
    paymentLink: 'https://buy.stripe.com/demo-carlos',
    dueDate: '2026-07-10',
    statusLabel: 'Renueva en 2 días',
  },
  {
    id: demoPaymentIds.marta,
    clientId: demoClientIds.marta,
    clientName: 'Marta Vega',
    concept: 'Alta + primer mes hipertrofia',
    amount: 129,
    currency: 'EUR',
    status: 'Pendiente',
    paymentLink: 'https://buy.stripe.com/demo-marta',
    dueDate: '2026-07-08',
    statusLabel: 'Vence hoy',
  },
  {
    id: demoPaymentIds.javier,
    clientId: demoClientIds.javier,
    clientName: 'Javier Molina',
    concept: 'Readaptación premium - julio',
    amount: 179,
    currency: 'EUR',
    status: 'Pagado',
    paymentLink: null,
    dueDate: '2026-07-03',
    statusLabel: 'Pagado',
  },
  {
    id: demoPaymentIds.ana,
    clientId: demoClientIds.ana,
    clientName: 'Ana Torres',
    concept: 'Reactivación acondicionamiento',
    amount: 89,
    currency: 'EUR',
    status: 'Vencido',
    paymentLink: 'https://buy.stripe.com/demo-ana',
    dueDate: '2026-07-02',
    statusLabel: 'Vencido',
  },
  {
    id: demoPaymentIds.diego,
    clientId: demoClientIds.diego,
    clientName: 'Diego Núñez',
    concept: 'Rendimiento pádel - renovación',
    amount: 159,
    currency: 'EUR',
    status: 'Pendiente',
    paymentLink: 'https://buy.stripe.com/demo-diego',
    dueDate: '2026-07-15',
    statusLabel: 'Renueva en 7 días',
  },
]

const demoWorkoutPlans: WorkoutPlan[] = [
  {
    id: demoPlanIds.strength,
    title: 'General Strength 12 semanas',
    category: 'Fuerza',
    level: 'Intermedio',
    durationWeeks: 12,
    sessionsPerWeek: 4,
    assignedClients: 3,
    adherence: 88,
    price: '149 €/mes',
    description: 'Periodización de fuerza con bloques de base, intensificación y realización.',
    tags: ['Fuerza', 'Periodización', 'Plantilla'],
    days: [
      {
        day: 'Lunes',
        title: 'Torso fuerza',
        focus: 'Empuje, tracción y core',
        duration: 55,
        exercises: [
          { name: 'Press banca con tempo', sets: 4, reps: '5', rest: 150, rpe: '7-8', tempo: '3-1-1', notes: 'Pausa clara en el pecho.' },
          { name: 'Remo con barra', sets: 4, reps: '6', rest: 120, rpe: '8', tempo: '2-0-1', notes: 'Evitar tirón lumbar.' },
          { name: 'Pallof press', sets: 3, reps: '12/lado', rest: 45, rpe: '6', tempo: 'Controlado', notes: 'Cadera estable.' },
        ],
      },
      {
        day: 'Miércoles',
        title: 'Pierna fuerza',
        focus: 'Sentadilla y cadena posterior',
        duration: 60,
        exercises: [
          { name: 'Sentadilla frontal', sets: 5, reps: '4', rest: 180, rpe: '8', tempo: '2-1-1', notes: 'Subida explosiva.' },
          { name: 'Peso muerto rumano', sets: 4, reps: '8', rest: 120, rpe: '7', tempo: '3-1-1', notes: 'Tensión en isquios.' },
          { name: 'Split squat', sets: 3, reps: '10/lado', rest: 90, rpe: '8', tempo: '2-0-1', notes: 'Rodilla alineada.' },
        ],
      },
      {
        day: 'Viernes',
        title: 'Full body técnico',
        focus: 'Patrones básicos y accesorios',
        duration: 45,
        exercises: [
          { name: 'Dominada asistida', sets: 4, reps: '6-8', rest: 120, rpe: '7', tempo: '2-1-1', notes: 'Controlar bajada.' },
          { name: 'Hip thrust', sets: 4, reps: '8', rest: 120, rpe: '8', tempo: '2-1-1', notes: 'Pausa arriba.' },
          { name: 'Farmer carry', sets: 4, reps: '30s', rest: 60, rpe: '7', tempo: 'Marcha', notes: 'Costillas abajo.' },
        ],
      },
    ],
  },
  {
    id: demoPlanIds.hypertrophy,
    title: 'Hipertrofia glúteo/pierna',
    category: 'Hipertrofia',
    level: 'Intermedio',
    durationWeeks: 8,
    sessionsPerWeek: 4,
    assignedClients: 2,
    adherence: 81,
    price: '129 €/mes',
    description: 'Bloques de volumen progresivo con énfasis en tren inferior y control de fatiga.',
    tags: ['Hipertrofia', 'Glúteo', 'Volumen'],
    days: [
      {
        day: 'Lunes',
        title: 'Glúteo dominante',
        focus: 'Hip thrust, bisagra y abducción',
        duration: 58,
        exercises: [
          { name: 'Hip thrust barra', sets: 5, reps: '8', rest: 150, rpe: '8', tempo: '2-1-1', notes: 'Bloqueo sin hiperextender lumbar.' },
          { name: 'Peso muerto rumano mancuerna', sets: 4, reps: '10', rest: 120, rpe: '8', tempo: '3-1-1', notes: 'Recorrido cómodo.' },
          { name: 'Abducción en polea', sets: 3, reps: '15/lado', rest: 45, rpe: '9', tempo: '2-1-2', notes: 'Sin balanceo.' },
        ],
      },
      {
        day: 'Jueves',
        title: 'Cuádriceps y core',
        focus: 'Sentadilla, prensa y estabilidad',
        duration: 52,
        exercises: [
          { name: 'Sentadilla goblet', sets: 4, reps: '10', rest: 90, rpe: '7', tempo: '3-1-1', notes: 'Profundidad consistente.' },
          { name: 'Prensa inclinada', sets: 4, reps: '12', rest: 120, rpe: '8', tempo: '2-0-1', notes: 'No bloquear rodillas.' },
          { name: 'Dead bug', sets: 3, reps: '10/lado', rest: 45, rpe: '6', tempo: 'Controlado', notes: 'Exhalar al extender.' },
        ],
      },
    ],
  },
  {
    id: demoPlanIds.recomposition,
    title: 'Recomposición metabólica',
    category: 'Pérdida de grasa',
    level: 'Principiante',
    durationWeeks: 10,
    sessionsPerWeek: 3,
    assignedClients: 4,
    adherence: 74,
    price: '119 €/mes',
    description: 'Plan de fuerza eficiente con circuitos de baja fricción para semanas de agenda variable.',
    tags: ['Recomposición', 'Circuitos', 'Agenda flexible'],
    days: [
      {
        day: 'Martes',
        title: 'Full body A',
        focus: 'Patrones básicos y gasto moderado',
        duration: 42,
        exercises: [
          { name: 'Goblet squat', sets: 3, reps: '10', rest: 75, rpe: '7', tempo: '2-1-1', notes: 'Respirar entre reps.' },
          { name: 'Push-up inclinado', sets: 3, reps: '8-12', rest: 60, rpe: '7', tempo: '2-0-1', notes: 'Mantener línea corporal.' },
          { name: 'Remo TRX', sets: 3, reps: '12', rest: 60, rpe: '7', tempo: '2-1-1', notes: 'Escápulas activas.' },
        ],
      },
      {
        day: 'Sábado',
        title: 'Circuito sostenible',
        focus: 'Condicionamiento sin impacto',
        duration: 35,
        exercises: [
          { name: 'Bike intervals', sets: 6, reps: '40s', rest: 50, rpe: '8', tempo: 'Intervalos', notes: 'No pasar de RPE 8.' },
          { name: 'Kettlebell deadlift', sets: 4, reps: '12', rest: 60, rpe: '7', tempo: '2-0-1', notes: 'Cadera atrás.' },
          { name: 'Plancha lateral', sets: 3, reps: '30s/lado', rest: 45, rpe: '6', tempo: 'Isométrico', notes: 'Cadera alta.' },
        ],
      },
    ],
  },
]

export function getDemoClients() {
  return demoClients.map((client) => ({ ...client, risks: [...client.risks], tags: [...client.tags] }))
}

export function getDemoClientById(id: string) {
  return getDemoClients().find((client) => client.id === id) ?? null
}

export function getDemoClientsSummary() {
  const clients = demoClients
  const mrr = clients.reduce((sum, client) => sum + (Number.parseFloat(client.revenue) || 0), 0)

  return {
    total: clients.length,
    activeCount: clients.filter((client) => client.status === 'Activo').length,
    riskCount: clients.filter((client) => client.status === 'Riesgo').length,
    pendingCheckins: demoCheckIns.filter((checkIn) => checkIn.status === 'Pendiente').length,
    mrr,
  }
}

export function getDemoCheckIns() {
  return demoCheckIns.map((checkIn) => ({ ...checkIn }))
}

export function getDemoCheckInStats() {
  const rows = demoCheckIns
  return {
    pending: rows.filter((checkIn) => checkIn.status === 'Pendiente').length,
    needsReply: rows.filter((checkIn) => checkIn.status === 'Requiere respuesta').length,
    approved: rows.filter((checkIn) => checkIn.status === 'Aprobado').length,
    avgAdherence: Math.round(rows.reduce((sum, checkIn) => sum + checkIn.adherence, 0) / rows.length),
  }
}

export function getDemoMessageThreads() {
  return demoMessageThreads.map((thread) => ({ ...thread }))
}

export function getDemoMessages(clientId: string) {
  return (demoMessagesByClientId[clientId] ?? []).map((message) => ({ ...message }))
}

export function getDemoPayments() {
  return demoPayments.map((payment) => ({ ...payment }))
}

export function getDemoPaymentsByClient(clientId: string) {
  return getDemoPayments().filter((payment) => payment.clientId === clientId)
}

export function getDemoPaymentsSummary() {
  return {
    collected: demoPayments.filter((payment) => payment.status === 'Pagado').reduce((sum, payment) => sum + payment.amount, 0),
    pending: demoPayments.filter((payment) => payment.status !== 'Pagado').reduce((sum, payment) => sum + payment.amount, 0),
    renewals: demoPayments.filter((payment) => payment.status === 'Pendiente').length,
  }
}

export function getDemoWorkoutPlans() {
  return demoWorkoutPlans.map((plan) => ({
    ...plan,
    tags: [...plan.tags],
    days: plan.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => ({ ...exercise })),
    })),
  }))
}

export function getDemoWorkoutPlanById(id: string) {
  return getDemoWorkoutPlans().find((plan) => plan.id === id) ?? null
}

export function getDemoWorkoutStats() {
  const plans = demoWorkoutPlans
  return {
    templates: plans.length,
    activeAssignments: plans.reduce((sum, plan) => sum + plan.assignedClients, 0),
    avgAdherence: Math.round(plans.reduce((sum, plan) => sum + plan.adherence, 0) / plans.length),
    paidPlans: plans.filter((plan) => plan.price.trim().length > 0 && plan.price !== '—').length,
  }
}

export function getDemoDashboardSummary() {
  const clients = demoClients
  const payments = demoPayments
  const unreadThreadsCount = demoMessageThreads.filter((thread) => thread.unread).length
  const mrr = clients.reduce((sum, client) => sum + (Number.parseFloat(client.revenue) || 0), 0)
  const avgAdherence = Math.round(clients.reduce((sum, client) => sum + client.adherence, 0) / clients.length)

  return {
    stats: {
      activeClients: clients.filter((client) => client.status === 'Activo').length,
      mrr,
      avgAdherence,
      riskCount: clients.filter((client) => client.status === 'Riesgo').length,
    },
    pendingCheckinsCount: demoCheckIns.filter((checkIn) => checkIn.status === 'Pendiente').length,
    unreadThreadsCount,
    totalWorkoutPlans: demoWorkoutPlans.length,
    riskClients: clients
      .filter((client) => client.status === 'Riesgo' || client.risks.length > 0)
      .slice(0, 3)
      .map((client) => ({
        id: client.id,
        name: client.name,
        problem: client.risks[0] ?? 'Necesita seguimiento',
        detail: client.notes,
        metric: `${client.adherence}%`,
      })),
    pendingCheckIns: demoCheckIns
      .filter((checkIn) => checkIn.status !== 'Aprobado')
      .slice(0, 3)
      .map((checkIn) => ({
        clientId: checkIn.clientId,
        client: checkIn.client,
        result: checkIn.comment,
        status: checkIn.status === 'Pendiente' ? 'Pendiente de revisión' : 'Requiere respuesta',
      })),
    recentActivity: [
      { type: 'checkin' as const, text: 'Laura Martín envió un check-in', time: 'Hace 12 min', href: `/dashboard/clients/${demoClientIds.laura}` },
      { type: 'message' as const, text: 'Carlos Ruiz: Esta semana estoy de viaje', time: 'Hace 18 min', href: '/dashboard/messages' },
      { type: 'checkin' as const, text: 'Marta Vega pidió mover el entreno del viernes', time: 'Ayer', href: `/dashboard/clients/${demoClientIds.marta}` },
      { type: 'message' as const, text: 'Diego Núñez preguntó por la sesión de potencia', time: 'Ayer', href: '/dashboard/messages' },
    ],
    pendingPayments: payments
      .filter((payment) => payment.status !== 'Pagado')
      .slice(0, 3)
      .map((payment) => ({
        id: payment.id,
        client: payment.clientName,
        concept: payment.concept,
        amount: new Intl.NumberFormat('es-ES', { style: 'currency', currency: payment.currency }).format(payment.amount),
        status: payment.status,
        clientId: payment.clientId,
      })),
  }
}

export function isDemoClientId(id: string) {
  return Object.values(demoClientIds).includes(id as (typeof demoClientIds)[keyof typeof demoClientIds])
}

export function isDemoCheckInId(id: string) {
  return Object.values(demoCheckInIds).includes(id as (typeof demoCheckInIds)[keyof typeof demoCheckInIds])
}

export function isDemoPaymentId(id: string) {
  return Object.values(demoPaymentIds).includes(id as (typeof demoPaymentIds)[keyof typeof demoPaymentIds])
}

const demoSessionTypeIds = {
  entrenamiento: 'a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1',
  nutricion: 'b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2',
  fisioterapia: 'c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3',
} as const

const demoSessionTypes: SessionType[] = [
  { id: demoSessionTypeIds.entrenamiento, nombre: 'Entrenamiento personal', color: '#3B82F6' },
  { id: demoSessionTypeIds.nutricion, nombre: 'Nutrición', color: '#FF6A00' },
  { id: demoSessionTypeIds.fisioterapia, nombre: 'Fisioterapia', color: '#EC4899' },
]

function demoSessionDate(dayOffset: number, hour: number, minute = 0) {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

const demoSessions: SessionRecord[] = [
  {
    id: 'session-demo-1',
    clienteId: demoClientIds.laura,
    clienteNombre: 'Laura Martín',
    tipoSesionId: demoSessionTypeIds.entrenamiento,
    tipoSesionNombre: 'Entrenamiento personal',
    tipoSesionColor: '#3B82F6',
    titulo: 'Revisión semanal',
    modalidad: 'online',
    fechaHora: demoSessionDate(0, 9, 30),
    duracionMinutos: 45,
    estado: 'programada',
    origen: 'entrenador',
    notas: null,
  },
  {
    id: 'session-demo-2',
    clienteId: demoClientIds.carlos,
    clienteNombre: 'Carlos Ruiz',
    tipoSesionId: demoSessionTypeIds.entrenamiento,
    tipoSesionNombre: 'Entrenamiento personal',
    tipoSesionColor: '#3B82F6',
    titulo: 'Sesión presencial',
    modalidad: 'presencial',
    fechaHora: demoSessionDate(0, 11, 0),
    duracionMinutos: 60,
    estado: 'programada',
    origen: 'entrenador',
    notas: null,
  },
  {
    id: 'session-demo-3',
    clienteId: demoClientIds.marta,
    clienteNombre: 'Marta Vega',
    tipoSesionId: demoSessionTypeIds.entrenamiento,
    tipoSesionNombre: 'Entrenamiento personal',
    tipoSesionColor: '#3B82F6',
    titulo: 'Onboarding',
    modalidad: 'online',
    fechaHora: demoSessionDate(0, 16, 30),
    duracionMinutos: 30,
    estado: 'programada',
    origen: 'cliente',
    notas: null,
  },
  {
    id: 'session-demo-4',
    clienteId: demoClientIds.javier,
    clienteNombre: 'Javier Molina',
    tipoSesionId: demoSessionTypeIds.fisioterapia,
    tipoSesionNombre: 'Fisioterapia',
    tipoSesionColor: '#EC4899',
    titulo: 'Revisión rodilla',
    modalidad: 'presencial',
    fechaHora: demoSessionDate(2, 10, 0),
    duracionMinutos: 45,
    estado: 'programada',
    origen: 'entrenador',
    notas: null,
  },
  {
    id: 'session-demo-5',
    clienteId: demoClientIds.diego,
    clienteNombre: 'Diego Núñez',
    tipoSesionId: demoSessionTypeIds.nutricion,
    tipoSesionNombre: 'Nutrición',
    tipoSesionColor: '#FF6A00',
    titulo: 'Revisión nutricional',
    modalidad: 'online',
    fechaHora: demoSessionDate(3, 18, 0),
    duracionMinutos: 30,
    estado: 'programada',
    origen: 'cliente',
    notas: null,
  },
  {
    id: 'session-demo-6',
    clienteId: demoClientIds.laura,
    clienteNombre: 'Laura Martín',
    tipoSesionId: demoSessionTypeIds.entrenamiento,
    tipoSesionNombre: 'Entrenamiento personal',
    tipoSesionColor: '#3B82F6',
    titulo: 'Fuerza torso',
    modalidad: 'presencial',
    fechaHora: demoSessionDate(-2, 9, 0),
    duracionMinutos: 60,
    estado: 'completada',
    origen: 'entrenador',
    notas: null,
  },
  {
    id: 'session-demo-7',
    clienteId: demoClientIds.ana,
    clienteNombre: 'Ana Torres',
    tipoSesionId: demoSessionTypeIds.entrenamiento,
    tipoSesionNombre: 'Entrenamiento personal',
    tipoSesionColor: '#3B82F6',
    titulo: 'Vuelta al ritmo',
    modalidad: 'online',
    fechaHora: demoSessionDate(-4, 17, 0),
    duracionMinutos: 45,
    estado: 'no_asistio',
    origen: 'entrenador',
    notas: null,
  },
]

const demoAvailabilitySlots: AvailabilitySlot[] = [
  { id: 'slot-demo-1', diaSemana: 0, horaInicio: '09:00', horaFin: '13:00', duracionSesionMinutos: 60, activo: true },
  { id: 'slot-demo-2', diaSemana: 1, horaInicio: '16:00', horaFin: '20:00', duracionSesionMinutos: 45, activo: true },
  { id: 'slot-demo-3', diaSemana: 3, horaInicio: '09:00', horaFin: '13:00', duracionSesionMinutos: 60, activo: true },
]

export function getDemoSessionTypes() {
  return demoSessionTypes.map((type) => ({ ...type }))
}

export function getDemoSessions() {
  return demoSessions.map((session) => ({ ...session }))
}

export function getDemoSessionsStats() {
  const rows = demoSessions.filter((s) => s.estado !== 'cancelada')
  const finished = rows.filter((s) => s.estado === 'completada' || s.estado === 'no_asistio')
  const attended = rows.filter((s) => s.estado === 'completada')

  return {
    total: rows.length,
    presenciales: rows.filter((s) => s.modalidad === 'presencial').length,
    online: rows.filter((s) => s.modalidad === 'online').length,
    asistenciaPct: finished.length ? Math.round((attended.length / finished.length) * 100) : 0,
    reservas: rows.filter((s) => s.origen === 'cliente').length,
  }
}

export function getDemoAvailabilitySlots() {
  return demoAvailabilitySlots.map((slot) => ({ ...slot }))
}
