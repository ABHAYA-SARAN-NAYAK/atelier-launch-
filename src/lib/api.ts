/**
 * Atelier Launch — API Client
 * Type-safe wrapper around all Edge Function endpoints.
 */

import { supabase, callEdgeFunction } from "./supabase";

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: "buyer" | "student" | "pro_designer";
  profile_image_url?: string;
  created_at: string;
}

export interface DesignerProfile {
  id: string;
  user_id: string;
  school_name: string;
  graduation_year: number;
  verification_status: "pending" | "verified" | "rejected";
  specialization?: string;
  bio?: string;
  portfolio_images: string[];
  instagram_handle?: string;
  user?: User;
  follower_count?: number;
  active_collections?: number;
}

export interface Collection {
  id: string;
  designer_id: string;
  title: string;
  description?: string;
  drop_start_date: string;
  drop_end_date: string;
  status: "draft" | "live" | "ended";
  created_at: string;
  designer?: User & { designer_profiles?: DesignerProfile[] };
  products?: Product[];
  follower_count?: number;
}

export interface Product {
  id: string;
  collection_id: string;
  name: string;
  description?: string;
  price: number;
  quantity_available: number;
  sizes_available: string[];
  primary_image_url: string;
  gallery_images: string[];
  materials_used?: string;
  care_instructions?: string;
  status: "available" | "sold_out";
}

export interface Order {
  id: string;
  buyer_id: string;
  product_id: string;
  designer_id: string;
  quantity: number;
  total_amount: number;
  platform_commission: number;
  designer_payout: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "refunded" | "cancelled";
  shipping_address: Record<string, string>;
  created_at: string;
  product?: Product;
  designer?: User;
  buyer?: User;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_size: string;
  product?: Product & {
    collection?: Collection & {
      designer?: User;
    };
  };
  is_available?: boolean;
}

export interface DesignerAnalytics {
  total_revenue: number;
  total_orders: number;
  products_sold: number;
  active_collections: number;
  followers_count: number;
}

// ============================================================================
// AUTH
// ============================================================================

export const auth = {
  async signup(data: {
    email: string;
    password: string;
    full_name: string;
    user_type: "buyer" | "student" | "pro_designer";
    school_name?: string;
    graduation_year?: number;
    specialization?: string;
  }) {
    return callEdgeFunction("auth-signup", {
      method: "POST",
      body: data,
    });
  },

  async login(email: string, password: string) {
    return callEdgeFunction("auth-login", {
      method: "POST",
      body: { email, password },
    });
  },

  async logout() {
    return supabase.auth.signOut();
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ============================================================================
// COLLECTIONS
// ============================================================================

export const collections = {
  async list(params?: {
    status?: string;
    designer_id?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.designer_id) queryParams.designer_id = params.designer_id;
    if (params?.sort) queryParams.sort = params.sort;
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.offset) queryParams.offset = params.offset.toString();

    return callEdgeFunction<{ collections: Collection[]; total: number }>(
      "collections",
      { params: queryParams }
    );
  },

  async getById(id: string) {
    return callEdgeFunction<Collection>(`collections/${id}`);
  },

  async create(data: {
    title: string;
    description?: string;
    drop_start_date: string;
    drop_end_date: string;
  }) {
    return callEdgeFunction<Collection>("collections", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: Partial<Collection>) {
    return callEdgeFunction<Collection>(`collections/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  async delete(id: string) {
    return callEdgeFunction(`collections/${id}`, { method: "DELETE" });
  },
};

// ============================================================================
// PRODUCTS
// ============================================================================

export const products = {
  async create(data: {
    collection_id: string;
    name: string;
    description?: string;
    price: number;
    quantity_available?: number;
    sizes_available?: string[];
    primary_image_url: string;
    gallery_images?: string[];
    materials_used?: string;
    care_instructions?: string;
  }) {
    return callEdgeFunction<Product>("products", {
      method: "POST",
      body: data,
    });
  },

  async update(id: string, data: Partial<Product>) {
    return callEdgeFunction<Product>(`products/${id}`, {
      method: "PUT",
      body: data,
    });
  },
};

// ============================================================================
// DESIGNERS
// ============================================================================

export const designers = {
  async list(params?: {
    school_name?: string;
    specialization?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams: Record<string, string> = {};
    if (params?.school_name) queryParams.school_name = params.school_name;
    if (params?.specialization) queryParams.specialization = params.specialization;
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.offset) queryParams.offset = params.offset.toString();

    return callEdgeFunction<{ designers: DesignerProfile[] }>("designers", {
      params: queryParams,
    });
  },

  async getById(id: string) {
    return callEdgeFunction<DesignerProfile>(`designers/${id}`);
  },
};

// ============================================================================
// FOLLOWS
// ============================================================================

export const follows = {
  async follow(designerId: string) {
    return callEdgeFunction("follows", {
      method: "POST",
      body: { designer_id: designerId },
    });
  },

  async unfollow(designerId: string) {
    return callEdgeFunction(`follows/${designerId}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// CART
// ============================================================================

export const cart = {
  async get() {
    return callEdgeFunction<{ cart_items: CartItem[] }>("cart");
  },

  async add(data: {
    product_id: string;
    quantity: number;
    selected_size: string;
  }) {
    return callEdgeFunction<CartItem>("cart", {
      method: "POST",
      body: data,
    });
  },

  async update(itemId: string, quantity: number) {
    return callEdgeFunction<CartItem>(`cart/${itemId}`, {
      method: "PUT",
      body: { quantity },
    });
  },

  async remove(itemId: string) {
    return callEdgeFunction(`cart/${itemId}`, { method: "DELETE" });
  },
};

// ============================================================================
// CHECKOUT
// ============================================================================

export const checkout = {
  async createSession(data: {
    cart_item_ids: string[];
    shipping_address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  }) {
    return callEdgeFunction<{ session_id: string; session_url: string }>(
      "checkout",
      { method: "POST", body: data }
    );
  },
};

// ============================================================================
// ORDERS
// ============================================================================

export const orders = {
  async list() {
    return callEdgeFunction<{ orders: Order[] }>("orders");
  },

  async updateStatus(orderId: string, status: "shipped" | "delivered") {
    return callEdgeFunction<Order>(`orders/${orderId}/status`, {
      method: "PUT",
      body: { status },
    });
  },
};

// ============================================================================
// ANALYTICS
// ============================================================================

export const analytics = {
  async getDesignerAnalytics() {
    return callEdgeFunction<{
      analytics: DesignerAnalytics;
      recent_orders: Order[];
      top_products: Array<{
        product_id: string;
        name: string;
        image: string;
        count: number;
        revenue: number;
      }>;
    }>("analytics");
  },
};

// ============================================================================
// FILE UPLOADS
// ============================================================================

export const upload = {
  async profileImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload/profile-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) return { data: null, error: data.error };
    return { data, error: null };
  },

  async portfolioImages(files: File[]) {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload/portfolio-images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) return { data: null, error: data.error };
    return { data, error: null };
  },

  async productImages(files: File[], collectionId: string, productId?: string) {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("collection_id", collectionId);
    if (productId) formData.append("product_id", productId);

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload/product-images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) return { data: null, error: data.error };
    return { data, error: null };
  },
};

// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

export const realtime = {
  /** Subscribe to collection changes (for live countdown) */
  subscribeToCollection(
    collectionId: string,
    callback: (payload: unknown) => void
  ) {
    return supabase
      .channel(`collection:${collectionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "collections",
          filter: `id=eq.${collectionId}`,
        },
        callback
      )
      .subscribe();
  },

  /** Subscribe to product changes (for inventory updates) */
  subscribeToProduct(
    productId: string,
    callback: (payload: unknown) => void
  ) {
    return supabase
      .channel(`product:${productId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
          filter: `id=eq.${productId}`,
        },
        callback
      )
      .subscribe();
  },

  /** Subscribe to order updates for a specific buyer */
  subscribeToOrders(
    buyerId: string,
    callback: (payload: unknown) => void
  ) {
    return supabase
      .channel(`orders:${buyerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `buyer_id=eq.${buyerId}`,
        },
        callback
      )
      .subscribe();
  },

  /** Unsubscribe from a channel */
  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    return supabase.removeChannel(channel);
  },
};
