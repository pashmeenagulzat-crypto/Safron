// ─── Core domain types ──────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count: number;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  sale_price: number | null;
  discount: number;
  sku: string;
  stock: number;
  weight: string;
  origin: string;
  image: string;
  is_featured: boolean;
  rating: number;
  review_count: number;
  category_name: string;
  category_slug: string;
  badge?: string;         // e.g. "New", "Bestseller", "Limited"
  tags?: string[];        // e.g. ["ayurvedic", "organic"]
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number | null;
  name: string;
  user_name: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  unit_price: number;
  total: number;
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
}

export interface User {
  id: number;
  name: string;
  mobile: string;
  email: string;
  is_verified: boolean;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Order {
  id: number;
  order_number: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: 'cod' | 'online';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes: string;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  button_text: string;
}

// ─── API response wrappers ───────────────────────────────────────────────────

export interface ApiOk<T> {
  success: true;
  data: T;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface ProductResponse {
  success: boolean;
  product: Product | null;
}

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

export interface CartResponse {
  success: boolean;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  user_id?: number;
  otp?: string; // dev only
}

export interface OrderPlaceResponse {
  success: boolean;
  message: string;
  order_number?: string;
  order_id?: number;
  total?: number;
}

// ─── Component props helpers ─────────────────────────────────────────────────

export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'rating' | 'newest';

export interface CheckoutFormData {
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: 'cod' | 'online';
  notes: string;
}
