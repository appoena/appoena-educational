export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  origin: string;
  caffeine: string;
  badge: string;
  imageTone: string;
  tastingNotes: string[];
  description: string;
};

export type ProductListResponse = {
  products: Product[];
  categories: string[];
  total: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartApiItem = {
  productId: string;
  quantity: number;
};

export type CheckoutPayload = {
  customer: {
    name: string;
    email: string;
    address: string;
  };
  payment: {
    method: string;
    cardNumber?: string;
    forcePaymentError?: boolean;
  };
  items: CartApiItem[];
};

export type Order = {
  id: string;
  createdAt: string;
  customer: CheckoutPayload["customer"];
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  status: string;
};

export type SupportPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: string;
};
