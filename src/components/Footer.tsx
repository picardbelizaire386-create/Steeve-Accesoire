import React, { useState } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Check, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  Globe
} from 'lucide-react';

interface FooterProps {
  onNavigateCatalog: (category?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateCatalog }) => {
  const { storeSettings, setActiveModal } = useCommerce();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-20 pt-16 pb-24 md:pb-12">
      {/* Upper Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Security & Authentication Format Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-16 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authentification Sécurisée · Haïti (+509)</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              Espace Client Sécurisé — Commune des Cayes
            </h3>
            <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
              Connectez-vous par <strong>numéro haïtien (+509)</strong>, e-mail ou <strong>Google Authentification</strong> en 1 clic. Suivez vos commandes en direct et gérez vos adresses à Breffette et aux Cayes en toute sérénité.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setActiveModal('auth')}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Mon Espace Client</span>
            </button>
            <button
              onClick={() => setActiveModal('auth')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>Créer un Compte (+509)</span>
            </button>
          </div>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-900">
          
          {/* Col 1: Identity & Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              {storeSettings.logoUrl ? (
                <img 
                  src={storeSettings.logoUrl} 
                  alt={storeSettings.companyName}
                  className="h-8 max-w-[140px] object-contain rounded" 
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  SA
                </div>
              )}
              <span className="text-base font-bold text-white tracking-tight">
                {storeSettings.companyName}
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {storeSettings.slogan}. Notre plateforme vous garantit des stocks réels par taille et pointure, une logistique soignée et un accompagnement client dédié.
            </p>

            <div className="space-y-2 text-slate-400 text-xs pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{storeSettings.address}, {storeSettings.city}, {storeSettings.country} {storeSettings.postalCode ? `(Code Postal : ${storeSettings.postalCode})` : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-mono">
                  <a href={`tel:${storeSettings.phone}`} className="hover:underline">{storeSettings.phone}</a>
                  {storeSettings.phoneSecondary && (
                    <> · <a href={`tel:${storeSettings.phoneSecondary}`} className="hover:underline">{storeSettings.phoneSecondary}</a></>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{storeSettings.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{storeSettings.openingHours}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Rayons & Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Rayons Principaux
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigateCatalog('vetements-hommes')} className="hover:text-white transition-colors">
                  Vêtements Hommes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCatalog('vetements-femmes')} className="hover:text-white transition-colors">
                  Vêtements Femmes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCatalog('chaussures')} className="hover:text-white transition-colors">
                  Chaussures & Sneakers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCatalog('sandales')} className="hover:text-white transition-colors">
                  Sandales Cuir
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCatalog('telephones')} className="hover:text-white transition-colors">
                  Smartphones & 5G
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCatalog('ecouteurs')} className="hover:text-white transition-colors">
                  Écouteurs & Audio Hi-Fi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCatalog('cables-chargeurs')} className="hover:text-white transition-colors">
                  Câbles & Chargeurs GaN
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Service Client & Aide */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Service Client
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveModal('faq')} className="hover:text-white transition-colors">
                  Foire Aux Questions (FAQ)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('orders')} className="hover:text-white transition-colors">
                  Suivi de Commande
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('contact')} className="hover:text-white transition-colors">
                  Contactez-nous
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('faq')} className="hover:text-white transition-colors">
                  Politique de Retours (14j)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('faq')} className="hover:text-white transition-colors">
                  Modes de Livraison & Délais
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('admin')} className="hover:text-indigo-400 transition-colors font-medium">
                  Portail Administrateur
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Informations Légales & Réseaux */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Informations Légales
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveModal('faq')} className="hover:text-white transition-colors">
                  Conditions Générales de Vente
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('faq')} className="hover:text-white transition-colors">
                  Politique de Confidentialité
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('faq')} className="hover:text-white transition-colors">
                  Gestion des Cookies
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('faq')} className="hover:text-white transition-colors">
                  Sécurité des Paiements
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">Suivez-nous</span>
              <div className="flex items-center gap-3 text-slate-400">
                <a href={storeSettings.socialLinks.facebook || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Facebook
                </a>
                <span>·</span>
                <a href={storeSettings.socialLinks.instagram || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Instagram
                </a>
                <span>·</span>
                <a href={storeSettings.socialLinks.whatsapp || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Lower Strip: Copyright & Payments */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {storeSettings.companyName}. Tous droits réservés. {storeSettings.country}.
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Paiement sécurisé par :</span>
            <span className="font-semibold text-slate-300">Visa</span>
            <span>·</span>
            <span className="font-semibold text-slate-300">Mastercard</span>
            <span>·</span>
            <span className="font-semibold text-slate-300">MonCash</span>
            <span>·</span>
            <span className="font-semibold text-slate-300">Natcash</span>
            <span>·</span>
            <span className="font-semibold text-slate-300">Espèces à la livraison</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
