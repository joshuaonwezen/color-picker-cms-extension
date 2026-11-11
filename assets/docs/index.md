# Color picker

A color field for CMS properties: a swatch, a hex input, your palette and a text contrast check.
Walkthrough: [Color picker extension](https://opti.joshuaonwezen.dev/demo/cms-ui-extensions#color-picker).

## Setup

1. **Bind it to a property**: Settings > Content Types > the type > a long-string property (a string with no
   format) > User Interface > **Editor: Color picker**. Do this on each CMS instance: the binding is not part of
   the content type's definition, so pushing content types from code doesn't set it.
2. Optional: **Brand palette**: the swatches editors pick from, comma-separated, each an optional name and a hex
   color, e.g. `Lime #abff44, Forest green #197050, #ffffff`. Blank = a sample palette.

## How it works

The property stores a lower-case `#rrggbb` value, or nothing. Editors pick it with the native color picker, type a
hex value, or click a palette swatch, and see whether white or dark text reads better on it. Invalid values are
never saved.

## What your site needs

A long-string property to bind the editor to. The site reads the `#rrggbb` value and renders it however it likes,
with its own default when the property is empty.

## Help

- Using the app on another CMS instance: [reuse](https://opti.joshuaonwezen.dev/demo/cms-ui-extensions#reuse).
- Something not working: [troubleshooting](https://opti.joshuaonwezen.dev/demo/cms-ui-extensions#troubleshooting).
