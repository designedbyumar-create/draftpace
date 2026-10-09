#!/usr/bin/env node
/**
 * Prints a recording's length in seconds: node scripts/audio-length.mjs <file>
 * Studio calls this rather than bundling Remotion's renderer into itself.
 */
import { audioSeconds } from "./master-audio.mjs";

const s = audioSeconds(process.argv[2]);
if (s === null) {
  console.error(`could not read the length of ${process.argv[2]}`);
  process.exit(1);
}
console.log(s);
