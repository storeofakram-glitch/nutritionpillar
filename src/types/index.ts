

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  buyingPrice?: number;
  quantity: number;
  category: string;
  imageUrls: string[];
  sponsored?: boolean;
  isNewArrival?: boolean;
  discountPercentage?: number;
  discountEndDate?: string; // ISO 8601 string
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
  id:string;
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

export type PaymentMethod = 'Pay on Delivery' | 'CIB Card' | 'EDAHABIA Card';

export type Order = {
  id: string;
  orderNumber: number;
  customer: Customer;
  date: string; // Keep as string to match Firestore data
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  paymentMethod?: PaymentMethod;
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
  paymentMethod?: PaymentMethod;
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
export type HeroSettings = {
    imageUrl: string;
    videoUrl?: string;
    alt: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
};

export type MarqueeMessage = {
  text: string;
  logoUrl?: string;
  logoAlt?: string;
};

export type PartnershipLogo = {
  src: string;
  alt: string;
  hint?: string;
};

export type AdBanner = {
  imageUrl: string;
  imageAlt: string;
  videoUrl?: string;
  backgroundVideoUrl?: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  counter1Value?: number;
  counter1Label?: string;
  counter2Value?: number;
  counter2Label?: string;
  flashTitle?: boolean;
};

export type AboutPageSettings = {
    title: string;
    subtitle: string;
    imageUrl: string;
    imageAlt: string;
    storyTitle: string;
    storyContent1: string;
    storyContent2: string;
    missionTitle: string;
    missionContent: string;
    visionTitle: string;
    visionContent: string;
    valuesTitle: string;
    valuesContent: string;
};

export type FaqItem = {
    question: string;
    answer: string;
};

export type FaqPageSettings = {
    title: string;
    subtitle: string;
    faqs: FaqItem[];
};

export type SiteSettings = {
  hero: HeroSettings;
  marquee: {
    messages: MarqueeMessage[];
  };
  partnershipLogos: PartnershipLogo[];
  adBanner: AdBanner;
  aboutPage: AboutPageSettings;
  faqPage: FaqPageSettings;
};

export type Membership = {
  id: string;
  type: 'Coaching' | 'Fitness Pillar';
  code: string;
  customerName: string;
  customerEmail?: string;
  coachingPlan?: string;
  goal?: string;
  recommendedProductIds: string[];
  createdAt: string; // ISO 8601 string
};

export type MembershipWithProducts = Omit<Membership, 'recommendedProductIds'> & {
    recommendedProducts: Product[];
};

export type RecommendedProduct = {
  product: Product;
  reason: string;
};
