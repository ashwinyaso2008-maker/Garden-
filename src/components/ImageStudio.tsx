import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Wand2,
  Upload,
  Image as ImageIcon,
  Film,
  Download,
  RefreshCw,
  AlertCircle,
  Eye,
  Check,
  Maximize2,
  Sliders,
  Compass,
} from 'lucide-react';
import { GardenBlueprint, SavedImage } from '../types/garden';

interface ImageStudioProps {
  garden: GardenBlueprint;
  savedImages: SavedImage[];
  onSaveImage: (img: SavedImage) => void;
  onSendToVideoStudio: (imageUrl: string) => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({
  garden,
  savedImages,
  onSaveImage,
  onSendToVideoStudio,
}) => {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState(
    `A breathtaking eye-level view of ${garden.gardenName}, an ${garden.style} style dream garden, with flagstone path leading towards a cozy seating area, surrounded by blooming roses, lavender, and lush shrubbery, warm golden hour afternoon sunlight.`
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  const [vantagePoint, setVantagePoint] = useState('Eye-Level Walking Perspective');
  const [timeOfDay, setTimeOfDay] = useState('Golden Hour Sunset');

  // Edit Mode States
  const [selectedBaseImage, setSelectedBaseImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<SavedImage | null>(null);

  // Quick Inspiration Prompts
  const createPromptSuggestions = [
    `Sunset view along the curved flagstone path looking towards the wisteria pergola with warm twilight fairy lights.`,
    `High-angle aerial drone view of ${garden.gardenName} showing formal layout geometry and stone fountain.`,
    `Close-up intimate seating bench surrounded by blooming hydrangeas, purple salvia, and fluttering butterflies.`,
    `Dramatic twilight garden illuminated with warm architectural floor up-lights on ornamental grasses and water reflection.`,
  ];

  const editPromptSuggestions = [
    `Add a carved stone birdbath surrounded by purple salvia in the center.`,
    `Add a weathered oak pergola with blooming wisteria hanging over the pathway.`,
    `Change the gravel path to rustic Cotswold stone stepping pavers with creeping thyme.`,
    `Add warm bistro fairy string lights draped across the trees and seating area.`,
    `Add a tranquil natural stone pond with water lilies and a gentle trickling waterfall.`,
  ];

  // Handle local file upload for editing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setSelectedBaseImage(result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Generation or Edit request to server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const activePrompt = mode === 'create' ? `${prompt} Vantage: ${vantagePoint}. Lighting: ${timeOfDay}.` : editPrompt;

      if (!activePrompt.trim()) {
        throw new Error('Please enter a descriptive prompt');
      }

      if (mode === 'edit' && !selectedBaseImage) {
        throw new Error('Please upload or select an existing garden image to edit');
      }

      const response = await fetch('/api/garden/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt,
          mode,
          baseImage: mode === 'edit' ? selectedBaseImage : undefined,
          aspectRatio,
          imageSize: '1K',
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      const newImage: SavedImage = {
        id: `img-${Date.now()}`,
        url: data.imageUrl,
        prompt: activePrompt,
        mode,
        createdAt: new Date().toLocaleTimeString(),
        aspectRatio,
      };

      onSaveImage(newImage);
      setActivePreviewImage(newImage);

      // If in edit mode, set the new image as current selection for progressive editing
      if (mode === 'edit') {
        setSelectedBaseImage(data.imageUrl);
      }
    } catch (err: any) {
      console.error('Image Studio error:', err);
      setErrorMessage(err.message || 'Image generation failed. Verify API key in Settings > Secrets.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1c2e24] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Powered by gemini-3.1-flash-image-preview
          </span>
          <h2 className="text-2xl lg:text-3xl font-serif font-bold text-neutral-100 mt-1">
            AI Landscape Visual Studio
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Generate photorealistic perspectives of your dream garden from text descriptions, or upload and transform existing garden photos with intelligent AI editing.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#101c15] border border-[#233c2f] rounded-xl self-start md:self-auto">
          <button
            onClick={() => setMode('create')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'create'
                ? 'bg-emerald-900 text-emerald-200 border border-emerald-700 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-[#16271e]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Create New View</span>
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'edit'
                ? 'bg-emerald-900 text-emerald-200 border border-emerald-700 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-[#16271e]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Edit Garden Image</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#121c17] border border-[#233b2d] rounded-2xl p-5 flex flex-col gap-4 shadow-xl"
          >
            {mode === 'create' ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-neutral-200 block mb-1.5">
                    Dream Garden Prompt
                  </label>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your desired garden view in rich detail..."
                    className="w-full bg-[#0c1410] border border-[#23392d] rounded-xl p-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                    required
                  />
                </div>

                {/* Suggestion Chips */}
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">
                    Quick Inspiration:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {createPromptSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(s)}
                        className="text-left text-[11px] text-neutral-300 hover:text-emerald-300 bg-[#0c1410] hover:bg-[#15231c] border border-[#1f3327] rounded-lg p-2 transition-colors line-clamp-1"
                      >
                        "{s}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vantage Point & Lighting */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Vantage Point</label>
                    <select
                      value={vantagePoint}
                      onChange={(e) => setVantagePoint(e.target.value)}
                      className="w-full bg-[#0c1410] border border-[#23392d] rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option>Eye-Level Walking Perspective</option>
                      <option>High-Angle Drone Overview</option>
                      <option>Seated Patio Bench View</option>
                      <option>Close-Up Macro Blossom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Atmosphere / Lighting</label>
                    <select
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                      className="w-full bg-[#0c1410] border border-[#23392d] rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option>Golden Hour Sunset</option>
                      <option>Crisp Morning Dawn</option>
                      <option>Dappled Midday Sunlight</option>
                      <option>Twilight with Fairy Lights</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              /* Edit Mode Form */
              <>
                <div>
                  <label className="text-xs font-semibold text-neutral-200 block mb-1.5">
                    1. Select Image to Edit
                  </label>
                  <div className="flex flex-col gap-2">
                    {/* Upload button */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-[#0c1410] hover:bg-[#16271e] text-neutral-300 border border-dashed border-[#2b4c38] rounded-xl text-xs transition-colors"
                    >
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Upload Photo from Device</span>
                    </button>

                    {/* Or Pick from recent images */}
                    {savedImages.length > 0 && (
                      <div>
                        <span className="text-[11px] text-neutral-400 block my-1">
                          Or pick from created views:
                        </span>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {savedImages.map((img) => (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => setSelectedBaseImage(img.url)}
                              className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-transform active:scale-95 ${
                                selectedBaseImage === img.url
                                  ? 'border-emerald-400 scale-105'
                                  : 'border-[#22392d] opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Instructions */}
                <div>
                  <label className="text-xs font-semibold text-neutral-200 block mb-1.5">
                    2. AI Edit Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g. Add a stone birdbath in the center, add climbing roses to the wall..."
                    className="w-full bg-[#0c1410] border border-[#23392d] rounded-xl p-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                    required
                  />
                </div>

                {/* Edit Suggestion Chips */}
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">
                    Popular Edits:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {editPromptSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditPrompt(s)}
                        className="text-left text-[11px] text-neutral-300 hover:text-emerald-300 bg-[#0c1410] hover:bg-[#15231c] border border-[#1f3327] rounded-lg p-2 transition-colors line-clamp-1"
                      >
                        "{s}"
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Aspect Ratio Selector */}
            <div className="border-t border-[#1c2e24] pt-3">
              <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">
                Output Aspect Ratio
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['16:9', '4:3', '1:1'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                        : 'bg-[#0c1410] border-[#22392d] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {ratio} {ratio === '16:9' ? '(Cinematic)' : ratio === '4:3' ? '(Standard)' : '(Square)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 px-4 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-[#09150f] rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing with Gemini 3.1 Flash Image...</span>
                </>
              ) : (
                <>
                  {mode === 'create' ? <Sparkles className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                  <span>{mode === 'create' ? 'Generate Garden View' : 'Apply AI Edit to Image'}</span>
                </>
              )}
            </button>
          </form>

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <span className="font-semibold block">Generation Error:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Active Preview & Viewport Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Active Preview Frame */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-[#20362b] bg-[#0c1410] shadow-2xl flex items-center justify-center group">
            {activePreviewImage ? (
              <img
                src={activePreviewImage.url}
                alt="Active Garden Preview"
                className="w-full h-full object-cover"
              />
            ) : mode === 'edit' && selectedBaseImage ? (
              <div className="relative w-full h-full">
                <img src={selectedBaseImage} alt="Base Image to Edit" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-white font-medium border border-white/10">
                  Ready for AI Editing
                </div>
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center gap-3 text-neutral-400">
                <div className="w-14 h-14 rounded-2xl bg-[#14231b] border border-[#233c2e] flex items-center justify-center text-emerald-400">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-neutral-200">Studio Viewport</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mt-0.5">
                    Generated or edited visual representations will render here in high-resolution detail.
                  </p>
                </div>
              </div>
            )}

            {/* In-Frame Actions */}
            {activePreviewImage && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={() => onSendToVideoStudio(activePreviewImage.url)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-xs font-medium border border-white/20 shadow-md backdrop-blur-sm transition-colors"
                >
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  <span>Animate with Veo</span>
                </button>
                <a
                  href={activePreviewImage.url}
                  download="verdant-garden-render.png"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-xs font-medium border border-white/20 shadow-md backdrop-blur-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            )}
          </div>

          {/* Active Image Prompt Information */}
          {activePreviewImage && (
            <div className="bg-[#121c17] border border-[#233b2d] rounded-xl p-3.5 text-xs">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Render Prompt:
              </span>
              <p className="text-neutral-300 leading-relaxed italic">"{activePreviewImage.prompt}"</p>
            </div>
          )}

          {/* Gallery of Session Images */}
          {savedImages.length > 0 && (
            <div className="bg-[#111c16] border border-[#21382b] rounded-2xl p-4.5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#1f3327] pb-2.5">
                <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  Session Gallery ({savedImages.length})
                </h4>
                <span className="text-[11px] text-neutral-400">Click any image to view or animate</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {savedImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setActivePreviewImage(img)}
                    className={`group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      activePreviewImage?.id === img.id
                        ? 'border-emerald-400 shadow-md'
                        : 'border-[#20362b] hover:border-emerald-600/70'
                    }`}
                  >
                    <img src={img.url} alt="Gallery item" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
