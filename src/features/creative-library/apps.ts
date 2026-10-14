// The apps in the Asset Library's app picker. Their ids match `apps` in
// data/db.json, which is where a creative's app comes from.

export type App = {
  id: string;
  name: string;
  /** App icon in public/appLogos; apps without one show their initials. */
  icon?: string;
  /** The art is a mark on a transparent or white background, not a full-bleed icon. */
  mark?: boolean;
};

export const APPS: App[] = [
  { id: "aivideo", name: "AI Video", icon: "/appLogos/AI%20video.png", mark: true },
  { id: "casaai", name: "Casa AI", icon: "/appLogos/Casa%20AI.png" },
  { id: "faceswap", name: "Face Swap", icon: "/appLogos/Face%20Swap.png", mark: true },
  { id: "hairapp", name: "Hair App", icon: "/appLogos/Hair%20App.png" },
  { id: "lensai", name: "Lens AI", icon: "/appLogos/Lens%20AI.jpg", mark: true },
  { id: "modyfy", name: "Modyfy", icon: "/appLogos/Modyfy.png", mark: true },
  { id: "refix", name: "Refix", icon: "/appLogos/Refix.png" },
  { id: "tuneai", name: "Tune AI", icon: "/appLogos/Tune%20ai.png" },
  { id: "tattooai", name: "Tattoo AI", icon: "/appLogos/tattoo%20ai.png" },
];

/** "All Apps" (the home view) or one app. */
export const ALL_APPS = "all";
export const DEFAULT_APP = ALL_APPS;
/** The app the sample generators and their breadcrumbs belong to. */
export const HAIR_APP = "hairapp";
export const TOP_CREATIVE_SLOTS = 20;

export const getApp = (id: string) => APPS.find((a) => a.id === id.toLowerCase());
export const appName = (id: string) => getApp(id)?.name ?? id;
