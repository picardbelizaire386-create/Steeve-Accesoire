import React, { useState, useEffect } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { 
  X, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  ChevronRight, 
  MapPin, 
  Calendar,
  Image as ImageIcon,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Order, OrderStatus, ShippingAddress } from '../types';

export const OrderHistoryModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    getUserOrders, 
    cancelOrder, 
    updateOrderAddress,
    formatPrice, 
    addToCart, 
    products, 
    setIsCartDrawerOpen,
    storeSettings
  } = useCommerce();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    email: '',
    country: 'Haïti',
    region: 'Sud',
    city: 'Les Cayes',
    addressLine: '',
    postalCode: '8110',
    instructions: '',
  });

  const [fullScreenProof, setFullScreenProof] = useState<string | null>(null);

  // Time remaining calculator for the 3-minute grace period
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (activeModal !== 'orders') return null;

  const orders = getUserOrders();

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'en_attente_paiement':
        return (
          <span className="text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            <span>En attente de validation</span>
          </span>
        );
      case 'en_cours_de_livraison':
      case 'en_preparation':
      case 'expediee':
        return (
          <span className="text-blue-800 bg-blue-100 border border-blue-300 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
            <Truck className="w-3 h-3 text-blue-600" />
            <span>En cours de livraison (24h)</span>
          </span>
        );
      case 'livree':
        return (
          <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Colis livré avec succès</span>
          </span>
        );
      case 'annulee':
        return <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-medium">Annulée</span>;
      case 'remboursee':
        return <span className="text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full text-xs font-medium">Remboursée</span>;
      default:
        return <span className="text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs font-medium">Traitement</span>;
    }
  };

  const getAddressRemainingSeconds = (order: Order): number => {
    if (!order.canEditAddressUntil) return 0;
    const target = new Date(order.canEditAddressUntil).getTime();
    return Math.max(0, Math.floor((target - now) / 1000));
  };

  const handleOpenEditAddress = (order: Order) => {
    setSelectedOrder(order);
    setAddressForm({ ...order.shippingAddress });
    setIsEditingAddress(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!addressForm.fullName.trim() || !addressForm.phone.trim() || !addressForm.addressLine.trim()) {
      alert('Veuillez remplir le nom, le téléphone et l\'adresse détaillée.');
      return;
    }
    const success = updateOrderAddress(selectedOrder.id, addressForm);
    if (success) {
      setSelectedOrder(prev => prev ? { ...prev, shippingAddress: addressForm } : null);
      setIsEditingAddress(false);
    }
  };

  const handleReorder = (order: Order) => {
    let readded = 0;
    order.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const variant = prod.variants.find(v => v.label === item.variantLabel || v.label.includes(item.variantLabel)) || prod.variants[0];
        if (variant && variant.stock > 0) {
          addToCart(prod, variant, item.quantity);
          readded++;
        }
      }
    });
    if (readded > 0) {
      setActiveModal(null);
      setIsCartDrawerOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Mes Commandes & Suivis de Livraison
              </h3>
              <p className="text-[11px] text-slate-500">
                Steeve Accessoire · Breffette, Cayes Sud (Livraison garantie sous 24h)
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {selectedOrder ? (
            /* DETAILED VIEW FOR SINGLE ORDER */
            <div className="space-y-6">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setIsEditingAddress(false);
                }}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                ← Retour à la liste de mes commandes
              </button>

              {/* Order Banner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500 font-mono">
                    Commande #{selectedOrder.orderNumber}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    Date : {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedOrder.status)}
                  <span className="font-mono font-bold text-slate-900 text-base">
                    {formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* ADDRESS CORRECTION ALERT (2 to 3 minutes policy) */}
              {selectedOrder.status === 'en_attente_paiement' && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-amber-900 text-xs sm:text-sm">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Correction d&apos;adresse express (Politique du site)</span>
                    </div>

                    {getAddressRemainingSeconds(selectedOrder) > 0 ? (
                      <span className="bg-amber-600 text-white font-mono font-extrabold text-xs px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                        Temps restant : {Math.floor(getAddressRemainingSeconds(selectedOrder) / 60)}:{(getAddressRemainingSeconds(selectedOrder) % 60).toString().padStart(2, '0')} min
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                        Délai écoulé
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-amber-800 leading-relaxed">
                    Selon la politique de confidentialité et de livraison, toute faute d&apos;adresse doit être corrigée dans les <strong>2 à 3 minutes</strong> avant que la commande ne passe &quot;En cours&quot;.
                  </p>

                  {getAddressRemainingSeconds(selectedOrder) > 0 && !isEditingAddress && (
                    <button
                      onClick={() => handleOpenEditAddress(selectedOrder)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Corriger mon adresse de livraison maintenant</span>
                    </button>
                  )}
                </div>
              )}

              {/* Inline Address Correction Form */}
              {isEditingAddress && (
                <form onSubmit={handleSaveAddress} className="p-4 bg-slate-50 border border-indigo-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-indigo-600" />
                      <span>Modifier mes coordonnées de livraison</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Annuler
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Nom complet *</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Téléphone de livraison *</label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-600 mb-1 font-medium">Adresse détaillée (Rue, repère précis) *</label>
                    <input
                      type="text"
                      value={addressForm.addressLine}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                      required
                    />
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-600 mb-1 font-medium">Instructions supplémentaires</label>
                    <input
                      type="text"
                      value={addressForm.instructions || ''}
                      onChange={(e) => setAddressForm({ ...addressForm, instructions: e.target.value })}
                      placeholder="Ex : Maison avec portail rouge en face de l'église"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Enregistrer la correction
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {/* Payment Proof Screenshot Preview */}
              {selectedOrder.paymentProofImageUrl && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Preuve de paiement MonCash / Natcash téléversée</span>
                    </div>
                    {selectedOrder.transactionReference && (
                      <span className="font-mono text-xs text-slate-500">
                        Réf: <strong>{selectedOrder.transactionReference}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <img
                      src={selectedOrder.paymentProofImageUrl}
                      alt="Capture de paiement"
                      onClick={() => setFullScreenProof(selectedOrder.paymentProofImageUrl || null)}
                      className="w-20 h-20 object-cover rounded-lg border border-slate-300 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                    />
                    <div className="text-xs space-y-1">
                      <p className="text-slate-700 font-medium">
                        Portefeuille : <span className="font-bold text-slate-900 uppercase">{selectedOrder.selectedMobileWallet || 'Mobile'}</span>
                      </p>
                      <button
                        onClick={() => setFullScreenProof(selectedOrder.paymentProofImageUrl || null)}
                        className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Agrandir la capture d&apos;écran</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking Timeline */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span>Suivi en direct du colis (Délai garanti 24h)</span>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <span className="text-xs text-slate-500 font-mono">
                      N° Suivi : <strong>{selectedOrder.trackingNumber}</strong>
                    </span>
                  )}
                </div>

                <div className="space-y-4 pl-2">
                  {selectedOrder.statusHistory.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-slate-900">
                          {step.note}
                        </div>
                        <div className="text-slate-400 font-mono mt-0.5">
                          {new Date(step.timestamp).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Livraison estimée : <strong>{selectedOrder.estimatedDeliveryDate}</strong> par {selectedOrder.carrierName || 'Steeve Express Cayes'}</span>
                </div>
              </div>

              {/* Shipping Address & Distance Details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Adresse de destination :</span>
                  </div>

                  {selectedOrder.shippingAddress.googleMapsUrl && (
                    <a
                      href={selectedOrder.shippingAddress.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Voir sur Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="space-y-0.5 text-slate-700">
                  <p><strong>Destinataire :</strong> {selectedOrder.shippingAddress.fullName}</p>
                  <p><strong>Adresse :</strong> {selectedOrder.shippingAddress.addressLine}, {selectedOrder.shippingAddress.city} ({selectedOrder.shippingAddress.country})</p>
                  <p><strong>Téléphone :</strong> {selectedOrder.shippingAddress.phone}</p>
                  {selectedOrder.distanceKm && (
                    <p className="text-indigo-700 font-medium pt-1">
                      📏 <strong>Distance :</strong> {selectedOrder.distanceKm} km parcourus depuis Breffette · Tarif : {selectedOrder.deliveryFeeRatePerKm || 200} G/km
                    </p>
                  )}
                </div>
              </div>

              {/* Items Purchased */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Articles commandés ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={item.productImage} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                        <div>
                          <div className="font-semibold text-slate-900">{item.productName}</div>
                          <div className="text-slate-500">{item.variantLabel} · Qté: {item.quantity}</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleReorder(selectedOrder)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Commander à nouveau</span>
                </button>

                {selectedOrder.status === 'en_attente_paiement' && (
                  <button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
                        cancelOrder(selectedOrder.id);
                        setSelectedOrder(null);
                      }
                    }}
                    className="px-4 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg"
                  >
                    Annuler la commande
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ORDERS LIST */
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            {order.orderNumber}
                          </span>
                          {order.paymentProofImageUrl && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                              Capture fournie
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Preview of items */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-md shrink-0">
                            <span className="truncate max-w-[150px] font-medium">{i.productName}</span>
                            <span className="text-slate-400">({i.variantLabel})</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0 ml-3"
                      >
                        <span>Détails & Suivi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Aucune commande pour le moment
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Vos achats apparaîtront ici dès que vous aurez finalisé votre première commande chez Steeve Accessoire.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Fullscreen Proof Modal */}
      {fullScreenProof && (
        <div 
          onClick={() => setFullScreenProof(null)} 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-white p-2">
            <button
              onClick={() => setFullScreenProof(null)}
              className="absolute top-3 right-3 bg-slate-900/80 text-white p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={fullScreenProof} alt="Capture plein écran" className="max-h-[85vh] object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
};
