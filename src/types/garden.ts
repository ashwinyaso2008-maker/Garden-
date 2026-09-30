export type GardenStyle =
  | 'English Cottage'
  | 'Japanese Zen'
  | 'Modern Minimalist'
  | 'Mediterranean Drought-Tolerant'
  | 'Pollinator Meadow'
  | 'Urban Edible / Kitchen';

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface SeasonalPlantAttributes {
  spring: string;
  summer: string;
  fall: string;
  winter: string;
}

export interface GardenPlant {
  id: string;
  commonName: string;
  botanicalName: string;
  type: 'perennial' | 'shrub' | 'tree' | 'grass' | 'herb' | 'climber' | 'bulb' | 'succulent';
  gridX: number; // 0 to 100 relative
  gridY: number; // 0 to 100 relative
  spreadRadius: number; // in grid units, e.g. 4-12
  height: string;
  sunlightNeed: string;
  waterNeed: string;
  bloomSeason: string;
  bloomColor: string;
  seasonalAttributes: SeasonalPlantAttributes;
  companionPlants: string[];
  careSummary: string;
  customColor?: string;
}

export interface GardenZone {
  id: string;
  name: string;
  type: 'lawn' | 'bed' | 'patio' | 'path' | 'pond' | 'hedge' | 'pergola' | 'deck' | 'gravel';
  x: number; // 0 to 100 relative
  y: number; // 0 to 100 relative
  width: number;
  height: number;
  surfaceMaterial: string;
  colorTone: string;
}

export interface GardenFeature {
  id: string;
  name: string;
  type: 'fountain' | 'bench' | 'pergola' | 'firepit' | 'urn' | 'birdbath' | 'sculpture' | 'stepping_stones';
  gridX: number;
  gridY: number;
  size: number;
  description: string;
}

export interface GardenBlueprint {
  gardenName: string;
  style: GardenStyle;
  concept: string;
  paletteDescription: string;
  dimensions: string;
  zones: GardenZone[];
  plants: GardenPlant[];
  features: GardenFeature[];
  seasonalGuidance: Record<Season, string>;
  maintenanceScore: string;
  sunlightCompatibility: string;
  generatedRenders?: {
    spring?: string;
    summer?: string;
    fall?: string;
    winter?: string;
  };
}

export interface SavedImage {
  id: string;
  url: string;
  prompt: string;
  mode: 'create' | 'edit' | 'seasonal';
  season?: Season;
  createdAt: string;
  aspectRatio: string;
}

export interface SavedVideo {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  createdAt: string;
  thumbnailUrl?: string;
}
