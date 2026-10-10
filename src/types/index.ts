export type CurrencyCode = 'USD' | 'HTG' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // e.g. 1 USD = 132 HTG, 1 USD = 0.92 EUR
}

export type ProductCategory = 
  | 'vetements-hommes'
  | 'vetements-femmes'
  | 'vetements-enfants'
  | 'chaussures'
  | 'sandales'
  | 'telephones'
  | 'ecouteurs'
  | 'cables-chargeurs'
  | 'coques'
  | 'accessoires-electroniques'
  | 'autres-accessoires';

export type ProductType = 'apparel' | 'footwear' | 'electronics' | 'standard';

export interface ProductVariant {
  id: string;
  label: string; // e.g., 'S', 'M', 'L', '42', 'Noir Titane 256GB'
  stock: number; // Exact stock available for this specific size/option
  sku?: string;
  colorHex?: string;
  priceDelta?: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userEmail?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  isVerifiedPurchase: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: ProductCategory;
  type: ProductType;
  price: number; // Base price in USD
  originalPrice?: number;
  discountPercent?: number;
  description: string;
  features: string[];
  specs: Record<string, string>;
  images: string[];
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isNewArrival?: boolean;
  isDealOfTheDay?: boolean;
  lowStockThreshold: number;
  variants: ProductVariant[]; // Sizes or options with individual stocks
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
  priceAtAddition: number;
}

export type OrderStatus = 
  | 'en_attente_paiement'
  | 'paiement_confirme'
  | 'en_preparation'
  | 'expediee'
  | 'en_cours_de_livraison'
  | 'livree'
  | 'annulee'
  | 'remboursee';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  region: string; // Département / Région / Province
  city: string;
  addressLine: string;
  postalCode?: string;
  instructions?: string;
  // Phone GPS & distance for Haitian deliveries
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  googleMapsUrl?: string;
  isGpsLocated?: boolean;
}

export interface ShippingMethod {
  id: string;
  name: string;
  estimatedDelivery: string;
  priceUSD: number;
  description: string;
}

export type PaymentMethodType = 
  | 'carte_bancaire'
  | 'moncash_natcash'
  | 'paiement_livraison'
  | 'virement_bancaire';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. CMD-2026-8491
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCodeApplied?: string;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: CurrencyCode;
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'payé' | 'en_attente' | 'remboursé';
  trackingNumber?: string;
  carrierName?: string;
  estimatedDeliveryDate: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  // MonCash / NatCash Verification & Screenshot Proof
  paymentProofImageUrl?: string;
  transactionReference?: string;
  selectedMobileWallet?: 'moncash' | 'natcash';
  adminVerifiedPayment?: boolean;
  adminVerifiedPaymentAt?: string;
  deliveryConfirmedByAdmin?: boolean;
  deliveryConfirmedAt?: string;
  // Distance delivery details (200 HTG / km)
  distanceKm?: number;
  deliveryFeeRatePerKm?: number;
  // Grace period for address typo correction (2 to 3 minutes)
  canEditAddressUntil?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses: ShippingAddress[];
  createdAt: string;
  avatarUrl?: string;
  authProvider?: 'email' | 'google' | 'phone';
  password?: string;
  isPhoneVerified?: boolean;
  commune?: string;
  department?: string;
  lastLoginAt?: string;
}

export interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10% or 15 for $15 off
  minOrderAmount: number;
  description: string;
  isActive: boolean;
  expiryDate?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  isVerified?: boolean;
}

export interface StoreCategoryItem {
  id: string;
  name: string;
  description: string;
  image: string;
  itemCount: number;
}
export type CategoryItem = StoreCategoryItem;

export interface StoreSettings {
  companyName: string;
  slogan: string;
  country: string;
  city: string;
  address: string;
  postalCode?: string;
  phone: string;
  phoneSecondary?: string;
  email: string;
  openingHours: string;
  primaryCurrency: CurrencyCode;
  taxRate: number; // e.g. 0.08 for 8%
  freeShippingThreshold: number;
  logoUrl?: string;
  logoHeight?: number;
  logoProportion?: 'compact' | 'normal' | 'grand';
  
  // MonCash & NatCash Administrator Accounts Configuration
  moncashActive: boolean;
  moncashNumber: string;
  moncashAccountName: string;
  moncashInstructions: string;
  moncashQrUrl?: string;
  
  natcashActive: boolean;
  natcashNumber: string;
  natcashAccountName: string;
  natcashInstructions: string;
  natcashQrUrl?: string;

  // Kilometric Delivery & Store Geolocation (Breffette, Cayes Sud)
  deliveryRatePerKmHTG: number; // 200 HTG/km
  deliveryHoursGuarantee: string; // '24h'
  addressCorrectionGraceMinutes: number; // 3 minutes
  storeLatitude: number; // 18.2045 (Les Cayes / Breffette)
  storeLongitude: number; // -73.7478
  
  // Hero Banner elements
  heroTitle?: string;
  heroSubtitle?: string;
  heroKicker?: string;
  heroImageUrl?: string;
  heroButtonText?: string;
  heroDealsButtonText?: string;
  
  // Announcement bar
  announcementText?: string;
  announcementActive?: boolean;

  // Trust Badges
  trustBadge1Title?: string;
  trustBadge1Desc?: string;
  trustBadge2Title?: string;
  trustBadge2Desc?: string;
  trustBadge3Title?: string;
  trustBadge3Desc?: string;
  trustBadge4Title?: string;
  trustBadge4Desc?: string;

  // Featured Promo sections on home page
  featuredSection1Title?: string;
  featuredSection1Desc?: string;
  featuredSection1Badge?: string;
  featuredSection2Title?: string;
  featuredSection2Desc?: string;
  featuredSection2Badge?: string;

  // Dynamic Home Testimonials
  testimonials: TestimonialItem[];

  // Dynamic Categories / Catalogues
  customCategories: StoreCategoryItem[];

  // Social Links
  socialLinks: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    tiktok?: string;
    youtube?: string;
  };
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'commande' | 'livraison' | 'paiement' | 'retour' | 'autre';
  message: string;
  status: 'ouvert' | 'en_cours' | 'resolu';
  createdAt: string;
  replies: {
    author: string;
    isAdmin: boolean;
    message: string;
    timestamp: string;
  }[];
}
