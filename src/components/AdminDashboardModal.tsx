import React, { useState, useEffect } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { 
  X, 
  ShieldCheck, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Truck, 
  Check, 
  Tag, 
  Smartphone, 
  FolderTree, 
  Rocket, 
  Download, 
  Palette, 
  Eye, 
  Sliders, 
  Sparkles, 
  Upload, 
  ExternalLink, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  MessageSquare,
  Star,
  Info
} from 'lucide-react';
import { OrderStatus, Product, ProductCategory, ProductVariant, PromoCode, StoreCategoryItem, TestimonialItem } from '../types';
import { CATEGORIES_LIST, DEFAULT_STORE_SETTINGS } from '../data/mockData';

export const AdminDashboardModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    adminSelectedTab,
    setAdminSelectedTab,
    adminOpenCreateProduct,
    setAdminOpenCreateProduct,
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    clearAllProducts,
    orders, 
    updateOrderStatus, 
    validateOrderPayment,
    confirmOrderDelivered,
    storeSettings, 
    updateStoreSettings, 
    formatPrice,
    convertPrice,
    promoCodes,
    addPromoCode,
    togglePromoCode,
    currency,
    setCurrency,
    exportAllStoreData,
    importStoreData
  } = useCommerce();

  // Active Tab synchronized with context
  const [activeTab, setActiveTab] = useState<typeof adminSelectedTab>('products');

  useEffect(() => {
    if (adminSelectedTab) {
      setActiveTab(adminSelectedTab);
    }
  }, [adminSelectedTab]);

  useEffect(() => {
    if (adminOpenCreateProduct) {
      setActiveTab('products');
      setIsCreatingNewProduct(true);
      setEditingProduct(null);
      setAdminOpenCreateProduct(false);
    }
  }, [adminOpenCreateProduct, setAdminOpenCreateProduct]);

  // Product Editing / Creation State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);
  const [productForm, setProductForm] = useState<{
    name: string;
    slug: string;
    sku: string;
    brand: string;
    category: string;
    type: 'apparel' | 'footwear' | 'electronics' | 'standard';
    priceHTG: number;
    priceUSD: number;
    originalPriceHTG: number;
    description: string;
    imageUrl: string;
    additionalImages: string[];
    lowStockThreshold: number;
    variants: ProductVariant[];
  }>({
    name: '',
    slug: '',
    sku: '',
    brand: 'STEEVE ACCESSOIRE',
    category: 'vetements-hommes',
    type: 'apparel',
    priceHTG: 8500,
    priceUSD: 64,
    originalPriceHTG: 10500,
    description: '',
    imageUrl: '',
    additionalImages: [],
    lowStockThreshold: 3,
    variants: [
      { id: 'v-s', label: 'Taille S / 40', stock: 10 },
      { id: 'v-m', label: 'Taille M / 41', stock: 10 },
      { id: 'v-l', label: 'Taille L / 42', stock: 5 },
      { id: 'v-xl', label: 'Taille XL / 43', stock: 5 },
    ],
  });

  // Category / Catalog Editing State
  const [editingCategory, setEditingCategory] = useState<StoreCategoryItem | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState<StoreCategoryItem>({
    id: '',
    name: '',
    description: '',
    image: '',
    itemCount: 0,
  });

  // Testimonials Editing State
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [isCreatingTestimonial, setIsCreatingTestimonial] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialItem>({
    id: '',
    name: '',
    location: 'Les Cayes',
    rating: 5,
    comment: '',
    isVerified: true,
  });

  // Settings & Branding form state
  const [settingsForm, setSettingsForm] = useState({ ...storeSettings });

  // Promo form state
  const [newPromoCode, setNewPromoCode] = useState<PromoCode>({
    code: '',
    type: 'percentage',
    value: 15,
    minOrderAmount: 50,
    description: '',
    isActive: true,
  });

  // Full Screen Screenshot Preview Modal
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // Orders Filter
  const [orderFilter, setOrderFilter] = useState<'all' | 'en_attente' | 'en_cours' | 'livree'>('all');

  // File upload helper converting image to base64 data-URL
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('L’image est trop volumineuse (maximum 10 Mo).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onSuccess(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (activeModal !== 'admin') return null;

  // KPI calculations
  const nonCancelledOrders = orders.filter(o => o.status !== 'annulee' && o.status !== 'remboursee');
  const totalRevenue = nonCancelledOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingValidationOrders = orders.filter(o => o.status === 'en_attente_paiement');
  const inProgressOrders = orders.filter(o => o.status === 'en_cours_de_livraison' || o.status === 'en_preparation' || o.status === 'expediee');
  const deliveredOrders = orders.filter(o => o.status === 'livree');
  const lowStockProducts = products.filter(p => {
    const total = p.variants.reduce((acc, v) => acc + v.stock, 0);
    return total <= p.lowStockThreshold;
  });

  // Product Actions
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setIsCreatingNewProduct(true);
    setProductForm({
      name: '',
      slug: '',
      sku: `STE-${Math.floor(100 + Math.random() * 900)}`,
      brand: 'STEEVE ACCESSOIRE',
      category: (storeSettings.customCategories?.[0]?.id) || 'vetements-hommes',
      type: 'apparel',
      priceHTG: 8500,
      priceUSD: 64,
      originalPriceHTG: 10500,
      description: '',
      imageUrl: '',
      additionalImages: [],
      lowStockThreshold: 3,
      variants: [
        { id: 'v-s', label: 'Taille S / Pointure 40', stock: 10 },
        { id: 'v-m', label: 'Taille M / Pointure 41', stock: 10 },
        { id: 'v-l', label: 'Taille L / Pointure 42', stock: 6 },
      ],
    });
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsCreatingNewProduct(false);
    const htgPrice = Math.round(prod.price * 132.5);
    const origHtg = prod.originalPrice ? Math.round(prod.originalPrice * 132.5) : htgPrice;
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      brand: prod.brand,
      category: prod.category,
      type: prod.type,
      priceHTG: htgPrice,
      priceUSD: prod.price,
      originalPriceHTG: origHtg,
      description: prod.description,
      imageUrl: prod.images[0] || '',
      additionalImages: prod.images.slice(1),
      lowStockThreshold: prod.lowStockThreshold,
      variants: [...prod.variants],
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Veuillez renseigner le nom du produit.');
      return;
    }

    const priceInUSD = productForm.priceUSD || (productForm.priceHTG / 132.5);
    const origPriceInUSD = productForm.originalPriceHTG ? (productForm.originalPriceHTG / 132.5) : undefined;
    const allImages = productForm.imageUrl ? [productForm.imageUrl, ...productForm.additionalImages.filter(Boolean)] : ['/src/assets/images/hero_commerce_lifestyle_1791556272110.jpg'];

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: productForm.name,
        slug: productForm.slug || productForm.name.toLowerCase().replace(/\s+/g, '-'),
        sku: productForm.sku,
        brand: productForm.brand,
        category: productForm.category as ProductCategory,
        type: productForm.type,
        price: priceInUSD,
        originalPrice: origPriceInUSD,
        description: productForm.description,
        images: allImages,
        lowStockThreshold: productForm.lowStockThreshold,
        variants: productForm.variants,
      });
    } else {
      addProduct({
        name: productForm.name,
        slug: productForm.slug || productForm.name.toLowerCase().replace(/\s+/g, '-'),
        sku: productForm.sku,
        brand: productForm.brand,
        category: productForm.category as ProductCategory,
        type: productForm.type,
        price: priceInUSD,
        originalPrice: origPriceInUSD,
        discountPercent: origPriceInUSD ? Math.round(((origPriceInUSD - priceInUSD) / origPriceInUSD) * 100) : 0,
        description: productForm.description,
        features: ['Qualité certifiée', 'Livraison 24h Cayes Sud'],
        specs: { Marque: productForm.brand },
        images: allImages,
        rating: 5,
        reviewCount: 1,
        isNewArrival: true,
        lowStockThreshold: productForm.lowStockThreshold,
        variants: productForm.variants,
      });
    }

    setEditingProduct(null);
    setIsCreatingNewProduct(false);
  };

  // Category / Catalog Actions
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    const currentCats = [...(storeSettings.customCategories || CATEGORIES_LIST)];
    const catId = categoryForm.id || categoryForm.name.toLowerCase().replace(/\s+/g, '-');

    if (editingCategory) {
      const updated = currentCats.map(c => c.id === editingCategory.id ? { ...categoryForm, id: catId } : c);
      updateStoreSettings({ customCategories: updated });
    } else {
      currentCats.push({ ...categoryForm, id: catId });
      updateStoreSettings({ customCategories: currentCats });
    }
    setEditingCategory(null);
    setIsCreatingCategory(false);
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm('Voulez-vous supprimer définitivement ce catalogue du site ?')) {
      const currentCats = (storeSettings.customCategories || CATEGORIES_LIST).filter(c => c.id !== catId);
      updateStoreSettings({ customCategories: currentCats });
    }
  };

  const handleClearAllCategories = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer TOUS les catalogues du site ?')) {
      updateStoreSettings({ customCategories: [] });
    }
  };

  const handleResetDefaultCategories = () => {
    if (confirm('Voulez-vous restaurer tous les catalogues par défaut de STEEVE ACCESSOIRE ?')) {
      updateStoreSettings({ customCategories: DEFAULT_STORE_SETTINGS.customCategories });
    }
  };

  // Testimonials Actions
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.name.trim() || !testimonialForm.comment.trim()) return;

    const currentTests = [...(storeSettings.testimonials || [])];
    if (editingTestimonial) {
      const updated = currentTests.map(t => t.id === editingTestimonial.id ? testimonialForm : t);
      updateStoreSettings({ testimonials: updated });
    } else {
      currentTests.unshift({ ...testimonialForm, id: `test-${Date.now()}` });
      updateStoreSettings({ testimonials: currentTests });
    }
    setEditingTestimonial(null);
    setIsCreatingTestimonial(false);
  };

  const handleDeleteTestimonial = (id: string) => {
    if (confirm('Supprimer ce témoignage de la page d\'accueil ?')) {
      const updated = (storeSettings.testimonials || []).filter(t => t.id !== id);
      updateStoreSettings({ testimonials: updated });
    }
  };

  // Save Settings & Branding
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settingsForm);
  };

  // Add Promo Code
  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.code) return;
    addPromoCode(newPromoCode);
    setNewPromoCode({
      code: '',
      type: 'percentage',
      value: 15,
      minOrderAmount: 50,
      description: '',
      isActive: true,
    });
  };

  // Backup Export & Import
  const handleExportData = () => {
    const jsonStr = exportAllStoreData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `steeve-accessoire-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          importStoreData(reader.result);
        }
      };
      reader.readAsText(file);
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'en_attente') return o.status === 'en_attente_paiement';
    if (orderFilter === 'en_cours') return ['en_cours_de_livraison', 'en_preparation', 'expediee'].includes(o.status);
    if (orderFilter === 'livree') return o.status === 'livree';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in zoom-in-95">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full overflow-hidden border border-slate-200 max-h-[95vh] flex flex-col">
        
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  Panneau d&apos;Administration Permanent — {storeSettings.companyName || 'STEEVE ACCESSOIRE'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-semibold border border-emerald-500/30">
                  Actif & Permanent
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Breffette, Cayes Sud, Haïti · Téléphones : {storeSettings.phone} / {storeSettings.phoneSecondary} · Livraison 200 G/km
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="bg-slate-100 px-4 sm:px-6 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold shrink-0 scrollbar-none">
          {[
            { id: 'kpis', label: 'Tableau de bord', icon: DollarSign },
            { id: 'products', label: `Produits (${products.length})`, icon: ShoppingBag },
            { id: 'categories', label: `Catalogues (${(storeSettings.customCategories || CATEGORIES_LIST).length})`, icon: FolderTree },
            { id: 'payments', label: 'Paiements MonCash & NatCash', icon: Smartphone, highlight: true },
            { id: 'orders', label: `Commandes (${orders.length})`, icon: Package, badge: pendingValidationOrders.length },
            { id: 'homepage', label: 'Page d\'Accueil & Vitrine', icon: Palette },
            { id: 'settings', label: 'Livraison 200 G/km & Infos', icon: Settings },
            { id: 'promos', label: 'Codes Promo', icon: Tag },
            { id: 'deploy', label: 'Rendre Public & Sauvegarde', icon: Rocket },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setAdminSelectedTab(tab.id as typeof activeTab);
                  setEditingProduct(null);
                  setIsCreatingNewProduct(false);
                }}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.highlight ? 'text-emerald-600' : ''}`} />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: KPIS & OVERVIEW */}
          {activeTab === 'kpis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Revenus Commandes</span>
                  <div className="text-xl font-extrabold text-slate-900 font-mono">
                    {formatPrice(totalRevenue)}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">En Gourdes (HTG)</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Commandes à Valider</span>
                  <div className="text-xl font-extrabold text-amber-600 font-mono">
                    {pendingValidationOrders.length}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{orders.length} commandes au total</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Articles au Catalogue</span>
                  <div className="text-xl font-extrabold text-slate-900 font-mono">
                    {products.length}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Gestion par taille/pointure</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Alertes de Stock</span>
                  <div className="text-xl font-extrabold text-rose-600 font-mono">
                    {lowStockProducts.length}
                  </div>
                  <span className="text-[10px] text-rose-700 font-medium">Pièces critiques</span>
                </div>
              </div>

              {/* Quick Actions Strip */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-amber-50 border border-indigo-100 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Raccourcis Administrateur</div>
                  <div className="text-slate-600 text-xs">Accédez directement aux sections clés pour gérer votre magasin</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => { setActiveTab('products'); handleOpenNewProduct(); }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                  >
                    + Nouveau Produit
                  </button>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Comptes MonCash / Natcash
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Vérifier les Captures ({pendingValidationOrders.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS & INVENTORY */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {isCreatingNewProduct || editingProduct ? (
                /* PRODUCT FORM */
                <form onSubmit={handleSaveProduct} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {editingProduct ? `Modifier l'article : ${editingProduct.name}` : 'Ajouter un nouveau produit avec photo & tailles'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => { setEditingProduct(null); setIsCreatingNewProduct(false); }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Annuler
                    </button>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nom du produit *</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="Ex : Sneakers Blanches Urbaines en Cuir"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Catalogue / Rayon *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-medium"
                      >
                        {(storeSettings.customCategories || CATEGORIES_LIST).map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing in HTG & USD */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Prix en Gourdes (HTG) *</label>
                      <input
                        type="number"
                        min="1"
                        value={productForm.priceHTG}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setProductForm({ 
                            ...productForm, 
                            priceHTG: val,
                            priceUSD: Math.round((val / 132.5) * 10) / 10
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                        required
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Équivaut à env. ${productForm.priceUSD} USD
                      </span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Ancien Prix barré (HTG)</label>
                      <input
                        type="number"
                        min="0"
                        value={productForm.originalPriceHTG}
                        onChange={(e) => setProductForm({ ...productForm, originalPriceHTG: Number(e.target.value) })}
                        placeholder="Ex : 10500"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Pour afficher une remise promotionnelle
                      </span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Référence SKU / Code</label>
                      <input
                        type="text"
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Image Upload & Preview */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                    <label className="block font-bold text-slate-900">
                      Image principale du produit (Téléversement ou URL) *
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {productForm.imageUrl ? (
                        <div className="relative group shrink-0">
                          <img
                            src={productForm.imageUrl}
                            alt="Aperçu"
                            className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setProductForm({ ...productForm, imageUrl: '' })}
                            className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-1 shadow"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Téléverser une photo depuis mon appareil</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageFileUpload(e, (url) => setProductForm({ ...productForm, imageUrl: url }))}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={productForm.imageUrl}
                            onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                            placeholder="Ou collez un lien d'image web (https://...)"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sizes / Variants Stock Manager */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 text-xs">
                        Gestion des Tailles / Pointures et Quantités en Stock
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newVar: ProductVariant = {
                            id: `v-${Date.now()}`,
                            label: `Taille ${productForm.variants.length + 1}`,
                            stock: 5,
                          };
                          setProductForm({ ...productForm, variants: [...productForm.variants, newVar] });
                        }}
                        className="text-xs text-indigo-600 hover:underline font-bold"
                      >
                        + Ajouter une taille/option
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {productForm.variants.map((v, idx) => (
                        <div key={v.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                          <input
                            type="text"
                            value={v.label}
                            onChange={(e) => {
                              const updated = [...productForm.variants];
                              updated[idx].label = e.target.value;
                              setProductForm({ ...productForm, variants: updated });
                            }}
                            className="flex-1 p-1 bg-white border border-slate-200 rounded text-xs font-medium"
                            placeholder="Label (S, 42, Noir...)"
                          />
                          <div className="w-20">
                            <input
                              type="number"
                              min="0"
                              value={v.stock}
                              onChange={(e) => {
                                const updated = [...productForm.variants];
                                updated[idx].stock = Number(e.target.value);
                                setProductForm({ ...productForm, variants: updated });
                              }}
                              className="w-full p-1 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-center"
                              placeholder="Qté"
                            />
                          </div>
                          {productForm.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = productForm.variants.filter((_, i) => i !== idx);
                                setProductForm({ ...productForm, variants: updated });
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Description détaillée du produit</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Indiquez les détails, matière, coupe et garanties..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                    />
                  </div>

                  {/* Save buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => { setEditingProduct(null); setIsCreatingNewProduct(false); }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                    >
                      Enregistrer l&apos;article au catalogue
                    </button>
                  </div>
                </form>
              ) : (
                /* PRODUCTS LIST */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        Catalogue officiel — {storeSettings.companyName} ({products.length} articles)
                      </div>
                      <p className="text-xs text-slate-500">
                        {products.length === 0
                          ? 'Le catalogue est actuellement vide. Vous pouvez y ajouter vos propres photos et prix.'
                          : 'Gérez vos articles, prix en Gourdes, photos et stocks restants.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {products.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Voulez-vous supprimer TOUS les produits du catalogue pour repartir de zéro avec vos propres articles ? Cette action est irréversible.')) {
                              clearAllProducts();
                            }
                          }}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Vider tout le catalogue</span>
                        </button>
                      )}

                      <button
                        onClick={handleOpenNewProduct}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter un produit</span>
                      </button>
                    </div>
                  </div>

                  {products.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Catalogue prêt pour vos articles
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Les anciens produits ont été retirés. Vous pouvez désormais ajouter vos propres photos, prix en Gourdes (HTG), noms et stocks de Steeve Accessoire.
                      </p>
                      <button
                        onClick={handleOpenNewProduct}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter mon premier produit</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {products.map(p => {
                        const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                        return (
                          <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]} alt="" className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0" />
                              <div className="text-xs">
                                <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                                <div className="font-mono font-bold text-indigo-600 mt-0.5">
                                  {formatPrice(p.price)}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Stock total : <strong className={totalStock === 0 ? 'text-rose-600 font-bold' : ''}>{totalStock} pièces</strong>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Modifier ce produit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Supprimer définitivement "${p.name}" ?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-1 font-semibold text-[11px] transition-colors"
                                title="Supprimer ce produit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Supprimer</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES & CATALOGS */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Gestion des Catalogues & Rayons (Autonomie Totale)</h4>
                  <p className="text-xs text-slate-500">
                    Ajoutez, modifiez ou supprimez librement tous les catalogues et collections du site web
                  </p>
                </div>
                {!isCreatingCategory && !editingCategory && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleResetDefaultCategories}
                      className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                      title="Restaurer les catalogues officiels de STEEVE ACCESSOIRE"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Catalogues par défaut</span>
                    </button>
                    <button
                      onClick={handleClearAllCategories}
                      className="px-3 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                      title="Supprimer tous les catalogues"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Vider tous les catalogues</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingCategory(true);
                        setEditingCategory(null);
                        setCategoryForm({
                          id: '',
                          name: '',
                          description: '',
                          image: '/src/assets/images/hero_commerce_lifestyle_1791556272110.jpg',
                          itemCount: 0,
                        });
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nouveau Catalogue</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Form */}
              {(isCreatingCategory || editingCategory) && (
                <form onSubmit={handleSaveCategory} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <h5 className="font-bold text-slate-900">
                    {editingCategory ? `Modifier le catalogue : ${editingCategory.name}` : 'Créer un nouveau catalogue'}
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nom du catalogue *</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="Ex : Montres & Lunettes de Soleil"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Image du catalogue (URL ou upload)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={categoryForm.image}
                          onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                          className="flex-1 p-2 bg-white border border-slate-300 rounded-lg font-mono text-[11px]"
                        />
                        <label className="px-2.5 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer shrink-0 font-medium">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(e, (url) => setCategoryForm({ ...categoryForm, image: url }))}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Description courte</label>
                    <input
                      type="text"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Accessoires tendance pour compléter votre style"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setEditingCategory(null); setIsCreatingCategory(false); }}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg"
                    >
                      Enregistrer le Catalogue
                    </button>
                  </div>
                </form>
              )}

              {/* Grid or Empty State */}
              {(!storeSettings.customCategories || storeSettings.customCategories.length === 0) ? (
                <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                  <FolderTree className="w-10 h-10 text-slate-400 mx-auto" />
                  <h5 className="font-bold text-slate-800 text-sm">Aucun catalogue actif pour le moment</h5>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Vous avez la pleine autonomie pour ajouter vos propres catalogues avec vos photos et descriptions, ou rétablir les rayons par défaut.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={handleResetDefaultCategories}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100 shadow-sm"
                    >
                      Restaurer les catalogues par défaut
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingCategory(true);
                        setEditingCategory(null);
                        setCategoryForm({
                          id: '',
                          name: '',
                          description: '',
                          image: '/src/assets/images/hero_commerce_lifestyle_1791556272110.jpg',
                          itemCount: 0,
                        });
                      }}
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800"
                    >
                      + Créer mon premier catalogue
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {storeSettings.customCategories.map(cat => (
                    <div key={cat.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors shadow-sm">
                      <div className="flex items-center gap-3">
                        <img src={cat.image} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                        <div className="text-xs">
                          <div className="font-bold text-slate-900">{cat.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{cat.description}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {cat.id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsCreatingCategory(false);
                            setCategoryForm({ ...cat });
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Modifier ce catalogue"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-1 font-semibold text-[11px] transition-colors"
                          title="Supprimer définitivement ce catalogue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT METHODS (MONCASH & NATCASH ADMIN ACCOUNTS) */}
          {activeTab === 'payments' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-950">
                <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Gestion des Comptes MonCash & Natcash de l&apos;Administrateur</h4>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    Le client effectue son transfert directement sur ces comptes, puis téléverse une capture d&apos;écran claire de la transaction. Après vérification par vos soins dans l&apos;onglet Commandes, le statut passera de <strong>&quot;En attente&quot;</strong> à <strong>&quot;En cours&quot;</strong>.
                  </p>
                </div>
              </div>

              {/* MonCash Configuration */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-rose-600 text-white font-bold text-xs flex items-center justify-center">M</div>
                    <h5 className="font-bold text-slate-900 text-sm">Compte MonCash (Digicel Haïti)</h5>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.moncashActive}
                      onChange={(e) => setSettingsForm({ ...settingsForm, moncashActive: e.target.checked })}
                      className="rounded text-rose-600"
                    />
                    <span className="font-semibold text-slate-700">Paiement MonCash Actif</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Numéro de téléphone / Compte MonCash *</label>
                    <input
                      type="text"
                      value={settingsForm.moncashNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, moncashNumber: e.target.value })}
                      placeholder="+509 5602 7710"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nom complet du titulaire de compte *</label>
                    <input
                      type="text"
                      value={settingsForm.moncashAccountName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, moncashAccountName: e.target.value })}
                      placeholder="STEEVE ACCESSOIRE (Admin)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instructions affichées au client</label>
                  <textarea
                    rows={2}
                    value={settingsForm.moncashInstructions}
                    onChange={(e) => setSettingsForm({ ...settingsForm, moncashInstructions: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Natcash Configuration */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-sky-600 text-white font-bold text-xs flex items-center justify-center">N</div>
                    <h5 className="font-bold text-slate-900 text-sm">Compte Natcash (Natcom Haïti)</h5>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.natcashActive}
                      onChange={(e) => setSettingsForm({ ...settingsForm, natcashActive: e.target.checked })}
                      className="rounded text-sky-600"
                    />
                    <span className="font-semibold text-slate-700">Paiement Natcash Actif</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Numéro de téléphone / Compte Natcash *</label>
                    <input
                      type="text"
                      value={settingsForm.natcashNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, natcashNumber: e.target.value })}
                      placeholder="+509 4005 4375"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nom complet du titulaire de compte *</label>
                    <input
                      type="text"
                      value={settingsForm.natcashAccountName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, natcashAccountName: e.target.value })}
                      placeholder="STEEVE ACCESSOIRE (Admin)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instructions affichées au client</label>
                  <textarea
                    rows={2}
                    value={settingsForm.natcashInstructions}
                    onChange={(e) => setSettingsForm({ ...settingsForm, natcashInstructions: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer les comptes de paiement MonCash & Natcash</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: ORDERS & PAYMENT VERIFICATION */}
          {activeTab === 'orders' && (
            <div className="space-y-4 text-xs">
              {/* Header and Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Vérification des Commandes & Captures d&apos;Écran ({orders.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Vérifiez la capture d&apos;écran du client avant de valider le passage &quot;En attente&quot; → &quot;En cours&quot;, puis confirmez la livraison effectuée.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: `Toutes (${orders.length})` },
                    { id: 'en_attente', label: `En attente (${pendingValidationOrders.length})`, highlight: pendingValidationOrders.length > 0 },
                    { id: 'en_cours', label: `En cours (${inProgressOrders.length})` },
                    { id: 'livree', label: `Livrées (${deliveredOrders.length})` },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilter(f.id as typeof orderFilter)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        orderFilter === f.id
                          ? 'bg-slate-900 text-white'
                          : f.highlight
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List / Cards */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-2 text-slate-500">
                    <Package className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-medium">Aucune commande trouvée pour ce filtre.</p>
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    const isPending = order.status === 'en_attente_paiement';
                    const isInProgress = ['en_cours_de_livraison', 'en_preparation', 'expediee'].includes(order.status);
                    const isDelivered = order.status === 'livree';

                    return (
                      <div
                        key={order.id}
                        className={`p-4 bg-white border rounded-2xl space-y-3 transition-all ${
                          isPending
                            ? 'border-amber-300 shadow-sm bg-amber-50/20'
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Top bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {order.orderNumber}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : isInProgress
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : isDelivered
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isPending ? '⏳ En attente de validation' : isInProgress ? '🚚 En cours de livraison' : isDelivered ? '✅ Livrée' : order.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-extrabold text-indigo-600 text-sm">
                              {formatPrice(order.totalAmount)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Delivery details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          {/* Client */}
                          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>👤 Client & Coordonnées</span>
                            </div>
                            <div className="font-semibold text-slate-800">{order.shippingAddress.fullName}</div>
                            <div className="font-mono text-slate-900 font-bold">{order.shippingAddress.phone}</div>
                            <div className="text-slate-500 text-[11px]">{order.shippingAddress.email}</div>
                          </div>

                          {/* Address & GPS */}
                          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <div className="font-bold text-slate-900 flex items-center justify-between">
                              <span className="flex items-center gap-1">📍 Destination</span>
                              {order.shippingAddress.googleMapsUrl && (
                                <a
                                  href={order.shippingAddress.googleMapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-600 hover:underline flex items-center gap-1 font-bold text-[11px]"
                                >
                                  <span>Itinéraire</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-slate-800 font-medium">{order.shippingAddress.addressLine}, {order.shippingAddress.city}</div>
                            <div className="text-slate-500 text-[11px]">
                              Distance : <strong>{order.distanceKm || 1.5} km</strong> (Tarif : 200 G/km)
                            </div>
                          </div>

                          {/* Payment Screenshot Proof */}
                          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <div className="font-bold text-slate-900 flex items-center justify-between">
                              <span>💳 Preuve de Paiement</span>
                              <span className="font-bold uppercase text-[10px] text-slate-600">
                                {order.selectedMobileWallet || order.paymentMethod}
                              </span>
                            </div>
                            
                            {order.paymentProofImageUrl ? (
                              <div className="flex items-center gap-3 pt-1">
                                <img
                                  src={order.paymentProofImageUrl}
                                  alt="Preuve"
                                  onClick={() => setPreviewScreenshotUrl(order.paymentProofImageUrl || null)}
                                  className="w-12 h-12 rounded object-cover border border-slate-300 cursor-pointer hover:opacity-90 shadow-sm"
                                  title="Cliquez pour agrandir la capture d'écran"
                                />
                                <div className="text-[11px] space-y-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewScreenshotUrl(order.paymentProofImageUrl || null)}
                                    className="text-indigo-600 font-bold hover:underline block"
                                  >
                                    🔍 Voir la capture d&apos;écran
                                  </button>
                                  {order.transactionReference && (
                                    <span className="text-slate-500 font-mono block">Réf : {order.transactionReference}</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-slate-400 text-[11px] italic">
                                Aucune capture (Paiement {order.paymentMethod})
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600">
                          <span className="font-bold text-slate-700">Articles :</span>
                          {order.items.map((it, idx) => (
                            <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {it.productName} ({it.variantLabel}) × {it.quantity}
                            </span>
                          ))}
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            {/* Action 1: Validate payment -> move to In Progress */}
                            {isPending && (
                              <button
                                onClick={() => validateOrderPayment(order.id)}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Valider le paiement (Passer en cours)</span>
                              </button>
                            )}

                            {/* Action 2: Confirm delivery -> move to Delivered */}
                            {isInProgress && (
                              <button
                                onClick={() => confirmOrderDelivered(order.id)}
                                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Confirmer la livraison effectuée (Statut Livrée)</span>
                              </button>
                            )}

                            {isDelivered && (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Livraison achevée avec succès</span>
                              </span>
                            )}
                          </div>

                          {/* Manual status dropdown for advanced adjustments */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 text-[11px]">Changer manuellement :</span>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="text-xs p-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-medium"
                            >
                              <option value="en_attente_paiement">En attente</option>
                              <option value="en_cours_de_livraison">En cours</option>
                              <option value="livree">Livrée</option>
                              <option value="annulee">Annulée</option>
                              <option value="remboursee">Remboursée</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 6: HOMEPAGE & BRANDING MANAGEMENT */}
          {activeTab === 'homepage' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3 text-indigo-950">
                <Palette className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Gestion Complète des Éléments de la Page d&apos;Accueil</h4>
                  <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
                    Vous pouvez modifier, supprimer et ajouter tous les éléments de la vitrine : le logo, les bannières hero, les avis clients et les coordonnées.
                  </p>
                </div>
              </div>

              {/* Brand & Logo */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  1. Nom de la Boutique & Logo
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nom de l&apos;enseigne</label>
                    <input
                      type="text"
                      value={settingsForm.companyName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                      placeholder="STEEVE ACCESSOIRE"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Slogan</label>
                    <input
                      type="text"
                      value={settingsForm.slogan}
                      onChange={(e) => setSettingsForm({ ...settingsForm, slogan: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1">
                    <label className="block font-semibold text-slate-700 mb-1">Logo officiel (URL ou téléversement)</label>
                    <input
                      type="text"
                      value={settingsForm.logoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                      placeholder="https://... ou téléversez une image"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <label className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer shrink-0 mt-5">
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, (url) => setSettingsForm({ ...settingsForm, logoUrl: url }))}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Hero Banner Elements */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  2. Bannière Principale (Hero Banner)
                </h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Titre d&apos;accroche principal</label>
                    <input
                      type="text"
                      value={settingsForm.heroTitle || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Badge Kicker haut</label>
                    <input
                      type="text"
                      value={settingsForm.heroKicker || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroKicker: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sous-titre descriptif</label>
                  <textarea
                    rows={2}
                    value={settingsForm.heroSubtitle || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block font-semibold text-slate-700 mb-1">Image de fond (URL ou upload)</label>
                    <input
                      type="text"
                      value={settingsForm.heroImageUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroImageUrl: e.target.value })}
                      placeholder="Collez une URL d'image de fond"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <label className="px-3 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer shrink-0 font-bold mt-5">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, (url) => setSettingsForm({ ...settingsForm, heroImageUrl: url }))}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Announcement Bar */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    3. Barre d&apos;Annonce Supérieure
                  </h5>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.announcementActive}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementActive: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold text-slate-700">Activer la barre d&apos;annonce</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={settingsForm.announcementText || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  placeholder="Ex : Livraison express 24h à Breffette, Cayes Sud & partout en Haïti"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              {/* 4 Trust Badges */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  4. Les 4 Badges de Réassurance
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Badge 1 : Livraison</label>
                    <input
                      type="text"
                      value={settingsForm.trustBadge1Title || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustBadge1Title: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-semibold text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.trustBadge1Desc || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustBadge1Desc: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px]"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Badge 2 : Paiement</label>
                    <input
                      type="text"
                      value={settingsForm.trustBadge2Title || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustBadge2Title: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-semibold text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.trustBadge2Desc || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustBadge2Desc: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px]"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Badge 3 : Délais & Retours</label>
                    <input
                      type="text"
                      value={settingsForm.trustBadge3Title || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustBadge3Title: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-semibold text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.trustBadge3Desc || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustBadge3Desc: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px]"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Badge 4 : Service Client</label>
                    <input
                      type="text"
                      value={settingsForm.trustBadge4Title || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustBadge4Title: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-semibold text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.trustBadge4Desc || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustBadge4Desc: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Home Testimonials Management */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      5. Témoignages & Avis Clients de la Page d&apos;Accueil ({(settingsForm.testimonials || []).length})
                    </h5>
                    <p className="text-[11px] text-slate-500">Ajoutez, modifiez ou supprimez les avis affichés</p>
                  </div>
                  {!isCreatingTestimonial && !editingTestimonial && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingTestimonial(true);
                        setEditingTestimonial(null);
                        setTestimonialForm({
                          id: `test-${Date.now()}`,
                          name: '',
                          location: 'Breffette, Cayes Sud',
                          rating: 5,
                          comment: '',
                          isVerified: true,
                        });
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg"
                    >
                      + Ajouter un avis
                    </button>
                  )}
                </div>

                {/* Testimonial Form */}
                {(isCreatingTestimonial || editingTestimonial) && (
                  <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">Nom du client</label>
                        <input
                          type="text"
                          value={testimonialForm.name}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                          placeholder="Marie-Claire Dorcé"
                          className="w-full p-2 bg-white border border-slate-200 rounded"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">Ville / Commune</label>
                        <input
                          type="text"
                          value={testimonialForm.location}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, location: e.target.value })}
                          placeholder="Les Cayes"
                          className="w-full p-2 bg-white border border-slate-200 rounded"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">Note (1 à 5)</label>
                        <select
                          value={testimonialForm.rating}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                          className="w-full p-2 bg-white border border-slate-200 rounded font-bold"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5 étoiles)</option>
                          <option value="4">⭐⭐⭐⭐ (4 étoiles)</option>
                          <option value="3">⭐⭐⭐ (3 étoiles)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-0.5">Commentaire du client</label>
                      <textarea
                        rows={2}
                        value={testimonialForm.comment}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, comment: e.target.value })}
                        placeholder="Ex : Super service de livraison sous 24h à Breffette !"
                        className="w-full p-2 bg-white border border-slate-200 rounded"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditingTestimonial(null); setIsCreatingTestimonial(false); }}
                        className="px-3 py-1 bg-slate-200 rounded"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveTestimonial}
                        className="px-4 py-1 bg-slate-900 text-white font-bold rounded"
                      >
                        Enregistrer l&apos;avis
                      </button>
                    </div>
                  </div>
                )}

                {/* Testimonials List */}
                <div className="space-y-2">
                  {(settingsForm.testimonials || []).map(t => (
                    <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900">{t.name} · <span className="text-slate-500 font-normal">{t.location}</span></div>
                        <p className="text-[11px] text-slate-600 italic">&quot;{t.comment}&quot;</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTestimonial(t);
                            setIsCreatingTestimonial(false);
                            setTestimonialForm({ ...t });
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Save */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Enregistrer toutes les modifications de la page d&apos;accueil
                </button>
              </div>
            </form>
          )}

          {/* TAB 7: SETTINGS & KILOMETRIC DELIVERY (200 G/KM) */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              {/* Delivery Rate Configuration */}
              <div className="p-5 bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600 font-bold" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Paramètres de Livraison Kilométrique & Coordonnées GPS
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Prix de livraison au kilomètre parcouru (Gourdes HTG) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settingsForm.deliveryRatePerKmHTG}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deliveryRatePerKmHTG: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono font-extrabold text-indigo-600 text-sm"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Par défaut : 200 Gourdes par kilomètre parcouru
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Délai de livraison garanti *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.deliveryHoursGuarantee}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deliveryHoursGuarantee: e.target.value })}
                      placeholder="24h"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Affiché aux clients (24h garanti)
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Délai de correction d&apos;adresse client (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={settingsForm.addressCorrectionGraceMinutes}
                      onChange={(e) => setSettingsForm({ ...settingsForm, addressCorrectionGraceMinutes: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Délai de grâce avant statut &quot;En cours&quot; (2 à 3 min)
                    </span>
                  </div>
                </div>

                {/* GPS Coordinates of the Shop in Breffette */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-indigo-100">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Latitude du Magasin (Breffette, Cayes)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={settingsForm.storeLatitude}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeLatitude: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Longitude du Magasin (Breffette, Cayes)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={settingsForm.storeLongitude}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeLongitude: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Official Store Address & Contacts */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">
                  Coordonnées Officielles de Steeve Accessoire
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Adresse de la boutique *</label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      placeholder="Breffette, Cayes Sud"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ville / Département *</label>
                    <input
                      type="text"
                      value={settingsForm.city}
                      onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                      placeholder="Les Cayes (Sud)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Code Postal (Haïti) *</label>
                    <input
                      type="text"
                      value={settingsForm.postalCode || '8110'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, postalCode: e.target.value })}
                      placeholder="8110"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Téléphone Principal (WhatsApp) *</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      placeholder="+509 5602 7710"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Deuxième Téléphone *</label>
                    <input
                      type="text"
                      value={settingsForm.phoneSecondary || '+509 4005 4375'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phoneSecondary: e.target.value })}
                      placeholder="+509 4005 4375"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Adresse e-mail de contact</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Devise principale du site</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as 'HTG' | 'USD' | 'EUR')}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                    >
                      <option value="HTG">Gourde Haïtienne (HTG) — Recommandé</option>
                      <option value="USD">Dollar Américain (USD)</option>
                    </select>
                  </div>
                </div>

                {/* Social Networks Links */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 text-xs">Liens des Réseaux Sociaux</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">WhatsApp</label>
                      <input
                        type="text"
                        value={settingsForm.socialLinks.whatsapp || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, socialLinks: { ...settingsForm.socialLinks, whatsapp: e.target.value } })}
                        placeholder="https://wa.me/50956027710"
                        className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Facebook</label>
                      <input
                        type="text"
                        value={settingsForm.socialLinks.facebook || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, socialLinks: { ...settingsForm.socialLinks, facebook: e.target.value } })}
                        placeholder="https://facebook.com/..."
                        className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Instagram</label>
                      <input
                        type="text"
                        value={settingsForm.socialLinks.instagram || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, socialLinks: { ...settingsForm.socialLinks, instagram: e.target.value } })}
                        placeholder="https://instagram.com/..."
                        className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Enregistrer les paramètres de livraison et coordonnées
                </button>
              </div>
            </form>
          )}

          {/* TAB 8: PROMO CODES */}
          {activeTab === 'promos' && (
            <div className="space-y-6 text-xs">
              <form onSubmit={handleAddPromo} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Créer un code promotionnel</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Code promo (ex : BIENVENUE10)</label>
                    <input
                      type="text"
                      value={newPromoCode.code}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value })}
                      placeholder="BIENVENUE10"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg uppercase font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Type de réduction</label>
                    <select
                      value={newPromoCode.type}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="percentage">Pourcentage (%)</option>
                      <option value="fixed">Montant fixe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Valeur</label>
                    <input
                      type="number"
                      min="1"
                      value={newPromoCode.value}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, value: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Achat minimum ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={newPromoCode.minOrderAmount}
                      onChange={(e) => setNewPromoCode({ ...newPromoCode, minOrderAmount: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Ajouter le code promo
                </button>
              </form>

              {/* Promo List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="p-3">Code</th>
                      <th className="p-3">Remise</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {promoCodes.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{p.code}</td>
                        <td className="p-3 font-semibold text-slate-800">
                          {p.type === 'percentage' ? `-${p.value}%` : `-${formatPrice(p.value)}`}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {p.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => togglePromoCode(p.code)}
                            className="text-xs text-indigo-600 hover:underline font-medium"
                          >
                            {p.isActive ? 'Désactiver' : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: DEPLOY & FULL STORE BACKUP */}
          {activeTab === 'deploy' && (
            <div className="space-y-6 text-xs">
              {/* Backup & Portability Card */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Download className="w-5 h-5" />
                  <span>Sauvegarde Permanente & Restauration des Données</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                  Toutes vos modifications (produits, prix, catalogues, comptes MonCash/Natcash, paramètres de livraison 200 G/km et avis clients) sont sauvegardées localement. Vous pouvez télécharger un fichier JSON complet pour conserver vos données et les transférer sur n&apos;importe quel ordinateur ou serveur.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger la Sauvegarde Complète (JSON)</span>
                  </button>

                  <label className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2 border border-white/20">
                    <Upload className="w-4 h-4" />
                    <span>Restaurer une Sauvegarde existante</span>
                    <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Guide to Publish Website */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Rocket className="w-5 h-5 text-indigo-600" />
                  <span>Comment Rendre le Site Public en Ligne pour vos Clients</span>
                </div>

                <div className="space-y-3 text-slate-700 leading-relaxed">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-900 block">Vérifiez vos produits et comptes MonCash/NatCash</strong>
                      Assurez-vous que vos numéros de téléphone (+509 5602 7710 et +509 4005 4375) et votre adresse à Breffette (Cayes Sud 8110) sont bien configurés.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-900 block">Téléchargez votre sauvegarde JSON</strong>
                      Cliquez sur le bouton ci-dessus pour télécharger votre fichier de configuration afin de ne jamais perdre vos données.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-900 block">Hébergement & Nom de Domaine</strong>
                      L&apos;application est prête pour la production avec Vite & React. Vous pouvez la déployer gratuitement en 1 clic sur Vercel, Netlify, Cloudflare Pages ou Firebase Hosting, et relier votre nom de domaine personnalisé (ex : <code>steeveaccessoire.com</code>).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Fullscreen Screenshot Modal */}
      {previewScreenshotUrl && (
        <div
          onClick={() => setPreviewScreenshotUrl(null)}
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl">
            <button
              onClick={() => setPreviewScreenshotUrl(null)}
              className="absolute top-3 right-3 bg-slate-900 text-white p-1 rounded-full shadow"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewScreenshotUrl} alt="Capture plein écran" className="max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
