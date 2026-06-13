export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          id: string;
          dashboard_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          trigger_type: string;
          trigger_value: Json | null;
          is_secret: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          dashboard_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          trigger_type: string;
          trigger_value?: Json | null;
          is_secret?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          dashboard_id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          trigger_type?: string;
          trigger_value?: Json | null;
          is_secret?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "achievements_dashboard_id_fkey";
            columns: ["dashboard_id"];
            isOneToOne: false;
            referencedRelation: "dashboards";
            referencedColumns: ["id"];
          },
        ];
      };
      connections: {
        Row: {
          id: string;
          dashboard_id: string;
          source_widget_id: string;
          source_output: string;
          target_widget_id: string;
          target_input: string;
          multiplier: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          dashboard_id: string;
          source_widget_id: string;
          source_output: string;
          target_widget_id: string;
          target_input: string;
          multiplier?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          dashboard_id?: string;
          source_widget_id?: string;
          source_output?: string;
          target_widget_id?: string;
          target_input?: string;
          multiplier?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connections_dashboard_id_fkey";
            columns: ["dashboard_id"];
            isOneToOne: false;
            referencedRelation: "dashboards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_source_widget_id_fkey";
            columns: ["source_widget_id"];
            isOneToOne: false;
            referencedRelation: "widgets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_target_widget_id_fkey";
            columns: ["target_widget_id"];
            isOneToOne: false;
            referencedRelation: "widgets";
            referencedColumns: ["id"];
          },
        ];
      };
      dashboards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          dashboard_id: string;
          widget_id: string;
          user_id: string;
          event_type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          dashboard_id: string;
          widget_id: string;
          user_id: string;
          event_type: string;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          dashboard_id?: string;
          widget_id?: string;
          user_id?: string;
          event_type?: string;
          payload?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_dashboard_id_fkey";
            columns: ["dashboard_id"];
            isOneToOne: false;
            referencedRelation: "dashboards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_widget_id_fkey";
            columns: ["widget_id"];
            isOneToOne: false;
            referencedRelation: "widgets";
            referencedColumns: ["id"];
          },
        ];
      };
      widget_state: {
        Row: {
          widget_id: string;
          state: Json;
          updated_at: string;
        };
        Insert: {
          widget_id: string;
          state?: Json;
          updated_at?: string;
        };
        Update: {
          widget_id?: string;
          state?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "widget_state_widget_id_fkey";
            columns: ["widget_id"];
            isOneToOne: true;
            referencedRelation: "widgets";
            referencedColumns: ["id"];
          },
        ];
      };
      widgets: {
        Row: {
          id: string;
          dashboard_id: string;
          type: string;
          config: Json;
          layout: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          dashboard_id: string;
          type: string;
          config?: Json;
          layout?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          dashboard_id?: string;
          type?: string;
          config?: Json;
          layout?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "widgets_dashboard_id_fkey";
            columns: ["dashboard_id"];
            isOneToOne: false;
            referencedRelation: "dashboards";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Achievement = Tables<"achievements">;
export type Connection = Tables<"connections">;
export type Dashboard = Tables<"dashboards">;
export type Event = Tables<"events">;
export type WidgetState = Tables<"widget_state">;
export type Widget = Tables<"widgets">;
