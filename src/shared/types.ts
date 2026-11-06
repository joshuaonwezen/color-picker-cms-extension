// The contract between the property editor and the cms_extension function. The UI sends
// {action, params}; the function answers with an Envelope.

import type {Swatch} from './color';

export type Envelope<T> =
  | {ok: true; result: T}
  | {ok: false; error: string; message?: string};

export type ActionParams = {
  palette: Record<string, never>;
};

export type ActionResults = {
  palette: {swatches: Swatch[]};
};

export type ActionName = keyof ActionParams;
