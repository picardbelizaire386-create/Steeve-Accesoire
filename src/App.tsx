import React, { useState } from 'react';
import { CommerceProvider, useCommerce } from './context/CommerceContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryShowcase } from './components/CategoryShowcase';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CatalogPage } from './components/CatalogPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AuthModal } from './components/AuthModal';
import { WishlistModal } from './components/WishlistModal';
import { ContactAndFAQModal } from './components/ContactAndFAQModal';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { SearchModal } from './components/SearchModal';
import { PermanentAdminBar } from './components/PermanentAdminBar';
import { ProductCategory, Product } from './types';
import { 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Headphones, 
  Sparkles, 
  Tag, 
  ArrowRight,
  Star,
  Quote,
  ShoppingBag,
  Plus
} from 'lucide-react';

function MainCommerceApp() {
  const { 
    products, 
    selectedProductIdForView, 
    setSelectedProductIdForView,
    selectedCategory,
    setSelectedCategory,
    recentlyViewed,
    setActiveModal,
    storeSettings,
    currentPage,
    setCurrentPage,
    navigateToHome,
    navigateToProduct,
    navigateToCatalogWithSearch,
  } = useCommerce();

  // Selected product
  const activeProduct = selectedProductIdForView 
    ? products.find(p => p.id === selectedProductIdForView)
    : null;

  const handleNavigateHome = () => {
    navigateToHome();
  };

  const handleNavigateCatalog = (category?: string) => {
    navigateToCatalogWithSearch('', category !== undefined ? category : null);
  };

  const handleSelectProduct = (product: Product) => {
    navigateToProduct(product.id);
  };

  // Popular and Deals products
  const popularProducts = products.filter(p => p.isPopular).slice(0, 4);
  const dealProducts = products.filter(p => p.isDealOfTheDay || (p.discountPercent && p.discountPercent > 15)).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);
  const viewedProducts = products.filter(p => recentlyViewed.includes(p.id)).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-slate-900 selection:text-white pb-14">
      {/* Top Announcement Bar if enabled */}
      {storeSettings.announcementActive && storeSettings.announcementText && (
        <aside 
          aria-label="Annonce officielle de la boutique"
          className="bg-slate-900 text-amber-300 text-xs py-2 px-4 text-center font-medium border-b border-slate-800 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{storeSettings.announcementText}</span>
        </aside>
      )}

      {/* Header */}
      <Header
        onNavigateHome={handleNavigateHome}
        onNavigateCatalog={handleNavigateCatalog}
        onOpenSearch={() => setActiveModal('search')}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* VIEW 1: PRODUCT DETAIL PAGE */}
        {currentPage === 'product' && activeProduct ? (
          <ProductDetailPage
            product={activeProduct}
            onBack={() => setCurrentPage('catalog')}
            onSelectProduct={handleSelectProduct}
          />
        ) : currentPage === 'catalog' ? (
          /* VIEW 2: CATALOG PAGE */
          <CatalogPage
            initialCategory={selectedCategory as ProductCategory | null}
            onSelectProduct={handleSelectProduct}
          />
        ) : (
          /* VIEW 3: RICH HOME PAGE (Prompt Section 4) */
          <div className="space-y-12 sm:space-y-16">
            
            {/* Section 1: Bannière Principale */}
            <HeroBanner
              onDiscover={() => handleNavigateCatalog()}
              onViewDeals={() => handleNavigateCatalog()}
            />

            {/* Storefront Trust Strip */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-900 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{storeSettings.trustBadge1Title || 'Expédition Rapide'}</h4>
                    <p className="text-slate-500 mt-0.5">{storeSettings.trustBadge1Desc || 'Livraison sécurisée sous 24 à 48h en Haïti'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-900 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{storeSettings.trustBadge2Title || 'Paiement 100% Sécurisé'}</h4>
                    <p className="text-slate-500 mt-0.5">{storeSettings.trustBadge2Desc || 'MonCash, Natcash, Carte & à la livraison'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-900 shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{storeSettings.trustBadge3Title || 'Retours Garantis'}</h4>
                    <p className="text-slate-500 mt-0.5">{storeSettings.trustBadge3Desc || '14 jours pour échanger ou être remboursé'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-900 shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{storeSettings.trustBadge4Title || 'Service Client Dédié'}</h4>
                    <p className="text-slate-500 mt-0.5">{storeSettings.trustBadge4Desc || 'Support WhatsApp & téléphonique 7j/7'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Catégories Principales (Prompt Section 4.2) */}
            <CategoryShowcase
              onSelectCategory={(cat) => handleNavigateCatalog(cat)}
              onViewAll={() => handleNavigateCatalog()}
            />

            {/* Section 3 & 4: Produits ou Invitation catalogue vide */}
            {products.length === 0 ? (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="p-8 sm:p-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="max-w-2xl mx-auto space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      Boutique Officielle · Breffette, Cayes Sud (Code Postal : 8110)
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Catalogue {storeSettings.companyName} prêt pour vos produits
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Conformément à votre demande, les anciens produits d’exemple ont été retirés. Vous pouvez désormais ajouter vos propres photos, prix en Gourdes (HTG), pointures / tailles et quantités en stock via le panneau d’administration ou nous transmettre vos photos et informations dans le chat.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveModal('admin')}
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter un produit (Espace Admin)</span>
                    </button>
                    <button
                      onClick={() => setActiveModal('contact')}
                      className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all"
                    >
                      Coordonnées & Retrait (+509 5602 7710)
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              <>
                {/* Section 3: Produits Populaires */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Sélection du moment
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                        Produits les plus populaires
                      </h2>
                    </div>

                    <button
                      onClick={() => handleNavigateCatalog()}
                      className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                    >
                      <span>Voir tout le catalogue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {popularProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onSelect={handleSelectProduct}
                      />
                    ))}
                  </div>
                </section>

                {/* Section 4: Promotions & Offres Spéciales */}
                {dealProducts.length > 0 && (
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                            <Tag className="w-3.5 h-3.5" />
                            <span>Promotions exclusives du jour</span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                            Offres à durée limitée
                          </h2>
                          <p className="text-slate-400 text-xs mt-1">
                            Profitez de réductions exclusives sur nos stocks disponibles certifiés.
                          </p>
                        </div>

                        <button
                          onClick={() => handleNavigateCatalog()}
                          className="px-4 py-2 bg-white text-slate-950 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors self-start sm:self-auto"
                        >
                          Voir toutes les promotions
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {dealProducts.map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            onSelect={handleSelectProduct}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Section 5: Nouveaux Arrivages */}
                {newArrivals.length > 0 && (
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Dernières rentrées en stock</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                          Nouveaux arrivages
                        </h2>
                      </div>

                      <button
                        onClick={() => handleNavigateCatalog()}
                        className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      >
                        <span>Découvrir</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {newArrivals.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onSelect={handleSelectProduct}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Section 6: Témoignages Clients Vérifiés (Modifiables par l'Administrateur) */}
            {storeSettings.testimonials && storeSettings.testimonials.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="p-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-6">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Retours d&apos;expérience clients
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                      Ce que disent nos clients satisfaits
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
                    {storeSettings.testimonials.map((t) => (
                      <div key={t.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center text-amber-400 mb-2">
                            {[...Array(t.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <p className="leading-relaxed text-slate-800 font-medium italic">
                            &quot;{t.comment}&quot;
                          </p>
                        </div>
                        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 font-medium">
                          <strong>{t.name}</strong> · {t.location} {t.isVerified !== false ? '(Achat vérifié)' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Section 7: Articles Récemment Consultés */}
            {viewedProducts.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Récemment consultés
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {viewedProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={handleSelectProduct}
                    />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigateCatalog={handleNavigateCatalog} />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderHistoryModal />
      <AdminDashboardModal />
      <AuthModal />
      <WishlistModal onSelectProduct={handleSelectProduct} />
      <ContactAndFAQModal />
      <SearchModal />
      <ToastContainer />

      {/* Permanent Administrator Toolbar */}
      <PermanentAdminBar />
    </div>
  );
}

export default function App() {
  return (
    <CommerceProvider>
      <MainCommerceApp />
    </CommerceProvider>
  );
}
