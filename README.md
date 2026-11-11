# Color picker

Turn a text property into a color field. Editors pick a color with a swatch, type a hex value, or click one of your brand colors, and see straight away whether white or dark text reads better on it. Only valid colors are ever saved.

Documentation: [walkthrough](https://opti.joshuaonwezen.dev/demo/cms-ui-extensions#color-picker).

## What editors get

A **Color picker** property editor on every property an admin binds it to:

- a native color swatch, a hex input and a **Clear** button;
- your palette as one-click swatches (a sample palette until you save your own);
- a contrast readout: whether white or dark (`#08251a`) text reads better on the color, the WCAG contrast ratio, and the level for normal-size text (AAA, AA, AA large, or "too low for text").

Typing saves only a valid `#rgb` or `#rrggbb` (stored as `#rrggbb`) or an empty value; anything else is flagged and snaps back when the field loses focus. Dragging the native picker saves once it settles (300 ms), not on every step.

## Setup

1. Install the app on the CMS instance (see [Deploy](#deploy)). Each CMS instance gets its own install.
2. **Bind it to a property:** Settings > Content Types > the type > a long-string property (a string with no format) > User Interface > **Editor: Color picker**. The CMS lists the editor only on long-string properties and mounts it only where it is picked. Do this on each CMS instance.
3. Optional: save your palette in the app settings.

| Setting | Required | Where to find it | Used for |
|---|---|---|---|
| Brand palette | No | Your brand guidelines | The swatches editors pick from: comma-separated (or one per line), each an optional name and a hex color, e.g. `Lime #abff44, Forest green #197050, #ffffff`. The whole list is rejected if any entry isn't a color. Blank = a sample palette. Editors can always pick any other color. |

Using the extension on another CMS instance: [reuse](https://opti.joshuaonwezen.dev/demo/cms-ui-extensions#reuse). Something not working: [troubleshooting](https://opti.joshuaonwezen.dev/demo/cms-ui-extensions#troubleshooting).

## What your site needs

- **A long-string property** on the content type to bind the editor to. Keep it a plain string with no format: the CMS doesn't offer the editor on short strings, choices or other types.
- **Render the value however you like.** The property holds a lower-case `#rrggbb` or nothing, so the site can use it directly as a CSS color and fall back to its own default when it is empty.
- **Optional: the same text color rule.** To pick readable text on the color the way the readout does, compute the WCAG contrast ratio of the color against white and against your dark text color, and use whichever is higher.

## Limits

These come from the CMS UI extensions platform (beta, SDK 1.1.0):

- **The binding lives in the CMS only**, not in the content-type REST API, so pushing content types from code doesn't set it. Bind it by hand on each instance.
- **The editor isn't told which property it is on** (its settings are `{}`), and for a block placed inline in Visual Builder its content context is the page. The binding is the only way to target a field.
- **Each bound property is its own iframe**, so the editor uses native controls and no component library to stay light.
- **`ocp dev` does not render property editors.** Test on a CMS instance after publishing.

## Security

- The app holds no credentials and reads nothing outside its own settings. Its backend only serves the saved palette.
- The palette is validated when it is saved, and the editor saves only a valid color or an empty value.

## Develop

```bash
yarn install
yarn validate      # lint + typecheck + unit tests + build + ocp-app-sdk validate
```

There is no live test suite: publish a dev version and try it on a CMS instance.

## Deploy

With the OCP CLI (run it as `npx -p @optimizely/ocp-cli-v2 ocp ...` if it isn't installed):

```bash
npx -p @optimizely/ocp-cli-v2 ocp app register      # once
ocp app prepare --bump-dev-version --publish
ocp directory install cms_color_picker@<version> --scope <cms-instance-uuid>
```

Publishing a new dev version moves existing installs onto it.
