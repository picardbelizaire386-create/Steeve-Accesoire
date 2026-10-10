import React from 'react';
import { useCommerce } from '../context/CommerceContext';
import { ArrowRight, Tag } from 'lucide-react';

interface HeroBannerProps {
  onDiscover: () => void;
  onViewDeals: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onDiscover, onViewDeals }) => {
  const { storeSettings } = useCommerce();

  const heroImage = storeSettings.heroImageUrl || '/src/assets/images/hero_commerce_lifestyle_1791556272110.jpg';
  const heroTitle = storeSettings.heroTitle || 'L’excellence des accessoires & du style à votre portée.';
  const heroSubtitle = storeSettings.heroSubtitle || 'Découvrez la collection officielle de STEEVE ACCESSOIRE : vêtements raffinés, sneakers urbaines, téléphones et accessoires technologiques de premier choix. Stocks réels certifiés et livraison soignée en Haïti.';
  const heroKicker = storeSettings.heroKicker || 'Boutique Officielle · Haïti';
  const heroButtonText = storeSettings.heroButtonText || 'Découvrir les produits';
  const heroDealsButtonText = storeSettings.heroDealsButtonText || 'Voir les promotions (-25%)';

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-6 border border-slate-800">
      {/* Background Image with Measured Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={storeSettings.companyName}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback if custom url fails
            e.currentTarget.src = '/src/assets/images/hero_commerce_lifestyle_1791556272110.jpg';
          }}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 lg:py-28 flex flex-col justify-center">
        <div className="max-w-xl space-y-6">
          
          {/* Unboxed natural editorial kicker */}
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-indigo-400">
            <span>{heroKicker}</span>
            <span aria-hidden="true">·</span>
            <span>{storeSettings.companyName}</span>
          </div>

          {/* Headline with balanced wrapping */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white text-balance">
            {heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onDiscover}
              className="px-6 py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 group whitespace-nowrap"
            >
              <span>{heroButtonText}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onViewDeals}
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700/80 font-medium text-sm rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap backdrop-blur-sm"
            >
              <Tag className="w-4 h-4 text-rose-400" />
              <span>{heroDealsButtonText}</span>
            </button>
          </div>

          {/* Quiet Trust Metrics below hero */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-white">Livraison 24h</span> garantie (200 G/km)
            </div>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <div>
              <span className="font-semibold text-white">MonCash & Natcash</span> direct
            </div>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <div>
              <span className="font-semibold text-white">Stocks réels</span> Breffette, Cayes Sud
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
