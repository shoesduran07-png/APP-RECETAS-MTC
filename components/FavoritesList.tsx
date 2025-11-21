import React, { useState, useMemo } from 'react';
import { Recipe, SortOption } from '../types';
import { Trash2, ChevronRight, Calendar,  ArrowDownAZ } from 'lucide-react';

interface Props {
  favorites: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onRemove: (id: string) => void;
}

const FavoritesList: React.FC<Props> = ({ favorites, onSelect, onRemove }) => {
  const [sortOption, setSortOption] = useState<SortOption>('date');

  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => {
      if (sortOption === 'date') {
        return b.createdAt - a.createdAt;
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  }, [favorites, sortOption]);

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
           <span className="text-4xl">🥣</span>
        </div>
        <h3 className="text-xl text-gray-600 font-serif">Aún no tienes favoritos</h3>
        <p className="text-gray-400 mt-2">Guarda las recetas que te gusten para verlas aquí.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-tcm-green">Mis Recetas Guardadas</h2>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setSortOption('date')}
            className={`px-3 py-1 rounded-md flex items-center text-sm ${sortOption === 'date' ? 'bg-tcm-green text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Calendar className="w-4 h-4 mr-1" /> Recientes
          </button>
          <button
            onClick={() => setSortOption('alphabetical')}
            className={`px-3 py-1 rounded-md flex items-center text-sm ${sortOption === 'alphabetical' ? 'bg-tcm-green text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ArrowDownAZ className="w-4 h-4 mr-1" /> A-Z
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {sortedFavorites.map((recipe) => (
          <div key={recipe.id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex gap-4 group">
             <div 
               className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
               onClick={() => onSelect(recipe)}
             >
               {recipe.imageUrl ? (
                 <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-tcm-cream text-tcm-gold text-2xl">🍲</div>
               )}
             </div>
             <div className="flex-1 flex flex-col justify-between">
               <div>
                  <h3 
                    onClick={() => onSelect(recipe)}
                    className="font-bold text-tcm-dark cursor-pointer hover:text-tcm-red transition-colors line-clamp-1"
                  >
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{recipe.benefits}</p>
               </div>
               
               <div className="flex justify-between items-center mt-2">
                 <span className="text-xs text-gray-400">{new Date(recipe.createdAt).toLocaleDateString()}</span>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => onRemove(recipe.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onSelect(recipe)}
                      className="p-1.5 text-tcm-green hover:bg-green-50 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;