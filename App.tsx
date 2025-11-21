import React, { useState, useEffect } from 'react';
import { generateTCMRecipe, generateRecipeImage } from './services/geminiService';
import { Recipe, GenerationStatus } from './types';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';
import FavoritesList from './components/FavoritesList';
import { Utensils, BookHeart, Sparkles, AlertCircle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'favorites'>('create');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load favorites on mount
  useEffect(() => {
    const stored = localStorage.getItem('tcm_favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  // Save favorites on change
  useEffect(() => {
    localStorage.setItem('tcm_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleGenerate = async (ingredients: string[]) => {
    setStatus(GenerationStatus.GENERATING_RECIPE);
    setError(null);
    setCurrentRecipe(null);

    try {
      // 1. Generate Text Logic (Fast)
      const recipeData = await generateTCMRecipe(ingredients);
      
      const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        ...recipeData,
        createdAt: Date.now()
      };

      setCurrentRecipe(newRecipe);
      
      // 2. Generate Image (Async but update state when ready)
      setStatus(GenerationStatus.GENERATING_MEDIA);
      
      // We set the recipe immediately so user can read it while image loads
      generateRecipeImage(newRecipe.title, newRecipe.ingredients.join(', '))
        .then(imageUrl => {
          if (imageUrl) {
            setCurrentRecipe(prev => prev ? { ...prev, imageUrl } : null);
          }
          setStatus(GenerationStatus.COMPLETED);
        });

    } catch (e) {
      console.error(e);
      setError("Hubo un problema conectando con los espíritus de la cocina. Por favor intenta de nuevo.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  const toggleFavorite = (recipe: Recipe) => {
    const exists = favorites.some(f => f.id === recipe.id);
    if (exists) {
      setFavorites(favorites.filter(f => f.id !== recipe.id));
    } else {
      setFavorites([...favorites, recipe]);
    }
  };

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(f => f.id !== id));
  };

  // Callback to update a recipe image in the current view or favorites list if modified via editing
  const updateRecipeImage = (id: string, newImage: string) => {
    // Update current if it matches
    if (currentRecipe && currentRecipe.id === id) {
      setCurrentRecipe({ ...currentRecipe, imageUrl: newImage });
    }
    // Update favorites if it exists there
    setFavorites(prevFavs => 
      prevFavs.map(f => f.id === id ? { ...f, imageUrl: newImage } : f)
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC] font-sans text-tcm-dark pb-20">
      {/* Header */}
      <header className="bg-tcm-green text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Utensils className="w-6 h-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-bold tracking-wide">Cocina TCM AI</h1>
          </div>
          <nav className="flex gap-2">
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'create' ? 'bg-white text-tcm-green' : 'hover:bg-white/10'}`}
            >
              Crear
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === 'favorites' ? 'bg-white text-tcm-green' : 'hover:bg-white/10'}`}
            >
              Favoritos ({favorites.length})
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 mt-6">
        {activeTab === 'create' && (
          <div className="space-y-8">
            {status === GenerationStatus.IDLE && !currentRecipe && (
               <div className="animate-fade-in-up">
                  <IngredientInput onGenerate={handleGenerate} isLoading={false} />
               </div>
            )}

            {(status === GenerationStatus.GENERATING_RECIPE) && (
               <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                  <Sparkles className="w-16 h-16 text-tcm-gold mb-4 animate-spin-slow" />
                  <h2 className="text-2xl font-serif text-tcm-green">Consultando el flujo de energía...</h2>
                  <p className="text-gray-500 mt-2">Analizando propiedades de ingredientes</p>
               </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded relative flex items-center gap-2 max-w-2xl mx-auto">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
                <button onClick={() => setStatus(GenerationStatus.IDLE)} className="ml-auto font-bold hover:underline">Reintentar</button>
              </div>
            )}

            {currentRecipe && (
              <div className="animate-fade-in">
                <button 
                  onClick={() => { setCurrentRecipe(null); setStatus(GenerationStatus.IDLE); }}
                  className="mb-4 text-gray-500 hover:text-tcm-green flex items-center gap-1 text-sm font-bold"
                >
                  ← Crear nueva receta
                </button>
                <RecipeCard 
                  recipe={currentRecipe} 
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.some(f => f.id === currentRecipe.id)}
                  onUpdateRecipeImage={updateRecipeImage}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="animate-fade-in">
             <FavoritesList 
                favorites={favorites} 
                onRemove={removeFavorite} 
                onSelect={(recipe) => {
                  setCurrentRecipe(recipe);
                  setActiveTab('create');
                }}
             />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;