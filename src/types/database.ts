export type FitnessGoal = 'perder-peso' | 'ganar-musculo' | 'resistencia' | 'salud-general'
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  goal: FitnessGoal | null
  codigo_invitacion: string | null
  created_at: string
  updated_at: string
}

export type ClienteEstado = 'Activo' | 'Riesgo' | 'Pendiente' | 'Pausado'
export type ClienteTipoProximaAccion = 'seguimiento' | 'mensaje' | 'pago' | 'plan'

export type Cliente = {
  id: string
  entrenador_id: string
  user_id: string | null
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
  grupo: string | null
  favorito: boolean
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
  cliente_id: string | null
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

export type SuscripcionPush = {
  id: string
  usuario_id: string | null
  endpoint: string
  p256dh: string
  auth_key: string
  dispositivo: string | null
  navegador: string | null
  user_agent: string | null
  creado_en: string
  usado_en: string
}

export type NotificacionTipo = string

export type Notificacion = {
  id: string
  usuario_id: string
  tipo: NotificacionTipo
  titulo: string
  cuerpo: string | null
  datos: Json
  leido: boolean
  creado_en: string
}

export type CuestionarioBienestar = {
  id: string
  entrenador_id: string
  cliente_id: string
  sueno: number
  estres: number
  dolor: number
  energia: number
  notas: string | null
  creado_en: string
}

export type TestFisicoCategoria = 'fuerza' | 'resistencia' | 'flexibilidad' | 'medidas' | 'otro'

export type TestFisico = {
  id: string
  entrenador_id: string
  cliente_id: string
  categoria: TestFisicoCategoria
  nombre: string
  valor: number
  unidad: string
  fecha_test: string
  notas: string | null
  creado_en: string
}

export type ResumenIaEstado = 'optimo' | 'estable' | 'atencion' | 'riesgo'

export type ResumenIa = {
  id: string
  entrenador_id: string
  cliente_id: string
  estado_general: ResumenIaEstado
  resumen: string
  puntos_clave: string[]
  recomendacion: string
  modelo: string
  generado_en: string
}

export type TipoSesion = {
  id: string
  entrenador_id: string
  nombre: string
  color: string
  creado_en: string
  actualizado_en: string
}

export type FranjaHorario = {
  id: string
  entrenador_id: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  duracion_sesion_minutos: number
  activo: boolean
  creado_en: string
  actualizado_en: string
}

export type SesionModalidad = 'presencial' | 'online'
export type SesionEstado = 'programada' | 'completada' | 'cancelada' | 'no_asistio'
export type SesionOrigen = 'entrenador' | 'cliente'

export type Sesion = {
  id: string
  entrenador_id: string
  cliente_id: string
  tipo_sesion_id: string | null
  titulo: string
  modalidad: SesionModalidad
  fecha_hora: string
  duracion_minutos: number
  estado: SesionEstado
  origen: SesionOrigen
  notas: string | null
  creado_en: string
  actualizado_en: string
}

export type OnboardingEstado = {
  entrenador_id: string
  descartado: boolean
  descartado_en: string | null
  creado_en: string
  actualizado_en: string
}

export type RecursosAyuda = {
  id: string
  manual_url: string | null
  video_url: string | null
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
      suscripciones_push: {
        Row: SuscripcionPush
        Insert: Pick<SuscripcionPush, 'endpoint' | 'p256dh' | 'auth_key'> &
          Partial<Omit<SuscripcionPush, 'id' | 'endpoint' | 'p256dh' | 'auth_key' | 'creado_en'>>
        Update: Partial<Omit<SuscripcionPush, 'id' | 'creado_en'>>
        Relationships: []
      }
      notificaciones: {
        Row: Notificacion
        Insert: Pick<Notificacion, 'usuario_id' | 'tipo' | 'titulo'> &
          Partial<Omit<Notificacion, 'id' | 'usuario_id' | 'tipo' | 'titulo' | 'creado_en'>>
        Update: Partial<Omit<Notificacion, 'id' | 'creado_en'>>
        Relationships: []
      }
      cuestionarios_bienestar: {
        Row: CuestionarioBienestar
        Insert: Pick<CuestionarioBienestar, 'entrenador_id' | 'cliente_id' | 'sueno' | 'estres' | 'dolor' | 'energia'> &
          Partial<Omit<CuestionarioBienestar, 'id' | 'entrenador_id' | 'cliente_id' | 'sueno' | 'estres' | 'dolor' | 'energia' | 'creado_en'>>
        Update: Partial<Omit<CuestionarioBienestar, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'cuestionarios_bienestar_cliente_id_fkey'
            columns: ['cliente_id']
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      tests_fisicos: {
        Row: TestFisico
        Insert: Pick<TestFisico, 'entrenador_id' | 'cliente_id' | 'categoria' | 'nombre' | 'valor' | 'unidad'> &
          Partial<Omit<TestFisico, 'id' | 'entrenador_id' | 'cliente_id' | 'categoria' | 'nombre' | 'valor' | 'unidad' | 'creado_en'>>
        Update: Partial<Omit<TestFisico, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'tests_fisicos_cliente_id_fkey'
            columns: ['cliente_id']
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      resumenes_ia: {
        Row: ResumenIa
        Insert: Pick<ResumenIa, 'entrenador_id' | 'cliente_id' | 'estado_general' | 'resumen' | 'recomendacion' | 'modelo'> &
          Partial<Omit<ResumenIa, 'id' | 'entrenador_id' | 'cliente_id' | 'estado_general' | 'resumen' | 'recomendacion' | 'modelo' | 'generado_en'>>
        Update: Partial<Omit<ResumenIa, 'id' | 'generado_en'>>
        Relationships: [
          {
            foreignKeyName: 'resumenes_ia_cliente_id_fkey'
            columns: ['cliente_id']
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      tipos_sesion: {
        Row: TipoSesion
        Insert: Pick<TipoSesion, 'entrenador_id' | 'nombre'> &
          Partial<Omit<TipoSesion, 'id' | 'entrenador_id' | 'nombre' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<TipoSesion, 'id' | 'creado_en'>>
        Relationships: []
      }
      franjas_horario: {
        Row: FranjaHorario
        Insert: Pick<FranjaHorario, 'entrenador_id' | 'dia_semana' | 'hora_inicio' | 'hora_fin'> &
          Partial<Omit<FranjaHorario, 'id' | 'entrenador_id' | 'dia_semana' | 'hora_inicio' | 'hora_fin' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<FranjaHorario, 'id' | 'creado_en'>>
        Relationships: []
      }
      sesiones: {
        Row: Sesion
        Insert: Pick<Sesion, 'entrenador_id' | 'cliente_id' | 'titulo' | 'modalidad' | 'fecha_hora'> &
          Partial<Omit<Sesion, 'id' | 'entrenador_id' | 'cliente_id' | 'titulo' | 'modalidad' | 'fecha_hora' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<Sesion, 'id' | 'creado_en'>>
        Relationships: [
          {
            foreignKeyName: 'sesiones_cliente_id_fkey'
            columns: ['cliente_id']
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sesiones_tipo_sesion_id_fkey'
            columns: ['tipo_sesion_id']
            referencedRelation: 'tipos_sesion'
            referencedColumns: ['id']
          },
        ]
      }
      onboarding_estado: {
        Row: OnboardingEstado
        Insert: Pick<OnboardingEstado, 'entrenador_id'> & Partial<Omit<OnboardingEstado, 'entrenador_id' | 'creado_en' | 'actualizado_en'>>
        Update: Partial<Omit<OnboardingEstado, 'entrenador_id' | 'creado_en'>>
        Relationships: []
      }
      recursos_ayuda: {
        Row: RecursosAyuda
        Insert: Partial<Omit<RecursosAyuda, 'id'>>
        Update: Partial<Omit<RecursosAyuda, 'id'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      claim_client_invite: {
        Args: Record<string, never>
        Returns: Cliente
      }
      claim_client_invite_by_code: {
        Args: { p_code: string }
        Returns: Cliente
      }
      touch_client_last_seen: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
