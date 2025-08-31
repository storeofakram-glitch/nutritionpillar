




export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  buyingPrice?: number;
  quantity: number;
  category: string;
  imageUrl: string;
  sponsored?: boolean;
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

export type Customer = {
  name: string;
  email: string;
}

export type OrderItem = {
    product: Product;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    selectedFlavor?: string;
}

export type Order = {
  id: string;
  orderNumber: number;
  customer: Customer;
  date: string; // Keep as string to match Firestore data
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    phone: string;
  };
  items: OrderItem[];
};

export type OrderItemInput = {
    productId: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    selectedFlavor?: string;
}

export type OrderInput = {
  customer: Customer;
  shippingAddress: Order['shippingAddress'];
  items: OrderItemInput[];
};

export type Expense = {
    id: string;
    description: string;
    amount: number;
    date: string;
};

export type Transaction = {
    id: string;
    type: 'Revenue' | 'Expense';
    description: string;
    date: string;
    amount: number;
}

export type MonthlyFinanceData = {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
};


// Types for Site Appearance Settings
export type MarqueeMessage = {
  text: string;
};

export type PartnershipLogo = {
  src: string;
  alt: string;
  hint?: string;
};

export type AdBanner = {
  imageUrl: string;
  alt: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

export type SiteSettings = {
  marquee: {
    messages: MarqueeMessage[];
  };
  partnershipLogos: PartnershipLogo[];
  adBanner: AdBanner;
};
