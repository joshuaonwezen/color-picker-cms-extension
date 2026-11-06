# Color picker

## Setup
1. **Bind it to a property**: Settings → Content Types → the type → a long-string property →
   User Interface → **Editor: Color picker**. Do this on each CMS instance.
2. Optional: **Brand palette**: the swatches editors pick from, e.g.
   `Lime #abff44, Mosey green #197050, #ffffff`. Blank = the Mosey Bank brand colors.

## How it works
The property stores a `#rrggbb` value. Editors pick it with the native color picker, type a hex
value, or click a palette swatch, and see whether white or dark text reads better on it.
