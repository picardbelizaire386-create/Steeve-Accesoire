import React, { useState, useRef, useEffect } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  Clock, 
  Package, 
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  Globe, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { CURRENCIES } from '../data/mockData';
import { CurrencyCode } from '../types';

interface HeaderProps {
  onNavigateHome: () => void;
  onNavigateCatalog: (category?: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNavigateHome, 
  onNavigateCatalog,
  onOpenSearch,
}) => {
  const { 
    storeSettings, 
    currency, 
    setCurrency, 
    cartCount, 
    wishlist, 
    currentUser, 
    logout, 
    setIsCartDrawerOpen, 
    setActiveModal,
    setSelectedCategory,
    setSelectedProductIdForView,
    searchHistory,
    products,
    formatPrice,
    navigateToCatalogWithSearch,
    navigateToProduct,
  } = useCommerce();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [drawerSearchInput, setDrawerSearchInput] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Filter products for live suggestions
  const suggestions = searchInput.trim().length > 1 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchInput.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.category.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchInput.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      navigateToCatalogWithSearch(searchInput.trim());
      setShowSearchSuggestions(false);
    }
  };

  const handleSelectSuggestion = (prodId: string) => {
    navigateToProduct(prodId);
    setShowSearchSuggestions(false);
    setSearchInput('');
  };

  const handleDrawerNavigate = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Banner - Subtle trust / store statement */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">{storeSettings.companyName}</span>
            <span className="text-slate-600 hidden md:inline">·</span>
            <span className="text-slate-400 hidden md:inline">{storeSettings.address}, {storeSettings.city} {storeSettings.postalCode ? `(${storeSettings.postalCode})` : ''}</span>
            <span className="text-slate-600 hidden lg:inline">·</span>
            <span className="text-slate-400 hidden lg:inline font-mono">Tél: {storeSettings.phone}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            {/* Currency Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1 hover:text-white transition-colors py-0.5 px-1.5 rounded focus-visible:ring-1 focus-visible:ring-white"
                aria-label="Changer de devise"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-200">{currency} ({CURRENCIES[currency]?.symbol})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 py-1 text-xs">
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((cCode) => (
                    <button
                      key={cCode}
                      onClick={() => {
                        setCurrency(cCode);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                        currency === cCode ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{CURRENCIES[cCode].name}</span>
                      <span className="font-mono text-xs">{CURRENCIES[cCode].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Switch shortcut */}
            <button
              onClick={() => setActiveModal('admin')}
              className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Espace Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Zone 1: Hamburger Button & Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Hamburger Button (Prompt Requirement: 3 petites barres ouvrant le menu latéral) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              aria-label="Ouvrir le menu principal"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo / Wordmark */}
            <button 
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              {storeSettings.logoUrl && (
                <img 
                  src={storeSettings.logoUrl} 
                  alt={storeSettings.companyName} 
                  style={{
                    height: `${storeSettings.logoHeight || 38}px`,
                    maxHeight: `${storeSettings.logoHeight || 38}px`,
                  }}
                  className="w-auto max-w-[220px] object-contain rounded transition-all" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div className={`w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-indigo-600 transition-colors shrink-0 ${storeSettings.logoUrl ? 'hidden sm:flex' : ''}`}>
                SA
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                  {storeSettings.companyName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5 hidden sm:block">
                  Boutique Officielle · Haïti
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Live Search Bar with Intelligent Autosuggest */}
          <div className="flex-1 max-w-xl relative hidden md:block" ref={searchBoxRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom, marque, référence SKU..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                className="w-full bg-slate-100 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 placeholder:text-slate-500 text-sm rounded-lg pl-10 pr-24 py-2.5 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-colors"
              >
                Rechercher
              </button>
            </form>

            {/* Suggestions Overlay */}
            {showSearchSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in-50">
                {suggestions.length > 0 ? (
                  <div className="p-2">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Suggestions de produits
                    </div>
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectSuggestion(p.id)}
                        className="w-full text-left p-2 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.images[0]} 
                            alt={p.name} 
                            className="w-10 h-10 object-cover rounded-md border border-slate-200" 
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {p.brand} · SKU: {p.sku}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 font-mono">
                          {formatPrice(p.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : searchInput.trim().length > 1 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    Aucun article trouvé pour &quot;{searchInput}&quot;.
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Recherches fréquentes</span>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {searchHistory.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchInput(item);
                            onNavigateCatalog();
                            setShowSearchSuggestions(false);
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Zone 3: Navigation Actions (Wishlist, Account, Cart) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Recherche"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Orders link (Prompt requirement) */}
            <button
              onClick={() => setActiveModal('orders')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Package className="w-4 h-4 text-slate-500" />
              <span>Commandes</span>
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => setActiveModal('wishlist')}
              className="relative p-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              aria-label="Mes favoris"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account Icon / Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-1.5 p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Mon compte"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
                  {currentUser ? currentUser.firstName.charAt(0) : <User className="w-4 h-4 text-slate-600" />}
                </div>
                <span className="text-xs font-medium text-slate-800 hidden xl:inline">
                  {currentUser ? currentUser.firstName : 'Connexion'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden xl:inline" />
              </button>

              {/* Profile dropdown menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in-50">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="font-semibold text-slate-900 text-sm">
                          {currentUser.firstName} {currentUser.lastName}
                        </div>
                        <div className="text-slate-500 truncate mt-0.5">
                          {currentUser.email}
                        </div>
                        {currentUser.phone && (
                          <div className="text-emerald-700 font-mono text-[11px] font-bold mt-1 flex items-center gap-1">
                            <span>📞 {currentUser.phone}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-sans">Vérifié (+509)</span>
                          </div>
                        )}
                        <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-indigo-600">
                          {currentUser.role === 'admin' ? 'Administrateur' : 'Client Vérifié · Commune des Cayes'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveModal('orders');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>Mes Commandes & Suivis</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveModal('wishlist');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>Mes Favoris ({wishlist.length})</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveModal('contact');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        <span>Service Client & Réclamations</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setActiveModal('admin');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 bg-indigo-50/70 hover:bg-indigo-100/70 flex items-center gap-2 text-indigo-700 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>Panneau Administrateur</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 mt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Se déconnecter</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 space-y-2">
                      <p className="text-slate-600 text-xs">Accédez à vos commandes, adresses et avantages.</p>
                      <button
                        onClick={() => {
                          setActiveModal('auth');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-center"
                      >
                        Se connecter / Inscription
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-slate-900 group"
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Panier</span>
              <span className="w-5 h-5 rounded-full bg-white text-slate-950 text-xs font-bold flex items-center justify-center font-mono">
                {cartCount}
              </span>
            </button>

          </div>
        </div>
      </header>

      {/* Hamburger Lateral Drawer Menu (Prompt Section 3 Requirement: exact 19 links) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in-50">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                {storeSettings.logoUrl ? (
                  <img
                    src={storeSettings.logoUrl}
                    alt={storeSettings.companyName}
                    className="h-7 w-auto object-contain rounded"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    SA
                  </div>
                )}
                <span className="font-bold text-slate-900 text-sm">{storeSettings.companyName}</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Drawer Search Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (drawerSearchInput.trim()) {
                    navigateToCatalogWithSearch(drawerSearchInput.trim());
                    setIsMobileMenuOpen(false);
                    setDrawerSearchInput('');
                  }
                }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={drawerSearchInput}
                  onChange={(e) => setDrawerSearchInput(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-lg pl-8 pr-16 py-2 outline-none focus:border-indigo-600 text-slate-900"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-slate-900 text-white rounded text-[10px] font-semibold"
                >
                  Chercher
                </button>
              </form>
            </div>

            {/* 19 Required Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-medium text-slate-700">
              {/* 1. Accueil */}
              <button
                onClick={() => handleDrawerNavigate(onNavigateHome)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950 flex items-center justify-between"
              >
                <span>1. Accueil</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 2. Toutes les catégories */}
              <button
                onClick={() => handleDrawerNavigate(() => { setSelectedCategory(null); onNavigateCatalog(); })}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950 flex items-center justify-between"
              >
                <span>2. Toutes les catégories</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 3. Nouveautés */}
              <button
                onClick={() => handleDrawerNavigate(() => onNavigateCatalog())}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">3. Nouveautés <Sparkles className="w-3.5 h-3.5 text-amber-500" /></span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 4. Meilleures ventes */}
              <button
                onClick={() => handleDrawerNavigate(() => onNavigateCatalog())}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950 flex items-center justify-between"
              >
                <span>4. Meilleures ventes</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 5. Promotions et offres spéciales */}
              <button
                onClick={() => handleDrawerNavigate(() => onNavigateCatalog())}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 flex items-center justify-between text-rose-600 font-semibold"
              >
                <span>5. Promotions et offres spéciales</span>
                <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-mono">-25%</span>
              </button>

              <div className="pt-2 pb-1 border-t border-slate-100 my-1">
                <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rayons de la boutique</span>
              </div>

              {/* 6. Vêtements */}
              <button
                onClick={() => handleDrawerNavigate(() => { setSelectedCategory('vetements-hommes'); onNavigateCatalog('vetements-hommes'); })}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950"
              >
                6. Vêtements (Hommes, Femmes, Enfants)
              </button>

              {/* 7. Chaussures et sandales */}
              <button
                onClick={() => handleDrawerNavigate(() => { setSelectedCategory('chaussures'); onNavigateCatalog('chaussures'); })}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950"
              >
                7. Chaussures et sandales
              </button>

              {/* 8. Téléphones et accessoires */}
              <button
                onClick={() => handleDrawerNavigate(() => { setSelectedCategory('telephones'); onNavigateCatalog('telephones'); })}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950"
              >
                8. Téléphones et accessoires
              </button>

              {/* 9. Écouteurs et appareils électroniques */}
              <button
                onClick={() => handleDrawerNavigate(() => { setSelectedCategory('ecouteurs'); onNavigateCatalog('ecouteurs'); })}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950"
              >
                9. Écouteurs et appareils électroniques
              </button>

              {/* 10. Câbles et chargeurs */}
              <button
                onClick={() => handleDrawerNavigate(() => { setSelectedCategory('cables-chargeurs'); onNavigateCatalog('cables-chargeurs'); })}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950"
              >
                10. Câbles et chargeurs
              </button>

              <div className="pt-2 pb-1 border-t border-slate-100 my-1">
                <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Espace Client</span>
              </div>

              {/* 11. Commandes */}
              <button
                onClick={() => handleDrawerNavigate(() => setActiveModal('orders'))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950 flex items-center justify-between"
              >
                <span>11. Commandes</span>
                <Package className="w-4 h-4 text-slate-400" />
              </button>

              {/* 12. Favoris */}
              <button
                onClick={() => handleDrawerNavigate(() => setActiveModal('wishlist'))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950 flex items-center justify-between"
              >
                <span>12. Favoris ({wishlist.length})</span>
                <Heart className="w-4 h-4 text-slate-400" />
              </button>

              {/* 13. Panier */}
              <button
                onClick={() => handleDrawerNavigate(() => setIsCartDrawerOpen(true))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950 flex items-center justify-between"
              >
                <span>13. Panier ({cartCount})</span>
                <ShoppingBag className="w-4 h-4 text-slate-400" />
              </button>

              {/* 14. Mon compte */}
              <button
                onClick={() => handleDrawerNavigate(() => setActiveModal(currentUser ? 'orders' : 'auth'))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950 flex items-center justify-between"
              >
                <span>14. Mon compte</span>
                <User className="w-4 h-4 text-slate-400" />
              </button>

              {/* 15. Service client */}
              <button
                onClick={() => handleDrawerNavigate(() => setActiveModal('contact'))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950 flex items-center justify-between"
              >
                <span>15. Service client</span>
                <HelpCircle className="w-4 h-4 text-slate-400" />
              </button>

              {/* 16. À propos de l’entreprise */}
              <button
                onClick={() => handleDrawerNavigate(() => setActiveModal('faq'))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950"
              >
                16. À propos de l’entreprise
              </button>

              {/* 17. Conditions générales */}
              <button
                onClick={() => handleDrawerNavigate(() => setActiveModal('faq'))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950"
              >
                17. Conditions générales
              </button>

              {/* 18. Politique de confidentialité */}
              <button
                onClick={() => handleDrawerNavigate(() => setActiveModal('faq'))}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-950"
              >
                18. Politique de confidentialité
              </button>

              {/* 19. Déconnexion si connecté */}
              {currentUser && (
                <button
                  onClick={() => handleDrawerNavigate(logout)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-between font-semibold"
                >
                  <span>19. Déconnexion</span>
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
              <p className="font-semibold text-slate-800">{storeSettings.phone}</p>
              <p className="mt-0.5">{storeSettings.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Prompt Section 3 Requirement: Accueil, Catégories, Recherche, Favoris, Panier) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around text-[10px] font-medium text-slate-600">
        <button 
          onClick={onNavigateHome}
          className="flex flex-col items-center gap-1 hover:text-slate-900 transition-colors"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <span className="text-base">🏠</span>
          </div>
          <span>Accueil</span>
        </button>

        <button 
          onClick={() => { setSelectedCategory(null); onNavigateCatalog(); }}
          className="flex flex-col items-center gap-1 hover:text-slate-900 transition-colors"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <span className="text-base">📁</span>
          </div>
          <span>Catégories</span>
        </button>

        <button 
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-1 hover:text-slate-900 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span>Recherche</span>
        </button>

        <button 
          onClick={() => setActiveModal('wishlist')}
          className="flex flex-col items-center gap-1 hover:text-slate-900 transition-colors relative"
        >
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center font-mono">
              {wishlist.length}
            </span>
          )}
          <span>Favoris</span>
        </button>

        <button 
          onClick={() => setIsCartDrawerOpen(true)}
          className="flex flex-col items-center gap-1 hover:text-slate-900 transition-colors relative"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center font-mono">
              {cartCount}
            </span>
          )}
          <span>Panier</span>
        </button>
      </nav>
    </>
  );
};
