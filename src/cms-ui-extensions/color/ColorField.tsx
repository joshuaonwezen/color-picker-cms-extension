import type {ExtensionContext} from '@optimizely/cms-extensibility-sdk';
import {contrastLevel, DEFAULT_PALETTE, normalizeHex, readableText, type Swatch} from '@shared/color';
import {useEffect, useRef, useState, type CSSProperties} from 'react';

import {call} from '../common/api';
import {useStringProperty} from '../common/useProperty';

// A color field for the long-string properties an admin binds it to (property settings >
// User Interface > Editor: Color picker). It stores a lower-case #rrggbb value, or empty.
// Native controls and no component library keep the iframe light.

// Dragging the native picker fires a change per step; save once it settles.
const SAVE_DELAY_MS = 300;

// The iframe gets none of the CMS's styles. Axiom's stack: the CMS loads Die Grotesk in its
// own page only, so inside the iframe this lands on the system sans.
const ROOT: CSSProperties = {
  padding: 2,
  fontFamily: 'Die Grotesk B, DI Grotesk B, Roboto Variable, system-ui, -apple-system, "Segoe UI", sans-serif',
  color: '#1f1f1f',
  WebkitFontSmoothing: 'antialiased',
};
const BORDER = '1px solid #c9cdc4';
const CONTROL: CSSProperties = {
  font: 'inherit',
  fontSize: 14,
  lineHeight: 1.4,
  color: 'inherit',
  boxSizing: 'border-box',
  height: 38,
  padding: '8px 10px',
  border: BORDER,
  borderRadius: 8,
  background: '#fff',
};
const NOTE: CSSProperties = {fontSize: 12, color: '#5f6368', margin: '6px 0 0'};
const WARN: CSSProperties = {...NOTE, color: '#b3261e'};

export function ColorField({context}: {context: ExtensionContext}) {
  const {value, readonly, loaded, save, saveError} = useStringProperty(context);
  const [draft, setDraft] = useState(value);
  const [palette, setPalette] = useState<Swatch[]>(DEFAULT_PALETTE);
  const typing = useRef(false);
  const timer = useRef<number | null>(null);

  // Follow the CMS value (initial load, undo, another editor) unless the editor is typing.
  useEffect(() => {
    if (!typing.current) setDraft(value);
  }, [value]);

  // The admin's palette from the app settings; the brand colors until one is saved or if it fails.
  useEffect(() => {
    let active = true;
    call(context, 'palette', {})
      .then(({swatches}) => active && swatches.length > 0 && setPalette(swatches))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [context]);

  const cancelPending = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => cancelPending, []);

  const commit = (next: string) => {
    cancelPending();
    setDraft(next);
    if (next !== value) void save(next);
  };
  const commitLater = (next: string) => {
    cancelPending();
    timer.current = window.setTimeout(() => {
      timer.current = null;
      if (next !== value) void save(next);
    }, SAVE_DELAY_MS);
  };

  const disabled = readonly || !loaded;
  const hex = normalizeHex(draft);
  const invalid = draft.trim() !== '' && !hex;
  const text = hex ? readableText(hex) : null;

  return (
    <div style={ROOT}>
      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        {/* Native color input: the browser draws its dialog, so the iframe can't clip it. */}
        <input
          aria-label="Pick a color"
          disabled={disabled}
          onChange={(e) => {
            setDraft(e.target.value);
            commitLater(e.target.value);
          }}
          style={{...CONTROL, width: 44, padding: 3, cursor: disabled ? 'default' : 'pointer'}}
          type="color"
          value={hex ?? '#ffffff'}
        />
        <input
          aria-invalid={invalid}
          aria-label="Hex color"
          disabled={disabled}
          onBlur={() => {
            typing.current = false;
            // Only a valid color (or nothing) is ever saved; anything else snaps back.
            if (hex || draft.trim() === '') commit(hex ?? '');
            else setDraft(value);
          }}
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            const valid = normalizeHex(next);
            if (valid || next.trim() === '') commitLater(valid ?? '');
            else cancelPending();
          }}
          onFocus={() => {
            typing.current = true;
          }}
          placeholder="#rrggbb"
          spellCheck={false}
          style={{...CONTROL, flex: 1, minWidth: 0, borderColor: invalid ? '#b3261e' : '#c9cdc4'}}
          value={draft}
        />
        {draft && !disabled && (
          <button onClick={() => commit('')} style={{...CONTROL, cursor: 'pointer', color: '#5f6368'}} type="button">
            Clear
          </button>
        )}
      </div>

      <div aria-label="Brand palette" role="group" style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8}}>
        {palette.map((swatch) => {
          const selected = swatch.hex === hex;
          return (
            <button
              aria-label={swatch.name}
              aria-pressed={selected}
              disabled={disabled}
              key={`${swatch.name}${swatch.hex}`}
              onClick={() => commit(swatch.hex)}
              style={{
                width: 26,
                height: 26,
                padding: 0,
                borderRadius: 6,
                background: swatch.hex,
                border: '1px solid rgba(0, 0, 0, 0.18)',
                outline: selected ? '2px solid #0037ff' : 'none',
                outlineOffset: 2,
                cursor: disabled ? 'default' : 'pointer',
              }}
              title={`${swatch.name} ${swatch.hex}`}
              type="button"
            />
          );
        })}
      </div>

      {invalid && <p style={WARN}>&quot;{draft}&quot; isn&apos;t a hex color. Use #rrggbb, e.g. #197050.</p>}
      {text && (
        <p style={NOTE}>
          {palette.find((s) => s.hex === hex)?.name ?? hex} · best text on it:{' '}
          <span style={{background: hex ?? undefined, color: text.color, padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(0,0,0,0.12)'}}>
            {text.color === '#ffffff' ? 'white' : 'dark'}
          </span>{' '}
          {text.ratio.toFixed(2)}:1{' '}
          <span style={{color: contrastLevel(text.ratio) === 'fail' ? '#b3261e' : '#1e7d32'}}>
            {contrastLevel(text.ratio) === 'fail' ? 'too low for text' : contrastLevel(text.ratio)}
          </span>
        </p>
      )}
      {saveError && <p style={WARN}>{saveError}</p>}
    </div>
  );
}
