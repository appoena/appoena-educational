import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { addRumAction } from "./datadog";
import type { CartApiItem, CartItem, Product } from "./types";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toApiItems: () => CartApiItem[];
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "tea-shop-demo-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readCartFromStorage());
  const [isCartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = roundMoney(
      items.reduce((total, item) => total + item.product.price * item.quantity, 0)
    );

    return {
      items,
      itemCount,
      subtotal,
      isCartOpen,
      addItem(product, quantity = 1) {
        const normalizedQuantity = Math.max(1, quantity);
        setItems((currentItems) => {
          const existingItem = currentItems.find((item) => item.product.id === product.id);

          if (!existingItem) {
            return [...currentItems, { product, quantity: normalizedQuantity }];
          }

          return currentItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + normalizedQuantity }
              : item
          );
        });
        addRumAction("product_added_to_cart", {
          productId: product.id,
          productName: product.name,
          category: product.category,
          quantity: normalizedQuantity
        });
      },
      updateQuantity(productId, quantity) {
        const normalizedQuantity = Math.max(1, Math.min(99, quantity));
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.product.id === productId ? { ...item, quantity: normalizedQuantity } : item
          )
        );
      },
      removeItem(productId) {
        setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
        addRumAction("cart_item_removed", { productId });
      },
      clearCart() {
        setItems([]);
      },
      openCart() {
        setCartOpen(true);
      },
      closeCart() {
        setCartOpen(false);
      },
      toApiItems() {
        return items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity
        }));
      }
    };
  }, [isCartOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

function readCartFromStorage() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
