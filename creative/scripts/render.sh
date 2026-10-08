#!/usr/bin/env bash
# Renders the MVP composition to out/, then runs the frame-gate before
# calling the result done. Local render only — no Lambda, no cloud.
#
# Uses render-direct.mjs (calls @remotion/renderer directly), not the
# `remotion render` CLI: the CLI reliably stalled at its "Getting
# composition" step in this environment, with no error, no timeout, nothing
# in the logs — see README.md, "Known gaps." The direct script surfaces the
# same step as an ordinary, fast, successful call in every run tried after
# the webpack config was fixed (see webpack-override.mjs), so the CLI's
# hang is believed to be specific to its own invocation path, not the
# composition or the render pipeline itself.
set -euo pipefail
cd "$(dirname "$0")/.."

node scripts/render-direct.mjs
echo "Running frame gate..."
node scripts/check-frames.mjs
