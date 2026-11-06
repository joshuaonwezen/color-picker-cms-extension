# Color picker: CMS UI extension (probe)

A property editor for long strings: the normal text input plus a native color swatch that writes `#rrggbb`. It is a probe for two questions:

1. What does the CMS pass in `PropertyState.settings` for each field? Logged at WARN (`ocp app logs`).
2. Which editor does the CMS mount when two apps (this and the Product picker) both claim long strings?

```bash
yarn install && yarn validate
ocp app prepare --bump-dev-version --publish
```
