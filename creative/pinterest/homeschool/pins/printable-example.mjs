import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { sheet, desk, pencil, mug, clipboard, binderClip } from "../kit/paper.mjs";
import { bookPage } from "../kit/assets.mjs";

const scene = `${desk({ top: SCENE_TOP, height: 1500 - SCENE_TOP })}
  ${clipboard({ x: 150, y: 450, w: 700, h: 900, tilt: -3, content: sheet({ src: bookPage(14), x: 36, y: 56, w: 628, id: "log" }) })}
  ${pencil({ x: 520, y: 1285, len: 380, rot: -6 })}${mug({ x: 60, y: 1130, size: 150 })}`;

export const pins = [printable({ n: 4, scene })];
