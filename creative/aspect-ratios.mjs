/**
 * The three image ratios this engine ships. Instagram and Pinterest both
 * read a square or near-square comfortably; this is deliberately NOT a
 * ratio per platform, it's three ratios every still renders at, and each
 * platform is told which one to use:
 *   instagram-post / instagram-carousel -> square or portrait
 *   pinterest-pin                       -> tall portrait (Pinterest's own preferred ratio)
 */
export const ASPECT_RATIOS = [
  { name: "square", width: 1080, height: 1080, usedFor: "Instagram post / carousel slide (1:1)" },
  { name: "portrait", width: 1080, height: 1350, usedFor: "Instagram post / carousel slide (4:5)" },
  { name: "pinterest", width: 1000, height: 1500, usedFor: "Pinterest pin (2:3)" },
];
