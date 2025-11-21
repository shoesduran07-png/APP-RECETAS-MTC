import React, { useState } from 'react';
import { Plus, X, Soup } from 'lucide-react';

interface Props {
  onGenerate: (ingredients: string[]) => void;
  isLoading: boolean;
}

const IngredientInput: React.FC<Props> = ({ onGenerate, isLoading }) => {
  const [input, setInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);

  const addIngredient = () => {
    if (input.trim()) {
      setIngredients([...ingredients, input.trim()]);
      setInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-tcm-gold/30 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <Soup className="w-12 h-12 text-tcm-green mx-auto mb-2" />
        <h2 className="text-2xl font-serif text-tcm-green font-bold">Cocina recetas MTC</h2>
        <p className="text-gray-600 mt-2">
          Descubre el equilibrio perfecto. Ingresa los ingredientes que tienes en casa y la inteligencia artificial creará una receta basada en la <strong className="font-bold">Medicina Tradicional China</strong> solo para ti.
        </p>
      </div>

      <h3 className="text-lg font-serif text-tcm-dark font-bold mb-2">¿Qué hay en tu despensa?</h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Jengibre, Pollo, Arroz, Bok Choy..."
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-tcm-green/50 bg-tcm-cream/30"
          disabled={isLoading}
        />
        <button
          onClick={addIngredient}
          disabled={!input.trim() || isLoading}
          className="bg-tcm-green text-white px-4 rounded-lg hover:bg-tcm-green/90 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 min-h-[60px]">
        {ingredients.map((ing, idx) => (
          <span key={idx} className="bg-tcm-cream border border-tcm-gold text-tcm-dark px-3 py-1 rounded-full flex items-center gap-1 animate-fade-in">
            {ing}
            <button onClick={() => removeIngredient(idx)} className="hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
        {ingredients.length === 0 && (
          <p className="text-gray-400 italic text-sm py-2">Tus ingredientes aparecerán aquí...</p>
        )}
      </div>

      <button
        onClick={() => onGenerate(ingredients)}
        disabled={ingredients.length === 0 || isLoading}
        className="w-full bg-tcm-red text-white py-3 rounded-lg font-bold text-lg shadow-md hover:bg-tcm-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
      >
        {isLoading ? 'Consultando Sabiduría Antigua...' : 'Crear Receta TCM'}
      </button>
    </div>
  );
};

export default IngredientInput;