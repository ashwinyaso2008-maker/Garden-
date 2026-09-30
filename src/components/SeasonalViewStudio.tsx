import React, { useState } from 'react';
import {
  Leaf,
  SunMedium,
  Sparkles,
  Snowflake,
  RefreshCw,
  Camera,
  Calendar,
  Layers,
  Thermometer,
  CloudSun,
  AlertCircle,
  Download,
  Film,
} from 'lucide-react';
import { GardenBlueprint, Season, SavedImage } from '../types/garden';

interface SeasonalViewStudioProps {
  garden: GardenBlueprint;
  season: Season;
  setSeason: (s: Season) => void;
  onSendToVideoStudio: (imageUrl: string) => void;
  onSaveImage: (img: SavedImage) => void;
}

export const SeasonalViewStudio: React.FC<SeasonalViewStudioProps> = ({
  garden,
  season,
  setSeason,
  onSendToVideoStudio,
  onSaveImage,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seasonalRenders, setSeasonalRenders] = useState<Record<Season, string | null>>({
    spring: null,
    summer: null,
    fall: null,
    winter: null,
  });

  const seasonData = {
    spring: {
      name: 'Spring Awakening',
      icon: Leaf,
      color: 'emerald',
      temp: '55°F - 68°F (13°C - 20°C)',
      sunlight: '12 - 14 hrs daily · Gentle morning warmth',
      foliageSummary: 'Vigorous tender lime-green bud burst, ruby-tinted new shoots, fresh lawn growth.',
      bloomSummary: 'Early spring bulbs (narcissus, crocuses, tulips), wisteria weeping racemes, cherry blossoms.',
      weatherSummary: 'Crisp morning dew, soft intermittent showers, revitalized damp loamy soil.',
      snowFoliage: 'Tender shoots protected from late frost by mulch; no snow cover.',
    },
    summer: {
      name: 'Summer Zenith',
      icon: SunMedium,
      color: 'amber',
      temp: '78°F - 90°F (25°C - 32°C)',
      sunlight: '14 - 16 hrs daily · Golden intense afternoon rays',
      foliageSummary: 'Maximum canopy density, deep saturated emerald green leaves, shaded outdoor seating.',
      bloomSummary: 'Full fragrant explosion of shrub roses, lavender wands, hydrangeas, coneflowers, and salvia.',
      weatherSummary: 'Warm golden afternoons, dry breezes, pollinator hum, vibrant evening twilight.',
      snowFoliage: 'Zero frost; maximum botanical vitality and transpiration.',
    },
    fall: {
      name: 'Autumn Radiance',
      icon: Sparkles,
      color: 'orange',
      temp: '48°F - 64°F (9°C - 18°C)',
      sunlight: '10 - 12 hrs daily · Low-angled amber light',
      foliageSummary: 'Fiery scarlet Japanese maples, copper-orange deciduous leaves, tawny golden reed grasses.',
      bloomSummary: 'Late asters, dusky copper sedum domes, ripe rose hips, feathery grass seed plumes.',
      weatherSummary: 'Misty mornings, crisp afternoon breezes, carpet of golden leaves on stone pathways.',
      snowFoliage: 'Early riming frost on seedheads; trees shedding leaves to reveal structure.',
    },
    winter: {
      name: 'Winter Solstice',
      icon: Snowflake,
      color: 'cyan',
      temp: '24°F - 38°F (-4°C - 3°C)',
      sunlight: '8 - 10 hrs daily · Pale stark crystalline light',
      foliageSummary: 'Architectural bare branch fractal silhouettes; deep dark green formal boxwood & pine anchors.',
      bloomSummary: 'Dried ornamental hydrangea globes and echinacea cones persist as winter sculptures.',
      weatherSummary: 'Crisp pristine white snow blankets pavers, stone coping, and dormant perennial beds.',
      snowFoliage: 'Snow caps on evergreens; crystalline rime frost sparkling on stone basins and dried seed pods.',
    },
  };

  const activeSeasonData = seasonData[season];

  // Call backend to generate AI seasonal render
  const handleGenerateSeasonalRender = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/garden/seasonal-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          season,
          gardenName: garden.gardenName,
          style: garden.style,
          keyPlants: garden.plants.map((p) => p.commonName),
          features: garden.features.map((f) => f.name),
          aspectRatio: '16:9',
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate seasonal view');
      }

      setSeasonalRenders((prev) => ({
        ...prev,
        [season]: data.imageUrl,
      }));

      onSaveImage({
        id: `season-${season}-${Date.now()}`,
        url: data.imageUrl,
        prompt: data.prompt,
        mode: 'seasonal',
        season,
        createdAt: new Date().toLocaleTimeString(),
        aspectRatio: '16:9',
      });
    } catch (err: any) {
      console.error('Error generating seasonal render:', err);
      setErrorMessage(
        err.message || 'Could not generate AI view. Please check your Gemini API key in the Secrets panel.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const activeRender = seasonalRenders[season];

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header and 4-Season Control Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1c2e24] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Botanical Chronology & 4D Visualization
          </span>
          <h2 className="text-2xl lg:text-3xl font-serif font-bold text-neutral-100 mt-1">
            Seasonal Evolution of {garden.gardenName}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Witness how your selected plantings, blooms, foliage colors, and hardscaping evolve through the four quarters of the year, from tender spring bud-break to snow-capped winter serenity.
          </p>
        </div>

        {/* 4-Season Segmented Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#101c15] border border-[#233c2f] rounded-xl self-start md:self-auto">
          {(['spring', 'summer', 'fall', 'winter'] as Season[]).map((s) => {
            const SIcon = seasonData[s].icon;
            const isActive = season === s;
            return (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                  isActive
                    ? s === 'spring'
                      ? 'bg-emerald-900 text-emerald-200 border border-emerald-700 shadow-md'
                      : s === 'summer'
                      ? 'bg-amber-900 text-amber-200 border border-amber-700 shadow-md'
                      : s === 'fall'
                      ? 'bg-orange-950 text-orange-200 border border-orange-700 shadow-md'
                      : 'bg-cyan-950 text-cyan-200 border border-cyan-700 shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-[#16271e]'
                }`}
              >
                <SIcon className="w-3.5 h-3.5" />
                <span>{s}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visual Comparison Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Render Frame (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-[#20362b] bg-[#0c1410] shadow-2xl flex items-center justify-center group">
            {activeRender ? (
              <img
                src={activeRender}
                alt={`${garden.gardenName} in ${season}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              /* High-fidelity Procedural Seasonal Scene Canvas */
              <div
                className={`relative w-full h-full flex flex-col items-center justify-center p-6 text-center transition-colors duration-700 ${
                  season === 'spring'
                    ? 'bg-gradient-to-b from-[#14291f] via-[#1a3828] to-[#12241a]'
                    : season === 'summer'
                    ? 'bg-gradient-to-b from-[#22391b] via-[#2d4d23] to-[#1a2d15]'
                    : season === 'fall'
                    ? 'bg-gradient-to-b from-[#3a2012] via-[#4d2918] to-[#25150c]'
                    : 'bg-gradient-to-b from-[#15232b] via-[#1a2e38] to-[#10181e]'
                }`}
              >
                {/* Subtle procedural environmental animations */}
                {season === 'winter' && (
                  <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
                )}
                {season === 'spring' && (
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#a7f3d0_2px,transparent_2px)] [background-size:32px_32px]" />
                )}
                {season === 'fall' && (
                  <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#ea580c_2px,transparent_2px)] [background-size:28px_28px]" />
                )}

                <div className="relative z-10 max-w-md flex flex-col items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border ${
                      season === 'spring'
                        ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300'
                        : season === 'summer'
                        ? 'bg-amber-950/80 border-amber-600/50 text-amber-300'
                        : season === 'fall'
                        ? 'bg-orange-950/80 border-orange-600/50 text-orange-300'
                        : 'bg-cyan-950/80 border-cyan-600/50 text-cyan-300'
                    }`}
                  >
                    <activeSeasonData.icon className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-xl font-serif font-bold text-neutral-100">
                      {activeSeasonData.name} Preview
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      {activeSeasonData.foliageSummary}
                    </p>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={handleGenerateSeasonalRender}
                      disabled={isGenerating}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-[#09150f] shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Rendering {season} view...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5" />
                          <span>Generate Photorealistic AI {season} View</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* In-Frame Seasonal Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-white">
              <activeSeasonData.icon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="capitalize">{season} Season</span>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-300">{activeSeasonData.temp}</span>
            </div>

            {/* Quick Action Overlay for Active Render */}
            {activeRender && (
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={() => onSendToVideoStudio(activeRender)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/20 text-xs font-medium text-white transition-colors"
                  title="Animate this seasonal view into a walkthrough video with Veo"
                >
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  <span>Animate with Veo</span>
                </button>
                <button
                  onClick={handleGenerateSeasonalRender}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/20 text-xs font-medium text-white transition-colors disabled:opacity-50"
                  title="Regenerate this seasonal view"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Re-render</span>
                </button>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold block">Render Notice:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Seasonal Environmental & Meteorological Dynamics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#121c17] border border-[#233b2d] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1f3327] pb-3">
              <div>
                <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
                  Quarter Profile
                </span>
                <h3 className="text-lg font-serif font-bold text-neutral-100">
                  {activeSeasonData.name}
                </h3>
              </div>
              <activeSeasonData.icon className="w-6 h-6 text-emerald-400" />
            </div>

            {/* Environmental Conditions */}
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="bg-[#0b1410] p-2.5 rounded-xl border border-[#1a2c21]">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  <span>Temperature Range & Climate</span>
                </span>
                <p className="font-medium text-neutral-200">{activeSeasonData.temp}</p>
              </div>

              <div className="bg-[#0b1410] p-2.5 rounded-xl border border-[#1a2c21]">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
                  <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sunlight Hours & Light Quality</span>
                </span>
                <p className="font-medium text-neutral-200">{activeSeasonData.sunlight}</p>
              </div>

              <div className="bg-[#0b1410] p-2.5 rounded-xl border border-[#1a2c21]">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Foliage & Canopy Behavior</span>
                </span>
                <p className="text-neutral-300 leading-relaxed">{activeSeasonData.foliageSummary}</p>
              </div>

              <div className="bg-[#0b1410] p-2.5 rounded-xl border border-[#1a2c21]">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Floral Display & Blooms</span>
                </span>
                <p className="text-neutral-300 leading-relaxed">{activeSeasonData.bloomSummary}</p>
              </div>

              <div className="bg-[#0b1410] p-2.5 rounded-xl border border-[#1a2c21]">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
                  <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Frost, Snow Cover & Hardscaping</span>
                </span>
                <p className="text-neutral-300 leading-relaxed">{activeSeasonData.snowFoliage}</p>
              </div>
            </div>

            {/* Quarterly Horticultural Guidance */}
            <div className="border-t border-[#1f3327] pt-3">
              <span className="text-xs font-semibold text-neutral-200 block mb-1">
                Seasonal Care Protocol ({season}):
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {garden.seasonalGuidance[season]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plant-by-Plant 4-Season Transformation Matrix */}
      <div className="flex flex-col gap-4 bg-[#111c16] border border-[#21382b] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1d3025] pb-3">
          <div>
            <h3 className="text-base font-semibold text-neutral-100">
              Plant-by-Plant Seasonal Behavior Matrix
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Specific physiological changes for every botanical specimen in your layout across all four seasons.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-[#172b20] px-2.5 py-1 rounded-lg border border-[#244231] self-start sm:self-auto">
            {garden.plants.length} Placed Species
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e3327] text-neutral-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 min-w-[180px]">Plant Specimen</th>
                <th className="py-2.5 px-3 min-w-[200px] text-emerald-300">
                  <span className="flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    <span>Spring Awakening</span>
                  </span>
                </th>
                <th className="py-2.5 px-3 min-w-[200px] text-amber-300">
                  <span className="flex items-center gap-1">
                    <SunMedium className="w-3 h-3" />
                    <span>Summer Zenith</span>
                  </span>
                </th>
                <th className="py-2.5 px-3 min-w-[200px] text-orange-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Autumn Radiance</span>
                  </span>
                </th>
                <th className="py-2.5 px-3 min-w-[200px] text-cyan-300">
                  <span className="flex items-center gap-1">
                    <Snowflake className="w-3 h-3" />
                    <span>Winter Solstice & Snow</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2d22]">
              {garden.plants.map((plant) => (
                <tr
                  key={plant.id}
                  className="hover:bg-[#15241c] transition-colors group"
                >
                  <td className="py-3 px-3">
                    <span className="font-semibold text-neutral-100 block">
                      {plant.commonName}
                    </span>
                    <span className="text-[11px] italic text-neutral-400">
                      {plant.botanicalName}
                    </span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] bg-[#1a2e22] text-neutral-300 px-1.5 py-0.5 rounded capitalize">
                        {plant.type}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {plant.sunlightNeed}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-neutral-300 leading-relaxed bg-emerald-950/10">
                    {plant.seasonalAttributes.spring}
                  </td>
                  <td className="py-3 px-3 text-neutral-300 leading-relaxed bg-amber-950/10">
                    {plant.seasonalAttributes.summer}
                  </td>
                  <td className="py-3 px-3 text-neutral-300 leading-relaxed bg-orange-950/10">
                    {plant.seasonalAttributes.fall}
                  </td>
                  <td className="py-3 px-3 text-neutral-300 leading-relaxed bg-cyan-950/10">
                    {plant.seasonalAttributes.winter}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
