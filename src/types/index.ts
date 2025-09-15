

















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
  homeDeliveryPrice: number;
  officeDeliveryPrice: number;
};

export type ShippingState = {
  id:string;
  state: string;
  defaultHomeDeliveryPrice?: number;
  defaultOfficeDeliveryPrice?: number;
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

export type PaymentMethod = 'Pay on Delivery' | 'Credit / Debit Card' | 'CIB / EDAHABIA Card' | 'Visa / Mastercard';
export type DeliveryMethod = 'Home Delivery' | 'Desk (Office) Delivery';

export type Order = {
  id: string;
  orderNumber: number;
  customer: Customer;
  date: string; // Keep as string to match Firestore data
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  paymentMethod?: PaymentMethod;
  deliveryMethod?: DeliveryMethod;
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
  deliveryMethod?: DeliveryMethod;
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
  url?: string;
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
    videoUrl?: string;
    backgroundVideoUrl?: string;
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

export type TermsPageSettings = {
    title: string;
    content: string;
};

export type PrivacyPageSettings = {
    title: string;
    content: string;
};

export type SocialLinks = {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
    mapLocationUrl?: string;
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
  termsPage: TermsPageSettings;
  privacyPage: PrivacyPageSettings;
  socialLinks: SocialLinks;
};

export type RecommendedProduct = {
  productId: string;
  usage: string;
};

export type Membership = {
  id: string;
  applicationId?: string;
  type: 'Coaching' | 'Fitness Pillar' | 'Coach/Expert';
  code: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string; // Added field for loyalty members
  coachingPlan?: string;
  coachName?: string;
  goal?: string;
  recommendedProducts: RecommendedProduct[];
  createdAt: string; // ISO 8601 string
  expiresAt?: string; // ISO 8601 string
};

export type MembershipWithProducts = Omit<Membership, 'recommendedProducts'> & {
    recommendedProducts: (RecommendedProduct & { product: Product })[];
};

export type ContactSubmission = {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string; // ISO 8601 string
    status: 'new' | 'read' | 'archived';
};

export type Plan = {
  icon: string;
  title: string;
  description: string;
  price: number;
  pricePeriod: 'month' | 'program';
  applyLink?: string;
};

export type PersonalInfo = {
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    nationality?: string;
};

export type Coach = {
  id: string;
  name: string;
  specialty: string;
  type: 'Coach' | 'Expert';
  imageUrl: string;
  rating: number; // Can be a decimal
  bio?: string;
  certifications?: string[];
  plans?: Plan[];
  personalInfo?: PersonalInfo;
  createdAt: string; // ISO 8601 string
};

export type CoachWithMembership = Coach & {
    membershipCode?: string;
};


export type CoachingApplication = {
  id: string;
  coachId: string;
  coachName: string;
  planTitle: string;
  applicant: {
    name: string;
    email: string;
    phone: string;
    countryCode: string;
    age: number;
    weight: number;
    height: number;
    goal: string;
    duration: string;
    message?: string;
  };
  createdAt: string; // ISO 8601 string
  status: 'new' | 'read' | 'contacted' | 'active' | 'rejected' | 'archived';
};
    