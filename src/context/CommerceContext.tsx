import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CartItem, 
  CurrencyCode, 
  Order, 
  OrderStatus, 
  PaymentMethodType, 
  Product, 
  ProductVariant, 
  PromoCode, 
  Review, 
  ShippingAddress, 
  ShippingMethod, 
  StoreSettings, 
  StoreCategoryItem,
  SupportTicket, 
  User 
} from '../types';
import { 
  CURRENCIES, 
  DEFAULT_STORE_SETTINGS, 
  DEMO_USERS, 
  INITIAL_PRODUCTS, 
  INITIAL_PROMO_CODES, 
  INITIAL_SHIPPING_METHODS 
} from '../data/mockData';
import { validateHaitianPhone } from '../utils/haitiValidation';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface CommerceContextType {
  // Store & Currency
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;

  // Products & Inventory
  products: Product[];
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  clearAllProducts: () => void;
  getVariantStock: (productId: string, variantId: string) => number;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => boolean;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQuantity: number) => boolean;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  promoCode: PromoCode | null;
  promoError: string | null;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  discountAmount: number;
  estimatedTax: number;
  totalWithShipping: (shippingFee: number) => number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Auth & Profile
  currentUser: User | null;
  registeredUsers: User[];
  login: (identifier: string, passwordOrRole?: string, role?: 'customer' | 'admin') => boolean;
  loginWithGoogle: () => boolean;
  register: (data: { firstName: string; lastName: string; email: string; phone?: string; password?: string }) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  saveAddress: (address: ShippingAddress) => void;
  deleteAddress: (index: number) => void;

  // Categories & Catalogues Management (Admin Autonomy)
  deleteCategory: (categoryId: string) => void;
  addCategory: (category: StoreCategoryItem) => void;
  updateCategory: (category: StoreCategoryItem) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    items: CartItem[];
    shippingAddress: ShippingAddress;
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethodType;
    promoCodeApplied?: string;
    paymentProofImageUrl?: string;
    transactionReference?: string;
    selectedMobileWallet?: 'moncash' | 'natcash';
    distanceKm?: number;
    deliveryFeeRatePerKm?: number;
  }) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, note?: string) => void;
  validateOrderPayment: (orderId: string) => void;
  confirmOrderDelivered: (orderId: string) => void;
  updateOrderAddress: (orderId: string, newAddress: ShippingAddress) => boolean;
  cancelOrder: (orderId: string) => boolean;
  getUserOrders: () => Order[];

  // Haitian Delivery & GPS Kilometric Calculation (200 HTG / km)
  calculateDistanceKm: (lat: number, lng: number) => number;
  calculateDeliveryFeeHTG: (distanceKm: number) => number;

  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  getProductReviews: (productId: string) => Review[];

  // Search & History
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  recentlyViewed: string[];
  trackViewedProduct: (productId: string) => void;

  // Global Page & Modal Navigation
  currentPage: 'home' | 'catalog' | 'product';
  setCurrentPage: (page: 'home' | 'catalog' | 'product') => void;
  navigateToProduct: (productId: string) => void;
  navigateToCatalogWithSearch: (query: string, category?: string | null) => void;
  navigateToHome: () => void;

  // Support & Tickets
  tickets: SupportTicket[];
  createTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status' | 'replies'>) => void;
  replyToTicket: (ticketId: string, message: string, isAdmin: boolean) => void;

  // Promos (Admin & Shop)
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => void;
  togglePromoCode: (code: string) => void;

  // Navigation state / Active Modals & Permanent Admin Dock
  activeModal: 'auth' | 'checkout' | 'faq' | 'contact' | 'orders' | 'wishlist' | 'admin' | 'search' | null;
  setActiveModal: (modal: 'auth' | 'checkout' | 'faq' | 'contact' | 'orders' | 'wishlist' | 'admin' | 'search' | null) => void;
  adminSelectedTab: 'kpis' | 'products' | 'categories' | 'branding' | 'homepage' | 'orders' | 'payments' | 'promos' | 'settings' | 'deploy';
  setAdminSelectedTab: (tab: 'kpis' | 'products' | 'categories' | 'branding' | 'homepage' | 'orders' | 'payments' | 'promos' | 'settings' | 'deploy') => void;
  openAdminTab: (tab: 'kpis' | 'products' | 'categories' | 'branding' | 'homepage' | 'orders' | 'payments' | 'promos' | 'settings' | 'deploy', createProduct?: boolean) => void;
  adminOpenCreateProduct: boolean;
  setAdminOpenCreateProduct: (open: boolean) => void;
  isAdminBarMinimized: boolean;
  setIsAdminBarMinimized: (min: boolean) => void;
  selectedProductIdForView: string | null;
  setSelectedProductIdForView: (id: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;

  // Backup / Data Portability
  exportAllStoreData: () => string;
  importStoreData: (json: string) => boolean;

  // Notifications / Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Settings & Currency
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('nova_store_settings');
    if (!saved) return DEFAULT_STORE_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.moncashNumber || !parsed.deliveryRatePerKmHTG || !parsed.testimonials || !parsed.customCategories || !parsed.address || parsed.address.includes('Pétion-Ville')) {
        const updated: StoreSettings = {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed,
          companyName: parsed.companyName || 'STEEVE ACCESSOIRE',
          address: 'Breffette, Cayes Sud',
          city: 'Les Cayes (Sud)',
          country: 'Haïti',
          postalCode: '8110',
          phone: '+509 5602 7710',
          phoneSecondary: '+509 4005 4375',
          primaryCurrency: 'HTG',
          moncashActive: parsed.moncashActive ?? true,
          moncashNumber: parsed.moncashNumber || '+509 5602 7710',
          moncashAccountName: parsed.moncashAccountName || 'STEEVE ACCESSOIRE (Admin)',
          moncashInstructions: parsed.moncashInstructions || DEFAULT_STORE_SETTINGS.moncashInstructions,
          natcashActive: parsed.natcashActive ?? true,
          natcashNumber: parsed.natcashNumber || '+509 4005 4375',
          natcashAccountName: parsed.natcashAccountName || 'STEEVE ACCESSOIRE (Admin)',
          natcashInstructions: parsed.natcashInstructions || DEFAULT_STORE_SETTINGS.natcashInstructions,
          deliveryRatePerKmHTG: parsed.deliveryRatePerKmHTG || 200,
          deliveryHoursGuarantee: parsed.deliveryHoursGuarantee || '24h',
          addressCorrectionGraceMinutes: parsed.addressCorrectionGraceMinutes || 3,
          storeLatitude: parsed.storeLatitude || 18.2045,
          storeLongitude: parsed.storeLongitude || -73.7478,
          announcementText: parsed.announcementText || DEFAULT_STORE_SETTINGS.announcementText,
          announcementActive: parsed.announcementActive ?? true,
          testimonials: parsed.testimonials && parsed.testimonials.length > 0 ? parsed.testimonials : DEFAULT_STORE_SETTINGS.testimonials,
          customCategories: Array.isArray(parsed.customCategories) ? parsed.customCategories : DEFAULT_STORE_SETTINGS.customCategories,
        };
        localStorage.setItem('nova_store_settings', JSON.stringify(updated));
        return updated;
      }
      return { ...DEFAULT_STORE_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('nova_currency') as CurrencyCode;
    return saved || 'HTG';
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('nova_currency', c);
  };

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('nova_store_settings', JSON.stringify(updated));
      return updated;
    });
    showToast('Paramètres de la boutique mis à jour avec succès', 'success');
  };

  // Currency Converter helper
  const convertPrice = (amountInUSD: number): number => {
    const rate = CURRENCIES[currency]?.rateToUSD || 1;
    return amountInUSD * rate;
  };

  const formatPrice = (amountInUSD: number): string => {
    const config = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = amountInUSD * config.rateToUSD;

    if (currency === 'HTG') {
      return `${Math.round(converted).toLocaleString('fr-FR')} ${config.symbol}`;
    }
    if (currency === 'EUR') {
      return `${converted.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${config.symbol}`;
    }
    return `${config.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 2. Products State
  // User explicitly requested: "tu dois supprimer les images des produits qui sont dessus... Supprimer les produits déjà dispo pour que je puisse te donner l image et le nom et les prix de mes produits."
  const [products, setProducts] = useState<Product[]>(() => {
    const hasCleared = localStorage.getItem('steeve_products_cleared_user_request_v3');
    if (!hasCleared) {
      localStorage.setItem('steeve_products_cleared_user_request_v3', 'true');
      localStorage.setItem('nova_products', JSON.stringify([]));
      return [];
    }
    const saved = localStorage.getItem('nova_products');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nova_products', JSON.stringify(products));
  }, [products]);

  const getProductById = (id: string) => products.find(p => p.id === id);
  const getProductBySlug = (slug: string) => products.find(p => p.slug === slug);

  const getVariantStock = (productId: string, variantId: string): number => {
    const prod = getProductById(productId);
    if (!prod) return 0;
    const variant = prod.variants.find(v => v.id === variantId);
    return variant ? variant.stock : 0;
  };

  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const product: Product = { ...newProd, id };
    setProducts(prev => [product, ...prev]);
    showToast(`Produit "${product.name}" créé avec succès`, 'success');
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    showToast(`Produit "${updated.name}" mis à jour`, 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Produit supprimé du catalogue', 'info');
  };

  const clearAllProducts = () => {
    setProducts([]);
    localStorage.setItem('nova_products', JSON.stringify([]));
    showToast('Tous les produits du catalogue ont été supprimés', 'info');
  };

  // 3. User & Serious Auth State
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('steeve_registered_users');
      return saved ? JSON.parse(saved) : DEMO_USERS;
    } catch {
      return DEMO_USERS;
    }
  });

  const saveRegisteredUsers = (users: User[]) => {
    setRegisteredUsers(users);
    try {
      localStorage.setItem('steeve_registered_users', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nova_current_user');
    return saved ? JSON.parse(saved) : DEMO_USERS[0]; // Start with active customer demo
  });

  const login = (identifier: string, passwordOrRole?: string, explicitRole?: 'customer' | 'admin'): boolean => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanDigits = (identifier || '').replace(/\D/g, '');

    // Quick demo shortcuts
    if (passwordOrRole === 'admin' || explicitRole === 'admin') {
      const adminUser = registeredUsers.find(u => u.role === 'admin') || DEMO_USERS[1];
      setCurrentUser(adminUser);
      localStorage.setItem('nova_current_user', JSON.stringify(adminUser));
      showToast(`Connexion administrateur réussie : ${adminUser.firstName}`, 'success');
      return true;
    }
    if (passwordOrRole === 'customer' || explicitRole === 'customer') {
      const custUser = registeredUsers.find(u => u.role === 'customer') || DEMO_USERS[0];
      setCurrentUser(custUser);
      localStorage.setItem('nova_current_user', JSON.stringify(custUser));
      showToast(`Bienvenue, ${custUser.firstName} !`, 'success');
      return true;
    }

    // Lookup user by email or by Haitian phone (+509)
    const found = registeredUsers.find(u => {
      const matchEmail = u.email && u.email.toLowerCase() === cleanId;
      const uDigits = (u.phone || '').replace(/\D/g, '');
      const matchPhone = cleanDigits.length >= 8 && uDigits.includes(cleanDigits.slice(-8));
      return matchEmail || matchPhone;
    });

    if (found) {
      if (passwordOrRole && found.password && found.password !== passwordOrRole) {
        showToast('Mot de passe incorrect pour ce compte.', 'error');
        return false;
      }
      const updatedUser = { ...found, lastLoginAt: new Date().toISOString() };
      setCurrentUser(updatedUser);
      localStorage.setItem('nova_current_user', JSON.stringify(updatedUser));
      showToast(`Connexion réussie ! Bienvenue ${found.firstName}`, 'success');
      return true;
    }

    // Default admin fallback
    if (cleanId === 'admin@novacommerce.com' || cleanId === 'admin@steeveaccessoire.com') {
      const admin = DEMO_USERS[1];
      setCurrentUser(admin);
      localStorage.setItem('nova_current_user', JSON.stringify(admin));
      showToast('Connexion administrateur réussie', 'success');
      return true;
    }

    showToast('Aucun compte trouvé avec cet identifiant (+509 ou e-mail). Veuillez créer un compte client.', 'error');
    return false;
  };

  const loginWithGoogle = (): boolean => {
    const googleEmail = 'client.google@gmail.com';
    let gUser = registeredUsers.find(u => u.email === googleEmail);
    if (!gUser) {
      gUser = {
        id: `user-google-${Date.now()}`,
        firstName: 'Steeve',
        lastName: 'Client',
        email: googleEmail,
        phone: '+509 5602 7710',
        role: 'customer',
        password: 'GoogleAuth2026!',
        isPhoneVerified: true,
        commune: 'Les Cayes',
        department: 'Sud',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        authProvider: 'google',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        addresses: [
          {
            fullName: 'Steeve Client (Google)',
            phone: '+509 5602 7710',
            email: googleEmail,
            country: 'Haïti',
            region: 'Sud',
            city: 'Les Cayes',
            addressLine: 'Breffette, Cayes Sud',
            postalCode: '8110',
            distanceKm: 1.5,
            isGpsLocated: true,
          }
        ],
      };
      saveRegisteredUsers([gUser, ...registeredUsers]);
    }
    setCurrentUser(gUser);
    localStorage.setItem('nova_current_user', JSON.stringify(gUser));
    showToast('Connexion réussie avec Google Authentification !', 'success');
    return true;
  };

  const register = (data: { firstName: string; lastName: string; email: string; phone?: string; password?: string }): boolean => {
    // 1. Strict Haitian phone validation (+509 only)
    if (!data.phone) {
      showToast('Le numéro de téléphone haïtien (+509) est obligatoire.', 'error');
      return false;
    }
    const phoneCheck = validateHaitianPhone(data.phone);
    if (!phoneCheck.isValid) {
      showToast(phoneCheck.error || 'Seuls les numéros haïtiens (+509) sont éligibles.', 'error');
      return false;
    }

    if (!data.firstName.trim() || !data.lastName.trim()) {
      showToast('Le nom complet (prénom et nom) est obligatoire.', 'error');
      return false;
    }

    const cleanEmail = (data.email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Veuillez renseigner une adresse e-mail valide.', 'error');
      return false;
    }

    // Check duplicate
    const cleanDigits = phoneCheck.formatted.replace(/\D/g, '');
    const alreadyExists = registeredUsers.some(u => 
      u.email.toLowerCase() === cleanEmail || 
      (u.phone && u.phone.replace(/\D/g, '').includes(cleanDigits.slice(-8)))
    );

    if (alreadyExists) {
      showToast('Un compte existe déjà avec cette adresse e-mail ou ce numéro de téléphone. Veuillez vous connecter.', 'error');
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: cleanEmail,
      phone: phoneCheck.formatted,
      password: data.password || 'Client2026!',
      role: 'customer',
      isPhoneVerified: true,
      commune: 'Les Cayes',
      department: 'Sud',
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      addresses: [
        {
          fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
          phone: phoneCheck.formatted,
          email: cleanEmail,
          country: 'Haïti',
          region: 'Sud',
          city: 'Les Cayes',
          addressLine: 'Breffette, Cayes Sud',
          postalCode: '8110',
          instructions: 'Client certifié (+509) · Commune des Cayes',
          distanceKm: 1.5,
          isGpsLocated: true,
        }
      ],
    };

    const updated = [newUser, ...registeredUsers];
    saveRegisteredUsers(updated);
    setCurrentUser(newUser);
    localStorage.setItem('nova_current_user', JSON.stringify(newUser));
    showToast(`Compte client sécurisé créé ! Bienvenue ${newUser.firstName}`, 'success');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nova_current_user');
    showToast('Vous avez été déconnecté.', 'info');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem('nova_current_user', JSON.stringify(updated));
    const updatedList = registeredUsers.map(u => u.id === currentUser.id ? updated : u);
    saveRegisteredUsers(updatedList);
    showToast('Profil mis à jour', 'success');
  };

  const saveAddress = (addr: ShippingAddress) => {
    if (!currentUser) return;
    const updatedAddresses = [...currentUser.addresses, addr];
    updateProfile({ addresses: updatedAddresses });
  };

  const deleteAddress = (index: number) => {
    if (!currentUser) return;
    const updatedAddresses = currentUser.addresses.filter((_, i) => i !== index);
    updateProfile({ addresses: updatedAddresses });
  };

  // Categories / Catalogues Management (Admin Autonomy)
  const deleteCategory = (categoryId: string) => {
    const current = storeSettings.customCategories || DEFAULT_STORE_SETTINGS.customCategories;
    const filtered = current.filter(c => c.id !== categoryId);
    updateStoreSettings({ customCategories: filtered });
    showToast('Catalogue supprimé du site avec succès', 'info');
  };

  const addCategory = (category: StoreCategoryItem) => {
    const current = storeSettings.customCategories || DEFAULT_STORE_SETTINGS.customCategories;
    const updated = [...current, category];
    updateStoreSettings({ customCategories: updated });
    showToast(`Catalogue "${category.name}" ajouté avec succès`, 'success');
  };

  const updateCategory = (category: StoreCategoryItem) => {
    const current = storeSettings.customCategories || DEFAULT_STORE_SETTINGS.customCategories;
    const updated = current.map(c => c.id === category.id ? category : c);
    updateStoreSettings({ customCategories: updated });
    showToast(`Catalogue "${category.name}" mis à jour`, 'success');
  };

  // 4. Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nova_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem('nova_promos');
    return saved ? JSON.parse(saved) : INITIAL_PROMO_CODES;
  });
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('nova_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1): boolean => {
    const currentStock = getVariantStock(product.id, variant.id);
    if (currentStock <= 0) {
      showToast(`Désolé, la variante ${variant.label} est en rupture de stock.`, 'error');
      return false;
    }

    const cartItemId = `${product.id}-${variant.id}`;
    const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      const newQty = existing.quantity + quantity;
      if (newQty > currentStock) {
        showToast(`Stock insuffisant. Maximum disponible : ${currentStock} pièce(s).`, 'error');
        return false;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex] = { ...existing, quantity: newQty };
      setCart(updatedCart);
    } else {
      if (quantity > currentStock) {
        showToast(`Quantité supérieure au stock disponible (${currentStock}).`, 'error');
        return false;
      }
      const newItem: CartItem = {
        cartItemId,
        productId: product.id,
        product,
        selectedVariant: variant,
        quantity,
        priceAtAddition: product.price + (variant.priceDelta || 0),
      };
      setCart(prev => [newItem, ...prev]);
    }

    showToast(`"${product.name}" (${variant.label}) ajouté au panier !`, 'success');
    return true;
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    showToast('Article retiré du panier', 'info');
  };

  const updateCartQuantity = (cartItemId: string, newQuantity: number): boolean => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return true;
    }
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (!item) return false;

    const availableStock = getVariantStock(item.productId, item.selectedVariant.id);
    if (newQuantity > availableStock) {
      showToast(`Stock limité à ${availableStock} pièces pour cette taille/variante.`, 'error');
      return false;
    }

    setCart(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: newQuantity } : i));
    return true;
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode(null);
    setPromoError(null);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.priceAtAddition * item.quantity), 0);

  const applyPromoCode = (codeText: string): boolean => {
    setPromoError(null);
    const cleaned = codeText.trim().toUpperCase();
    const found = promoCodes.find(p => p.code.toUpperCase() === cleaned && p.isActive);

    if (!found) {
      setPromoError('Code promotionnel invalide ou expiré.');
      return false;
    }
    if (cartSubtotal < found.minOrderAmount) {
      setPromoError(`Montant minimum de commande de ${formatPrice(found.minOrderAmount)} requis.`);
      return false;
    }

    setPromoCode(found);
    showToast(`Code ${found.code} appliqué avec succès !`, 'success');
    return true;
  };

  const removePromoCode = () => {
    setPromoCode(null);
    setPromoError(null);
    showToast('Code promotionnel retiré.', 'info');
  };

  const discountAmount = promoCode
    ? promoCode.type === 'percentage'
      ? (cartSubtotal * promoCode.value) / 100
      : Math.min(promoCode.value, cartSubtotal)
    : 0;

  const estimatedTax = (cartSubtotal - discountAmount) * storeSettings.taxRate;

  const totalWithShipping = (shippingFee: number): number => {
    const discounted = Math.max(0, cartSubtotal - discountAmount);
    return discounted + estimatedTax + shippingFee;
  };

  // 5. Wishlist State
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('nova_wishlist');
    return saved ? JSON.parse(saved) : ['prod-vet-1', 'prod-chauss-1'];
  });

  useEffect(() => {
    localStorage.setItem('nova_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Article retiré des favoris', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Article ajouté aux favoris ❤️', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // 6. Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nova_orders');
    if (saved) return JSON.parse(saved);

    // Initial demo order for rich UI experience
    const demoOrder: Order = {
      id: 'ord-demo-1',
      orderNumber: 'CMD-2026-7842',
      createdAt: '2026-03-28T14:30:00Z',
      status: 'en_cours_de_livraison',
      items: [
        {
          productId: 'prod-chauss-1',
          productName: 'Sneakers Minimalistes Urbaines en Cuir & Suède',
          productImage: '/src/assets/images/product_athletic_sneaker_1791556284082.jpg',
          variantLabel: 'Pointure 42',
          sku: 'NOV-CHA-U01-42',
          quantity: 1,
          unitPrice: 89,
          totalPrice: 89,
        },
      ],
      subtotal: 89,
      discountAmount: 8.9,
      promoCodeApplied: 'BIENVENUE10',
      shippingFee: 4.99,
      taxAmount: 8.01,
      totalAmount: 93.10,
      currency: 'USD',
      shippingAddress: {
        fullName: 'Jean-Luc Pierre',
        phone: '+509 3844-5566',
        email: 'client@example.com',
        country: 'Haïti',
        region: 'Ouest',
        city: 'Pétion-Ville',
        addressLine: '14 Rue Faubert, Résidence Les Palmes',
        postalCode: 'HT-6140',
      },
      shippingMethod: INITIAL_SHIPPING_METHODS[0],
      paymentMethod: 'carte_bancaire',
      paymentStatus: 'payé',
      trackingNumber: 'NC-HT-9842109',
      carrierName: 'Caraïbes Express Logistique',
      estimatedDeliveryDate: '2026-04-02',
      statusHistory: [
        { status: 'paiement_confirme', timestamp: '2026-03-28T14:31:00Z', note: 'Paiement carte bancaire vérifié avec succès' },
        { status: 'en_preparation', timestamp: '2026-03-29T09:15:00Z', note: 'Colis vérifié et emballé dans notre entrepôt' },
        { status: 'expediee', timestamp: '2026-03-30T11:00:00Z', note: 'Remis au transporteur Caraïbes Express' },
        { status: 'en_cours_de_livraison', timestamp: '2026-03-31T08:30:00Z', note: 'Colis pris en charge par le livreur local' },
      ],
    };
    return [demoOrder];
  });

  useEffect(() => {
    localStorage.setItem('nova_orders', JSON.stringify(orders));
  }, [orders]);

  const calculateDistanceKm = (clientLat: number, clientLng: number): number => {
    const storeLat = storeSettings.storeLatitude || 18.2045; // Breffette, Cayes Sud
    const storeLng = storeSettings.storeLongitude || -73.7478;

    const R = 6371; // Earth's radius in km
    const dLat = (clientLat - storeLat) * (Math.PI / 180);
    const dLon = (clientLng - storeLng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(storeLat * (Math.PI / 180)) * Math.cos(clientLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.max(0.5, Math.round(d * 10) / 10);
  };

  const calculateDeliveryFeeHTG = (distanceKm: number): number => {
    const rate = storeSettings.deliveryRatePerKmHTG || 200;
    return Math.max(1, Math.ceil(distanceKm)) * rate;
  };

  const createOrder = (orderData: {
    items: CartItem[];
    shippingAddress: ShippingAddress;
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethodType;
    promoCodeApplied?: string;
    paymentProofImageUrl?: string;
    transactionReference?: string;
    selectedMobileWallet?: 'moncash' | 'natcash';
    distanceKm?: number;
    deliveryFeeRatePerKm?: number;
  }): Order | null => {
    // 1. Verify stock before creating
    for (const item of orderData.items) {
      const currentStock = getVariantStock(item.productId, item.selectedVariant.id);
      if (item.quantity > currentStock) {
        showToast(`Stock insuffisant pour ${item.product.name} (${item.selectedVariant.label}). Disponible: ${currentStock}`, 'error');
        return null;
      }
    }

    // 2. Decrement stock atomically from product state
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const matchingItem = orderData.items.find(i => i.productId === p.id);
        if (!matchingItem) return p;

        const updatedVariants = p.variants.map(v => {
          if (v.id === matchingItem.selectedVariant.id) {
            const newStock = Math.max(0, v.stock - matchingItem.quantity);
            return { ...v, stock: newStock };
          }
          return v;
        });

        return { ...p, variants: updatedVariants };
      });
    });

    // 3. Compute totals
    const subtotal = orderData.items.reduce((acc, i) => acc + (i.priceAtAddition * i.quantity), 0);
    const orderDiscount = discountAmount;
    const tax = (subtotal - orderDiscount) * storeSettings.taxRate;
    const total = subtotal - orderDiscount + tax + orderData.shippingMethod.priceUSD;

    const orderNumber = `CMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomTracking = `STEEVE-${orderData.shippingAddress.country.slice(0, 2).toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const isMobileTransfer = orderData.paymentMethod === 'moncash_natcash';
    const initialStatus: OrderStatus = isMobileTransfer ? 'en_attente_paiement' : 'paiement_confirme';
    const initialPaymentStatus = isMobileTransfer ? 'en_attente' : 'payé';

    // 3-minute grace period for address correction
    const graceMinutes = storeSettings.addressCorrectionGraceMinutes || 3;
    const canEditAddressUntil = new Date(Date.now() + graceMinutes * 60 * 1000).toISOString();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      status: initialStatus,
      items: orderData.items.map(i => ({
        productId: i.productId,
        productName: i.product.name,
        productImage: i.product.images[0] || '',
        variantLabel: i.selectedVariant.label,
        sku: `${i.product.sku}-${i.selectedVariant.label}`,
        quantity: i.quantity,
        unitPrice: i.priceAtAddition,
        totalPrice: i.priceAtAddition * i.quantity,
      })),
      subtotal,
      discountAmount: orderDiscount,
      promoCodeApplied: orderData.promoCodeApplied,
      shippingFee: orderData.shippingMethod.priceUSD,
      taxAmount: tax,
      totalAmount: total,
      currency,
      shippingAddress: orderData.shippingAddress,
      shippingMethod: orderData.shippingMethod,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: initialPaymentStatus,
      trackingNumber: randomTracking,
      carrierName: 'Steeve Express Cayes (Livraison 24h)',
      estimatedDeliveryDate: 'Sous 24h ouvrées (Garantie 24h)',
      paymentProofImageUrl: orderData.paymentProofImageUrl,
      transactionReference: orderData.transactionReference,
      selectedMobileWallet: orderData.selectedMobileWallet,
      distanceKm: orderData.distanceKm,
      deliveryFeeRatePerKm: orderData.deliveryFeeRatePerKm || storeSettings.deliveryRatePerKmHTG || 200,
      canEditAddressUntil,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date().toISOString(),
          note: isMobileTransfer
            ? `Transfert ${orderData.selectedMobileWallet === 'natcash' ? 'Natcash' : 'MonCash'} soumis avec capture d'écran. Statut : En attente de vérification par l'administrateur.`
            : `Paiement validé via ${orderData.paymentMethod}. Commande enregistrée.`,
        },
      ],
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    showToast(
      isMobileTransfer
        ? `Commande ${newOrder.orderNumber} enregistrée ! Votre capture a été transmise à l'administrateur pour validation.`
        : `Commande ${newOrder.orderNumber} confirmée avec succès !`,
      'success'
    );
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingNumber?: string, note?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const historyEntry = {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Statut mis à jour vers: ${status}`,
      };
      return {
        ...o,
        status,
        trackingNumber: trackingNumber || o.trackingNumber,
        statusHistory: [...o.statusHistory, historyEntry],
      };
    }));
    showToast(`Statut de la commande mis à jour : ${status}`, 'success');
  };

  // Administrator confirms payment screenshot -> transitions from "En attente" to "En cours"
  const validateOrderPayment = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const historyEntry = {
        status: 'en_cours_de_livraison' as OrderStatus,
        timestamp: new Date().toISOString(),
        note: "Paiement validé par l'administrateur après vérification de la capture d'écran. Commande passée de 'En attente' à 'En cours de préparation / livraison (24h)'.",
      };
      return {
        ...o,
        status: 'en_cours_de_livraison' as OrderStatus,
        paymentStatus: 'payé',
        adminVerifiedPayment: true,
        adminVerifiedPaymentAt: new Date().toISOString(),
        statusHistory: [...o.statusHistory, historyEntry],
      };
    }));
    showToast("Paiement vérifié avec succès ! La commande est maintenant 'En cours'.", 'success');
  };

  // Administrator confirms delivery was completed -> transitions to "Livrée"
  const confirmOrderDelivered = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const historyEntry = {
        status: 'livree' as OrderStatus,
        timestamp: new Date().toISOString(),
        note: "Livraison validée par l'administrateur. Colis remis en main propre au client à Breffette / Les Cayes.",
      };
      return {
        ...o,
        status: 'livree' as OrderStatus,
        deliveryConfirmedByAdmin: true,
        deliveryConfirmedAt: new Date().toISOString(),
        statusHistory: [...o.statusHistory, historyEntry],
      };
    }));
    showToast("Livraison confirmée avec succès ! Statut passé à 'Livrée'.", 'success');
  };

  // Customer corrects address typo within grace window (2-3 minutes) before "En cours"
  const updateOrderAddress = (orderId: string, newAddress: ShippingAddress): boolean => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    if (order.status !== 'en_attente_paiement') {
      showToast("La commande est déjà en cours de préparation/livraison, l'adresse ne peut plus être modifiée.", 'error');
      return false;
    }

    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const historyEntry = {
        status: o.status,
        timestamp: new Date().toISOString(),
        note: `Adresse corrigée par le client dans le délai imparti : ${newAddress.addressLine}, ${newAddress.city} (Tél: ${newAddress.phone})`,
      };
      return {
        ...o,
        shippingAddress: newAddress,
        statusHistory: [...o.statusHistory, historyEntry],
      };
    }));
    showToast("Adresse de livraison modifiée avec succès !", 'success');
    return true;
  };

  const cancelOrder = (orderId: string): boolean => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    if (order.status === 'expediee' || order.status === 'livree') {
      showToast('Cette commande a déjà été expédiée et ne peut plus être annulée directement.', 'error');
      return false;
    }

    // Restock the variants
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const orderItem = order.items.find(i => i.productId === p.id);
        if (!orderItem) return p;
        return {
          ...p,
          variants: p.variants.map(v => {
            if (v.label === orderItem.variantLabel || v.label.includes(orderItem.variantLabel)) {
              return { ...v, stock: v.stock + orderItem.quantity };
            }
            return v;
          }),
        };
      });
    });

    updateOrderStatus(orderId, 'annulee', undefined, 'Commande annulée par le client. Stocks réintégrés.');
    showToast('Votre commande a été annulée et remboursée.', 'info');
    return true;
  };

  const getUserOrders = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return orders;
    return orders.filter(o => o.shippingAddress.email.toLowerCase() === currentUser.email.toLowerCase());
  };

  // 7. Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    return [
      {
        id: 'rev-1',
        productId: 'prod-chauss-1',
        userName: 'Jean-Luc P.',
        rating: 5,
        comment: 'Qualité de cuir exceptionnelle ! La taille 42 taille parfaitement. Très confortable dès la première utilisation.',
        date: '2026-03-24',
        isVerifiedPurchase: true,
      },
      {
        id: 'rev-2',
        productId: 'prod-vet-1',
        userName: 'Marc-Antoine D.',
        rating: 5,
        comment: 'La veste est bien coupée, tissu en coton bio très robuste. Très satisfait du service et de la livraison rapide.',
        date: '2026-03-20',
        isVerifiedPurchase: true,
      },
      {
        id: 'rev-3',
        productId: 'prod-ecout-1',
        userName: 'Sophie K.',
        rating: 5,
        comment: 'Casque audio avec une réduction de bruit impressionnante dans les transports. Son équilibré et finitions soignées.',
        date: '2026-03-18',
        isVerifiedPurchase: true,
      },
    ];
  });

  const addReview = (revData: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      ...revData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setReviews(prev => [newRev, ...prev]);

    // Recalculate product rating
    setProducts(prev => prev.map(p => {
      if (p.id !== revData.productId) return p;
      const prodRevs = [...reviews.filter(r => r.productId === p.id), newRev];
      const avg = prodRevs.reduce((acc, r) => acc + r.rating, 0) / prodRevs.length;
      return {
        ...p,
        rating: parseFloat(avg.toFixed(1)),
        reviewCount: prodRevs.length,
      };
    }));
    showToast('Merci ! Votre avis a été publié.', 'success');
  };

  const getProductReviews = (productId: string) => reviews.filter(r => r.productId === productId);

  // 8. Search History & Viewed
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('nova_search_hist');
    return saved ? JSON.parse(saved) : ['veste coton', 'sneakers 42', 'casque audio'];
  });

  const addSearchHistory = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchHistory(prev => [trimmed, ...prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8));
  };

  const clearSearchHistory = () => setSearchHistory([]);

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const saved = localStorage.getItem('nova_viewed');
    return saved ? JSON.parse(saved) : ['prod-vet-1', 'prod-chauss-1', 'prod-ecout-1'];
  });

  const trackViewedProduct = (id: string) => {
    setRecentlyViewed(prev => [id, ...prev.filter(item => item !== id)].slice(0, 8));
  };

  // 9. Support Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'tkt-1',
      userId: 'user-client-1',
      userName: 'Jean-Luc Pierre',
      userEmail: 'client@example.com',
      subject: 'Question sur la livraison à Pétion-Ville',
      category: 'livraison',
      message: 'Bonjour, est-il possible d’être livré le samedi après-midi ?',
      status: 'resolu',
      createdAt: '2026-03-25T10:00:00Z',
      replies: [
        {
          author: 'Support NovaCommerce',
          isAdmin: true,
          message: 'Bonjour Jean-Luc, oui tout à fait ! Nos coursiers effectuent des tournées le samedi jusqu’à 18h.',
          timestamp: '2026-03-25T11:20:00Z',
        },
      ],
    },
  ]);

  const createTicket = (tData: Omit<SupportTicket, 'id' | 'createdAt' | 'status' | 'replies'>) => {
    const newTkt: SupportTicket = {
      ...tData,
      id: `tkt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'ouvert',
      replies: [],
    };
    setTickets(prev => [newTkt, ...prev]);
    showToast('Votre demande a été envoyée au service client.', 'success');
  };

  const replyToTicket = (ticketId: string, message: string, isAdmin: boolean) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        status: isAdmin ? 'en_cours' : t.status,
        replies: [
          ...t.replies,
          {
            author: isAdmin ? 'Équipe Support' : t.userName,
            isAdmin,
            message,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }));
    showToast('Message envoyé', 'success');
  };

  // 10. Promos
  const addPromoCode = (promo: PromoCode) => {
    setPromoCodes(prev => [promo, ...prev]);
    localStorage.setItem('nova_promos', JSON.stringify([promo, ...promoCodes]));
    showToast(`Code promo ${promo.code} ajouté`, 'success');
  };

  const togglePromoCode = (code: string) => {
    setPromoCodes(prev => prev.map(p => p.code === code ? { ...p, isActive: !p.isActive } : p));
  };

  // 11. Search & Page Navigation
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<'home' | 'catalog' | 'product'>('home');

  // Modal states & Admin Navigation
  const [activeModal, setActiveModal] = useState<'auth' | 'checkout' | 'faq' | 'contact' | 'orders' | 'wishlist' | 'admin' | 'search' | null>(null);
  const [adminSelectedTab, setAdminSelectedTab] = useState<'kpis' | 'products' | 'categories' | 'branding' | 'homepage' | 'orders' | 'payments' | 'promos' | 'settings' | 'deploy'>('products');
  const [adminOpenCreateProduct, setAdminOpenCreateProduct] = useState<boolean>(false);
  const [isAdminBarMinimized, setIsAdminBarMinimized] = useState<boolean>(false);
  const [selectedProductIdForView, setSelectedProductIdForView] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const openAdminTab = (tab: 'kpis' | 'products' | 'categories' | 'branding' | 'homepage' | 'orders' | 'payments' | 'promos' | 'settings' | 'deploy', createProduct: boolean = false) => {
    setAdminSelectedTab(tab);
    setAdminOpenCreateProduct(createProduct);
    setActiveModal('admin');
  };

  // Full Store Backup and Restore
  const exportAllStoreData = (): string => {
    const backup = {
      storeSettings,
      products,
      promoCodes,
      orders,
      exportedAt: new Date().toISOString(),
      shopName: 'Steeve Accessoire — Breffette, Cayes Sud',
    };
    return JSON.stringify(backup, null, 2);
  };

  const importStoreData = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.storeSettings) {
        setStoreSettings(parsed.storeSettings);
        localStorage.setItem('nova_store_settings', JSON.stringify(parsed.storeSettings));
      }
      if (Array.isArray(parsed.products)) {
        setProducts(parsed.products);
        localStorage.setItem('nova_products', JSON.stringify(parsed.products));
      }
      if (Array.isArray(parsed.promoCodes)) {
        setPromoCodes(parsed.promoCodes);
        localStorage.setItem('nova_promos', JSON.stringify(parsed.promoCodes));
      }
      if (Array.isArray(parsed.orders)) {
        setOrders(parsed.orders);
        localStorage.setItem('nova_orders', JSON.stringify(parsed.orders));
      }
      showToast('Configuration et données restaurées avec succès !', 'success');
      return true;
    } catch {
      showToast('Erreur : Fichier JSON invalide pour la restauration.', 'error');
      return false;
    }
  };

  const navigateToProduct = (productId: string) => {
    setSelectedProductIdForView(productId);
    setCurrentPage('product');
    setActiveModal(null);
    trackViewedProduct(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCatalogWithSearch = (query: string, category?: string | null) => {
    const trimmed = query.trim();
    setGlobalSearchQuery(trimmed);
    if (trimmed) {
      addSearchHistory(trimmed);
    }
    if (category !== undefined) {
      setSelectedCategory(category);
    }
    setSelectedProductIdForView(null);
    setCurrentPage('catalog');
    setActiveModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setSelectedProductIdForView(null);
    setSelectedCategory(null);
    setCurrentPage('home');
    setActiveModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 12. Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <CommerceContext.Provider
      value={{
        storeSettings,
        updateStoreSettings,
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        products,
        getProductById,
        getProductBySlug,
        addProduct,
        updateProduct,
        deleteProduct,
        clearAllProducts,
        getVariantStock,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        promoCode,
        promoError,
        applyPromoCode,
        removePromoCode,
        discountAmount,
        estimatedTax,
        totalWithShipping,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        currentUser,
        registeredUsers,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        saveAddress,
        deleteAddress,
        deleteCategory,
        addCategory,
        updateCategory,
        orders,
        createOrder,
        updateOrderStatus,
        validateOrderPayment,
        confirmOrderDelivered,
        updateOrderAddress,
        calculateDistanceKm,
        calculateDeliveryFeeHTG,
        cancelOrder,
        getUserOrders,
        reviews,
        addReview,
        getProductReviews,
        searchHistory,
        addSearchHistory,
        clearSearchHistory,
        globalSearchQuery,
        setGlobalSearchQuery,
        currentPage,
        setCurrentPage,
        navigateToProduct,
        navigateToCatalogWithSearch,
        navigateToHome,
        recentlyViewed,
        trackViewedProduct,
        tickets,
        createTicket,
        replyToTicket,
        promoCodes,
        addPromoCode,
        togglePromoCode,
        activeModal,
        setActiveModal,
        adminSelectedTab,
        setAdminSelectedTab,
        openAdminTab,
        adminOpenCreateProduct,
        setAdminOpenCreateProduct,
        isAdminBarMinimized,
        setIsAdminBarMinimized,
        selectedProductIdForView,
        setSelectedProductIdForView,
        selectedCategory,
        setSelectedCategory,
        exportAllStoreData,
        importStoreData,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
};

export const useCommerce = () => {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return context;
};
