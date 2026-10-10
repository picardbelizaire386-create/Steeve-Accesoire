import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { useCommerce } from '../context/CommerceContext';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Star, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Plus,
  Minus,
  MessageSquare
} from 'lucide-react';
import { ProductCard } from './ProductCard';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ 
  product, 
  onBack,
  onSelectProduct,
}) => {
  const { 
    formatPrice, 
    addToCart, 
    isInWishlist, 
    toggleWishlist, 
    setIsCartDrawerOpen, 
    setActiveModal,
    products,
    getProductReviews,
    addReview,
    currentUser,
    showToast
  } = useCommerce();

  // Selected Gallery Image
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Variant Selection
  // Select first in-stock variant by default if possible
  const initialVariant = product.variants.find(v => v.stock > 0) || product.variants[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(initialVariant);
  const [quantity, setQuantity] = useState(1);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews' | 'delivery'>('description');

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const currentVariantStock = selectedVariant ? selectedVariant.stock : 0;
  const isSelectedVariantOutOfStock = currentVariantStock <= 0;
  const reviews = getProductReviews(product.id);

  // Similar products in same category
  const similarProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    // Reset quantity if it exceeds variant's stock
    if (quantity > variant.stock && variant.stock > 0) {
      setQuantity(variant.stock);
    } else if (quantity < 1 && variant.stock > 0) {
      setQuantity(1);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const nextQty = quantity + delta;
    if (nextQty >= 1 && nextQty <= currentVariantStock) {
      setQuantity(nextQty);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || isSelectedVariantOutOfStock) return;
    const success = addToCart(product, selectedVariant, quantity);
    if (success) {
      setIsCartDrawerOpen(true);
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariant || isSelectedVariantOutOfStock) return;
    const success = addToCart(product, selectedVariant, quantity);
    if (success) {
      setActiveModal('checkout');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url,
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        showToast('Lien du produit copié dans le presse-papier !', 'info');
      }
    } else {
      navigator.clipboard.writeText(url);
      showToast('Lien du produit copié dans le presse-papier !', 'info');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    addReview({
      productId: product.id,
      userName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Client NovaCommerce',
      userEmail: currentUser?.email,
      rating: newRating,
      comment: newComment.trim(),
      isVerifiedPurchase: true,
    });

    setNewComment('');
    setNewRating(5);
    setIsSubmittingReview(false);
  };

  const effectivePrice = product.price + (selectedVariant?.priceDelta || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-50">
      
      {/* Breadcrumb & Back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au catalogue</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Partager ce produit"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Partager</span>
          </button>
          
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
              isFavorited
                ? 'bg-rose-50 text-rose-600'
                : 'text-slate-600 hover:text-rose-600 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
            <span className="hidden sm:inline">{isFavorited ? 'Dans vos favoris' : 'Favoris'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery Left (60%), Contiguous Purchase Module Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Gallery Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Enlarged Image */}
          <div className="aspect-[4/3] w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            {product.discountPercent && product.discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-md font-mono">
                Économisez {product.discountPercent}%
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Highlights Strip below gallery */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Livraison rapide 24-48h</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Retours sous 14 jours</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Garantie authenticité</span>
            </div>
          </div>
        </div>

        {/* Purchase Module Column (Sticky on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Brand, Category & SKU */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider text-indigo-600">
                {product.brand}
              </span>
              <span className="font-mono text-slate-400">
                SKU: {product.sku}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating & Review Counter */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-slate-900 font-mono">
                {product.rating.toFixed(1)} / 5
              </span>
              <span className="text-slate-500">·</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-indigo-600 hover:underline"
              >
                {reviews.length} avis vérifiés
              </button>
            </div>

            {/* Price Block */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900 font-mono tabular-nums">
                  {formatPrice(effectivePrice)}
                </span>
                {product.originalPrice && (
                  <span className="ml-3 text-base text-slate-400 line-through font-mono tabular-nums">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                TVA & taxes incluses
              </span>
            </div>

            {/* Short Pitch */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* DYNAMIC VARIANT PICKER (Section 7: Tailles S-XXL, Pointures 38-45, Stocks réels) */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">
                  {product.type === 'apparel' && 'Sélectionnez votre taille :'}
                  {product.type === 'footwear' && 'Sélectionnez votre pointure :'}
                  {product.type === 'electronics' && 'Modèle / Option disponible :'}
                  {product.type === 'standard' && 'Variante :'}
                </span>

                {/* Stock Indicator for Selected Variant */}
                <span className="font-mono text-xs font-medium">
                  {isSelectedVariantOutOfStock ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Rupture de stock
                    </span>
                  ) : currentVariantStock <= product.lowStockThreshold ? (
                    <span className="text-amber-600 font-semibold">
                      Stock faible : {currentVariantStock} pièce(s) restante(s)
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">
                      En stock ({currentVariantStock} pièces)
                    </span>
                  )}
                </span>
              </div>

              {/* Variant Buttons Grid */}
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isAvailable = v.stock > 0;
                  const isSelected = selectedVariant?.id === v.id;

                  return (
                    <button
                      key={v.id}
                      onClick={() => handleVariantSelect(v)}
                      disabled={!isAvailable}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative flex flex-col items-center justify-center min-w-[54px] border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                          : isAvailable
                          ? 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                          : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through opacity-60'
                      }`}
                      aria-label={`${v.label} - ${isAvailable ? `${v.stock} en stock` : 'Épuisé'}`}
                    >
                      <span>{v.label}</span>
                      <span className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-slate-300' : isAvailable ? 'text-slate-400' : 'text-slate-300'}`}>
                        {isAvailable ? `${v.stock} dispo` : 'Épuisé'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Buy Actions */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-900">
                  Quantité :
                </span>

                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isSelectedVariantOutOfStock}
                    className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="px-4 py-1 text-sm font-bold font-mono text-slate-900">
                    {isSelectedVariantOutOfStock ? 0 : quantity}
                  </span>

                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= currentVariantStock || isSelectedVariantOutOfStock}
                    className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  (Max: {currentVariantStock})
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isSelectedVariantOutOfStock}
                  className="w-full py-3.5 px-4 bg-white border border-slate-900 hover:bg-slate-50 text-slate-900 font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ajouter au panier</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isSelectedVariantOutOfStock}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  <span>Acheter maintenant</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Tabs Section: Description, Spécifications, Avis, Livraison */}
      <div className="mt-14 pt-8 border-t border-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'description', label: 'Description détaillée' },
            { id: 'specs', label: 'Caractéristiques techniques' },
            { id: 'reviews', label: `Avis clients (${reviews.length})` },
            { id: 'delivery', label: 'Livraison & Retours' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {/* TAB 1: Description */}
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>{product.description}</p>
              <h4 className="font-bold text-slate-900 text-base pt-2">Points forts du produit :</h4>
              <ul className="space-y-2">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 2: Specifications */}
          {activeTab === 'specs' && (
            <div className="max-w-2xl bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs sm:text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, val], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="px-4 py-3 font-semibold text-slate-700 w-1/3 border-b border-slate-100">
                        {key}
                      </td>
                      <td className="px-4 py-3 text-slate-600 border-b border-slate-100">
                        {val}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700 w-1/3">
                      Référence fabricant (SKU)
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {product.sku}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              {/* Reviews Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-extrabold text-slate-900 font-mono">
                      {product.rating.toFixed(1)}
                    </span>
                    <div>
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Basé sur {reviews.length} avis certifiés
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">100% Avis d’acheteurs réels</span>. Les commentaires sont vérifiés par notre équipe logistique après validation de commande.
                </div>
              </div>

              {/* Leave a review form */}
              <form onSubmit={handleReviewSubmit} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Donner votre avis sur cet article</span>
                </h4>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700">Votre note :</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="comment" className="block text-xs font-medium text-slate-700 mb-1">
                    Votre commentaire :
                  </label>
                  <textarea
                    id="comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    placeholder="Partagez votre expérience avec le produit (taille, coupe, confort, autonomie...)"
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-600 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview || !newComment.trim()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  Publier mon avis
                </button>
              </form>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {rev.userName}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Achat vérifié
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {rev.date}
                      </span>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Delivery */}
          {activeTab === 'delivery' && (
            <div className="max-w-2xl space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Modalités d&apos;expédition</h4>
                <p>
                  Toutes les commandes validées avant 14h00 sont préparées et expédiées le jour même depuis notre hub logistique central.
                </p>
                <ul className="space-y-1 list-disc list-inside text-slate-600 pt-1">
                  <li><strong>Livraison standard :</strong> 3 à 5 jours ouvrés avec suivi en ligne.</li>
                  <li><strong>Livraison express :</strong> 24 à 48 heures pour les urgences.</li>
                  <li><strong>Retrait boutique :</strong> gratuit le jour même sous réserve d&apos;ouverture.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Politique de retour et échange</h4>
                <p>
                  Vous disposez d&apos;un délai légal de 14 jours calendaires à compter de la réception de votre colis pour essayer votre article et demander un échange ou un remboursement intégral.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {similarProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Produits similaires dans ce rayon
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {similarProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={(selected) => onSelectProduct(selected)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
