export type FitnessGoal = 'perder-peso' | 'ganar-musculo' | 'resistencia' | 'salud-general'
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  goal: FitnessGoal | null
  created_at: string
  updated_at: string
}

export type ClienteEstado = 'Activo' | 'Riesgo' | 'Pendiente' | 'Pausado'
export type ClienteTipoProximaAccion = 'seguimiento' | 'mensaje' | 'pago' | 'plan'

export type Cliente = {
  id: string
  entrenador_id: string
  nombre: string
  email: string
  telefono: string | null
  servicio: string | null
  objetivo: string | null
  estado: ClienteEstado
  adherencia: number
  proxima_accion: string | null
  tipo_proxima_accion: ClienteTipoProximaAccion | null
  ingresos: string | null
  fecha_inicio: string | null
  ultima_conexion: string | null
  peso: string | null
  grasa_corporal: string | null
  energia: string | null
  notas: string | null
  riesgos: string[]
  etiquetas: string[]
  creado_en: string
  actualizado_en: string
}

export type PlanEntrenamiento = {
  id: string
  entrenador_id: string
  titulo: string
  categoria: string
  nivel: string
  duracion_semanas: number
  sesiones_por_semana: number
  clientes_asignados: number
  adherencia: number
  precio: string | null
  descripcion: string | null
  etiquetas: string[]
  dias: unknown
  creado_en: string
  actualizado_en: string
}

export type CheckinEstado = 'Pendiente' | 'Aprobado' | 'Requiere respuesta'
export type CheckinRiesgo = 'Bajo' | 'Medio' | 'Alto'

export type Checkin = {
  id: string
  entrenador_id: string
  cliente_id: string
  estado: CheckinEstado
  riesgo: CheckinRiesgo
  peso: string | null
  cambio_peso: string | null
  energia: number | null
  sueno: number | null
  hambre: number | null
  pasos: string | null
  adherencia: number | null
  entrenamientos: string | null
  nutricion: string | null
  comentario: string | null
  alerta: string | null
  respuesta_sugerida: string | null
  aprobado_en: string | null
  respondido_en: string | null
  creado_en: string
}

export type MensajeRemitente = 'entrenador' | 'cliente'

export type Mensaje = {
  id: string
  entrenador_id: string
  cliente_id: string
  remitente: MensajeRemitente
  contenido: string
  leido_en: string | null
  creado_en: string
}

export type PagoEstado = 'Pagado' | 'Pendiente' | 'Vencido'

export type Pago = {
  id: string
  entrenador_id: string
  cliente_id: string
  concepto: string
  monto: number
  moneda: string
  estado: PagoEstado
  enlace_pago: string | null
  vence_en: string | null
  pagado_en: string | null
  creado_en: string
}

export type ProgramaEstado = 'borrador' | 'activo' | 'archivado'
export type ProgramaTipo = 'plantilla' | 'calendarizado'
export type ProgramaVisibilidad = 'privado' | 'compartido' | 'publico'

export type Programa = {
  id: string
  entrenador_id: string
  nombre: string
  duracion_total_semanas: number
  estado: ProgramaEstado
  tipo: ProgramaTipo
  visibilidad: ProgramaVisibilidad
  permisos: Json
  creado_en: string
  actualizado_en: string
}

export type FasePrograma = {
  id: string
  programa_id: string
  nombre: string
  orden: number
  duracion_semanas: number
  creado_en: string
  actualizado_en: string
}

export type SemanaPrograma = {
  id: string
  fase_id: string
  numero_semana: number
  creado_en: string
  actualizado_en: string
}

export type EntrenamientoPrograma = {
  id: string
  semana_id: string
  dia_semana: number
  nombre: string
  franja_horaria: string | null
  notas: string | null
  creado_en: string
  actualizado_en: string
}

export type BloqueTipo = 'movilidad' | 'fuerza' | 'circuito'

export type BloqueEntrenamiento = {
  id: string
  entrenamiento_id: string
  nombre: string
  tipo: BloqueTipo
  orden: number
  creado_en: string
  actualizado_en: string
}

export type EjercicioLateralidad = 'bilateral' | 'unilateral' | 'alterno' | 'no_aplica'

export type Ejercicio = {
  id: string
  entrenador_id: string
  nombre: string
  categoria: string
  patron_movimiento: string | null
  region_corporal: string | null
  equipamiento: string[]
  lateralidad: EjercicioLateralidad
  creado_en: string
  actualizado_en: string
}

export type BloqueEjercicio = {
  id: string
  bloque_id: string
  ejercicio_id: string
  etiqueta_superserie: string | null
  series: number
  repeticiones: string
  rpe_rir: string | null
  descanso_segundos: number | null
  orden: number
  creado_en: string
  actualizado_en: string
}

export type Program = Programa
export type Phase = FasePrograma
export type Week = SemanaPrograma
export type Workout = EntrenamientoPrograma
export type Block = BloqueEntrenamiento
export type Exercise = Ejercicio
export type BlockExercise = BloqueEjercicio

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
        Relationships: []
      }
      clientes: {
        Row: Cliente
        Insert: Pick<Cliente, 'entrenador_id' | 'nombre' | 'email'> &
          Partial<Omit<Cliente, 'id' | 'entrenador_id' | 'nombre' | 'email' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<Cliente, 'id' | 'creado_en'>>
        Relationships: []
      }
      planes_entrenamiento: {
        Row: PlanEntrenamiento
        Insert: Pick<PlanEntrenamiento, 'entrenador_id' | 'titulo' | 'categoria'> &
          Partial<Omit<PlanEntrenamiento, 'id' | 'entrenador_id' | 'titulo' | 'categoria' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<PlanEntrenamiento, 'id' | 'creado_en'>>
        Relationships: []
      }
      checkins: {
        Row: Checkin
        Insert: Pick<Checkin, 'entrenador_id' | 'cliente_id'> &
          Partial<Omit<Checkin, 'id' | 'entrenador_id' | 'cliente_id' | 'creado_en'>>
        Update: Partial<Omit<Checkin, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'checkins_cliente_id_fkey'
            columns: ['cliente_id']
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      mensajes: {
        Row: Mensaje
        Insert: Pick<Mensaje, 'entrenador_id' | 'cliente_id' | 'remitente' | 'contenido'> &
          Partial<Omit<Mensaje, 'id' | 'entrenador_id' | 'cliente_id' | 'remitente' | 'contenido' | 'creado_en'>>
        Update: Partial<Omit<Mensaje, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'mensajes_cliente_id_fkey'
            columns: ['cliente_id']
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      pagos: {
        Row: Pago
        Insert: Pick<Pago, 'entrenador_id' | 'cliente_id' | 'concepto' | 'monto'> &
          Partial<Omit<Pago, 'id' | 'entrenador_id' | 'cliente_id' | 'concepto' | 'monto' | 'creado_en'>>
        Update: Partial<Omit<Pago, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'pagos_cliente_id_fkey'
            columns: ['cliente_id']
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      programas: {
        Row: Programa
        Insert: Pick<Programa, 'entrenador_id' | 'nombre' | 'duracion_total_semanas'> &
          Partial<Omit<Programa, 'id' | 'entrenador_id' | 'nombre' | 'duracion_total_semanas' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<Programa, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'programas_entrenador_id_fkey'
            columns: ['entrenador_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      fases_programa: {
        Row: FasePrograma
        Insert: Pick<FasePrograma, 'programa_id' | 'nombre' | 'orden' | 'duracion_semanas'> &
          Partial<Omit<FasePrograma, 'id' | 'programa_id' | 'nombre' | 'orden' | 'duracion_semanas' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<FasePrograma, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'fases_programa_programa_id_fkey'
            columns: ['programa_id']
            referencedRelation: 'programas'
            referencedColumns: ['id']
          },
        ]
      }
      semanas_programa: {
        Row: SemanaPrograma
        Insert: Pick<SemanaPrograma, 'fase_id' | 'numero_semana'> &
          Partial<Omit<SemanaPrograma, 'id' | 'fase_id' | 'numero_semana' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<SemanaPrograma, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'semanas_programa_fase_id_fkey'
            columns: ['fase_id']
            referencedRelation: 'fases_programa'
            referencedColumns: ['id']
          },
        ]
      }
      entrenamientos_programa: {
        Row: EntrenamientoPrograma
        Insert: Pick<EntrenamientoPrograma, 'semana_id' | 'dia_semana' | 'nombre'> &
          Partial<Omit<EntrenamientoPrograma, 'id' | 'semana_id' | 'dia_semana' | 'nombre' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<EntrenamientoPrograma, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'entrenamientos_programa_semana_id_fkey'
            columns: ['semana_id']
            referencedRelation: 'semanas_programa'
            referencedColumns: ['id']
          },
        ]
      }
      bloques_entrenamiento: {
        Row: BloqueEntrenamiento
        Insert: Pick<BloqueEntrenamiento, 'entrenamiento_id' | 'nombre' | 'tipo' | 'orden'> &
          Partial<Omit<BloqueEntrenamiento, 'id' | 'entrenamiento_id' | 'nombre' | 'tipo' | 'orden' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<BloqueEntrenamiento, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'bloques_entrenamiento_entrenamiento_id_fkey'
            columns: ['entrenamiento_id']
            referencedRelation: 'entrenamientos_programa'
            referencedColumns: ['id']
          },
        ]
      }
      ejercicios: {
        Row: Ejercicio
        Insert: Pick<Ejercicio, 'entrenador_id' | 'nombre' | 'categoria'> &
          Partial<Omit<Ejercicio, 'id' | 'entrenador_id' | 'nombre' | 'categoria' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<Ejercicio, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'ejercicios_entrenador_id_fkey'
            columns: ['entrenador_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      bloque_ejercicios: {
        Row: BloqueEjercicio
        Insert: Pick<BloqueEjercicio, 'bloque_id' | 'ejercicio_id' | 'series' | 'repeticiones' | 'orden'> &
          Partial<Omit<BloqueEjercicio, 'id' | 'bloque_id' | 'ejercicio_id' | 'series' | 'repeticiones' | 'orden' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<BloqueEjercicio, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'bloque_ejercicios_bloque_id_fkey'
            columns: ['bloque_id']
            referencedRelation: 'bloques_entrenamiento'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bloque_ejercicios_ejercicio_id_fkey'
            columns: ['ejercicio_id']
            referencedRelation: 'ejercicios'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
