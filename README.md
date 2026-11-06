# Color picker: CMS UI extension

An Optimizely CMS (SaaS) UI extension, built as a CMS-scoped OCP app. It turns a long-string property into a **color field**: a native color swatch, a hex input, your brand palette as one-click swatches, and a contrast readout that says whether white or dark text reads better on the color (WCAG ratio and level). The property stores a lower-case `#rrggbb` value, or nothing.

## Use it
1. Install the app on a CMS instance (below).
2. **Bind it to a property:** Settings → Content Types → the type → a long-string property (`string` with no format) → User Interface → **Editor: Color picker**. The CMS mounts it only where it is picked, and lists it only on long strings. The binding lives in the CMS, not in the content-type API, so set it on each instance.
3. Optional: **Brand palette** in the app settings, e.g. `Lime #abff44, Mosey green #197050, #ffffff`. Until one is saved, editors get the Mosey Bank brand colors. They can always pick any other color too.

In optimizely-nextjs-demo, `CampaignBanner.backgroundColor` is the property made for it: the site renders the banner in that color and picks white or dark text by the same contrast rule.

## Behavior
- Typing saves only a valid `#rgb`/`#rrggbb` (normalized to `#rrggbb`) or an empty value; anything else is flagged and snaps back on blur, so the site never gets an invalid color.
- Dragging the native picker saves once it settles (300 ms), not on every step.
- Native controls and no component library keep the iframe light.

## Develop

```bash
yarn install
yarn validate      # lint + typecheck + unit tests + build + ocp-app-sdk validate
ocp app prepare --bump-dev-version --publish
ocp directory install cms_color_picker@<version> --scope <cms-instance-uuid>
```

`ocp dev` does not render property editors; test in a CMS instance after publishing.
