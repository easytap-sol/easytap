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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      business_config: {
        Row: {
          allow_manual_repayment: boolean | null
          company_name: string
          created_at: string | null
          currency: string | null
          id: string
        }
        Insert: {
          allow_manual_repayment?: boolean | null
          company_name: string
          created_at?: string | null
          currency?: string | null
          id?: string
        }
        Update: {
          allow_manual_repayment?: boolean | null
          company_name?: string
          created_at?: string | null
          currency?: string | null
          id?: string
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          balance: number | null
          code: string
          id: string
          name: string
          type: string | null
        }
        Insert: {
          balance?: number | null
          code: string
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          balance?: number | null
          code?: string
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount: number
          credit_account_id: string | null
          debit_account_id: string | null
          description: string
          id: string
          recorded_by: string | null
          related_loan_id: string | null
          related_repayment_id: string | null
          transaction_date: string | null
        }
        Insert: {
          amount: number
          credit_account_id?: string | null
          debit_account_id?: string | null
          description: string
          id?: string
          recorded_by?: string | null
          related_loan_id?: string | null
          related_repayment_id?: string | null
          transaction_date?: string | null
        }
        Update: {
          amount?: number
          credit_account_id?: string | null
          debit_account_id?: string | null
          description?: string
          id?: string
          recorded_by?: string | null
          related_loan_id?: string | null
          related_repayment_id?: string | null
          transaction_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_credit_account_id_fkey"
            columns: ["credit_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_debit_account_id_fkey"
            columns: ["debit_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_products: {
        Row: {
          duration_days: number
          id: string
          interest_rate: number
          is_active: boolean | null
          name: string
          processing_fee: number | null
          processing_fee_fixed: number | null
          penalty_rate: number | null
          description: string | null
        }
        Insert: {
          duration_days: number
          id?: string
          interest_rate: number
          is_active?: boolean | null
          name: string
          processing_fee?: number | null
          processing_fee_fixed?: number | null
          penalty_rate?: number | null
          description?: string | null
        }
        Update: {
          duration_days?: number
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          name?: string
          processing_fee?: number | null
          processing_fee_fixed?: number | null
          penalty_rate?: number | null
          description?: string | null
        }
        Relationships: []
      }
      loans: {
        Row: {
          amount_paid: number | null
          balance_due: number | null
          created_at: string | null
          disbursed_at: string | null
          disbursed_by: string | null
          disbursement_method: string | null
          disbursement_ref: string | null
          due_date: string | null
          id: string
          interest_amount: number
          loan_ref: string
          principal_amount: number
          processing_fee: number | null
          product_id: string | null
          rejection_reason: string | null
          status: string | null
          total_payable: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          balance_due?: number | null
          created_at?: string | null
          disbursed_at?: string | null
          disbursed_by?: string | null
          disbursement_method?: string | null
          disbursement_ref?: string | null
          due_date?: string | null
          id?: string
          interest_amount: number
          loan_ref: string
          principal_amount: number
          processing_fee?: number | null
          product_id?: string | null
          rejection_reason?: string | null
          status?: string | null
          total_payable?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          balance_due?: number | null
          created_at?: string | null
          disbursed_at?: string | null
          disbursed_by?: string | null
          disbursement_method?: string | null
          disbursement_ref?: string | null
          due_date?: string | null
          id?: string
          interest_amount?: number
          loan_ref?: string
          principal_amount?: number
          processing_fee?: number | null
          product_id?: string | null
          rejection_reason?: string | null
          status?: string | null
          total_payable?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_disbursed_by_fkey"
            columns: ["disbursed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "loan_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_kyc_verified: boolean | null
          last_name: string | null
          mobile_number: string | null
          national_id: string | null
          onboarded_by: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_kyc_verified?: boolean | null
          last_name?: string | null
          mobile_number?: string | null
          national_id?: string | null
          onboarded_by?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_kyc_verified?: boolean | null
          last_name?: string | null
          mobile_number?: string | null
          national_id?: string | null
          onboarded_by?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_onboarded_by_fkey"
            columns: ["onboarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      repayments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          loan_id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          recorded_by: string | null
          transaction_ref: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          loan_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          recorded_by?: string | null
          transaction_ref?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          loan_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          recorded_by?: string | null
          transaction_ref?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repayments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repayments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      init_company: {
        Args: { admin_uuid: string; company_name: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
