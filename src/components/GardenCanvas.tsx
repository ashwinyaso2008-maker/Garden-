import React, { useState, useRef } from 'react';
import {
  Sun,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  Trash2,
  Move,
  HeartHandshake,
  Download,
  PlusCircle,
  Snowflake,
  Leaf,
  SunMedium,
} from 'lucide-react';
import { GardenBlueprint, GardenPlant, GardenZone, GardenFeature, Season } from '../types/garden';

interface GardenCanvasProps {
  garden: GardenBlueprint;
  season: Season;
  setSeason: (s: Season) => void;
  onUpdateGarden: (updated: GardenBlueprint) => void;
  onOpenPlantCatalog: () => void;
}

export const GardenCanvas: React.FC<GardenCanvasProps> = ({
  garden,
  season,
  setSeason,
  onUpdateGarden,
  onOpenPlantCatalog,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [sunlightSimulation, setSunlightSimulation] = useState<'noon' | 'morning' | 'afternoon'>('noon');
  const [showCompanionSynergy, setShowCompanionSynergy] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ type: 'plant' | 'feature'; id: string } | null>(null);

  const canvasRef = useRef<SVGSVGElement>(null);

  // Selected item references
  const selectedPlant = garden.plants.find((p) => p.id === selectedPlantId);
  const selectedFeature = garden.features.find((f) => f.id === selectedFeatureId);

  // Helper for seasonal color palette of plant canopy
  const getPlantVisual = (plant: GardenPlant, activeSeason: Season) => {
    switch (activeSeason) {
      case 'spring':
        return {
          canopyColor: '#6aa84f', // tender fresh spring green
          borderColor: '#8fce00',
          flowerColor: '#f9a8d4', // pastel spring blossoms
          innerPattern: 'spring-buds',
          bloomScale: 0.65,
          foliageDensity: 0.75,
        };
      case 'summer':
        return {
          canopyColor: '#274e13', // deep lush summer green
          borderColor: '#38761d',
          flowerColor: plant.bloomColor.toLowerCase().includes('pink')
            ? '#ec4899'
            : plant.bloomColor.toLowerCase().includes('violet') || plant.bloomColor.toLowerCase().includes('lavender')
            ? '#8b5cf6'
            : plant.bloomColor.toLowerCase().includes('blue')
            ? '#3b82f6'
            : '#f59e0b',
          innerPattern: 'summer-dense',
          bloomScale: 1.0,
          foliageDensity: 1.0,
        };
      case 'fall':
        return {
          canopyColor: plant.type === 'tree' || plant.type === 'shrub' ? '#c2410c' : '#b45309', // amber, copper, crimson
          borderColor: '#ea580c',
          flowerColor: '#d97706',
          innerPattern: 'fall-leaves',
          bloomScale: 0.45,
          foliageDensity: 0.85,
        };
      case 'winter':
        const isEvergreen =
          plant.commonName.toLowerCase().includes('boxwood') ||
          plant.commonName.toLowerCase().includes('pine') ||
          plant.commonName.toLowerCase().includes('rosemary') ||
          plant.commonName.toLowerCase().includes('olive');
        return {
          canopyColor: isEvergreen ? '#1e3a2b' : '#333734', // evergreen vs bare branch dark taupe
          borderColor: isEvergreen ? '#2d5a44' : '#575f5b',
          flowerColor: '#ffffff', // frost or snow caps
          innerPattern: isEvergreen ? 'winter-snow-evergreen' : 'winter-bare-branches',
          bloomScale: 0.1,
          foliageDensity: isEvergreen ? 0.9 : 0.35,
          snowCover: true,
        };
    }
  };

  // Drag and drop handlers on SVG
  const handlePointerDown = (type: 'plant' | 'feature', id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedItem({ type, id });
    if (type === 'plant') {
      setSelectedPlantId(id);
      setSelectedFeatureId(null);
    } else {
      setSelectedFeatureId(id);
      setSelectedPlantId(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !draggedItem || !canvasRef.current) return;
    const svgRect = canvasRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, Math.round(((e.clientX - svgRect.left) / svgRect.width) * 100)));
    const yPct = Math.max(5, Math.min(95, Math.round(((e.clientY - svgRect.top) / svgRect.height) * 100)));

    if (draggedItem.type === 'plant') {
      const updatedPlants = garden.plants.map((p) => (p.id === draggedItem.id ? { ...p, gridX: xPct, gridY: yPct } : p));
      onUpdateGarden({ ...garden, plants: updatedPlants });
    } else {
      const updatedFeatures = garden.features.map((f) => (f.id === draggedItem.id ? { ...f, gridX: xPct, gridY: yPct } : f));
      onUpdateGarden({ ...garden, features: updatedFeatures });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

  const handleDeleteItem = () => {
    if (selectedPlantId) {
      const updatedPlants = garden.plants.filter((p) => p.id !== selectedPlantId);
      onUpdateGarden({ ...garden, plants: updatedPlants });
      setSelectedPlantId(null);
    } else if (selectedFeatureId) {
      const updatedFeatures = garden.features.filter((f) => f.id !== selectedFeatureId);
      onUpdateGarden({ ...garden, features: updatedFeatures });
      setSelectedFeatureId(null);
    }
  };

  // Sunlight shadow offset
  const getShadowOffset = () => {
    switch (sunlightSimulation) {
      case 'morning':
        return { dx: -3.5, dy: 3.5, opacity: 0.35, sunAngle: 'Morning Sun (East)' };
      case 'afternoon':
        return { dx: 4.5, dy: 3.5, opacity: 0.4, sunAngle: 'Afternoon Sun (West)' };
      case 'noon':
      default:
        return { dx: 0.5, dy: 1.5, opacity: 0.25, sunAngle: 'Midday Sun (Overhead)' };
    }
  };

  const shadow = getShadowOffset();

  // Export SVG download
  const handleExportSvg = () => {
    if (!canvasRef.current) return;
    const svgData = new XMLSerializer().serializeToString(canvasRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${garden.gardenName.toLowerCase().replace(/\s+/g, '-')}-blueprint-${season}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Main Canvas Column */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111c16] border border-[#21382b] p-3 rounded-xl">
          {/* Season Selector */}
          <div className="flex items-center gap-1 bg-[#0b1410] p-1 rounded-lg border border-[#1b3125]">
            <button
              onClick={() => setSeason('spring')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                season === 'spring' ? 'bg-emerald-900/80 text-emerald-300 shadow-sm border border-emerald-700/50' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Spring</span>
            </button>
            <button
              onClick={() => setSeason('summer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                season === 'summer' ? 'bg-amber-900/80 text-amber-300 shadow-sm border border-amber-700/50' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <SunMedium className="w-3.5 h-3.5 text-amber-400" />
              <span>Summer</span>
            </button>
            <button
              onClick={() => setSeason('fall')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                season === 'fall' ? 'bg-orange-900/80 text-orange-300 shadow-sm border border-orange-700/50' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Autumn</span>
            </button>
            <button
              onClick={() => setSeason('winter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                season === 'winter' ? 'bg-cyan-900/80 text-cyan-200 shadow-sm border border-cyan-700/50' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-cyan-300" />
              <span>Winter</span>
            </button>
          </div>

          {/* Sunlight Angle and Options */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0b1410] p-1 rounded-lg border border-[#1b3125]">
              <button
                onClick={() => setSunlightSimulation('morning')}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  sunlightSimulation === 'morning' ? 'bg-[#1e382b] text-emerald-300 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
                title="Simulate morning low sun from the east"
              >
                East 9AM
              </button>
              <button
                onClick={() => setSunlightSimulation('noon')}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  sunlightSimulation === 'noon' ? 'bg-[#1e382b] text-emerald-300 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
                title="Simulate midday overhead sun"
              >
                Noon
              </button>
              <button
                onClick={() => setSunlightSimulation('afternoon')}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  sunlightSimulation === 'afternoon' ? 'bg-[#1e382b] text-emerald-300 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
                title="Simulate golden hour afternoon sun from the west"
              >
                West 5PM
              </button>
            </div>

            {/* Synergy Toggle */}
            <button
              onClick={() => setShowCompanionSynergy(!showCompanionSynergy)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                showCompanionSynergy ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300' : 'bg-[#0e1712] border-[#22362b] text-neutral-400'
              }`}
              title="Show companion planting synergies between plants"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Synergies</span>
            </button>

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 text-xs rounded-lg border transition-colors ${
                showGrid ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300' : 'bg-[#0e1712] border-[#22362b] text-neutral-400'
              }`}
              title="Toggle measurement grid lines"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {/* Export SVG */}
            <button
              onClick={handleExportSvg}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#16271e] hover:bg-[#20392c] text-neutral-300 border border-[#243d30] transition-colors"
              title="Export Vector Blueprint"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Blueprint Canvas Frame */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#0c130f] rounded-2xl border-2 border-[#20362b] overflow-hidden shadow-2xl select-none">
          <svg
            ref={canvasRef}
            viewBox="0 0 100 100"
            className="w-full h-full cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={() => {
              setSelectedPlantId(null);
              setSelectedFeatureId(null);
            }}
          >
            <defs>
              {/* Ground & Zone Textures */}
              <pattern id="grid-pattern" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1d3025" strokeWidth="0.15" />
              </pattern>

              {/* Gravel pebble texture */}
              <pattern id="gravel-pattern" width="3" height="3" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.4" fill="#a89a84" opacity="0.6" />
                <circle cx="2.5" cy="2.2" r="0.35" fill="#8c7e6c" opacity="0.7" />
              </pattern>

              {/* Flagstone paver pattern */}
              <pattern id="paver-pattern" width="6" height="4" patternUnits="userSpaceOnUse">
                <rect x="0.2" y="0.2" width="5.6" height="3.6" fill="#474744" rx="0.3" />
                <path d="M 0 0 L 6 0 6 4 0 4 Z" fill="none" stroke="#2b2b2a" strokeWidth="0.2" />
              </pattern>

              {/* Water shimmer pattern */}
              <linearGradient id="water-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e4e5f" />
                <stop offset="50%" stopColor="#256b82" />
                <stop offset="100%" stopColor="#1a3f4d" />
              </linearGradient>

              {/* Winter snow blanket pattern */}
              <pattern id="snow-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#e8f1f5" opacity="0.85" />
                <circle cx="2" cy="2" r="0.6" fill="#ffffff" opacity="0.9" />
                <circle cx="6" cy="5" r="0.5" fill="#cde1ea" opacity="0.7" />
              </pattern>

              {/* Plant drop shadows */}
              <filter id="plant-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx={shadow.dx} dy={shadow.dy} stdDeviation="1.2" floodColor="#000000" floodOpacity={shadow.opacity} />
              </filter>
            </defs>

            {/* Base Garden Soil Canvas */}
            <rect width="100" height="100" fill="#141e18" />

            {/* Optional Grid Overlay */}
            {showGrid && <rect width="100" height="100" fill="url(#grid-pattern)" />}

            {/* Render Architectural Zones */}
            {garden.zones.map((zone) => {
              const isSnowCovered = season === 'winter';
              return (
                <g key={zone.id} className="transition-all duration-300">
                  {/* Zone Base Shape */}
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.width}
                    height={zone.height}
                    rx={zone.type === 'lawn' ? 6 : zone.type === 'patio' ? 1.5 : 2}
                    fill={
                      zone.type === 'pond'
                        ? 'url(#water-gradient)'
                        : zone.type === 'gravel'
                        ? zone.colorTone
                        : zone.colorTone
                    }
                    stroke={zone.type === 'pond' ? '#468fa8' : '#2d4738'}
                    strokeWidth="0.4"
                    opacity={0.92}
                  />

                  {/* Surface Texture Overlays */}
                  {zone.type === 'gravel' && (
                    <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} fill="url(#gravel-pattern)" opacity="0.45" />
                  )}
                  {zone.type === 'patio' && (
                    <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} fill="url(#paver-pattern)" opacity="0.35" />
                  )}
                  {zone.type === 'deck' && (
                    <line
                      x1={zone.x}
                      y1={zone.y}
                      x2={zone.x + zone.width}
                      y2={zone.y}
                      stroke="#805b33"
                      strokeWidth="0.5"
                      strokeDasharray="1,1"
                    />
                  )}

                  {/* Winter Snow Cover on Zones */}
                  {isSnowCovered && zone.type !== 'pond' && (
                    <rect
                      x={zone.x + 0.5}
                      y={zone.y + 0.5}
                      width={zone.width - 1}
                      height={zone.height - 1}
                      rx={2}
                      fill="url(#snow-pattern)"
                      opacity="0.55"
                    />
                  )}

                  {/* Water Pond Details */}
                  {zone.type === 'pond' && (
                    <g>
                      <circle cx={zone.x + zone.width * 0.3} cy={zone.y + zone.height * 0.4} r="1.5" fill="#326c45" opacity="0.7" />
                      <circle cx={zone.x + zone.width * 0.65} cy={zone.y + zone.height * 0.6} r="1.2" fill="#2d613e" opacity="0.7" />
                      <ellipse cx={zone.x + zone.width * 0.5} cy={zone.y + zone.height * 0.5} rx={zone.width * 0.35} ry={zone.height * 0.25} fill="none" stroke="#68b4c7" strokeWidth="0.2" opacity="0.5" />
                      {isSnowCovered && (
                        <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} fill="#cbe6f2" opacity="0.35" />
                      )}
                    </g>
                  )}

                  {/* Zone Label */}
                  <text
                    x={zone.x + zone.width / 2}
                    y={zone.y + zone.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#f0f5f2"
                    fontSize="2.2"
                    fontWeight="500"
                    opacity="0.6"
                    className="pointer-events-none select-none tracking-wider font-mono uppercase"
                  >
                    {zone.name}
                  </text>
                </g>
              );
            })}

            {/* Companion Planting Synergy Lines */}
            {showCompanionSynergy && (
              <g className="companion-synergies">
                {garden.plants.map((plantA, i) => {
                  return garden.plants.slice(i + 1).map((plantB) => {
                    const isCompanion =
                      plantA.companionPlants.some((c) => plantB.commonName.toLowerCase().includes(c.toLowerCase())) ||
                      plantB.companionPlants.some((c) => plantA.commonName.toLowerCase().includes(c.toLowerCase()));
                    if (!isCompanion) return null;

                    return (
                      <line
                        key={`syn-${plantA.id}-${plantB.id}`}
                        x1={plantA.gridX}
                        y1={plantA.gridY}
                        x2={plantB.gridX}
                        y2={plantB.gridY}
                        stroke="#34d399"
                        strokeWidth="0.4"
                        strokeDasharray="0.8, 0.8"
                        opacity="0.6"
                      />
                    );
                  });
                })}
              </g>
            )}

            {/* Render Garden Features (Benches, Pergolas, Fountains, Urns) */}
            {garden.features.map((feature) => {
              const isSelected = selectedFeatureId === feature.id;
              return (
                <g
                  key={feature.id}
                  transform={`translate(${feature.gridX}, ${feature.gridY})`}
                  className="cursor-move"
                  onPointerDown={(e) => handlePointerDown('feature', feature.id, e)}
                  filter="url(#plant-shadow)"
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle r={feature.size * 0.8} fill="none" stroke="#38bdf8" strokeWidth="0.6" strokeDasharray="1,0.5" />
                  )}

                  {/* Feature Visual Representations */}
                  {feature.type === 'fountain' && (
                    <g>
                      <circle r={feature.size * 0.55} fill="#3d5a6c" stroke="#68b4c7" strokeWidth="0.4" />
                      <circle r={feature.size * 0.35} fill="#277994" />
                      <circle r={feature.size * 0.15} fill="#a5f3fc" />
                    </g>
                  )}
                  {feature.type === 'bench' && (
                    <g>
                      <rect x={-feature.size * 0.45} y={-feature.size * 0.2} width={feature.size * 0.9} height={feature.size * 0.4} rx="0.5" fill="#a3896b" stroke="#614e3b" strokeWidth="0.3" />
                      <line x1={-feature.size * 0.4} y1="0" x2={feature.size * 0.4} y2="0" stroke="#4a3a2a" strokeWidth="0.2" />
                    </g>
                  )}
                  {feature.type === 'pergola' && (
                    <g opacity="0.85">
                      <rect x={-feature.size * 0.5} y={-feature.size * 0.5} width={feature.size} height={feature.size} fill="none" stroke="#855938" strokeWidth="0.8" />
                      <line x1={-feature.size * 0.5} y1={-feature.size * 0.25} x2={feature.size * 0.5} y2={-feature.size * 0.25} stroke="#855938" strokeWidth="0.3" />
                      <line x1={-feature.size * 0.5} y1={0} x2={feature.size * 0.5} y2={0} stroke="#855938" strokeWidth="0.3" />
                      <line x1={-feature.size * 0.5} y1={feature.size * 0.25} x2={feature.size * 0.5} y2={feature.size * 0.25} stroke="#855938" strokeWidth="0.3" />
                    </g>
                  )}
                  {feature.type === 'firepit' && (
                    <g>
                      <circle r={feature.size * 0.5} fill="#52525b" stroke="#71717a" strokeWidth="0.4" />
                      <circle r={feature.size * 0.35} fill="#ea580c" />
                      <circle r={feature.size * 0.18} fill="#fde047" />
                    </g>
                  )}
                  {feature.type === 'urn' && (
                    <g>
                      <circle r={feature.size * 0.45} fill="#c2410c" stroke="#9a3412" strokeWidth="0.4" />
                      <circle r={feature.size * 0.25} fill="#ea580c" />
                    </g>
                  )}
                  {feature.type === 'birdbath' && (
                    <g>
                      <circle r={feature.size * 0.45} fill="#78716c" stroke="#a8a29e" strokeWidth="0.4" />
                      <circle r={feature.size * 0.28} fill="#38bdf8" />
                    </g>
                  )}
                  {feature.type === 'sculpture' && (
                    <g>
                      <polygon points={`0,${-feature.size * 0.5} ${feature.size * 0.4},${feature.size * 0.4} ${-feature.size * 0.4},${feature.size * 0.4}`} fill="#71717a" stroke="#d4d4d8" strokeWidth="0.3" />
                    </g>
                  )}

                  {/* Feature Label on Hover/Selected */}
                  {isSelected && (
                    <text y={feature.size * 0.7 + 2} textAnchor="middle" fill="#7dd3fc" fontSize="2" fontWeight="600" className="pointer-events-none">
                      {feature.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Placed Plants with Dynamic Seasonal Attributes */}
            {garden.plants.map((plant) => {
              const visual = getPlantVisual(plant, season);
              const isSelected = selectedPlantId === plant.id;
              const radius = plant.spreadRadius * 0.65;

              return (
                <g
                  key={plant.id}
                  transform={`translate(${plant.gridX}, ${plant.gridY})`}
                  className="cursor-move"
                  onPointerDown={(e) => handlePointerDown('plant', plant.id, e)}
                  filter="url(#plant-shadow)"
                >
                  {/* Selection Indicator Ring */}
                  {isSelected && (
                    <circle r={radius + 1.8} fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="1.2, 0.8" />
                  )}

                  {/* Spread Canopy Circle */}
                  <circle
                    r={radius}
                    fill={visual.canopyColor}
                    stroke={visual.borderColor}
                    strokeWidth="0.4"
                    opacity={visual.foliageDensity}
                  />

                  {/* Botanical Texture Petal Ring / Branch Fractal */}
                  {season === 'winter' && visual.snowCover && (
                    <g>
                      {/* Bare branches for deciduous */}
                      {!plant.commonName.toLowerCase().includes('boxwood') &&
                        !plant.commonName.toLowerCase().includes('pine') && (
                          <g stroke="#6b7280" strokeWidth="0.35">
                            <line x1="0" y1="0" x2={radius * 0.7} y2={-radius * 0.6} />
                            <line x1="0" y1="0" x2={-radius * 0.6} y2={-radius * 0.5} />
                            <line x1="0" y1="0" x2={radius * 0.5} y2={radius * 0.6} />
                            <line x1="0" y1="0" x2={-radius * 0.7} y2={radius * 0.4} />
                          </g>
                        )}
                      {/* Snow cap atop crown */}
                      <circle cx="0" cy={-radius * 0.2} r={radius * 0.55} fill="#f1f5f9" opacity="0.9" />
                      <circle cx={radius * 0.3} cy={radius * 0.1} r={radius * 0.35} fill="#ffffff" opacity="0.85" />
                    </g>
                  )}

                  {/* Spring Tender Leaf & Bud Accents */}
                  {season === 'spring' && (
                    <g>
                      <circle cx={-radius * 0.3} cy={-radius * 0.3} r={radius * 0.22} fill={visual.flowerColor} opacity="0.85" />
                      <circle cx={radius * 0.35} cy={-radius * 0.2} r={radius * 0.2} fill={visual.flowerColor} opacity="0.85" />
                      <circle cx="0" cy={radius * 0.35} r={radius * 0.25} fill={visual.flowerColor} opacity="0.85" />
                      <circle cx="0" cy="0" r={radius * 0.3} fill="#a3e635" opacity="0.75" />
                    </g>
                  )}

                  {/* Summer Full Saturated Flower Head Blooms */}
                  {season === 'summer' && (
                    <g>
                      <circle cx="0" cy="0" r={radius * 0.45} fill={visual.flowerColor} opacity="0.95" />
                      <circle cx={-radius * 0.35} cy={0} r={radius * 0.28} fill={visual.flowerColor} opacity="0.8" />
                      <circle cx={radius * 0.35} cy={0} r={radius * 0.28} fill={visual.flowerColor} opacity="0.8" />
                      <circle cx="0" cy={-radius * 0.35} r={radius * 0.28} fill={visual.flowerColor} opacity="0.8" />
                      <circle cx="0" cy={radius * 0.35} r={radius * 0.28} fill={visual.flowerColor} opacity="0.8" />
                      <circle cx="0" cy="0" r={radius * 0.18} fill="#fef08a" />
                    </g>
                  )}

                  {/* Fall Amber / Seed Pod Centers */}
                  {season === 'fall' && (
                    <g>
                      <circle cx="0" cy="0" r={radius * 0.35} fill="#78350f" opacity="0.85" />
                      <circle cx={-radius * 0.3} cy={-radius * 0.2} r={radius * 0.25} fill="#fb923c" opacity="0.8" />
                      <circle cx={radius * 0.3} cy={radius * 0.2} r={radius * 0.25} fill="#f97316" opacity="0.8" />
                    </g>
                  )}

                  {/* Center Core Node */}
                  <circle cx="0" cy="0" r="0.8" fill="#13231a" />

                  {/* Hover or Selected Text Tag */}
                  {isSelected && (
                    <text y={radius + 2.8} textAnchor="middle" fill="#34d399" fontSize="2.2" fontWeight="600" className="pointer-events-none drop-shadow">
                      {plant.commonName}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Compass Rose & Scale Bar */}
            <g transform="translate(90, 8)" opacity="0.8">
              <circle r="4" fill="#142119" stroke="#2b4736" strokeWidth="0.4" />
              <path d="M 0 -3.2 L 1.2 0 L 0 0.8 L -1.2 0 Z" fill="#ef4444" />
              <path d="M 0 3.2 L 1.2 0 L 0 -0.8 L -1.2 0 Z" fill="#9ca3af" />
              <text y="-4.6" textAnchor="middle" fill="#f8fafc" fontSize="2" fontWeight="bold">
                N
              </text>
            </g>

            {/* Sunlight Vector Indicator */}
            <g transform="translate(10, 8)" opacity="0.85">
              <circle r="3.2" fill="#1a271f" stroke="#3b5e48" strokeWidth="0.3" />
              <Sun className="w-2.5 h-2.5" />
              <text x="5" y="0.8" fill="#e2e8f0" fontSize="1.8" fontWeight="500">
                {shadow.sunAngle}
              </text>
            </g>

            {/* Imperial Scale indicator */}
            <g transform="translate(8, 94)" opacity="0.8">
              <line x1="0" y1="0" x2="15" y2="0" stroke="#6ee7b7" strokeWidth="0.5" />
              <line x1="0" y1="-1" x2="0" y2="1" stroke="#6ee7b7" strokeWidth="0.5" />
              <line x1="15" y1="-1" x2="15" y2="1" stroke="#6ee7b7" strokeWidth="0.5" />
              <text x="7.5" y="-1.5" textAnchor="middle" fill="#a7f3d0" fontSize="1.6" fontFamily="monospace">
                10 FEET
              </text>
            </g>
          </svg>

          {/* Quick Add Plant Floating Action */}
          <button
            onClick={onOpenPlantCatalog}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg transition-transform active:scale-95 border border-emerald-400/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Plant to Blueprint</span>
          </button>
        </div>

        {/* Blueprint Metadata Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 px-1">
          <div className="flex items-center gap-2">
            <span className="text-neutral-200 font-medium">{garden.style} Style</span>
            <span aria-hidden="true">·</span>
            <span>Dimensions: {garden.dimensions}</span>
            <span aria-hidden="true">·</span>
            <span>{garden.plants.length} Botanical Specimens</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Maintenance:</span>
            <span className="text-emerald-400 font-medium">{garden.maintenanceScore}</span>
          </div>
        </div>
      </div>

      {/* Side Inspector & Guide Drawer */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Selected Item Card */}
        {selectedPlant ? (
          <div className="bg-[#121c17] border border-[#233a2d] rounded-2xl p-4.5 flex flex-col gap-3.5 shadow-xl">
            <div className="flex items-start justify-between gap-2 border-b border-[#1f3327] pb-3">
              <div>
                <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
                  {selectedPlant.type}
                </span>
                <h3 className="text-base font-semibold text-neutral-100 mt-0.5">
                  {selectedPlant.commonName}
                </h3>
                <p className="text-xs italic text-neutral-400">{selectedPlant.botanicalName}</p>
              </div>
              <button
                onClick={handleDeleteItem}
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Remove plant from garden"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#0b1410] p-2 rounded-lg border border-[#1a2d21]">
                <span className="text-[11px] text-neutral-400 block">Height</span>
                <span className="font-medium text-neutral-200">{selectedPlant.height}</span>
              </div>
              <div className="bg-[#0b1410] p-2 rounded-lg border border-[#1a2d21]">
                <span className="text-[11px] text-neutral-400 block">Spread Radius</span>
                <span className="font-medium text-neutral-200">{selectedPlant.spreadRadius} ft</span>
              </div>
              <div className="bg-[#0b1410] p-2 rounded-lg border border-[#1a2d21]">
                <span className="text-[11px] text-neutral-400 block">Sunlight</span>
                <span className="font-medium text-neutral-200">{selectedPlant.sunlightNeed}</span>
              </div>
              <div className="bg-[#0b1410] p-2 rounded-lg border border-[#1a2d21]">
                <span className="text-[11px] text-neutral-400 block">Watering</span>
                <span className="font-medium text-neutral-200">{selectedPlant.waterNeed}</span>
              </div>
            </div>

            {/* Current Season Behavior Highlight */}
            <div className="bg-[#0c1511] p-3 rounded-xl border border-emerald-800/30">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 capitalize mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Behavior in {season}:</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {selectedPlant.seasonalAttributes[season]}
              </p>
            </div>

            {/* Companion Synergies */}
            {selectedPlant.companionPlants.length > 0 && (
              <div>
                <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">
                  Symbiotic Companions:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs text-neutral-300">
                  {selectedPlant.companionPlants.map((companion, i) => (
                    <span key={i} className="text-xs bg-[#17291f] text-emerald-300 px-2 py-0.5 rounded border border-[#243d30]">
                      {companion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Care Summary */}
            <div className="text-xs text-neutral-400 border-t border-[#1a2c21] pt-3">
              <span className="font-medium text-neutral-300 block mb-0.5">Horticultural Care:</span>
              <p className="leading-relaxed">{selectedPlant.careSummary}</p>
            </div>
          </div>
        ) : selectedFeature ? (
          <div className="bg-[#121c17] border border-[#233a2d] rounded-2xl p-4.5 flex flex-col gap-3 shadow-xl">
            <div className="flex items-start justify-between gap-2 border-b border-[#1f3327] pb-3">
              <div>
                <span className="text-[11px] font-medium text-sky-400 uppercase tracking-wider">
                  Hardscape Feature
                </span>
                <h3 className="text-base font-semibold text-neutral-100 mt-0.5">
                  {selectedFeature.name}
                </h3>
              </div>
              <button
                onClick={handleDeleteItem}
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">{selectedFeature.description}</p>
          </div>
        ) : (
          <div className="bg-[#121c17] border border-[#233a2d] rounded-2xl p-4.5 flex flex-col gap-3 shadow-xl">
            <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Landscape Blueprint Tips</span>
            </h3>
            <ul className="text-xs text-neutral-400 flex flex-col gap-2 leading-relaxed">
              <li>
                <strong className="text-neutral-200">Drag to Arrange:</strong> Click and drag any plant or feature node directly on the canvas to reorganize your space.
              </li>
              <li>
                <strong className="text-neutral-200">Seasonal Transformation:</strong> Switch between Spring, Summer, Autumn, and Winter in the top bar to watch the foliage, flower blooms, and snow cover adapt in real time.
              </li>
              <li>
                <strong className="text-neutral-200">Companion Synergies:</strong> Green dashed lines show plants that naturally protect or fertilize each other.
              </li>
              <li>
                <strong className="text-neutral-200">Sunlight Path:</strong> Toggle East 9AM, Noon, and West 5PM to check how shadows fall across your outdoor living zones.
              </li>
            </ul>

            <button
              onClick={onOpenPlantCatalog}
              className="mt-2 w-full py-2 px-3 text-xs font-semibold bg-[#1a2e23] hover:bg-[#233d2f] text-emerald-300 rounded-lg border border-[#2b4c39] transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Browse Plant Catalog</span>
            </button>
          </div>
        )}

        {/* Garden Philosophy Card */}
        <div className="bg-[#121c17] border border-[#233a2d] rounded-2xl p-4.5 flex flex-col gap-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Design Philosophy
          </h4>
          <p className="text-xs text-neutral-300 leading-relaxed italic">
            "{garden.concept}"
          </p>
          <div className="text-[11px] text-neutral-400 border-t border-[#1c2e24] pt-2 mt-1">
            <span className="font-medium text-neutral-300">Palette: </span>
            {garden.paletteDescription}
          </div>
        </div>
      </div>
    </div>
  );
};
