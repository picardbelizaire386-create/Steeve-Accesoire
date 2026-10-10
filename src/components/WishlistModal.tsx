import React from 'react';
import { useCommerce } from '../context/CommerceContext';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  onSelectProduct: (p: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({ onSelectProduct }) => {
  const { 
    activeModal, 
    setActiveModal, 
    wishlist, 
    toggleWishlist, 
    products, 
    formatPrice, 
    addToCart,
    setIsCartDrawerOpen
  } = useCommerce();

  if (activeModal !== 'wishlist') return null;

  const favoritedProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddToCart = (product: Product) => {
    const availableVariant = product.variants.find(v => v.stock > 0);
    if (availableVariant) {
      addToCart(product, availableVariant, 1);
      setActiveModal(null);
      setIsCartDrawerOpen(true);
    } else {
      setActiveModal(null);
      onSelectProduct(product);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Mes Articles Favoris ({favoritedProducts.length})
            </h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {favoritedProducts.length > 0 ? (
            favoritedProducts.map((p) => {
              const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
              const isOutOfStock = totalStock <= 0;

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                >
                  <div 
                    onClick={() => {
                      setActiveModal(null);
                      onSelectProduct(p);
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <img src={p.images[0]} alt="" className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {p.brand} · {formatPrice(p.price)}
                      </p>
                      <span className={`text-[10px] font-medium ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isOutOfStock ? 'Rupture de stock' : `En stock (${totalStock} pièces)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={isOutOfStock}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ajouter au panier</span>
                    </button>

                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Retirer des favoris"
                      aria-label="Retirer des favoris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Aucun article dans vos favoris
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Cliquez sur le petit cœur présent sur les fiches produits pour les retrouver rapidement ici.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
