import React, { useState } from 'react';
import { X, Search, Plus, Sparkles, Droplets, Sun, Check } from 'lucide-react';
import { PLANT_ENCYCLOPEDIA, EncyclopediaPlant } from '../data/plantEncyclopedia';
import { GardenPlant, Season } from '../types/garden';

interface PlantCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlantToGarden: (plant: GardenPlant) => void;
  activeSeason: Season;
}

export const PlantCatalogModal: React.FC<PlantCatalogModalProps> = ({
  isOpen,
  onClose,
  onAddPlantToGarden,
  activeSeason,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedPlantName, setAddedPlantName] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    'All',
    'Flowering Shrubs',
    'Aromatic & Drought Tolerant',
    'Specimen Trees',
    'Pollinator Favorites',
    'Ornamental Grasses',
    'Architectural Evergreens',
    'Cottage Spires',
    'Late-Season Anchors',
    'Shade Grasses',
    'Climbing Vines',
  ];

  const filteredPlants = PLANT_ENCYCLOPEDIA.filter((plant) => {
    const matchesCategory = selectedCategory === 'All' || plant.category === selectedCategory;
    const matchesSearch =
      plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.botanicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.companionPlants.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (plant: EncyclopediaPlant) => {
    // Generate a reasonable random grid coordinate near the center
    const randomX = Math.floor(Math.random() * 60) + 20;
    const randomY = Math.floor(Math.random() * 60) + 20;

    const newGardenPlant: GardenPlant = {
      id: `plant-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      commonName: plant.commonName,
      botanicalName: plant.botanicalName,
      type: plant.type,
      gridX: randomX,
      gridY: randomY,
      spreadRadius: plant.defaultSpread,
      height: plant.height,
      sunlightNeed: plant.sunlightNeed,
      waterNeed: plant.waterNeed,
      bloomSeason: plant.bloomSeason,
      bloomColor: plant.bloomColor,
      seasonalAttributes: plant.seasonalAttributes,
      companionPlants: plant.companionPlants,
      careSummary: plant.careSummary,
    };

    onAddPlantToGarden(newGardenPlant);
    setAddedPlantName(plant.commonName);
    setTimeout(() => setAddedPlantName(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#101a15] border border-[#233c2e] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1c3024]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Botanical Encyclopedia
            </span>
            <h3 className="text-lg font-serif font-bold text-neutral-100">
              Plant Encyclopedia & Companion Catalog
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Browse companion-compatible species and click to place them directly onto your 2D layout canvas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#192b21] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-4 bg-[#0d1611] border-b border-[#1b2c21] flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search botanical name, common name, or companion..."
              className="w-full bg-[#132019] border border-[#23382c] rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-900 text-emerald-200 font-semibold border border-emerald-700'
                    : 'text-neutral-400 hover:text-white hover:bg-[#16271e]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Plant Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlants.map((plant) => (
            <div
              key={plant.botanicalName}
              className="bg-[#131f18] border border-[#203629] rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-emerald-700/60 transition-colors shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                      {plant.category}
                    </span>
                    <h4 className="text-sm font-semibold text-neutral-100">{plant.commonName}</h4>
                    <p className="text-xs italic text-neutral-400">{plant.botanicalName}</p>
                  </div>
                  <span className="text-[10px] bg-[#1a2d22] text-neutral-300 px-2 py-0.5 rounded capitalize">
                    {plant.type}
                  </span>
                </div>

                {/* Quick specs */}
                <div className="grid grid-cols-2 gap-2 my-2.5 text-[11px] text-neutral-300">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{plant.sunlightNeed}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{plant.waterNeed}</span>
                  </div>
                </div>

                {/* Seasonal transformation preview in active season */}
                <div className="bg-[#0b1410] p-2.5 rounded-lg border border-[#1a2a20] text-xs text-neutral-300 mb-2">
                  <span className="text-[10px] font-semibold text-emerald-400 block uppercase tracking-wider mb-0.5">
                    Behavior in {activeSeason}:
                  </span>
                  <p className="line-clamp-2 leading-relaxed">
                    {plant.seasonalAttributes[activeSeason]}
                  </p>
                </div>

                {/* Companion highlights */}
                {plant.companionPlants.length > 0 && (
                  <div className="text-[11px] text-neutral-400">
                    <span className="font-medium text-neutral-300">Synergies: </span>
                    {plant.companionPlants.slice(0, 3).join(', ')}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="border-t border-[#1b2f23] pt-2.5 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">Spread: {plant.defaultSpread} ft</span>
                <button
                  onClick={() => handleAdd(plant)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
                >
                  {addedPlantName === plant.commonName ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Added to Plan!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Place in Garden</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
