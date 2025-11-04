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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          project_type: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          project_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          project_type?: string | null
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          acheteur_id: string | null
          created_at: string | null
          date_assignation: string | null
          date_livraison: string | null
          id: string
          livreur_id: string | null
          order_id: string | null
          statut: string
          tracking_code: string | null
          vendeur_id: string | null
        }
        Insert: {
          acheteur_id?: string | null
          created_at?: string | null
          date_assignation?: string | null
          date_livraison?: string | null
          id?: string
          livreur_id?: string | null
          order_id?: string | null
          statut?: string
          tracking_code?: string | null
          vendeur_id?: string | null
        }
        Update: {
          acheteur_id?: string | null
          created_at?: string | null
          date_assignation?: string | null
          date_livraison?: string | null
          id?: string
          livreur_id?: string | null
          order_id?: string | null
          statut?: string
          tracking_code?: string | null
          vendeur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_acheteur_id_fkey"
            columns: ["acheteur_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_livreur_id_fkey"
            columns: ["livreur_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_vendeur_id_fkey"
            columns: ["vendeur_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          canal: string | null
          created_at: string | null
          id: string
          message: string
          user_id: string | null
        }
        Insert: {
          canal?: string | null
          created_at?: string | null
          id?: string
          message: string
          user_id?: string | null
        }
        Update: {
          canal?: string | null
          created_at?: string | null
          id?: string
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          acheteur_id: string | null
          created_at: string | null
          id: string
          livreur_id: string | null
          montant: number
          produit_id: string | null
          quantite: number
          reference_gateway: string | null
          statut: string
          vendeur_id: string | null
        }
        Insert: {
          acheteur_id?: string | null
          created_at?: string | null
          id?: string
          livreur_id?: string | null
          montant: number
          produit_id?: string | null
          quantite?: number
          reference_gateway?: string | null
          statut?: string
          vendeur_id?: string | null
        }
        Update: {
          acheteur_id?: string | null
          created_at?: string | null
          id?: string
          livreur_id?: string | null
          montant?: number
          produit_id?: string | null
          quantite?: number
          reference_gateway?: string | null
          statut?: string
          vendeur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_acheteur_id_fkey"
            columns: ["acheteur_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_livreur_id_fkey"
            columns: ["livreur_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendeur_id_fkey"
            columns: ["vendeur_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string | null
          debloque_at: string | null
          id: string
          mode: string | null
          montant: number
          order_id: string | null
          reference_gateway: string | null
          statut: string
        }
        Insert: {
          created_at?: string | null
          debloque_at?: string | null
          id?: string
          mode?: string | null
          montant: number
          order_id?: string | null
          reference_gateway?: string | null
          statut?: string
        }
        Update: {
          created_at?: string | null
          debloque_at?: string | null
          id?: string
          mode?: string | null
          montant?: number
          order_id?: string | null
          reference_gateway?: string | null
          statut?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          categorie: string | null
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          nom: string
          prix: number
          shop_id: string | null
          statut: string | null
          stock: number | null
          vendeur_id: string | null
        }
        Insert: {
          categorie?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          nom: string
          prix: number
          shop_id?: string | null
          statut?: string | null
          stock?: number | null
          vendeur_id?: string | null
        }
        Update: {
          categorie?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          nom?: string
          prix?: number
          shop_id?: string | null
          statut?: string | null
          stock?: number | null
          vendeur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendeur_id_fkey"
            columns: ["vendeur_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string
          id: string
          image: string
          link: string
          tags: string[]
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image: string
          link: string
          tags?: string[]
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image?: string
          link?: string
          tags?: string[]
          title?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          adresse: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          nom_boutique: string
          site_web: string | null
          statut: string
          telephone: string | null
          updated_at: string | null
          vendeur_id: string
        }
        Insert: {
          adresse?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nom_boutique: string
          site_web?: string | null
          statut?: string
          telephone?: string | null
          updated_at?: string | null
          vendeur_id: string
        }
        Update: {
          adresse?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nom_boutique?: string
          site_web?: string | null
          statut?: string
          telephone?: string | null
          updated_at?: string | null
          vendeur_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          entreprise: string | null
          id: string
          nom: string
          pays: string | null
          statut: string | null
          telephone: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          entreprise?: string | null
          id: string
          nom: string
          pays?: string | null
          statut?: string | null
          telephone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          entreprise?: string | null
          id?: string
          nom?: string
          pays?: string | null
          statut?: string | null
          telephone?: string | null
        }
        Relationships: []
      }
      validations: {
        Row: {
          acheteur_ok: boolean | null
          id: string
          livreur_ok: boolean | null
          order_id: string | null
          updated_at: string | null
          vendeur_ok: boolean | null
        }
        Insert: {
          acheteur_ok?: boolean | null
          id?: string
          livreur_ok?: boolean | null
          order_id?: string | null
          updated_at?: string | null
          vendeur_ok?: boolean | null
        }
        Update: {
          acheteur_ok?: boolean | null
          id?: string
          livreur_ok?: boolean | null
          order_id?: string | null
          updated_at?: string | null
          vendeur_ok?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "validations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "acheteur"
        | "vendeur"
        | "livreur"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "acheteur",
        "vendeur",
        "livreur",
      ],
    },
  },
} as const
