export interface Ingredient {
  id: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  benefits: string;
  createdAt: number;
  imageUrl?: string; // Base64 data URI
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING_RECIPE = 'GENERATING_RECIPE',
  GENERATING_MEDIA = 'GENERATING_MEDIA',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type SortOption = 'date' | 'alphabetical';
