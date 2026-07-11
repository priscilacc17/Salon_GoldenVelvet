export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categoria_servicios: {
        Row: {
          created_at: string
          descripcion: string | null
          estado: string
          id: string
          imagen_url: string | null
          nombre: string
          orden: number | null
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          estado?: string
          id?: string
          imagen_url?: string | null
          nombre: string
          orden?: number | null
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          estado?: string
          id?: string
          imagen_url?: string | null
          nombre?: string
          orden?: number | null
        }
        Relationships: []
      }
      pagos: {
        Row: {
          cliente_id: string
          estado: string
          fecha_pago: string
          id: string
          metodo: string
          monto: number
          nota: string | null
          reserva_id: string | null
          tipo: string
        }
        Insert: {
          cliente_id: string
          estado?: string
          fecha_pago?: string
          id?: string
          metodo: string
          monto: number
          nota?: string | null
          reserva_id?: string | null
          tipo?: string
        }
        Update: {
          cliente_id?: string
          estado?: string
          fecha_pago?: string
          id?: string
          metodo?: string
          monto?: number
          nota?: string | null
          reserva_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagos_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_personalizados: {
        Row: {
          cliente_id: string
          descripcion: string | null
          estado: string
          fecha: string
          id: string
        }
        Insert: {
          cliente_id: string
          descripcion?: string | null
          estado?: string
          fecha?: string
          id?: string
        }
        Update: {
          cliente_id?: string
          descripcion?: string | null
          estado?: string
          fecha?: string
          id?: string
        }
        Relationships: []
      }
      peluqueros: {
        Row: {
          created_at: string
          dni: string | null
          email: string | null
          especialidad: string | null
          estado: string
          fecha_ingreso: string
          foto_url: string | null
          horario: string | null
          id: string
          nombre_completo: string
          telefono: string | null
        }
        Insert: {
          created_at?: string
          dni?: string | null
          email?: string | null
          especialidad?: string | null
          estado?: string
          fecha_ingreso?: string
          foto_url?: string | null
          horario?: string | null
          id?: string
          nombre_completo: string
          telefono?: string | null
        }
        Update: {
          created_at?: string
          dni?: string | null
          email?: string | null
          especialidad?: string | null
          estado?: string
          fecha_ingreso?: string
          foto_url?: string | null
          horario?: string | null
          id?: string
          nombre_completo?: string
          telefono?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          direccion: string | null
          dni: string | null
          email: string
          estado: string
          fecha_nacimiento: string | null
          id: string
          metodo_auth: string
          nombre_completo: string
          telefono: string | null
        }
        Insert: {
          created_at?: string
          direccion?: string | null
          dni?: string | null
          email: string
          estado?: string
          fecha_nacimiento?: string | null
          id: string
          metodo_auth?: string
          nombre_completo: string
          telefono?: string | null
        }
        Update: {
          created_at?: string
          direccion?: string | null
          dni?: string | null
          email?: string
          estado?: string
          fecha_nacimiento?: string | null
          id?: string
          metodo_auth?: string
          nombre_completo?: string
          telefono?: string | null
        }
        Relationships: []
      }
      reservas: {
        Row: {
          cliente_id: string
          created_at: string
          estado: string
          fecha: string
          hora: string
          id: string
          peluquero_id: string
          servicio_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          estado?: string
          fecha: string
          hora: string
          id?: string
          peluquero_id: string
          servicio_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          estado?: string
          fecha?: string
          hora?: string
          id?: string
          peluquero_id?: string
          servicio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_peluquero_id_fkey"
            columns: ["peluquero_id"]
            isOneToOne: false
            referencedRelation: "peluqueros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios: {
        Row: {
          categoria_id: string | null
          created_at: string
          descripcion: string | null
          duracion_min: number
          estado: string
          id: string
          imagen_url: string | null
          imagenes_carrusel: Json | null
          nombre: string
          orden: number | null
          precio: number
          requisitos_previos: string | null
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          descripcion?: string | null
          duracion_min?: number
          estado?: string
          id?: string
          imagen_url?: string | null
          imagenes_carrusel?: Json | null
          nombre: string
          orden?: number | null
          precio: number
          requisitos_previos?: string | null
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          descripcion?: string | null
          duracion_min?: number
          estado?: string
          id?: string
          imagen_url?: string | null
          imagenes_carrusel?: Json | null
          nombre?: string
          orden?: number | null
          precio?: number
          requisitos_previos?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servicios_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categoria_servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "cliente"],
    },
  },
} as const