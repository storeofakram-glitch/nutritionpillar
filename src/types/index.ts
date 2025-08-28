export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
  options?: {
    sizes?: string[];
    colors?: string[];
    flavors?: string[];
  };
};

export type CartItem = {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedFlavor?: string;
};

export type City = {
  name: string;
  price: number;
};

export type ShippingState = {
  state: string;
  cities: City[];
};

export type PromoCode = {
  code: string;
  discount: number; // can be percentage or fixed amount
  type: 'percentage' | 'fixed';
  used: boolean;
};

export type Order = {
  clientName: string;
  phone: string;
  address: string;
  state: string;
  city: string;
  shippingPrice: number;
  products: CartItem[];
  subtotal: number;
  promoCode?: {
    code: string;
    discountAmount: number;
  },
  total: number;
  status: 'pending' | 'active' | 'waiting_shipping' | 'shipped' | 'delivered' | 'canceled';
};
