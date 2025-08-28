"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { CartItem, Product } from '@/types';
import { useToast } from "@/hooks/use-toast"

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, options?: { size?: string; flavor?: string; color?: string; }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, you might load the cart from localStorage
  }, []);
  
  const addToCart = (product: Product, quantity: number, options?: { size?: string; flavor?: string; color?: string; }) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.product.id === product.id &&
        item.selectedSize === options?.size &&
        item.selectedFlavor === options?.flavor &&
        item.selectedColor === options?.color
      );
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id &&
          item.selectedSize === options?.size &&
          item.selectedFlavor === options?.flavor &&
          item.selectedColor === options?.color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity, selectedSize: options?.size, selectedFlavor: options?.flavor, selectedColor: options?.color }];
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };
  
  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
