import axios from 'axios';
import type {
  ProductsResponse, ProductResponse, CategoriesResponse,
  CartResponse, AuthResponse, OrderPlaceResponse, CheckoutFormData,
} from '../types';
import { DEMO_PRODUCTS, DEMO_CATEGORIES, DEMO_BANNERS } from '../data/products';

// ─── Use demo data since no live PHP backend is required in this context ─────
// Switch USE_DEMO to false when a real PHP backend is running.
export const USE_DEMO = true;

const api = axios.create({ baseURL: '/api', withCredentials: true });

function sleep(ms = 300) { return new Promise(r => setTimeout(r, ms)); }

// ─── Products ────────────────────────────────────────────────────────────────

export async function fetchProducts(params: {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
} = {}): Promise<ProductsResponse> {
  if (USE_DEMO) {
    await sleep();
    let items = [...DEMO_PRODUCTS];
    if (params.category) items = items.filter(p => p.category_slug === params.category);
    if (params.search)   items = items.filter(p => p.name.toLowerCase().includes(params.search!.toLowerCase()));
    if (params.featured) items = items.filter(p => p.is_featured);
    if (params.sort === 'price_asc')  items.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
    if (params.sort === 'price_desc') items.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
    if (params.sort === 'rating')     items.sort((a, b) => b.rating - a.rating);
    const limit = params.limit ?? 12;
    const page  = params.page  ?? 1;
    const total = items.length;
    const sliced = items.slice((page - 1) * limit, page * limit);
    return { success: true, products: sliced, total, page, pages: Math.ceil(total / limit) };
  }
  const res = await api.get<ProductsResponse>('/products.php', { params });
  return res.data;
}

export async function fetchProduct(slug: string): Promise<ProductResponse> {
  if (USE_DEMO) {
    await sleep();
    const product = DEMO_PRODUCTS.find(p => p.slug === slug);
    if (!product) return { success: false, product: null };
    return { success: true, product };
  }
  const res = await api.get<ProductResponse>('/products.php', { params: { slug } });
  return res.data;
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  if (USE_DEMO) {
    await sleep();
    return { success: true, categories: DEMO_CATEGORIES };
  }
  const res = await api.get<CategoriesResponse>('/products.php', { params: { action: 'categories' } });
  return res.data;
}

export async function fetchBanners() {
  if (USE_DEMO) { await sleep(); return { success: true, banners: DEMO_BANNERS }; }
  const res = await api.get('/banners.php');
  return res.data;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

const CART_KEY = 'safron_cart';

type LocalCartItem = { product_id: number; quantity: number };

function getLocalCart(): LocalCartItem[] {
  try { return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]'); }
  catch { return []; }
}
function saveLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function buildCartResponse(): CartResponse {
  const raw = getLocalCart();
  const items = raw.map(r => {
    const p = DEMO_PRODUCTS.find(pr => pr.id === r.product_id)!;
    if (!p) return null;
    const unit = p.sale_price ?? p.price;
    return {
      id: r.product_id,
      product_id: r.product_id,
      quantity: r.quantity,
      name: p.name,
      slug: p.slug,
      image: p.image,
      price: p.price,
      sale_price: p.sale_price,
      stock_quantity: p.stock,
      unit_price: unit,
      total: unit * r.quantity,
    };
  }).filter(Boolean) as CartResponse['items'];
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  return { success: true, items, subtotal, shipping, total: subtotal + shipping, count: items.reduce((s, i) => s + i.quantity, 0) };
}

export async function fetchCart(): Promise<CartResponse> {
  if (USE_DEMO) { await sleep(100); return buildCartResponse(); }
  const res = await api.get<CartResponse>('/cart.php');
  return res.data;
}

export async function addToCart(product_id: number, quantity = 1): Promise<CartResponse> {
  if (USE_DEMO) {
    const cart = getLocalCart();
    const idx = cart.findIndex(i => i.product_id === product_id);
    if (idx >= 0) cart[idx].quantity += quantity; else cart.push({ product_id, quantity });
    saveLocalCart(cart);
    await sleep(100);
    return buildCartResponse();
  }
  const res = await api.post<CartResponse>('/cart.php', { action: 'add', product_id, quantity });
  return res.data;
}

export async function updateCartItem(product_id: number, quantity: number): Promise<CartResponse> {
  if (USE_DEMO) {
    const cart = getLocalCart();
    const idx = cart.findIndex(i => i.product_id === product_id);
    if (quantity <= 0) { cart.splice(idx, 1); } else if (idx >= 0) { cart[idx].quantity = quantity; }
    saveLocalCart(cart);
    await sleep(100);
    return buildCartResponse();
  }
  const res = await api.post<CartResponse>('/cart.php', { action: 'update', product_id, quantity });
  return res.data;
}

export async function removeCartItem(product_id: number): Promise<CartResponse> {
  return updateCartItem(product_id, 0);
}

export async function clearCart(): Promise<CartResponse> {
  if (USE_DEMO) { saveLocalCart([]); await sleep(100); return buildCartResponse(); }
  const res = await api.post<CartResponse>('/cart.php', { action: 'clear' });
  return res.data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function login(mobile: string, password: string): Promise<AuthResponse> {
  if (USE_DEMO) {
    await sleep();
    if (mobile === '9999999999' && password === 'demo123') {
      const user = { id: 1, name: 'Demo User', mobile, email: 'demo@safron.in', is_verified: true };
      localStorage.setItem('safron_user', JSON.stringify(user));
      return { success: true, message: 'Logged in', user };
    }
    return { success: false, message: 'Invalid credentials. Use mobile: 9999999999 / password: demo123' };
  }
  const res = await api.post<AuthResponse>('/auth.php', { action: 'login', mobile, password });
  return res.data;
}

export async function signup(data: { name: string; mobile: string; email?: string; password: string }): Promise<AuthResponse> {
  if (USE_DEMO) {
    await sleep();
    return { success: true, message: 'OTP sent', user_id: 1, otp: '123456' };
  }
  const res = await api.post<AuthResponse>('/auth.php', { action: 'signup', ...data });
  return res.data;
}

export async function logout(): Promise<void> {
  if (USE_DEMO) { localStorage.removeItem('safron_user'); return; }
  await api.post('/auth.php', { action: 'logout' });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function placeOrder(data: CheckoutFormData): Promise<OrderPlaceResponse> {
  if (USE_DEMO) {
    await sleep(600);
    const cart = buildCartResponse();
    clearCart();
    const num = `SAF-${Date.now().toString().slice(-8)}`;
    return { success: true, message: 'Order placed', order_number: num, order_id: 1, total: cart.total };
  }
  const res = await api.post<OrderPlaceResponse>('/orders.php', { action: 'place', ...data });
  return res.data;
}
