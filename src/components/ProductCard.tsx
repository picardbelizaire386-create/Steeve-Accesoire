import React from 'react';
import { Product } from '../types';
import { useCommerce } from '../context/CommerceContext';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { formatPrice, isInWishlist, toggleWishlist, addToCart } = useCommerce();

  const isFavorited = isInWishlist(product.id);
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock <= product.lowStockThreshold;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pick first available variant
    const availableVariant = product.variants.find(v => v.stock > 0);
    if (availableVariant) {
      addToCart(product, availableVariant, 1);
    } else {
      onSelect(product);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Visual Container (Lead with Imagery 65%-70% of card) */}
      <div className="aspect-[4/3] w-full bg-slate-100/80 relative overflow-hidden">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
            <ShoppingBag className="w-8 h-8 text-slate-300 mb-1" />
            <span className="text-[11px] font-medium text-slate-400">Photo bientôt disponible</span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isFavorited
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-600'
          }`}
          aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Discount Tag (Max 1 subtle tag per rules) */}
        {product.discountPercent && product.discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded font-mono">
            -{product.discountPercent}%
          </div>
        )}

        {/* Quick View Overlay on Desktop Hover */}
        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex-1 py-2 bg-white/95 hover:bg-white text-slate-900 text-xs font-semibold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Voir le produit</span>
          </button>
          {!isOutOfStock && (
            <button
              onClick={handleQuickAdd}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-md transition-colors"
              title="Ajout rapide au panier"
              aria-label="Ajout rapide au panier"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Stock Status Text (Zero-Pill discipline: unboxed text with dot) */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium uppercase tracking-wider text-[11px]">
              {product.brand}
            </span>
            {isOutOfStock ? (
              <span className="text-rose-600 font-semibold text-[11px]">Épuisé</span>
            ) : isLowStock ? (
              <span className="text-amber-600 font-medium text-[11px] font-mono">
                {totalStock} restants
              </span>
            ) : (
              <span className="text-emerald-600 text-[11px]">En stock</span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="font-semibold text-slate-800 font-mono">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-slate-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Pricing Area */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {product.sku}
          </span>
        </div>
      </div>
    </div>
  );
};
