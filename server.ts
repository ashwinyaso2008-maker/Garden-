import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to strip data:image/...;base64, prefix
function extractBase64(dataUri: string): { data: string; mimeType: string } {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/png', data: dataUri };
}

// -------------------------------------------------------------
// Endpoint 1: Generate Garden Layout & Botanical Blueprint
// -------------------------------------------------------------
app.post('/api/garden/generate-layout', async (req, res) => {
  try {
    const {
      style = 'English Cottage',
      dimensions = '30ft x 40ft',
      sunlight = 'Full Sun (6+ hours)',
      soilType = 'Rich Loamy Soil',
      climateZone = 'Zone 6-8 (Temperate)',
      featuresWanted = ['Flagstone Path', 'Flower Borders', 'Seating Bench', 'Water Feature'],
      additionalNotes = '',
    } = req.body;

    const systemPrompt = `You are an elite master landscape architect and horticultural designer.
Create a comprehensive, architecturally grounded garden blueprint based on the user's preferences.
The blueprint must specify:
1. An inspiring garden name and design philosophy.
2. Distinct spatial zones for a 100x100 relative coordinate system (e.g. Lawn, Flowerbeds, Flagstone Patio, Water Pond, Gravel Walkways, Shrub Border).
3. Exact plant placements with coordinate points (gridX: 5-95, gridY: 5-95), spread radius (5-15 units), height, sunlight/water needs, bloom period, and SPECIFIC seasonal transformations across all 4 seasons (Spring, Summer, Fall, Winter).
4. Hardscaping focal points (pergolas, benches, water features, urns).
5. Seasonal maintenance and evolution guide.`;

    const userPrompt = `Design a dream garden with the following specifications:
- Garden Aesthetic Style: ${style}
- Property Dimensions: ${dimensions}
- Sunlight Exposure: ${sunlight}
- Soil Condition: ${soilType}
- Climate / Hardiness Zone: ${climateZone}
- Desired Architectural Features: ${featuresWanted.join(', ')}
${additionalNotes ? `- Client Preferences: ${additionalNotes}` : ''}

Output a strictly valid JSON object matching the requested schema with realistic botanical names, complementary companion plants, and rich 4-season descriptions.`;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gardenName: { type: Type.STRING },
            style: { type: Type.STRING },
            concept: { type: Type.STRING },
            paletteDescription: { type: Type.STRING },
            zones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'lawn, bed, patio, path, pond, hedge, pergola' },
                  x: { type: Type.NUMBER, description: '0-100 percentage relative coordinate' },
                  y: { type: Type.NUMBER, description: '0-100 percentage relative coordinate' },
                  width: { type: Type.NUMBER },
                  height: { type: Type.NUMBER },
                  surfaceMaterial: { type: Type.STRING },
                  colorTone: { type: Type.STRING },
                },
                required: ['id', 'name', 'type', 'x', 'y', 'width', 'height', 'surfaceMaterial', 'colorTone'],
              },
            },
            plants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  commonName: { type: Type.STRING },
                  botanicalName: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'perennial, shrub, tree, grass, herb, climber, bulb' },
                  gridX: { type: Type.NUMBER, description: '5-95' },
                  gridY: { type: Type.NUMBER, description: '5-95' },
                  spreadRadius: { type: Type.NUMBER, description: 'Spread in grid units, usually 4-12' },
                  height: { type: Type.STRING },
                  sunlightNeed: { type: Type.STRING },
                  waterNeed: { type: Type.STRING },
                  bloomSeason: { type: Type.STRING },
                  bloomColor: { type: Type.STRING },
                  seasonalAttributes: {
                    type: Type.OBJECT,
                    properties: {
                      spring: { type: Type.STRING, description: 'Foliage bud burst, spring blooms, fresh lime green' },
                      summer: { type: Type.STRING, description: 'Peak lush canopy, vibrant flowers, dense foliage' },
                      fall: { type: Type.STRING, description: 'Golden/amber/crimson foliage, seed pods, harvest' },
                      winter: { type: Type.STRING, description: 'Architectural bark, evergreen structure, frost/snow interaction' },
                    },
                    required: ['spring', 'summer', 'fall', 'winter'],
                  },
                  companionPlants: { type: Type.ARRAY, items: { type: Type.STRING } },
                  careSummary: { type: Type.STRING },
                },
                required: [
                  'id',
                  'commonName',
                  'botanicalName',
                  'type',
                  'gridX',
                  'gridY',
                  'spreadRadius',
                  'height',
                  'sunlightNeed',
                  'waterNeed',
                  'bloomSeason',
                  'bloomColor',
                  'seasonalAttributes',
                  'companionPlants',
                  'careSummary',
                ],
              },
            },
            features: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'fountain, bench, pergola, firepit, urn, birdbath, sculpture' },
                  gridX: { type: Type.NUMBER },
                  gridY: { type: Type.NUMBER },
                  size: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                },
                required: ['id', 'name', 'type', 'gridX', 'gridY', 'size', 'description'],
              },
            },
            seasonalGuidance: {
              type: Type.OBJECT,
              properties: {
                spring: { type: Type.STRING },
                summer: { type: Type.STRING },
                fall: { type: Type.STRING },
                winter: { type: Type.STRING },
              },
              required: ['spring', 'summer', 'fall', 'winter'],
            },
            maintenanceScore: { type: Type.STRING, description: 'Low, Medium, or High with brief reason' },
            sunlightCompatibility: { type: Type.STRING },
          },
          required: [
            'gardenName',
            'style',
            'concept',
            'paletteDescription',
            'zones',
            'plants',
            'features',
            'seasonalGuidance',
            'maintenanceScore',
            'sunlightCompatibility',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, blueprint: parsedData });
  } catch (error: any) {
    console.error('Error generating garden layout:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate garden layout',
    });
  }
});

// -------------------------------------------------------------
// Endpoint 2: Create & Edit Images using gemini-3.1-flash-image-preview
// -------------------------------------------------------------
app.post('/api/garden/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      mode = 'create', // 'create' | 'edit'
      baseImage, // base64 string if mode === 'edit'
      aspectRatio = '16:9', // '16:9' | '4:3' | '1:1'
      imageSize = '1K',
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured' });
    }

    // Use gemini-3.1-flash-image-preview as requested by user prompt
    // Fall back to gemini-3.1-flash-image or gemini-3.1-flash-lite-image if needed
    const primaryModel = 'gemini-3.1-flash-image-preview';

    let parts: any[] = [];

    if (mode === 'edit' && baseImage) {
      const { data, mimeType } = extractBase64(baseImage);
      parts.push({
        inlineData: {
          data,
          mimeType,
        },
      });
      parts.push({
        text: `You are modifying an existing garden landscape image. Perform the following modification precisely: ${prompt}. Maintain photorealistic landscaping fidelity, consistent lighting, and botanical realism.`,
      });
    } else {
      parts.push({
        text: `High-end landscape architecture photography of a dream garden: ${prompt}. Photorealistic, 8k commercial landscaping magazine grade, rich natural lighting, exquisite botanical details, sharp focus, beautiful depth of field.`,
      });
    }

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: (aspectRatio as any) || '16:9',
            imageSize: imageSize || '1K',
          },
        },
      });
    } catch (err: any) {
      console.warn(`Attempt with ${primaryModel} failed, trying gemini-3.1-flash-image:`, err.message);
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: (aspectRatio as any) || '16:9',
              imageSize: imageSize || '1K',
            },
          },
        });
      } catch (fallbackErr: any) {
        console.warn('Fallback to gemini-3.1-flash-lite-image:', fallbackErr.message);
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: (aspectRatio as any) || '16:9',
            },
          },
        });
      }
    }

    let generatedImageUrl = '';
    const candidates = response?.candidates || [];
    if (candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        success: false,
        error: 'No image data returned from model',
      });
    }

    res.json({
      success: true,
      imageUrl: generatedImageUrl,
      prompt,
      mode,
    });
  } catch (error: any) {
    console.error('Error generating/editing image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image generation failed',
    });
  }
});

// -------------------------------------------------------------
// Endpoint 3: Seasonal Garden View Generator
// -------------------------------------------------------------
app.post('/api/garden/seasonal-render', async (req, res) => {
  try {
    const {
      season = 'summer', // 'spring' | 'summer' | 'fall' | 'winter'
      gardenName = 'Dream Garden',
      style = 'English Cottage',
      keyPlants = [],
      features = [],
      aspectRatio = '16:9',
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured' });
    }

    let seasonalAtmosphere = '';
    if (season === 'spring') {
      seasonalAtmosphere = `Early to mid spring season. Fresh tender lime-green leaf shoots bursting open on shrubs and branches. Early spring flowering bulbs like narcissus, crocuses, and soft pink cherry blossoms in full bloom. Freshly mulched dark damp soil, morning dewdrops glinting on young foliage, clean bright morning sunlight, brisk fresh atmosphere.`;
    } else if (season === 'summer') {
      seasonalAtmosphere = `Peak high summer season. Explosive lush plant canopy, massive vibrant flower heads in full saturated bloom (lavender, hydrangeas, roses, echinacea). Deep rich emerald green foliage, pollinators and bumblebees hovering, golden warm afternoon sunlight, dappled leafy shadows on the stone pathway.`;
    } else if (season === 'fall') {
      seasonalAtmosphere = `Mid to late autumn season. Stunning warm transformation: foliage turning brilliant amber, copper, fiery scarlet, and deep golden yellow. Ornamental grasses with tawny feathery plumes and seedheads. Fallen leaves delicately scattered on stone pavers and gravel. Crisp, low-angled golden hour autumn light, misty atmospheric depth.`;
    } else {
      seasonalAtmosphere = `Peaceful mid-winter season. Crisp dusting of white snow clinging to stone coping, pathway pavers, and garden bench. Striking architectural bare silhouettes of deciduous trees, contrasted against deep green evergreen boxwood and holly shrubs with bright red winter berries. Delicate frost crystals sparkling on dried ornamental seed heads, serene soft winter dusk light with warm garden lanterns glowing.`;
    }

    const promptText = `A stunning photographic landscape rendering of "${gardenName}", an exquisite ${style} garden, specifically captured in the ${season.toUpperCase()} season.
Seasonal Details: ${seasonalAtmosphere}
Key plant varieties visible: ${keyPlants.slice(0, 6).join(', ')}.
Architectural focal points: ${features.slice(0, 3).join(', ')}.
Photorealistic landscaping photograph, 8k resolution, Architectural Digest Landscaping issue, master gardening design.`;

    const parts = [{ text: promptText }];
    const primaryModel = 'gemini-3.1-flash-image-preview';

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: (aspectRatio as any) || '16:9',
            imageSize: '1K',
          },
        },
      });
    } catch (err: any) {
      console.warn(`Primary model failed for seasonal view, falling back:`, err.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: (aspectRatio as any) || '16:9',
            imageSize: '1K',
          },
        },
      });
    }

    let generatedImageUrl = '';
    const candidates = response?.candidates || [];
    if (candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({ success: false, error: 'No image data generated for seasonal view' });
    }

    res.json({
      success: true,
      imageUrl: generatedImageUrl,
      season,
      prompt: promptText,
    });
  } catch (error: any) {
    console.error('Error in seasonal render:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Seasonal rendering failed',
    });
  }
});

// -------------------------------------------------------------
// Endpoint 4: Veo Video Generations (veo-3.1-fast-generate-preview)
// -------------------------------------------------------------
// Step 1: Start Video Generation
app.post('/api/generate-video', async (req, res) => {
  try {
    const {
      prompt = 'A slow, breathtaking cinematic camera walkthrough of this dream garden, sunlight filtering through leaves, gentle breeze moving flowers, 4k ultra-realistic landscape video',
      aspectRatio = '16:9', // '16:9' or '9:16' as mandated!
      image, // optional base64 image
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured' });
    }

    // Supported aspect ratios: 16:9 (landscape) or 9:16 (portrait)
    const validAspect = aspectRatio === '9:16' ? '9:16' : '16:9';

    // Model required: veo-3.1-fast-generate-preview
    const model = 'veo-3.1-fast-generate-preview';

    let videoPayload: any = {
      model,
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: validAspect,
      },
    };

    if (image) {
      const { data, mimeType } = extractBase64(image);
      videoPayload.image = {
        imageBytes: data,
        mimeType: mimeType || 'image/png',
      };
    }

    let operation: any;
    try {
      operation = await ai.models.generateVideos(videoPayload);
    } catch (modelErr: any) {
      console.warn(`Failed with ${model}, falling back to veo-3.1-lite-generate-preview:`, modelErr.message);
      videoPayload.model = 'veo-3.1-lite-generate-preview';
      operation = await ai.models.generateVideos(videoPayload);
    }

    res.json({
      success: true,
      operationName: operation.name,
      aspectRatio: validAspect,
      prompt,
    });
  } catch (error: any) {
    console.error('Error starting Veo video generation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start video generation',
    });
  }
});

// Step 2: Poll Video Status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ success: false, error: 'operationName is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({
      success: true,
      done: !!updated.done,
      error: updated.error ? updated.error.message : null,
    });
  } catch (error: any) {
    console.error('Error polling video operation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check video status',
    });
  }
});

// Step 3: Download Video Stream
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ success: false, error: 'operationName is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ success: false, error: 'Generated video URI not found' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video: ${videoRes.statusText}`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline; filename="garden-walkthrough.mp4"');

    const arrayBuffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Error downloading video:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to download video stream',
    });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`VerdantDream server listening on port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
