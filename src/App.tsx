import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { GardenCanvas } from './components/GardenCanvas';
import { SeasonalViewStudio } from './components/SeasonalViewStudio';
import { ImageStudio } from './components/ImageStudio';
import { VeoVideoStudio } from './components/VeoVideoStudio';
import { PlantCatalogModal } from './components/PlantCatalogModal';
import { GardenDesignWizard } from './components/GardenDesignWizard';
import { PRESET_GARDENS } from './data/presetGardens';
import { GardenBlueprint, GardenPlant, Season, SavedImage, SavedVideo } from './types/garden';

export default function App() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'seasonal' | 'studio' | 'video' | 'catalog'>('canvas');
  const [currentGarden, setCurrentGarden] = useState<GardenBlueprint>(PRESET_GARDENS[0]);
  const [season, setSeason] = useState<Season>('summer');
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [videoInitialImage, setVideoInitialImage] = useState<string | null>(null);

  // Modals
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Add plant to current active garden
  const handleAddPlantToGarden = (newPlant: GardenPlant) => {
    setCurrentGarden((prev) => ({
      ...prev,
      plants: [...prev.plants, newPlant],
    }));
  };

  // Bridge action: Animate any image into video
  const handleSendToVideoStudio = (imageUrl: string) => {
    setVideoInitialImage(imageUrl);
    setActiveTab('video');
  };

  const handleSaveImage = (newImage: SavedImage) => {
    setSavedImages((prev) => [newImage, ...prev]);
  };

  const handleSaveVideo = (newVideo: SavedVideo) => {
    setSavedVideos((prev) => [newVideo, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b130f] text-[#e3ebe5]">
      {/* 3-Zone Header Contract Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentGarden={currentGarden}
        onSelectPreset={(preset) => setCurrentGarden(preset)}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 w-full">
        {activeTab === 'canvas' && (
          <GardenCanvas
            garden={currentGarden}
            season={season}
            setSeason={setSeason}
            onUpdateGarden={(updated) => setCurrentGarden(updated)}
            onOpenPlantCatalog={() => setIsCatalogOpen(true)}
          />
        )}

        {activeTab === 'seasonal' && (
          <SeasonalViewStudio
            garden={currentGarden}
            season={season}
            setSeason={setSeason}
            onSendToVideoStudio={handleSendToVideoStudio}
            onSaveImage={handleSaveImage}
          />
        )}

        {activeTab === 'studio' && (
          <ImageStudio
            garden={currentGarden}
            savedImages={savedImages}
            onSaveImage={handleSaveImage}
            onSendToVideoStudio={handleSendToVideoStudio}
          />
        )}

        {activeTab === 'video' && (
          <VeoVideoStudio
            initialImage={videoInitialImage}
            savedImages={savedImages}
            savedVideos={savedVideos}
            onSaveVideo={handleSaveVideo}
          />
        )}

        {activeTab === 'catalog' && (
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2e24] pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Curated Botanical Selection
                </span>
                <h2 className="text-2xl font-serif font-bold text-neutral-100">
                  Horticultural Encyclopedia & Companion Index
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Explore companion planting synergies, seasonal growth habits, and placement radius for dream landscapes.
                </p>
              </div>
              <button
                onClick={() => setIsCatalogOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-[#09150f] rounded-xl self-start sm:self-auto transition-transform active:scale-95"
              >
                Open Quick Place Drawer
              </button>
            </div>
            {/* Embedded view of catalog */}
            <PlantCatalogModal
              isOpen={true}
              onClose={() => setActiveTab('canvas')}
              onAddPlantToGarden={handleAddPlantToGarden}
              activeSeason={season}
            />
          </div>
        )}
      </main>

      {/* Floating Modals */}
      <PlantCatalogModal
        isOpen={isCatalogOpen && activeTab !== 'catalog'}
        onClose={() => setIsCatalogOpen(false)}
        onAddPlantToGarden={handleAddPlantToGarden}
        activeSeason={season}
      />

      <GardenDesignWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onApplyNewBlueprint={(newBlueprint) => {
          setCurrentGarden(newBlueprint);
          setActiveTab('canvas');
        }}
      />
    </div>
  );
}
