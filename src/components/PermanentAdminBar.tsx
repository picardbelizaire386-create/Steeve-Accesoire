import React from 'react';
import { useCommerce } from '../context/CommerceContext';
import { 
  ShieldCheck, 
  ShoppingBag, 
  Package, 
  Smartphone, 
  MapPin, 
  Palette, 
  FolderTree, 
  Rocket, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Sliders
} from 'lucide-react';

export const PermanentAdminBar: React.FC = () => {
  const { 
    openAdminTab, 
    products, 
    orders, 
    storeSettings, 
    isAdminBarMinimized, 
    setIsAdminBarMinimized 
  } = useCommerce();

  const pendingOrders = orders.filter(o => o.status === 'en_attente_paiement');

  if (isAdminBarMinimized) {
    return (
      <aside 
        aria-label="Contrôle Administrateur Réduit"
        className="fixed bottom-4 right-4 z-40"
      >
        <button
          onClick={() => setIsAdminBarMinimized(false)}
          className="bg-slate-900/95 hover:bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-2xl border border-amber-500/50 flex items-center gap-2.5 text-xs font-bold transition-all hover:scale-105 group backdrop-blur-md"
          title="Cliquez pour agrandir le panneau d'administration permanent"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Panneau Admin Permanent</span>
          {pendingOrders.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full animate-bounce">
              {pendingOrders.length}
            </span>
          )}
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
        </button>
      </aside>
    );
  }

  return (
    <aside 
      aria-label="Barre d'Administration Permanente"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 text-white backdrop-blur-md shadow-2xl transition-all"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-slate-100 text-[13px]">
                <span>{storeSettings.companyName || 'STEEVE ACCESSOIRE'}</span>
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[10px] rounded font-mono font-semibold border border-amber-500/30">
                  GÉRANT
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>📍 {storeSettings.address || 'Breffette, Cayes Sud'}</span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400 font-medium">⚡ 200 G/km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Direct Tab Shortcuts */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => openAdminTab('products', true)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 text-[11px] transition-colors shadow-sm shrink-0"
            title="Ajouter un nouveau produit avec photo et prix"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Produit</span>
          </button>

          <button
            onClick={() => openAdminTab('products')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 text-[11px] transition-colors border border-slate-700 shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
            <span>Produits ({products.length})</span>
          </button>

          <button
            onClick={() => openAdminTab('categories')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 text-[11px] transition-colors border border-slate-700 shrink-0"
          >
            <FolderTree className="w-3.5 h-3.5 text-amber-400" />
            <span>Catalogues</span>
          </button>

          <button
            onClick={() => openAdminTab('payments')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 text-[11px] transition-colors border border-slate-700 shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>MonCash & NatCash</span>
          </button>

          <button
            onClick={() => openAdminTab('orders')}
            className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 text-[11px] transition-colors border shrink-0 ${
              pendingOrders.length > 0
                ? 'bg-rose-950/80 border-rose-600 text-rose-200 hover:bg-rose-900'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-rose-400" />
            <span>Commandes</span>
            {pendingOrders.length > 0 && (
              <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingOrders.length} en attente
              </span>
            )}
          </button>

          <button
            onClick={() => openAdminTab('homepage')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 text-[11px] transition-colors border border-slate-700 shrink-0"
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>Page d&apos;Accueil</span>
          </button>

          <button
            onClick={() => openAdminTab('settings')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 text-[11px] transition-colors border border-slate-700 shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Livraison (200 G/km)</span>
          </button>

          <button
            onClick={() => openAdminTab('deploy')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold flex items-center gap-1.5 text-[11px] transition-colors border border-amber-500/40 shrink-0"
          >
            <Rocket className="w-3.5 h-3.5 text-amber-400" />
            <span>Rendre Public</span>
          </button>
        </div>

        {/* Right: Full Dashboard Modal Trigger + Collapse Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAdminTab('kpis')}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ouvrir Tout le Panneau</span>
          </button>

          <button
            onClick={() => setIsAdminBarMinimized(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Réduire temporairement la barre d'administration"
            aria-label="Réduire la barre admin"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
