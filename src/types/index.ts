

export type TranslatedText = {
  en: string;
  ar: string;
};

export type Language = 'en' | 'ar';

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
    description: TranslatedText;
    buttonText: TranslatedText;
    buttonLink: string;
    button2Text?: TranslatedText;
    button2Link?: string;
};

export type CoreService = {
  title: TranslatedText;
  description: TranslatedText;
  buttonText: TranslatedText;
  buttonLink: string;
};

export type CoreServicesSettings = {
  heading: TranslatedText;
  subheading: TranslatedText;
  services: [CoreService, CoreService]; 
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
  title: TranslatedText;
  description: TranslatedText;
  buttonText: TranslatedText;
  buttonLink: string;
  counter1Value?: number;
  counter1Label?: TranslatedText;
  counter2Value?: number;
  counter2Label?: TranslatedText;
  flashTitle?: boolean;
};

export type AboutPageSettings = {
    title: TranslatedText;
    subtitle: TranslatedText;
    imageUrl: string;
    imageAlt: string;
    videoUrl?: string;
    backgroundVideoUrl?: string;
    storyTitle: TranslatedText;
    storyContent1: TranslatedText;
    storyContent2: TranslatedText;
    missionTitle: TranslatedText;
    missionContent: TranslatedText;
    visionTitle: TranslatedText;
    visionContent: TranslatedText;
    valuesTitle: TranslatedText;
    valuesContent: TranslatedText;
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
  coreServices: CoreServicesSettings;
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
  language: Language;
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
  uid?: string;
};

export type MembershipWithProducts = Omit<Membership, 'recommendedProducts'> & {
    recommendedProducts: (RecommendedProduct & { product: Product })[];
    applicant?: CoachingApplication['applicant'];
};

export type ContactSubmission = {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string; // ISO 8601 string
    status: 'new' | 'archived';
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

export type CoachFinancials = {
    id: string;
    coachId: string;
    commissionRate: number; // e.g., 70 for 70%
    totalEarnings: number;
    paidOut: number;
    pendingPayout: number;
};

export type CoachWithFinancials = Coach & Partial<Omit<CoachFinancials, 'id' | 'coachId'>>;


export type ClientPayment = {
    id: string;
    clientId: string; // Corresponds to CoachingApplication ID
    clientName: string;
    coachId: string;
    coachName: string;
    planTitle: string;
    amount: number;
    paymentDate: string; // ISO 8601
    status: 'paid' | 'pending' | 'overdue';
    coachShare: number; // Calculated amount for the coach
};

export type CoachPayout = {
    id: string;
    coachId: string;
    clientPaymentId: string;
    clientName: string;
    planTitle: string;
    amount: number; // This is the coach's share
    payoutDate: string; // ISO 8601
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: 'bank_transfer' | 'cash' | 'other';
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
    nutritionPlanUrl?: string;
    trainingPlanUrl?: string;
  };
  createdAt: string; // ISO 8601 string
  status: 'new' | 'contacted' | 'active' | 'rejected' | 'archived';
};

export type Admin = {
  id: string; // Firebase Auth UID
  email: string;
  displayName: string;
  role: 'admin';
  permissions: string[];
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  isActive: boolean;
};
    
