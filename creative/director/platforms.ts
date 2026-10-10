/**
 * Where a film will be seen, and what that placement demands of it. Every
 * number here changes a decision the director makes: the canvas, how long
 * the film runs, how fast it cuts, how soon it must say something, whether
 * it can lean on sound, where the platform's own buttons cover the frame,
 * and what kind of ending suits it.
 *
 * Values are working production defaults for each placement (frame sizes
 * are the platforms' own; safe areas are where their overlaid UI sits).
 * Tune them here, once, rather than in any film.
 */

export type PlatformId =
  | "instagram-reel"
  | "instagram-feed"
  | "facebook-feed"
  | "facebook-reel"
  | "tiktok"
  | "youtube-short"
  | "pinterest-video";

export type Goal = "awareness" | "consideration" | "conversion";

export type Platform = {
  id: PlatformId;
  label: string;
  width: number;
  height: number;
  fps: 30;
  /** Total running time, seconds. */
  duration: { min: number; target: number; max: number };
  /** Average shot length the audience expects here, seconds. */
  shot: { min: number; max: number };
  /** The first words must be on screen by this many seconds. */
  hookBy: number;
  /** Is sound likely on? If not, nothing may depend on it: every point is on screen. */
  soundOn: boolean;
  /** Pixels the platform's own UI covers. Text never goes there. */
  safe: { top: number; bottom: number; left: number; right: number };
  /** How much text a scene can carry before it reads as a slide. */
  maxWordsPerScene: number;
  /** Seconds a reader needs per word on this placement (sound-off audiences read every word). */
  secondsPerWord: number;
  /** Should the last frame lead back into the first (feeds that loop)? */
  loops: boolean;
  /** How hard the end can sell. */
  close: "price" | "soft" | "save";
  /** How the type should feel: native/raw placements want bolder, plainer type. */
  voice: "editorial" | "native";
  /** Music energy the placement rewards. */
  energy: "low" | "mid" | "high";
  /** Why these choices: printed into every treatment so a reviewer can disagree with the premise, not just the result. */
  notes: string;
};

const V = { width: 1080, height: 1920, fps: 30 as const };

export const PLATFORMS: Record<PlatformId, Platform> = {
  "instagram-reel": {
    id: "instagram-reel", label: "Instagram Reel", ...V,
    duration: { min: 12, target: 18, max: 26 },
    shot: { min: 1.4, max: 3.2 },
    hookBy: 1.2, soundOn: true,
    safe: { top: 220, bottom: 420, left: 70, right: 120 },
    maxWordsPerScene: 12, secondsPerWord: 0.26, loops: false, close: "price", voice: "editorial", energy: "mid",
    notes: "Full-screen and swipeable: the first second decides whether anyone stays. Mostly watched with sound, but captions still carry every point. The right edge holds like/comment buttons and the bottom holds the caption, so text lives in the middle band.",
  },
  "tiktok": {
    id: "tiktok", label: "TikTok", ...V,
    duration: { min: 10, target: 15, max: 22 },
    shot: { min: 1.0, max: 2.4 },
    hookBy: 0.8, soundOn: true,
    safe: { top: 160, bottom: 480, left: 60, right: 150 },
    maxWordsPerScene: 9, secondsPerWord: 0.24, loops: true, close: "soft", voice: "native", energy: "high",
    notes: "Native, fast and plain-spoken; polish that looks like an ad gets skipped. Sound-on. Hook inside a second. The deepest bottom and right overlays of any placement.",
  },
  "youtube-short": {
    id: "youtube-short", label: "YouTube Short", ...V,
    duration: { min: 12, target: 20, max: 30 },
    shot: { min: 1.4, max: 3.0 },
    hookBy: 1.2, soundOn: true,
    safe: { top: 200, bottom: 400, left: 70, right: 130 },
    maxWordsPerScene: 12, secondsPerWord: 0.26, loops: true, close: "soft", voice: "editorial", energy: "mid",
    notes: "Search-adjacent audience that will watch a slightly longer explanation if it starts strong. Loops by default.",
  },
  "facebook-reel": {
    id: "facebook-reel", label: "Facebook Reel", ...V,
    duration: { min: 12, target: 18, max: 26 },
    shot: { min: 1.6, max: 3.4 },
    hookBy: 1.5, soundOn: false,
    safe: { top: 220, bottom: 440, left: 70, right: 120 },
    maxWordsPerScene: 11, secondsPerWord: 0.3, loops: false, close: "price", voice: "editorial", energy: "mid",
    notes: "An older, sound-off-leaning audience: every point on screen, held long enough to read, plainly worded.",
  },
  "facebook-feed": {
    id: "facebook-feed", label: "Facebook feed video", width: 1080, height: 1350, fps: 30,
    duration: { min: 8, target: 14, max: 20 },
    shot: { min: 2.0, max: 4.0 },
    hookBy: 1.5, soundOn: false,
    safe: { top: 70, bottom: 90, left: 70, right: 70 },
    maxWordsPerScene: 12, secondsPerWord: 0.32, loops: false, close: "price", voice: "editorial", energy: "low",
    notes: "Scrolled past in a feed with sound off: say who it is for in the first seconds, name the product early, keep every point on screen and readable at a glance.",
  },
  "instagram-feed": {
    id: "instagram-feed", label: "Instagram feed video", width: 1080, height: 1350, fps: 30,
    duration: { min: 8, target: 14, max: 20 },
    shot: { min: 1.8, max: 3.6 },
    hookBy: 1.2, soundOn: false,
    safe: { top: 60, bottom: 80, left: 60, right: 60 },
    maxWordsPerScene: 10, secondsPerWord: 0.3, loops: true, close: "soft", voice: "editorial", energy: "low",
    notes: "A 4:5 card in the grid of a feed, autoplayed muted. Craft and composition carry it; text is short and sits well inside the frame.",
  },
  "pinterest-video": {
    id: "pinterest-video", label: "Pinterest video pin", width: 1000, height: 1500, fps: 30,
    duration: { min: 6, target: 11, max: 15 },
    shot: { min: 2.2, max: 4.5 },
    hookBy: 1.0, soundOn: false,
    safe: { top: 60, bottom: 220, left: 60, right: 60 },
    maxWordsPerScene: 9, secondsPerWord: 0.32, loops: true, close: "save",
    voice: "editorial", energy: "low",
    notes: "People are planning, not scrolling: idea-led, calm and save-worthy, worded like what they searched for. Muted, looping, slow; a hard sell reads as an ad and loses the save.",
  },
};
