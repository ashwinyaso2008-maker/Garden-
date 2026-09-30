import React from 'react';
import { Sprout, Compass, Sparkles, Film, BookOpen, Plus, ChevronDown } from 'lucide-react';
import { PRESET_GARDENS } from '../data/presetGardens';
import { GardenBlueprint } from '../types/garden';

interface TopNavProps {
  activeTab: 'canvas' | 'seasonal' | 'studio' | 'video' | 'catalog';
  setActiveTab: (tab: 'canvas' | 'seasonal' | 'studio' | 'video' | 'catalog') => void;
  currentGarden: GardenBlueprint;
  onSelectPreset: (garden: GardenBlueprint) => void;
  onOpenWizard: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  currentGarden,
  onSelectPreset,
  onOpenWizard,
}) => {
  const [presetDropdownOpen, setPresetDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0e1612]/95 backdrop-blur-md border-b border-[#1c2e24] px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('canvas');
            }}
            className="flex items-center gap-2.5 text-lg font-serif tracking-tight text-[#f2f7f4] hover:text-emerald-300 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-semibold text-lg tracking-wide">VerdantDream</span>
          </a>
          <span className="hidden sm:inline-block text-xs text-neutral-400 border-l border-[#243d30] pl-3 truncate max-w-[200px]">
            {currentGarden.gardenName}
          </span>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'canvas'
                ? 'bg-[#1b3327] text-emerald-300 border border-emerald-700/40'
                : 'text-neutral-300 hover:text-white hover:bg-[#14231b]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2D Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab('seasonal')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'seasonal'
                ? 'bg-[#1b3327] text-emerald-300 border border-emerald-700/40'
                : 'text-neutral-300 hover:text-white hover:bg-[#14231b]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>4-Season Views</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'studio'
                ? 'bg-[#1b3327] text-emerald-300 border border-emerald-700/40'
                : 'text-neutral-300 hover:text-white hover:bg-[#14231b]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Image Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'video'
                ? 'bg-[#1b3327] text-emerald-300 border border-emerald-700/40'
                : 'text-neutral-300 hover:text-white hover:bg-[#14231b]'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>Veo Walkthrough</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-[#1b3327] text-emerald-300 border border-emerald-700/40'
                : 'text-neutral-300 hover:text-white hover:bg-[#14231b]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Plant Catalog</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Preset Selector */}
          <div className="relative">
            <button
              onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-[#14231b] hover:bg-[#1b3327] border border-[#233d30] rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Presets</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {presetDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#101c15] border border-[#233d30] rounded-xl shadow-2xl p-1.5 z-50">
                <div className="text-[11px] font-medium text-neutral-400 px-2.5 py-1 uppercase tracking-wider">
                  Curated Garden Blueprints
                </div>
                {PRESET_GARDENS.map((preset) => (
                  <button
                    key={preset.gardenName}
                    onClick={() => {
                      onSelectPreset(preset);
                      setPresetDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 text-xs rounded-lg transition-colors flex flex-col ${
                      currentGarden.gardenName === preset.gardenName
                        ? 'bg-[#1b3528] text-emerald-200'
                        : 'text-neutral-300 hover:bg-[#172b21] hover:text-white'
                    }`}
                  >
                    <span className="font-medium">{preset.gardenName}</span>
                    <span className="text-[11px] text-neutral-400">{preset.style} · {preset.dimensions}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Garden Wizard Button */}
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#09150f] bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Generate Garden</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-between gap-1 overflow-x-auto pt-2.5 mt-2 border-t border-[#1a2d23]">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'canvas' ? 'bg-[#1b3327] text-emerald-300' : 'text-neutral-400'
          }`}
        >
          2D Blueprint
        </button>
        <button
          onClick={() => setActiveTab('seasonal')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'seasonal' ? 'bg-[#1b3327] text-emerald-300' : 'text-neutral-400'
          }`}
        >
          4-Season Views
        </button>
        <button
          onClick={() => setActiveTab('studio')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'studio' ? 'bg-[#1b3327] text-emerald-300' : 'text-neutral-400'
          }`}
        >
          AI Image Studio
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'video' ? 'bg-[#1b3327] text-emerald-300' : 'text-neutral-400'
          }`}
        >
          Veo Video
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeTab === 'catalog' ? 'bg-[#1b3327] text-emerald-300' : 'text-neutral-400'
          }`}
        >
          Catalog
        </button>
      </div>
    </header>
  );
};
