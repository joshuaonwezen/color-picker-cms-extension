import * as App from '@zaiusinc/app-sdk';
import {logger} from '@zaiusinc/app-sdk';

import type {Envelope} from '../../shared/types';
import {loadPalette} from '../lib/settings';

function ok<T>(result: T): Envelope<T> {
  return {ok: true, result};
}

function fail(error: string): Envelope<never> {
  return {ok: false, error};
}

export class CmsUiExtension extends App.Function {
  public async perform(): Promise<App.Response> {
    // Everything inside the try: a throw that escapes perform() reaches the editor as an
    // empty "[ExtensionService] Failed to invoke function:".
    try {
      const body = (this.request.bodyJSON ?? {}) as {action?: unknown};
      if (body.action !== 'palette') return new App.Response(400, fail('unknown_action'));
      return new App.Response(200, ok({swatches: await loadPalette()}));
    } catch (error) {
      logger.error('CmsUiExtension failure', error);
      return new App.Response(500, fail('internal_error'));
    }
  }
}
