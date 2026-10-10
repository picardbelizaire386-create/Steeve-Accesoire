import React, { useState } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { 
  X, 
  Check, 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Package, 
  Clock, 
  Printer,
  Upload,
  AlertCircle,
  Compass,
  ExternalLink,
  Info
} from 'lucide-react';
import { INITIAL_SHIPPING_METHODS } from '../data/mockData';
import { Order, PaymentMethodType, ShippingAddress, ShippingMethod } from '../types';
import { 
  validateHaitianPhone, 
  formatHaitianPhoneInput, 
  CAYES_COMMUNE_ZONES, 
  validateCayesEligibility,
  MAX_CAYES_COMMUNE_RADIUS_KM
} from '../utils/haitiValidation';

export const CheckoutModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    cart,
    cartSubtotal,
    discountAmount,
    promoCode,
    formatPrice,
    currency,
    currentUser,
    createOrder,
    storeSettings,
    calculateDistanceKm,
    calculateDeliveryFeeHTG
  } = useCommerce();

  // Steps: 1: Info, 2: Address, 3: Shipping, 4: Summary, 5: Payment, 6: Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State - Mandatory Full Name & Phone
  const [customerInfo, setCustomerInfo] = useState({
    fullName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '+509 ',
  });

  const [addressInfo, setAddressInfo] = useState<ShippingAddress>(() => {
    if (currentUser?.addresses && currentUser.addresses.length > 0) {
      return currentUser.addresses[0];
    }
    return {
      fullName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : '',
      phone: currentUser?.phone || '+509 ',
      email: currentUser?.email || '',
      country: 'Haïti',
      region: 'Sud',
      city: 'Les Cayes',
      addressLine: 'Breffette, Cayes Sud',
      postalCode: '8110',
      instructions: '',
      distanceKm: 1.5,
      isGpsLocated: false,
    };
  });

  // GPS Geolocation state
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Selected Mobile Wallet for Haiti
  const [selectedWallet, setSelectedWallet] = useState<'moncash' | 'natcash'>('moncash');
  const [paymentProofImage, setPaymentProofImage] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('moncash_natcash');

  // Card & Other Mock Forms
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '•••• •••• •••• 4242',
    cardHolder: customerInfo.fullName || 'Steeve Client',
    expiry: '12/28',
    cvv: '•••',
  });

  if (activeModal !== 'checkout') return null;

  // Delivery calculation: 200 HTG per km
  const currentDistanceKm = addressInfo.distanceKm || 1.5;
  const deliveryFeeHTG = calculateDeliveryFeeHTG(currentDistanceKm);
  // Convert delivery fee from HTG to current currency (USD rate approx 132.5 HTG = 1 USD)
  const deliveryFeeUSD = deliveryFeeHTG / 132.5;

  const isFreeShipping = cartSubtotal >= storeSettings.freeShippingThreshold;
  const effectiveShippingFeeUSD = isFreeShipping ? 0 : deliveryFeeUSD;

  // Dynamic Shipping Method
  const dynamicShippingMethod: ShippingMethod = {
    id: 'ship-kilometric-24h',
    name: `Livraison Express 24h (${currentDistanceKm} km parcourus)`,
    estimatedDelivery: storeSettings.deliveryHoursGuarantee || 'Sous 24h chrono',
    priceUSD: effectiveShippingFeeUSD,
    description: `Tarification officielle à ${storeSettings.deliveryRatePerKmHTG || 200} G/km depuis Breffette, Cayes Sud`,
  };

  const estimatedTax = (cartSubtotal - discountAmount) * storeSettings.taxRate;
  const totalAmount = Math.max(0, cartSubtotal - discountAmount) + estimatedTax + effectiveShippingFeeUSD;

  // Geolocation Handler: load customer GPS position from their phone
  const handleLoadPhoneGps = () => {
    setIsLocatingGps(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setGpsError("La géolocalisation n'est pas supportée par votre navigateur.");
      setIsLocatingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distKm = calculateDistanceKm(latitude, longitude);
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

        if (distKm > MAX_CAYES_COMMUNE_RADIUS_KM) {
          setGpsError(`Votre position GPS est à ${distKm.toFixed(1)} km de notre siège à Breffette (hors de la commune des Cayes). Les achats et livraisons sont exclusivement réservés à la commune des Cayes (Sud d'Haïti). Veuillez choisir votre quartier dans la liste ci-dessous.`);
        }

        setAddressInfo(prev => ({
          ...prev,
          city: 'Les Cayes',
          region: 'Sud',
          country: 'Haïti',
          latitude,
          longitude,
          distanceKm: distKm,
          isGpsLocated: true,
          googleMapsUrl: mapsUrl,
          addressLine: prev.addressLine || `Position GPS capturée (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        }));
        setIsLocatingGps(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setGpsError("Impossible d'accéder à votre position GPS automatique. Veuillez sélectionner votre quartier dans la commune des Cayes ci-dessous.");
        setIsLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Quick Area Distance Selector for Les Cayes commune
  const handleQuickAreaSelect = (areaName: string, approxKm: number) => {
    const lat = 18.2045 + (approxKm * 0.007);
    const lng = -73.7478 + (approxKm * 0.007);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat.toFixed(5)},${lng.toFixed(5)}`;
    
    setAddressInfo(prev => ({
      ...prev,
      country: 'Haïti',
      region: 'Sud',
      city: 'Les Cayes',
      addressLine: `${areaName}, Cayes Sud`,
      distanceKm: approxKm,
      isGpsLocated: true,
      latitude: lat,
      longitude: lng,
      googleMapsUrl: mapsUrl,
    }));
  };

  // Handle Payment Screenshot Upload
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('La capture d’écran est trop volumineuse (maximum 10 Mo).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPaymentProofImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!customerInfo.fullName.trim()) {
        alert('Le nom complet du client (prénom et nom de famille) est obligatoire.');
        return;
      }
      const phoneCheck = validateHaitianPhone(customerInfo.phone);
      if (!phoneCheck.isValid) {
        alert(phoneCheck.error || 'Seuls les numéros haïtiens avec l\'indicatif (+509) sont éligibles.');
        return;
      }
      setAddressInfo(prev => ({
        ...prev,
        fullName: customerInfo.fullName,
        email: customerInfo.email,
        phone: phoneCheck.formatted,
      }));
    } else if (currentStep === 2) {
      if (!addressInfo.addressLine.trim()) {
        alert('Veuillez renseigner votre adresse détaillée de livraison dans la commune des Cayes.');
        return;
      }
      const eligibility = validateCayesEligibility(addressInfo.city, addressInfo.addressLine, addressInfo.distanceKm);
      if (!eligibility.isEligible) {
        alert(eligibility.error || 'Les achats, commandes et livraisons sont exclusivement réservés aux résidents de la commune des Cayes (Sud d\'Haïti).');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleFinalizePayment = () => {
    // Check payment screenshot if MonCash / NatCash
    if (paymentMethod === 'moncash_natcash' && !paymentProofImage) {
      alert("Veuillez téléverser la capture d'écran claire de votre transaction de paiement MonCash ou Natcash.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const order = createOrder({
        items: cart,
        shippingAddress: addressInfo,
        shippingMethod: dynamicShippingMethod,
        paymentMethod,
        promoCodeApplied: promoCode?.code,
        paymentProofImageUrl: paymentProofImage,
        transactionReference: transactionRef,
        selectedMobileWallet: selectedWallet,
        distanceKm: currentDistanceKm,
        deliveryFeeRatePerKm: storeSettings.deliveryRatePerKmHTG || 200,
      });

      setIsProcessing(false);
      if (order) {
        setConfirmedOrder(order);
        setCurrentStep(6);
      }
    }, 1200);
  };

  const handleClose = () => {
    setActiveModal(null);
    setCurrentStep(1);
    setConfirmedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {currentStep === 6 ? 'Commande Enregistrée avec Succès' : 'Passerelle de Commande Sécurisée'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Steeve Accessoire · Breffette, Cayes Sud (Livraison 24h garantie)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicators (Steps 1 to 5) */}
        {currentStep < 6 && (
          <div className="bg-slate-100/80 px-4 sm:px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-500 overflow-x-auto shrink-0">
            {[
              { num: 1, label: 'Client' },
              { num: 2, label: 'Adresse & GPS' },
              { num: 3, label: 'Livraison 24h' },
              { num: 4, label: 'Récapitulatif' },
              { num: 5, label: 'Paiement' },
            ].map(step => (
              <div 
                key={step.num}
                className={`flex items-center gap-1.5 whitespace-nowrap ${
                  currentStep === step.num
                    ? 'text-indigo-600 font-bold'
                    : currentStep > step.num
                    ? 'text-emerald-700'
                    : 'text-slate-400'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  currentStep === step.num
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : currentStep > step.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > step.num ? '✓' : step.num}
                </span>
                <span>{step.label}</span>
                {step.num < 5 && <span className="text-slate-300 ml-1">→</span>}
              </div>
            ))}
          </div>
        )}

        {/* Step Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: Mandatory Customer Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Informations requises :</strong> Le nom complet ainsi que le numéro de téléphone valide du client sont obligatoires pour assurer la livraison sous 24h par notre équipe à Breffette / Cayes.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nom complet du client (Prénom & Nom) *
                </label>
                <input
                  type="text"
                  value={customerInfo.fullName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                  placeholder="Ex : Jean-Luc Pierre"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Numéro de téléphone mobile *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: formatHaitianPhoneInput(e.target.value) })}
                    placeholder="+509 5602 7710"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-mono font-medium"
                    required
                  />
                  <span className="text-[10px] text-indigo-700 font-medium mt-0.5 block">
                    Seuls les numéros avec le préfixe (+509) sont éligibles.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Adresse e-mail (facultatif)
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Pour recevoir le reçu numérique et le lien de suivi.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Address & Phone GPS Loading */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* GPS Phone Location Feature */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-sky-50/60 border border-indigo-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>Charger ma position depuis la carte / GPS de mon téléphone</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Précision Garantie
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Permet à l&apos;administrateur et au livreur de mesurer la distance exacte depuis notre magasin à <strong>Breffette, Cayes Sud</strong> et de ne pas s&apos;égarer lors de la livraison.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadPhoneGps}
                    disabled={isLocatingGps}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    <Compass className={`w-4 h-4 ${isLocatingGps ? 'animate-spin' : ''}`} />
                    <span>{isLocatingGps ? 'Recherche des coordonnées GPS...' : '📍 Activer ma localisation GPS'}</span>
                  </button>

                  {addressInfo.isGpsLocated && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                      ✓ Position capturée ({currentDistanceKm} km de Breffette)
                    </span>
                  )}
                </div>

                {gpsError && (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    {gpsError}
                  </div>
                )}

                {/* Quick zones selection if GPS not enabled */}
                <div className="pt-2 border-t border-indigo-100/80">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    Quartiers & Sections de la commune des Cayes (calcul kilométrique officiel à 200 G/km) :
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {CAYES_COMMUNE_ZONES.map(zone => (
                      <button
                        key={zone.name}
                        type="button"
                        onClick={() => handleQuickAreaSelect(zone.name, zone.approxKm)}
                        className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                          addressInfo.distanceKm === zone.approxKm
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                        }`}
                      >
                        {zone.name} ({zone.approxKm} km)
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Distance & Delivery Fee Calculation Badge */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Distance mesurée :</span>
                  <span className="font-bold font-mono text-slate-900 ml-1.5 text-sm">{currentDistanceKm} km</span>
                  <span className="text-slate-400 ml-1.5">· Tarif : 200 G/km</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Frais calculés :</span>
                  <span className="font-extrabold font-mono text-indigo-600 ml-1.5 text-sm">
                    {deliveryFeeHTG} HTG
                  </span>
                </div>
              </div>

              {/* Address Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Commune éligible * (Réservé aux Cayes)
                  </label>
                  <input
                    type="text"
                    value="Les Cayes (Sud, Haïti)"
                    readOnly
                    className="w-full text-xs p-2.5 bg-slate-100 text-slate-900 font-bold border border-slate-300 rounded-lg outline-none cursor-not-allowed"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                    ✓ Zone officielle de commande & livraison
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code Postal (Haïti)</label>
                  <input
                    type="text"
                    value={addressInfo.postalCode || '8110'}
                    onChange={(e) => setAddressInfo({ ...addressInfo, postalCode: e.target.value })}
                    placeholder="8110"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse détaillée (Rue, repère, couleur de maison/portail) *
                </label>
                <input
                  type="text"
                  value={addressInfo.addressLine}
                  onChange={(e) => setAddressInfo({ ...addressInfo, addressLine: e.target.value })}
                  placeholder="Ex : Breffette, en face de l'école nationale, portail bleu"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions complémentaires pour le coursier
                </label>
                <input
                  type="text"
                  value={addressInfo.instructions || ''}
                  onChange={(e) => setAddressInfo({ ...addressInfo, instructions: e.target.value })}
                  placeholder="Ex : Appeler 10 minutes avant d'arriver"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>

              {/* Policy Notice: 2 to 3 minutes grace period */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Politique du site :</strong> Vous disposerez d&apos;un délai de <strong>2 à 3 minutes</strong> après validation de votre commande pour corriger toute éventuelle faute d&apos;adresse dans votre suivi, avant que la livraison ne passe au statut &quot;En cours&quot;.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Shipping Method & 24h Guarantee */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Étape 3 : Mode d&apos;expédition et délai 24h</span>
              </h4>

              <div className="p-4 rounded-xl border border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {dynamicShippingMethod.name}
                      </div>
                      <div className="text-xs text-slate-600">
                        Délai garanti : <strong className="text-emerald-700">{storeSettings.deliveryHoursGuarantee || '24h'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="font-mono font-extrabold text-sm text-slate-900 text-right">
                    {deliveryFeeHTG} HTG
                    <div className="text-[10px] text-slate-500 font-sans font-normal">
                      ({formatPrice(effectiveShippingFeeUSD)})
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 pt-2 border-t border-indigo-100">
                  {dynamicShippingMethod.description}. Votre colis sera expédié directement depuis notre boutique à Breffette avec traçabilité complète.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>📍 <strong>Origine :</strong> {storeSettings.companyName} — {storeSettings.address}, {storeSettings.city} ({storeSettings.postalCode || '8110'})</p>
                <p>📍 <strong>Destination :</strong> {addressInfo.addressLine}, {addressInfo.city}</p>
                <p>📞 <strong>Téléphone du destinataire :</strong> {addressInfo.phone}</p>
              </div>
            </div>
          )}

          {/* STEP 4: Order Summary */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                <span>Étape 4 : Récapitulatif de votre commande</span>
              </h4>

              {/* Items List */}
              <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <img src={item.product.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <span className="font-medium text-slate-900">{item.product.name}</span>
                        <div className="text-[11px] text-slate-500">
                          {item.selectedVariant.label} × {item.quantity}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-semibold">
                      {formatPrice(item.priceAtAddition * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Destination & Delivery Method review */}
              <div className="p-3 bg-slate-100/70 rounded-xl text-xs space-y-1">
                <p><strong>Destinataire :</strong> {addressInfo.fullName} ({addressInfo.phone})</p>
                <p><strong>Adresse de livraison :</strong> {addressInfo.addressLine}, {addressInfo.city}</p>
                <p><strong>Distance calculée :</strong> {currentDistanceKm} km · <strong>Délai :</strong> 24h</p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Sous-total articles :</span>
                  <span className="font-mono">{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Remise ({promoCode?.code}) :</span>
                    <span className="font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frais de livraison ({currentDistanceKm} km à 200 G/km) :</span>
                  <span className="font-mono">{deliveryFeeHTG} HTG ({formatPrice(effectiveShippingFeeUSD)})</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes ({Math.round(storeSettings.taxRate * 100)}%) :</span>
                  <span className="font-mono">{formatPrice(estimatedTax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-extrabold text-slate-900">
                  <span>Total à payer :</span>
                  <span className="font-mono text-indigo-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Payment - MonCash / NatCash with Screenshot Upload */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Étape 5 : Paiement sécurisé MonCash / Natcash ou Carte</span>
              </h4>

              {/* Payment selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'moncash_natcash', label: 'MonCash & Natcash', icon: Smartphone, highlight: true },
                  { id: 'carte_bancaire', label: 'Carte Bancaire', icon: CreditCard },
                  { id: 'paiement_livraison', label: 'À la Livraison', icon: Truck },
                ].map(opt => {
                  const Icon = opt.icon;
                  const isSelected = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id as PaymentMethodType)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-600 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-center">{opt.label}</span>
                      {opt.highlight && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded-full">
                          Recommandé Haïti
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* MonCash & NatCash Transfer Details */}
              {paymentMethod === 'moncash_natcash' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  {/* Wallet choice */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedWallet('moncash')}
                      className={`flex-1 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedWallet === 'moncash'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      MonCash Digicel
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWallet('natcash')}
                      className={`flex-1 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedWallet === 'natcash'
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Natcash Natcom
                    </button>
                  </div>

                  {/* Account Coordinates */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Compte administrateur {selectedWallet === 'natcash' ? 'Natcash' : 'MonCash'} :</span>
                      <span className="font-mono text-sm px-2 py-0.5 bg-slate-100 rounded font-extrabold text-slate-900">
                        {selectedWallet === 'natcash' 
                          ? (storeSettings.natcashNumber || '+509 4005 4375')
                          : (storeSettings.moncashNumber || '+509 5602 7710')}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <strong>Titulaire :</strong> {selectedWallet === 'natcash' 
                        ? (storeSettings.natcashAccountName || 'STEEVE ACCESSOIRE (Admin)') 
                        : (storeSettings.moncashAccountName || 'STEEVE ACCESSOIRE (Admin)')}
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      {selectedWallet === 'natcash' ? storeSettings.natcashInstructions : storeSettings.moncashInstructions}
                    </p>
                  </div>

                  {/* Upload Screenshot Proof */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-900">
                      Capture d&apos;écran claire du transfert de paiement (Obligatoire) *
                    </label>
                    
                    <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center bg-white transition-colors">
                      {paymentProofImage ? (
                        <div className="space-y-3">
                          <img
                            src={paymentProofImage}
                            alt="Preuve de transaction"
                            className="max-h-48 mx-auto rounded-lg border border-slate-200 shadow-sm object-contain"
                          />
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-semibold text-emerald-700">✓ Capture prête pour vérification</span>
                            <label className="text-xs text-indigo-600 underline cursor-pointer font-medium">
                              Changer la photo
                              <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block space-y-2">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                          <div className="text-xs font-bold text-slate-700">
                            Cliquez pour téléverser votre capture d&apos;écran
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Prenez une capture de la notification MonCash ou Natcash reçue sur votre téléphone (PNG, JPG jusqu&apos;à 10 Mo)
                          </p>
                          <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Optional Transaction ID */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Numéro de référence ou ID de transaction (facultatif)
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Ex : TXN-9481230 ou ID MonCash"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg font-mono outline-none focus:border-indigo-600"
                    />
                  </div>

                  {/* Workflow Explanation Banner */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Processus de vérification par l&apos;administrateur :</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      1. Votre commande sera enregistrée avec le statut <strong>&quot;En attente&quot;</strong>.<br />
                      2. Après vérification de votre capture d&apos;écran par l&apos;administrateur, le statut passera à <strong>&quot;En cours&quot;</strong>.<br />
                      3. Après livraison à votre adresse (délai 24h), l&apos;administrateur validera que la livraison a été faite.
                    </p>
                  </div>
                </div>
              )}

              {/* Card option details */}
              {paymentMethod === 'carte_bancaire' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="text-xs font-semibold text-slate-800">
                    Paiement sécurisé par Carte (Visa, Mastercard)
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Numéro de carte</label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Date expiration</label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Code CVC</label>
                      <input
                        type="password"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cash on delivery */}
              {paymentMethod === 'paiement_livraison' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
                  <div className="font-semibold text-slate-800">
                    Paiement en espèces à la livraison
                  </div>
                  <p>
                    Vous réglez le montant exact de <strong>{formatPrice(totalAmount)}</strong> directement au livreur lors de la remise de votre colis à Breffette / Cayes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Confirmation Screen with Status & 3-min countdown notice */}
          {currentStep === 6 && confirmedOrder && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Merci pour votre commande !
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Votre commande a bien été enregistrée chez Steeve Accessoire (Breffette, Cayes Sud).
                </p>
              </div>

              {/* Order Info Card */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-slate-500">Numéro de commande :</span>
                    <div className="font-bold text-slate-900 font-mono text-sm">{confirmedOrder.orderNumber}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Statut initial :</span>
                    <div className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-xs">
                      En attente de vérification
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500">Délai garanti de livraison :</span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sous 24h ouvrées</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Distance & Trajet :</span>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">
                      {confirmedOrder.distanceKm || currentDistanceKm} km ({deliveryFeeHTG} HTG)
                    </div>
                  </div>
                </div>

                {/* 3-Minute Address Typo Correction Notice */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Délai de correction d&apos;adresse (3 minutes)</span>
                  </div>
                  <p className="text-[11px] mt-0.5">
                    Conformément à notre politique de confidentialité et de livraison, vous pouvez corriger une faute d&apos;adresse dans les <strong>2 à 3 minutes</strong> directement dans votre espace &quot;Mes Commandes&quot; avant que l&apos;administrateur ne passe la commande à &quot;En cours&quot;.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 text-slate-600">
                  <span>Livraison à : </span>
                  <span className="font-medium text-slate-800">
                    {confirmedOrder.shippingAddress.addressLine}, {confirmedOrder.shippingAddress.city} ({confirmedOrder.shippingAddress.phone})
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    handleClose();
                    setActiveModal('orders');
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Package className="w-4 h-4" />
                  <span>Suivre ma commande en direct & corriger l&apos;adresse</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le reçu</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Steps 1 to 5) */}
        {currentStep < 6 && (
          <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            {currentStep > 1 ? (
              <button
                onClick={handlePrevStep}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Précédent</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                onClick={handleNextStep}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Étape suivante</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinalizePayment}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Enregistrement sécurisé...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirmer ma commande & envoyer la preuve</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
