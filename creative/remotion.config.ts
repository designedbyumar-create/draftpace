import { Config } from "@remotion/cli/config";
import { webpackOverride } from "./webpack-override.mjs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// See webpack-override.mjs for what this does and why. Shared with
// scripts/render-direct.mjs, which calls @remotion/bundler directly and
// does NOT read this file at all.
Config.overrideWebpackConfig(webpackOverride);
