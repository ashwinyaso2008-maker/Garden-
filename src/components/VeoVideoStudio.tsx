import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Upload,
  Play,
  Pause,
  Download,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Camera,
  CheckCircle2,
  Maximize2,
  Clock,
  Layers,
} from 'lucide-react';
import { SavedImage, SavedVideo } from '../types/garden';

interface VeoVideoStudioProps {
  initialImage: string | null;
  savedImages: SavedImage[];
  savedVideos: SavedVideo[];
  onSaveVideo: (video: SavedVideo) => void;
}

export const VeoVideoStudio: React.FC<VeoVideoStudioProps> = ({
  initialImage,
  savedImages,
  savedVideos,
  onSaveVideo,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState(
    'A cinematic slow camera glide forward along the garden stone path, sunlight filtering through tree leaves, vibrant flowers gently swaying in the soft breeze, 4k photorealistic garden walkthrough.'
  );

  // Video Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Video Playback
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If initialImage changed from outside (e.g. sent from Image Studio or Seasonal View)
  useEffect(() => {
    if (initialImage) {
      setSelectedImage(initialImage);
    }
  }, [initialImage]);

  const cameraWalkthroughPrompts = [
    'A cinematic slow camera glide forward along the stone path, sunlight filtering through leaves, flowers gently swaying in the breeze.',
    'Gentle drone aerial descent into this dream garden, water glistening in the fountain, golden hour warmth.',
    'Time-lapse of morning mist lifting over this blooming garden as flowers open to the morning sun.',
    'Slow panoramic camera pan across the seating patio, capturing butterflies fluttering around lavender and roses.',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setSelectedImage(result);
    };
    reader.readAsDataURL(file);
  };

  // 3-step Veo Generation: Start -> Poll -> Download
  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      setErrorMessage('Please upload a photo or choose an image from your garden renders.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationStep(1);
    setStatusMessage('Step 1/4: Initializing Veo 3.1 Fast video generation...');

    let operationName = '';

    try {
      // Step 1: Start video operation
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio, // 16:9 or 9:16
          image: selectedImage,
        }),
      });

      const startData = await startRes.json();
      if (!startData.success || !startData.operationName) {
        throw new Error(startData.error || 'Failed to initiate video generation');
      }

      operationName = startData.operationName;
      setGenerationStep(2);
      setStatusMessage('Step 2/4: Synthesizing camera motion vectors & botanical lighting...');

      // Step 2: Poll operation status every 5 seconds
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 60; // 5 mins max

      while (!isDone && attempts < maxAttempts) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 5000));

        if (attempts === 3) {
          setGenerationStep(3);
          setStatusMessage('Step 3/4: Rendering swaying flowers, leaf physics, and sunlight rays...');
        } else if (attempts === 6) {
          setStatusMessage('Step 3/4: Refining continuous camera path & depth stabilization...');
        }

        const pollRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        const pollData = await pollRes.json();
        if (pollData.error) {
          throw new Error(pollData.error);
        }

        if (pollData.done) {
          isDone = true;
        }
      }

      if (!isDone) {
        throw new Error('Video generation timed out. Please try again.');
      }

      // Step 3: Download video
      setGenerationStep(4);
      setStatusMessage('Step 4/4: Downloading finalized MP4 video stream...');

      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!downloadRes.ok) {
        throw new Error('Failed to retrieve video stream from server');
      }

      const blob = await downloadRes.blob();
      const videoObjectUrl = URL.createObjectURL(blob);

      setCurrentVideoUrl(videoObjectUrl);

      const newVideo: SavedVideo = {
        id: `veo-${Date.now()}`,
        url: videoObjectUrl,
        prompt,
        aspectRatio,
        createdAt: new Date().toLocaleTimeString(),
        thumbnailUrl: selectedImage,
      };

      onSaveVideo(newVideo);
      setStatusMessage('Video walkthrough ready!');
    } catch (err: any) {
      console.error('Veo video generation error:', err);
      setErrorMessage(
        err.message ||
          'Video generation could not complete. Please check that a Gemini API key with Veo access is configured in Settings > Secrets.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1c2e24] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Powered by veo-3.1-fast-generate-preview
          </span>
          <h2 className="text-2xl lg:text-3xl font-serif font-bold text-neutral-100 mt-1">
            Veo Cinematic Garden Walkthrough
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Transform any garden photograph or rendered dream layout into an immersive, living video walkthrough with realistic wind physics, swaying blooms, and smooth camera motion.
          </p>
        </div>

        {/* Aspect Ratio Selector (Mandatory 16:9 or 9:16) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#101c15] border border-[#233c2f] rounded-xl self-start md:self-auto">
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              aspectRatio === '16:9'
                ? 'bg-amber-950 text-amber-200 border border-amber-700 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>16:9 Landscape</span>
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              aspectRatio === '9:16'
                ? 'bg-amber-950 text-amber-200 border border-amber-700 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>9:16 Portrait</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Input Configuration Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <form
            onSubmit={handleGenerateVideo}
            className="bg-[#121c17] border border-[#233b2d] rounded-2xl p-5 flex flex-col gap-4 shadow-xl"
          >
            {/* 1. Upload or Select Source Photo */}
            <div>
              <label className="text-xs font-semibold text-neutral-200 block mb-1.5">
                1. Upload Photo or Select Garden Image
              </label>

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
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Upload Garden Photo from Device</span>
              </button>

              {/* Saved session images selector */}
              {savedImages.length > 0 && (
                <div className="mt-2.5">
                  <span className="text-[11px] text-neutral-400 block mb-1">
                    Or select from your generated views:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {savedImages.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setSelectedImage(img.url)}
                        className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          selectedImage === img.url
                            ? 'border-amber-400 scale-105 shadow-md'
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

            {/* Selected Image Preview Thumbnail */}
            {selectedImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-[#243c2f] bg-black">
                <img src={selectedImage} alt="Selected source" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] text-amber-300 font-medium backdrop-blur-sm">
                  Source Image Ready
                </div>
              </div>
            )}

            {/* 2. Walkthrough Camera Motion Prompt */}
            <div>
              <label className="text-xs font-semibold text-neutral-200 block mb-1.5">
                2. Camera Walkthrough & Cinematic Prompt
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the camera path, motion speed, wind, and lighting..."
                className="w-full bg-[#0c1410] border border-[#23392d] rounded-xl p-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                required
              />
            </div>

            {/* Quick Walkthrough Presets */}
            <div>
              <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">
                Cinematography Styles:
              </span>
              <div className="flex flex-col gap-1.5">
                {cameraWalkthroughPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-left text-[11px] text-neutral-300 hover:text-amber-300 bg-[#0c1410] hover:bg-[#15231c] border border-[#1f3327] rounded-lg p-2 transition-colors line-clamp-1"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Generation Button */}
            <button
              type="submit"
              disabled={isGenerating || !selectedImage}
              className="mt-2 w-full py-2.5 px-4 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-[#17130a] rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-900" />
                  <span>Generating Video with Veo 3.1...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 text-amber-950" />
                  <span>Generate Veo Walkthrough ({aspectRatio})</span>
                </>
              )}
            </button>
          </form>

          {/* Reassuring Generation Progress Bar */}
          {isGenerating && (
            <div className="bg-[#121c17] border border-amber-800/40 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Veo Video Generation in Progress</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">{statusMessage}</p>

              {/* Progress Steps */}
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      generationStep >= step ? 'bg-amber-400' : 'bg-[#1b2d23]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-neutral-400">
                Veo video synthesis typically takes 30 to 60 seconds. Please keep this tab active.
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold block">Veo Notice:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Video Player Viewport Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div
            className={`relative w-full rounded-2xl overflow-hidden border-2 border-[#20362b] bg-[#0c1410] shadow-2xl flex items-center justify-center ${
              aspectRatio === '9:16' ? 'aspect-[9/16] max-w-sm mx-auto' : 'aspect-video'
            }`}
          >
            {currentVideoUrl ? (
              <video
                ref={videoRef}
                src={currentVideoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-8 text-center flex flex-col items-center gap-3 text-neutral-400">
                <div className="w-14 h-14 rounded-2xl bg-[#14231b] border border-[#233c2e] flex items-center justify-center text-amber-400">
                  <Film className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-neutral-200">Veo Video Viewport</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mt-0.5">
                    Your generated walkthrough video will render and loop here in full HD resolution.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar for Current Video */}
          {currentVideoUrl && (
            <div className="flex items-center justify-between bg-[#121c17] border border-[#233b2d] rounded-xl p-3 text-xs">
              <span className="text-neutral-300 font-medium">Veo Walkthrough Ready ({aspectRatio})</span>
              <a
                href={currentVideoUrl}
                download="verdant-garden-walkthrough.mp4"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </a>
            </div>
          )}

          {/* Video Session Archive */}
          {savedVideos.length > 0 && (
            <div className="bg-[#111c16] border border-[#21382b] rounded-2xl p-4.5 flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                Session Videos ({savedVideos.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {savedVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setCurrentVideoUrl(vid.url)}
                    className="relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-[#20362b] hover:border-amber-400 transition-all group"
                  >
                    <img
                      src={vid.thumbnailUrl || ''}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/75 text-[10px] text-white px-1.5 rounded">
                      {vid.aspectRatio}
                    </span>
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
