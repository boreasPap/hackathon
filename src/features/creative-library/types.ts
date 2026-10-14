export const ITERATION_TYPES = [
  "wallText",
  "voiceover",
  "similarAvatar",
  "avatarVariation",
  "music",
  "template",
] as const;

export type IterationType = (typeof ITERATION_TYPES)[number];

export type JobStatus = "idle" | "running" | "completed" | "failed";

export type MediaType = "image" | "video" | "audio";

export type App = { id: string; name: string };

export type WallText = {
  text: string;
  startSec?: number;
  endSec?: number;
  role?: "hook" | "body" | "cta";
  position?: string;
  style?: string;
  /** Stays on screen across most of the video (a button, a score label). */
  persistent?: boolean;
};

export type VoiceoverSegment = { text: string; startSec?: number; endSec?: number; speaker?: string };

export type Voiceover = {
  script: string;
  speaker?: string;
  segments?: VoiceoverSegment[];
  /** The speech-to-text output before it was cleaned into a script. */
  transcript?: string;
};

export type AvatarCandidate = {
  url: string;
  atSec?: number;
  /** 1–10, how good the frame is as a reference image. */
  score?: number;
  notes?: string;
};

export type Avatar = {
  description: string;
  gender?: string;
  ageRange?: string;
  appearance?: string;
  setting?: string;
  wardrobe?: string;
  framing?: string;
  imageUrl?: string;
  /** The second of the video the avatar image was taken at. */
  frameSec?: number;
  /** Why the analysis picked this frame. */
  reason?: string;
  /** Every frame the analysis considered, best first. */
  candidates?: AvatarCandidate[];
};

export type Music = {
  description: string;
  genre?: string;
  mood?: string;
  energy?: "low" | "medium" | "high";
  tempoBpm?: number;
  /** The original soundtrack (voice + music) as an mp3. */
  audioUrl?: string;
  /** The music without the voice, taken from the stems zip and stored on eachlabs. */
  instrumentalUrl?: string;
  /** Zip of every stem (vocals, bass, drums, instrumental …), as the stem splitter returned it. */
  stemsUrl?: string;
};

export type TemplateScene = {
  index: number;
  startSec?: number;
  endSec?: number;
  description: string;
  onScreenText?: string;
};

export type LayoutRegion = { role: string; x: number; y: number; w: number; h: number };

export type LayoutSegment = { startSec?: number; endSec?: number; layoutType: string; regions: LayoutRegion[] };

export type TemplateFrame = { url: string; atSec?: number; label: string };

export type Template = {
  layout: string;
  aspectRatio?: string;
  durationSec?: number;
  visualStyle?: string;
  scenes?: TemplateScene[];
  layoutSegments?: LayoutSegment[];
  sceneChangesSec?: number[];
  /** When the app end card starts, if the video has one. */
  endCardSec?: number;
  /** Frames every 2 seconds in one image, read left to right, top to bottom. */
  spriteSheetUrl?: string;
  frames?: TemplateFrame[];
};

/** What the analysis workflow returns: the parts of a creative we iterate on. */
export type CreativeExtraction = {
  summary?: string;
  language?: string;
  wallTexts: WallText[];
  voiceover: Voiceover | null;
  avatar: Avatar | null;
  music: Music | null;
  template: Template | null;
};

export type Analysis = {
  status: JobStatus;
  executionId: string | null;
  aiModelId: string | null;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  raw: unknown;
};

export type IterationItem = {
  text?: string;
  title?: string;
  notes?: string;
  url?: string;
  mediaType?: MediaType;
};

export type Iteration = {
  id: string;
  type: IterationType;
  aiModelId: string;
  status: JobStatus;
  executionId: string | null;
  error: string | null;
  prompt: string | null;
  inputs: Record<string, unknown>;
  items: IterationItem[];
  raw: unknown;
  createdAt: string;
  completedAt: string | null;
};

export type CreativeStorage = {
  videoFileId: string | null;
  posterFileId: string | null;
  /** When eachlabs deletes the uploaded files (180 days by default). */
  expiresAt: string | null;
};

export type Creative = {
  id: string;
  app: string;
  tags: string[];
  fileName: string;
  hook: string;
  /** What the page plays: an eachlabs storage URL, or a /public path for the seeded creatives. */
  videoPath: string;
  posterPath: string | null;
  /** Public URL eachlabs can reach (eachlabs storage); sent to the workflows, required for analysis. */
  videoUrl: string | null;
  /** eachlabs storage file ids, set when the creative was added through the form. */
  storage?: CreativeStorage | null;
  createdAt: string;
  updatedAt: string;
  analysis: Analysis;
  extracted: CreativeExtraction | null;
  iterations: Iteration[];
};

export type FavoriteType = "creative" | IterationType;

export type Favorite = {
  id: string;
  creativeId: string;
  type: FavoriteType;
  iterationId: string | null;
  itemIndex: number | null;
  createdAt: string;
};

export type Db = {
  apps: App[];
  creatives: Creative[];
  favorites: Favorite[];
};

export type AiModel = {
  id: string;
  modelType: string;
  /** `musicVideo` is the Music Generator: a video in, the same video with music out. */
  subModelType: "creativeAnalysis" | "musicVideo" | IterationType;
  validationRules: unknown;
  cost: number;
  requestConfig: {
    type: string;
    inputTypes: string[];
    outputTypes: string[];
    customConfig: unknown;
    prompt?: string;
    input?: Record<string, unknown>;
  };
  apiUsageModels: string;
  versionId?: string;
  platform: "eachlabs";
};

/** What a card needs to show a creative, without its analysis and iterations. */
export type CreativeSummary = {
  id: string;
  app: string;
  tags: string[];
  hook: string;
  fileName: string;
  videoPath: string;
  posterPath: string | null;
  analysisStatus: JobStatus;
  iterationCount: number;
};

/** A favorite joined with what it points at. */
export type FavoriteView = {
  favorite: Favorite;
  creative: CreativeSummary | null;
  item: IterationItem | null;
  iterationCreatedAt: string | null;
};
