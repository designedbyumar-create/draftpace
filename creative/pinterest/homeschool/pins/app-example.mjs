import { promo } from "../kit/promo.mjs";
import { screen } from "../kit/assets.mjs";
import { mug, pencil, drawing } from "../kit/paper.mjs";

export const pins = [
  promo({
    n: 55,
    tone: "plum",
    wave: 0,
    screen: { src: screen("workspace"), y0: 60, y1: 780, width: 450, tilt: 6 },
    prop: `${mug({ x: 790, y: 1215, size: 130 })}${pencil({ x: 470, y: 1325, len: 300, rot: -6 })}`,
  }),
];
