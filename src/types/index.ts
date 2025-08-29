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
  id: string;
  state: string;
  cities: City[];
};

export type PromoCode = {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  expiresAt: Date;
  isActive: boolean;
  used: boolean;
};

export type Order = {
  id: string;
  customer: {
    name: string;
    email: string;
  };
  date: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    phone: string;
  };
  items: CartItem[];
};
