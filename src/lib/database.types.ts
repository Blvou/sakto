export type PreferredLang = 'en' | 'tl';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          preferred_lang: PreferredLang;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          preferred_lang?: PreferredLang;
          created_at?: string;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          preferred_lang?: PreferredLang;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          seller_id: string;
          title: string;
          price: number;
          image_url: string | null;
          location: string | null;
          description: string | null;
          category: string | null;
          status: 'active' | 'sold' | 'archived';
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          title: string;
          price: number;
          image_url?: string | null;
          location?: string | null;
          description?: string | null;
          category?: string | null;
          status?: 'active' | 'sold' | 'archived';
          created_at?: string;
        };
        Update: {
          title?: string;
          price?: number;
          image_url?: string | null;
          location?: string | null;
          description?: string | null;
          category?: string | null;
          status?: 'active' | 'sold' | 'archived';
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          listing_id: string | null;
          buyer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id?: string | null;
          buyer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          updated_at?: string;
        };
        Relationships: [];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          user_id: string;
          last_read_at: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          last_read_at?: string;
        };
        Update: {
          last_read_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          body?: string;
        };
        Relationships: [];
      };
      message_translations: {
        Row: {
          id: string;
          message_id: string;
          target_lang: PreferredLang;
          translated_body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          target_lang: PreferredLang;
          translated_body: string;
          created_at?: string;
        };
        Update: {
          translated_body?: string;
        };
        Relationships: [];
      };
      message_receipts: {
        Row: {
          message_id: string;
          user_id: string;
          delivered_at: string;
        };
        Insert: {
          message_id: string;
          user_id: string;
          delivered_at?: string;
        };
        Update: {
          delivered_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          brand: string;
          model: string;
          year: number | null;
          price_per_day: number;
          location: string;
          city: string | null;
          lat: number | null;
          lng: number | null;
          instant_booking: boolean;
          status: 'draft' | 'active' | 'paused' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          brand: string;
          model: string;
          year?: number | null;
          price_per_day: number;
          location: string;
          city?: string | null;
          lat?: number | null;
          lng?: number | null;
          instant_booking?: boolean;
          status?: 'draft' | 'active' | 'paused' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          brand?: string;
          model?: string;
          year?: number | null;
          price_per_day?: number;
          location?: string;
          city?: string | null;
          lat?: number | null;
          lng?: number | null;
          instant_booking?: boolean;
          status?: 'draft' | 'active' | 'paused' | 'archived';
          updated_at?: string;
        };
        Relationships: [];
      };
      vehicle_photos: {
        Row: {
          id: string;
          vehicle_id: string;
          storage_path: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          storage_path: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          storage_path?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      vehicle_availability_blocks: {
        Row: {
          id: string;
          vehicle_id: string;
          start_date: string;
          end_date: string;
          reason: 'owner_block' | 'booking';
          booking_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          start_date: string;
          end_date: string;
          reason?: 'owner_block' | 'booking';
          booking_id?: string | null;
          created_at?: string;
        };
        Update: {
          start_date?: string;
          end_date?: string;
          reason?: 'owner_block' | 'booking';
          booking_id?: string | null;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          vehicle_id: string;
          renter_id: string;
          owner_id: string;
          start_date: string;
          end_date: string;
          days: number;
          price_per_day: number;
          service_fee: number;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          renter_id: string;
          owner_id: string;
          start_date: string;
          end_date: string;
          days: number;
          price_per_day: number;
          service_fee?: number;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
          message?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_conversation_previews: {
        Args: {
          p_user_id: string;
          p_limit?: number;
          p_cursor?: string | null;
        };
        Returns: {
          id: string;
          listing_id: string | null;
          listing_title: string | null;
          listing_image_url: string | null;
          other_user_id: string;
          other_user_display_name: string;
          other_user_avatar_url: string | null;
          other_user_preferred_lang: PreferredLang;
          last_message: string | null;
          last_message_at: string;
          unread_count: number;
        }[];
      };
      get_unread_total: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_or_create_conversation: {
        Args: { p_listing_id: string; p_buyer_id: string };
        Returns: {
          id: string;
          listing_id: string;
          listing_title: string | null;
          listing_image_url: string | null;
          other_user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
            preferred_lang: PreferredLang;
          };
        };
      };
      get_thread_snapshot: {
        Args: {
          p_conversation_id: string;
          p_user_id: string;
          p_message_limit?: number;
        };
        Returns: {
          other_user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
            preferred_lang: PreferredLang;
          };
          listing_title: string | null;
          messages: {
            id: string;
            conversation_id: string;
            sender_id: string;
            body: string;
            created_at: string;
          }[];
          has_more_messages: boolean;
          recipient_last_read_at: string | null;
          delivered_message_ids: string[];
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
