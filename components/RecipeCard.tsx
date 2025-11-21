import React, { useState, useRef, useEffect } from 'react';
import { Recipe } from '../types';
import { Volume2, Heart, Trash2, Loader2, Wand2, StopCircle } from 'lucide-react';
import { decodeAudioData } from '../utils/audioUtils';
import { generateRecipeAudio, editRecipeImage } from '../services/geminiService';

interface Props {
  recipe: Recipe;
  onToggleFavorite: (recipe: Recipe) => void;
  isFavorite: boolean;
  onUpdateRecipeImage?: (id: string, newImage: string) => void;
}

const RecipeCard: React.FC<Props> = ({ recipe, onToggleFavorite, isFavorite, onUpdateRecipeImage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Image Edit State
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioSource) {
        audioSource.stop();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioSource, audioContext]);

  const handlePlayAudio = async () => {
    if (isPlaying && audioSource) {
      audioSource.stop();
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      // Generate full text for reading
      const textToRead = `Receta: ${recipe.title}. ${recipe.benefits}. Instrucciones: ${recipe.steps.join('. ')}.`;
      const base64Audio = await generateRecipeAudio(textToRead);

      if (base64Audio) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        setAudioContext(ctx);
        
        const audioBuffer = await decodeAudioData(base64Audio, ctx);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        
        source.onended = () => setIsPlaying(false);
        
        source.start();
        setAudioSource(source);
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Audio playback failed", e);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleImageEdit = async () => {
    if (!recipe.imageUrl || !editPrompt.trim() || !onUpdateRecipeImage) return;
    
    setIsProcessingEdit(true);
    try {
      const newImage = await editRecipeImage(recipe.imageUrl, editPrompt);
      if (newImage) {
        onUpdateRecipeImage(recipe.id, newImage);
        setEditPrompt("");
        setIsEditingImage(false);
      }
    } catch (e) {
      console.error("Edit failed", e);
    } finally {
      setIsProcessingEdit(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-3xl mx-auto border border-gray-200">
      {/* Image Section */}
      <div className="relative h-64 md:h-80 w-full bg-gray-100 group">
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            Generando Imagen...
          </div>
        )}
        
        <div className="absolute top-4 right-4 flex gap-2">
             <button
              onClick={() => onToggleFavorite(recipe)}
              className="p-2 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white transition-all"
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-tcm-red text-tcm-red' : 'text-gray-600'}`} />
            </button>
        </div>

        {/* Image Edit Overlay Trigger */}
        {recipe.imageUrl && onUpdateRecipeImage && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
               onClick={() => setIsEditingImage(!isEditingImage)}
               className="flex items-center bg-black/60 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur hover:bg-black/80"
             >
               <Wand2 className="w-4 h-4 mr-1.5" />
               Editar Imagen
             </button>
          </div>
        )}
      </div>

      {/* Edit Panel */}
      {isEditingImage && (
        <div className="bg-gray-50 p-4 border-b border-gray-200 animate-in slide-in-from-top-2">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instrucción para editar imagen</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="Ej: Añadir un filtro vintage, Quitar la cuchara..." 
              className="flex-1 text-sm px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-tcm-green"
            />
            <button 
              onClick={handleImageEdit}
              disabled={isProcessingEdit || !editPrompt.trim()}
              className="bg-tcm-green text-white px-4 py-2 rounded text-sm font-bold hover:bg-tcm-green/90 disabled:opacity-50"
            >
              {isProcessingEdit ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Generar'}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-serif font-bold text-tcm-green">{recipe.title}</h1>
          
          <button
            onClick={handlePlayAudio}
            disabled={isLoadingAudio}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-tcm-gold/20 text-tcm-dark hover:bg-tcm-gold/30'}`}
          >
            {isLoadingAudio ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <>
                <StopCircle className="w-4 h-4" /> Parar Audio
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" /> Guía de Audio
              </>
            )}
          </button>
        </div>

        <div className="mb-6 p-4 bg-tcm-cream/50 rounded-lg border-l-4 border-tcm-gold">
          <h3 className="font-bold text-tcm-dark mb-2">Beneficios TCM</h3>
          <p className="text-gray-700 leading-relaxed">{recipe.benefits}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold text-tcm-red mb-3 border-b border-gray-200 pb-2">Ingredientes</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-tcm-green rounded-full mr-3"></span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-serif font-bold text-tcm-red mb-3 border-b border-gray-200 pb-2">Preparación</h3>
            <ol className="space-y-4">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex group">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full text-xs font-bold mr-3 mt-0.5 group-hover:bg-tcm-gold group-hover:text-white transition-colors">{i + 1}</span>
                  <p className="text-gray-700">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;