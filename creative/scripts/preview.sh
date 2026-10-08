#!/usr/bin/env bash
# Opens Remotion Studio against the real composition for visual review.
set -euo pipefail
cd "$(dirname "$0")/.."
npx remotion studio src/index.ts
