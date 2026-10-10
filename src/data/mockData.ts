import { 
  CurrencyConfig, 
  Product, 
  ProductCategory, 
  PromoCode, 
  ShippingMethod, 
  StoreSettings, 
  User 
} from '../types';

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dollar américain (USD)',
    rateToUSD: 1,
  },
  HTG: {
    code: 'HTG',
    symbol: 'HTG',
    name: 'Gourde haïtienne (HTG)',
    rateToUSD: 132.5,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (EUR)',
    rateToUSD: 0.92,
  },
};

export const CATEGORIES_LIST: {
  id: ProductCategory;
  name: string;
  description: string;
  image: string;
  itemCount: number;
}[] = [
  {
    id: 'vetements-hommes',
    name: 'Vêtements Hommes',
    description: 'Chemises, vestes, pantalons et basiques premium',
    image: '/src/assets/images/product_denim_overshirt_1791556307757.jpg',
    itemCount: 14,
  },
  {
    id: 'vetements-femmes',
    name: 'Vêtements Femmes',
    description: 'Robes élégantes, cardigans et tenues décontractées',
    image: '/src/assets/images/hero_commerce_lifestyle_1791556272110.jpg',
    itemCount: 18,
  },
  {
    id: 'vetements-enfants',
    name: 'Vêtements Enfants',
    description: 'Ensembles confortables en coton doux et durable',
    image: '/src/assets/images/hero_commerce_lifestyle_1791556272110.jpg',
    itemCount: 9,
  },
  {
    id: 'chaussures',
    name: 'Chaussures',
    description: 'Sneakers urbaines, mocassins et souliers raffinés',
    image: '/src/assets/images/product_athletic_sneaker_1791556284082.jpg',
    itemCount: 16,
  },
  {
    id: 'sandales',
    name: 'Sandales',
    description: 'Sandales en cuir véritable et claquettes d’été',
    image: '/src/assets/images/product_athletic_sneaker_1791556284082.jpg',
    itemCount: 8,
  },
  {
    id: 'telephones',
    name: 'Téléphones',
    description: 'Smartphones haut de gamme et reconditionnés certifiés',
    image: '/src/assets/images/product_flagship_smartphone_1791556318281.jpg',
    itemCount: 6,
  },
  {
    id: 'ecouteurs',
    name: 'Écouteurs & Audio',
    description: 'Casques sans fil, écouteurs intra-auriculaires ANC',
    image: '/src/assets/images/product_wireless_headphones_1791556297638.jpg',
    itemCount: 11,
  },
  {
    id: 'cables-chargeurs',
    name: 'Câbles & Chargeurs',
    description: 'Chargeurs GaN rapides, câbles tressés ultra résistants',
    image: '/src/assets/images/product_flagship_smartphone_1791556318281.jpg',
    itemCount: 15,
  },
  {
    id: 'coques',
    name: 'Coques de Protection',
    description: 'Coques antichoc, finition silicone et compatibilité MagSafe',
    image: '/src/assets/images/product_flagship_smartphone_1791556318281.jpg',
    itemCount: 12,
  },
  {
    id: 'accessoires-electroniques',
    name: 'Accessoires Électroniques',
    description: 'Supports bureau, hubs USB-C et batteries portables',
    image: '/src/assets/images/hero_commerce_lifestyle_1791556272110.jpg',
    itemCount: 10,
  },
  {
    id: 'autres-accessoires',
    name: 'Autres Accessoires',
    description: 'Sacs, ceintures en cuir et accessoires du quotidien',
    image: '/src/assets/images/hero_commerce_lifestyle_1791556272110.jpg',
    itemCount: 7,
  },
];

// Catalogue initial vide : prêt pour vos vrais produits (images, prix, tailles et stocks)
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'ship-standard',
    name: 'Livraison Kilométrique Locale (200 G/km)',
    estimatedDelivery: 'Garantie sous 24h',
    priceUSD: 1.5, // ~200 HTG / km base
    description: 'Calcul automatique par distance GPS (200 Gourdes / km) depuis Breffette, Cayes Sud',
  },
  {
    id: 'ship-express',
    name: 'Livraison Express Garantie 24h',
    estimatedDelivery: 'Moins de 24 heures',
    priceUSD: 3.5, // ~460 HTG
    description: 'Livraison urgente en main propre sous 24h avec repérage carte téléphonique',
  },
  {
    id: 'ship-pickup',
    name: 'Retrait Gratuit à la Boutique (Breffette, Cayes Sud)',
    estimatedDelivery: 'Disponible immédiatement',
    priceUSD: 0,
    description: 'Retrait sans frais à notre magasin à Breffette, Cayes Sud, Haïti (Code postal 8110)',
  },
];

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    code: 'BIENVENUE10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 30, // ~4 000 HTG
    description: '10% de réduction pour votre première commande',
    isActive: true,
  },
  {
    code: 'STEEVE2500',
    type: 'fixed',
    value: 20, // ~2 600 HTG
    minOrderAmount: 80, // ~10 500 HTG
    description: 'Remise immédiate pour tout achat supérieur à 10 000 G',
    isActive: true,
  },
  {
    code: 'LIVRAISONGRATUITE',
    type: 'fixed',
    value: 5,
    minOrderAmount: 40,
    description: 'Livraison standard offerte en Haïti',
    isActive: true,
  },
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  companyName: 'STEEVE ACCESSOIRE',
  slogan: 'L’Excellence des Accessoires, Vêtements, Sneakers & High-Tech',
  country: 'Haïti',
  city: 'Les Cayes (Sud)',
  address: 'Breffette, Cayes Sud',
  postalCode: '8110',
  phone: '+509 5602 7710',
  phoneSecondary: '+509 4005 4375',
  email: 'contact@steeveaccessoire.com',
  openingHours: 'Lun - Sam : 08h00 - 18h00 (Service client 7j/7)',
  primaryCurrency: 'HTG',
  taxRate: 0.10, // 10%
  freeShippingThreshold: 75, // ~10 000 HTG
  logoUrl: '',
  logoHeight: 40,
  logoProportion: 'normal',

  // MonCash & NatCash Admin Accounts (Critères: virement client + capture d'écran)
  moncashActive: true,
  moncashNumber: '+509 5602 7710',
  moncashAccountName: 'STEEVE ACCESSOIRE (Admin)',
  moncashInstructions: 'Effectuez votre transfert MonCash vers ce numéro. Faites une capture d\'écran claire de la transaction reçue et joignez-la ci-dessous pour validation par l\'administrateur.',
  moncashQrUrl: '',

  natcashActive: true,
  natcashNumber: '+509 4005 4375',
  natcashAccountName: 'STEEVE ACCESSOIRE (Admin)',
  natcashInstructions: 'Effectuez votre transfert Natcash vers ce numéro. Faites une capture d\'écran claire de la transaction reçue et joignez-la ci-dessous pour validation par l\'administrateur.',
  natcashQrUrl: '',

  // Tarification kilométrique et Géolocalisation (Breffette, Cayes Sud)
  deliveryRatePerKmHTG: 200, // 200 gourdes pour chaque kilomètre parcouru
  deliveryHoursGuarantee: '24h', // Délai de livraison garanti de 24h
  addressCorrectionGraceMinutes: 3, // Correction d'adresse permise dans les 2 à 3 minutes
  storeLatitude: 18.2045, // Breffette, Les Cayes, Haïti
  storeLongitude: -73.7478,

  // Announcement Bar
  announcementText: 'Livraison express 24h à Breffette, Cayes Sud & partout en Haïti · Tarification kilométrique à 200 G/km · Service client : +509 5602 7710',
  announcementActive: true,

  // Hero Section
  heroTitle: 'L’excellence des accessoires & du style à votre portée.',
  heroSubtitle: 'Bienvenue chez STEEVE ACCESSOIRE aux Cayes. Retrouvez vos vêtements, chaussures, téléphones et accessoires de premier choix avec livraison rapide sous 24h à Breffette, dans le Sud et partout en Haïti.',
  heroKicker: 'Boutique Officielle · Breffette, Cayes Sud (Code Postal : 8110)',
  heroImageUrl: '',
  heroButtonText: 'Découvrir le catalogue',
  heroDealsButtonText: 'Voir les promotions (-25%)',

  // Trust Badges
  trustBadge1Title: 'Livraison Rapide 24h',
  trustBadge1Desc: '200 G/km depuis Breffette, Cayes Sud & expédition sécurisée',
  trustBadge2Title: 'MonCash & Natcash Vérifiés',
  trustBadge2Desc: 'Transfert direct + validation sur capture d\'écran par l\'admin',
  trustBadge3Title: 'Retours & Modifications',
  trustBadge3Desc: 'Correction d\'adresse sous 3 min & retours garantis',
  trustBadge4Title: 'Service Client 7j/7',
  trustBadge4Desc: 'Assistance directe : +509 5602 7710 / +509 4005 4375',

  // Featured Promo Sections
  featuredSection1Title: 'Accessoires & Chaussures Tendance',
  featuredSection1Desc: 'Des pièces sélectionnées avec soin pour un style soigné au quotidien.',
  featuredSection1Badge: 'Nouveautés 2026',
  featuredSection2Title: 'High-Tech & Connectivité',
  featuredSection2Desc: 'Smartphones, écouteurs sans fil et chargeurs rapides certifiés.',
  featuredSection2Badge: 'Haute Performance',

  // Dynamic Testimonials
  testimonials: [
    {
      id: 'test-1',
      name: 'Jean-Luc Pierre',
      location: 'Les Cayes (Bourdet)',
      rating: 5,
      comment: 'Service ultra rapide ! J\'ai payé par MonCash, envoyé ma capture d\'écran et ma commande a été livrée en moins de 24h avec le calcul kilométrique exact.',
      isVerified: true
    },
    {
      id: 'test-2',
      name: 'Marie-Claire Dorcé',
      location: 'Breffette, Cayes Sud',
      rating: 5,
      comment: 'Boutique très sérieuse à Breffette. J\'avais fait une petite erreur dans mon adresse et j\'ai pu la corriger en 2 minutes dans le suivi de commande.',
      isVerified: true
    },
    {
      id: 'test-3',
      name: 'Frédéric Laurent',
      location: 'Port-Salut',
      rating: 5,
      comment: 'Paiement Natcash fluide avec l\'administrateur. Qualité irréprochable des accessoires et livraison soignée.',
      isVerified: true
    }
  ],

  // Default Categories Catalog (Purged demo catalogues, clean base for admin)
  customCategories: [
    {
      id: 'vetements-hommes',
      name: 'Vêtements Hommes',
      description: 'Rayon officiel Vêtements Hommes — STEEVE ACCESSOIRE',
      image: '/src/assets/images/product_denim_overshirt_1791556307757.jpg',
      itemCount: 0,
    },
  ],

  socialLinks: {
    facebook: 'https://facebook.com/steeveaccessoire',
    instagram: 'https://instagram.com/steeveaccessoire',
    whatsapp: 'https://wa.me/50956027710',
    tiktok: 'https://tiktok.com/@steeveaccessoire',
    youtube: 'https://youtube.com/@steeveaccessoire',
  },
};

export const DEMO_USERS: User[] = [
  {
    id: 'user-client-1',
    firstName: 'Jean-Luc',
    lastName: 'Pierre',
    email: 'client@example.com',
    phone: '+509 3844 5566',
    role: 'customer',
    createdAt: '2026-01-15T10:00:00Z',
    password: 'Client2026!',
    isPhoneVerified: true,
    commune: 'Les Cayes',
    department: 'Sud',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    authProvider: 'email',
    addresses: [
      {
        fullName: 'Jean-Luc Pierre',
        phone: '+509 3844 5566',
        email: 'client@example.com',
        country: 'Haïti',
        region: 'Sud',
        city: 'Les Cayes',
        addressLine: 'Bourdet, en face de l\'église, portail bleu',
        postalCode: '8110',
        instructions: 'Livraison rapide demandée',
        distanceKm: 4.0,
        isGpsLocated: true,
      },
    ],
  },
  {
    id: 'user-admin-1',
    firstName: 'Steeve',
    lastName: 'Admin',
    email: 'admin@novacommerce.com',
    phone: '+509 5602 7710',
    role: 'admin',
    createdAt: '2025-11-01T08:00:00Z',
    password: 'Admin2026!',
    isPhoneVerified: true,
    commune: 'Les Cayes',
    department: 'Sud',
    addresses: [
      {
        fullName: 'Steeve Administrateur',
        phone: '+509 5602 7710',
        email: 'admin@novacommerce.com',
        country: 'Haïti',
        region: 'Sud',
        city: 'Les Cayes',
        addressLine: 'Breffette, Cayes Sud (Siège officiel)',
        postalCode: '8110',
      }
    ],
  },
];

