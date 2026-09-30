import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Sprout, Compass, Check, AlertCircle } from 'lucide-react';
import { GardenBlueprint, GardenStyle } from '../types/garden';

interface GardenDesignWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNewBlueprint: (blueprint: GardenBlueprint) => void;
}

export const GardenDesignWizard: React.FC<GardenDesignWizardProps> = ({
  isOpen,
  onClose,
  onApplyNewBlueprint,
}) => {
  const [style, setStyle] = useState<GardenStyle>('English Cottage');
  const [dimensions, setDimensions] = useState('30ft x 40ft');
  const [sunlight, setSunlight] = useState('Full Sun (6+ hours)');
  const [soilType, setSoilType] = useState('Rich Loamy Soil');
  const [climateZone, setClimateZone] = useState('Zone 6-8 (Temperate)');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Curved Flagstone Path',
    'Flowering Perennial Borders',
    'Weathered Teak Bench',
    'Water Feature',
  ]);
  const [specialNotes, setSpecialNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const styleOptions: { label: GardenStyle; desc: string }[] = [
    { label: 'English Cottage', desc: 'Romantic, abundant layers, fragrant roses, lavender, gravel pathways' },
    { label: 'Japanese Zen', desc: 'Contemplative, raked granite gravel, moss islands, maple, bamboo water spout' },
    { label: 'Modern Minimalist', desc: 'Sleek dark slate pavers, corten steel, architectural grasses, water trough' },
    { label: 'Mediterranean Drought-Tolerant', desc: 'Water-wise, olive tree, terracotta pots, lavender, rosemary hedges' },
    { label: 'Pollinator Meadow', desc: 'Wildflower swathes, coneflowers, ornamental grasses, birdbaths, bee hotel' },
    { label: 'Urban Edible / Kitchen', desc: 'Raised cedar cedar vegetable beds, espalier fruit trees, culinary herb spirals' },
  ];

  const availableFeatures = [
    'Curved Flagstone Path',
    'Flowering Perennial Borders',
    'Weathered Teak Bench',
    'Water Feature',
    'Shaded Pergola / Trellis',
    'Natural Wildlife Pond',
    'Fire Table / Firepit',
    'Raised Vegetable Planters',
    'Specimen Shade Tree',
    'Herb Garden Spiral',
    'Birdbath Sanctuary',
  ];

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/garden/generate-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style,
          dimensions,
          sunlight,
          soilType,
          climateZone,
          featuresWanted: selectedFeatures,
          additionalNotes: specialNotes,
        }),
      });

      const data = await response.json();
      if (!data.success || !data.blueprint) {
        throw new Error(data.error || 'Failed to generate layout');
      }

      onApplyNewBlueprint(data.blueprint);
      onClose();
    } catch (err: any) {
      console.error('Error in design wizard:', err);
      setErrorMessage(
        err.message || 'Layout generation failed. Ensure your Gemini API key is configured in Settings > Secrets.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#101b15] border border-[#233c2e] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1c3024]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-neutral-100">
                Design Your Dream Garden
              </h3>
              <p className="text-xs text-neutral-400">
                Specify your site preferences to generate an intelligent botanical blueprint with Gemini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#192b21] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-xs">
          {/* Garden Style Selection */}
          <div>
            <label className="font-semibold text-neutral-200 block mb-2">
              1. Choose Garden Aesthetic Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {styleOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setStyle(opt.label)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    style === opt.label
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200 shadow-md'
                      : 'bg-[#131f18] border-[#203629] text-neutral-300 hover:border-[#2d4d3a]'
                  }`}
                >
                  <span className="font-semibold block text-neutral-100 mb-0.5">{opt.label}</span>
                  <span className="text-[11px] text-neutral-400 leading-snug block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions & Sun Exposure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-200 block mb-1">
                2. Property Dimensions
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 30ft x 45ft or 10m x 15m"
                className="w-full bg-[#131f18] border border-[#203629] rounded-xl p-2.5 text-neutral-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-200 block mb-1">
                3. Sunlight Exposure
              </label>
              <select
                value={sunlight}
                onChange={(e) => setSunlight(e.target.value)}
                className="w-full bg-[#131f18] border border-[#203629] rounded-xl p-2.5 text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option>Full Sun (6+ hours direct)</option>
                <option>Partial Shade / Morning Sun (3-6 hours)</option>
                <option>Dappled Woodland Light</option>
                <option>Deep Shade (&lt; 3 hours direct)</option>
              </select>
            </div>
          </div>

          {/* Soil & Hardiness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-200 block mb-1">
                4. Soil Condition
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full bg-[#131f18] border border-[#203629] rounded-xl p-2.5 text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option>Rich Loamy Soil (Balanced drainage & moisture)</option>
                <option>Sandy / Gravelly Soil (Sharp fast drainage)</option>
                <option>Heavy Clay Soil (Moisture retentive)</option>
                <option>Chalky / Alkaline Soil</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-200 block mb-1">
                5. Climate / Hardiness
              </label>
              <select
                value={climateZone}
                onChange={(e) => setClimateZone(e.target.value)}
                className="w-full bg-[#131f18] border border-[#203629] rounded-xl p-2.5 text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option>Zone 6-8 (Temperate with distinct 4 seasons)</option>
                <option>Zone 4-5 (Cold winter snow cover)</option>
                <option>Zone 9-10 (Mild coastal Mediterranean)</option>
                <option>Zone 11 (Subtropical / Frost-free)</option>
              </select>
            </div>
          </div>

          {/* Desired Architectural Features */}
          <div>
            <label className="font-semibold text-neutral-200 block mb-1.5">
              6. Desired Architectural & Hardscaping Features
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableFeatures.map((feat) => {
                const isSelected = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                      isSelected
                        ? 'bg-emerald-900 border-emerald-600 text-emerald-200'
                        : 'bg-[#131f18] border-[#203629] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1 text-emerald-400" />}
                    {feat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="font-semibold text-neutral-200 block mb-1">
              7. Special Wishes or Site Quirks (Optional)
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. Deer-resistant plants preferred, need a shaded spot for morning coffee, love blue and white flowers..."
              className="w-full bg-[#131f18] border border-[#203629] rounded-xl p-2.5 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Submit */}
          <div className="border-t border-[#1c3024] pt-4 mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-emerald-400 hover:bg-emerald-300 text-[#09150f] shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Landscape Architecture...</span>
                </>
              ) : (
                <>
                  <Sprout className="w-4 h-4" />
                  <span>Generate Dream Blueprint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
