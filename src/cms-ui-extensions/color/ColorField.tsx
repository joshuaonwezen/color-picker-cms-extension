import type {ExtensionContext} from '@optimizely/cms-extensibility-sdk';
import {normalizeHex} from '@shared/color';
import {useEffect, useLayoutEffect, useRef, useState, type CSSProperties} from 'react';

import {call} from '../common/api';
import {useStringProperty} from '../common/useProperty';

// PROBE. The CMS mounts this on every long-string property, so it must stay a working
// text field everywhere: the swatch beside it only helps, writing a #rrggbb value. The
// swatch is also the visible sign that this extension (not another long-string editor)
// was mounted. Each field reports what the CMS passed for it, for the logs.

const SAVE_DELAY_MS = 400;

const CONTROL: CSSProperties = {
  font: 'inherit',
  fontSize: 14,
  lineHeight: 1.4,
  color: 'inherit',
  boxSizing: 'border-box',
  padding: '8px 10px',
  border: '1px solid #c9cdc4',
  borderRadius: 8,
  background: '#fff',
};

export function ColorField({context}: {context: ExtensionContext}) {
  const {value, readonly, settings, loaded, save, saveError} = useStringProperty(context);
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);
  const timer = useRef<number | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const reported = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(value);
  }, [value]);

  // Report this field once, with what the CMS passed for it.
  useEffect(() => {
    if (!loaded || reported.current) return;
    reported.current = true;
    void (async () => {
      try {
        const content = await context.content.get();
        await call(context, 'probe', {contentKey: content?.key ?? null, settings: settings ?? null});
      } catch {
        // A probe that can't report still has to be a working field.
      }
    })();
  }, [context, loaded, settings]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [draft]);

  const cancelPending = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => cancelPending, []);

  const schedule = (text: string) => {
    setDraft(text);
    cancelPending();
    timer.current = window.setTimeout(() => {
      timer.current = null;
      void save(text);
    }, SAVE_DELAY_MS);
  };

  const disabled = readonly || !loaded;
  const hex = normalizeHex(draft);

  return (
    <div style={{padding: 2}}>
      <div style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}>
        <textarea
          aria-label="Value"
          disabled={disabled}
          onBlur={() => {
            focused.current = false;
            cancelPending();
            if (draft !== value) void save(draft);
          }}
          onChange={(e) => schedule(e.target.value)}
          onFocus={() => {
            focused.current = true;
          }}
          ref={ref}
          rows={1}
          style={{...CONTROL, flex: 1, width: '100%', resize: 'vertical', overflow: 'hidden'}}
          value={draft}
        />
        {/* Native color input: the browser draws its dialog, so the iframe can't clip it. */}
        <input
          aria-label="Pick a color"
          disabled={disabled}
          onChange={(e) => schedule(e.target.value)}
          style={{width: 40, height: 38, padding: 2, border: '1px solid #c9cdc4', borderRadius: 8, background: '#fff', cursor: 'pointer'}}
          title="Pick a color (Color picker extension)"
          type="color"
          value={hex ?? '#000000'}
        />
      </div>
      {saveError && <p style={{fontSize: 12, color: '#b3261e', margin: '6px 0 0'}}>{saveError}</p>}
    </div>
  );
}
