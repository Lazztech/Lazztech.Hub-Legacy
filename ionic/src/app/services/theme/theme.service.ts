import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Storage } from '@ionic/storage';
import {
  Plugins,
  StatusBarStyle,
} from '@capacitor/core';
import { NGXLogger } from 'ngx-logger';
const { StatusBar } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  lightTheme = `
  --ion-color-primary: #3880ff;
  --ion-color-primary-rgb: 56, 128, 255;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #3171e0;
  --ion-color-primary-tint: #4c8dff;

  /** secondary **/
  --ion-color-secondary: #0cd1e8;
  --ion-color-secondary-rgb: 12, 209, 232;
  --ion-color-secondary-contrast: #ffffff;
  --ion-color-secondary-contrast-rgb: 255, 255, 255;
  --ion-color-secondary-shade: #0bb8cc;
  --ion-color-secondary-tint: #24d6ea;

  /** tertiary **/
  --ion-color-tertiary: #7044ff;
  --ion-color-tertiary-rgb: 112, 68, 255;
  --ion-color-tertiary-contrast: #ffffff;
  --ion-color-tertiary-contrast-rgb: 255, 255, 255;
  --ion-color-tertiary-shade: #633ce0;
  --ion-color-tertiary-tint: #7e57ff;

  /** success **/
  --ion-color-success: #10dc60;
  --ion-color-success-rgb: 16, 220, 96;
  --ion-color-success-contrast: #ffffff;
  --ion-color-success-contrast-rgb: 255, 255, 255;
  --ion-color-success-shade: #0ec254;
  --ion-color-success-tint: #28e070;

  /** warning **/
  --ion-color-warning: #ffce00;
  --ion-color-warning-rgb: 255, 206, 0;
  --ion-color-warning-contrast: #ffffff;
  --ion-color-warning-contrast-rgb: 255, 255, 255;
  --ion-color-warning-shade: #e0b500;
  --ion-color-warning-tint: #ffd31a;

  /** danger **/
  --ion-color-danger: #f04141;
  --ion-color-danger-rgb: 245, 61, 61;
  --ion-color-danger-contrast: #ffffff;
  --ion-color-danger-contrast-rgb: 255, 255, 255;
  --ion-color-danger-shade: #d33939;
  --ion-color-danger-tint: #f25454;

  /** dark **/
  --ion-color-dark: #222428;
  --ion-color-dark-rgb: 34, 34, 34;
  --ion-color-dark-contrast: #ffffff;
  --ion-color-dark-contrast-rgb: 255, 255, 255;
  --ion-color-dark-shade: #1e2023;
  --ion-color-dark-tint: #383a3e;

  /** medium **/
  --ion-color-medium: #989aa2;
  --ion-color-medium-rgb: 152, 154, 162;
  --ion-color-medium-contrast: #ffffff;
  --ion-color-medium-contrast-rgb: 255, 255, 255;
  --ion-color-medium-shade: #86888f;
  --ion-color-medium-tint: #a2a4ab;

  /** light **/
  --ion-color-light: #f4f5f8;
  --ion-color-light-rgb: 244, 244, 244;
  --ion-color-light-contrast: #000000;
  --ion-color-light-contrast-rgb: 0, 0, 0;
  --ion-color-light-shade: #d7d8da;
  --ion-color-light-tint: #f5f6f9;
  `;

  darkTheme = `
  --ion-border-color: #2a2a2a;
  --ion-background-color: var(--ion-color-dark);
  --ion-background-color-rgb: var(--ion-color-dark-rgb);
  --ion-text-color: #ffffff;
  --ion-text-color-rgb: 255, 255, 255;

  --ion-color-step-50: #232323;
  --ion-color-step-100: #2e2e2e;
  --ion-color-step-150: #3a3a3a;
  --ion-color-step-200: #454545;
  --ion-color-step-250: #515151;
  --ion-color-step-300: #5d5d5d;
  --ion-color-step-350: #8b8b8b;
  --ion-color-step-400: #747474;
  --ion-color-step-450: #7f7f7f;
  --ion-color-step-500: #8b8b8b;
  --ion-color-step-550: #979797;
  --ion-color-step-600: #a2a2a2;
  --ion-color-step-650: #aeaeae;
  --ion-color-step-700: #b9b9b9;
  --ion-color-step-750: #c5c5c5;
  --ion-color-step-800: #d1d1d1;
  --ion-color-step-850: #dcdcdc;
  --ion-color-step-900: #e8e8e8;
  --ion-color-step-950: #f3f3f3;
  `;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private storage: Storage,
    private logger: NGXLogger
  ) { 
    storage.get('theme').then(cssText => {  // <--- GET SAVED THEME
      if (cssText == this.darkTheme) {
        this.logger.log("detected saved dark theme")
      } else if (cssText == this.lightTheme) {
        this.logger.log("detected saved light theme")
      }

      this.setGlobalCSS(cssText);
    });
  }

  private setGlobalCSS(css: string) {
    this.document.documentElement.style.cssText = css;
  }

  async setLight() {
    this.setGlobalCSS(this.lightTheme);
    StatusBar.setStyle({
        style: StatusBarStyle.Light
    });
    await this.storage.set('theme', this.lightTheme); // <--- SAVE THEME HERE
  }

  async setDark() {
    this.setGlobalCSS(this.darkTheme);
    StatusBar.setStyle({
      style: StatusBarStyle.Dark
    });
    await this.storage.set('theme', this.darkTheme); // <--- SAVE THEME HERE
  }

  async isDark(): Promise<boolean> {
    var cssText = await this.storage.get('theme');
    if (cssText == this.darkTheme) {
      this.logger.log(`Is DarkMode: true`);
      return true;
    } else if (cssText == this.lightTheme) {
      this.logger.log(`Is DarkMode: false`);
      return false;
    } else {
      this.logger.log(`Is DarkMode: false`);
      return false;
    }
  }

  async toggle() {
    var isDark = await this.isDark();
    if (isDark) {
      this.logger.log("setting light");
      await this.setLight();
    } else {
      this.logger.log("setting dark");
      await this.setDark();
    }
  }
}
