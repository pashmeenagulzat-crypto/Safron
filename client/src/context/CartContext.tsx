import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { CartData } from '../types';
import { fetchCart, addToCart, updateCartItem, removeCartItem, clearCart as apiClearCart } from '../utils/api';

interface CartCtx extends CartData {
  loading: boolean;
  add: (productId: number, qty?: number) => Promise<void>;
  update: (productId: number, qty: number) => Promise<void>;
  remove: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const defaultCart: CartData = { items: [], subtotal: 0, shipping: 0, total: 0, count: 0 };

const CartContext = createContext<CartCtx>({
  ...defaultCart, loading: false,
  add: async () => {}, update: async () => {}, remove: async () => {},
  clear: async () => {}, refresh: async () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartData>(defaultCart);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetchCart();
    if (res.success) setCart(res);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (productId: number, qty = 1) => {
    setLoading(true);
    const res = await addToCart(productId, qty);
    if (res.success) setCart(res);
    setLoading(false);
  }, []);

  const update = useCallback(async (productId: number, qty: number) => {
    setLoading(true);
    const res = await updateCartItem(productId, qty);
    if (res.success) setCart(res);
    setLoading(false);
  }, []);

  const remove = useCallback(async (productId: number) => {
    setLoading(true);
    const res = await removeCartItem(productId);
    if (res.success) setCart(res);
    setLoading(false);
  }, []);

  const clear = useCallback(async () => {
    setLoading(true);
    const res = await apiClearCart();
    if (res.success) setCart(res);
    setLoading(false);
  }, []);

  return (
    <CartContext.Provider value={{ ...cart, loading, add, update, remove, clear, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }
