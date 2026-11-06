import {logger, storage, ValueHash} from '@zaiusinc/app-sdk';

import {DEFAULT_PALETTE, parsePalette, type Swatch} from '../../shared/color';

// Section keys match forms/settings.yml.
// A type alias, not an interface: the settings store requires an index-signature-compatible shape.
export type PaletteSettings = {
  colors?: string;
};

/**
 * One settings section, or {} when the store can't be read. On a CMS-scoped install that has
 * never saved its settings, the production store throws "Failed to get value at
 * app-data/<install>/settings" instead of returning {}.
 */
export async function readSection<T extends ValueHash>(section: string): Promise<T> {
  try {
    return await storage.settings.get<T>(section);
  } catch (error) {
    logger.warn('Could not read settings section', section, error);
    return {} as T;
  }
}

/** The saved palette, or the brand default until one is saved. */
export async function loadPalette(): Promise<Swatch[]> {
  const {swatches} = parsePalette((await readSection<PaletteSettings>('palette')).colors);
  return swatches.length > 0 ? swatches : DEFAULT_PALETTE;
}
