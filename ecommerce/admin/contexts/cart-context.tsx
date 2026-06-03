"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchCartItems, removeCartItem, addToCart, extractVariantAttributes, updateCartItemQuantity } from "@/lib/api";
import { toast } from "sonner";

interface CartItem {
  id: string;
  variantId: string;
  /** Human-readable attribute summary e.g. "Màu: Đỏ · Size: M" */
  variantLabel: string;
  /** Variant attribute map for display e.g. { color: "Đỏ" } */
  attributes: Record<string, string>;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  loadCart: () => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  /** variantId replaces the old productId */
  addItem: (variantId: number, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const items = await fetchCartItems();

      setCartItems(
        items.map((item) => {
          // Rebuild attributes from the restored attributeValues DTO
          const attrs: Record<string, string> = {};
          if (item.attributeValues) {
            item.attributeValues.forEach(av => {
              attrs[av.name] = av.value;
            });
          }

          const variantLabel = Object.entries(attrs)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" · ") || item.sku || "Mặc định";

          const price = Number(item.effectivePrice ?? item.price ?? 0);
          
          // Normalize image URL
          const rawImg = item.variantImageUrl || item.thumbnail || "/placeholder.svg";
          const image = rawImg.startsWith("http") || rawImg.startsWith("/") 
            ? rawImg : `/${rawImg}`;

          return {
            id: String(item.id),
            variantId: String(item.variantId),
            variantLabel,
            attributes: attrs,
            slug: `${item.productName.toLowerCase().replace(/\s+/g, "-")}-${item.productId}`,
            name: item.productName,
            image,
            price,
            quantity: item.quantity,
          };
        })
      );
    } catch {
      // Silently handle – user may not be logged in
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    const item = cartItems.find((cartItem) => cartItem.id === itemId);
    if (!item) return;

    try {
      // New API: cart lines are identified by variantId
      await removeCartItem(Number(item.variantId));
      setCartItems((items) => items.filter((cartItem) => cartItem.id !== itemId));
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa sản phẩm");
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const item = cartItems.find((cartItem) => cartItem.id === itemId);
    if (!item) return;

    try {
      // New API: update by variantId (SET absolute quantity)
      await updateCartItemQuantity(Number(item.variantId), newQuantity);
      setCartItems((items) =>
        items.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
        )
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật số lượng");
    }
  };

  const addItem = async (variantId: number, quantity: number) => {
    try {
      await addToCart(variantId, quantity);
      await loadCart();
      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể thêm sản phẩm");
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, isLoading, loadCart, removeItem, updateQuantity, addItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
