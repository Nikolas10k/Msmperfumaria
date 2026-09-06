// Tipos do schema Supabase (mantidos manualmente em espelho a
// supabase/migrations/0001_init.sql). Ao alterar o schema, atualizar aqui.

export type UserRole = "admin" | "staff";
export type ProductGender = "masculino" | "feminino" | "unissex";
export type FragranceType =
  | "eau_de_parfum"
  | "eau_de_toilette"
  | "eau_de_cologne"
  | "parfum"
  | "eau_fraiche";
export type DiscountType = "percentage" | "fixed_amount";
export type CampaignScope = "all" | "products" | "categories" | "brands";
export type CampaignTargetType = "product" | "category" | "brand";
export type BannerPlacement = "hero" | "secondary" | "category_top";
export type OrderStatus =
  | "novo"
  | "pagamento_pendente"
  | "pago"
  | "em_preparacao"
  | "enviado"
  | "saiu_para_entrega"
  | "entregue"
  | "cancelado";
export type PaymentMethod = "pix" | "credit_card" | "debit_card";
export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded";
export type ShippingMethodType = "standard" | "express_brasilia";
export type NotificationRecipient = "admin" | "customer";

// `Relationships` é exigido pelo tipo `GenericTable` do postgrest-js — sem ele
// a checagem estrutural falha silenciosamente e todo o schema vira `never`.
type TableDef<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

export interface Database {
  public: {
    Tables: {
      users: TableDef<
        {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          is_active: boolean;
          created_at: string;
        },
        { id: string; name: string; email: string; role?: UserRole; is_active?: boolean }
      >;
      customers: TableDef<
        {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          cpf: string | null;
          created_at: string;
          updated_at: string;
        },
        { id: string; name: string; email: string; phone?: string | null; cpf?: string | null }
      >;
      addresses: TableDef<
        {
          id: string;
          customer_id: string;
          label: string;
          recipient_name: string;
          cep: string;
          street: string;
          number: string;
          complement: string | null;
          neighborhood: string;
          city: string;
          state: string;
          is_default: boolean;
          created_at: string;
        },
        {
          id?: string;
          customer_id: string;
          label: string;
          recipient_name: string;
          cep: string;
          street: string;
          number: string;
          complement?: string | null;
          neighborhood: string;
          city: string;
          state: string;
          is_default?: boolean;
        }
      >;
      brands: TableDef<
        {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
        },
        { id?: string; name: string; slug: string; logo_url?: string | null; description?: string | null; is_active?: boolean }
      >;
      categories: TableDef<
        {
          id: string;
          name: string;
          slug: string;
          image_url: string | null;
          description: string | null;
          parent_id: string | null;
          position: number;
          is_active: boolean;
          created_at: string;
        },
        {
          id?: string;
          name: string;
          slug: string;
          image_url?: string | null;
          description?: string | null;
          parent_id?: string | null;
          position?: number;
          is_active?: boolean;
        }
      >;
      products: TableDef<
        {
          id: string;
          brand_id: string;
          name: string;
          slug: string;
          gender: ProductGender;
          fragrance_type: FragranceType;
          fragrance_family: string;
          top_notes: string[];
          heart_notes: string[];
          base_notes: string[];
          description: string;
          is_active: boolean;
          is_original: boolean;
          is_bestseller: boolean;
          is_new_arrival: boolean;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          brand_id: string;
          name: string;
          slug: string;
          gender: ProductGender;
          fragrance_type: FragranceType;
          fragrance_family: string;
          top_notes?: string[];
          heart_notes?: string[];
          base_notes?: string[];
          description?: string;
          is_active?: boolean;
          is_original?: boolean;
          is_bestseller?: boolean;
          is_new_arrival?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
        }
      >;
      product_categories: TableDef<
        { product_id: string; category_id: string },
        { product_id: string; category_id: string }
      >;
      product_images: TableDef<
        {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          position: number;
          is_primary: boolean;
          created_at: string;
        },
        { id?: string; product_id: string; url: string; alt_text?: string | null; position?: number; is_primary?: boolean }
      >;
      product_variants: TableDef<
        {
          id: string;
          product_id: string;
          sku: string;
          volume_ml: number;
          price: number;
          compare_at_price: number | null;
          installments_max: number;
          barcode: string | null;
          position: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          product_id: string;
          sku: string;
          volume_ml: number;
          price: number;
          compare_at_price?: number | null;
          installments_max?: number;
          barcode?: string | null;
          position?: number;
          is_active?: boolean;
        }
      >;
      inventory: TableDef<
        { variant_id: string; quantity: number; low_stock_threshold: number; updated_at: string },
        { variant_id: string; quantity?: number; low_stock_threshold?: number }
      >;
      shipping_methods: TableDef<
        {
          id: string;
          name: string;
          description: string | null;
          type: ShippingMethodType;
          base_price: number;
          is_active: boolean;
          created_at: string;
        },
        { id?: string; name: string; description?: string | null; type: ShippingMethodType; base_price?: number; is_active?: boolean }
      >;
      shipping_regions: TableDef<
        {
          id: string;
          shipping_method_id: string;
          name: string;
          cep_range_start: string;
          cep_range_end: string;
          fee: number;
          delivery_days_min: number;
          delivery_days_max: number;
          cutoff_time: string;
          active_weekdays: number[];
          is_active: boolean;
          created_at: string;
        },
        {
          id?: string;
          shipping_method_id: string;
          name: string;
          cep_range_start: string;
          cep_range_end: string;
          fee?: number;
          delivery_days_min?: number;
          delivery_days_max?: number;
          cutoff_time?: string;
          active_weekdays?: number[];
          is_active?: boolean;
        }
      >;
      campaigns: TableDef<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          discount_type: DiscountType;
          discount_value: number;
          scope: CampaignScope;
          starts_at: string;
          ends_at: string;
          is_active: boolean;
          created_at: string;
        },
        {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          discount_type: DiscountType;
          discount_value: number;
          scope?: CampaignScope;
          starts_at: string;
          ends_at: string;
          is_active?: boolean;
        }
      >;
      campaign_targets: TableDef<
        { campaign_id: string; target_type: CampaignTargetType; target_id: string },
        { campaign_id: string; target_type: CampaignTargetType; target_id: string }
      >;
      promotions: TableDef<
        {
          id: string;
          variant_id: string;
          promo_price: number;
          starts_at: string;
          ends_at: string;
          is_active: boolean;
          created_at: string;
        },
        { id?: string; variant_id: string; promo_price: number; starts_at: string; ends_at: string; is_active?: boolean }
      >;
      coupons: TableDef<
        {
          id: string;
          code: string;
          discount_type: DiscountType;
          discount_value: number;
          min_order_value: number;
          max_uses: number | null;
          max_uses_per_customer: number;
          starts_at: string;
          ends_at: string;
          is_active: boolean;
          created_at: string;
        },
        {
          id?: string;
          code: string;
          discount_type: DiscountType;
          discount_value: number;
          min_order_value?: number;
          max_uses?: number | null;
          max_uses_per_customer?: number;
          starts_at: string;
          ends_at: string;
          is_active?: boolean;
        }
      >;
      coupon_usages: TableDef<
        { id: string; coupon_id: string; customer_id: string; order_id: string; used_at: string },
        { id?: string; coupon_id: string; customer_id: string; order_id: string }
      >;
      banners: TableDef<
        {
          id: string;
          title: string;
          subtitle: string | null;
          image_url: string;
          image_url_mobile: string | null;
          link_url: string | null;
          placement: BannerPlacement;
          position: number;
          starts_at: string;
          ends_at: string | null;
          is_active: boolean;
          created_at: string;
        },
        {
          id?: string;
          title: string;
          subtitle?: string | null;
          image_url: string;
          image_url_mobile?: string | null;
          link_url?: string | null;
          placement?: BannerPlacement;
          position?: number;
          starts_at?: string;
          ends_at?: string | null;
          is_active?: boolean;
        }
      >;
      orders: TableDef<
        {
          id: string;
          order_number: string;
          customer_id: string;
          status: OrderStatus;
          subtotal: number;
          discount_total: number;
          shipping_fee: number;
          total: number;
          coupon_id: string | null;
          shipping_method_id: string | null;
          shipping_region_id: string | null;
          shipping_address: Record<string, unknown>;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          customer_id: string;
          status?: OrderStatus;
          subtotal: number;
          discount_total?: number;
          shipping_fee?: number;
          total: number;
          coupon_id?: string | null;
          shipping_method_id?: string | null;
          shipping_region_id?: string | null;
          shipping_address: Record<string, unknown>;
          notes?: string | null;
        }
      >;
      order_items: TableDef<
        {
          id: string;
          order_id: string;
          variant_id: string;
          product_name: string;
          brand_name: string;
          variant_label: string;
          sku: string;
          unit_price: number;
          quantity: number;
          total: number;
        },
        {
          id?: string;
          order_id: string;
          variant_id: string;
          product_name: string;
          brand_name: string;
          variant_label: string;
          sku: string;
          unit_price: number;
          quantity: number;
          total: number;
        }
      >;
      payments: TableDef<
        {
          id: string;
          order_id: string;
          method: PaymentMethod;
          status: PaymentStatus;
          amount: number;
          installments: number;
          gateway: string;
          gateway_payment_id: string | null;
          gateway_payload: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          order_id: string;
          method: PaymentMethod;
          status?: PaymentStatus;
          amount: number;
          installments?: number;
          gateway?: string;
          gateway_payment_id?: string | null;
          gateway_payload?: Record<string, unknown> | null;
        }
      >;
      reviews: TableDef<
        {
          id: string;
          product_id: string;
          customer_id: string;
          order_item_id: string | null;
          rating: number;
          title: string | null;
          comment: string | null;
          is_approved: boolean;
          created_at: string;
        },
        {
          id?: string;
          product_id: string;
          customer_id: string;
          order_item_id?: string | null;
          rating: number;
          title?: string | null;
          comment?: string | null;
          is_approved?: boolean;
        }
      >;
      favorites: TableDef<
        { id: string; customer_id: string; product_id: string; created_at: string },
        { id?: string; customer_id: string; product_id: string }
      >;
      cart_items: TableDef<
        {
          id: string;
          customer_id: string;
          variant_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        },
        { id?: string; customer_id: string; variant_id: string; quantity?: number }
      >;
      notifications: TableDef<
        {
          id: string;
          recipient_type: NotificationRecipient;
          recipient_id: string | null;
          type: string;
          title: string;
          message: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        },
        {
          id?: string;
          recipient_type: NotificationRecipient;
          recipient_id?: string | null;
          type: string;
          title: string;
          message: string;
          link?: string | null;
          is_read?: boolean;
        }
      >;
      audit_logs: TableDef<
        {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          changes: Record<string, unknown> | null;
          created_at: string;
        },
        {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          changes?: Record<string, unknown> | null;
        }
      >;
      store_settings: TableDef<
        {
          id: true;
          whatsapp_number: string | null;
          support_email: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          tiktok_url: string | null;
          footer_about: string | null;
          footer_cnpj: string | null;
          business_hours: string | null;
          updated_at: string;
        },
        {
          whatsapp_number?: string | null;
          support_email?: string | null;
          instagram_url?: string | null;
          facebook_url?: string | null;
          tiktok_url?: string | null;
          footer_about?: string | null;
          footer_cnpj?: string | null;
          business_hours?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      decrement_inventory: {
        Args: { p_variant_id: string; p_quantity: number };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      product_gender: ProductGender;
      fragrance_type: FragranceType;
      discount_type: DiscountType;
      campaign_scope: CampaignScope;
      campaign_target_type: CampaignTargetType;
      banner_placement: BannerPlacement;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      shipping_method_type: ShippingMethodType;
      notification_recipient: NotificationRecipient;
    };
  };
}
