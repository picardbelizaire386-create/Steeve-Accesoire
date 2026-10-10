import React, { useState } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { 
  X, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  ChevronDown, 
  CheckCircle2 
} from 'lucide-react';

export const ContactAndFAQModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    storeSettings, 
    currentUser, 
    tickets, 
    createTicket, 
    replyToTicket,
    showToast 
  } = useCommerce();

  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets' | 'policy'>(
    activeModal === 'contact' ? 'contact' : 'faq'
  );

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact / Ticket Form
  const [contactSubject, setContactSubject] = useState('');
  const [contactCategory, setContactCategory] = useState<'commande' | 'livraison' | 'paiement' | 'retour' | 'autre'>('commande');
  const [contactMessage, setContactMessage] = useState('');
  const [ticketReplyMessage, setTicketReplyMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  if (activeModal !== 'contact' && activeModal !== 'faq') return null;

  const faqs = [
    {
      q: 'Comment s’effectue le paiement par MonCash ou Natcash ?',
      a: 'Le client effectue le transfert direct vers le numéro MonCash ou Natcash officiel de l’administrateur (+509 56027710 / +509 40054375). Lors de la commande, le client téléverse une capture d’écran claire de la transaction. Après vérification par l’administrateur, le statut de la commande passe de "En attente" à "En cours de livraison". Après la remise du colis, l’administrateur valide que la livraison a bien été effectuée (statut "Livrée").',
    },
    {
      q: 'Quel est le prix de la livraison et comment est-il mesuré ?',
      a: 'Le prix de la livraison est de 200 Gourdes pour chaque kilomètre parcouru (200 HTG/km). L’adresse est chargée depuis la carte téléphonique / GPS du client afin de mesurer avec exactitude la distance depuis notre boutique de Breffette, Cayes Sud, et permettre au livreur de ne jamais s’égarer.',
    },
    {
      q: 'Quel est le délai de livraison ?',
      a: 'Le délai de livraison est garanti sous 24 heures (24h chrono) pour toute commande validée.',
    },
    {
      q: 'Que dit la politique de confidentialité concernant les erreurs d’adresse ?',
      a: 'Selon notre politique de confidentialité et de livraison, toute faute de frappe ou erreur d’adresse doit impérativement être corrigée dans un délai de 2 à 3 minutes après validation, tant que la commande est "En attente" et avant que la livraison ne soit "En cours". Vous pouvez la corriger directement en un clic dans la section "Mes Commandes".',
    },
    {
      q: 'Quelles sont les informations obligatoires pour commander ?',
      a: 'Le nom complet du client ainsi que son numéro de téléphone valide sont strictement exigés pour assurer la remise du colis en main propre. Vous pouvez également vous connecter ou vous inscrire en un clic via l’authentification Google.',
    },
    {
      q: 'Quelles sont les coordonnées officielles de Steeve Accessoire ?',
      a: 'Adresse physique : Breffette, Cayes Sud, Haïti (Code postal 8110). Téléphones officiels : +509 56027710 / +509 40054375.',
    },
  ];

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) return;

    createTicket({
      userId: currentUser?.id || 'guest',
      userName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Client Visiteur',
      userEmail: currentUser?.email || 'contact@client.com',
      subject: contactSubject,
      category: contactCategory,
      message: contactMessage,
    });

    setContactSubject('');
    setContactMessage('');
    setActiveTab('tickets');
  };

  const handleReplyTicket = (ticketId: string) => {
    if (!ticketReplyMessage.trim()) return;
    replyToTicket(ticketId, ticketReplyMessage.trim(), currentUser?.role === 'admin');
    setTicketReplyMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Centre d&apos;Aide, FAQ & Service Client
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

        {/* Navigation tabs */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'faq' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Foire Aux Questions (FAQ)
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'contact' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Formulaire de Contact
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'tickets' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mes Tickets Support ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'policy' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Politique & Confidentialité (2-3 min)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: FAQ ACCORDION */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Consultez nos réponses immédiates aux questions les plus fréquentes :
              </p>
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CONTACT FORM & DETAILS */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Form Left */}
              <div className="md:col-span-7 space-y-4">
                <form onSubmit={handleSendTicket} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Motif de votre message *</label>
                    <select
                      value={contactCategory}
                      onChange={(e) => setContactCategory(e.target.value as typeof contactCategory)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                    >
                      <option value="commande">Suivi de commande</option>
                      <option value="livraison">Délai / Adresse de livraison</option>
                      <option value="paiement">Question relative au paiement</option>
                      <option value="retour">Retour ou échange d&apos;article</option>
                      <option value="autre">Autre renseignement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Objet *</label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="Ex: Renseignement sur la pointure 42..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Votre message détaillé *</label>
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      rows={4}
                      placeholder="Expliquez votre situation avec précision..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-600"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer mon message</span>
                  </button>
                </form>
              </div>

              {/* Coordinates Right */}
              <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">
                  Coordonnées officielles
                </h4>

                <div className="space-y-3 text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">Téléphones / WhatsApp</div>
                      <a href={`tel:${storeSettings.phone}`} className="hover:underline font-mono block">
                        {storeSettings.phone}
                      </a>
                      {storeSettings.phoneSecondary && (
                        <a href={`tel:${storeSettings.phoneSecondary}`} className="hover:underline font-mono block text-slate-500">
                          {storeSettings.phoneSecondary}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">E-mail support</div>
                      <a href={`mailto:${storeSettings.email}`} className="hover:underline">
                        {storeSettings.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">Boutique & Point de Retrait</div>
                      <p className="font-medium text-slate-800">{storeSettings.address}</p>
                      <p>{storeSettings.city}, {storeSettings.country} {storeSettings.postalCode ? `(Code Postal : ${storeSettings.postalCode})` : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">Horaires d&apos;ouverture</div>
                      <p>{storeSettings.openingHours}</p>
                    </div>
                  </div>
                </div>

                {storeSettings.socialLinks.whatsapp && (
                  <a
                    href={storeSettings.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Contacter directement sur WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TICKETS LIST */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              {tickets.length > 0 ? (
                tickets.map((tkt) => (
                  <div key={tkt.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{tkt.subject}</div>
                        <div className="text-[11px] text-slate-500">
                          Catégorie : {tkt.category} · Déposé par {tkt.userName}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tkt.status === 'resolu' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {tkt.status === 'resolu' ? 'Résolu' : 'En cours de traitement'}
                      </span>
                    </div>

                    <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                      {tkt.message}
                    </p>

                    {/* Replies */}
                    {tkt.replies.length > 0 && (
                      <div className="space-y-2 pl-3 border-l-2 border-indigo-300">
                        {tkt.replies.map((rep, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                            <div className="flex justify-between font-semibold text-slate-900 text-[11px]">
                              <span>{rep.author}</span>
                              <span className="text-slate-400 font-normal">{new Date(rep.timestamp).toLocaleString('fr-FR')}</span>
                            </div>
                            <p className="text-slate-600">{rep.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Reply Form */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Répondre à ce ticket..."
                        value={selectedTicketId === tkt.id ? ticketReplyMessage : ''}
                        onFocus={() => setSelectedTicketId(tkt.id)}
                        onChange={(e) => setTicketReplyMessage(e.target.value)}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                      />
                      <button
                        onClick={() => handleReplyTicket(tkt.id)}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  Aucun ticket de réclamation en cours.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: POLITIQUE DE CONFIDENTIALITÉ & CONDITIONS DE LIVRAISON */}
          {activeTab === 'policy' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Politique Officielle de Livraison & Confidentialité — Steeve Accessoire</span>
                </h4>
                <p className="text-xs text-indigo-900 mt-1">
                  Breffette, Cayes Sud, Haïti · Code Postal : 8110 · Téléphones : +509 56027710 / +509 40054375
                </p>
              </div>

              {/* Clause 1: Correction d'adresse sous 2 à 3 minutes */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>Règle des 2 à 3 Minutes pour la Correction d&apos;Adresse</span>
                </h5>
                <p className="text-slate-600">
                  Toute faute de frappe ou erreur d&apos;adresse de livraison <strong>doit être corrigée dans un délai strict de 2 à 3 minutes</strong> après validation de la commande, tant que le statut demeure <em>&quot;En attente de vérification&quot;</em>. Dès que l&apos;administrateur valide le transfert et passe la commande <em>&quot;En cours de livraison&quot;</em>, l&apos;adresse est immédiatement transmise au coursier et ne peut plus être altérée.
                </p>
              </div>

              {/* Clause 2: Tarification kilométrique 200 Gourdes / km */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>Tarification Kilométrique : 200 Gourdes par kilomètre parcouru</span>
                </h5>
                <p className="text-slate-600">
                  Le coût de la livraison est transparent : <strong>200 Gourdes (HTG) pour chaque kilomètre parcouru</strong> depuis notre boutique située à Breffette, Cayes Sud. La distance est calculée automatiquement à partir de la position géographique de votre appareil.
                </p>
              </div>

              {/* Clause 3: Chargement de l'adresse depuis la carte téléphonique / GPS */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>Localisation par Carte Téléphonique / GPS pour Éviter tout Égarement</span>
                </h5>
                <p className="text-slate-600">
                  L&apos;adresse doit être chargée depuis la <strong>carte téléphonique / GPS du client</strong> lors de la validation du panier. Cela permet à l&apos;administrateur et au coursier de mesurer précisément la distance kilométrique et de suivre l&apos;itinéraire sans jamais s&apos;égarer.
                </p>
              </div>

              {/* Clause 4: Exigence du nom complet et numéro de téléphone */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono">4</span>
                  <span>Exigence du Nom Complet, Numéro de Téléphone & Authentification</span>
                </h5>
                <p className="text-slate-600">
                  Le <strong>nom complet</strong> ainsi que le <strong>numéro de téléphone</strong> du client sont strictement obligatoires pour permettre au coursier de vous joindre à l&apos;arrivée. Les clients ont également la faculté de se connecter ou de s&apos;inscrire en un clic via l&apos;<strong>Authentification Google</strong>.
                </p>
              </div>

              {/* Clause 5: Processus de Paiement MonCash & Natcash */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-mono">5</span>
                  <span>Paiements MonCash & Natcash avec Capture d&apos;Écran</span>
                </h5>
                <p className="text-slate-600">
                  Le client effectue le virement sur le compte <strong>MonCash ou Natcash de l&apos;administrateur</strong>. Une <strong>capture d&apos;écran claire</strong> de la transaction est requise lors du paiement. Après vérification par l&apos;admin, le statut passe de <em>&quot;En attente&quot;</em> à <em>&quot;En cours&quot;</em>. Une fois la remise en main propre achevée, l&apos;admin valide la commande au statut définitif <em>&quot;Livrée&quot;</em>.
                </p>
              </div>

              {/* Clause 6: Délai de livraison sous 24h */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <h5 className="font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Délai Garanti : Livraison sous 24h Ouvrées</span>
                </h5>
                <p className="text-emerald-900">
                  Nous garantissons que votre colis sera livré en main propre dans un délai maximum de <strong>24 heures chrono</strong> suivant la validation de votre paiement.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
