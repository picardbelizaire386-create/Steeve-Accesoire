import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { useCommerce } from '../context/CommerceContext';
import { ProductCard } from './ProductCard';
import { CATEGORIES_LIST } from '../data/mockData';
import { 
  Filter, 
  X, 
  Search, 
  SlidersHorizontal, 
  Check, 
  ArrowUpDown,
  RotateCcw,
  ShoppingBag,
  Plus
} from 'lucide-react';

interface CatalogPageProps {
  initialCategory?: ProductCategory | null;
  onSelectProduct: (p: Product) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ 
  initialCategory, 
  onSelectProduct 
}) => {
  const { 
    products, 
    selectedCategory, 
    setSelectedCategory, 
    formatPrice,
    globalSearchQuery,
    setGlobalSearchQuery,
    setActiveModal,
    storeSettings
  } = useCommerce();

  // Active Category state
  const currentCategory = selectedCategory || initialCategory || 'all';

  // Categories list synchronized with Admin customizations
  const activeCategories = (storeSettings.customCategories && storeSettings.customCategories.length > 0)
    ? storeSettings.customCategories
    : CATEGORIES_LIST;

  // Filters State synchronized with globalSearchQuery
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');

  useEffect(() => {
    setSearchQuery(globalSearchQuery || '');
  }, [globalSearchQuery]);
  const [sortBy, setSortBy] = useState<'pertinence' | 'prix-asc' | 'prix-desc' | 'nouveautes' | 'ventes' | 'notes'>('pertinence');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Available brands in the current product list
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => brands.add(p.brand));
    return Array.from(brands);
  }, [products]);

  // Common sizes & shoe sizes
  const commonSizes = ['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45'];

  // Category Info
  const categoryInfo = activeCategories.find(c => c.id === currentCategory);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Category filter
      if (currentCategory !== 'all' && p.category !== currentCategory) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesSku && !matchesDesc) {
          return false;
        }
      }

      // 3. In stock filter
      const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
      if (onlyInStock && totalStock <= 0) {
        return false;
      }

      // 4. Deals only
      if (onlyDeals && (!p.discountPercent || p.discountPercent <= 0)) {
        return false;
      }

      // 5. Brands filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
        return false;
      }

      // 6. Sizes filter
      if (selectedSizes.length > 0) {
        const hasMatchingSize = p.variants.some(v => 
          selectedSizes.includes(v.label) && v.stock > 0
        );
        if (!hasMatchingSize) return false;
      }

      // 7. Min rating
      if (minRating > 0 && p.rating < minRating) {
        return false;
      }

      // 8. Max price
      if (p.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'prix-asc') return a.price - b.price;
      if (sortBy === 'prix-desc') return b.price - a.price;
      if (sortBy === 'notes') return b.rating - a.rating;
      if (sortBy === 'nouveautes') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      if (sortBy === 'ventes') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      return 0; // pertinence default
    });
  }, [
    products, 
    currentCategory, 
    searchQuery, 
    onlyInStock, 
    onlyDeals, 
    selectedBrands, 
    selectedSizes, 
    minRating, 
    maxPrice, 
    sortBy
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setGlobalSearchQuery('');
    setSortBy('pertinence');
    setOnlyInStock(false);
    setOnlyDeals(false);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setMinRating(0);
    setMaxPrice(1000);
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    onlyInStock || 
    onlyDeals || 
    selectedBrands.length > 0 || 
    selectedSizes.length > 0 || 
    minRating > 0 || 
    maxPrice < 1000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-50">
      
      {/* Category Header */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>Boutique</span>
              <span>/</span>
              <span>{categoryInfo ? categoryInfo.name : 'Tous les articles'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {categoryInfo ? categoryInfo.name : 'Catalogue Complet'}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              {categoryInfo 
                ? categoryInfo.description 
                : 'Parcourez l’ensemble de nos collections avec stocks en temps réel et expédition rapide.'}
            </p>
          </div>

          <div className="text-xs text-slate-600 font-mono">
            <strong>{filteredProducts.length}</strong> produit(s) disponible(s)
          </div>
        </div>

        {/* Quick Category Chips bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              currentCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Tous les rayons
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as ProductCategory)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Filters Sidebar (Desktop) + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS SIDEBAR (DESKTOP) */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>Filtres de recherche</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>

            {/* In-category search bar */}
            <div>
              <label htmlFor="search-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                Rechercher dans ce rayon
              </label>
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setGlobalSearchQuery(e.target.value);
                  }}
                  placeholder="Mot-clé, modèle..."
                  className="w-full text-xs p-2.5 pl-8 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setGlobalSearchQuery('');
                    }} 
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Checkboxes (Stock, Promotions) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Uniquement articles en stock</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyDeals}
                  onChange={(e) => setOnlyDeals(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Promotions & réductions</span>
              </label>
            </div>

            {/* Price Range Slider */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Prix maximum :</span>
                <span className="font-mono font-bold text-slate-900">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-slate-900"
              />
            </div>

            {/* Size & Footwear Filter */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs font-semibold text-slate-800 block">
                Tailles & Pointures :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {commonSizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSizes(prev => 
                          isSelected ? prev.filter(s => s !== size) : [...prev, size]
                        );
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs font-semibold text-slate-800 block">
                Marques :
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {availableBrands.map((b) => (
                  <label key={b} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => {
                        setSelectedBrands(prev => 
                          prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
                        );
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs font-semibold text-slate-800 block">
                Note minimum :
              </span>
              <div className="flex items-center gap-2">
                {[0, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors border ${
                      minRating === r
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {r === 0 ? 'Toutes' : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* PRODUCTS AREA (3 Columns on Desktop) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Sort & Filter Trigger Bar */}
          <div className="flex items-center justify-between gap-4 p-3 bg-white border border-slate-200 rounded-xl">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrer</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 ml-auto text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 hidden sm:inline">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="pertinence">Pertinence</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
                <option value="notes">Meilleures notes</option>
                <option value="ventes">Meilleures ventes</option>
                <option value="nouveautes">Nouveautés</option>
              </select>
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Filtres actifs :</span>
              {searchQuery && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md flex items-center gap-1 font-mono">
                  &quot;{searchQuery}&quot;
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-rose-600" 
                    onClick={() => {
                      setSearchQuery('');
                      setGlobalSearchQuery('');
                    }} 
                  />
                </span>
              )}
              {onlyInStock && (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md flex items-center gap-1">
                  En stock
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setOnlyInStock(false)} />
                </span>
              )}
              {onlyDeals && (
                <span className="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-md flex items-center gap-1">
                  Promotions
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setOnlyDeals(false)} />
                </span>
              )}
              {selectedBrands.map(b => (
                <span key={b} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md flex items-center gap-1">
                  {b}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBrands(prev => prev.filter(x => x !== b))} />
                </span>
              ))}
              {selectedSizes.map(s => (
                <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md flex items-center gap-1 font-mono">
                  Taille {s}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSizes(prev => prev.filter(x => x !== s))} />
                </span>
              ))}
              <button
                onClick={resetFilters}
                className="text-xs text-indigo-600 hover:underline font-semibold ml-2"
              >
                Tout effacer
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {products.length === 0 ? 'Le catalogue est actuellement vide' : 'Aucun produit ne correspond à vos critères'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {products.length === 0
                  ? 'Les anciens produits d’exemple ont été supprimés selon vos souhaits. Rendez-vous dans le panneau d’administration pour ajouter vos photos, prix en gourdes (HTG), tailles et stocks.'
                  : 'Essayez d’élargir vos filtres ou de modifier votre terme de recherche.'}
              </p>
              {products.length === 0 ? (
                <button
                  onClick={() => setActiveModal('admin')}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un produit (Espace Admin)</span>
                </button>
              ) : (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-base">Filtres</span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* In stock */}
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Uniquement articles en stock</span>
              </label>

              {/* Price range */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Prix max :</span>
                  <span className="font-bold font-mono">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-slate-900"
                />
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <span className="text-xs font-semibold block">Tailles & Pointures</span>
                <div className="flex flex-wrap gap-1.5">
                  {commonSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSelectedSizes(prev => 
                          prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                        );
                      }}
                      className={`px-2 py-1 text-xs rounded border font-mono ${
                        selectedSizes.includes(s) ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex gap-2">
              <button
                onClick={resetFilters}
                className="w-1/2 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Effacer
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
