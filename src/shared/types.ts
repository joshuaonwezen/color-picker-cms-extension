// The contract between the property editor and the cms_extension function.

export type Envelope<T> =
  | {ok: true; result: T}
  | {ok: false; error: string; message?: string};

export type ActionParams = {
  // Reports one mounted field, so the logs show what the CMS passes per field.
  probe: {contentKey: string | null; settings: Record<string, unknown> | null};
};

export type ActionResults = {
  probe: {logged: boolean};
};

export type ActionName = keyof ActionParams;
