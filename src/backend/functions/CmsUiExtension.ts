import * as App from '@zaiusinc/app-sdk';
import {logger} from '@zaiusinc/app-sdk';

import type {ActionParams, Envelope} from '../../shared/types';

// PROBE: the CMS mounts property editors on every long string and doesn't say which
// field. Log what it does pass (PropertyState.settings) per field, at WARN so it shows
// in `ocp app logs`. Capped per container so a page full of fields can't flood the log.
const MAX_LOGS_PER_CONTAINER = 50;
let logged = 0;

function ok<T>(result: T): Envelope<T> {
  return {ok: true, result};
}

export class CmsUiExtension extends App.Function {
  public async perform(): Promise<App.Response> {
    // Everything inside the try: a throw that escapes perform() breaks the field.
    try {
      const body = (this.request.bodyJSON ?? {}) as {action?: unknown; params?: Partial<ActionParams['probe']>};
      if (body.action !== 'probe') return new App.Response(400, {ok: false, error: 'unknown_action'});
      if (logged >= MAX_LOGS_PER_CONTAINER) return new App.Response(200, ok({logged: false}));
      logged++;
      logger.warn(
        'Color picker field',
        JSON.stringify({contentKey: body.params?.contentKey ?? null, settings: body.params?.settings ?? null}),
      );
      return new App.Response(200, ok({logged: true}));
    } catch (error) {
      logger.error('CmsUiExtension failure', error);
      return new App.Response(500, {ok: false, error: 'internal_error'});
    }
  }
}
