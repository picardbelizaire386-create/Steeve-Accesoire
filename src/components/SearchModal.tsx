import React, { useState, useEffect, useRef } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { 
  Search, 
  X, 
  Clock, 
  ArrowRight, 
  ShoppingBag, 
  Star, 
  Trash2, 
  Sparkles,
  Tag
} from 'lucide-react';
import { CATEGORIES_LIST } from '../data/mockData';

export const SearchModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    products, 
    formatPrice, 
    searchHistory, 
    addSearchHistory, 
    clearSearchHistory,
    navigateToProduct,
    navigateToCatalogWithSearch,
    globalSearchQuery
  } = useCommerce();

  const [query, setQuery] = useState(globalSearchQuery || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeModal === 'search') {
      setQuery(globalSearchQuery || '');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [activeModal, globalSearchQuery]);

  if (activeModal !== 'search') return null;

  // Real-time matching products
  const trimmed = query.trim().toLowerCase();
  const searchResults = trimmed.length > 0 
    ? products.filter(p => 
        p.name.toLowerCase().includes(trimmed) ||
        p.brand.toLowerCase().includes(trimmed) ||
        p.category.toLowerCase().includes(trimmed) ||
        p.sku.toLowerCase().includes(trimmed) ||
        p.description.toLowerCase().includes(trimmed) ||
        p.variants.some(v => v.label.toLowerCase().includes(trimmed))
      ).slice(0, 8)
    : [];

  const handleExecuteSearch = (searchVal: string) => {
    if (!searchVal.trim()) return;
    setActiveModal(null);
    navigateToCatalogWithSearch(searchVal.trim());
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(query);
  };

  const handleSelectProduct = (prodId: string) => {
    if (query.trim()) {
      addSearchHistory(query.trim());
    }
    setActiveModal(null);
    navigateToProduct(prodId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 animate-in fade-in-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh] animate-in zoom-in-95">
        
        {/* Search Header Bar */}
        <form onSubmit={handleFormSubmit} className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3 relative">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher vêtements, chaussures, téléphones, écouteurs, SKU..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              aria-label="Effacer le texte"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Rechercher
          </button>
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors ml-1"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* 1. Live Instant Results */}
          {query.trim().length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>Résultats instantanés ({searchResults.length})</span>
                {searchResults.length > 0 && (
                  <button
                    onClick={() => handleExecuteSearch(query)}
                    className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Voir tout dans le catalogue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {searchResults.map((product) => {
                    const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                    const isOutOfStock = totalStock <= 0;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectProduct(product.id)}
                        className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            onError={(e) => { e.currentTarget.src = '/src/assets/images/hero_commerce_lifestyle_1791556272110.jpg'; }}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 sm:text-sm">
                              {product.name}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {product.brand} · SKU: <span className="font-mono">{product.sku}</span>
                            </div>
                            <div className="text-[10px] mt-0.5">
                              {isOutOfStock ? (
                                <span className="text-rose-600 font-semibold">Épuisé</span>
                              ) : (
                                <span className="text-emerald-600 font-medium">En stock ({totalStock} pièces)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {formatPrice(product.price)}
                          </span>
                          {product.discountPercent && product.discountPercent > 0 && (
                            <div className="text-[10px] text-rose-600 font-bold font-mono">
                              -{product.discountPercent}%
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-slate-600 font-medium">
                    Aucun article ne correspond à « {query} »
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Vérifiez l&apos;orthographe ou essayez un mot plus général (ex : veste, sneakers, iphone, casque).
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* 2. When query is empty: show Recent searches and Popular Category shortcuts */
            <div className="space-y-6">
              {/* Recent searches */}
              {searchHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Recherches récentes</span>
                    </span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-slate-400 hover:text-rose-600 flex items-center gap-1 hover:underline"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Effacer</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExecuteSearch(item)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <span>{item}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Categories */}
              <div className="space-y-2">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Explorer par rayon</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES_LIST.slice(0, 6).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveModal(null);
                        navigateToCatalogWithSearch('', cat.id);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-left transition-all flex items-center gap-2 group"
                    >
                      <img
                        src={cat.image}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 block truncate">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {cat.itemCount} articles
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestions keywords */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                <span className="font-semibold text-indigo-900 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Recherches populaires du moment :</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Sneakers cuir', 'Veste overshirt', 'Casque audio Hi-Fi', 'Pointure 42', 'Câble USB-C', 'Taille M', 'NovaPhone'].map((kw, i) => (
                    <button
                      key={i}
                      onClick={() => handleExecuteSearch(kw)}
                      className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-600 hover:text-white rounded-md text-[11px] font-medium transition-colors"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
