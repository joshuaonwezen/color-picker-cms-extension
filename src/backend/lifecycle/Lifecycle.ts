import {
  AuthorizationGrantResult,
  CanUninstallResult,
  Lifecycle as AppLifecycle,
  LifecycleResult,
  LifecycleSettingsResult,
  logger,
  storage,
  SubmittedFormData,
  Request as AppRequest,
} from '@zaiusinc/app-sdk';

import {parsePalette} from '../../shared/color';
import type {PaletteSettings} from '../lib/settings';

export class Lifecycle extends AppLifecycle {
  public async onInstall(): Promise<LifecycleResult> {
    return {success: true};
  }

  public async onUpgrade(_fromVersion: string): Promise<LifecycleResult> {
    return {success: true};
  }

  public async onFinalizeUpgrade(_fromVersion: string): Promise<LifecycleResult> {
    return {success: true};
  }

  public async onAfterUpgrade(): Promise<LifecycleResult> {
    return {success: true};
  }

  public async canUninstall(): Promise<CanUninstallResult> {
    return {uninstallable: true};
  }

  public async onUninstall(): Promise<LifecycleResult> {
    return {success: true};
  }

  public async onSettingsForm(
    section: string,
    action: string,
    formData: SubmittedFormData,
  ): Promise<LifecycleSettingsResult> {
    const result = new LifecycleSettingsResult();
    if (section !== 'palette' || action !== 'savePalette') {
      logger.warn('Unsupported section-action combination:', section, action);
      return result;
    }
    try {
      const colors = typeof formData.colors === 'string' ? formData.colors.trim() : '';
      // Reject the whole list rather than silently dropping a mistyped brand color.
      const {swatches, invalid} = parsePalette(colors);
      if (invalid.length > 0) {
        return result.addError('colors', `Not a name and hex color: ${invalid.join(', ')}. Use e.g. "Lime #abff44".`);
      }
      const next: PaletteSettings = {colors: swatches.map((s) => (s.name === s.hex ? s.hex : `${s.name} ${s.hex}`)).join(', ')};
      await storage.settings.put('palette', {...next});
      return result.addToast('success', colors ? `Palette saved: ${swatches.length} colors.` : 'Palette cleared: editors get the brand colors.');
    } catch (error) {
      logger.error('Settings save failed', error);
      return result.addToast('danger', 'Could not save the palette. Try again.');
    }
  }

  public async onAuthorizationRequest(
    _section: string,
    _formData: SubmittedFormData,
  ): Promise<LifecycleSettingsResult> {
    return new LifecycleSettingsResult().addToast('danger', 'OAuth is not supported.');
  }

  public async onAuthorizationGrant(_request: AppRequest): Promise<AuthorizationGrantResult> {
    return new AuthorizationGrantResult('').addToast('danger', 'OAuth is not supported.');
  }
}
