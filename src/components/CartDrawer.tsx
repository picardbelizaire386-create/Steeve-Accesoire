import React, { useState } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Plus, 
  Minus, 
  Tag, 
  ShieldCheck,
  Truck
} from 'lucide-react';
import { INITIAL_SHIPPING_METHODS } from '../data/mockData';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartCount,
    formatPrice,
    promoCode,
    promoError,
    applyPromoCode,
    removePromoCode,
    discountAmount,
    estimatedTax,
    totalWithShipping,
    setActiveModal,
    storeSettings
  } = useCommerce();

  const [promoInput, setPromoInput] = useState('');

  if (!isCartDrawerOpen) return null;

  const standardShipping = INITIAL_SHIPPING_METHODS[0].priceUSD;
  const isFreeShippingEligible = cartSubtotal >= storeSettings.freeShippingThreshold;
  const effectiveShipping = isFreeShippingEligible ? 0 : standardShipping;
  const finalTotal = totalWithShipping(effectiveShipping);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const success = applyPromoCode(promoInput);
    if (success) {
      setPromoInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    setActiveModal('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartDrawerOpen(false)} 
      />

      {/* Drawer Body */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-50">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-900" />
            <h2 className="font-bold text-slate-900 text-base">
              Votre Panier ({cartCount})
            </h2>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label="Fermer le panier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 text-xs">
          {isFreeShippingEligible ? (
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Truck className="w-4 h-4" />
              <span>Félicitations ! Vous bénéficiez de la livraison offerte 🎉</span>
            </div>
          ) : (
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Livraison offerte dès {formatPrice(storeSettings.freeShippingThreshold)}</span>
                <span className="font-mono font-bold text-slate-800">
                  plus que {formatPrice(storeSettings.freeShippingThreshold - cartSubtotal)}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cartSubtotal / storeSettings.freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="flex gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Variante : <span className="font-semibold text-slate-700">{item.selectedVariant.label}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Supprimer"
                      aria-label="Supprimer cet article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Pricing & Quantity modifier */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-slate-200 rounded-md bg-slate-50 overflow-hidden">
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:text-slate-900 transition-colors"
                        aria-label="Diminuer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="px-2 py-0.5 text-xs font-mono font-bold text-slate-900">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                        className="px-2 py-1 text-slate-600 hover:text-slate-900 transition-colors"
                        aria-label="Augmenter"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono tabular-nums">
                        {formatPrice(item.priceAtAddition * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Votre panier est vide
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Parcourez nos nouveautés et ajoutez des articles à votre sélection.
              </p>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Découvrir la boutique
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            
            {/* Promo Code Input */}
            <div>
              {promoCode ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Code {promoCode.code} (-{formatPrice(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Code promo (ex: BIENVENUE10)"
                    className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Appliquer
                  </button>
                </form>
              )}
              {promoError && (
                <p className="text-[11px] text-rose-600 mt-1">{promoError}</p>
              )}
            </div>

            {/* Subtotal, Taxes, Shipping */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200/80">
              <div className="flex justify-between">
                <span>Sous-total articles :</span>
                <span className="font-mono font-medium text-slate-800">{formatPrice(cartSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Remise promotionnelle :</span>
                  <span className="font-mono">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimation livraison :</span>
                <span className="font-mono font-medium text-slate-800">
                  {effectiveShipping === 0 ? 'Offerte' : formatPrice(effectiveShipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes estimées ({Math.round(storeSettings.taxRate * 100)}%) :</span>
                <span className="font-mono font-medium text-slate-800">{formatPrice(estimatedTax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total estimé :</span>
                <span className="font-mono text-base">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>Passer la commande</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full py-2 text-center text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Continuer mes achats
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Commandes & livraisons réservées à la commune des Cayes (Sud d&apos;Haïti · +509)</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
