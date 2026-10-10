import React from 'react';
import { CATEGORIES_LIST } from '../data/mockData';
import { ArrowRight } from 'lucide-react';
import { ProductCategory, CategoryItem } from '../types';
import { useCommerce } from '../context/CommerceContext';

interface CategoryShowcaseProps {
  onSelectCategory: (category: ProductCategory) => void;
  onViewAll: () => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ 
  onSelectCategory, 
  onViewAll 
}) => {
  const { storeSettings } = useCommerce();
  const categoriesToDisplay: CategoryItem[] = storeSettings.customCategories !== undefined
    ? storeSettings.customCategories
    : CATEGORIES_LIST;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Rayons de la boutique
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Explorer par catalogue & catégorie
          </h2>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors whitespace-nowrap"
        >
          <span>Tous les catalogues</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Categories Grid or Empty */}
      {categoriesToDisplay.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-xs text-slate-500">
            Aucun catalogue affiché pour le moment. Vous pouvez en créer depuis le panneau d&apos;administration en bas de l&apos;écran.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categoriesToDisplay.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as ProductCategory)}
              className="group text-left bg-white border border-slate-200/90 rounded-xl overflow-hidden hover:border-indigo-500/60 hover:shadow-md transition-all flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              {/* Image Thumbnail */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors" />
              </div>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  {cat.itemCount} articles
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
